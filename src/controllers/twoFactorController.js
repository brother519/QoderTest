const twoFactorService = require('../services/twoFactorService');

const setup = async (req, res, next) => {
  try {
    const result = await twoFactorService.setup(req.user.sub);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const verifySetup = async (req, res, next) => {
  try {
    const { code } = req.body;
    const result = await twoFactorService.verifySetup(req.user.sub, code);
    res.json({
      success: true,
      message: result.message,
      data: { backupCodes: result.backupCodes }
    });
  } catch (error) {
    next(error);
  }
};

const verify = async (req, res, next) => {
  try {
    const { tempToken, code } = req.body;
    const ipAddress = req.ip;
    const result = await twoFactorService.verify(tempToken, code, ipAddress);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const disable = async (req, res, next) => {
  try {
    const { password } = req.body;
    const result = await twoFactorService.disable(req.user.sub, password);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

const generateBackupCodes = async (req, res, next) => {
  try {
    const { password } = req.body;
    const result = await twoFactorService.generateBackupCodes(req.user.sub, password);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setup,
  verifySetup,
  verify,
  disable,
  generateBackupCodes
};
