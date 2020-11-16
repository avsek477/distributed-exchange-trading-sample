const {
    addBuyOrder, 
    addSellOrder,
    removeBuyOrder,
    removeSellOrder 
} = require('./order-book');
const BigNumber = require('bignumber.js');
// const BN9 = BigNumber.clone({ DECIMAL_PLACES: 9 });
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
    // return tradeDetails;
}

const processLimitBuy = (order) => {
    // BigNumber.set({DECIMAL_PLACES: 5});  //get required decimal places from config based on order type separator eg:USDBTC, BTCETH
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
                    currentSellOrder.amount = +new BigNumber(currentSellOrder.amount).minus(new BigNumber(order.amount)).toString();
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
                    order.amount = +new BigNumber(order.amount).minus(new BigNumber(currentSellOrder.amount)).toString();
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
    // BigNumber.set({DECIMAL_PLACES: 5});  //get required decimal places from config based on order type separator eg:BTCUSD, ETHBTC
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
                    currentBuyOrder.amount = +new BigNumber(currentBuyOrder.amount).minus(new BigNumber(0.15268)).toString();
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
                    order.amount = +new BigNumber(order.amount).minus(new BigNumber(currentBuyOrder.amount)).toString();
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