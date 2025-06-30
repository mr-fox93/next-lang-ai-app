import { test, expect } from '@playwright/test';

test.describe('Demo Mode', () => {
  test('should enter demo mode and redirect to flashcards page', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page).toHaveTitle(/Languito/);
    
    // Find and click the TRY DEMO button (with emoji from navbar)
    const tryDemoButton = page.getByText('✨ TRY DEMO');
    await expect(tryDemoButton).toBeVisible();
    await tryDemoButton.click();
    
    // Wait for navigation to flashcards page (demo mode has 1.5s delay + loading)
    await expect(page).toHaveURL(/\/en\/flashcards/, { timeout: 10000 });
    
    // Verify we're on the flashcards page
    await expect(page.url()).toContain('/en/flashcards');
  });
}); 