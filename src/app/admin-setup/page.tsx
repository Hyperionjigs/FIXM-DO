"use client";

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Mail,
  User
} from 'lucide-react';
import Link from 'next/link';
import { isAdmin, addAdminUser, ADMIN_EMAIL_DOMAINS } from '@/lib/admin-config';

export default function AdminSetupPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [emailDomain, setEmailDomain] = useState('');

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "User ID copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Please copy the ID manually.",
      });
    }
  };

  const isUserAdmin = user && isAdmin(user.uid, user.email || null);
  const isEmailDomainAdmin = user && user.email && ADMIN_EMAIL_DOMAINS.some(domain => 
    user.email?.toLowerCase().endsWith(domain)
  );

  // Debug logging
  console.log('Admin Setup Debug:', {
    user: user ? { uid: user.uid, email: user.email } : null,
    isUserAdmin,
    isEmailDomainAdmin,
    adminDomains: ADMIN_EMAIL_DOMAINS,
    userEmailDomain: user?.email?.split('@')[1]
  });

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Please log in to access admin setup.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Setup Guide</h1>
        <p className="text-muted-foreground">
          Configure admin access for your Fixmotech platform.
        </p>
      </div>

      {/* Current Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Admin Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {isUserAdmin ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium">
                  {isUserAdmin ? 'You have admin access!' : 'Admin access not configured'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isUserAdmin 
                    ? 'You can access the admin dashboard and manage the platform.'
                    : 'Follow the steps below to get admin access.'
                  }
                </p>
              </div>
            </div>

            {isEmailDomainAdmin && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Mail className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Email Domain Admin Access
                  </p>
                  <p className="text-xs text-green-600">
                    Your email domain ({user.email?.split('@')[1]}) is whitelisted for admin access.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Method 1: Email Domain (Recommended) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Method 1: Email Domain Access (Recommended)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The easiest way to get admin access is to use an email from a whitelisted domain.
            </p>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Whitelisted Domains:</h4>
              <div className="space-y-1">
                {ADMIN_EMAIL_DOMAINS.map((domain) => (
                  <div key={domain} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <code className="text-sm">@{domain}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-800">How to add your domain:</h4>
              <p className="text-sm text-blue-700">
                Edit <code className="bg-blue-100 px-1 rounded">src/lib/admin-config.ts</code> and add your email domain to the <code className="bg-blue-100 px-1 rounded">ADMIN_EMAIL_DOMAINS</code> array.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Method 2: Manual User ID */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Method 2: Manual User ID Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you prefer manual configuration, copy your User ID and add it to the admin configuration.
            </p>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Your User ID:</h4>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-background px-3 py-2 rounded flex-1 font-mono">
                  {user.uid}
                </code>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(user.uid)}
                  className="flex items-center gap-1"
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-yellow-800">Configuration Steps:</h4>
              <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                <li>Copy your User ID above</li>
                <li>Edit <code className="bg-yellow-100 px-1 rounded">src/lib/admin-config.ts</code></li>
                <li>Add your User ID to the <code className="bg-yellow-100 px-1 rounded">ADMIN_USER_IDS</code> array</li>
                <li>Restart the development server</li>
                <li>Access the admin dashboard</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {isUserAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  Go to Admin Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/transaction-logs">
                  <span>View Transaction Logs</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}


    </div>
  );
} 