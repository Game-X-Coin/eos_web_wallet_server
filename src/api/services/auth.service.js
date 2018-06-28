const { getRefreshTokenExpireDate, getToken, getTokenType, getTokenExpireDate } = require('../utils/token');
const RefreshToken = require('../models/refreshToken.model');
const userService = require('./user.service')
const { createEOSAccount } = require('./wallet.service');

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

    const accountInfo = await createEOSAccount(user);

    user.activePublicKey = accountInfo.keys.active.public;
    user.ownerPublicKey = accountInfo.keys.owner.public;
    user.ownerWalletPassword = accountInfo.ownerWalletPassword;
    user.activeWalletPassword = accountInfo.activeWalletPassword;
    await user.save();

    const result = {
      token,
      user: await user.transform(),
    }
    return Object.assign(result, accountInfo);
  } catch (error) {
    if (user) { await user.remove(); }
    throw error
  }
}