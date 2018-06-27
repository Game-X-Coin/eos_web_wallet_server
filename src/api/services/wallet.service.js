const axios = require('axios');
const { cleos } = require('../../config/vars');
const { createAccount } = require('./cleos');
const Wallet = require('../models/wallet.model');

const WALLET_URL = cleos.url;

const addWallet = async (walletName, userId) => {
  try {
    return await (new Wallet({ walletName, user: userId })).save();
  } catch (error) {
    throw error;
  }
}

const createKey = exports.createKey = async (wallet = 'default', keyType = 'K1') => {
  try {
    const params = [wallet, keyType];
    const response = await axios.post(`${WALLET_URL}/v1/wallet/create_key`, params);
    return response.data;
  } catch (e) {
    throw new Error(e);
  }
}

const createWallet = exports.createWallet = async (walletName) => {
  try {
    const params = walletName;
    const response = await axios.post(`${WALLET_URL}/v1/wallet/create`, params);
    return response.data;
  } catch (e) {
    throw new Error(e);
  }
}

exports.importKey = async (wallet, key) => {
  try {
    const params = [wallet, key];
    const result = await axios.post(`${WALLET_URL}/v1/wallet/import_key`, params);
    return result.statusText;
  } catch (e) {
    throw new Error(e);
  }
}


// const createAccount = exports.createAccount = async (creator, account, ownerPublicKey, activePublicKey) => {
//   debugger
//   return eos.transaction(tr => {
//     tr.newaccount({
//       creator,
//       name: account,
//       owner: ownerPublicKey,
//       active: activePublicKey,
//     })

//     tr.buyrambytes({
//       payer: creator,
//       receiver: account,
//       bytes: 256
//     });

//     tr.delegatebw({
//       from: creator,
//       receiver: account,
//       stake_net_quantity: '0.0100 SYS',
//       stake_cpu_quantity: '0.0100 SYS',
//       transfer: 0
//     })
//   });
// }

const createEOSAccount = async (user) => {
  try {
    const ownerPublic = await createKey();
    const activePublic = await createKey();

    await createAccount(process.env.ROOT_BLOCK_PRODUCER, user.account,
      ownerPublic, activePublic);

    const ownerWalletName = `${user.account}_owner`;
    const ownerWalletPassword = await createWallet(ownerWalletName);
    await addWallet(ownerWalletName, user._id);

    const activeWalletName = `${user.account}_active`;
    const activeWalletPassword = await createWallet(activeWalletName);
    await addWallet(activeWalletName, user._id);
    
    return {
      ownerWalletPassword,
      activeWalletPassword,
      keys: {
        owner: { public: ownerPublic },
        active: { public: activePublic }
      }
    }
  } catch (err) {
    throw err;
  }
}

exports.createEOSAccount = createEOSAccount;

exports.listKeys = async (wallet, walletPass) => {
  try {
    const params = [wallet, walletPass];
    return await axios.post(`${WALLET_URL}/v1/wallet/list_keys`, params);
  } catch (e) {
    throw new Error(e);
  }
}

exports.privateKey = async (wallet, walletPass, publicKey) => {
  try {
    if (publicKey) return null;
    const result = this.listKeys(wallet, walletPass);
    const resultMap = new Map(result);
    return resultMap.get(publicKey);
  } catch (e) {
    throw new Error(e);
  }
}

exports.open = async (wallet) => {
  try {
    const params = wallet; 
    return await axios.post(`${WALLET_URL}/v1/wallet/open`, params);
  } catch (e) {
    throw new Error(e);
  }
}

exports.lock = async (wallet) => {
  try {
    const params = wallet;
    return await axios.post(`${WALLET_URL}/v1/wallet/lock`, params);
  } catch (e) {
    throw new Error(e);
  }
}

exports.lock_all = async () => {
  try {
    return await axios.post(`${WALLET_URL}/v1/wallet/lock_all`, params);
  } catch (e) {
    throw new Error(e);
  }
}

exports.unlock = async (wallet, walletPass) => {
  try {
    const params = [wallet, walletPass];
    return await axios.post(`${WALLET_URL}/v1/wallet/unlock`, params);
  } catch (e) {
    throw new Error(e);
  }
}
