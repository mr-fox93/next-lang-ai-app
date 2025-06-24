import { PasswordValidationRules } from '@/types/auth';

export const defaultPasswordRules: PasswordValidationRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
};

export function validatePassword(password: string, rules: PasswordValidationRules = defaultPasswordRules): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < rules.minLength) {
    errors.push(`Password must be at least ${rules.minLength} characters long`);
  }

  if (rules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (rules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (rules.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (rules.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function sanitizePassword(password: string): string {
  // Remove any control characters but keep printable special chars
  return password.replace(/[\x00-\x1F\x7F]/g, '');
} 