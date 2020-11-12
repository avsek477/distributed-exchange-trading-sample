const { orderBook } = require('./variables')

const addBuyOrder = (currentOrder) => {
    const n = orderBook.buy.length;
    let i;
    for(i=n-1; i>=0; i--) {
        const buyOrder = orderBook.buy[i];
        if (buyOrder && buyOrder.price < currentOrder.price) {
            break;
        }
    }
    if (i === n-1) {
        orderBook.buy.push(currentOrder);
    } else {
        orderBook.buy.splice(i, 0, currentOrder);
    }
}

const addSellOrder = (currentOrder) => {
    const n = orderBook.sell.length;
    let i;
    for(i=n; i>=0; i--) {
        const sellOrder = orderBook.sell[i];
        if (sellOrder && sellOrder.price > currentOrder.price) {
            break;
        }
    }
    if (i === n-1) {
        orderBook.sell.push(currentOrder);
    } else {
        orderBook.sell.splice(i, 0, currentOrder);
    }
}

const removeBuyOrder = (index) => {
    orderBook.buy.splice(index, 1);
}

const removeSellOrder = (index) => {
    orderBook.sell.splice(index, 1);
}

module.exports = {
    orderBook,
    addBuyOrder,
    addSellOrder,
    removeBuyOrder,
    removeSellOrder
}