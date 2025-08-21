"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentQualityFeedback } from '@/components/content-quality-feedback';
import { assessContentQuality } from '@/lib/content-quality';

export default function TestContentQualityPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [qualityResult, setQualityResult] = useState<any>(null);

  const testCases = [
    {
      name: "Poor Quality - Placeholder Content",
      title: "asdasdasdasd",
      description: "I offer asdasdasdasd services. Professional, reliable, and..."
    },
    {
      name: "Poor Quality - Generic Content",
      title: "help needed",
      description: "need help with something urgent"
    },
    {
      name: "Good Quality - Specific Task",
      title: "Need a reliable plumber for bathroom renovation",
      description: "I need a licensed plumber to help renovate my bathroom. The work includes replacing old pipes, installing new fixtures, and ensuring proper drainage. Must have experience with bathroom renovations and be available next week. Budget is flexible for quality work."
    },
    {
      name: "Excellent Quality - Professional Service",
      title: "Professional house cleaning service in Makati",
      description: "I offer comprehensive house cleaning services in Makati and surrounding areas. Services include deep cleaning, regular maintenance, and specialized cleaning for move-in/move-out. I have 5+ years of experience, use eco-friendly products, and provide flexible scheduling. Licensed and insured with excellent references available."
    }
  ];

  const runTest = (testCase: any) => {
    setTitle(testCase.title);
    setDescription(testCase.description);
    const result = assessContentQuality(testCase.title, testCase.description);
    setQualityResult(result);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Content Quality Validation Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This page demonstrates how the content quality validation system prevents poorly made posts 
            like the one you showed with "asdasdasdasd" content.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Test Cases</h3>
              <div className="space-y-2">
                {testCases.map((testCase, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => runTest(testCase)}
                    className="w-full justify-start text-left h-auto p-3"
                  >
                    <div>
                      <div className="font-medium">{testCase.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        "{testCase.title.substring(0, 30)}..."
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Manual Test</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title to test..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a description to test..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={() => {
                    const result = assessContentQuality(title, description);
                    setQualityResult(result);
                  }}
                  disabled={!title && !description}
                >
                  Test Quality
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Quality Feedback */}
      <ContentQualityFeedback
        title={title}
        description={description}
        onQualityChange={setQualityResult}
        showSuggestions={true}
      />

      {/* Raw Results */}
      {qualityResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Raw Quality Assessment Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(qualityResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How Content Quality Validation Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Placeholder Detection</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Repeated characters (e.g., "asdasdasdasd")</li>
                <li>• Keyboard mashing patterns</li>
                <li>• Common placeholder words</li>
                <li>• Very repetitive patterns</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Quality Metrics</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Readability score (Flesch Reading Ease)</li>
                <li>• Specificity and detail level</li>
                <li>• Professionalism and tone</li>
                <li>• Content length and structure</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Benefits</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Prevents spam and placeholder content</li>
              <li>• Encourages detailed, professional posts</li>
              <li>• Improves user experience and search results</li>
              <li>• Reduces moderation workload</li>
              <li>• Provides real-time feedback to users</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 