"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Monitor, 
  Tablet,
  X,
  Play,
  Settings,
  Shield
} from "lucide-react";
import { MobileEmulator, useMobileEmulator } from "./mobile-emulator";
import { MobileEmulatorIframe } from "./mobile-emulator-iframe";

import { cn } from "@/lib/utils";

export function MobileEmulatorLauncher() {
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>('/');
  const { isOpen, deviceType, openEmulator, closeEmulator } = useMobileEmulator();
  const [useIframe, setUseIframe] = useState(false);
  


  const devices = [
    {
      name: 'iPhone 14',
      type: 'iphone' as const,
      icon: Smartphone,
      description: '375×667px Portrait',
      features: ['Notch', 'Home Indicator', 'iOS Status Bar']
    },
    {
      name: 'Android Phone',
      type: 'android' as const,
      icon: Smartphone,
      description: '360×640px Portrait',
      features: ['Material Design', 'Android Status Bar']
    },
    {
      name: 'Generic Mobile',
      type: 'generic' as const,
      icon: Smartphone,
      description: '320×400px Portrait',
      features: ['Basic Mobile Layout']
    }
  ];

  const testPages = [
    {
      name: 'Home',
      path: '/',
      description: 'Main landing page'
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      description: 'User dashboard with verification'
    },
    {
      name: 'Post Task',
      path: '/post',
      description: 'Create new task'
    },
    {
      name: 'Messages',
      path: '/messages',
      description: 'Chat interface'
    },
    {
      name: 'Profile',
      path: '/profile',
      description: 'User profile page'
    }
  ];

  const handleDeviceSelect = (device: typeof devices[0]) => {
    openEmulator(device.type);
    setUseIframe(true);
    setIsLauncherOpen(false);
  };

  const handlePageSelect = (page: typeof testPages[0]) => {
    setCurrentPage(page.path);
    if (isOpen) {
      // If emulator is open, navigate to the page
      window.history.pushState({}, '', page.path);
    }
  };

  const openVerificationInEmulator = () => {
    openEmulator('iphone');
    setUseIframe(false);
    setCurrentPage('/dashboard');
    setIsLauncherOpen(false);
  };



  return (
    <>
      {/* Floating Launcher Button - Temporarily Disabled */}
      {/* <Button
        onClick={() => setIsLauncherOpen(true)}
        className="fixed bottom-4 right-4 z-40 rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
        size="icon"
      >
        <Smartphone className="h-6 w-6" />
      </Button> */}

      {/* Launcher Modal */}
      {isLauncherOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Mobile Emulator
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLauncherOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Device Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Choose Device</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {devices.map((device) => (
                    <Card
                      key={device.name}
                      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
                      onClick={() => handleDeviceSelect(device)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <device.icon className="h-6 w-6 text-primary" />
                          <div>
                            <h4 className="font-medium">{device.name}</h4>
                            <p className="text-sm text-muted-foreground">{device.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {device.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={openVerificationInEmulator}
                    className="h-20 flex-col gap-2"
                    variant="outline"
                  >
                    <Shield className="h-6 w-6" />
                    <span>Test Dashboard</span>
                    <span className="text-xs text-muted-foreground">With verification alerts</span>
                  </Button>
                </div>
              </div>

              {/* Page Navigation */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Test Pages</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {testPages.map((page) => (
                    <Button
                      key={page.path}
                      variant={currentPage === page.path ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageSelect(page)}
                      className="flex-col h-auto py-3"
                    >
                      <span className="font-medium">{page.name}</span>
                      <span className="text-xs text-muted-foreground">{page.description}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Current Status */}
              {isOpen && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Emulator Status</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="secondary">
                      <Smartphone className="h-3 w-3 mr-1" />
                      {deviceType.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary">
                      <Play className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                    <span className="text-muted-foreground">
                      Current page: {currentPage}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile Emulator - Iframe Version for Real Testing */}
      {useIframe && (
        <MobileEmulatorIframe
          isOpen={isOpen}
          deviceType={deviceType}
          onClose={closeEmulator}
          initialUrl={currentPage}
        />
      )}

      {/* Mobile Emulator - Static Version for Verification Testing */}
      {!useIframe && (
        <MobileEmulator
          isOpen={isOpen}
          deviceType={deviceType}
          onClose={closeEmulator}
        >
          {/* This will render the current page content inside the emulator */}
          <div className="w-full h-full">
            {/* Simulate the app content */}
            <div className="w-full h-full bg-background">
              {/* You can add an iframe here to load the actual page */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-xl font-bold mb-2">Mobile Emulator</h2>
                  <p className="text-muted-foreground mb-4">
                    Testing: {currentPage}
                  </p>
                  <div className="space-y-2">
                    <Button
                      onClick={openVerificationInEmulator}
                      className="w-full"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Test Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MobileEmulator>
      )}
    </>
  );
} 