import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DisbursementManager } from '@/components/disbursement-manager';

// Mock fetch
global.fetch = jest.fn();

describe('DisbursementManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate unique task numbers', () => {
    render(<DisbursementManager />);
    
    // Open create dialog
    const createButton = screen.getByText('Create Disbursement');
    fireEvent.click(createButton);
    
    // Check if task number field is present
    const taskNumberField = screen.getByLabelText('Task Number');
    expect(taskNumberField).toBeInTheDocument();
    
    // Check if generate button is present
    const generateButton = screen.getByRole('button', { name: /hash/i });
    expect(generateButton).toBeInTheDocument();
  });

  it('should show transaction details preview when task ID is entered', async () => {
    render(<DisbursementManager />);
    
    // Open create dialog
    const createButton = screen.getByText('Create Disbursement');
    fireEvent.click(createButton);
    
    // Enter task ID
    const taskIdField = screen.getByLabelText('Task ID');
    fireEvent.change(taskIdField, { target: { value: 'test-task-id' } });
    
    // Check if transaction details preview appears
    await waitFor(() => {
      expect(screen.getByText('Transaction Details Preview')).toBeInTheDocument();
    });
  });

  it('should auto-generate task number when task ID is entered', async () => {
    render(<DisbursementManager />);
    
    // Open create dialog
    const createButton = screen.getByText('Create Disbursement');
    fireEvent.click(createButton);
    
    // Enter task ID
    const taskIdField = screen.getByLabelText('Task ID');
    fireEvent.change(taskIdField, { target: { value: 'test-task-id' } });
    
    // Check if task number is auto-generated
    await waitFor(() => {
      const taskNumberField = screen.getByLabelText('Task Number') as HTMLInputElement;
      expect(taskNumberField.value).toMatch(/^TASK-\d{6}-[A-Z0-9]{4}$/);
    });
  });
}); 