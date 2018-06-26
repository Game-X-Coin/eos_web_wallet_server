const Eos = require('eosjs');

const config = {
  chainId: null,
  httpEndPoint: process.env.CLEOS_HTTP_ENDPOINT,
  keyProvider: process.env.KEY_PROVIDER,
  expireInSeconds: 0,
  broadcast: true,
  verbose: false,
  debug: true,
  sign: true
};

export default Eos(config);
