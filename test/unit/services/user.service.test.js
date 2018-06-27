const { expect } = require('chai');
const { addUser, removeUser } = require('../../../src/api/services/user.service');
const { connect } = require('../../../src/config/mongoose');

describe('user.service', function() {

  before(() => {
    connect()
  });

  describe('addUser', () => {
    const newUser = {
      account: 'asdfasdf12',
      email: 'asdfasdf@gmail.com',
      password: 'asdfasdf'
    }
    before(async () => {  
      await removeUser(newUser);
    });

    after(async () => {
      await removeUser(newUser);
    });
    
    it('should add new user', async () => {
      const user = await addUser(newUser)
      expect(user.account).to.be.equal(newUser.account);
      expect(user.email).to.be.equal(newUser.email);
      expect(user.password).to.be.an('string');
    });
  });  
});
