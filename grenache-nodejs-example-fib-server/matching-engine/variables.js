const orderBook ={
    "buy": [],  //format: {amount: int, price: int, id: string, side: enum{0,1}}
    "sell": []  //format: {amount: int, price: int, id: string, side: enum{0,1}}
}

const trades = [];  //format: {takerOrderId: string, makerOrderId: string, amount: int, price: int}

module.exports = {
    orderBook,
    trades
}