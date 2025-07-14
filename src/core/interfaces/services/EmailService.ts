export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailSendResult {
  success: boolean;
  error?: string;
  id?: string;
}

export interface ContactEmailData {
  senderName: string;
  senderEmail: string;
  message: string;
}

export interface EmailService {
  sendContactEmail(data: ContactEmailData): Promise<EmailSendResult>;
  
  sendEmail(
    to: EmailRecipient[],
    from: EmailRecipient,
    subject: string,
    htmlContent: string,
    textContent?: string,
    replyTo?: string
  ): Promise<EmailSendResult>;
} 