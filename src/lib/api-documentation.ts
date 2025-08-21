import { Task, User, Payment, Appointment } from '@/types';

export interface APIDocumentation {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
    contact: {
      name: string;
      email: string;
      url: string;
    };
    license: {
      name: string;
      url: string;
    };
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, Record<string, APIEndpoint>>;
  components: {
    schemas: Record<string, any>;
    securitySchemes: Record<string, any>;
    parameters: Record<string, any>;
    responses: Record<string, any>;
  };
  security: Array<Record<string, string[]>>;
  tags: Array<{
    name: string;
    description: string;
  }>;
}

export interface APIEndpoint {
  summary: string;
  description: string;
  tags: string[];
  parameters?: Array<{
    name: string;
    in: 'path' | 'query' | 'header' | 'cookie';
    required: boolean;
    schema: any;
    description: string;
  }>;
  requestBody?: {
    required: boolean;
    content: Record<string, {
      schema: any;
      example?: any;
    }>;
  };
  responses: Record<string, {
    description: string;
    content?: Record<string, {
      schema: any;
      example?: any;
    }>;
  }>;
  security?: Array<Record<string, string[]>>;
}

export interface APISDK {
  name: string;
  version: string;
  language: 'javascript' | 'python' | 'php' | 'java' | 'csharp' | 'go' | 'ruby';
  description: string;
  installation: string;
  usage: string;
  examples: string[];
  downloadUrl: string;
}

export interface WebhookEvent {
  id: string;
  type: 'task.created' | 'task.completed' | 'payment.received' | 'user.verified' | 'appointment.scheduled';
  data: any;
  timestamp: Date;
  signature?: string;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
}

export class APIDocumentationService {
  private static instance: APIDocumentationService;
  private documentation: APIDocumentation;
  private sdks: Map<string, APISDK> = new Map();
  private webhooks: Map<string, WebhookEvent> = new Map();

  private constructor() {
    this.initializeDocumentation();
    this.initializeSDKs();
  }

  static getInstance(): APIDocumentationService {
    if (!APIDocumentationService.instance) {
      APIDocumentationService.instance = new APIDocumentationService();
    }
    return APIDocumentationService.instance;
  }

  private initializeDocumentation() {
    this.documentation = {
      openapi: '3.0.3',
      info: {
        title: 'FixMo API',
        description: 'Comprehensive API for the FixMo task marketplace platform. Connect with trusted neighbors in Cebu City for tasks and services.',
        version: '1.0.0',
        contact: {
          name: 'FixMo API Support',
          email: 'api@fixmo.ph',
          url: 'https://fixmo.ph/api-support'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: [
        {
          url: 'https://api.fixmo.ph/v1',
          description: 'Production server'
        },
        {
          url: 'https://staging-api.fixmo.ph/v1',
          description: 'Staging server'
        },
        {
          url: 'http://localhost:3000/api',
          description: 'Local development server'
        }
      ],
      paths: this.generateAPIPaths(),
      components: this.generateComponents(),
      security: [
        {
          BearerAuth: []
        },
        {
          ApiKeyAuth: []
        }
      ],
      tags: [
        {
          name: 'Authentication',
          description: 'User authentication and authorization endpoints'
        },
        {
          name: 'Tasks',
          description: 'Task management and operations'
        },
        {
          name: 'Users',
          description: 'User profile and management'
        },
        {
          name: 'Payments',
          description: 'Payment processing and transactions'
        },
        {
          name: 'Appointments',
          description: 'Scheduling and appointment management'
        },
        {
          name: 'Verification',
          description: 'User verification and trust systems'
        },
        {
          name: 'Webhooks',
          description: 'Real-time event notifications'
        }
      ]
    };
  }

  private generateAPIPaths(): Record<string, Record<string, APIEndpoint>> {
    return {
      '/auth/login': {
        post: {
          summary: 'User Login',
          description: 'Authenticate a user and return access token',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email'
                    },
                    password: {
                      type: 'string',
                      minLength: 6
                    }
                  },
                  required: ['email', 'password']
                },
                example: {
                  email: 'user@example.com',
                  password: 'password123'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      token: { type: 'string' },
                      user: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Invalid credentials'
            }
          }
        }
      },
      '/tasks': {
        get: {
          summary: 'List Tasks',
          description: 'Get a list of available tasks with filtering and pagination',
          tags: ['Tasks'],
          parameters: [
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1, default: 1 },
              description: 'Page number for pagination'
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
              description: 'Number of tasks per page'
            },
            {
              name: 'category',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Filter by task category'
            },
            {
              name: 'location',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Filter by location'
            },
            {
              name: 'minBudget',
              in: 'query',
              required: false,
              schema: { type: 'number' },
              description: 'Minimum budget filter'
            },
            {
              name: 'maxBudget',
              in: 'query',
              required: false,
              schema: { type: 'number' },
              description: 'Maximum budget filter'
            }
          ],
          responses: {
            '200': {
              description: 'List of tasks',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      tasks: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Task' }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          total: { type: 'integer' },
                          pages: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create Task',
          description: 'Create a new task',
          tags: ['Tasks'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateTaskRequest' },
                example: {
                  title: 'House Cleaning Needed',
                  description: 'Need help cleaning a 2-bedroom apartment',
                  category: 'cleaning',
                  budget: 1500,
                  location: 'Cebu City',
                  urgency: 'medium',
                  deadline: '2024-12-31T23:59:59Z'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Task created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Task' }
                }
              }
            },
            '400': {
              description: 'Invalid request data'
            },
            '401': {
              description: 'Unauthorized'
            }
          }
        }
      },
      '/tasks/{taskId}': {
        get: {
          summary: 'Get Task',
          description: 'Get detailed information about a specific task',
          tags: ['Tasks'],
          parameters: [
            {
              name: 'taskId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Task ID'
            }
          ],
          responses: {
            '200': {
              description: 'Task details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Task' }
                }
              }
            },
            '404': {
              description: 'Task not found'
            }
          }
        },
        put: {
          summary: 'Update Task',
          description: 'Update an existing task',
          tags: ['Tasks'],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'taskId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Task ID'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateTaskRequest' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Task updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Task' }
                }
              }
            },
            '403': {
              description: 'Forbidden - not the task owner'
            },
            '404': {
              description: 'Task not found'
            }
          }
        },
        delete: {
          summary: 'Delete Task',
          description: 'Delete a task',
          tags: ['Tasks'],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'taskId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Task ID'
            }
          ],
          responses: {
            '204': {
              description: 'Task deleted successfully'
            },
            '403': {
              description: 'Forbidden - not the task owner'
            },
            '404': {
              description: 'Task not found'
            }
          }
        }
      },
      '/payments': {
        post: {
          summary: 'Process Payment',
          description: 'Process a payment for a task',
          tags: ['Payments'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaymentRequest' },
                example: {
                  taskId: 'task_123',
                  amount: 1500,
                  method: 'gcash',
                  currency: 'PHP'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Payment processed successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Payment' }
                }
              }
            },
            '400': {
              description: 'Invalid payment data'
            },
            '402': {
              description: 'Payment failed'
            }
          }
        }
      },
      '/webhooks': {
        post: {
          summary: 'Webhook Endpoint',
          description: 'Receive webhook events from FixMo',
          tags: ['Webhooks'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/WebhookEvent' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Webhook received successfully'
            },
            '400': {
              description: 'Invalid webhook data'
            }
          }
        }
      }
    };
  }

  private generateComponents() {
    return {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            isVerified: { type: 'boolean' },
            rating: { type: 'number', minimum: 0, maximum: 5 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            budget: { type: 'number' },
            location: { type: 'string' },
            urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
            status: { type: 'string', enum: ['open', 'in_progress', 'completed', 'cancelled'] },
            clientId: { type: 'string' },
            taskerId: { type: 'string' },
            deadline: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateTaskRequest: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 200 },
            description: { type: 'string', maxLength: 1000 },
            category: { type: 'string' },
            budget: { type: 'number', minimum: 0 },
            location: { type: 'string' },
            urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
            deadline: { type: 'string', format: 'date-time' }
          },
          required: ['title', 'description', 'category', 'budget', 'location']
        },
        UpdateTaskRequest: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 200 },
            description: { type: 'string', maxLength: 1000 },
            category: { type: 'string' },
            budget: { type: 'number', minimum: 0 },
            location: { type: 'string' },
            urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
            deadline: { type: 'string', format: 'date-time' }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            taskId: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            method: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
            transactionId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        PaymentRequest: {
          type: 'object',
          properties: {
            taskId: { type: 'string' },
            amount: { type: 'number', minimum: 0 },
            method: { type: 'string', enum: ['gcash', 'paymaya', 'cash'] },
            currency: { type: 'string', default: 'PHP' }
          },
          required: ['taskId', 'amount', 'method']
        },
        WebhookEvent: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string' },
            data: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' },
            signature: { type: 'string' }
          },
          required: ['id', 'type', 'data', 'timestamp']
        }
      },
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        }
      },
      parameters: {
        TaskId: {
          name: 'taskId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Task identifier'
        },
        UserId: {
          name: 'userId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'User identifier'
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'The specified resource was not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  message: { type: 'string' },
                  details: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: { type: 'string' },
                        message: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  private initializeSDKs() {
    // JavaScript/TypeScript SDK
    this.sdks.set('javascript', {
      name: 'FixMo JavaScript SDK',
      version: '1.0.0',
      language: 'javascript',
      description: 'Official JavaScript/TypeScript SDK for the FixMo API',
      installation: 'npm install @fixmo/sdk',
      usage: `
import { FixMoAPI } from '@fixmo/sdk';

const api = new FixMoAPI({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Create a task
const task = await api.tasks.create({
  title: 'House Cleaning',
  description: 'Need help cleaning apartment',
  budget: 1500,
  category: 'cleaning'
});
      `,
      examples: [
        'Authentication',
        'Task Management',
        'Payment Processing',
        'Webhook Handling'
      ],
      downloadUrl: 'https://npmjs.com/package/@fixmo/sdk'
    });

    // Python SDK
    this.sdks.set('python', {
      name: 'FixMo Python SDK',
      version: '1.0.0',
      language: 'python',
      description: 'Official Python SDK for the FixMo API',
      installation: 'pip install fixmo-sdk',
      usage: `
from fixmo import FixMoAPI

api = FixMoAPI(
    api_key='your-api-key',
    environment='production'
)

# Create a task
task = api.tasks.create({
    'title': 'House Cleaning',
    'description': 'Need help cleaning apartment',
    'budget': 1500,
    'category': 'cleaning'
})
      `,
      examples: [
        'Authentication',
        'Task Management',
        'Payment Processing',
        'Webhook Handling'
      ],
      downloadUrl: 'https://pypi.org/project/fixmo-sdk'
    });

    // PHP SDK
    this.sdks.set('php', {
      name: 'FixMo PHP SDK',
      version: '1.0.0',
      language: 'php',
      description: 'Official PHP SDK for the FixMo API',
      installation: 'composer require fixmo/sdk',
      usage: `
use FixMo\FixMoAPI;

$api = new FixMoAPI([
    'api_key' => 'your-api-key',
    'environment' => 'production'
]);

// Create a task
$task = $api->tasks->create([
    'title' => 'House Cleaning',
    'description' => 'Need help cleaning apartment',
    'budget' => 1500,
    'category' => 'cleaning'
]);
      `,
      examples: [
        'Authentication',
        'Task Management',
        'Payment Processing',
        'Webhook Handling'
      ],
      downloadUrl: 'https://packagist.org/packages/fixmo/sdk'
    });
  }

  // API Documentation Methods
  getDocumentation(): APIDocumentation {
    return this.documentation;
  }

  generateOpenAPISpec(): string {
    return JSON.stringify(this.documentation, null, 2);
  }

  generateSwaggerUI(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>FixMo API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script>
        window.onload = function() {
            SwaggerUIBundle({
                url: '/api/docs/openapi.json',
                dom_id: '#swagger-ui',
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>
    `;
  }

  // SDK Management
  getSDKs(): APISDK[] {
    return Array.from(this.sdks.values());
  }

  getSDK(language: string): APISDK | undefined {
    return this.sdks.get(language);
  }

  async generateSDK(language: string): Promise<string> {
    const sdk = this.sdks.get(language);
    if (!sdk) {
      throw new Error(`SDK for language ${language} not found`);
    }

    // In a real implementation, this would generate the actual SDK code
    return `Generated ${sdk.name} v${sdk.version}`;
  }

  // Webhook Management
  async registerWebhook(url: string, events: string[]): Promise<string> {
    const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store webhook configuration
    console.log(`Registered webhook ${webhookId} for URL: ${url}, Events: ${events.join(', ')}`);
    
    return webhookId;
  }

  async sendWebhook(webhookId: string, event: WebhookEvent): Promise<void> {
    // In a real implementation, this would send the webhook to the registered URL
    console.log(`Sending webhook ${webhookId}:`, event);
    
    // Store webhook event
    this.webhooks.set(event.id, event);
  }

  async getWebhookEvents(webhookId: string): Promise<WebhookEvent[]> {
    return Array.from(this.webhooks.values()).filter(event => 
      event.type.startsWith(webhookId)
    );
  }

  // Rate Limiting
  async checkRateLimit(apiKey: string, endpoint: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }> {
    // In a real implementation, this would check against a rate limiting service
    return {
      allowed: true,
      remaining: 1000,
      resetTime: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    };
  }

  // API Analytics
  async trackAPIUsage(apiKey: string, endpoint: string, responseTime: number, statusCode: number): Promise<void> {
    // In a real implementation, this would track API usage for analytics
    console.log(`API Usage: ${apiKey} -> ${endpoint} (${statusCode}) - ${responseTime}ms`);
  }

  // Developer Tools
  async generateCodeSnippet(endpoint: string, method: string, language: string): Promise<string> {
    const endpointData = this.documentation.paths[endpoint]?.[method.toLowerCase()];
    if (!endpointData) {
      throw new Error(`Endpoint ${method} ${endpoint} not found`);
    }

    switch (language) {
      case 'javascript':
        return this.generateJavaScriptSnippet(endpoint, method, endpointData);
      case 'python':
        return this.generatePythonSnippet(endpoint, method, endpointData);
      case 'curl':
        return this.generateCurlSnippet(endpoint, method, endpointData);
      default:
        throw new Error(`Language ${language} not supported`);
    }
  }

  private generateJavaScriptSnippet(endpoint: string, method: string, endpointData: APIEndpoint): string {
    return `
// ${endpointData.summary}
// ${endpointData.description}

const response = await fetch('${this.documentation.servers[0].url}${endpoint}', {
  method: '${method.toUpperCase()}',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  }${endpointData.requestBody ? `,
  body: JSON.stringify({
    // Request body data
  })` : ''}
});

const data = await response.json();
console.log(data);
    `.trim();
  }

  private generatePythonSnippet(endpoint: string, method: string, endpointData: APIEndpoint): string {
    return `
# ${endpointData.summary}
# ${endpointData.description}

import requests

url = '${this.documentation.servers[0].url}${endpoint}'
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
}${endpointData.requestBody ? `
data = {
    # Request body data
}` : ''}

response = requests.${method.toLowerCase()}(url, headers=headers${endpointData.requestBody ? ', json=data' : ''})
data = response.json()
print(data)
    `.trim();
  }

  private generateCurlSnippet(endpoint: string, method: string, endpointData: APIEndpoint): string {
    return `
# ${endpointData.summary}
# ${endpointData.description}

curl -X ${method.toUpperCase()} \\
  '${this.documentation.servers[0].url}${endpoint}' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_API_KEY'${endpointData.requestBody ? ` \\
  -d '{
    "key": "value"
  }'` : ''}
    `.trim();
  }
}

// Convenience functions
export const apiDocsService = APIDocumentationService.getInstance();

export const getAPIDocumentation = () => apiDocsService.getDocumentation();
export const generateOpenAPISpec = () => apiDocsService.generateOpenAPISpec();
export const generateCodeSnippet = (endpoint: string, method: string, language: string) => 
  apiDocsService.generateCodeSnippet(endpoint, method, language); 