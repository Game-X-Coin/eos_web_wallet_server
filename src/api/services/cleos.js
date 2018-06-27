
const util = require('util');
const axios = require('axios');
const Wallet = require('../models/wallet.model');

const exec = util.promisify(require('child_process').exec);

/* temp function wrapper for create wallet */
exports.createWalletWithCleos = async (user, walletName, prefix=true) => {
  debugger
  try {
    walletName = prefix ? `${user.account}_${walletName}` : walletName
    const result = await createWallet(walletName);
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

exports.createKey = async () => {
  try {
    const keyRegex = /Private key: ([a-zA-Z0-9_]*)(\s*)Public key: ([a-zA-Z0-9_]*)/g;
    const { stdout, stderr } = await exec(`${process.env.CLEOS_EXEC} create key`);
    if (stderr) {
      1;
    }
    const [, privateKey, , publicKey] = keyRegex.exec(stdout);
    return [privateKey, publicKey];

  } catch (err) {
    throw err;
  }
  return 1;
};


exports.createAccount = async (creatorAccount, accountName, ownerPublicKey, activePublicKey) => {
  try {
    const { stdout, stderr } = await exec(`${process.env.CLEOS_EXEC} create account ${creatorAccount} ${accountName} ${ownerPublicKey} ${activePublicKey}`);
    if (stderr) {
      console.error('create Account error');
      console.log(stderr);
      if(stderr.toLowerCase().indexOf('warning') >= 0){
        return true;
      }
      throw stderr;
    }
    return true;
  } catch (err) {
    throw err;
  }
};


const createWallet = exports.createWallet = async (walletName) => {
  const { stdout, stderr } = await exec(`${process.env.CLEOS_EXEC} wallet create -n ${walletName}`)
  if (stderr !== '') {
    throw stderr;
  } else {
    const keyRegex = /"([a-zA-Z0-9_]*)"/gmi;
    const [ ,password] = keyRegex.exec(stdout);
    return {data: password};
  }
}

exports.importKeyToWallet = async (key, walletName) => {
  const result = await exec(`${process.env.CLEOS_EXEC} wallet import ${key} -n ${walletName}`);

}

exports.getBalance = async (accountName, tokenName='GXQ') => {
  const str = `${process.env.CLEOS_EXEC} get currency balance eosio.token ${accountName} ${tokenName ? tokenName : ''}`;
  console.log(str);
  const { stdout, stderr } = await exec(str);
  if (stdout === '') {
    return 0.0;
  } else {
    return parseFloat(stdout.split(' ')[0])
  }
}

exports.getBalances = async (accountName) => {
  const str = `${process.env.CLEOS_EXEC} get currency balance eosio.token ${accountName}`;
  console.log(str);
  const { stdout, stderr } = await exec(str);
  if (stdout === '') {
    return 0.0;
  } else {
    let balances = {};
    console.log(stdout.split('\n'));
    stdout.trim().split('\n').forEach(line => {
      const [quantity, symbol] = line.trim().split(' ');
      console.log(line.trim().split(' '));
      balances[symbol] = quantity;
    });
    return balances;
  }
}

// cleos push action gxc.token transfer '[ "eosio", "tester", "25.0000 EOS", "m" ]' -p eosio
exports.requestFaucet = async(accountName, quantity, symbol="SYS") => {

  const { stdout, stderr } = await exec(`${process.env.CLEOS_EXEC} push action eosio.token transfer '[ "gxc.token", "${accountName}", "5.0000 ${symbol}", "m" ]' -p gxc.token`)
  if(stdout.indexOf('executed transaction:') >= 0) {
    const keyRegex = /executed transaction: ([a-zA-Z0-9_]*)(\s*)/gmi;
    const [ ,transactionId] = keyRegex.exec(stdout);
    return { quantity, transactionId };
  } else {
    throw(stderr);
  }
}

exports.newTransaction = async(from, to, quantity, symbol, memo, wallet) => {
  const { stdout, stderr } = await exec(`${process.env.CLEOS_EXEC} push action eosio.token transfer '[ "${from}", "${to}", "${parseFloat(quantity).toFixed(4)} ${symbol}", "${memo}" ]' -p ${from}`)
  if(stderr.indexOf('executed transaction:') >= 0) {
    const keyRegex = /executed transaction: ([a-zA-Z0-9_]*)(\s*)/gmi;
    const [ ,transactionId] = keyRegex.exec(stderr);
    return { quantity, transactionId };
  } else {
    throw(stderr);
  }
}

exports.getTransaction = async(transactionId) => {
  const { stdout, stderr } = await exec(`${process.env.CLEOS_EXEC} get transaction ${transactionId}`)
  return JSON.parse(stdout);
}
