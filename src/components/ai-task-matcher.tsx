"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Zap, 
  TrendingUp,
  Shield,
  Award,
  MessageCircle,
  Phone
} from 'lucide-react';
import { findBestTaskers, MatchScore, TaskRequirements } from '@/lib/ai-task-matching';
import { assessContentQuality, QualityMetrics } from '@/lib/ai-quality-assessment';
import { forecastDemand, DemandForecast } from '@/lib/predictive-analytics';

interface TaskerRecommendation {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  location: string;
  distance: number;
  responseTime: number;
  matchScore: MatchScore;
  isOnline: boolean;
  skills: string[];
  completedTasks: number;
}

interface TaskAnalysis {
  quality: QualityMetrics;
  demand: DemandForecast;
  recommendations: string[];
}

export default function AITaskMatcher({ task }: { task: any }) {
  const [taskers, setTaskers] = useState<TaskerRecommendation[]>([]);
  const [analysis, setAnalysis] = useState<TaskAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTasker, setSelectedTasker] = useState<string | null>(null);

  useEffect(() => {
    analyzeTaskAndFindMatches();
  }, [task]);

  const analyzeTaskAndFindMatches = async () => {
    setLoading(true);
    try {
      // Analyze task quality
      const quality = await assessContentQuality(task.description);
      
      // Get demand forecast
      const demand = await forecastDemand(task.category, task.location);
      
      // Find best taskers
      const taskRequirements: TaskRequirements = {
        id: task.id,
        title: task.title,
        category: task.category,
        location: {
          latitude: task.latitude || 0,
          longitude: task.longitude || 0,
          address: task.location
        },
        pay: task.pay,
        urgency: task.urgency || 'medium',
        complexity: task.complexity || 'moderate',
        estimatedDuration: task.estimatedDuration || 2,
        requiredSkills: task.requiredSkills || [],
        clientRating: task.clientRating || 4.0,
        clientHistory: {
          completedTasks: task.clientHistory?.completedTasks || 0,
          cancellationRate: task.clientHistory?.cancellationRate || 0
        }
      };

      const matches = await findBestTaskers(taskRequirements, 10);
      
      // Convert matches to tasker recommendations
      const recommendations = await convertMatchesToRecommendations(matches);
      
      setTaskers(recommendations);
      setAnalysis({
        quality,
        demand,
        recommendations: generateTaskRecommendations(quality, demand)
      });

    } catch (error) {
      console.error('[AI] Task analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertMatchesToRecommendations = async (matches: MatchScore[]): Promise<TaskerRecommendation[]> => {
    // In a real implementation, this would fetch tasker profiles from the database
    // For now, we'll create mock data
    return matches.map((match, index) => ({
      id: match.taskerId,
      name: `Tasker ${index + 1}`,
      avatar: `/avatars/tasker-${index + 1}.jpg`,
      rating: 4.2 + (Math.random() * 0.8),
      reviewCount: 50 + Math.floor(Math.random() * 200),
      location: 'Cebu City',
      distance: 2 + Math.random() * 8,
      responseTime: 5 + Math.floor(Math.random() * 25),
      matchScore: match,
      isOnline: Math.random() > 0.3,
      skills: ['Plumbing', 'Repair', 'Installation'],
      completedTasks: 100 + Math.floor(Math.random() * 400)
    }));
  };

  const generateTaskRecommendations = (quality: QualityMetrics, demand: DemandForecast): string[] => {
    const recommendations: string[] = [];

    if (quality.overallScore < 0.7) {
      recommendations.push('Consider improving task description for better matches');
    }

    if (quality.spamScore > 0.5) {
      recommendations.push('Task description appears promotional - focus on task details');
    }

    if (demand.trends.direction === 'increasing') {
      recommendations.push('High demand period - expect quick responses');
    } else if (demand.trends.direction === 'decreasing') {
      recommendations.push('Lower demand - consider adjusting timing or pricing');
    }

    if (quality.recommendations.length > 0) {
      recommendations.push(...quality.recommendations.slice(0, 2));
    }

    return recommendations;
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 0.8) return <Badge className="bg-green-100 text-green-800">Excellent Match</Badge>;
    if (score >= 0.6) return <Badge className="bg-yellow-100 text-yellow-800">Good Match</Badge>;
    return <Badge className="bg-red-100 text-red-800">Fair Match</Badge>;
  };

  const formatDistance = (distance: number) => {
    return `${distance.toFixed(1)} km away`;
  };

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>AI Task Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Analysis */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>AI Task Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quality Score */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Task Quality</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-lg font-bold ${getScoreColor(analysis.quality.overallScore)}`}>
                  {(analysis.quality.overallScore * 100).toFixed(0)}%
                </span>
                {getScoreBadge(analysis.quality.overallScore)}
              </div>
            </div>
            <Progress value={analysis.quality.overallScore * 100} className="h-2" />

            {/* Demand Forecast */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium">Demand Forecast</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${analysis.demand.trends.direction === 'increasing' ? 'text-green-600' : 'text-red-600'}`}>
                  {analysis.demand.trends.direction === 'increasing' ? '↗' : '↘'} {analysis.demand.trends.direction}
                </span>
              </div>
            </div>

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Recommendations:</h4>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tasker Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>AI-Recommended Taskers</span>
            <Badge variant="secondary">{taskers.length} matches</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {taskers.map((tasker) => (
              <div
                key={tasker.id}
                className={`border rounded-lg p-4 transition-all cursor-pointer ${
                  selectedTasker === tasker.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTasker(tasker.id)}
              >
                <div className="flex items-start space-x-4">
                  {/* Avatar and Basic Info */}
                  <div className="flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={tasker.avatar} />
                      <AvatarFallback>{tasker.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {tasker.isOnline && (
                      <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white -mt-2 ml-9"></div>
                    )}
                  </div>

                  {/* Tasker Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{tasker.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{tasker.rating.toFixed(1)}</span>
                            <span>({tasker.reviewCount})</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{formatDistance(tasker.distance)}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatResponseTime(tasker.responseTime)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Match Score */}
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(tasker.matchScore.overallScore)}`}>
                          {(tasker.matchScore.overallScore * 100).toFixed(0)}%
                        </div>
                        {getScoreBadge(tasker.matchScore.overallScore)}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tasker.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Match Breakdown */}
                    {selectedTasker === tasker.id && (
                      <div className="mt-4 space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Skill Match:</span>
                            <Progress value={tasker.matchScore.breakdown.skillMatch * 100} className="h-1 mt-1" />
                          </div>
                          <div>
                            <span className="text-gray-600">Location:</span>
                            <Progress value={tasker.matchScore.breakdown.locationScore * 100} className="h-1 mt-1" />
                          </div>
                          <div>
                            <span className="text-gray-600">Rating:</span>
                            <Progress value={tasker.matchScore.breakdown.ratingScore * 100} className="h-1 mt-1" />
                          </div>
                          <div>
                            <span className="text-gray-600">Availability:</span>
                            <Progress value={tasker.matchScore.breakdown.availabilityScore * 100} className="h-1 mt-1" />
                          </div>
                        </div>

                        {/* Reasoning */}
                        <div className="mt-3">
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Why this match:</h4>
                          <ul className="space-y-1">
                            {tasker.matchScore.reasoning.map((reason, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex space-x-2">
                          <Button size="sm" className="flex-1">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                          <Button size="sm" variant="outline">
                            <Award className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {taskers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No matching taskers found</p>
              <p className="text-sm">Try adjusting your task requirements or location</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 