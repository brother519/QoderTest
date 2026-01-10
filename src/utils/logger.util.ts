import pino from 'pino';
import { appConfig } from '../config';

export const logger = pino({
  level: appConfig.logLevel,
  transport: appConfig.env === 'development' 
    ? { 
        target: 'pino-pretty', 
        options: { 
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        } 
      }
    : undefined,
});
