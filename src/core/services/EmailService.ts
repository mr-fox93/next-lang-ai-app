import { 
  EmailService as IEmailService,
  EmailRecipient,
  EmailSendResult,
  ContactEmailData
} from '@/core/interfaces/services/EmailService';

export abstract class EmailService implements IEmailService {
  abstract sendContactEmail(data: ContactEmailData): Promise<EmailSendResult>;
  
  abstract sendEmail(
    to: EmailRecipient[],
    from: EmailRecipient,
    subject: string,
    htmlContent: string,
    textContent?: string,
    replyTo?: string
  ): Promise<EmailSendResult>;
} 