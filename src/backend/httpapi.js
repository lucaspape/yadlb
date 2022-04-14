const bodyParser = require('body-parser')
const cookieParser = require("cookie-parser")

const API_PREFIX = '/api'

module.exports = class HttpApi {
    constructor(api, app) {
        this.api = api
        this.app = app
    }

    serveApi(){
        this.app.use(bodyParser.json({limit: '1mb'}))
        this.app.use(cookieParser())

        this.app.get(API_PREFIX + '/hosts', async (req, res) => {
            const sessionId = req.cookies.session

            let session

            try{
                session = await this.api.checkSession(sessionId)
            }catch (e) {
                console.log(e)
                res.status(500).send('Internal Server Error')
                return
            }

            if(session){
                res.send({ hosts: await this.api.getHosts()})
            }else{
                res.status(401).send('Unauthorized')
            }
        })

        this.app.post(API_PREFIX + '/host', async (req, res) => {
            const sessionId = req.cookies.session

            let session

            try{
                session = await this.api.checkSession(sessionId)
            }catch (e) {
                console.log(e)
                res.status(500).send('Internal Server Error')
                return
            }

            if(session){
                let port = req.body.port
                let protocol = req.body.protocol
                let destination = req.body.destination
                let dport = req.body.dport

                if(!port){
                    res.status(400).send('Missing body parameter port')
                }else if(!protocol) {
                    res.status(400).send('Missing body parameter protocol')
                }else if(!destination) {
                    res.status(400).send('Missing body parameter destination')
                }else if(!dport) {
                    res.status(400).send('Missing body parameter dport')
                }else{
                    try {
                        await this.api.addHost(port, protocol, destination, dport)
                        res.send('Inserted host')
                    }catch (e) {
                        console.log(e)
                        res.status(500).send('Internal server error')
                    }
                }
            }else{
                res.status(401).send('Unauthorized')
            }
        })

        this.app.post(API_PREFIX + '/login', async (req, res) => {
            let username = req.body.username
            let password = req.body.password

            if(!username){
                res.status(400).send('Missing body parameter username')
            }else if(!password){
                res.status(400).send('Missing body parameter password')
            }else{
                try{
                    const sessionId = await this.api.loginUser(username, password)
                    if(sessionId){
                        res.cookie('session', sessionId)
                        res.send('Login successful')
                    }else{
                        res.status(401).send('Invalid username or password')
                    }
                }catch (e) {
                    console.log(e)
                    res.status(500).send('Internal server error')
                }
            }
        })
    }
}