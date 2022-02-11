const { sellToken, buyToken } = require("./elrond_bot");
const buyOptions = {
  // send transactions only after swap is enabled - this will lose 1-2 seconds at listing but transaction will not execute and no gas is payed
  checkActivePool: true,
  slippage: 0.01,
  // token name
  tokenName: "BSK",
  // egld value to sell
  egldValueToExchange: 1,
  // Optional, min token value to receive
  minTokenValueToReceive: 0,
  // Optional, max price to buy in egld, it will loop on price until the price reach the desired buy price including slippage if specified
  maxBuyPrice: 0,
  // loop if transaction is failed, to use at listing
  isContinuos: false,
};

const sellOptions = {
  // send transactions only after swap is enabled - this will lose 1-2 seconds at listing but transaction will not execute and no gas is payed
  checkActivePool: true,
  //0-1
  slippage: 0.01,
  // token name
  tokenName: "",
  // token value to sell, needs to be at least 0.05 egld in value
  tokenValueToExchange: 0,
  // Options, min value to receive
  minEgldValueToReceive: 0,
  //Optional, min price to sell in egld, it will loop on price until the price reach the desired sell price including slippage if specified
  minSellPrice: 0,
  // loop if transaction is failed, to use at listing
  isContinuos: false,
};

// sellToken(sellOptions);
// buyToken(buyOptions);
