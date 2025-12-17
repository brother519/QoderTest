const { encrypt, decrypt, hashToken } = require('../utils/crypto');

function encryptSecret(plainSecret) {
  return encrypt(plainSecret);
}

function decryptSecret(encryptedSecret) {
  return decrypt(encryptedSecret);
}

function hashRefreshToken(token) {
  return hashToken(token);
}

module.exports = {
  encryptSecret,
  decryptSecret,
  hashRefreshToken
};
