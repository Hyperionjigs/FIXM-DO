"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Settings, 
  Eye, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Save,
  RotateCcw,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from 'firebase/auth';

interface VerificationSettings {
  // Main thresholds
  confidenceThreshold: number;
  livenessThreshold: number;
  antiSpoofingThreshold: number;
  qualityThreshold: number;
  
  // Risk calculation thresholds
  lowConfidenceThreshold: number;
  lowLivenessThreshold: number;
  lowQualityThreshold: number;
  lowAntiSpoofingThreshold: number;
  
  // Processing settings
  autoCaptureDelay: number;
  countdownDuration: number;
  maxRetries: number;
  
  // Debug mode
  debugMode: boolean;
  
  // Preset modes
  strictMode: boolean;
  lenientMode: boolean;
}

const PRESET_CONFIGS = {
  strict: {
    confidenceThreshold: 0.85,
    livenessThreshold: 0.8,
    antiSpoofingThreshold: 0.9,
    qualityThreshold: 0.7,
    lowConfidenceThreshold: 0.6,
    lowLivenessThreshold: 0.6,
    lowQualityThreshold: 0.6,
    lowAntiSpoofingThreshold: 0.7,
  },
  balanced: {
    confidenceThreshold: 0.75,
    livenessThreshold: 0.7,
    antiSpoofingThreshold: 0.8,
    qualityThreshold: 0.6,
    lowConfidenceThreshold: 0.5,
    lowLivenessThreshold: 0.5,
    lowQualityThreshold: 0.5,
    lowAntiSpoofingThreshold: 0.6,
  },
  lenient: {
    confidenceThreshold: 0.60,
    livenessThreshold: 0.6,
    antiSpoofingThreshold: 0.7,
    qualityThreshold: 0.5,
    lowConfidenceThreshold: 0.3,
    lowLivenessThreshold: 0.3,
    lowQualityThreshold: 0.3,
    lowAntiSpoofingThreshold: 0.4,
  },

};

export function VerificationSettingsPanel() {
  const { toast } = useToast();
  
  const getAuthToken = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      // If no current user, try to get from auth state
      return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          unsubscribe();
          if (user) {
            try {
              const token = await user.getIdToken();
              resolve(token);
            } catch (error) {
              console.error('Error getting auth token:', error);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Error in getAuthToken:', error);
      return null;
    }
  };
  const [settings, setSettings] = useState<VerificationSettings>({
    confidenceThreshold: 0.60,
    livenessThreshold: 0.6,
    antiSpoofingThreshold: 0.7,
    qualityThreshold: 0.5,
    lowConfidenceThreshold: 0.3,
    lowLivenessThreshold: 0.3,
    lowQualityThreshold: 0.3,
    lowAntiSpoofingThreshold: 0.4,
    autoCaptureDelay: 3000,
    countdownDuration: 3,
    maxRetries: 3,
    debugMode: false,
    strictMode: false,
    lenientMode: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        console.log('No auth token available for loading settings');
        return;
      }
      
      const response = await fetch('/api/admin/config', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const config = await response.json();
        setSettings(prev => ({
          ...prev,
          confidenceThreshold: config.aiConfidenceThreshold || 0.60,
          debugMode: config.debugMode || false,
        }));
      } else {
        console.error('Failed to load settings:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSettings = (updates: Partial<VerificationSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      setHasChanges(true);
      return newSettings;
    });
  };

  const applyPreset = (presetName: keyof typeof PRESET_CONFIGS) => {
    const preset = PRESET_CONFIGS[presetName];
    setSettings(prev => ({
      ...prev,
      ...preset,
      strictMode: presetName === 'strict',
      lenientMode: presetName === 'lenient',
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      
      let response;
      
      if (token) {
        // Try with authentication first
        response = await fetch('/api/admin/config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: 'update_verification',
            aiConfidenceThreshold: settings.confidenceThreshold,
            debugMode: settings.debugMode,
            verificationSettings: settings,
          }),
        });
      } else {
        // Fallback: try without authentication (for testing)
        response = await fetch('/api/admin/config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update_verification',
            aiConfidenceThreshold: settings.confidenceThreshold,
            debugMode: settings.debugMode,
            verificationSettings: settings,
          }),
        });
      }

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Settings Saved',
          description: result.message || 'Verification settings have been updated successfully.',
        });
        setHasChanges(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Save settings error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save verification settings.',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    setSettings(prev => ({
      ...prev,
      ...PRESET_CONFIGS.lenient,
      strictMode: false,
      lenientMode: true,
    }));
    setHasChanges(true);
  };

  const getSecurityLevel = () => {
    const avgThreshold = (
      settings.confidenceThreshold + 
      settings.livenessThreshold + 
      settings.antiSpoofingThreshold + 
      settings.qualityThreshold
    ) / 4;

    if (avgThreshold >= 0.8) return { level: 'High', color: 'bg-red-100 text-red-800', icon: Shield };
    if (avgThreshold >= 0.7) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    if (avgThreshold >= 0.6) return { level: 'Low', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    return { level: 'Testing', color: 'bg-blue-100 text-blue-800', icon: Zap };
  };

  const securityLevel = getSecurityLevel();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Verification Settings
          <Badge className={securityLevel.color}>
            <securityLevel.icon className="h-3 w-3 mr-1" />
            {securityLevel.level} Security
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Buttons */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Presets</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={settings.strictMode ? "default" : "outline"}
              size="sm"
              onClick={() => applyPreset('strict')}
            >
              <Shield className="h-3 w-3 mr-1" />
              Strict
            </Button>
            <Button
              variant={settings.lenientMode ? "default" : "outline"}
              size="sm"
              onClick={() => applyPreset('lenient')}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Lenient
            </Button>

          </div>
        </div>

        <Separator />

        {/* Main Thresholds */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Main Thresholds</Label>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-xs">Confidence Threshold</Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(settings.confidenceThreshold * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.confidenceThreshold]}
                onValueChange={([value]) => updateSettings({ confidenceThreshold: value })}
                max={1}
                min={0.1}
                step={0.05}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-xs">Liveness Threshold</Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(settings.livenessThreshold * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.livenessThreshold]}
                onValueChange={([value]) => updateSettings({ livenessThreshold: value })}
                max={1}
                min={0.1}
                step={0.05}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-xs">Anti-Spoofing Threshold</Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(settings.antiSpoofingThreshold * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.antiSpoofingThreshold]}
                onValueChange={([value]) => updateSettings({ antiSpoofingThreshold: value })}
                max={1}
                min={0.1}
                step={0.05}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-xs">Quality Threshold</Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(settings.qualityThreshold * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.qualityThreshold]}
                onValueChange={([value]) => updateSettings({ qualityThreshold: value })}
                max={1}
                min={0.1}
                step={0.05}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Processing Settings */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Processing Settings</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Auto Capture Delay (ms)</Label>
              <input
                type="number"
                value={settings.autoCaptureDelay}
                onChange={(e) => updateSettings({ autoCaptureDelay: parseInt(e.target.value) })}
                className="w-full mt-1 px-2 py-1 text-xs border rounded"
                min={1000}
                max={10000}
                step={500}
              />
            </div>
            
            <div>
              <Label className="text-xs">Countdown Duration</Label>
              <input
                type="number"
                value={settings.countdownDuration}
                onChange={(e) => updateSettings({ countdownDuration: parseInt(e.target.value) })}
                className="w-full mt-1 px-2 py-1 text-xs border rounded"
                min={1}
                max={10}
              />
            </div>
            
            <div>
              <Label className="text-xs">Max Retries</Label>
              <input
                type="number"
                value={settings.maxRetries}
                onChange={(e) => updateSettings({ maxRetries: parseInt(e.target.value) })}
                className="w-full mt-1 px-2 py-1 text-xs border rounded"
                min={1}
                max={10}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Debug Mode */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Debug Mode</Label>
            <p className="text-xs text-muted-foreground">
              Enable detailed logging for troubleshooting
            </p>
          </div>
          <Switch
            checked={settings.debugMode}
            onCheckedChange={(checked) => updateSettings({ debugMode: checked })}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={saveSettings}
            disabled={loading || !hasChanges}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
          
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={loading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Info Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">Current Settings Impact:</p>
              <ul className="space-y-1">
                <li>• <strong>Confidence:</strong> {Math.round(settings.confidenceThreshold * 100)}% - Face detection accuracy</li>
                <li>• <strong>Liveness:</strong> {Math.round(settings.livenessThreshold * 100)}% - Live photo detection</li>
                <li>• <strong>Anti-Spoofing:</strong> {Math.round(settings.antiSpoofingThreshold * 100)}% - Fraud prevention</li>
                <li>• <strong>Quality:</strong> {Math.round(settings.qualityThreshold * 100)}% - Image quality requirements</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 