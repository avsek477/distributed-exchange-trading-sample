'use strict'
const { PeerRPCServer }  = require('grenache-nodejs-ws')
const Link = require('grenache-nodejs-link')
const { process } = require('./matching-engine/order-book-limit-order');
const { orderBook, trades } = require('./matching-engine/variables');
const { Mutex, Semaphore } = require('async-mutex');
const debug = require('debug')('limitOrderBook');

let clientLock = new Mutex();
global.clientLock = clientLock;
let clientSemaphore = new Semaphore(10); //maximum of 2 requests at a time
global.clientSemaphore = clientSemaphore;

function processTrade(order) {
  return process(order);
}

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCServer(link, {})
peer.init()

const service = peer.transport('server')
service.listen(1337)

console.log("LISTENING", service.port);

setInterval(() => {
  link.announce('trade_worker', service.port, {})
}, 1000)

service.on('request', async (rid, key, payload, handler) => {
  const result = await processTrade(payload);
  trades.push(...result);
  debug("LATEST ORDERBOOK", orderBook);
  debug("LATEST TRADES", orderBook, trades);
  handler.reply(null, result)
})