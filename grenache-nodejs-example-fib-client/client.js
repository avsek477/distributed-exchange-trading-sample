const { PeerRPCClient }  = require('grenache-nodejs-ws')
const Link = require('grenache-nodejs-link')

const link = new Link({
    grape: 'http://127.0.0.1:30001',
    requestTimeout: 10000
})
link.start()

const peer = new PeerRPCClient(link, {})
peer.init()

const sellOrder = {amount: 100, price: 50, id: 1, side: 'ask'};
const buyOrder = {amount: 150, price: 60, id: 2, side: 'bid'};

peer.request('trade_worker', buyOrder, { timeout: 10000 }, (err, result) => {
    if (err) throw err
    console.log(result)
});

peer.request('trade_worker', sellOrder, { timeout: 10000 }, (err, result) => {
    if (err) throw err
    console.log(result)
});