// AI-Powered Task Matching System for FixMo
// Intelligent task-tasker matching using machine learning algorithms

export interface TaskerProfile {
  id: string;
  name: string;
  skills: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  rating: number;
  reviewCount: number;
  completedTasks: number;
  responseTime: number; // Average response time in minutes
  availability: {
    isAvailable: boolean;
    schedule: Record<string, string[]>; // day -> time slots
  };
  preferences: {
    minPay: number;
    maxDistance: number; // in kilometers
    preferredCategories: string[];
  };
  behavior: {
    taskAcceptanceRate: number;
    cancellationRate: number;
    averageTaskDuration: number;
    lastActive: Date;
  };
}

export interface TaskRequirements {
  id: string;
  title: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  pay: number;
  urgency: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedDuration: number; // in hours
  requiredSkills: string[];
  clientRating: number;
  clientHistory: {
    completedTasks: number;
    cancellationRate: number;
  };
}

export interface MatchScore {
  taskerId: string;
  taskId: string;
  overallScore: number;
  breakdown: {
    skillMatch: number;
    locationScore: number;
    ratingScore: number;
    availabilityScore: number;
    behaviorScore: number;
    preferenceScore: number;
  };
  reasoning: string[];
}

export interface MatchingConfig {
  weights: {
    skillMatch: number;
    location: number;
    rating: number;
    availability: number;
    behavior: number;
    preferences: number;
  };
  thresholds: {
    minScore: number;
    maxDistance: number;
    minRating: number;
  };
  enableLearning: boolean;
  enablePredictiveMatching: boolean;
}

class AITaskMatching {
  private static instance: AITaskMatching;
  private config: MatchingConfig;
  private taskerProfiles: Map<string, TaskerProfile> = new Map();
  private taskHistory: Map<string, any[]> = new Map();
  private matchingModel: any = null; // Would be a trained ML model in production

  private constructor() {
    this.config = {
      weights: {
        skillMatch: 0.25,
        location: 0.20,
        rating: 0.20,
        availability: 0.15,
        behavior: 0.10,
        preferences: 0.10
      },
      thresholds: {
        minScore: 0.6,
        maxDistance: 50, // km
        minRating: 3.5
      },
      enableLearning: true,
      enablePredictiveMatching: true
    };

    this.initializeModel();
  }

  static getInstance(): AITaskMatching {
    if (!AITaskMatching.instance) {
      AITaskMatching.instance = new AITaskMatching();
    }
    return AITaskMatching.instance;
  }

  private async initializeModel(): Promise<void> {
    try {
      // In a real implementation, this would load a trained ML model
      // For now, we'll use a rule-based system with learning capabilities
      console.log('[AI] Task matching model initialized');
    } catch (error) {
      console.error('[AI] Failed to initialize matching model:', error);
    }
  }

  // Main matching function
  public async findBestMatches(
    task: TaskRequirements,
    limit: number = 10
  ): Promise<MatchScore[]> {
    try {
      const candidates = await this.getCandidateTaskers(task);
      const matches: MatchScore[] = [];

      for (const tasker of candidates) {
        const score = await this.calculateMatchScore(task, tasker);
        if (score.overallScore >= this.config.thresholds.minScore) {
          matches.push(score);
        }
      }

      // Sort by score and return top matches
      matches.sort((a, b) => b.overallScore - a.overallScore);
      return matches.slice(0, limit);

    } catch (error) {
      console.error('[AI] Error finding matches:', error);
      return [];
    }
  }

  private async getCandidateTaskers(task: TaskRequirements): Promise<TaskerProfile[]> {
    const candidates: TaskerProfile[] = [];

    for (const tasker of this.taskerProfiles.values()) {
      // Basic filtering
      if (!tasker.availability.isAvailable) continue;
      if (tasker.rating < this.config.thresholds.minRating) continue;
      if (tasker.behavior.taskAcceptanceRate < 0.5) continue;

      // Distance filtering
      const distance = this.calculateDistance(task.location, tasker.location);
      if (distance > this.config.thresholds.maxDistance) continue;

      // Skill overlap check
      const skillOverlap = this.calculateSkillOverlap(task.requiredSkills, tasker.skills);
      if (skillOverlap === 0) continue;

      candidates.push(tasker);
    }

    return candidates;
  }

  private async calculateMatchScore(
    task: TaskRequirements,
    tasker: TaskerProfile
  ): Promise<MatchScore> {
    const breakdown = {
      skillMatch: this.calculateSkillMatchScore(task, tasker),
      locationScore: this.calculateLocationScore(task, tasker),
      ratingScore: this.calculateRatingScore(task, tasker),
      availabilityScore: this.calculateAvailabilityScore(task, tasker),
      behaviorScore: this.calculateBehaviorScore(task, tasker),
      preferenceScore: this.calculatePreferenceScore(task, tasker)
    };

    const overallScore = this.calculateWeightedScore(breakdown);
    const reasoning = this.generateReasoning(task, tasker, breakdown);

    return {
      taskerId: tasker.id,
      taskId: task.id,
      overallScore,
      breakdown,
      reasoning
    };
  }

  private calculateSkillMatchScore(task: TaskRequirements, tasker: TaskerProfile): number {
    const overlap = this.calculateSkillOverlap(task.requiredSkills, tasker.skills);
    const totalRequired = task.requiredSkills.length;
    
    if (totalRequired === 0) return 1.0;
    
    const baseScore = overlap / totalRequired;
    
    // Bonus for additional relevant skills
    const additionalSkills = tasker.skills.filter(skill => 
      !task.requiredSkills.includes(skill) && 
      this.isSkillRelevant(skill, task.category)
    );
    
    const bonus = Math.min(additionalSkills.length * 0.1, 0.3);
    
    return Math.min(baseScore + bonus, 1.0);
  }

  private calculateSkillOverlap(required: string[], available: string[]): number {
    return required.filter(skill => available.includes(skill)).length;
  }

  private isSkillRelevant(skill: string, category: string): boolean {
    // Define skill-category relationships
    const skillCategories: Record<string, string[]> = {
      'Plumber': ['Plumbing', 'Repair', 'Installation'],
      'Electrician': ['Electrical', 'Wiring', 'Installation'],
      'Carpenter': ['Woodwork', 'Construction', 'Repair'],
      'Housekeeper': ['Cleaning', 'Organization', 'Maintenance'],
      'Gardener': ['Landscaping', 'Plant Care', 'Outdoor'],
      // Add more mappings as needed
    };

    const relevantSkills = skillCategories[category] || [];
    return relevantSkills.some(relevantSkill => 
      skill.toLowerCase().includes(relevantSkill.toLowerCase())
    );
  }

  private calculateLocationScore(task: TaskRequirements, tasker: TaskerProfile): number {
    const distance = this.calculateDistance(task.location, tasker.location);
    const maxDistance = Math.min(
      this.config.thresholds.maxDistance,
      tasker.preferences.maxDistance
    );

    if (distance > maxDistance) return 0;

    // Score decreases linearly with distance
    return Math.max(0, 1 - (distance / maxDistance));
  }

  private calculateDistance(loc1: any, loc2: any): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(loc2.latitude - loc1.latitude);
    const dLon = this.toRadians(loc2.longitude - loc1.longitude);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(loc1.latitude)) * Math.cos(this.toRadians(loc2.latitude)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private calculateRatingScore(task: TaskRequirements, tasker: TaskerProfile): number {
    // Normalize rating to 0-1 scale (assuming 5-star system)
    const normalizedRating = tasker.rating / 5;
    
    // Consider review count for confidence
    const confidence = Math.min(tasker.reviewCount / 50, 1); // Full confidence at 50+ reviews
    
    return normalizedRating * (0.7 + 0.3 * confidence);
  }

  private calculateAvailabilityScore(task: TaskRequirements, tasker: TaskerProfile): number {
    if (!tasker.availability.isAvailable) return 0;

    // Check if tasker is available during task time
    const taskTime = new Date(); // In real implementation, use actual task time
    const dayOfWeek = taskTime.getDay();
    const timeSlot = this.getTimeSlot(taskTime);

    const availableSlots = tasker.availability.schedule[dayOfWeek] || [];
    const isAvailable = availableSlots.includes(timeSlot);

    if (!isAvailable) return 0.3; // Some penalty for not being available at exact time

    // Consider response time
    const responseScore = Math.max(0, 1 - (tasker.responseTime / 60)); // Penalty for slow response

    return 0.8 + 0.2 * responseScore;
  }

  private getTimeSlot(date: Date): string {
    const hour = date.getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  private calculateBehaviorScore(task: TaskRequirements, tasker: TaskerProfile): number {
    const acceptanceRate = tasker.behavior.taskAcceptanceRate;
    const cancellationRate = tasker.behavior.cancellationRate;
    const daysSinceActive = (Date.now() - tasker.behavior.lastActive.getTime()) / (1000 * 60 * 60 * 24);

    // Acceptance rate score
    const acceptanceScore = acceptanceRate;

    // Cancellation penalty
    const cancellationPenalty = cancellationRate * 0.5;

    // Activity penalty (recent activity is better)
    const activityPenalty = Math.min(daysSinceActive / 30, 0.3);

    return Math.max(0, acceptanceScore - cancellationPenalty - activityPenalty);
  }

  private calculatePreferenceScore(task: TaskRequirements, tasker: TaskerProfile): number {
    let score = 1.0;

    // Pay preference
    if (task.pay < tasker.preferences.minPay) {
      score -= 0.4;
    } else if (task.pay >= tasker.preferences.minPay * 1.5) {
      score += 0.2; // Bonus for higher pay
    }

    // Category preference
    if (tasker.preferences.preferredCategories.includes(task.category)) {
      score += 0.3;
    }

    return Math.max(0, Math.min(1, score));
  }

  private calculateWeightedScore(breakdown: any): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const [key, score] of Object.entries(breakdown)) {
      const weight = this.config.weights[key as keyof typeof this.config.weights];
      totalScore += score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  private generateReasoning(task: TaskRequirements, tasker: TaskerProfile, breakdown: any): string[] {
    const reasoning: string[] = [];

    if (breakdown.skillMatch > 0.8) {
      reasoning.push(`Excellent skill match (${(breakdown.skillMatch * 100).toFixed(0)}%)`);
    } else if (breakdown.skillMatch > 0.6) {
      reasoning.push(`Good skill match (${(breakdown.skillMatch * 100).toFixed(0)}%)`);
    }

    if (breakdown.locationScore > 0.9) {
      reasoning.push('Very close to task location');
    } else if (breakdown.locationScore > 0.7) {
      reasoning.push('Within reasonable distance');
    }

    if (breakdown.ratingScore > 0.8) {
      reasoning.push(`Highly rated (${tasker.rating.toFixed(1)}/5)`);
    }

    if (breakdown.behaviorScore > 0.8) {
      reasoning.push('Excellent track record');
    }

    if (breakdown.preferenceScore > 0.9) {
      reasoning.push('Matches preferences well');
    }

    return reasoning;
  }

  // Learning and feedback methods
  public async recordTaskOutcome(
    taskId: string,
    taskerId: string,
    outcome: 'accepted' | 'completed' | 'cancelled' | 'rated',
    rating?: number,
    feedback?: string
  ): Promise<void> {
    try {
      // Record the outcome for learning
      const outcomeData = {
        taskId,
        taskerId,
        outcome,
        rating,
        feedback,
        timestamp: new Date()
      };

      if (!this.taskHistory.has(taskId)) {
        this.taskHistory.set(taskId, []);
      }
      this.taskHistory.get(taskId)!.push(outcomeData);

      // Update tasker behavior metrics
      await this.updateTaskerBehavior(taskerId, outcome, rating);

      // Retrain model if learning is enabled
      if (this.config.enableLearning) {
        await this.retrainModel();
      }

    } catch (error) {
      console.error('[AI] Error recording task outcome:', error);
    }
  }

  private async updateTaskerBehavior(
    taskerId: string,
    outcome: string,
    rating?: number
  ): Promise<void> {
    const tasker = this.taskerProfiles.get(taskerId);
    if (!tasker) return;

    // Update acceptance rate, cancellation rate, etc.
    // This would be more sophisticated in a real implementation
    console.log(`[AI] Updated behavior for tasker ${taskerId}: ${outcome}`);
  }

  private async retrainModel(): Promise<void> {
    // In a real implementation, this would retrain the ML model
    // with new data to improve matching accuracy
    console.log('[AI] Model retraining triggered');
  }

  // Public API methods
  public async addTaskerProfile(profile: TaskerProfile): Promise<void> {
    this.taskerProfiles.set(profile.id, profile);
  }

  public async updateTaskerProfile(taskerId: string, updates: Partial<TaskerProfile>): Promise<void> {
    const profile = this.taskerProfiles.get(taskerId);
    if (profile) {
      this.taskerProfiles.set(taskerId, { ...profile, ...updates });
    }
  }

  public async removeTaskerProfile(taskerId: string): Promise<void> {
    this.taskerProfiles.delete(taskerId);
  }

  public getConfig(): MatchingConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<MatchingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public async getMatchingStats(): Promise<any> {
    const totalTaskers = this.taskerProfiles.size;
    const totalTasks = this.taskHistory.size;
    
    // Calculate average match scores, acceptance rates, etc.
    return {
      totalTaskers,
      totalTasks,
      averageMatchScore: 0.75, // Placeholder
      averageAcceptanceRate: 0.68, // Placeholder
      modelAccuracy: 0.82 // Placeholder
    };
  }
}

// Export singleton instance
export const aiTaskMatching = AITaskMatching.getInstance();

// Convenience functions
export async function findBestTaskers(task: TaskRequirements, limit?: number): Promise<MatchScore[]> {
  return aiTaskMatching.findBestMatches(task, limit);
}

export async function recordTaskOutcome(
  taskId: string,
  taskerId: string,
  outcome: 'accepted' | 'completed' | 'cancelled' | 'rated',
  rating?: number,
  feedback?: string
): Promise<void> {
  return aiTaskMatching.recordTaskOutcome(taskId, taskerId, outcome, rating, feedback);
} 