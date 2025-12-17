const winston = require('winston');
const path = require('path');

const logDir = process.env.LOG_FILE_PATH || './logs';

const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken', 'secret', 'authorization'];

const redactSensitiveData = winston.format((info) => {
  const redactedInfo = { ...info };
  
  const redact = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const result = Array.isArray(obj) ? [] : {};
    
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        result[key] = redact(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  };
  
  return redact(redactedInfo);
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    redactSensitiveData(),
    winston.format.json()
  ),
  defaultMeta: { service: process.env.APP_NAME || 'QoderTest' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        let msg = `${timestamp} [${service}] ${level}: ${message}`;
        if (Object.keys(meta).length > 0) {
          msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
      })
    )
  }));
}

module.exports = logger;
