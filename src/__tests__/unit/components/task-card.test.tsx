import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from '@/components/task-card';
import { useVerificationStatus } from '@/hooks/use-verification-status';
import { useRouter } from 'next/navigation';

// Mock the hooks
jest.mock('@/hooks/use-verification-status');
jest.mock('next/navigation');

const mockUseVerificationStatus = useVerificationStatus as jest.MockedFunction<typeof useVerificationStatus>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Mock task data
const mockTask = {
  id: 'task-1',
  title: 'I need my house walls painted',
  description: 'Looking for a professional painter to paint my house walls',
  location: 'Cebu City',
  category: 'Home Services' as const,
  type: 'task' as const,
  pay: 5000,
  paymentMethod: 'gcash' as const,
  status: 'open',
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'user-1',
  images: [],
  tags: []
};

describe('TaskCard', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any);
  });

  it('should render task card with full amount for verified users', () => {
    mockUseVerificationStatus.mockReturnValue({
      isVerified: true,
      loading: false,
      registrationStatus: {
        isAuthenticated: true,
        isRegistered: true,
        isVerificationComplete: true,
        isRegistrationComplete: true,
        nextStep: 'none'
      },
      isPending: false,
      canPost: true,
      verificationData: null,
      selfieVerified: true,
      idDocumentVerified: true,
      checkVerificationStatus: jest.fn(),
      updateVerificationStatus: jest.fn(),
      checkUserRegistrationStatus: jest.fn(),
    });

    render(<TaskCard task={mockTask} />);
    
    expect(screen.getByText('₱5,000')).toBeInTheDocument();
    expect(screen.queryByText('Sign up to view')).not.toBeInTheDocument();
    expect(screen.queryByText('Click to verify')).not.toBeInTheDocument();
  });

  it('should render blurred amount for unregistered users and redirect to signup on click', () => {
    mockUseVerificationStatus.mockReturnValue({
      isVerified: false,
      loading: false,
      registrationStatus: {
        isAuthenticated: false,
        isRegistered: false,
        isVerificationComplete: false,
        isRegistrationComplete: false,
        nextStep: 'register'
      },
      isPending: false,
      canPost: false,
      verificationData: null,
      selfieVerified: false,
      idDocumentVerified: false,
      checkVerificationStatus: jest.fn(),
      updateVerificationStatus: jest.fn(),
      checkUserRegistrationStatus: jest.fn(),
    });

    render(<TaskCard task={mockTask} />);
    
    // Amount should be blurred but still visible
    expect(screen.getByText('₱5,000')).toBeInTheDocument();
    expect(screen.getByText('Sign up to view')).toBeInTheDocument();
    
    // Click on the blurred amount
    const amountContainer = screen.getByText('₱5,000').closest('div');
    fireEvent.click(amountContainer!);
    
    expect(mockPush).toHaveBeenCalledWith('/signup');
  });

  it('should redirect incomplete registration users to signup with step parameter', () => {
    mockUseVerificationStatus.mockReturnValue({
      isVerified: false,
      loading: false,
      registrationStatus: {
        isAuthenticated: true,
        isRegistered: false,
        isVerificationComplete: false,
        isRegistrationComplete: false,
        nextStep: 'complete-registration',
        registrationStep: 2
      },
      isPending: false,
      canPost: false,
      verificationData: null,
      selfieVerified: false,
      idDocumentVerified: false,
      checkVerificationStatus: jest.fn(),
      updateVerificationStatus: jest.fn(),
      checkUserRegistrationStatus: jest.fn(),
    });

    render(<TaskCard task={mockTask} />);
    
    expect(screen.getByText('Complete registration to view')).toBeInTheDocument();
    
    // Click on the blurred amount
    const amountContainer = screen.getByText('₱5,000').closest('div');
    fireEvent.click(amountContainer!);
    
    expect(mockPush).toHaveBeenCalledWith('/signup?step=2');
  });

  it('should show verification modal for registered but unverified users', () => {
    mockUseVerificationStatus.mockReturnValue({
      isVerified: false,
      loading: false,
      registrationStatus: {
        isAuthenticated: true,
        isRegistered: true,
        isVerificationComplete: false,
        isRegistrationComplete: true,
        nextStep: 'verify'
      },
      isPending: false,
      canPost: false,
      verificationData: null,
      selfieVerified: false,
      idDocumentVerified: false,
      checkVerificationStatus: jest.fn(),
      updateVerificationStatus: jest.fn(),
      checkUserRegistrationStatus: jest.fn(),
    });

    render(<TaskCard task={mockTask} />);
    
    expect(screen.getByText('Click to verify')).toBeInTheDocument();
    
    // Click on the blurred amount
    const amountContainer = screen.getByText('₱5,000').closest('div');
    fireEvent.click(amountContainer!);
    
    // Should not redirect, but show verification modal
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should redirect unregistered users to signup when clicking view button', () => {
    mockUseVerificationStatus.mockReturnValue({
      isVerified: false,
      loading: false,
      registrationStatus: {
        isAuthenticated: false,
        isRegistered: false,
        isVerificationComplete: false,
        isRegistrationComplete: false,
        nextStep: 'register'
      },
      isPending: false,
      canPost: false,
      verificationData: null,
      selfieVerified: false,
      idDocumentVerified: false,
      checkVerificationStatus: jest.fn(),
      updateVerificationStatus: jest.fn(),
      checkUserRegistrationStatus: jest.fn(),
    });

    render(<TaskCard task={mockTask} />);
    
    // Click on the view button
    const viewButton = screen.getByText('View');
    fireEvent.click(viewButton);
    
    expect(mockPush).toHaveBeenCalledWith('/signup');
  });

  it('should allow verified users to navigate to task details when clicking view button', () => {
    mockUseVerificationStatus.mockReturnValue({
      isVerified: true,
      loading: false,
      registrationStatus: {
        isAuthenticated: true,
        isRegistered: true,
        isVerificationComplete: true,
        isRegistrationComplete: true,
        nextStep: 'none'
      },
      isPending: false,
      canPost: true,
      verificationData: null,
      selfieVerified: true,
      idDocumentVerified: true,
      checkVerificationStatus: jest.fn(),
      updateVerificationStatus: jest.fn(),
      checkUserRegistrationStatus: jest.fn(),
    });

    render(<TaskCard task={mockTask} />);
    
    // View button should be a link for verified users
    const viewButton = screen.getByText('View').closest('a');
    expect(viewButton).toHaveAttribute('href', '/post/task-1');
  });

  it('should show loading state correctly', () => {
    mockUseVerificationStatus.mockReturnValue({
      isVerified: false,
      loading: true,
      registrationStatus: {
        isAuthenticated: false,
        isRegistered: false,
        isVerificationComplete: false,
        isRegistrationComplete: false,
        nextStep: 'register'
      },
      isPending: false,
      canPost: false,
      verificationData: null,
      selfieVerified: false,
      idDocumentVerified: false,
      checkVerificationStatus: jest.fn(),
      updateVerificationStatus: jest.fn(),
      checkUserRegistrationStatus: jest.fn(),
    });

    render(<TaskCard task={mockTask} />);
    
    // Should not show any verification-related text during loading
    expect(screen.queryByText('Sign up to view')).not.toBeInTheDocument();
    expect(screen.queryByText('Click to verify')).not.toBeInTheDocument();
  });
}); 