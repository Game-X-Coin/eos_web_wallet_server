const { getRefreshTokenExpireDate, getToken, getTokenType, getTokenExpireDate } = require('../utils/token');

const RefreshToken = require('../models/refreshToken.model');
const User = require('../models/user.model');

exports.register = async ({account, email, password}) => {
  try {
    const user = await (new User({account, email, password})).save();
    const userTransformed = user.transform();

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

    const [ownerPrivate, ownerPublic] = await cleos.createKey();
    const [activePrivate, activePublic] = await cleos.createKey();
    try {
      await cleos.createAccount(process.env.ROOT_BLOCK_PRODUCER, user.account,
        ownerPublic, activePublic);
      user.activePublicKey = activePublic;
      user.ownerPublicKey = ownerPublic;


      // create two wallet for each keys
      const {password: ownerWalletPassword, wallet: ownerWallet } = await createWallet(user, `owner`);
      await cleos.importKeyToWallet(ownerPrivate, ownerWallet.walletName);

      const {password: activeWalletPassword, wallet: activeWallet } = await createWallet(user, `active`);
      await cleos.importKeyToWallet(activePrivate, activeWallet.walletName);
      await cleos.importKeyToWallet(ownerPrivate, 'default'); // remove
      await cleos.importKeyToWallet(activePrivate, 'default'); // remove
      user.ownerWalletPassword = ownerWalletPassword;
      user.activeWalletPassword = activeWalletPassword;
      await user.save();

      res.status(httpStatus.CREATED);
      return res.json({
        token,
        user: userTransformed,
        ownerWalletPassword,
        activeWalletPassword,
        keys: {
          owner: { private: ownerPrivate, public: ownerPublic },
          active: { private: activePrivate, public: activePublic },
        },
      });
    } catch (err) {
      console.error(err);
      await user.remove();
      throw err;
    }
  } catch (error) {
    throw User.checkDuplicateEmail(error);
  }


}