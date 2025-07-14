export interface ModerationResult {
  isSafe: boolean;
  reasons: string[];
  confidence?: number;
  categories?: string[];
}

export interface ModerationService {
  moderateContent(content: string): Promise<ModerationResult>;
  
  moderateEmail(email: string): Promise<ModerationResult>;
  
  isProfane(content: string): boolean;
  
  containsSuspiciousPatterns(content: string): boolean;
} 