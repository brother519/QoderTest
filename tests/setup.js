/**
 * @file 测试环境配置
 * @description 设置Jest测试环境变量
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
process.env.SECURITY_ANSWER_SECRET = 'test-security-secret';
process.env.BCRYPT_ROUNDS = '4';