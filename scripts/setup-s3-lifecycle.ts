import { S3Client, PutBucketLifecycleConfigurationCommand } from '@aws-sdk/client-s3';
import { config } from '../src/config';

async function setupLifecycleRules() {
  const s3 = new S3Client({ 
    region: config.AWS_REGION,
    credentials: {
      accessKeyId: config.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    },
  });

  const tempBucketRules = {
    Bucket: config.S3_BUCKET_TEMP,
    LifecycleConfiguration: {
      Rules: [
        {
          Id: 'DeleteTempFilesAfter1Day',
          Status: 'Enabled' as const,
          Expiration: { Days: 1 },
          Filter: { Prefix: '' },
        },
        {
          Id: 'AbortIncompleteMultipartUpload',
          Status: 'Enabled' as const,
          AbortIncompleteMultipartUpload: { DaysAfterInitiation: 7 },
          Filter: { Prefix: '' },
        },
      ],
    },
  };

  try {
    await s3.send(new PutBucketLifecycleConfigurationCommand(tempBucketRules));
    console.log('Lifecycle rules configured successfully for temp bucket');
  } catch (error) {
    console.error('Failed to configure lifecycle rules', error);
    throw error;
  }
}

setupLifecycleRules().catch(console.error);
