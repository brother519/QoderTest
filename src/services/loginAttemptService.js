const { LoginAttempt } = require('../models');
const { Op } = require('sequelize');
const securityConfig = require('../config/security');

async function recordAttempt(email, ipAddress, isSuccessful = false) {
  await LoginAttempt.create({
    email,
    ip_address: ipAddress,
    is_successful: isSuccessful,
    attempt_time: new Date()
  });
}

async function checkRateLimit(email) {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  const recentAttempts = await LoginAttempt.count({
    where: {
      email,
      is_successful: false,
      attempt_time: {
        [Op.gte]: fiveMinutesAgo
      }
    }
  });
  
  if (recentAttempts >= 5) {
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfter: 5 * 60
    };
  }
  
  return {
    allowed: true,
    remainingAttempts: 5 - recentAttempts,
    retryAfter: 0
  };
}

async function checkIPRateLimit(ipAddress) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const recentAttempts = await LoginAttempt.count({
    where: {
      ip_address: ipAddress,
      is_successful: false,
      attempt_time: {
        [Op.gte]: oneHourAgo
      }
    }
  });
  
  if (recentAttempts >= 20) {
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfter: 60 * 60
    };
  }
  
  return {
    allowed: true,
    remainingAttempts: 20 - recentAttempts,
    retryAfter: 0
  };
}

async function clearOldAttempts() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const deletedCount = await LoginAttempt.destroy({
    where: {
      attempt_time: {
        [Op.lt]: oneDayAgo
      }
    }
  });
  
  return deletedCount;
}

async function getFailedAttemptCount(email) {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  const count = await LoginAttempt.count({
    where: {
      email,
      is_successful: false,
      attempt_time: {
        [Op.gte]: fiveMinutesAgo
      }
    }
  });
  
  return count;
}

module.exports = {
  recordAttempt,
  checkRateLimit,
  checkIPRateLimit,
  clearOldAttempts,
  getFailedAttemptCount
};
