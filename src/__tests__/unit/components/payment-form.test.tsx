import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaymentForm } from '@/components/payment-form'
import { usePayments } from '@/hooks/use-payments'

// Mock the payments hook
jest.mock('@/hooks/use-payments')
const mockUsePayments = usePayments as jest.MockedFunction<typeof usePayments>

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe('PaymentForm', () => {
  const mockPaymentData = {
    amount: 1000,
    currency: 'PHP',
    paymentMethod: 'gcash',
    description: 'Test payment',
  }

  const mockHandlePayment = jest.fn()
  const mockIsLoading = false
  const mockError = null

  beforeEach(() => {
    mockUsePayments.mockReturnValue({
      handlePayment: mockHandlePayment,
      isLoading: mockIsLoading,
      error: mockError,
      paymentMethods: [
        { id: 'gcash', name: 'GCash', icon: 'gcash-icon' },
        { id: 'paymaya', name: 'PayMaya', icon: 'paymaya-icon' },
        { id: 'gotyme', name: 'GoTyme', icon: 'gotyme-icon' },
      ],
      selectedMethod: 'gcash',
      setSelectedMethod: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders payment form with all required fields', () => {
    render(<PaymentForm />)

    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/payment method/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /pay now/i })).toBeInTheDocument()
  })

  it('displays payment method options', () => {
    render(<PaymentForm />)

    expect(screen.getByText('GCash')).toBeInTheDocument()
    expect(screen.getByText('PayMaya')).toBeInTheDocument()
    expect(screen.getByText('GoTyme')).toBeInTheDocument()
  })

  it('validates required fields before submission', async () => {
    const user = userEvent.setup()
    render(<PaymentForm />)

    const submitButton = screen.getByRole('button', { name: /pay now/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/amount is required/i)).toBeInTheDocument()
    })
  })

  it('validates amount is positive', async () => {
    const user = userEvent.setup()
    render(<PaymentForm />)

    const amountInput = screen.getByLabelText(/amount/i)
    await user.type(amountInput, '-100')

    const submitButton = screen.getByRole('button', { name: /pay now/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/amount must be positive/i)).toBeInTheDocument()
    })
  })

  it('validates amount format', async () => {
    const user = userEvent.setup()
    render(<PaymentForm />)

    const amountInput = screen.getByLabelText(/amount/i)
    await user.type(amountInput, '100.123')

    const submitButton = screen.getByRole('button', { name: /pay now/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/amount must have maximum 2 decimal places/i)).toBeInTheDocument()
    })
  })

  it('submits payment with valid data', async () => {
    const user = userEvent.setup()
    render(<PaymentForm />)

    // Fill in the form
    const amountInput = screen.getByLabelText(/amount/i)
    const descriptionInput = screen.getByLabelText(/description/i)

    await user.type(amountInput, '1000')
    await user.type(descriptionInput, 'Test payment')

    const submitButton = screen.getByRole('button', { name: /pay now/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockHandlePayment).toHaveBeenCalledWith({
        amount: 1000,
        currency: 'PHP',
        paymentMethod: 'gcash',
        description: 'Test payment',
      })
    })
  })

  it('shows loading state during payment processing', () => {
    mockUsePayments.mockReturnValue({
      handlePayment: mockHandlePayment,
      isLoading: true,
      error: null,
      paymentMethods: [
        { id: 'gcash', name: 'GCash', icon: 'gcash-icon' },
      ],
      selectedMethod: 'gcash',
      setSelectedMethod: jest.fn(),
    })

    render(<PaymentForm />)

    const submitButton = screen.getByRole('button', { name: /pay now/i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/processing payment/i)).toBeInTheDocument()
  })

  it('displays error message when payment fails', () => {
    const errorMessage = 'Payment failed. Please try again.'
    mockUsePayments.mockReturnValue({
      handlePayment: mockHandlePayment,
      isLoading: false,
      error: errorMessage,
      paymentMethods: [
        { id: 'gcash', name: 'GCash', icon: 'gcash-icon' },
      ],
      selectedMethod: 'gcash',
      setSelectedMethod: jest.fn(),
    })

    render(<PaymentForm />)

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('allows changing payment method', async () => {
    const user = userEvent.setup()
    const mockSetSelectedMethod = jest.fn()
    
    mockUsePayments.mockReturnValue({
      handlePayment: mockHandlePayment,
      isLoading: false,
      error: null,
      paymentMethods: [
        { id: 'gcash', name: 'GCash', icon: 'gcash-icon' },
        { id: 'paymaya', name: 'PayMaya', icon: 'paymaya-icon' },
      ],
      selectedMethod: 'gcash',
      setSelectedMethod: mockSetSelectedMethod,
    })

    render(<PaymentForm />)

    const paymayaOption = screen.getByText('PayMaya')
    await user.click(paymayaOption)

    expect(mockSetSelectedMethod).toHaveBeenCalledWith('paymaya')
  })

  it('formats amount input correctly', async () => {
    const user = userEvent.setup()
    render(<PaymentForm />)

    const amountInput = screen.getByLabelText(/amount/i)
    await user.type(amountInput, '1234567')

    expect(amountInput).toHaveValue('1,234,567')
  })

  it('handles currency selection', async () => {
    const user = userEvent.setup()
    render(<PaymentForm />)

    const currencySelect = screen.getByLabelText(/currency/i)
    await user.selectOptions(currencySelect, 'USD')

    expect(currencySelect).toHaveValue('USD')
  })

  it('validates description length', async () => {
    const user = userEvent.setup()
    render(<PaymentForm />)

    const descriptionInput = screen.getByLabelText(/description/i)
    const longDescription = 'a'.repeat(256)
    await user.type(descriptionInput, longDescription)

    const submitButton = screen.getByRole('button', { name: /pay now/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/description must be less than 255 characters/i)).toBeInTheDocument()
    })
  })

  it('shows payment method icons', () => {
    render(<PaymentForm />)

    const gcashIcon = screen.getByAltText('GCash icon')
    const paymayaIcon = screen.getByAltText('PayMaya icon')
    const gotymeIcon = screen.getByAltText('GoTyme icon')

    expect(gcashIcon).toBeInTheDocument()
    expect(paymayaIcon).toBeInTheDocument()
    expect(gotymeIcon).toBeInTheDocument()
  })

  it('handles form reset after successful payment', async () => {
    const user = userEvent.setup()
    render(<PaymentForm />)

    // Fill and submit form
    const amountInput = screen.getByLabelText(/amount/i)
    const descriptionInput = screen.getByLabelText(/description/i)

    await user.type(amountInput, '1000')
    await user.type(descriptionInput, 'Test payment')

    const submitButton = screen.getByRole('button', { name: /pay now/i })
    await user.click(submitButton)

    // Mock successful payment
    mockHandlePayment.mockResolvedValueOnce({ success: true })

    await waitFor(() => {
      expect(amountInput).toHaveValue('')
      expect(descriptionInput).toHaveValue('')
    })
  })

  it('prevents multiple submissions', async () => {
    const user = userEvent.setup()
    render(<PaymentForm />)

    // Fill form
    const amountInput = screen.getByLabelText(/amount/i)
    const descriptionInput = screen.getByLabelText(/description/i)

    await user.type(amountInput, '1000')
    await user.type(descriptionInput, 'Test payment')

    const submitButton = screen.getByRole('button', { name: /pay now/i })
    
    // Click multiple times
    await user.click(submitButton)
    await user.click(submitButton)
    await user.click(submitButton)

    // Should only be called once
    expect(mockHandlePayment).toHaveBeenCalledTimes(1)
  })

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup()
    mockHandlePayment.mockRejectedValueOnce(new Error('Network error'))

    render(<PaymentForm />)

    // Fill and submit form
    const amountInput = screen.getByLabelText(/amount/i)
    const descriptionInput = screen.getByLabelText(/description/i)

    await user.type(amountInput, '1000')
    await user.type(descriptionInput, 'Test payment')

    const submitButton = screen.getByRole('button', { name: /pay now/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  it('validates minimum payment amount', async () => {
    const user = userEvent.setup()
    render(<PaymentForm />)

    const amountInput = screen.getByLabelText(/amount/i)
    await user.type(amountInput, '0.01')

    const submitButton = screen.getByRole('button', { name: /pay now/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/minimum payment amount is 1.00/i)).toBeInTheDocument()
    })
  })

  it('validates maximum payment amount', async () => {
    const user = userEvent.setup()
    render(<PaymentForm />)

    const amountInput = screen.getByLabelText(/amount/i)
    await user.type(amountInput, '1000000')

    const submitButton = screen.getByRole('button', { name: /pay now/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/maximum payment amount is 100,000/i)).toBeInTheDocument()
    })
  })
}) 