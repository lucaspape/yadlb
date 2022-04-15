const {Docker} = require('node-docker-api')

const docker = new Docker({socketPath: '/var/run/docker.sock'})

const CONTAINER_NAME_PREFIX = 'yadlb_runner_proxy-'

loop()

async function loop(){
    let containers = await docker.container.list()

    let running = false

    for(let i in containers){
        let container = containers[i]

        for (let k in container.data.Names) {
            let name = container.data.Names[k]

            if(name.startsWith('/yadlb-runner') && !name.includes('proxy')){
                running = true
                break
            }
        }
    }

    if(!running){
        console.log('Runner not found, ima kms')

        await kms()
    }else{
        setTimeout(async() => {
            await loop()
        }, 1000)
    }
}

async function kms(){
    let runningContainers = await listRunningContainers()

    for(let i in runningContainers){
        let container = runningContainers[i]

        await stopContainer(container)
    }

    let suicideContainer = await getSuicideContainer()
    await stopContainer(suicideContainer)
}

async function stopContainer(container){
    if(container){
        await container.kill()
        await container.delete()

        console.log('Removed container', container.data.Names)
    }
}

async function listRunningContainers(){
    let containers = await docker.container.list()

    let running = []

    for (let i in containers) {
        let container = containers[i]

        for (let k in container.data.Names) {
            let name = container.data.Names[k]

            if (name.startsWith('/' + CONTAINER_NAME_PREFIX) && !name.includes('suicide')) {
                running.push(container)
                break
            }
        }
    }

    return running
}

async function getSuicideContainer(){
    let containers = await docker.container.list()

    for (let i in containers) {
        let container = containers[i]

        for (let k in container.data.Names) {
            let name = container.data.Names[k]

            if (name.startsWith('/' + CONTAINER_NAME_PREFIX && name.includes('suicide'))) {
                return container
            }
        }
    }
}