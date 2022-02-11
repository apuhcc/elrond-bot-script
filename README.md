# elrond-bot

# This is just an experiment, play with it but is not guaranteed that is working as expected!

# Important

## This is in a rudimentary phase so if you want to improve feel free to create a pull request

## I'm not responsible for any of your actions

## Don't use you main wallet for this, try with a new one


## Pre-requisites

1. Have node installed
2. Have npm installed
## How to use it

1. Clone the repo
2. run ```yarn install``` or ```npm install```
3. create a file called .env
4. add there WALLET_SECRET="YOUR_WALLET_PHRASE"
5. go to index.js and adjust your options on what you want to do
6. you can run `sellToken` or `buyToken` once at the time, don't try to use theme in the same time
7. run `yarn start` or ``` npm run start```
8. The bot only works with WEGLD - > Token and TOKEN-WEGLD, so please make sure before starting the bot that you have enough balance.
9. Make sure you have enough money for fees in EGLD

### There are 2 option available

1. Sell tokens
2. Buy tokens

If you want to seel 3 a different way to configure the bot

- Sell at current price
  This will execute the order immediately at the current price

```js
const sellOptions = {
  //0-1
  slippage: 0.01,
  // token name
  tokenName: "BSK",
  // token value to sell, needs to be at least 0.05 egld in value
  tokenValueToExchange: 10000,
};
```

- Sell at a desired price in egld
  In this case you can specify min price in egld when you want to sell the token. This is ok to use when you want to sell a token at a specific egld price/ token

```js
const sellOptions = {
  //0-1
  slippage: 0.01,
  // token name
  tokenName: "BSK",
  // token value to sell, needs to be at least 0.05 egld in value
  tokenValueToExchange: 10000,
  //Optional, min price to sell in egld, it will loop on price until the price reach the desired sell price including slippage if specified
  minSellPrice: 0.00000082,
};
```

- Sell at a desired amount of egld
  In this case you can specify a minimum amount of egld to receive with x number of tokens.

```js
const sellOptions = {
  //0-1
  slippage: 0.01,
  // token name
  tokenName: "BSK",
  // token value to sell, needs to be at least 0.05 egld in value
  tokenValueToExchange: 10000,
  // Options, min value to receive
  minEgldValueToReceive: 1,
};
```

If you want to buy tokens 3 a different way to configure the bot

- Buy at current price

This will execute the order immediately at the current price

```js
const buyOptions = {
  slippage: 0.01,
  // token name
  tokenName: "BSK",
  // Amount of wegld to buy the token
  egldValueToExchange: 0.1,
};
```

- Buy at a desired price in egld
  In this case you can specify max price when you want to buy the token. This is ok to use when you want to buy a token at a specific egld price/ token

```js
const buyOptions = {
  slippage: 0.01,
  // token name
  tokenName: "BSK",
  // Amount of wegld to buy the token
  egldValueToExchange: 0.1,
  // Optional, max price to buy in egld, it will loop on price until the price reach the desired buy price including slippage if specified
  maxBuyPrice: 0.00000082,
};
```

- Buy at a desired amount of tokens

In this case you can specify a minimum amount of tokens to buy with a x amount of egld.

```js
const buyOptions = {
  slippage: 0.01,
  // token name
  tokenName: "BSK",
  // Amount of wegld to buy the token
  egldValueToExchange: 0.1,
  // Optional, min token value to receive
  minTokenValueToReceive: 10000,
};
```

## Use it at listing

I don't encourage pump and dump so I will not provide a way for automatic buy and sell with profit. I will only provide a way for people to buy at listing price and if they want to sell at a good price what they bought in presale.

1. Buy
   Important, the only way to get a chance to buy at listing is to continue spamming the contract address with transactions. Transactions will fail until the swap is active. This cost fees money so use this only when is close to listing(few minutes before).
   There were cases when listing was delayed with 50-60 minutes. Cost for a transaction is ~0.00044 EGLD(0,07\$), so if you run this for 1 hour on every 1 second the cost for transactions fees will be ~1.58 EGLD.
   There is a big chance that you don't get the token at listing price since there are a lot of bots doing the same, so if the transactions did not go through in the first 10 seconds after swaps is active, stop the script.

How to use it :

```js
const buyOptions = {
  // I recommend a slippage ~15 % at launch
  slippage: 0.15,
  // token name
  tokenName: "BSK",
  // Amount of wegld to buy the token
  egldValueToExchange: 0.1,
  // loop if transaction is failed, this will automatically redo the transaction if it was failed
  isContinuos: true,
};

buyToken(buyOptions);
```

2. Sell
   As above this option cost money for failed transactions so don't run it more that needed.

How to use it :

```js
const sellOptions = {
  // the transactions will trigger only after pool active
  checkActivePool: true,
  //slippage(15%)
  slippage: 0.15,
  // token name
  tokenName: "BSK",
  // token value to sell, needs to be at least 0.05 egld in value
  tokenValueToExchange: 10000,
  // Min value in egld to receive for x amount of tokens
  minEgldValueToReceive: 1,
  isContinuos: true,
};

sellToken(sellOptions);
```


### This project is made in my free time, support me if you want to continue with new features. 

Address: erd16x937p7sang0sgv7laduxx38vxasfdup4zketwp5l2dg9au7cjysqkegfu