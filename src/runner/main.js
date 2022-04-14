const {Docker} = require('node-docker-api')
const InfiniteDB = require('infinitedb')

const docker = new Docker({socketPath: '/var/run/docker.sock'})

const DB_HOST = {hostname: 'infinitedb', port: 8087}
const DB_NAME = 'yadlb_db'
const TABLE_NAME = 'hosts'
const FIELDS = {
    port: {
        type: 'number',
        indexed: true,
        unique: true
    },
    protocol: {
        type: 'text'
    },
    destination: {
        type: 'text'
    },
    dport: {
        type: 'number'
    }
}

InfiniteDB.createDatabase(DB_HOST, DB_NAME).then(() => {
    console.log('Created database')

    connect()
}).catch(() => {
    console.log('Could not create database')

    connect()
})

let database

function connect(){
    database = new InfiniteDB(DB_HOST, DB_NAME)
    database.connect().then(async () => {
        console.log('connected to database')

        try{
            await database.createTable(TABLE_NAME, FIELDS)
            console.log('created table')
        }catch (e) {
            console.log('could not create table')
        }

        let tables = await database.listTables()

        console.log(tables)

        await stopAllContainers()

        while(true){
            await loop()
            await delay(1000)
        }
    })
}

async function loop(){
    let results = await database.get(TABLE_NAME, {})

    await syncContainers(results)
}

const CONTAINER_NAME_PREFIX = 'yadlb_proxy_'

async function syncContainers(hosts){
    let containers = await docker.container.list()

    let started = []

    for(let i in containers){
        for(let k in containers[i].data.Names){
            started.push(containers[i].data.Names[k])
        }
    }

    for(let i in hosts){
        let host = hosts[i]

        let hostPort = host.port + '/' + host.protocol
        let name = '/' + CONTAINER_NAME_PREFIX + hostPort.replace('/', '_')

        if(!started.includes(name)){
            await startContainer(host)
        }
    }

    //remove containers with not existing hosts

    for(let i in containers){
        let container = containers[i]

        for(let k in containers[i].data.Names){
            let name = containers[i].data.Names[k]

            if(name.startsWith('/' + CONTAINER_NAME_PREFIX)){
                if(!hosts.find(host => '/' + CONTAINER_NAME_PREFIX + host.port + '_' + host.protocol === name)){
                    await container.kill()
                    await container.delete()
                    console.log('Removed container', name)
                    break
                }
            }
        }
    }
}

async function stopAllContainers(){
    let containers = await docker.container.list()

    for(let i in containers){
        for(let k in containers[i].data.Names){
            if(containers[i].data.Names[k].startsWith('/' + CONTAINER_NAME_PREFIX)){
                await containers[i].kill()
                await containers[i].delete()
                console.log('Removed container', containers[i].data.Names[k])
                break
            }
        }
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startContainer(host){
    let hostPort = host.port + '/' + host.protocol

    let container = await docker.container.create({
        name: CONTAINER_NAME_PREFIX + hostPort.replace('/', '_'),
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

    let stream = await container.logs({
        follow: true,
        stdout: true,
        stderr: true
    })

    stream.on('data', (data) => {
        console.log(data.toString())
    })

    stream.on('error', (err) => {
        console.log(err)
    })

    console.log('Started')
}