const { expect } = require('chai');
const { connect } = require('../../../src/config/mongoose');
const { createKey, importKey, createEOSAccount } = require('../../../src/api/services/wallet.service');
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
});
