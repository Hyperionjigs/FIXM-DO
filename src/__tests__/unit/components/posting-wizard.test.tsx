import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PostingWizard } from '@/components/posting-wizard';

// Mock the form schema and dependencies
jest.mock('@/lib/content-quality', () => ({
  createEnhancedFormSchema: () => ({
    parse: jest.fn(),
    safeParse: jest.fn(),
  }),
  assessContentQuality: jest.fn(() => ({
    isValid: true,
    score: 0.8,
    issues: [],
    suggestions: [],
    requiresModeration: false,
  })),
}));

jest.mock('@/ai/flows/suggest-details-flow', () => ({
  suggestDetails: jest.fn(() => Promise.resolve({
    category: 'Test Category',
    description: 'Test description',
  })),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('PostingWizard Payment Method', () => {
  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display payment method selection in step 3', () => {
    render(
      <PostingWizard
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        canPost={true}
      />
    );

    // Navigate to step 3
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton); // Step 1 -> Step 2
    fireEvent.click(nextButton); // Step 2 -> Step 3

    // Check if payment method section is displayed
    expect(screen.getByText('How do you want to pay?')).toBeInTheDocument();
    expect(screen.getByText('GCash')).toBeInTheDocument();
    expect(screen.getByText('PayMaya')).toBeInTheDocument();
    expect(screen.getByText('GoTyme')).toBeInTheDocument();
  });

  it('should change payment method label based on post type', () => {
    render(
      <PostingWizard
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        canPost={true}
      />
    );

    // Select service type
    const serviceRadio = screen.getByLabelText('I am offering my help');
    fireEvent.click(serviceRadio);

    // Navigate to step 3
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton); // Step 1 -> Step 2
    fireEvent.click(nextButton); // Step 2 -> Step 3

    // Check if label changes for service
    expect(screen.getByText('How do you want to receive payment?')).toBeInTheDocument();
  });

  it('should allow selecting different payment methods', () => {
    render(
      <PostingWizard
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        canPost={true}
      />
    );

    // Navigate to step 3
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton); // Step 1 -> Step 2
    fireEvent.click(nextButton); // Step 2 -> Step 3

    // Select PayMaya
    const paymayaRadio = screen.getByLabelText(/PayMaya/);
    fireEvent.click(paymayaRadio);

    // Verify PayMaya is selected
    expect(paymayaRadio).toBeChecked();
  });

  it('should include payment method in form submission', async () => {
    render(
      <PostingWizard
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        canPost={true}
      />
    );

    // Fill out the form
    const titleInput = screen.getByPlaceholderText(/task/i);
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });

    // Navigate through steps
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton); // Step 1 -> Step 2

    // Fill category and description
    const descriptionInput = screen.getByPlaceholderText(/requirements/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

    fireEvent.click(nextButton); // Step 2 -> Step 3

    // Fill location and budget
    const locationInput = screen.getByPlaceholderText(/Makati/i);
    fireEvent.change(locationInput, { target: { value: 'Makati' } });

    const budgetInput = screen.getByPlaceholderText(/1500/i);
    fireEvent.change(budgetInput, { target: { value: '1500' } });

    // Select payment method
    const paymayaRadio = screen.getByLabelText(/PayMaya/);
    fireEvent.click(paymayaRadio);

    fireEvent.click(nextButton); // Step 3 -> Step 4

    // Submit the form
    const submitButton = screen.getByText('Submit Post');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: 'paymaya',
        })
      );
    });
  });
}); 