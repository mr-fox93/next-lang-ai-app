import { ModerationService } from '@/core/services/ModerationService';
import { ModerationResult } from '@/core/interfaces/services/ModerationService';
import { Filter } from 'bad-words';
import { moderateContent } from '@/lib/openai-moderation';

export class OpenAIModerationService extends ModerationService {
  private filter: Filter;

  constructor() {
    super();
    this.filter = new Filter();
    
    // Add Polish profanities and threatening words
    const wordsToAdd = [
      // Polish profanities (obscured with * to avoid offensiveness)
      'k*rwa', 'ch*j', 'p*erdole', 'j*bać', 'p*zda', 'sk*rwysyn', 
      // Threatening words
      'zabije', 'zabiję', 'zabić', 'śmierć', 'grożę', 'groźba', 'nienawidzę', 'nienawiść'
    ];
    
    wordsToAdd.forEach(word => this.filter.addWords(word));
  }

  async moderateContent(content: string): Promise<ModerationResult> {
    try {
      return await moderateContent(content);
    } catch (error) {
      console.error('OpenAI moderation error:', error);
      // Fallback to basic checks if OpenAI fails
      return {
        isSafe: !this.isProfane(content) && !this.containsSuspiciousPatterns(content),
        reasons: ['OpenAI moderation unavailable, using basic checks'],
        confidence: 0.5
      };
    }
  }

  async moderateEmail(email: string): Promise<ModerationResult> {
    const suspiciousEmailPatterns = [
      /@example\.com$/i,
      /@test\.com$/i,
      /^admin@/i,
      /^root@/i,
      /^postmaster@/i,
      /^webmaster@/i
    ];

    const isSuspicious = suspiciousEmailPatterns.some(pattern => pattern.test(email));
    
    if (isSuspicious) {
      return {
        isSafe: false,
        reasons: ['Email appears to be from a suspicious or test domain'],
        confidence: 0.8
      };
    }

    return {
      isSafe: true,
      reasons: [],
      confidence: 0.9
    };
  }

  isProfane(content: string): boolean {
    return this.filter.isProfane(content);
  }

  containsSuspiciousPatterns(content: string): boolean {
    const suspiciousPatterns = [
      /<script>/i,
      /http:\/\/|https:\/\//i, // URLs might be spam
      /\[url=/i,
      /\[link=/i,
      /viagra|cialis|pill|casino|crypto|bitcoin|lottery|winner|nigerian/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(content));
  }
} 