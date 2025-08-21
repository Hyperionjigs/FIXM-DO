'use client';

import React, { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation, SupportedLocale, localeConfigs } from '@/lib/internationalization';
import { accessibilitySystem } from '@/lib/accessibility-system';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'compact' | 'icon-only';
  showNativeNames?: boolean;
}

export function LanguageSwitcher({
  className = '',
  variant = 'default',
  showNativeNames = true,
}: LanguageSwitcherProps) {
  const { locale, changeLocale, getSupportedLocales, getLocaleConfig } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const supportedLocales = getSupportedLocales();
  const currentConfig = getLocaleConfig();

  const handleLanguageChange = (newLocale: SupportedLocale) => {
    changeLocale(newLocale);
    setIsOpen(false);
    
    // Announce language change to screen reader
    const newConfig = localeConfigs[newLocale];
    accessibilitySystem.announce(
      `Language changed to ${newConfig.name}`,
      'polite'
    );
  };

  const getDisplayName = (localeCode: SupportedLocale) => {
    const config = localeConfigs[localeCode];
    if (showNativeNames) {
      return config.nativeName;
    }
    return config.name;
  };

  const renderTrigger = () => {
    switch (variant) {
      case 'compact':
        return (
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 ${className}`}
            aria-label={`Current language: ${currentConfig.name}. Click to change language.`}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">
              {currentConfig.code.toUpperCase()}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        );

      case 'icon-only':
        return (
          <Button
            variant="ghost"
            size="sm"
            className={`p-2 ${className}`}
            aria-label={`Current language: ${currentConfig.name}. Click to change language.`}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <Globe className="h-4 w-4" />
          </Button>
        );

      default:
        return (
          <Button
            variant="outline"
            className={`flex items-center gap-2 ${className}`}
            aria-label={`Current language: ${currentConfig.name}. Click to change language.`}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <Globe className="h-4 w-4" />
            <span className="font-medium">
              {getDisplayName(locale)}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        );
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {renderTrigger()}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        align="end"
        className="w-48"
        role="listbox"
        aria-label="Select language"
      >
        {supportedLocales.map((localeCode) => {
          const config = localeConfigs[localeCode];
          const isSelected = localeCode === locale;
          
          return (
            <DropdownMenuItem
              key={localeCode}
              className={`flex items-center justify-between cursor-pointer ${
                isSelected ? 'bg-accent' : ''
              }`}
              onClick={() => handleLanguageChange(localeCode)}
              role="option"
              aria-selected={isSelected}
              aria-label={`${config.name}${isSelected ? ' (current)' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {getDisplayName(localeCode)}
                </span>
                {showNativeNames && config.nativeName !== config.name && (
                  <span className="text-xs text-muted-foreground">
                    ({config.name})
                  </span>
                )}
              </div>
              
              {isSelected && (
                <Check className="h-4 w-4 text-primary" aria-hidden="true" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact language indicator component
export function LanguageIndicator({ className = '' }: { className?: string }) {
  const { locale, getLocaleConfig } = useTranslation();
  const config = getLocaleConfig();

  return (
    <div
      className={`flex items-center gap-1 text-xs text-muted-foreground ${className}`}
      aria-label={`Current language: ${config.name}`}
    >
      <Globe className="h-3 w-3" aria-hidden="true" />
      <span>{config.code.toUpperCase()}</span>
    </div>
  );
}

// Language selection modal for mobile
export function LanguageSelectionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { locale, changeLocale, getSupportedLocales } = useTranslation();
  const supportedLocales = getSupportedLocales();

  const handleLanguageChange = (newLocale: SupportedLocale) => {
    changeLocale(newLocale);
    onClose();
    
    // Announce language change
    const newConfig = localeConfigs[newLocale];
    accessibilitySystem.announce(
      `Language changed to ${newConfig.name}`,
      'polite'
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
    >
      <div className="bg-background rounded-lg p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2
            id="language-modal-title"
            className="text-lg font-semibold"
          >
            Select Language
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close language selection"
          >
            ×
          </Button>
        </div>
        
        <div className="space-y-2" role="listbox" aria-label="Available languages">
          {supportedLocales.map((localeCode) => {
            const config = localeConfigs[localeCode];
            const isSelected = localeCode === locale;
            
            return (
              <button
                key={localeCode}
                className={`w-full flex items-center justify-between p-3 rounded-md border transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-accent border-border'
                }`}
                onClick={() => handleLanguageChange(localeCode)}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {config.nativeName}
                  </span>
                  <span className="text-xs opacity-75">
                    {config.name}
                  </span>
                </div>
                
                {isSelected && (
                  <Check className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 