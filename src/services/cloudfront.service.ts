import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { readFileSync } from 'fs';
import { cloudfrontConfig } from '../config';
import { logger } from '../utils/logger.util';

class CloudFrontService {
  private privateKey: string;
  private keyPairId: string;
  private domain: string;

  constructor() {
    this.keyPairId = cloudfrontConfig.keyPairId;
    this.domain = cloudfrontConfig.domain;
    
    try {
      this.privateKey = readFileSync(cloudfrontConfig.privateKeyPath, 'utf8');
    } catch (error) {
      logger.warn('CloudFront private key not found, signed URLs will not work', error);
      this.privateKey = '';
    }
  }

  generateSignedUrl(
    s3Key: string,
    expiresIn: number = 3600
  ): string {
    try {
      if (!this.privateKey) {
        throw new Error('CloudFront private key not configured');
      }

      const url = `https://${this.domain}/${s3Key}`;
      const dateLessThan = new Date(Date.now() + expiresIn * 1000);

      const signedUrl = getSignedUrl({
        url,
        keyPairId: this.keyPairId,
        dateLessThan: dateLessThan.toISOString(),
        privateKey: this.privateKey,
      });

      return signedUrl;
    } catch (error) {
      logger.error('Failed to generate CloudFront signed URL', error);
      throw error;
    }
  }

  getPublicUrl(s3Key: string): string {
    return `https://${this.domain}/${s3Key}`;
  }

  generateSignedCookie(
    resource: string,
    expiresIn: number = 3600
  ): { policy: string; signature: string; keyPairId: string } {
    try {
      if (!this.privateKey) {
        throw new Error('CloudFront private key not configured');
      }

      const dateLessThan = new Date(Date.now() + expiresIn * 1000);
      
      const policy = JSON.stringify({
        Statement: [
          {
            Resource: resource,
            Condition: {
              DateLessThan: {
                'AWS:EpochTime': Math.floor(dateLessThan.getTime() / 1000),
              },
            },
          },
        ],
      });

      const policyBase64 = Buffer.from(policy).toString('base64');
      
      return {
        policy: policyBase64,
        signature: '',
        keyPairId: this.keyPairId,
      };
    } catch (error) {
      logger.error('Failed to generate CloudFront signed cookie', error);
      throw error;
    }
  }
}

export const cloudfrontService = new CloudFrontService();
