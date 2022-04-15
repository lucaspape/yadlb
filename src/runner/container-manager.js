const {Docker} = require('node-docker-api')

const CONTAINER_NAME_PREFIX = 'yadlb_runner_proxy-'

module.exports = class ContainerManager {
    constructor() {
        this.docker = new Docker({socketPath: '/var/run/docker.sock'})
    }

    async syncContainers(hosts) {
        let containers = await this.docker.container.list()

        let started = []

        for (let i in containers) {
            for (let k in containers[i].data.Names) {
                started.push(containers[i].data.Names[k])
            }
        }

        for (let i in hosts) {
            let host = hosts[i]

            let hostPort = host.port + '/' + host.protocol
            let name = '/' + CONTAINER_NAME_PREFIX + hostPort.replace('/', '_')

            if (!started.includes(name)) {
                await this.startContainer(host)
            }
        }

        await this.stopRemovedContainers(hosts)
    }

    async stopRemovedContainers(hosts){
        let containers = await this.listRunningContainers()

        for(let i in containers){
            let container = containers[i]

            for(let k in container.data.Names){
                let name = container.data.Names[k]

                if (!hosts.find(host => '/' + CONTAINER_NAME_PREFIX + host.port + '_' + host.protocol === name) && !name.includes('suicide')) {
                    await this.stopContainer(container)
                }
            }
        }
    }

    async stopAllContainers() {
        let containers = await this.listRunningContainers()

        for(let i in containers){
            let container = containers[i]

            await this.stopContainer(container)
        }
    }

    async stopContainer(container){
        await container.kill()
        await container.delete()

        console.log('Removed container', container.data.Names)
    }

    async listRunningContainers(){
        let containers = await this.docker.container.list()

        let running = []

        for (let i in containers) {
            let container = containers[i]

            for (let k in container.data.Names) {
                let name = container.data.Names[k]

                if (name.startsWith('/' + CONTAINER_NAME_PREFIX)) {
                    running.push(container)
                    break
                }
            }
        }

        return running
    }

    async startContainer(host) {
        let hostPort = host.port + '/' + host.protocol
        let name = CONTAINER_NAME_PREFIX + hostPort.replace('/', '_')

        try{
            let container = await this.docker.container.create({
                name: name,
                Image: 'lucaspape/proxy',
                Env: [
                    'protocol=' + host.protocol,
                    'port=' + host.port,
                    'dport=' + host.dport,
                    'destination=' + host.destination
                ],
                ExposedPorts: {
                    [hostPort]: {}
                },
                HostConfig: {
                    PortBindings: {
                        [hostPort]: [{HostPort: host.port.toString(), HostIp: '0.0.0.0'}]
                    }
                }
            })

            await container.start()

            await this.attachLogger(container, name)

            console.log('Started container ' + name)
        }catch (e) {
            let id = e.json.message.split('"')[3]

            if(id){
                try{
                    let old = await this.docker.container.get(id)
                    await old.stop()
                    await old.delete()

                    console.log('Removed old container ' + id)

                    await this.startContainer(host)
                }catch (_) {
                    throw e
                }
            }else{
                throw e
            }
        }
    }

    async startSuicideContainer(){
        let name = CONTAINER_NAME_PREFIX + 'suicide'

        try{
            let container = await this.docker.container.create({
                name: name,
                Image: 'lucaspape/suicide',
                HostConfig: {
                    Mounts: [
                        {
                            Target: '/var/run/docker.sock',
                            Source: '/var/run/docker.sock',
                            Type: 'bind'
                        }
                    ]
                }
            })

            await container.start()

            await this.attachLogger(container, name)

            console.log('Started suicide container ' + name)
        }catch (e) {
            let id = e.json.message.split('"')[3]

            if(id){
                try{
                    let old = await this.docker.container.get(id)
                    await old.stop()
                    await old.delete()

                    console.log('Removed old container ' + id)

                    await this.startSuicideContainer()
                }catch (_) {
                    throw e
                }
            }else{
                throw e
            }
        }
    }

    async attachLogger(container, name){
        let stream = await container.logs({
            follow: true,
            stdout: true,
            stderr: true
        })

        stream.on('data', (data) => {
            console.log(`[${name}] ${data.toString()}`)
        })

        stream.on('error', (err) => {
            console.log(`[${name}] ERROR ${err.toString()}`)
        })
    }
}