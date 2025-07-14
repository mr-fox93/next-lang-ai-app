import { EmailService } from '@/core/services/EmailService';
import { ModerationService } from '@/core/services/ModerationService';
import { ContactEmailData } from '@/core/interfaces/services/EmailService';

export interface SendContactEmailParams {
  name: string;
  email: string;
  message: string;
}

export interface SendContactEmailResult {
  success: boolean;
  error?: string;
  details?: string;
}

export class SendContactEmailUseCase {
  constructor(
    private emailService: EmailService,
    private moderationService: ModerationService
  ) {}

  async execute(params: SendContactEmailParams): Promise<SendContactEmailResult> {
    const { name, email, message } = params;

    // Validate inputs
    if (!name || name.trim().length < 1 || name.length > 100) {
      return {
        success: false,
        error: 'Name is required and must be between 1-100 characters'
      };
    }

    if (!email || !email.includes('@')) {
      return {
        success: false,
        error: 'Invalid email format'
      };
    }

    if (!message || message.trim().length < 5 || message.length > 5000) {
      return {
        success: false,
        error: 'Message must be between 5-5000 characters'
      };
    }

    // Check for suspicious email patterns
    const emailModeration = await this.moderationService.moderateEmail(email);
    if (!emailModeration.isSafe) {
      return {
        success: false,
        error: 'Invalid email address',
        details: emailModeration.reasons[0]
      };
    }

    // Check for profanity
    if (this.moderationService.isProfane(message)) {
      return {
        success: false,
        error: "We couldn't send your message",
        details: 'Please review your message for appropriate language and try again.'
      };
    }

    // Check for suspicious patterns
    if (this.moderationService.containsSuspiciousPatterns(message)) {
      return {
        success: false,
        error: 'Message contains suspicious content',
        details: 'Your message appears to contain promotional or suspicious content. Please remove any links or promotional material.'
      };
    }

    // Advanced AI-powered moderation
    const moderationResult = await this.moderationService.moderateContent(message);
    if (!moderationResult.isSafe) {
      const detailMessage = moderationResult.reasons[0].includes("Content flagged for:")
        ? "Our system detected content that might not be appropriate for the contact form. Please ensure your message focuses on technical issues, questions, or feedback about the application."
        : moderationResult.reasons[0];

      return {
        success: false,
        error: 'Message cannot be sent',
        details: detailMessage
      };
    }

    // Send email
    try {
      const contactData: ContactEmailData = {
        senderName: name.trim(),
        senderEmail: email.toLowerCase().trim(),
        message: message.trim()
      };

      const result = await this.emailService.sendContactEmail(contactData);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to send email'
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('SendContactEmailUseCase error:', error);
      return {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 