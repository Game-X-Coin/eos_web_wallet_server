const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const routes = require('../api/routes/v1');
const { logs } = require('./vars');
const strategies = require('./passport');
const error = require('../api/middlewares/error');
const session = require('express-session');
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const BearerStrategy = require('passport-http-bearer').Strategy;

const OauthClient = require('../api/models/oauthClient.model');
const AccessToken = require('../api/models/accessToken.model');
const User = require('../api/models/user.model');
/**
* Express instance
* @public
*/
const app = express();

// request logging. dev: console | production: file
app.use(morgan(logs));

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// gzip compression
app.use(compress());

// lets you use HTTP verbs such as PUT or DELETE
// in places where the client doesn't support it
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors({
  origin: process.env.CORS.split(','),
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true
}));

// enable authentication

const verifyClient = async (clientId, clientSecret, done) => {
  try {
    const client = await OauthClient.findOne({_id: clientId, clientSecret }).exec();
    if (!client) return done(null, false);
    if (client.clientSecret !== clientSecret) return done(null, false);
    return done(null, client);
  } catch (error) {
    console.error(error)
    return done(error);
  }
}


app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
passport.use('jwt', strategies.jwt);
passport.use(new BasicStrategy(verifyClient));
passport.use(new ClientPasswordStrategy(verifyClient));
passport.use(new BearerStrategy(
  async (token, done) => {
    try {
      const accessToken = await AccessToken.findOne({token}).populate('user').exec();
      if (!accessToken) return done(null, false);
      return done(null, accessToken.user, {scope: '*'});
    } catch (error) {
      return done(error);
    }
  }
));

// mount api v1 routes
app.use('/v1', routes);

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);


module.exports = app;
