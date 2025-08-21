"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX,
  Battery,
  Wifi,
  Signal,
  X,
  Settings,
  Home,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileEmulatorProps {
  children: React.ReactNode;
  deviceType?: 'iphone' | 'android' | 'generic';
  isOpen: boolean;
  onClose: () => void;
}

export function MobileEmulator({ 
  children, 
  deviceType = 'iphone', 
  isOpen, 
  onClose 
}: MobileEmulatorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [wifiSignal, setWifiSignal] = useState(4);
  const [cellularSignal, setCellularSignal] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLocked, setIsLocked] = useState(false);
  const [showHomeIndicator, setShowHomeIndicator] = useState(true);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Simulate battery drain
  useEffect(() => {
    const batteryTimer = setInterval(() => {
      setBatteryLevel(prev => Math.max(0, prev - 0.1));
    }, 30000); // Drain 0.1% every 30 seconds
    return () => clearInterval(batteryTimer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleOrientation = () => {
    setIsLandscape(!isLandscape);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const lockScreen = () => {
    setIsLocked(true);
    setTimeout(() => setIsLocked(false), 2000);
  };

  const getDeviceFrame = () => {
    switch (deviceType) {
      case 'iphone':
        return {
          width: isLandscape ? '667px' : '375px',
          height: isLandscape ? '375px' : '667px',
          borderRadius: '40px',
          notch: true,
          homeIndicator: true
        };
      case 'android':
        return {
          width: isLandscape ? '640px' : '360px',
          height: isLandscape ? '360px' : '640px',
          borderRadius: '20px',
          notch: false,
          homeIndicator: false
        };
      default:
        return {
          width: isLandscape ? '400px' : '320px',
          height: isLandscape ? '320px' : '400px',
          borderRadius: '16px',
          notch: false,
          homeIndicator: false
        };
    }
  };

  const frame = getDeviceFrame();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getBatteryIcon = (level: number) => {
    if (level > 80) return <Battery className="h-3 w-3" />;
    if (level > 50) return <Battery className="h-3 w-3" />;
    if (level > 20) return <Battery className="h-3 w-3" />;
    return <Battery className="h-3 w-3" />;
  };

  const getWifiIcon = (signal: number) => {
    return <Wifi className="h-3 w-3" />;
  };

  const getSignalIcon = (signal: number) => {
    return <Signal className="h-3 w-3" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        ref={containerRef}
        className={cn(
          "relative bg-gray-900 rounded-3xl shadow-2xl border-8 border-gray-800",
          isLandscape ? "flex-row" : "flex-col",
          isFullscreen && "w-full h-full rounded-none border-0"
        )}
        style={{
          width: isFullscreen ? '100%' : frame.width,
          height: isFullscreen ? '100%' : frame.height,
          maxWidth: isFullscreen ? '100%' : '90vw',
          maxHeight: isFullscreen ? '100%' : '90vh'
        }}
      >
        {/* Device Frame */}
        <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden">
          
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-black z-10 flex items-center justify-between px-4 text-white text-xs">
            <div className="flex items-center gap-1">
              <span className="font-medium">{formatTime(currentTime)}</span>
            </div>
            <div className="flex items-center gap-1">
              {getSignalIcon(cellularSignal)}
              {getWifiIcon(wifiSignal)}
              {getBatteryIcon(batteryLevel)}
            </div>
          </div>

          {/* Notch (iPhone) */}
          {frame.notch && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl z-20 flex items-center justify-center">
              <div className="w-16 h-1 bg-gray-700 rounded-full"></div>
            </div>
          )}

          {/* Screen Content */}
          <div 
            className={cn(
              "w-full h-full bg-white overflow-hidden",
              frame.notch ? "pt-6" : "pt-6"
            )}
          >
            {/* Simulated App Content */}
            <div className="w-full h-full">
              {children}
            </div>
          </div>

          {/* Home Indicator (iPhone) */}
          {frame.homeIndicator && showHomeIndicator && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-60"></div>
          )}

          {/* Lock Screen Overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-30">
              <div className="text-center text-white">
                <div className="text-4xl font-light mb-4">{formatTime(currentTime)}</div>
                <div className="text-sm opacity-70">Tap to unlock</div>
              </div>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-gray-800 rounded-lg p-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleOrientation}
            className="text-white hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleMute}
            className="text-white hover:bg-gray-700"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={lockScreen}
            className="text-white hover:bg-gray-700"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleFullscreen}
            className="text-white hover:bg-gray-700"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Device Info */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
          <Badge variant="secondary" className="bg-gray-800 text-white">
            <Smartphone className="h-3 w-3 mr-1" />
            {deviceType.toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="bg-gray-800 text-white">
            {isLandscape ? 'Landscape' : 'Portrait'}
          </Badge>
          <Badge variant="secondary" className="bg-gray-800 text-white">
            {frame.width} × {frame.height}
          </Badge>
        </div>
      </div>
    </div>
  );
}

// Hook to use mobile emulator
export function useMobileEmulator() {
  const [isOpen, setIsOpen] = useState(false);
  const [deviceType, setDeviceType] = useState<'iphone' | 'android' | 'generic'>('iphone');

  const openEmulator = (device: 'iphone' | 'android' | 'generic' = 'iphone') => {
    setDeviceType(device);
    setIsOpen(true);
  };

  const closeEmulator = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    deviceType,
    openEmulator,
    closeEmulator
  };
} 