import { Task, User, Appointment, Payment } from '@/types';

export interface WorkflowStep {
  id: string;
  type: 'condition' | 'action' | 'delay' | 'webhook' | 'notification' | 'assignment' | 'quality_check';
  name: string;
  description: string;
  config: Record<string, any>;
  order: number;
  isActive: boolean;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'task_created' | 'task_completed' | 'payment_received' | 'user_signup' | 'appointment_scheduled';
    conditions: Record<string, any>;
  };
  steps: WorkflowStep[];
  status: 'draft' | 'active' | 'paused' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  executionCount: number;
  successCount: number;
  failureCount: number;
  lastExecuted?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAssignment {
  taskId: string;
  taskerId: string;
  assignmentReason: string;
  score: number;
  assignedAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface QualityControlRule {
  id: string;
  name: string;
  description: string;
  type: 'content_moderation' | 'image_verification' | 'payment_validation' | 'user_behavior';
  conditions: Record<string, any>;
  actions: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AutomationWorkflowService {
  private static instance: AutomationWorkflowService;
  private workflows: Map<string, AutomationWorkflow> = new Map();
  private qualityRules: Map<string, QualityControlRule> = new Map();

  private constructor() {
    this.initializeDefaultWorkflows();
    this.initializeQualityRules();
  }

  static getInstance(): AutomationWorkflowService {
    if (!AutomationWorkflowService.instance) {
      AutomationWorkflowService.instance = new AutomationWorkflowService();
    }
    return AutomationWorkflowService.instance;
  }

  private initializeDefaultWorkflows() {
    // Task Assignment Workflow
    this.workflows.set('task_assignment', {
      id: 'task_assignment',
      name: 'Automated Task Assignment',
      description: 'Automatically assign tasks to the best available taskers',
      trigger: {
        type: 'task_created',
        conditions: { status: 'open' }
      },
      steps: [
        {
          id: 'find_taskers',
          type: 'action',
          name: 'Find Suitable Taskers',
          description: 'Find taskers who match the task requirements',
          config: { maxResults: 10, minRating: 4.0 },
          order: 1,
          isActive: true
        },
        {
          id: 'assign_task',
          type: 'assignment',
          name: 'Assign Task',
          description: 'Assign task to the highest-scoring tasker',
          config: { autoAssign: true, notifyTasker: true },
          order: 2,
          isActive: true
        }
      ],
      status: 'active',
      priority: 'high',
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Quality Control Workflow
    this.workflows.set('quality_control', {
      id: 'quality_control',
      name: 'Quality Control Automation',
      description: 'Automated quality checks and content moderation',
      trigger: {
        type: 'task_created',
        conditions: {}
      },
      steps: [
        {
          id: 'content_scan',
          type: 'quality_check',
          name: 'Content Scan',
          description: 'Scan task content for inappropriate content',
          config: { scanText: true, scanImages: true },
          order: 1,
          isActive: true
        },
        {
          id: 'manual_review',
          type: 'condition',
          name: 'Manual Review Decision',
          description: 'Decide if manual review is needed',
          config: { confidenceThreshold: 0.8 },
          order: 2,
          isActive: true
        }
      ],
      status: 'active',
      priority: 'high',
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  private initializeQualityRules() {
    this.qualityRules.set('content_moderation', {
      id: 'content_moderation',
      name: 'Content Moderation',
      description: 'Automatically moderate task content',
      type: 'content_moderation',
      conditions: { content: ['inappropriate', 'spam', 'offensive'] },
      actions: { status: 'flagged_for_review' },
      severity: 'high',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Workflow Management
  async createWorkflow(workflow: Omit<AutomationWorkflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.workflows.set(workflowId, {
      ...workflow,
      id: workflowId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return workflowId;
  }

  async executeWorkflow(workflowId: string, context: Record<string, any>): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || workflow.status !== 'active') {
      return;
    }

    workflow.executionCount++;
    workflow.lastExecuted = new Date();
    workflow.updatedAt = new Date();

    try {
      const sortedSteps = workflow.steps
        .filter(step => step.isActive)
        .sort((a, b) => a.order - b.order);

      for (const step of sortedSteps) {
        await this.executeWorkflowStep(step, context);
      }

      workflow.successCount++;
    } catch (error) {
      console.error(`Workflow ${workflowId} execution failed:`, error);
      workflow.failureCount++;
    }
  }

  private async executeWorkflowStep(step: WorkflowStep, context: Record<string, any>): Promise<void> {
    switch (step.type) {
      case 'action':
        await this.executeAction(step, context);
        break;
      case 'assignment':
        await this.executeAssignment(step, context);
        break;
      case 'quality_check':
        await this.executeQualityCheck(step, context);
        break;
      case 'notification':
        await this.sendNotification(step, context);
        break;
      default:
        console.warn(`Unknown workflow step type: ${step.type}`);
    }
  }

  private async executeAction(step: WorkflowStep, context: Record<string, any>): Promise<void> {
    console.log(`Executing action: ${step.name}`, context);
  }

  private async executeAssignment(step: WorkflowStep, context: Record<string, any>): Promise<void> {
    if (step.config.autoAssign && context.taskId) {
      await this.assignTaskAutomatically(context.taskId);
    }
  }

  private async executeQualityCheck(step: WorkflowStep, context: Record<string, any>): Promise<void> {
    if (context.taskId) {
      await this.performQualityCheck(context.taskId);
    }
  }

  private async sendNotification(step: WorkflowStep, context: Record<string, any>): Promise<void> {
    console.log(`Sending notification: ${step.name}`, context);
  }

  // Task Assignment
  async assignTaskAutomatically(taskId: string): Promise<TaskAssignment | null> {
    try {
      // Find suitable taskers (mock implementation)
      const taskers = await this.findSuitableTaskers(taskId);
      
      if (taskers.length === 0) {
        return null;
      }

      // Select the best tasker
      const bestTasker = taskers[0];
      
      const assignment: TaskAssignment = {
        taskId,
        taskerId: bestTasker.id,
        assignmentReason: 'Automated assignment based on skills and availability',
        score: 0.95,
        assignedAt: new Date(),
        status: 'pending'
      };

      console.log(`Assigned task ${taskId} to tasker ${bestTasker.id}`);
      return assignment;
    } catch (error) {
      console.error('Automatic task assignment failed:', error);
      return null;
    }
  }

  private async findSuitableTaskers(taskId: string): Promise<User[]> {
    // Mock implementation
    return [
      {
        id: 'tasker_1',
        email: 'tasker1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        rating: 4.5,
        isAvailable: true
      } as User
    ];
  }

  // Quality Control
  async performQualityCheck(taskId: string): Promise<{
    passed: boolean;
    issues: string[];
    score: number;
  }> {
    const issues: string[] = [];
    let score = 100;

    // Mock quality checks
    const hasIssues = Math.random() > 0.8; // 20% chance of issues
    
    if (hasIssues) {
      issues.push('Content needs review');
      score = 65;
    }

    return {
      passed: score >= 70,
      issues,
      score
    };
  }

  // Analytics
  async getWorkflowAnalytics(workflowId: string): Promise<{
    executionCount: number;
    successCount: number;
    failureCount: number;
    successRate: number;
  }> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const successRate = workflow.executionCount > 0 
      ? (workflow.successCount / workflow.executionCount) * 100 
      : 0;

    return {
      executionCount: workflow.executionCount,
      successCount: workflow.successCount,
      failureCount: workflow.failureCount,
      successRate
    };
  }
}

// Convenience functions
export const automationService = AutomationWorkflowService.getInstance();

export const createWorkflow = (workflow: Omit<AutomationWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => 
  automationService.createWorkflow(workflow);
export const executeWorkflow = (workflowId: string, context: Record<string, any>) => 
  automationService.executeWorkflow(workflowId, context);
export const assignTaskAutomatically = (taskId: string) => 
  automationService.assignTaskAutomatically(taskId);
export const performQualityCheck = (taskId: string) => 
  automationService.performQualityCheck(taskId); 