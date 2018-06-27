const { expect } = require('chai');
const { register } = require('../../../src/api/services/auth.service');
const { removeUser } = require('../../../src/api/services/user.service');
const { connect } = require('../../../src/config/mongoose');
const { unlockWallet, getRandomAccount } = require('../../helpers/wallet.helper');

describe('auth.service', function() {
  before(async () => {
    connect();
    await unlockWallet();
  });

  describe('register', () => {
    const account = getRandomAccount();
    const newUser = {
      account,
      email: `${account}@gmail.com`,
      password: 'asdfasdf'
    };

    before(async () => {
      await removeUser(newUser);
    });

    after(async () => {
      await removeUser(newUser);
    });
    
    it('should register new user', async () => {
      const result = await register(newUser);
      expect(result.activeWalletPassword).to.be.an('string');
      expect(result.ownerWalletPassword).to.be.an('string');
      expect(result.keys).to.be.an('object');
      expect(result.keys.active.private).to.be.an('string');
      expect(result.keys.active.public).to.be.an('string');
      expect(result.keys.owner.private).to.be.an('string');
      expect(result.keys.owner.public).to.be.an('string');
      expect(result.token).to.be.an('object');
      expect(result.token.accessToken).to.be.an('string');
      expect(result.token.expiresIn).to.be.an('object');
      expect(result.token.refreshToken).to.be.an('string');
      expect(result.token.tokenType).to.be.equal('Bearer');
      expect(result.user).to.be.an('object');
      expect(result.user.account).to.be.equal(newUser.account);
      expect(result.user.activePublicKey).to.be.equal(result.keys.active.public);
      expect(result.user.balance).to.be.equal(0);
      expect(result.user.createdAt).to.be.an('date');
      expect(result.user.email).to.be.equal(newUser.email);
      expect(result.user.id).to.be.an('string');
      expect(result.user.ownerPublicKey).to.be.equal(result.keys.owner.public);
      expect(result.user.picture).to.be.not.exist;
      expect(result.user.role).to.be.not.exist;
    });
  });
});
