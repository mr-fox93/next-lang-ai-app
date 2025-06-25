interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  action?: string;
  'error-codes'?: string[];
}

export async function verifyRecaptcha(token: string): Promise<{
  success: boolean;
  score?: number;
  error?: string;
}> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    return {
      success: false,
      error: 'reCAPTCHA configuration error'
    };
  }

  if (!token) {
    return {
      success: false,
      error: 'reCAPTCHA token is required'
    };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: RecaptchaResponse = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: `reCAPTCHA verification failed: ${data['error-codes']?.join(', ') || 'Unknown error'}`
      };
    }

    // For reCAPTCHA v3, check the score (0.0 = bot, 1.0 = human)
    // Typically, a score of 0.5 or higher is considered human
    const minScore = 0.5;
    if (data.score !== undefined && data.score < minScore) {
      return {
        success: false,
        score: data.score,
        error: `reCAPTCHA score too low: ${data.score}. This request appears to be automated.`
      };
    }

    return {
      success: true,
      score: data.score
    };
  } catch {
    return {
      success: false,
      error: 'Failed to verify reCAPTCHA'
    };
  }
} 