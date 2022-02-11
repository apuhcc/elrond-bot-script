const { request, gql } = require("graphql-request");
const axios = require("axios");
const { getDecimalFromHex } = require("./utilities");
const WRAPPED_EGLD_IDENTIFIER = "WEGLD-bd4d79";

const query = gql`
  {
    pairs(offset: 0, limit: 500) {
      address
      firstToken {
        name
        identifier
        decimals
        __typename
      }
      firstTokenPrice
      secondToken {
        name
        identifier
        decimals
        __typename
      }
      secondTokenPrice
      liquidityPoolToken {
        name
        identifier
        decimals
        __typename
      }
      state
      totalFeePercent
      specialFeePercent
      type
      __typename
    }
  }
`;

const getTransactionStatus = async (hash) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const result = await axios.get(
          `https://gateway.elrond.com/transaction/${hash}?withResults=true`
        );
        console.log(result.data.data.transaction.status);
        if (result.data.data.transaction.status === "pending") {
          return;
        }
        if(
          result.data.data.transaction.status === "invalid"
        ) {
          clearInterval(interval);
          resolve("stop");
        }
        if (
          (result.data.data.transaction.smartContractResults &&
            result.data.data.transaction.smartContractResults.length < 2) ||
          result.data.data.transaction.status === "fail"
        ) {
          clearInterval(interval);
          resolve("fail");
          return;
        }

        clearInterval(interval);
        resolve("success");
      } catch (e) {
        console.log(e);
        clearInterval(interval);
        resolve("fail");
      }
    }, 500);
  });
};

const getActivePools = async () => {
  const data = await request({
    url: "https://graph.maiar.exchange/graphql",
    document: query,
    variables: { offset: 0, pairsLimit: 500 },
  });
  return data.pairs.filter((pair) => pair.state === "Active");
};

const getAvailablePools = async () => {
  const data = await request({
    url: "https://graph.maiar.exchange/graphql",
    document: query,
    variables: { offset: 0, pairsLimit: 500 },
  });
  return data.pairs.filter(
    (pair) => pair.state === "ActiveNoSwaps" || pair.state === "Active"
  );
};

const getTokenBalance = async (identifier, address) => {
  const response = await axios.get(
    `https://gateway.elrond.com/address/${address}/esdt/${identifier}`
  );
  return getDecimalFromHex(response.data.data.tokenData.balance);
};

const getSwapPoolInfo = async (tokenName) => {
  const activePools = await getAvailablePools();
  let tokenPool = activePools.find(
    (pool) =>
      pool.firstToken.identifier.includes(tokenName) &&
      pool.secondToken.identifier === WRAPPED_EGLD_IDENTIFIER
  );
  return tokenPool;
};

const checkForActivePool = (tokenName) => {
  return new Promise((resolve, reject) => {
    const getPool = async () => {
      try {
        const activePools = await getActivePools();
        let tokenPool = activePools.find(
          (pool) =>
            (pool.firstToken.identifier.includes(tokenName) &&
              pool.secondToken.identifier === WRAPPED_EGLD_IDENTIFIER) ||
            (pool.secondToken.identifier.includes(tokenName) &&
              pool.firstToken.identifier === WRAPPED_EGLD_IDENTIFIER)
        );

        if (!tokenPool) {
          console.log("NOT ACTIVE SWAP FOUND", tokenName, Date.now());

          setTimeout(() => {
            getPool(tokenName);
          }, 500);
          return;
        }
        console.log("SWAP ACTIVE", tokenName, Date.now());
        resolve("SWAP active");
      } catch (e) {
        setTimeout(() => {
          getPool(tokenName);
        }, 500);
      }
    };
    getPool();
  });
};
module.exports = {
  getAvailablePools,
  getActivePools,
  getTransactionStatus,
  getTokenBalance,
  getSwapPoolInfo,
  checkForActivePool,
};
