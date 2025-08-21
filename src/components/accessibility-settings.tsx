'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Eye, Volume2, MousePointer, Keyboard, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { accessibilitySystem } from '@/lib/accessibility-system';
import { useTranslation } from '@/lib/internationalization';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessibilitySettings({ isOpen, onClose }: AccessibilitySettingsProps) {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    enableScreenReader: true,
    enableKeyboardNavigation: true,
    enableHighContrast: false,
    enableReducedMotion: false,
    enableVoiceCommands: false,
    focusIndicatorStyle: 'outline' as const,
  });

  useEffect(() => {
    if (isOpen) {
      // Load current settings
      const config = accessibilitySystem.getConfig();
      setSettings({
        enableScreenReader: config.enableScreenReader,
        enableKeyboardNavigation: config.enableKeyboardNavigation,
        enableHighContrast: config.enableHighContrast,
        enableReducedMotion: config.enableReducedMotion,
        enableVoiceCommands: config.enableVoiceCommands,
        focusIndicatorStyle: config.focusIndicatorStyle,
      });
    }
  }, [isOpen]);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Update accessibility system
    accessibilitySystem.updateConfig(newSettings);
    
    // Announce changes to screen reader
    const settingNames = {
      enableScreenReader: 'screen reader support',
      enableKeyboardNavigation: 'keyboard navigation',
      enableHighContrast: 'high contrast mode',
      enableReducedMotion: 'reduced motion',
      enableVoiceCommands: 'voice commands',
      focusIndicatorStyle: 'focus indicator style',
    };
    
    const status = value ? 'enabled' : 'disabled';
    accessibilitySystem.announce(
      `${settingNames[key]} ${status}`,
      'polite'
    );
  };

  const handleFocusStyleChange = (style: 'outline' | 'ring' | 'glow') => {
    handleSettingChange('focusIndicatorStyle', style);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-settings-title"
    >
      <div className="bg-background rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            <h2
              id="accessibility-settings-title"
              className="text-xl font-semibold"
            >
              {t('common.accessibilitySettings') || 'Accessibility Settings'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close accessibility settings"
          >
            ×
          </Button>
        </div>

        <div className="space-y-6">
          {/* Screen Reader Support */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">
                    {t('common.screenReader') || 'Screen Reader Support'}
                  </CardTitle>
                  <CardDescription>
                    {t('common.screenReaderDescription') || 'Enable screen reader announcements and ARIA labels'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="screen-reader" className="text-sm">
                  {t('common.enableScreenReader') || 'Enable screen reader support'}
                </Label>
                <Switch
                  id="screen-reader"
                  checked={settings.enableScreenReader}
                  onCheckedChange={(checked) => handleSettingChange('enableScreenReader', checked)}
                  aria-label="Toggle screen reader support"
                />
              </div>
            </CardContent>
          </Card>

          {/* Keyboard Navigation */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Keyboard className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">
                    {t('common.keyboardNavigation') || 'Keyboard Navigation'}
                  </CardTitle>
                  <CardDescription>
                    {t('common.keyboardNavigationDescription') || 'Enable keyboard-only navigation and shortcuts'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="keyboard-nav" className="text-sm">
                  {t('common.enableKeyboardNavigation') || 'Enable keyboard navigation'}
                </Label>
                <Switch
                  id="keyboard-nav"
                  checked={settings.enableKeyboardNavigation}
                  onCheckedChange={(checked) => handleSettingChange('enableKeyboardNavigation', checked)}
                  aria-label="Toggle keyboard navigation"
                />
              </div>
            </CardContent>
          </Card>

          {/* Focus Indicators */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <MousePointer className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">
                    {t('common.focusIndicators') || 'Focus Indicators'}
                  </CardTitle>
                  <CardDescription>
                    {t('common.focusIndicatorsDescription') || 'Choose how focus indicators appear'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label className="text-sm">
                  {t('common.focusIndicatorStyle') || 'Focus indicator style'}
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'outline', label: 'Outline', icon: '□' },
                    { value: 'ring', label: 'Ring', icon: '○' },
                    { value: 'glow', label: 'Glow', icon: '●' },
                  ].map((style) => (
                    <button
                      key={style.value}
                      className={`p-3 rounded-md border transition-colors ${
                        settings.focusIndicatorStyle === style.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-accent border-border'
                      }`}
                      onClick={() => handleFocusStyleChange(style.value as any)}
                      aria-label={`${style.label} focus indicator`}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{style.icon}</div>
                        <div className="text-xs">{style.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* High Contrast Mode */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">
                    {t('common.highContrast') || 'High Contrast Mode'}
                  </CardTitle>
                  <CardDescription>
                    {t('common.highContrastDescription') || 'Increase contrast for better visibility'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="text-sm">
                  {t('common.enableHighContrast') || 'Enable high contrast mode'}
                </Label>
                <Switch
                  id="high-contrast"
                  checked={settings.enableHighContrast}
                  onCheckedChange={(checked) => handleSettingChange('enableHighContrast', checked)}
                  aria-label="Toggle high contrast mode"
                />
              </div>
            </CardContent>
          </Card>

          {/* Reduced Motion */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">
                    {t('common.reducedMotion') || 'Reduced Motion'}
                  </CardTitle>
                  <CardDescription>
                    {t('common.reducedMotionDescription') || 'Reduce animations and motion effects'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion" className="text-sm">
                  {t('common.enableReducedMotion') || 'Enable reduced motion'}
                </Label>
                <Switch
                  id="reduced-motion"
                  checked={settings.enableReducedMotion}
                  onCheckedChange={(checked) => handleSettingChange('enableReducedMotion', checked)}
                  aria-label="Toggle reduced motion"
                />
              </div>
            </CardContent>
          </Card>

          {/* Voice Commands */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">
                    {t('common.voiceCommands') || 'Voice Commands'}
                  </CardTitle>
                  <CardDescription>
                    {t('common.voiceCommandsDescription') || 'Enable voice command recognition (experimental)'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="voice-commands" className="text-sm">
                  {t('common.enableVoiceCommands') || 'Enable voice commands'}
                </Label>
                <Switch
                  id="voice-commands"
                  checked={settings.enableVoiceCommands}
                  onCheckedChange={(checked) => handleSettingChange('enableVoiceCommands', checked)}
                  aria-label="Toggle voice commands"
                />
              </div>
              {settings.enableVoiceCommands && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    {t('common.voiceCommandsHelp') || 'Try saying: "Go to home", "Search", "Help"'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="font-medium">
            {t('common.quickActions') || 'Quick Actions'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => accessibilitySystem.focusElement('#main-content')}
            >
              {t('common.skipToContent') || 'Skip to Content'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => accessibilitySystem.focusElement('#navigation')}
            >
              {t('common.skipToNavigation') || 'Skip to Navigation'}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            {t('common.close') || 'Close'}
          </Button>
          <Button
            onClick={() => {
              // Reset to defaults
              const defaultConfig = {
                enableScreenReader: true,
                enableKeyboardNavigation: true,
                enableHighContrast: false,
                enableReducedMotion: false,
                enableVoiceCommands: false,
                focusIndicatorStyle: 'outline' as const,
              };
              setSettings(defaultConfig);
              accessibilitySystem.updateConfig(defaultConfig);
              accessibilitySystem.announce('Accessibility settings reset to defaults', 'polite');
            }}
          >
            {t('common.resetToDefaults') || 'Reset to Defaults'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Accessibility toggle button for header
export function AccessibilityToggle({ className = '' }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={`p-2 ${className}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open accessibility settings"
      >
        <Settings className="h-4 w-4" />
      </Button>
      
      <AccessibilitySettings
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
} 