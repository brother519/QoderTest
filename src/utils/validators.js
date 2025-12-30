const { PASSWORD_REGEX } = require('./constants');

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  return PASSWORD_REGEX.test(password);
};

const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.securityQuestions;
  delete userObj.__v;
  return userObj;
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  sanitizeUser
};
