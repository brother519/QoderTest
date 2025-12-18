const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.port === 465,
  auth: emailConfig.auth
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: emailConfig.from,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = `
    <h1>Email Verification</h1>
    <p>Please click the link below to verify your email:</p>
    <a href="${verifyUrl}">${verifyUrl}</a>
    <p>This link expires in 24 hours.</p>
  `;
  await sendEmail(email, 'Verify Your Email', html);
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = `
    <h1>Password Reset</h1>
    <p>You requested a password reset. Click the link below:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link expires in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  await sendEmail(email, 'Password Reset Request', html);
};

const sendAccountLockedEmail = async (email) => {
  const html = `
    <h1>Account Security Alert</h1>
    <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
    <p>If this wasn't you, please reset your password immediately.</p>
  `;
  await sendEmail(email, 'Account Locked - Security Alert', html);
};

const send2FABackupCodesEmail = async (email, codes) => {
  const html = `
    <h1>Your 2FA Backup Codes</h1>
    <p>Keep these codes safe. Each can only be used once:</p>
    <ul>${codes.map(c => `<li>${c}</li>`).join('')}</ul>
    <p>Store them securely and do not share them.</p>
  `;
  await sendEmail(email, 'Your 2FA Backup Codes', html);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAccountLockedEmail,
  send2FABackupCodesEmail
};
