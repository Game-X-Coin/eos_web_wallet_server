const { unlock, lock } = require('../../src/api/services/wallet.service');
const WALLET_PASSWORD = 'PW5KKQcUS5jiDa53zL3FZSyfBkvAYwfTf8da5AN3b1ZDEvDpvAjmH'
const DEFAULT_WALLET = 'default';
const ACCOUNT_RULE = '12345abcdefghijklmnopqrstuvwxyz';
const MAX_ACCOUNT_LENGTH = 13;

exports.walletPassword = WALLET_PASSWORD;

exports.unlockWallet = async () => {
  try {
    await unlock(DEFAULT_WALLET, WALLET_PASSWORD);
  } catch (error) {
    console.error(error);
  }  
}

exports.lockWallet = async () => {
  try {
    await lock(DEFAULT_WALLET)
  } catch (error) {
    console.log(error);
  }
}

exports.getRandomAccount = () => {
  let account = '';

  for(let i = 0; i < MAX_ACCOUNT_LENGTH - 1; i++) {
    const randomIndex = Math.floor(Math.random() * ACCOUNT_RULE.length);
    account += ACCOUNT_RULE.charAt(randomIndex);
  }
  return account;
}
