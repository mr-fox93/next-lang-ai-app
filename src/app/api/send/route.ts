import { getSendContactEmailUseCase } from '@/lib/container'
import { z } from 'zod'

// Content validation schema
const messageSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email format"),
  message: z.string().min(5, "Message is too short").max(5000, "Message is too long")
});

// Simple rate limiting (in production, use Redis or similar)
const emailRequestsMap: Record<string, number> = {};
const MAX_REQUESTS = 5;
const TIME_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

export async function POST(request: Request) {
  try {
    // Get form data
    const formData = await request.json();

    // Validate inputs with Zod
    try {
      messageSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
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

    // Simple rate limiting check
    const currentTime = Date.now();
    const userKey = `${email.toLowerCase()}_${currentTime - (currentTime % TIME_WINDOW)}`;
    
    emailRequestsMap[userKey] = (emailRequestsMap[userKey] || 0) + 1;
    
    if (emailRequestsMap[userKey] > MAX_REQUESTS) {
      return Response.json({ 
        error: { 
          message: "Too many messages sent. Please try again later.", 
          statusCode: 429 
        } 
      }, { status: 429 });
    }

    // Use the SendContactEmailUseCase
    const sendContactEmailUseCase = getSendContactEmailUseCase();
    
    const result = await sendContactEmailUseCase.execute({
      name,
      email,
      message
    });

    if (!result.success) {
      return Response.json({ 
        error: { 
          message: result.error || "Failed to send message",
          statusCode: 400,
          detail: result.details
        } 
      }, { status: 400 });
    }

    return Response.json({ 
      success: true, 
      data: { message: "Message sent successfully" }
    });
  } catch (error) {
    console.error('Error in contact form handler:', error);
    return Response.json({ 
      error: { 
        message: "Internal server error", 
        statusCode: 500,
        detail: error instanceof Error ? error.message : "Unknown error"
      } 
    }, { status: 500 });
  }
}
