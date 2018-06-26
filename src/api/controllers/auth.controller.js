const httpStatus = require('http-status');

const cleos = require('../services/cleos');
const authService = require('../services/auth.service')
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const Wallet = require('../models/wallet.model');


/* temp function wrapper for create wallet */
const createWallet = async (user, walletName, prefix=true) => {
  try {
    walletName = prefix ? `${user.account}_${walletName}` : walletName
    const result = await cleos.createWallet(walletName);
    const password = result.data;
    const wallet = new Wallet({ walletName, user: user._id });
    await wallet.save();
    console.log(wallet);
    console.log(password);
    return {password, wallet};
  } catch(error) {
    console.error(error);
    throw(error);
  }
}
/**
 * Returns jwt token if registration was successful
 * @public
 */
exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
  } catch (err) {
    throw next(err);
  }
};

/**
 * Returns jwt token if valid username and password is provided
 * @public
 */
exports.login = async (req, res, next) => {
  try {

    const { user, accessToken } = await User.findAndGenerateToken(req.body);
    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    return res.json({ token, user: userTransformed });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * login with an existing user or creates a new one if valid accessToken token
 * Returns jwt token
 * @public
 */
exports.oAuth = async (req, res, next) => {
  try {
    const {user} = req;
    const accessToken = user.token();
    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    return res.json({ token, user: userTransformed });
  } catch (error) {
    return next(error);
  }
};

/**
 * Returns a new jwt when given a valid refresh token
 * @public
 */
exports.refresh = async (req, res, next) => {
  try {
    const { email, refreshToken } = req.body;
    const refreshObject = await RefreshToken.findOneAndRemove({
      userEmail: email,
      token: refreshToken,
    });
    const { user, accessToken } = await User.findAndGenerateToken({ email, refreshObject });
    const response = generateTokenResponse(user, accessToken);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};
