export interface SignInFormProps {
  redirectUrl?: string;
}

export interface SignUpFormProps {
  redirectUrl?: string;
}

export interface ResetPasswordFormProps {
  onBack?: () => void;
}

export interface ForgotPasswordFormProps {
  onBack?: () => void;
}

export interface PasswordValidationRules {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars?: boolean;
}

export interface ResetPasswordState {
  password: string;
  confirmPassword: string;
  loading: boolean;
  error: string | null;
  success: boolean;
  attemptCount: number;
} 