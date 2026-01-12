import { EmailTemplate, EmailType } from '@prisma/client';
import { prisma } from '../config/database.js';
import { renderTemplate, extractVariables, validateVariables } from '../utils/template-parser.js';
import { createLogger } from '../utils/logger.js';
import { redis } from '../config/redis.js';

const logger = createLogger('template-service');

const CACHE_PREFIX = 'template:';
const CACHE_TTL = 3600; // 1 hour

export interface CreateTemplateInput {
  name: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  category?: string;
  emailType?: EmailType;
  variables?: string[];
}

export interface UpdateTemplateInput {
  name?: string;
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  category?: string;
  emailType?: EmailType;
  variables?: string[];
  isActive?: boolean;
}

export interface RenderedTemplate {
  subject: string;
  htmlBody: string;
  textBody?: string;
}

export class TemplateService {
  /**
   * 创建模板
   */
  async create(input: CreateTemplateInput): Promise<EmailTemplate> {
    // 自动从模板内容中提取变量
    const extractedVars = [
      ...extractVariables(input.subject),
      ...extractVariables(input.htmlBody),
      ...(input.textBody ? extractVariables(input.textBody) : []),
    ];
    const uniqueVars = [...new Set([...extractedVars, ...(input.variables || [])])];
    
    const template = await prisma.emailTemplate.create({
      data: {
        name: input.name,
        subject: input.subject,
        htmlBody: input.htmlBody,
        textBody: input.textBody,
        category: input.category,
        emailType: input.emailType || EmailType.TRANSACTIONAL,
        variables: uniqueVars,
      },
    });
    
    logger.info({ templateId: template.id, name: template.name }, 'Template created');
    return template;
  }
  
  /**
   * 更新模板
   */
  async update(id: string, input: UpdateTemplateInput): Promise<EmailTemplate> {
    const existing = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new Error(`Template not found: ${id}`);
    }
    
    // 重新提取变量
    let variables = input.variables;
    if (input.subject || input.htmlBody || input.textBody) {
      const subject = input.subject || existing.subject;
      const htmlBody = input.htmlBody || existing.htmlBody;
      const textBody = input.textBody ?? existing.textBody;
      
      const extractedVars = [
        ...extractVariables(subject),
        ...extractVariables(htmlBody),
        ...(textBody ? extractVariables(textBody) : []),
      ];
      variables = [...new Set([...extractedVars, ...(variables || [])])];
    }
    
    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.subject && { subject: input.subject }),
        ...(input.htmlBody && { htmlBody: input.htmlBody }),
        ...(input.textBody !== undefined && { textBody: input.textBody }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.emailType && { emailType: input.emailType }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(variables && { variables }),
      },
    });
    
    // 清除缓存
    await this.invalidateCache(id);
    
    logger.info({ templateId: template.id }, 'Template updated');
    return template;
  }
  
  /**
   * 删除模板
   */
  async delete(id: string): Promise<void> {
    await prisma.emailTemplate.delete({ where: { id } });
    await this.invalidateCache(id);
    logger.info({ templateId: id }, 'Template deleted');
  }
  
  /**
   * 获取模板（带缓存）
   */
  async getById(id: string): Promise<EmailTemplate | null> {
    // 尝试从缓存获取
    const cached = await redis.get(`${CACHE_PREFIX}${id}`);
    if (cached) {
      return JSON.parse(cached) as EmailTemplate;
    }
    
    const template = await prisma.emailTemplate.findUnique({ where: { id } });
    
    if (template) {
      // 存入缓存
      await redis.setex(`${CACHE_PREFIX}${id}`, CACHE_TTL, JSON.stringify(template));
    }
    
    return template;
  }
  
  /**
   * 根据名称获取模板
   */
  async getByName(name: string): Promise<EmailTemplate | null> {
    return prisma.emailTemplate.findUnique({ where: { name } });
  }
  
  /**
   * 列出模板
   */
  async list(options: {
    page?: number;
    limit?: number;
    category?: string;
    emailType?: EmailType;
    isActive?: boolean;
    search?: string;
  } = {}): Promise<{ templates: EmailTemplate[]; total: number }> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const skip = (page - 1) * limit;
    
    const where = {
      ...(options.category && { category: options.category }),
      ...(options.emailType && { emailType: options.emailType }),
      ...(options.isActive !== undefined && { isActive: options.isActive }),
      ...(options.search && {
        OR: [
          { name: { contains: options.search, mode: 'insensitive' as const } },
          { subject: { contains: options.search, mode: 'insensitive' as const } },
        ],
      }),
    };
    
    const [templates, total] = await Promise.all([
      prisma.emailTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.emailTemplate.count({ where }),
    ]);
    
    return { templates, total };
  }
  
  /**
   * 渲染模板
   */
  async render(
    templateId: string,
    variables: Record<string, unknown>
  ): Promise<RenderedTemplate> {
    const template = await this.getById(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    
    return this.renderTemplate(template, variables);
  }
  
  /**
   * 渲染模板对象
   */
  renderTemplate(
    template: EmailTemplate,
    variables: Record<string, unknown>
  ): RenderedTemplate {
    // 验证必需变量
    const combinedTemplate = `${template.subject}\n${template.htmlBody}\n${template.textBody || ''}`;
    const validation = validateVariables(combinedTemplate, variables);
    
    if (!validation.valid) {
      logger.warn(
        { templateId: template.id, missing: validation.missing },
        'Missing template variables'
      );
    }
    
    return {
      subject: renderTemplate(template.subject, variables),
      htmlBody: renderTemplate(template.htmlBody, variables),
      textBody: template.textBody
        ? renderTemplate(template.textBody, variables)
        : undefined,
    };
  }
  
  /**
   * 预览模板
   */
  async preview(
    templateId: string,
    variables: Record<string, unknown>
  ): Promise<RenderedTemplate> {
    return this.render(templateId, variables);
  }
  
  /**
   * 清除模板缓存
   */
  private async invalidateCache(id: string): Promise<void> {
    await redis.del(`${CACHE_PREFIX}${id}`);
  }
}

export const templateService = new TemplateService();
