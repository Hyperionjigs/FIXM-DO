import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Mock successful login
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '123',
            email: 'test@example.com',
            name: 'Test User'
          },
          token: 'mock-jwt-token'
        })
      });
    });

    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(/welcome test user/i)).toBeVisible();
  });

  test('should navigate to registration page', async ({ page }) => {
    await page.getByRole('link', { name: /create account/i }).click();
    await expect(page).toHaveURL('/register');
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.getByRole('link', { name: /forgot password/i }).click();
    await expect(page).toHaveURL('/forgot-password');
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
  });
});

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display registration form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    await page.getByLabel(/full name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('weak');
    
    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible();
  });

  test('should validate password confirmation', async ({ page }) => {
    await page.getByLabel(/full name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByLabel(/confirm password/i).fill('differentpassword');
    
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('should successfully register new user', async ({ page }) => {
    // Mock successful registration
    await page.route('**/api/auth/register', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '123',
            email: 'newuser@example.com',
            name: 'New User'
          },
          token: 'mock-jwt-token'
        })
      });
    });

    await page.getByLabel(/full name/i).fill('New User');
    await page.getByLabel(/email/i).fill('newuser@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByLabel(/confirm password/i).fill('password123');
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Should redirect to verification page
    await expect(page).toHaveURL('/verify');
    await expect(page.getByText(/please verify your email/i)).toBeVisible();
  });
});

test.describe('Password Reset Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password');
  });

  test('should display password reset form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();
  });

  test('should send reset email successfully', async ({ page }) => {
    // Mock successful email send
    await page.route('**/api/auth/forgot-password', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Reset email sent successfully'
        })
      });
    });

    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();
    
    await expect(page.getByText(/reset email sent successfully/i)).toBeVisible();
  });
});

test.describe('Logout Flow', () => {
  test('should logout successfully', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('auth-token', 'mock-token');
    });

    await page.goto('/dashboard');
    
    // Click logout button
    await page.getByRole('button', { name: /logout/i }).click();
    
    // Should redirect to login page
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });
}); 