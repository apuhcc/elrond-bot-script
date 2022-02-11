const { Mnemonic } = require("@elrondnetwork/erdjs");
require("dotenv").config();

const generateWalletKey = () => {
  const mnemonic = Mnemonic.fromString(process.env.WALLET_SECRET);

  const buff = mnemonic.deriveKey();

  const secretKeyHex = buff.hex();
  const pubKeyHex = buff.generatePublicKey().hex();

  const combinedKeys = Buffer.from(secretKeyHex + pubKeyHex).toString("base64");

  const addressFromPubKey = buff
    .generatePublicKey()
    .toAddress()
    .bech32();

  const header = `-----BEGIN PRIVATE KEY for ${addressFromPubKey}-----`;
  const footer = `-----END PRIVATE KEY for ${addressFromPubKey}-----`;

  const content = `${header}\n${combinedKeys.replace(
    /([^\n]{1,64})/g,
    "$1\n"
  )}${footer}`;

  return content;
};


module.exports = {
  generateWalletKey
}