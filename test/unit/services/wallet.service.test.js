const { expect } = require('chai');
const { connect } = require('../../../src/config/mongoose');
const { createKey, importKey, createEOSAccount, lock, unlock, lock_all, open, listKeys } = require('../../../src/api/services/wallet.service');
const { addUser, removeUser } = require('../../../src/api/services/user.service');
const { unlockWallet, lockWallet, walletPassword, getRandomAccount } = require('../../helpers/wallet.helper');
const { removeKey } = require('../../../src/api/services/cleos');

describe('wallet.service', function () {
  before(async () => {
    connect();
    await unlockWallet();
  });

  after(async () => {
    await lockWallet();
  }); 

  describe('createKey', () => {
    it('should create key', async () => {
      const key = await createKey('default');
      expect(key).to.be.an('string');
    });
  });

  describe('importKey', () => {
    const privateKey = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';
    const publicKey =  'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV';
    before(async () => {
      try {
        await removeKey({publicKey, walletPassword})
      } catch (err) {
        console.error(err);
      }
    });

    it('should import key', async () => {
      const result = await importKey('default', privateKey);
      expect(result).to.be.equal('Created');
    });
  });

  describe('createEOSAccount', () => {
    let user
    const account = getRandomAccount()
    const newUser = {
      account,
      email: `${account}@gamil.com`,
      password: '12341234'
    };

    before(async () => {
      user = await addUser(newUser);
    });

    after(async () => {
      await removeUser(newUser);
    });

    it('should create eos account', async () => {
      const result = await createEOSAccount(user);
      expect(result.activeWalletPassword).to.be.an('string');
      expect(result.ownerWalletPassword).to.be.an('string');
      expect(result.keys).to.be.an('object');
      expect(result.keys.active.public).to.be.an('string');
      expect(result.keys.owner.public).to.be.an('string');
    });
  });

  describe('listKeys', () => {
    it('should get keys list', async () => {
      const keys = await listKeys('default', 'PW5KKQcUS5jiDa53zL3FZSyfBkvAYwfTf8da5AN3b1ZDEvDpvAjmH');
      expect(keys).to.be.an('array');
    });
  });

  describe('open', () => {
    const walletName = 'default';
    it('should open wallet', async () => {
      const response = await open(walletName);
      expect(response.status).to.be.equal(200);
      expect(response.statusText).to.be.equal("OK");
    });
  });

  describe('lock_all', () => {
    it('should lock all wallets', async () => {
      const response = await lock_all();
      expect(response.status).to.be.equal(200);
      expect(response.statusText).to.be.equal("OK");
    });
  });

  describe('lock', () => {
    const walletName = 'default';
    it('should lock wallet', async () => {
      const response = await lock(walletName);
      expect(response.status).to.be.equal(200);
      expect(response.statusText).to.be.equal("OK");
    });
  });

  describe('unlock', () => {
    const walletName = 'default';
    before(async () => {
      await lockWallet();
    });

    it('should unlock wallet', async () => {
      const response = await unlock(walletName, walletPassword);
      expect(response.status).to.be.equal(200);
      expect(response.statusText).to.be.equal("OK");
    });
  });
});
