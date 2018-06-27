const { getRefreshTokenExpireDate, getToken, getTokenType, getTokenExpireDate } = require('../utils/token');

const RefreshToken = require('../models/refreshToken.model');

const cleos = require('./cleos');
const userService = require('./user.service')

const createEosAccount = async ({user}) => {
  const [ownerPrivate, ownerPublic] = await cleos.createKey();
  const [activePrivate, activePublic] = await cleos.createKey();
  
  try {
    await cleos.createAccount(process.env.ROOT_BLOCK_PRODUCER, user.account,
      ownerPublic, activePublic);
    
    // create two wallet for each keys
    const {password: ownerWalletPassword, wallet: ownerWallet } = await cleos.createWalletWithCleos(user, `owner`);
    await cleos.importKeyToWallet(ownerPrivate, ownerWallet.walletName);

    const {password: activeWalletPassword, wallet: activeWallet } = await cleos.createWalletWithCleos(user, `active`);
    await cleos.importKeyToWallet(activePrivate, activeWallet.walletName);
    await cleos.importKeyToWallet(ownerPrivate, 'default'); // remove
    await cleos.importKeyToWallet(activePrivate, 'default'); // remove

    return {
      ownerWalletPassword,
      activeWalletPassword,
      keys: {
        owner: { private: ownerPrivate, public: ownerPublic },
        active: { private: activePrivate, public: activePublic },
      }
    }
  } catch (err) {
    
    throw err;
  }
}


exports.register = async ({account, email, password}) => {
  let user
  try {
    user = await userService.addUser({account, email, password});
    
    const refreshTokenParams = {
      token: getToken(user._id),
      expires: getRefreshTokenExpireDate(),
      userId: user._id,
      userEmail: user.email
    }

    const refreshToken = await (new RefreshToken(refreshTokenParams)).save();

    const token = {
      tokenType: getTokenType(), 
      accessToken: user.token(), 
      refreshToken: refreshToken.token, 
      expiresIn: getTokenExpireDate()
    }

    const accountInfo = await createEosAccount({user});

    user.activePublicKey = accountInfo.keys.active.public;
    user.ownerPublicKey = accountInfo.keys.owner.public;
    user.ownerWalletPassword = accountInfo.ownerWalletPassword;
    user.activeWalletPassword = accountInfo.activeWalletPassword;
    await user.save();

    const result = {
      token,
      user: user.transform(),
    }
    return Object.assign(result, accountInfo);
  } catch (error) {
    if (user) { await user.remove(); }
    throw error
  }
}