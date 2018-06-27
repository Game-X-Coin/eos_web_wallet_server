const User = require('../models/user.model');

exports.addUser = async ({account, email, password}) => {
  try {
    return await (new User({account, email, password})).save();
  } catch (err) {
    throw User.checkDuplicateEmail(err);
  } 
}

exports.removeUser = async ({account, email}) => {
  const query = {}
  if (account) { query.account = account }
  if (email) { query.email = email }
  try {
    return await User.remove(query);
  } catch (error) {
    throw error
  }
}
