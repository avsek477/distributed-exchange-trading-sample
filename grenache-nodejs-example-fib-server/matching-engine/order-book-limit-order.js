const {
    addBuyOrder, 
    addSellOrder,
    removeBuyOrder,
    removeSellOrder 
} = require('./order-book');
const debug = require('debug')('limitOrderBook');
const { orderBook: { buy, sell } } = require('./variables');
const Promise = require('bluebird');

const process = (currentOrder) => {
    debug("RECEIVED ORDER", currentOrder);
    
    if(currentOrder.side === 'bid') {
        return processLimitBuy(currentOrder);
    } else if (currentOrder.side === 'ask') {
        return processLimitSell(currentOrder);
    } else {
        return [];
    }
    return tradeDetails;
}

const processLimitBuy = (order) => {
    return new Promise(async (resolve, reject) => {
        await clientLock.acquire();
        const trades = [];
        const n = sell.length;
        if (n != 0 && (sell[n-1].price <= order.price)) {
            for (let i = n-1; i>=0; i--) {
                const currentSellOrder = sell[i];
                if (currentSellOrder.price > order.price) {
                    break;
                }
                if (currentSellOrder.amount >= order.amount) {
                    trades.push({
                        takerOrderId: order.id,
                        makerOrderId: currentSellOrder.id,
                        amount: order.amount,
                        price: currentSellOrder.price
                    });
                    currentSellOrder.amount -= order.amount;
                    if (currentSellOrder.amount === 0) {
                        removeSellOrder(i);
                    }
                    clientLock.release();
                    resolve(trades);
                }
                if (currentSellOrder.amount < order.amount) {
                    trades.push({
                        takerOrderId: order.id,
                        makerOrderId: currentSellOrder.id,
                        amount: currentSellOrder.amount,
                        price: currentSellOrder.price
                    });
                    order.amount -= currentSellOrder.amount;
                    removeSellOrder(i);
                    continue;
                }
            }
        }
        addBuyOrder(order);
        clientLock.release();
        resolve(trades);
    })
}

const processLimitSell = (order) => {
    return new Promise(async(resolve, reject) => {
        await clientLock.acquire();
        const trades = [];
        const n = buy.length;
        if (n!== 0 && buy[n-1].price >= order.price) {
            for (let i=n-1; i>=0; i--) {
                const currentBuyOrder = buy[i];
                if (currentBuyOrder.price < order.price) {
                    break;
                }
                if (currentBuyOrder.amount >= order.amount) {
                    trades.push({
                        takerOrderId: order.id,
                        makerOrderId: currentBuyOrder.id,
                        amount: order.amount,
                        price: currentBuyOrder.price
                    });
                    currentBuyOrder.amount -= order.amount;
                    if(currentBuyOrder.amount === 0) {
                        removeBuyOrder(i);
                    }
                    clientLock.release();
                    resolve(trades);
                }
                if (currentBuyOrder.amount < order.amount) {
                    trades.push({
                        takerOrderId: order.id,
                        makerOrderId: currentBuyOrder.id,
                        amount: currentBuyOrder.amount,
                        price: currentBuyOrder.price
                    });
                    order.amount -= currentBuyOrder.amount;
                    removeBuyOrder(i);
                    continue;
                }
            }
        }
        addSellOrder(order);
        clientLock.release();
        resolve(trades);
    })
}

module.exports = {
    process
}