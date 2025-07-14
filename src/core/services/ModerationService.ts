import { 
  ModerationService as IModerationService,
  ModerationResult
} from '@/core/interfaces/services/ModerationService';

export abstract class ModerationService implements IModerationService {
  abstract moderateContent(content: string): Promise<ModerationResult>;
  
  abstract moderateEmail(email: string): Promise<ModerationResult>;
  
  abstract isProfane(content: string): boolean;
  
  abstract containsSuspiciousPatterns(content: string): boolean;
} 