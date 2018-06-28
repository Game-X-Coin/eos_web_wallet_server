const moment = require('moment-timezone');
const crypto = require('crypto');
const {jwtExpirationInterval} = require('../../config/vars');

exports.getTokenType = () => 'Bearer'

exports.getTokenExpireDate = () => moment().add(jwtExpirationInterval, 'minutes');

exports.getRefreshTokenExpireDate = () => moment().add(30, 'days').toDate();

exports.getToken = (userId) => `${userId}.${crypto.randomBytes(40).toString('hex')}`;
