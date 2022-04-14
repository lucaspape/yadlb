const args = require('minimist')(process.argv.slice(2))
const dgram = require('dgram')

let srcPort = args.port

let destAddr = args.destination
let destPort = args.dport

if(!srcPort){
    throw 'Missing parameter --port'
}else if(!destAddr){
    throw 'Missing parameter --destination'
}else if(!destPort){
    throw 'Missing parameter --dport'
}else{
    const client = dgram.createSocket('udp4')
    const server = dgram.createSocket('udp4')

    server.on('message', (msg) => {
        client.send(msg, destPort, destAddr)
    })

    server.on('listening', () => {
        console.log(`UDP4 proxy listening on port ${srcPort}, forwarding to ${destAddr}:${destPort}`)
    })

    server.bind(srcPort)
}