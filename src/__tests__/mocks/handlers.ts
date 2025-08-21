import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker'

// Mock data generators
const generateUser = () => ({
  uid: faker.string.uuid(),
  email: faker.internet.email(),
  displayName: faker.person.fullName(),
  photoURL: faker.image.avatar(),
  emailVerified: true,
  metadata: {
    creationTime: faker.date.past().toISOString(),
    lastSignInTime: faker.date.recent().toISOString(),
  },
})

const generatePost = () => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  budget: faker.number.int({ min: 10, max: 1000 }),
  location: faker.location.city(),
  category: faker.helpers.arrayElement(['cleaning', 'delivery', 'handyman', 'other']),
  status: faker.helpers.arrayElement(['open', 'in-progress', 'completed', 'cancelled']),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  userId: faker.string.uuid(),
  user: generateUser(),
})

const generateVerificationResult = () => ({
  success: faker.datatype.boolean(),
  confidence: faker.number.float({ min: 0, max: 1, precision: 0.01 }),
  details: {
    faceDetected: faker.datatype.boolean(),
    livenessScore: faker.number.float({ min: 0, max: 1, precision: 0.01 }),
    antiSpoofingScore: faker.number.float({ min: 0, max: 1, precision: 0.01 }),
    qualityScore: faker.number.float({ min: 0, max: 1, precision: 0.01 }),
    recommendations: faker.helpers.arrayElements([
      'Ensure good lighting',
      'Remove glasses',
      'Look directly at camera',
      'Stay still',
    ], { min: 0, max: 2 }),
  },
})

const generateIDValidationResult = () => ({
  isValid: faker.datatype.boolean(),
  confidence: faker.number.float({ min: 0, max: 1, precision: 0.01 }),
  documentType: faker.helpers.arrayElement(['government-id', 'company-id', 'passport']),
  extractedData: {
    name: faker.person.fullName(),
    dateOfBirth: faker.date.past().toISOString(),
    documentNumber: faker.string.alphanumeric(10),
    expiryDate: faker.date.future().toISOString(),
  },
  reasons: faker.datatype.boolean() ? [] : [
    'Document is expired',
    'Image quality is too low',
    'Document type not supported',
  ],
})

const generateTransactionLog = () => ({
  id: faker.string.uuid(),
  type: faker.helpers.arrayElement(['payment', 'verification', 'bonus', 'refund']),
  amount: faker.number.float({ min: 1, max: 1000, precision: 0.01 }),
          currency: 'PHP',
  status: faker.helpers.arrayElement(['pending', 'completed', 'failed', 'cancelled']),
  userId: faker.string.uuid(),
  metadata: {
    taskId: faker.string.uuid(),
    taskerId: faker.string.uuid(),
    clientId: faker.string.uuid(),
    description: faker.lorem.sentence(),
  },
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
})

export const handlers = [
  // Authentication endpoints
  http.post('/api/auth/signup', () => {
    return HttpResponse.json({
      success: true,
      user: generateUser(),
      message: 'User created successfully',
    })
  }),

  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      success: true,
      user: generateUser(),
      message: 'Login successful',
    })
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({
      success: true,
      message: 'Logout successful',
    })
  }),

  // Verification endpoints
  http.post('/api/verify-selfie', () => {
    return HttpResponse.json({
      isVerified: true,
      confidence: 0.95,
      reasons: ['Face detected', 'Liveness check passed'],
      livenessScore: 0.92,
      faceDetected: true,
      qualityScore: 0.88,
      recommendations: ['Good quality image']
    });
  }),

  http.post('/api/validate-id-document', () => {
    return HttpResponse.json({
      success: true,
      validation: generateIDValidationResult(),
      message: 'ID document validation completed',
    })
  }),

  // Task endpoints
  http.get('/api/tasks', () => {
    return HttpResponse.json({
      success: true,
      tasks: Array.from({ length: 10 }, generatePost),
      total: 100,
      page: 1,
      limit: 10,
    })
  }),

  http.post('/api/tasks', () => {
    return HttpResponse.json({
      success: true,
      task: generatePost(),
      message: 'Task created successfully',
    })
  }),

  http.get('/api/tasks/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      task: {
        ...generatePost(),
        id: params.id as string,
      },
    })
  }),

  http.put('/api/tasks/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      task: {
        ...generatePost(),
        id: params.id as string,
      },
      message: 'Task updated successfully',
    })
  }),

  http.delete('/api/tasks/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: `Task ${params.id} deleted successfully`,
    })
  }),

  // Task completion
  http.post('/api/tasks/complete', () => {
    return HttpResponse.json({
      success: true,
      message: 'Task completed successfully',
      bonus: {
        amount: faker.number.float({ min: 5, max: 50, precision: 0.01 }),
        currency: 'PHP',
        reason: 'Task completion bonus',
      },
    })
  }),

  // Payment endpoints
  http.post('/api/pot-money/donate', () => {
    return HttpResponse.json({
      success: true,
      transaction: generateTransactionLog(),
      message: 'Donation processed successfully',
    })
  }),

  // Admin endpoints
  http.get('/api/admin/transaction-logs', () => {
    return HttpResponse.json({
      success: true,
      transactions: Array.from({ length: 20 }, generateTransactionLog),
      total: 150,
      page: 1,
      limit: 20,
    })
  }),

  // AI endpoints
  http.post('/api/test-ai', () => {
    return HttpResponse.json({
      success: true,
      response: faker.lorem.paragraph(),
      message: 'AI test completed successfully',
    })
  }),

  // User profile endpoints
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      user: {
        ...generateUser(),
        uid: params.id as string,
      },
    })
  }),

  http.put('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      user: {
        ...generateUser(),
        uid: params.id as string,
      },
      message: 'Profile updated successfully',
    })
  }),

  // Reviews endpoints
  http.get('/api/users/:id/reviews', ({ params }) => {
    return HttpResponse.json({
      success: true,
      reviews: Array.from({ length: 5 }, () => ({
        id: faker.string.uuid(),
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.paragraph(),
        createdAt: faker.date.past().toISOString(),
        reviewer: generateUser(),
      })),
      total: 25,
    })
  }),

  http.post('/api/users/:id/reviews', ({ params }) => {
    return HttpResponse.json({
      success: true,
      review: {
        id: faker.string.uuid(),
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.paragraph(),
        createdAt: faker.date.recent().toISOString(),
        reviewer: generateUser(),
      },
      message: 'Review submitted successfully',
    })
  }),

  // Error handlers
  http.all('*', () => {
    return HttpResponse.json(
      { error: 'Endpoint not found' },
      { status: 404 }
    )
  }),
] 