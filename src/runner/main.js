const InfiniteDB = require('infinitedb')
const ContainerManager = require('./container-manager')

const containerManager = new ContainerManager()

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

        await containerManager.stopAllContainers()
        await containerManager.startSuicideContainer()

        while(true){
            await loop()
            await delay(1000)
        }
    })
}

async function loop(){
    let results = await database.get(TABLE_NAME, {})

    await containerManager.syncContainers(results)
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}