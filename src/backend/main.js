const express = require('express')

const Api = require('./api')
const HttpApi = require('./httpapi')

const PORT = 80

const app = express()

const api = new Api()
api.connectDatabase().then(() => {
    const httpApi = new HttpApi(api, app)
    httpApi.serveApi()

    app.listen(PORT, () => {
        console.log('Server started on port ' + PORT)
    })
})