const InfiniteDB = require('infinitedb')

const DB_HOST = {hostname: 'infinitedb', port: 8087}
const DB_NAME = 'yadlb_db'

const HOSTS_TABLE_NAME = 'hosts'
const USER_TABLE_NAME = 'users'
const SESSION_TABLE_NAME = 'sessions'

const USER_TABLE_FIELDS = {
    id: {
        type: 'text',
        indexed: true,
        unique: true
    },
    name: {
        type: 'text',
        indexed: true,
        unique: true
    },
    password: {
        type: 'text'
    }
}

const SESSION_TABLE_FIELDS = {
    id: {
        type: 'text',
        indexed: true,
        unique: true
    },
    user: {
        type: 'text',
        indexed: true,
        external: true
    }
}

module.exports = class Database {
    constructor() {
        this.database = new InfiniteDB(DB_HOST, DB_NAME)
    }

    async connect(){
        try {
            await InfiniteDB.createDatabase(DB_HOST, DB_NAME)
            console.log('Created database')
        }catch (e) {
            console.log('Could not create database')
        }

        await this.database.connect()
        console.log('Connected to database')

        try {
            await this.database.createTable(USER_TABLE_NAME, USER_TABLE_FIELDS)
            console.log('Created user table')
        }catch (e) {
            console.log('Could not create user table')
        }

        try {
            await this.database.createTable(SESSION_TABLE_NAME, SESSION_TABLE_FIELDS)
            console.log('Created session table')
        }catch (e) {
            console.log('Could not create session table')
        }
    }

    async insertUser(id, name, password) {
        await this.database.insert(USER_TABLE_NAME, {id: id, name: name.toLowerCase(), displayedName: name, password: password})
    }

    async removeUser(id){
        let userWhere = {
            field: 'user',
            operator: '=',
            value: id
        }

        await this.database.remove(SESSION_TABLE_NAME, {where: userWhere})

        let where = {
            field: 'id',
            operator: '=',
            value: id
        }

        return (await this.database.remove(USER_TABLE_NAME, {where: where}))
    }

    async updateUserPassword(id, password){
        await this.database.update(USER_TABLE_NAME, {id: id, password: password})
    }

    async getUser(name) {
        let where = {
            field: 'name',
            operator: '=',
            value: name.toLowerCase()
        }

        return (await this.database.get(USER_TABLE_NAME, {where: where}))[0]
    }

    async insertSession(id, user) {
        await this.database.insert(SESSION_TABLE_NAME, {id: id, user: user})
    }

    async getSession(id) {
        let where = {
            field: 'id',
            operator: '=',
            value: id
        }

        let implement = [
            {
                from: {
                    table: USER_TABLE_NAME,
                    field: 'id'
                },
                field: 'user',
                as: 'user'
            }
        ]

        let session = (await this.database.get(SESSION_TABLE_NAME, {where: where, implement: implement}))[0]

        if(session && session.user){
            session.user.password = undefined
            return session
        }else{
            throw 'Invalid session'
        }
    }

    async insertHost(port, protocol, destination, dport){
        await this.database.insert(HOSTS_TABLE_NAME, {port: port, protocol: protocol, destination: destination, dport: dport})
    }

    async getHosts(){
        return (await this.database.get(HOSTS_TABLE_NAME, {}))
    }
}