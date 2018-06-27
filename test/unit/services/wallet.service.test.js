const { expect } = require('chai');
const { createKey, importKey } = require('../../../src/api/services/wallet.service');
const { unlockWallet, lockWallet, walletPassword } = require('../../helpers/wallet.helper');
const { removeKey } = require('../../../src/api/services/cleos');


describe('wallet.service', function () {
  before(async () => {
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
});
