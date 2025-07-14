import { EmailService } from '@/core/services/EmailService';
import { 
  EmailRecipient, 
  EmailSendResult, 
  ContactEmailData 
} from '@/core/interfaces/services/EmailService';
import { Resend } from 'resend';
import { EmailTemplate } from '@/components/email-template';
import * as React from 'react';

export class ResendEmailService extends EmailService {
  private resend: Resend;

  constructor() {
    super();
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendContactEmail(data: ContactEmailData): Promise<EmailSendResult> {
    try {
      const emailResult = await this.resend.emails.send({
        from: 'Flashcards AI <onboarding@resend.dev>',
        to: ['lisieckikamil93@gmail.com'],
        subject: `New contact message from ${data.senderName}`,
        react: React.createElement(EmailTemplate, { 
          firstName: data.senderName,
          userEmail: data.senderEmail,
          userMessage: data.message
        }),
        replyTo: data.senderEmail,
      });

      if (emailResult.error) {
        return {
          success: false,
          error: emailResult.error.message || 'Failed to send email'
        };
      }

      return {
        success: true,
        id: emailResult.data?.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendEmail(
    to: EmailRecipient[],
    from: EmailRecipient,
    subject: string,
    htmlContent: string,
    textContent?: string,
    replyTo?: string
  ): Promise<EmailSendResult> {
    try {
      const emailResult = await this.resend.emails.send({
        from: `${from.name || 'Flashcards AI'} <${from.email}>`,
        to: to.map(recipient => recipient.email),
        subject,
        html: htmlContent,
        text: textContent,
        replyTo,
      });

      if (emailResult.error) {
        return {
          success: false,
          error: emailResult.error.message || 'Failed to send email'
        };
      }

      return {
        success: true,
        id: emailResult.data?.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 