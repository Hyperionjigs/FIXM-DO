import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/use-auth'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'

// Mock Firebase auth
jest.mock('firebase/auth')

const mockSignInWithEmailAndPassword = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>
const mockCreateUserWithEmailAndPassword = createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>
const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with loading state and no user', () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null)
        return jest.fn()
      })

      const { result } = renderHook(() => useAuth())

      expect(result.current.user).toBeNull()
      expect(result.current.loading).toBe(false)
    })
  })

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/avatar.jpg',
        emailVerified: true,
        metadata: {
          creationTime: '2023-01-01T00:00:00.000Z',
          lastSignInTime: '2023-01-01T00:00:00.000Z',
        },
      }

      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
        operationType: 'signIn',
        providerId: null,
      } as any)

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123')
      })

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      )
    })

    it('should handle sign in errors', async () => {
      const errorMessage = 'Invalid email or password'
      mockSignInWithEmailAndPassword.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        try {
          await result.current.signIn('invalid@example.com', 'wrongpassword')
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
          expect((error as Error).message).toBe(errorMessage)
        }
      })

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'invalid@example.com',
        'wrongpassword'
      )
    })
  })

  describe('signUp', () => {
    it('should successfully create a new user', async () => {
      const mockUser = {
        uid: 'new-user-uid',
        email: 'newuser@example.com',
        displayName: 'New User',
        photoURL: null,
        emailVerified: false,
        metadata: {
          creationTime: '2023-01-01T00:00:00.000Z',
          lastSignInTime: '2023-01-01T00:00:00.000Z',
        },
      }

      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
        operationType: 'signUp',
        providerId: null,
      } as any)

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.signUp('newuser@example.com', 'password123', 'New User')
      })

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'newuser@example.com',
        'password123'
      )
    })

    it('should handle sign up errors', async () => {
      const errorMessage = 'Email already in use'
      mockCreateUserWithEmailAndPassword.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        try {
          await result.current.signUp('existing@example.com', 'password123', 'Existing User')
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
          expect((error as Error).message).toBe(errorMessage)
        }
      })

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'existing@example.com',
        'password123'
      )
    })
  })

  describe('signOut', () => {
    it('should successfully sign out a user', async () => {
      mockSignOut.mockResolvedValue()

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.signOut()
      })

      expect(mockSignOut).toHaveBeenCalled()
    })

    it('should handle sign out errors', async () => {
      const errorMessage = 'Sign out failed'
      mockSignOut.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        try {
          await result.current.signOut()
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
          expect((error as Error).message).toBe(errorMessage)
        }
      })

      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  describe('auth state changes', () => {
    it('should update user state when auth state changes', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/avatar.jpg',
        emailVerified: true,
        metadata: {
          creationTime: '2023-01-01T00:00:00.000Z',
          lastSignInTime: '2023-01-01T00:00:00.000Z',
        },
      }

      let authCallback: (user: any) => void
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback
        return jest.fn()
      })

      const { result } = renderHook(() => useAuth())

      // Simulate user signing in
      act(() => {
        authCallback(mockUser)
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.loading).toBe(false)
      })

      // Simulate user signing out
      act(() => {
        authCallback(null)
      })

      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('validation', () => {
    it('should validate email format', async () => {
      const { result } = renderHook(() => useAuth())

      await act(async () => {
        try {
          await result.current.signIn('invalid-email', 'password123')
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
          expect((error as Error).message).toContain('Invalid email format')
        }
      })

      expect(mockSignInWithEmailAndPassword).not.toHaveBeenCalled()
    })

    it('should validate password length', async () => {
      const { result } = renderHook(() => useAuth())

      await act(async () => {
        try {
          await result.current.signUp('test@example.com', '123', 'Test User')
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
          expect((error as Error).message).toContain('Password must be at least 6 characters')
        }
      })

      expect(mockCreateUserWithEmailAndPassword).not.toHaveBeenCalled()
    })

    it('should validate display name', async () => {
      const { result } = renderHook(() => useAuth())

      await act(async () => {
        try {
          await result.current.signUp('test@example.com', 'password123', '')
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
          expect((error as Error).message).toContain('Display name is required')
        }
      })

      expect(mockCreateUserWithEmailAndPassword).not.toHaveBeenCalled()
    })
  })
}) 