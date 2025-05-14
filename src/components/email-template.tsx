import * as React from 'react';

interface EmailTemplateProps {
  firstName: string;
  userEmail?: string;
  userMessage?: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  userEmail,
  userMessage
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px', color: '#333' }}>
    <h1 style={{ color: '#8b5cf6', marginBottom: '20px' }}>New Contact Form Message</h1>
    <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '10px' }}>
      <strong>From:</strong> {firstName} {userEmail ? `(${userEmail})` : ''}
    </p>
    
    {userMessage && (
      <>
        <h2 style={{ color: '#8b5cf6', fontSize: '18px', marginTop: '20px' }}>Message:</h2>
        <div style={{ 
          backgroundColor: '#f9f7ff', 
          padding: '15px', 
          borderRadius: '5px',
          border: '1px solid #e2d8fd',
          marginTop: '10px',
          whiteSpace: 'pre-wrap'
        }}>
          {userMessage}
        </div>
      </>
    )}
    
    <div style={{ marginTop: '30px', padding: '15px', borderTop: '1px solid #eee', fontSize: '14px', color: '#666' }}>
      <p>This email was sent from the Flashcards AI contact form.</p>
    </div>
  </div>
);