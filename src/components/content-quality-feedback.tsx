"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ContentQualityResult } from '@/lib/content-quality';

interface ContentQualityFeedbackProps {
  title: string;
  description: string;
  onQualityChange?: (result: ContentQualityResult) => void;
  showSuggestions?: boolean;
  className?: string;
}

export function ContentQualityFeedback({
  title,
  description,
  onQualityChange,
  showSuggestions = true,
  className = '',
}: ContentQualityFeedbackProps) {
  const [qualityResult, setQualityResult] = useState<ContentQualityResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAssessment, setLastAssessment] = useState<string>('');

  // Debounced assessment to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (title.length > 3 || description.length > 10) {
        await assessQuality();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [title, description]);

  const assessQuality = async () => {
    if (!title.trim() && !description.trim()) {
      setQualityResult(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/assess-content-quality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setQualityResult(result);
        setLastAssessment(new Date().toISOString());
        onQualityChange?.(result);
      }
    } catch (error) {
      console.error('Error assessing content quality:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!qualityResult && !isLoading) {
    return null;
  }

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="h-4 w-4" />;
    if (score >= 0.6) return <AlertTriangle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const getQualityLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Quality Score Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Content Quality</span>
            </div>
            {qualityResult && (
              <Badge 
                variant={qualityResult.score >= 0.8 ? 'default' : qualityResult.score >= 0.6 ? 'secondary' : 'destructive'}
                className="text-xs"
              >
                {getQualityLabel(qualityResult.score)}
              </Badge>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Analyzing content quality...
            </div>
          )}

          {/* Quality Result */}
          {qualityResult && !isLoading && (
            <>
              {/* Score Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Quality Score</span>
                  <span className={`font-medium ${getQualityColor(qualityResult.score)}`}>
                    {Math.round(qualityResult.score * 100)}%
                  </span>
                </div>
                <Progress 
                  value={qualityResult.score * 100} 
                  className="h-2"
                />
              </div>

              {/* Issues */}
              {qualityResult.issues.length > 0 && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <div className="space-y-1">
                      {qualityResult.issues.map((issue, index) => (
                        <div key={index}>• {issue}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Suggestions */}
              {showSuggestions && qualityResult.suggestions.length > 0 && (
                <Alert className="py-2">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <div className="space-y-1">
                      {qualityResult.suggestions.map((suggestion, index) => (
                        <div key={index}>💡 {suggestion}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Moderation Warning */}
              {qualityResult.requiresModeration && (
                <Alert variant="destructive" className="py-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    This post may require moderation before being published.
                  </AlertDescription>
                </Alert>
              )}

              {/* Quality Indicators */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${qualityResult.score >= 0.4 ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>Valid Content</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${!qualityResult.requiresModeration ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span>Auto-Approved</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 