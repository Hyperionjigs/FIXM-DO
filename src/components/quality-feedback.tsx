"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Sun, 
  Contrast, 
  Focus, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  TrendingUp
} from "lucide-react";
import { QualityFeedback as QualityFeedbackType, ImageQualityAssessment } from "@/lib/image-quality-assessment";
import { cn } from "@/lib/utils";

interface QualityFeedbackProps {
  feedback: QualityFeedbackType;
  isRealTime?: boolean;
  className?: string;
}

export function QualityFeedback({ feedback, isRealTime = false, className }: QualityFeedbackProps) {
  const { metrics, issues, suggestions, isAcceptable } = feedback;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Image Quality Analysis
            {isRealTime && (
              <Badge variant="secondary" className="text-xs">
                Live
              </Badge>
            )}
          </CardTitle>
          <Badge 
            variant={isAcceptable ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            {isAcceptable ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Acceptable
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3" />
                Needs Improvement
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Quality</span>
            <span className={cn("text-sm font-bold", ImageQualityAssessment.getQualityColor(metrics.overall))}>
              {metrics.overall}% - {ImageQualityAssessment.getQualityStatus(metrics.overall)}
            </span>
          </div>
          <Progress 
            value={metrics.overall} 
            className="h-2"
          />
        </div>

        {/* Individual Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Sun className="h-4 w-4" />
                <span className="text-xs font-medium">Brightness</span>
              </div>
              <span className="text-xs font-bold">{metrics.brightness}%</span>
            </div>
            <Progress value={metrics.brightness} className="h-1.5" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Contrast className="h-4 w-4" />
                <span className="text-xs font-medium">Contrast</span>
              </div>
              <span className="text-xs font-bold">{metrics.contrast}%</span>
            </div>
            <Progress value={metrics.contrast} className="h-1.5" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Focus className="h-4 w-4" />
                <span className="text-xs font-medium">Sharpness</span>
              </div>
              <span className="text-xs font-bold">{metrics.sharpness}%</span>
            </div>
            <Progress value={metrics.sharpness} className="h-1.5" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span className="text-xs font-medium">Noise</span>
              </div>
              <span className="text-xs font-bold">{100 - metrics.noise}%</span>
            </div>
            <Progress value={100 - metrics.noise} className="h-1.5" />
          </div>
        </div>

        {/* Issues */}
        {issues.length > 0 && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <div className="font-medium mb-1">Quality Issues:</div>
              <ul className="list-disc list-inside space-y-1">
                {issues.map((issue, index) => (
                  <li key={index} className="text-xs">{issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Lightbulb className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <div className="font-medium mb-1">Suggestions:</div>
              <ul className="list-disc list-inside space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-xs">{suggestion}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
} 