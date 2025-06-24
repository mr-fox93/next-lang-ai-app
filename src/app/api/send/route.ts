import { Resend } from 'resend';
import { EmailTemplate } from '@/components/email-template';
import * as React from 'react';
import { z } from 'zod';
import { Filter } from 'bad-words';
import { moderateContent } from '@/lib/openai-moderation';
import { debugLog, debugError } from '@/utils/debug';

// Inicjalizacja Resend
const resend = new Resend(process.env.RESEND_API_KEY);



// Content validation schema
const messageSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email format"),
  message: z.string().min(5, "Message is too short").max(5000, "Message is too long")
});

// Initialize profanity filter
const filter = new Filter();
filter.addWords(
  // Polish profanities (obscured with * to avoid offensiveness)
  'k*rwa', 'ch*j', 'p*erdole', 'j*bać', 'p*zda', 'sk*rwysyn', 
  // Threatening words
  'zabije', 'zabiję', 'zabić', 'śmierć', 'grożę', 'groźba', 'nienawidzę', 'nienawiść'
);

export async function POST(request: Request) {
  debugLog("Received contact form submission");
  try {
    // Pobierz dane z formularza
    const formData = await request.json();
    debugLog("Form data:", { 
      name: formData.name, 
      email: formData.email ? `${formData.email.substring(0, 3)}...` : 'missing', 
      messageLength: formData.message ? formData.message.length : 0 
    });

    // Validate inputs with Zod
    try {
      messageSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        debugLog("Validation failed:", error.errors);
        return Response.json({ 
          error: { 
            message: error.errors[0].message, 
            statusCode: 400,
            fieldErrors: error.errors 
          } 
        }, { status: 400 });
      }
    }

    const { name, email, message } = formData;

    // Simple initial check with bad-words filter
    if (filter.isProfane(message)) {
      debugLog("Offensive content detected by basic filter");
      return Response.json({ 
        error: { 
          message: "We couldn't send your message",
          statusCode: 400,
          detail: "Please review your message for appropriate language and try again."
        } 
      }, { status: 400 });
    }

    // Advanced AI-powered moderation check
    debugLog("Running AI content moderation...");
    const moderationResult = await moderateContent(message);
    
    if (!moderationResult.isSafe) {
      debugLog("AI moderation flagged content:", moderationResult.reasons);
      
      // Tworzenie bardziej pomocnego komunikatu dla użytkownika
      const detailMessage = moderationResult.reasons[0].includes("Content flagged for:") 
        ? "Our system detected content that might not be appropriate for the contact form. Please ensure your message focuses on technical issues, questions, or feedback about the application."
        : moderationResult.reasons[0];
        
      return Response.json({ 
        error: { 
          message: "Message cannot be sent",
          statusCode: 400,
          detail: detailMessage
        } 
      }, { status: 400 });
    }
    
    debugLog("Content passed AI moderation check");

    // Sprawdź czy email ma podejrzany format (dodatkowe zabezpieczenie)
    const suspiciousEmailPatterns = [
      /@example\.com$/i,
      /@test\.com$/i,
      /^admin@/i,
      /^root@/i,
      /^postmaster@/i,
      /^webmaster@/i
    ];

    if (suspiciousEmailPatterns.some(pattern => pattern.test(email))) {
      debugLog("Suspicious email detected:", email.substring(0, 3) + "...");
      return Response.json({ 
        error: { 
          message: "Invalid email address", 
          statusCode: 400 
        } 
      }, { status: 400 });
    }

    // Check for suspicious message patterns (automated spam, scripts, etc.)
    const suspiciousPatterns = [
      /<script>/i,
      /http:\/\/|https:\/\//i, // URLs might be spam
      /\[url=/i,
      /\[link=/i,
      /viagra|cialis|pill|casino|crypto|bitcoin|lottery|winner|nigerian/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(message))) {
      debugLog("Suspicious content detected");
      return Response.json({ 
        error: { 
          message: "Message contains suspicious content",
          statusCode: 400,
          detail: "Your message appears to contain promotional or suspicious content. Please remove any links or promotional material."
        } 
      }, { status: 400 });
    }

    // Rate limiting check
    // Note: In a production environment, you should use Redis or a similar solution
    // This is a minimal implementation that won't persist between serverless function invocations
    const MAX_REQUESTS = 5;
    const TIME_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

    // Simple in-memory store (will not persist between API calls in serverless environment)
    // This is just for demonstration purposes
    const emailRequestsMap: Record<string, number> = {};
    
    const currentTime = Date.now();
    const userKey = `${email.toLowerCase()}_${currentTime - (currentTime % TIME_WINDOW)}`;
    
    // Increment request count (default to 0 if not yet set)
    emailRequestsMap[userKey] = (emailRequestsMap[userKey] || 0) + 1;
    
    if (emailRequestsMap[userKey] > MAX_REQUESTS) {
      debugLog("Rate limit exceeded for:", email.substring(0, 3) + "...");
      return Response.json({ 
        error: { 
          message: "Too many messages sent. Please try again later.", 
          statusCode: 429 
        } 
      }, { status: 429 });
    }

    // Główna wiadomość do administratora
    debugLog("Sending email via Resend...");
    const emailResult = await resend.emails.send({
      from: 'Flashcards AI <onboarding@resend.dev>',
      to: ['lisieckikamil93@gmail.com'],
      subject: `New contact message from ${name}`,
      react: React.createElement(EmailTemplate, { 
        firstName: name,
        userEmail: email,
        userMessage: message
      }),
      replyTo: email,
    });

    debugLog("Email send result:", emailResult);

    // Sprawdź błędy
    if (emailResult.error) {
      debugError('Error sending email:', emailResult.error);
      return Response.json({ error: emailResult.error }, { status: 500 });
    }

    // Zwróć sukces
    debugLog("Email sent successfully");
    return Response.json({ 
      success: true, 
      data: emailResult.data
    });
  } catch (error) {
    debugError('Error in contact form handler:', error);
    return Response.json({ 
      error: { 
        message: "Internal server error", 
        statusCode: 500,
        detail: error instanceof Error ? error.message : "Unknown error"
      } 
    }, { status: 500 });
  }
}
