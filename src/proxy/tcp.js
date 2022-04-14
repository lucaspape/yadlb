const args = require('minimist')(process.argv.slice(2))
const net = require('net')

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
    net.createServer((from) => {
        let to = net.createConnection({host: destAddr, port: destPort})

        from.pipe(to)
        to.pipe(from)
    }).listen(srcPort, () => {
        console.log(`TCP proxy listening on port ${srcPort}, forwarding to ${destAddr}:${destPort}`)
    })
}