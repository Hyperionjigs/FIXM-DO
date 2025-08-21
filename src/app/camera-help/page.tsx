"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, ArrowLeft, Chrome, Globe, Monitor, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function CameraHelpPage() {
  const [activeTab, setActiveTab] = useState('chrome');

  const browserInstructions = {
    chrome: {
      name: 'Google Chrome',
      icon: Chrome,
      steps: [
        'Look for the camera icon in your address bar (top-left of the URL)',
        'Click on the camera icon',
        'Select "Allow" from the dropdown menu',
        'Refresh the page and try again',
        'If you don\'t see the camera icon, click the lock icon next to the URL',
        'In the permissions section, find "Camera" and select "Allow"'
      ]
    },
    safari: {
      name: 'Safari',
      icon: Globe,
      steps: [
        'Go to Safari menu → Preferences → Websites',
        'Click on "Camera" in the left sidebar',
        'Find this website in the list and select "Allow"',
        'Alternatively, when prompted, click "Allow" in the popup',
        'If blocked, go to Safari menu → Settings for This Website',
        'Set Camera permission to "Allow"'
      ]
    },
    firefox: {
      name: 'Firefox',
      icon: Globe,
      steps: [
        'Look for the camera icon in the address bar',
        'Click on the camera icon',
        'Select "Allow" from the permissions popup',
        'If you don\'t see the icon, click the shield icon',
        'In the permissions panel, find "Access Your Camera" and click "Allow"',
        'Refresh the page and try again'
      ]
    },
    edge: {
      name: 'Microsoft Edge',
      icon: Monitor,
      steps: [
        'Look for the camera icon in the address bar',
        'Click on the camera icon',
        'Select "Allow" from the dropdown',
        'If blocked, click the lock icon next to the URL',
        'In the site permissions, find "Camera" and select "Allow"',
        'Refresh the page and try again'
      ]
    }
  };

  const deviceInstructions = {
    desktop: {
      name: 'Desktop/Laptop',
      icon: Monitor,
      tips: [
        'Make sure your webcam is connected and working',
        'Check if other applications are using the camera',
        'Try closing other video conferencing apps',
        'Restart your browser if issues persist',
        'Check your system camera permissions in Settings'
      ]
    },
    mobile: {
      name: 'Mobile Device',
      icon: Smartphone,
      tips: [
        'Make sure you\'re using HTTPS (secure connection)',
        'Grant camera permissions when prompted',
        'Check your device\'s camera permissions in Settings',
        'Try using the native browser (Safari on iOS, Chrome on Android)',
        'Make sure no other apps are using the camera'
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Camera className="h-10 w-10 text-blue-600" />
              Camera Permission Help
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Having trouble with camera access? Follow these step-by-step instructions to resolve permission issues.
            </p>
          </div>
        </div>

        {/* Quick Test */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Camera className="h-5 w-5" />
              Quick Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 mb-4">
              Test your camera functionality with our debugging tool:
            </p>
            <Link href="/test-camera">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Camera className="h-4 w-4 mr-2" />
                Test Camera
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Browser Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Browser-Specific Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="chrome" className="flex items-center gap-2">
                  <Chrome className="h-4 w-4" />
                  Chrome
                </TabsTrigger>
                <TabsTrigger value="safari" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Safari
                </TabsTrigger>
                <TabsTrigger value="firefox" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Firefox
                </TabsTrigger>
                <TabsTrigger value="edge" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Edge
                </TabsTrigger>
              </TabsList>

              {Object.entries(browserInstructions).map(([key, browser]) => (
                <TabsContent key={key} value={key} className="mt-6">
                  <div className="flex items-start gap-4">
                    <browser.icon className="h-8 w-8 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-4">{browser.name}</h3>
                      <ol className="space-y-3">
                        {browser.steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </span>
                            <span className="text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Device-Specific Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(deviceInstructions).map(([key, device]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <device.icon className="h-5 w-5" />
                  {device.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {device.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold">•</span>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Common Issues */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Camera className="h-5 w-5" />
              Common Issues & Solutions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">"Permission denied" error</h4>
                <p className="text-orange-700">This means your browser has blocked camera access. Follow the browser-specific instructions above to allow camera permissions.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">"No camera found" error</h4>
                <p className="text-orange-700">Make sure your camera is connected and not being used by another application. Try closing other video apps.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">Camera works in other apps but not here</h4>
                <p className="text-orange-700">This is likely a browser permission issue. Check your browser's camera permissions and make sure this site is allowed.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">Camera is blurry or poor quality</h4>
                <p className="text-orange-700">Ensure good lighting, clean your camera lens, and make sure you're not too close or far from the camera.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Still Need Help */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Camera className="h-5 w-5" />
              Still Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-4">
              If you're still experiencing issues after following these instructions:
            </p>
            <div className="space-y-2">
              <p className="text-green-700">• Try using a different browser</p>
              <p className="text-green-700">• Check if your camera works in other applications</p>
              <p className="text-green-700">• Restart your device and try again</p>
              <p className="text-green-700">• Contact support with your browser and device information</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 