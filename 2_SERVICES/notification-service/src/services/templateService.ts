import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';
import { database } from '../config/database';
import { NotificationTemplate, NotificationData } from '../types';

export class TemplateService {
  private compiledTemplates: Map<string, HandlebarsTemplateDelegate> = new Map();
  private templateCache: Map<string, NotificationTemplate> = new Map();
  private templatesPath: string;

  constructor() {
    this.templatesPath = path.join(__dirname, '../../templates');
    this.registerHelpers();
  }

  private registerHelpers(): void {
    // Register Handlebars helpers
    Handlebars.registerHelper('formatDate', (date: Date, format: string = 'short') => {
      if (!date) return '';
      
      const d = new Date(date);
      switch (format) {
        case 'short':
          return d.toLocaleDateString();
        case 'long':
          return d.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        case 'time':
          return d.toLocaleTimeString();
        case 'datetime':
          return d.toLocaleString();
        default:
          return d.toLocaleDateString();
      }
    });

    Handlebars.registerHelper('formatCurrency', (amount: number, currency: string = 'USD') => {
      if (typeof amount !== 'number') return amount;
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase()
      }).format(amount);
    });

    Handlebars.registerHelper('uppercase', (str: string) => {
      return str?.toString().toUpperCase() || '';
    });

    Handlebars.registerHelper('lowercase', (str: string) => {
      return str?.toString().toLowerCase() || '';
    });

    Handlebars.registerHelper('truncate', (str: string, length: number = 100) => {
      if (!str) return '';
      return str.length > length ? str.substring(0, length) + '...' : str;
    });

    Handlebars.registerHelper('eq', (a: any, b: any) => {
      return a === b;
    });

    Handlebars.registerHelper('gt', (a: number, b: number) => {
      return a > b;
    });

    Handlebars.registerHelper('lt', (a: number, b: number) => {
      return a < b;
    });

    Handlebars.registerHelper('and', (a: any, b: any) => {
      return a && b;
    });

    Handlebars.registerHelper('or', (a: any, b: any) => {
      return a || b;
    });

    logger.info('Handlebars helpers registered');
  }

  public async loadTemplates(): Promise<void> {
    try {
      await this.ensureTemplatesDirectory();
      
      const templateFiles = await fs.readdir(this.templatesPath);
      const templatePromises = templateFiles
        .filter(file => file.endsWith('.hbs') || file.endsWith('.html'))
        .map(file => this.loadTemplate(file));

      await Promise.all(templatePromises);
      
      logger.info(`Loaded ${templatePromises.length} templates`);
    } catch (error) {
      logger.error('Error loading templates:', error);
      throw error;
    }
  }

  private async ensureTemplatesDirectory(): Promise<void> {
    try {
      await fs.access(this.templatesPath);
    } catch {
      await fs.mkdir(this.templatesPath, { recursive: true });
      await this.createDefaultTemplates();
    }
  }

  private async loadTemplate(filename: string): Promise<void> {
    try {
      const filePath = path.join(this.templatesPath, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      const templateName = path.basename(filename, path.extname(filename));
      
      const compiled = Handlebars.compile(content);
      this.compiledTemplates.set(templateName, compiled);
      
      // Cache template metadata
      const template: NotificationTemplate = {
        id: templateName,
        name: this.formatTemplateName(templateName),
        type: this.getTemplateType(templateName),
        body: content,
        variables: this.extractVariables(content),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.templateCache.set(templateName, template);
      
      // Cache in Redis for distributed access
      await database.setTemplate(templateName, template);
      
      logger.debug(`Loaded template: ${templateName}`);
    } catch (error) {
      logger.error(`Error loading template ${filename}:`, error);
    }
  }

  public async renderTemplate(
    templateName: string,
    data: NotificationData,
    type: 'html' | 'text' | 'subject' = 'html'
  ): Promise<string> {
    try {
      // Try to get from compiled templates first
      let compiled = this.compiledTemplates.get(templateName);
      
      if (!compiled) {
        // Try to load from cache or file system
        await this.loadTemplate(`${templateName}.hbs`);
        compiled = this.compiledTemplates.get(templateName);
      }
      
      if (!compiled) {
        throw new Error(`Template not found: ${templateName}`);
      }

      // Prepare template data with additional context
      const templateData = {
        ...data,
        _meta: {
          timestamp: new Date(),
          templateName,
          renderType: type
        },
        _helpers: {
          currentYear: new Date().getFullYear(),
          platformName: 'iWORKZ',
          supportEmail: 'support@iworkz.com',
          baseUrl: process.env.FRONTEND_BASE_URL || 'https://app.iworkz.com'
        }
      };

      const rendered = compiled(templateData);
      
      // Apply post-processing based on type
      switch (type) {
        case 'text':
          return this.htmlToText(rendered);
        case 'subject':
          return this.extractSubject(rendered);
        default:
          return rendered;
      }
    } catch (error) {
      logger.error(`Error rendering template ${templateName}:`, error);
      throw error;
    }
  }

  public async getTemplate(templateName: string): Promise<NotificationTemplate | null> {
    // Check memory cache first
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    // Check Redis cache
    const cached = await database.getTemplate(templateName);
    if (cached) {
      this.templateCache.set(templateName, cached);
      return cached;
    }

    return null;
  }

  public async listTemplates(): Promise<NotificationTemplate[]> {
    const templates: NotificationTemplate[] = [];
    
    for (const [name, template] of this.templateCache) {
      templates.push(template);
    }
    
    return templates.sort((a, b) => a.name.localeCompare(b.name));
  }

  public async createTemplate(
    templateData: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<NotificationTemplate> {
    const template: NotificationTemplate = {
      ...templateData,
      id: this.generateTemplateId(templateData.name),
      createdAt: new Date(),
      updatedAt: new Date(),
      variables: this.extractVariables(templateData.body)
    };

    // Save to file system
    const filename = `${template.id}.hbs`;
    const filePath = path.join(this.templatesPath, filename);
    await fs.writeFile(filePath, templateData.body);

    // Compile and cache
    const compiled = Handlebars.compile(templateData.body);
    this.compiledTemplates.set(template.id, compiled);
    this.templateCache.set(template.id, template);

    // Cache in Redis
    await database.setTemplate(template.id, template);

    logger.info(`Created template: ${template.id}`);
    return template;
  }

  public async updateTemplate(
    templateId: string,
    updates: Partial<NotificationTemplate>
  ): Promise<NotificationTemplate> {
    const existing = await this.getTemplate(templateId);
    if (!existing) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const updated: NotificationTemplate = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
      variables: updates.body ? this.extractVariables(updates.body) : existing.variables
    };

    // Update file if body changed
    if (updates.body) {
      const filename = `${templateId}.hbs`;
      const filePath = path.join(this.templatesPath, filename);
      await fs.writeFile(filePath, updates.body);

      // Recompile
      const compiled = Handlebars.compile(updates.body);
      this.compiledTemplates.set(templateId, compiled);
    }

    // Update caches
    this.templateCache.set(templateId, updated);
    await database.setTemplate(templateId, updated);

    logger.info(`Updated template: ${templateId}`);
    return updated;
  }

  public async deleteTemplate(templateId: string): Promise<void> {
    // Remove from file system
    const filename = `${templateId}.hbs`;
    const filePath = path.join(this.templatesPath, filename);
    
    try {
      await fs.unlink(filePath);
    } catch (error) {
      logger.warn(`Template file not found: ${filename}`);
    }

    // Remove from caches
    this.compiledTemplates.delete(templateId);
    this.templateCache.delete(templateId);
    await database.deleteCache(`template:${templateId}`);

    logger.info(`Deleted template: ${templateId}`);
  }

  private extractVariables(templateContent: string): string[] {
    const variableRegex = /\{\{(?:\s*)([\w.]+)(?:\s*)\}\}/g;
    const variables = new Set<string>();
    let match;

    while ((match = variableRegex.exec(templateContent)) !== null) {
      const variable = match[1];
      // Filter out helpers and built-in variables
      if (!variable.startsWith('_') && !this.isHandlebarsHelper(variable)) {
        variables.add(variable);
      }
    }

    return Array.from(variables).sort();
  }

  private isHandlebarsHelper(variable: string): boolean {
    const helpers = [
      'formatDate', 'formatCurrency', 'uppercase', 'lowercase', 
      'truncate', 'eq', 'gt', 'lt', 'and', 'or', 'if', 'unless', 
      'each', 'with', 'lookup', 'log'
    ];
    return helpers.includes(variable.split('.')[0]);
  }

  private formatTemplateName(templateName: string): string {
    return templateName
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private getTemplateType(templateName: string): 'email' | 'sms' | 'push' | 'in_app' {
    if (templateName.includes('email')) return 'email';
    if (templateName.includes('sms')) return 'sms';
    if (templateName.includes('push')) return 'push';
    return 'email'; // default
  }

  private generateTemplateId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractSubject(html: string): string {
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    
    if (titleMatch) {
      return this.htmlToText(titleMatch[1]);
    }
    
    if (h1Match) {
      return this.htmlToText(h1Match[1]);
    }
    
    return 'Notification from iWORKZ';
  }

  private async createDefaultTemplates(): Promise<void> {
    const defaultTemplates = [
      {
        name: 'welcome-email',
        content: this.getWelcomeEmailTemplate()
      },
      {
        name: 'job-match-alert',
        content: this.getJobMatchTemplate()
      },
      {
        name: 'application-status',
        content: this.getApplicationStatusTemplate()
      },
      {
        name: 'interview-reminder',
        content: this.getInterviewReminderTemplate()
      },
      {
        name: 'password-reset',
        content: this.getPasswordResetTemplate()
      }
    ];

    for (const template of defaultTemplates) {
      const filePath = path.join(this.templatesPath, `${template.name}.hbs`);
      await fs.writeFile(filePath, template.content);
    }

    logger.info('Created default templates');
  }

  private getWelcomeEmailTemplate(): string {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Welcome to iWORKZ!</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to iWORKZ!</h1>
        </div>
        <div class="content">
            <h2>Hi {{user.firstName}},</h2>
            <p>Welcome to iWORKZ! We're excited to have you join our global workforce platform.</p>
            <p>Here's what you can do next:</p>
            <ul>
                <li>Complete your profile to get better job matches</li>
                <li>Upload your resume and credentials</li>
                <li>Set your job preferences and location</li>
                <li>Start browsing available opportunities</li>
            </ul>
            <a href="{{_helpers.baseUrl}}/dashboard" class="button">Get Started</a>
        </div>
        <div class="footer">
            <p>© {{_helpers.currentYear}} {{_helpers.platformName}}. All rights reserved.</p>
            <p>Need help? Contact us at {{_helpers.supportEmail}}</p>
        </div>
    </div>
</body>
</html>`;
  }

  private getJobMatchTemplate(): string {
    return `<!DOCTYPE html>
<html>
<head>
    <title>New Job Match Found!</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .job-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .match-score { background: #10b981; color: white; padding: 5px 10px; border-radius: 20px; font-weight: bold; }
        .button { display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 New Job Match Found!</h1>
        </div>
        <div class="job-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h2>{{job.title}}</h2>
                <span class="match-score">{{match.score}}% Match</span>
            </div>
            <p><strong>Company:</strong> {{job.company.name}}</p>
            <p><strong>Location:</strong> {{job.location.city}}, {{job.location.country}}</p>
            <p><strong>Salary:</strong> {{formatCurrency job.salary.min job.salary.currency}} - {{formatCurrency job.salary.max job.salary.currency}}</p>
            <p><strong>Type:</strong> {{job.type}}</p>
            {{#if job.description}}
            <p><strong>Description:</strong> {{truncate job.description 200}}</p>
            {{/if}}
            <a href="{{_helpers.baseUrl}}/jobs/{{job.id}}" class="button">View Job Details</a>
        </div>
        <div class="footer">
            <p>This job matches your preferences. <a href="{{_helpers.baseUrl}}/preferences">Update preferences</a></p>
            <p>© {{_helpers.currentYear}} {{_helpers.platformName}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private getApplicationStatusTemplate(): string {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Application Status Update</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
        .status-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .status-badge { padding: 8px 16px; border-radius: 20px; font-weight: bold; text-transform: uppercase; }
        .status-under-review { background: #fbbf24; color: #92400e; }
        .status-interview { background: #3b82f6; color: white; }
        .status-accepted { background: #10b981; color: white; }
        .status-rejected { background: #ef4444; color: white; }
        .button { display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Application Status Update</h1>
        </div>
        <div class="status-card">
            <h2>Hi {{user.firstName}},</h2>
            <p>Your application status has been updated!</p>
            
            <div style="margin: 20px 0;">
                <p><strong>Position:</strong> {{application.position}}</p>
                <p><strong>Company:</strong> {{application.company}}</p>
                <p><strong>Applied:</strong> {{formatDate application.appliedAt}}</p>
                <p><strong>Status:</strong> <span class="status-badge status-{{lowercase application.status}}">{{application.status}}</span></p>
            </div>

            {{#if application.message}}
            <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Message from {{application.company}}:</strong></p>
                <p>{{application.message}}</p>
            </div>
            {{/if}}

            {{#if application.nextSteps}}
            <div style="background: #eff6ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Next Steps:</strong></p>
                <p>{{application.nextSteps}}</p>
            </div>
            {{/if}}

            <a href="{{_helpers.baseUrl}}/applications/{{application.id}}" class="button">View Application</a>
        </div>
        <div class="footer">
            <p>Keep track of all your applications in your <a href="{{_helpers.baseUrl}}/applications">dashboard</a></p>
            <p>© {{_helpers.currentYear}} {{_helpers.platformName}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private getInterviewReminderTemplate(): string {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Interview Reminder</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .interview-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .important { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 Interview Reminder</h1>
        </div>
        <div class="interview-card">
            <h2>Hi {{user.firstName}},</h2>
            <p>This is a friendly reminder about your upcoming interview:</p>
            
            <div style="margin: 20px 0;">
                <p><strong>Position:</strong> {{interview.position}}</p>
                <p><strong>Company:</strong> {{interview.company}}</p>
                <p><strong>Date:</strong> {{formatDate interview.datetime 'long'}}</p>
                <p><strong>Time:</strong> {{formatDate interview.datetime 'time'}}</p>
                {{#if interview.location}}
                <p><strong>Location:</strong> {{interview.location}}</p>
                {{/if}}
                {{#if interview.meetingLink}}
                <p><strong>Meeting Link:</strong> <a href="{{interview.meetingLink}}">{{interview.meetingLink}}</a></p>
                {{/if}}
                {{#if interview.interviewer}}
                <p><strong>Interviewer:</strong> {{interview.interviewer.name}} ({{interview.interviewer.title}})</p>
                {{/if}}
            </div>

            {{#if interview.notes}}
            <div class="important">
                <p><strong>Important Notes:</strong></p>
                <p>{{interview.notes}}</p>
            </div>
            {{/if}}

            <div style="margin: 20px 0;">
                <h3>Preparation Tips:</h3>
                <ul>
                    <li>Review the job description and company information</li>
                    <li>Prepare questions about the role and company culture</li>
                    <li>Test your technology if it's a video interview</li>
                    <li>Arrive 10-15 minutes early</li>
                    <li>Have copies of your resume and references ready</li>
                </ul>
            </div>

            <a href="{{_helpers.baseUrl}}/interviews/{{interview.id}}" class="button">View Interview Details</a>
        </div>
        <div class="footer">
            <p>Good luck with your interview! We're rooting for you.</p>
            <p>© {{_helpers.currentYear}} {{_helpers.platformName}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private getPasswordResetTemplate(): string {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Password Reset Request</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { background: white; padding: 20px; }
        .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Password Reset Request</h1>
        </div>
        <div class="content">
            <h2>Hi {{user.firstName}},</h2>
            <p>You requested to reset your password for your iWORKZ account. Click the button below to create a new password:</p>
            
            <a href="{{resetLink}}" class="button">Reset Password</a>
            
            <p>This link will expire in {{expiryHours}} hours for security reasons.</p>
            
            <div class="warning">
                <p><strong>Security Notice:</strong></p>
                <p>If you didn't request this password reset, please ignore this email. Your account is still secure.</p>
                <p>If you're concerned about unauthorized access, please contact our support team immediately.</p>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">{{resetLink}}</p>
        </div>
        <div class="footer">
            <p>For security questions, contact us at {{_helpers.supportEmail}}</p>
            <p>© {{_helpers.currentYear}} {{_helpers.platformName}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }
}