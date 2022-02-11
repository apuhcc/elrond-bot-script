const BigNumber = require("bignumber.js");


const getHexValue = (value, pow = 18) => {
  let hexValue = BigNumber(value)
    .multipliedBy(BigNumber(10).pow(pow))
    .toString(16);
  if (hexValue.length % 2 != 0) {
    hexValue = "0" + hexValue;
  }

  return hexValue;
};

const getDecimalFromHex = (value, pow = 18) => {
  return BigNumber(value)
    .dividedBy(BigNumber(10).pow(pow))
    .toNumber();
};
const getHexNumberValue = (value) => {

  return BigNumber(value, 16)
  .toString(10);
};
module.exports = {
  getHexValue,
  getDecimalFromHex,
  getHexNumberValue
};
