"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Settings, 
  Eye, 
  Bell, 
  Camera, 
  Database, 
  Globe, 
  Users,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Zap,
  Lock,
  Palette,
  Mail,
  CreditCard
} from 'lucide-react';
import { isAdmin, hasPermission, getAdminUserInfo } from '@/lib/admin-config';
import { configService, SystemConfig, defaultConfig } from '@/lib/config-service';
import { SmartErrorTooltip } from '@/components/smart-error-tooltip';





export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  const userIsAdmin = user && isAdmin(user.uid, user.email || null);
  const adminInfo = user ? getAdminUserInfo(user.uid, user.email || null) : null;

  useEffect(() => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please log in to access this page.',
      });
      return;
    }

    if (!userIsAdmin) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
      });
      return;
    }

    loadConfig();
  }, [user, userIsAdmin]);

  const loadConfig = async () => {
    if (!user || !userIsAdmin) return;

    setLoading(true);
    setError(null);
    try {
      await configService.initialize();
      const currentConfig = configService.getConfig();
      setConfig(currentConfig);
    } catch (error) {
      console.error('Error loading config:', error);
      // Fallback to default config
      setConfig(defaultConfig);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load configuration';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load configuration. Using default settings.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key: keyof SystemConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const saveConfig = async () => {
    if (!user || !userIsAdmin) return;

    setSaving(true);
    setError(null);
    try {
      // Validate configuration before saving
      const validation = configService.validateConfig(config);
      if (!validation.valid) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }

      await configService.updateConfig(config);
      
      toast({
        title: 'Success',
        description: 'Configuration saved successfully.',
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving config:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save configuration';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const resetConfig = async () => {
    if (!user || !userIsAdmin) return;

    try {
      await configService.reset();
      const currentConfig = configService.getConfig();
      setConfig(currentConfig);
      setHasChanges(false);
      toast({
        title: 'Reset',
        description: 'Configuration reset to defaults.',
      });
    } catch (error) {
      console.error('Error resetting config:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reset configuration.',
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Please log in to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userIsAdmin) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You do not have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">System Configuration</h1>
            <p className="text-muted-foreground">
              Configure platform settings and preferences for Fixmotech Reference.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              {adminInfo?.role || 'Admin'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6">
          <SmartErrorTooltip
            error={error}
            context="config"
            onDismiss={() => setError(null)}
            showDetails={true}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          onClick={saveConfig} 
          disabled={!hasChanges || saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button 
          variant="outline" 
          onClick={resetConfig}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset to Defaults
        </Button>
        {hasChanges && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Unsaved Changes
          </Badge>
        )}
      </div>

      {/* Configuration Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Verification
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            AI & Performance
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Platform Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    value={config.platformName}
                    onChange={(e) => handleConfigChange('platformName', e.target.value)}
                    placeholder="Enter platform name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platformDescription">Platform Description</Label>
                  <Input
                    id="platformDescription"
                    value={config.platformDescription}
                    onChange={(e) => handleConfigChange('platformDescription', e.target.value)}
                    placeholder="Enter platform description"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable the platform for maintenance
                    </p>
                  </div>
                  <Switch
                    checked={config.maintenanceMode}
                    onCheckedChange={(checked) => handleConfigChange('maintenanceMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable detailed logging and debugging
                    </p>
                  </div>
                  <Switch
                    checked={config.debugMode}
                    onCheckedChange={(checked) => handleConfigChange('debugMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Authentication & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={config.maxLoginAttempts}
                    onChange={(e) => handleConfigChange('maxLoginAttempts', parseInt(e.target.value))}
                    min="1"
                    max="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={config.sessionTimeout}
                    onChange={(e) => handleConfigChange('sessionTimeout', parseInt(e.target.value))}
                    min="300"
                    max="86400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={config.passwordMinLength}
                    onChange={(e) => handleConfigChange('passwordMinLength', parseInt(e.target.value))}
                    min="6"
                    max="32"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Force 2FA for all users
                    </p>
                  </div>
                  <Switch
                    checked={config.requireTwoFactor}
                    onCheckedChange={(checked) => handleConfigChange('requireTwoFactor', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Settings */}
        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Verification System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Selfie Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable selfie-based identity verification
                    </p>
                  </div>
                  <Switch
                    checked={config.selfieVerificationEnabled}
                    onCheckedChange={(checked) => handleConfigChange('selfieVerificationEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Anti-Spoofing Protection</Label>
                    <p className="text-sm text-muted-foreground">
                      Detect and prevent spoofing attempts
                    </p>
                  </div>
                  <Switch
                    checked={config.antiSpoofingEnabled}
                    onCheckedChange={(checked) => handleConfigChange('antiSpoofingEnabled', checked)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="verificationTimeout">Verification Timeout (seconds)</Label>
                  <Input
                    id="verificationTimeout"
                    type="number"
                    value={config.verificationTimeout}
                    onChange={(e) => handleConfigChange('verificationTimeout', parseInt(e.target.value))}
                    min="60"
                    max="1800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxVerificationAttempts">Max Verification Attempts</Label>
                  <Input
                    id="maxVerificationAttempts"
                    type="number"
                    value={config.maxVerificationAttempts}
                    onChange={(e) => handleConfigChange('maxVerificationAttempts', parseInt(e.target.value))}
                    min="1"
                    max="10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={config.emailNotifications}
                    onCheckedChange={(checked) => handleConfigChange('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send push notifications to devices
                    </p>
                  </div>
                  <Switch
                    checked={config.pushNotifications}
                    onCheckedChange={(checked) => handleConfigChange('pushNotifications', checked)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={config.smsNotifications}
                    onCheckedChange={(checked) => handleConfigChange('smsNotifications', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notificationFrequency">Notification Frequency</Label>
                  <Select
                    value={config.notificationFrequency}
                    onValueChange={(value) => handleConfigChange('notificationFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Payments</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to make payments on the platform
                  </p>
                </div>
                <Switch
                  checked={config.paymentEnabled}
                  onCheckedChange={(checked) => handleConfigChange('paymentEnabled', checked)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={config.currency}
                    onValueChange={(value) => handleConfigChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHP">Philippine Peso (₱)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionFee">Transaction Fee (%)</Label>
                  <Input
                    id="transactionFee"
                    type="number"
                    step="0.1"
                    value={config.transactionFee}
                    onChange={(e) => handleConfigChange('transactionFee', parseFloat(e.target.value))}
                    min="0"
                    max="10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumPayment">Minimum Payment</Label>
                  <Input
                    id="minimumPayment"
                    type="number"
                    value={config.minimumPayment}
                    onChange={(e) => handleConfigChange('minimumPayment', parseFloat(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maximumPayment">Maximum Payment</Label>
                  <Input
                    id="maximumPayment"
                    type="number"
                    value={config.maximumPayment}
                    onChange={(e) => handleConfigChange('maximumPayment', parseFloat(e.target.value))}
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI & Performance Settings */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI & Performance Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aiModelVersion">AI Model Version</Label>
                  <Input
                    id="aiModelVersion"
                    value={config.aiModelVersion}
                    onChange={(e) => handleConfigChange('aiModelVersion', e.target.value)}
                    placeholder="e.g., v2.1.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aiConfidenceThreshold">AI Confidence Threshold</Label>
                  <Input
                    id="aiConfidenceThreshold"
                    type="number"
                    step="0.01"
                    value={config.aiConfidenceThreshold}
                    onChange={(e) => handleConfigChange('aiConfidenceThreshold', parseFloat(e.target.value))}
                    min="0"
                    max="1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aiProcessingTimeout">AI Processing Timeout (seconds)</Label>
                  <Input
                    id="aiProcessingTimeout"
                    type="number"
                    value={config.aiProcessingTimeout}
                    onChange={(e) => handleConfigChange('aiProcessingTimeout', parseInt(e.target.value))}
                    min="10"
                    max="300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable AI Testing</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow AI model testing and experimentation
                    </p>
                  </div>
                  <Switch
                    checked={config.enableAITesting}
                    onCheckedChange={(checked) => handleConfigChange('enableAITesting', checked)}
                  />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Caching</Label>
                    <p className="text-sm text-muted-foreground">
                      Cache frequently accessed data
                    </p>
                  </div>
                  <Switch
                    checked={config.cacheEnabled}
                    onCheckedChange={(checked) => handleConfigChange('cacheEnabled', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cacheTimeout">Cache Timeout (seconds)</Label>
                  <Input
                    id="cacheTimeout"
                    type="number"
                    value={config.cacheTimeout}
                    onChange={(e) => handleConfigChange('cacheTimeout', parseInt(e.target.value))}
                    min="60"
                    max="86400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Image Compression</Label>
                    <p className="text-sm text-muted-foreground">
                      Compress uploaded images for better performance
                    </p>
                  </div>
                  <Switch
                    checked={config.imageCompression}
                    onCheckedChange={(checked) => handleConfigChange('imageCompression', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxImageSize">Max Image Size (bytes)</Label>
                  <Input
                    id="maxImageSize"
                    type="number"
                    value={config.maxImageSize}
                    onChange={(e) => handleConfigChange('maxImageSize', parseInt(e.target.value))}
                    min="1048576"
                    max="10485760"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Status */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Security: Optimal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Performance: Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">AI Model: v2.1.0</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 