const axios = require('axios');
const eos = require('./eos');

const wallet = {
  url: `${process.env.CLEOS_HTTP_ENDPOINT}`,

  createKey: async (wallet, keyType = 'K1') => {
    try {
      const params = [wallet, keyType];
      return await axios.post(`${this.url}/v1/wallet/create_key`, params);
    } catch (e) {
      throw new Error(e);
    }
  },

  importKey: async (wallet, key) => {
    try {
      const params = [wallet, key];
      return await axios.post(`${this.url}/v1/wallet/import_key`, params);
    } catch (e) {
      throw new Error(e);
    }
  },

  listKeys: async (wallet, walletPass) => {
    try {
      const params = [wallet, walletPass];
      return await axios.post(`${this.url}/v1/wallet/list_keys`, params);
    } catch (e) {
      throw new Error(e);
    }
  },

  privateKey: async (wallet, walletPass, publicKey) => {
    try {
      if (publicKey) return null;
      const result = this.listKeys(wallet, walletPass);
      const resultMap = new Map(result);
      return resultMap.get(publicKey);
    } catch (e) {
      throw new Error(e);
    }
  },

  open: async (wallet) => {
    try {
      const params = wallet; 
      return await axios.post(`${this.url}/v1/wallet/open`, params);
    } catch (e) {
      throw new Error(e);
    }
  },

  lock: async (wallet) => {
    try {
      const params = wallet;
      return await axios.post(`${this.url}/v1/wallet/lock`, params);
    } catch (e) {
      throw new Error(e);
    }
  },

  lock_all: async () => {
    try {
      return await axios.post(`${this.url}/v1/wallet/lock_all`, params);
    } catch (e) {
      throw new Error(e);
    }
  },

  unlock: async (wallet, walletPass) => {
    try {
      const params = [wallet, walletPass];
      return await axios.post(`${this.url}/v1/wallet/unlock`, params);
    } catch (e) {
      throw new Error(e);
    }
  },

  create: async (wallet) => {
    try {
      const params = wallet;
      return await axios.post(`${this.url}/v1/wallet/create`, params);
    } catch (e) {
      throw new Error(e);
    }
  },

  createAccount: async (creator, account, ownerPublicKey, activePublicKey) => {
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
  },
};

export default wallet;
