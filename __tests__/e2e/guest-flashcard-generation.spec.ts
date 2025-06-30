import { test, expect } from '@playwright/test';

test.describe('Guest Flashcard Generation', () => {
  test('should generate flashcards for guest user and redirect to guest-flashcard page', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page).toHaveTitle(/Languito/);
    
    // Find and fill the textarea with some text
    const textarea = page.getByRole('textbox');
    await textarea.fill('kot, pies, dom, samochód, książka');
    
    // Find and click the Generate Flashcards button
    const generateButton = page.getByRole('button', { name: /generate/i });
    await expect(generateButton).toBeEnabled();
    await generateButton.click();
    
    // For guest users, reCAPTCHA should appear and we should eventually be redirected to guest-flashcard
    // Wait for navigation to guest-flashcard page (allowing for reCAPTCHA processing)
    await expect(page).toHaveURL(/\/en\/guest-flashcard/, { timeout: 30000 });
    
    // Verify we're on the guest flashcard page
    await expect(page.url()).toContain('/en/guest-flashcard');
  });
}); 