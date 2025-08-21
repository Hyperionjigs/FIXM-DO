"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Lock, Zap } from 'lucide-react';
import Link from 'next/link';

interface SecurityReassuranceProps {
  variant?: 'compact' | 'detailed';
  className?: string;
}

export function SecurityReassurance({ variant = 'detailed', className = '' }: SecurityReassuranceProps) {
  if (variant === 'compact') {
    return (
      <div className={`bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
          <div className="flex-1">
            <h4 className="font-medium text-green-800 dark:text-green-200">🔒 Enterprise-Grade Security</h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              AI verification • Encrypted payments • Fraud protection
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/help">Learn More</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={`border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
          <Shield className="h-5 w-5" />
          <span>Your Security is Our Priority</span>
        </CardTitle>
        <CardDescription className="text-green-700 dark:text-green-300">
          FixMo uses enterprise-grade security measures to protect you and your data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-800 dark:text-green-200">AI-Powered Verification (95%+ accuracy)</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-800 dark:text-green-200">HTTPS-Only PWA Installation</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-800 dark:text-green-200">Secure Payment Escrow System</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-800 dark:text-green-200">Real-Time Fraud Detection</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-800 dark:text-green-200">Enterprise-Grade Encryption</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-800 dark:text-green-200">OWASP Top 10 Compliance</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            <Lock className="h-3 w-3 mr-1" />
            Data Encrypted
          </Badge>
          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            <Zap className="h-3 w-3 mr-1" />
            AI Verified
          </Badge>
          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            <Shield className="h-3 w-3 mr-1" />
            Audit Passed
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline" className="border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900">
            <Link href="/help">View Security Details</Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200">
            <Link href="/help#security">FAQ</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 