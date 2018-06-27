const axios = require('axios');
const eos = require('./eos');
const { cleos } = require('../../config/vars');

const WALLET_URL = cleos.url;

exports.createKey = async (wallet, keyType = 'K1') => {
  try {
    const params = [wallet, keyType];
    const response = await axios.post(`${WALLET_URL}/v1/wallet/create_key`, params);
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

exports.create = async (wallet) => {
  try {
    const params = wallet;
    return await axios.post(`${WALLET_URL}/v1/wallet/create`, params);
  } catch (e) {
    throw new Error(e);
  }
}

exports.createAccount = async (creator, account, ownerPublicKey, activePublicKey) => {
  eos.transaction(tr => {
    tr.newaccount({
      creator,
      name: account,
      owner: ownerPublicKey,
      active: activePublicKey,
    })

    tr.buyrambytes({
      payer: creator,
      receiver: account,
      bytes: 256
    });

    tr.delegatebw({
      from: creator,
      receiver: account,
      stake_net_quantity: '0.0100 SYS',
      stake_cpu_quantity: '0.0100 SYS',
      transfer: 0
    })
  });
}