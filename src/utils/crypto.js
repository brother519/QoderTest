const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwtConfig = require('../config/jwt');
const appConfig = require('../config/app');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(appConfig.bcryptRounds);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const hashSecurityAnswer = (answer) => {
  const normalizedAnswer = answer.trim().toLowerCase();
  return crypto
    .createHmac('sha256', jwtConfig.securityAnswerSecret)
    .update(normalizedAnswer)
    .digest('hex');
};

const verifySecurityAnswer = (answer, hashedAnswer) => {
  const hashedInput = hashSecurityAnswer(answer);
  return hashedInput === hashedAnswer;
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

module.exports = {
  hashPassword,
  comparePassword,
  hashSecurityAnswer,
  verifySecurityAnswer,
  hashToken,
  generateRandomToken
};
