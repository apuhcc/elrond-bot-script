const {
  Balance,
  TransactionPayload,
  ProxyProvider,
  NetworkConfig,
  Transaction,
  UserSigner,
  UserSecretKey,
  GasLimit,
  Account,
  Address,
} = require("@elrondnetwork/erdjs");
const { generateWalletKey } = require("./create-pem");
const {
  getHexValue,
  getDecimalFromHex,
  getHexNumberValue,
} = require("./utilities");
const {
  getSwapPoolInfo,
  checkForActivePool,
  getTransactionStatus,
  getTokenBalance
} = require("./apis");
const pem = generateWalletKey();

let signer = new UserSigner(UserSecretKey.fromPem(pem));

let provider = new ProxyProvider("https://gateway.elrond.com");

const account = new Account(signer.getAddress());

try {
  NetworkConfig.getDefault().sync(provider);
} catch (error) {
  console.log(error);
}

const WRAPPED_EGLD_IDENTIFIER = "WEGLD-bd4d79";

const createTransaction = (
  firstTokenIdentifier,
  secondTokenIdentifier,
  valueToSwap,
  valueToReceive,
  address
) => {
  const data =
    "ESDTTransfer" +
    "@" +
    Buffer.from(firstTokenIdentifier).toString("hex") +
    "@" +
    valueToSwap +
    "@" +
    "73776170546f6b656e734669786564496e707574" +
    "@" +
    Buffer.from(secondTokenIdentifier).toString("hex") +
    "@" +
    valueToReceive;

  const memo = new TransactionPayload(data);

  const receiverAddress = new Address(address);
  return {
    chainID: "1",
    receiver: receiverAddress,
    value: 0,
    data: memo,
    gasLimit: new GasLimit(18000000 + GasLimit.forTransfer(memo).value),
  };
};

const createSellTransaction = async (
  tokenName,
  tokenToExchange,
  minEGLDValue,
  slippage = 0.01,
  minSellPrice
) => {
  const {
    firstToken: token,
    address,
    firstTokenPrice: swapPrice,
  } = await getSwapPoolInfo(tokenName);

  let valueToSwap = getHexValue(tokenToExchange, token.decimals);
  console.log(`Current price ${swapPrice}`);
  console.log(`Number of tokens to sell ${tokenToExchange}`);

  if (minSellPrice && swapPrice < minSellPrice) {
    console.log(
      "Current price does not match desired sell price",
      minSellPrice
    );
    setTimeout(() => {
      createSellTransaction(
        tokenName,
        tokenToExchange,
        minEGLDValue,
        slippage,
        minSellPrice
      );
    }, 1000);

    return;
  }
  let totalEGLDToReceive;
  if (minEGLDValue) {
    totalEGLDToReceive = getHexValue(minEGLDValue);
  } else {
    totalEGLDToReceive = swapPrice * tokenToExchange;

    totalEGLDToReceive = totalEGLDToReceive - totalEGLDToReceive * slippage;
    console.log(
      `Value of egld to receive if transaction success ${totalEGLDToReceive}`
    );
    totalEGLDToReceive = getHexValue(totalEGLDToReceive);
  }

  return createTransaction(
    token.identifier,
    WRAPPED_EGLD_IDENTIFIER,
    valueToSwap,
    totalEGLDToReceive,
    address
  );
};

const createBuyTransaction = async (
  tokenName,
  egldBalance,
  minQuantity,
  slippage = 0.01,
  maxBuyPrice
) => {
  const {
    firstToken: token,
    address,
    secondTokenPrice: swapPrice,
    firstTokenPrice: tokenPrice,
  } = await getSwapPoolInfo(tokenName);

  console.log("Current price : ", tokenPrice);
  console.log("Current price : ", maxBuyPrice);

  if (maxBuyPrice && tokenPrice > maxBuyPrice) {
    console.log("Current price does not match desired buy price");
    setTimeout(() => {
      createBuyTransaction(
        tokenName,
        egldBalance,
        minQuantity,
        slippage,
        maxBuyPrice
      );
    }, 1000);

    return;
  }

  let value = getHexValue(egldBalance);
  let totalTokensToBuyHEX;
  if (minQuantity) {
    totalTokensToBuyHEX = getHexValue(minQuantity, token.decimals);
  } else {
    let totalTokensToBuy = swapPrice * egldBalance;

    totalTokensToBuy = totalTokensToBuy - totalTokensToBuy * slippage;
    console.log(
      `Number of token to receive if transaction success ${totalTokensToBuy}`
    );
    totalTokensToBuyHEX = getHexValue(totalTokensToBuy, token.decimals);
  }

  return createTransaction(
    WRAPPED_EGLD_IDENTIFIER,
    token.identifier,
    value,
    totalTokensToBuyHEX,
    address
  );
};

const sendTransaction = async (transactionPayload, isContinuos) => {
  await account.sync(provider);
  const transaction = new Transaction({
    ...transactionPayload,
    nonce: account.nonce,
  });

  signer.sign(transaction);

  const transactionsHash = await transaction.send(provider);

  const response = await getTransactionStatus(transactionsHash);
  if (response === "fail") {
    console.log("transaction failed");

    if (isContinuos) {
      setTimeout(async () => {
        sendTransaction(transactionPayload, isContinuos);
      }, 500);
    }

    return;
  } 
  if(response === 'stop') {
    console.log('Transaction is invalid, please check transaction to see what is the issue')
    return;
  }
  console.log("transaction success");
};

const buyToken = async ({
  checkActivePool,
  slippage,
  tokenName,
  egldValueToExchange,
  minTokenValueToReceive,
  maxBuyPrice,
  isContinuos,
}) => {
  const WEGLD_BALANCE = await getTokenBalance(WRAPPED_EGLD_IDENTIFIER, account.address)
  if(egldValueToExchange > WEGLD_BALANCE) {
    console.log('Current WEGLD balance: ', WEGLD_BALANCE)
    console.log('ERROR, amount of WEGLD to exchange is bigger then available amount ')

    return;
  }
  if (checkActivePool) {
    await checkForActivePool(tokenName);
  }

  const transaction = await createBuyTransaction(
    tokenName,
    egldValueToExchange,
    minTokenValueToReceive,
    slippage,
    maxBuyPrice
  );

  sendTransaction(transaction, isContinuos);
};

const sellToken = async ({
  checkActivePool,
  slippage,
  tokenName,
  tokenValueToExchange,
  minEgldValueToReceive,
  minSellPrice,
  isContinuos,
}) => {
  if (checkActivePool) {
    await checkForActivePool(tokenName);
  }

  const transaction = await createSellTransaction(
    tokenName,
    tokenValueToExchange,
    minEgldValueToReceive,
    slippage,
    minSellPrice
  );
  if (transaction) {
    sendTransaction(transaction, isContinuos);
  }
};


module.exports = {
  sellToken, 
  buyToken
}

