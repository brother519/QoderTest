import { ProviderType } from '@prisma/client';
import { BaseEmailProvider } from './base.provider.js';
import { SendGridProvider } from './sendgrid.provider.js';
import { AWSSESProvider } from './aws-ses.provider.js';

const providers = new Map<ProviderType, BaseEmailProvider>();

export function getProvider(type: ProviderType): BaseEmailProvider {
  let provider = providers.get(type);
  
  if (!provider) {
    switch (type) {
      case ProviderType.SENDGRID:
        provider = new SendGridProvider();
        break;
      case ProviderType.AWS_SES:
        provider = new AWSSESProvider();
        break;
      default:
        throw new Error(`Unknown provider type: ${type}`);
    }
    providers.set(type, provider);
  }
  
  return provider;
}

export function getAllProviders(): BaseEmailProvider[] {
  // 确保所有提供商都已初始化
  if (!providers.has(ProviderType.SENDGRID)) {
    providers.set(ProviderType.SENDGRID, new SendGridProvider());
  }
  if (!providers.has(ProviderType.AWS_SES)) {
    providers.set(ProviderType.AWS_SES, new AWSSESProvider());
  }
  
  return Array.from(providers.values());
}

export { BaseEmailProvider, EmailMessage } from './base.provider.js';
export { SendGridProvider } from './sendgrid.provider.js';
export { AWSSESProvider } from './aws-ses.provider.js';
