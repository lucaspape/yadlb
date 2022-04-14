const {v4: uuidv4} = require("uuid")
const crypto = require('crypto')
const Database = require('./database')

module.exports = class Api {
    constructor() {
        this.database = new Database()
    }

    async connectDatabase(){
        await this.database.connect()
        await this.createAdminUser()
    }

    async createAdminUser() {
        let id = uuidv4()
        let username = 'admin'
        let password = uuidv4()

        try {
            await this.database.insertUser(id, username, Api.#hash(password))

            console.log('Created admin user with password ' + password)
        } catch (e) {
            console.log('Could not create admin user')
            console.log(e)
        }
    }

    async addHost(port, protocol, destination, dport){
        await this.database.insertHost(port, protocol, destination, dport)
    }

    async getHosts(){
        return await this.database.getHosts()
    }

    async loginUser(username, password){
        let user = await this.database.getUser(username)

        if(user){
            password = Api.#hash(password)

            if (user.password === password) {
                let sessionId = uuidv4()

                await this.database.insertSession(sessionId, user.id)

                return sessionId
            }
        }

        return false
    }

    async checkSession(sessionId){
        if(sessionId){
            const session = await this.database.getSession(sessionId)

            if(session && session.user){
                return session
            }
        }

        return false
    }

    static #hash(string) {
        return crypto.createHash('sha256').update(string).digest('base64')
    }
}
