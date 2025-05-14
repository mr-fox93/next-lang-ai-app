import { Resend } from 'resend';
import { EmailTemplate } from '@/components/email-template';
import * as React from 'react';

// Inicjalizacja Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  console.log("Received contact form submission");
  try {
    // Pobierz dane z formularza
    const { name, email, message } = await request.json();
    console.log("Form data:", { name, email: email.substring(0, 3) + "...", messageLength: message.length });

    // Podstawowa walidacja
    if (!name || !email || !message) {
      console.log("Validation failed: missing fields");
      return Response.json({ 
        error: { 
          message: "Missing required fields", 
          statusCode: 400 
        } 
      }, { status: 400 });
    }

    // Główna wiadomość do administratora
    console.log("Sending email via Resend...");
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

    console.log("Email send result:", emailResult);

    // Sprawdź błędy
    if (emailResult.error) {
      console.error('Error sending email:', emailResult.error);
      return Response.json({ error: emailResult.error }, { status: 500 });
    }

    // Zwróć sukces
    console.log("Email sent successfully");
    return Response.json({ 
      success: true, 
      data: emailResult.data
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