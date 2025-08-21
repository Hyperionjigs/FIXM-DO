"use client";

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TestCameraPage() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    console.log('🔍 Starting camera test...');
    setCameraError(null);
    
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      // Check for available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('📹 Available devices:', devices);
      console.log('📹 Video devices:', videoDevices);

      if (videoDevices.length === 0) {
        throw new Error('No camera found on this device');
      }

      // Try to get user media with basic constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        } 
      });
      
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        
        // Set video properties
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        
        // Wait for video to be ready and play
        await new Promise((resolve, reject) => {
          const onLoadedMetadata = async () => {
            console.log('✅ Camera started successfully');
            console.log(`📹 Video dimensions: ${video.videoWidth}x${video.videoHeight}`);
            
            try {
              // Explicitly play the video
              await video.play();
              console.log('🎬 Video is now playing');
              setIsCameraActive(true);
              resolve(true);
            } catch (playError) {
              console.error('❌ Error playing video:', playError);
              // Try to play without sound
              video.muted = true;
              try {
                await video.play();
                console.log('🎬 Video playing (muted)');
                setIsCameraActive(true);
                resolve(true);
              } catch (mutedPlayError) {
                console.error('❌ Error playing muted video:', mutedPlayError);
                reject(mutedPlayError);
              }
            }
          };
          
          video.addEventListener('loadedmetadata', onLoadedMetadata);
          
          // Cleanup function
          setTimeout(() => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
          }, 5000);
        });
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      
      // Provide specific error messages and solutions
      let errorMessage = 'Failed to access camera';
      let solution = '';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied';
          solution = 'Please allow camera access in your browser settings. Click the camera icon in your address bar and select "Allow".';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device';
          solution = 'Please connect a camera or use a device with a built-in camera.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported in this browser';
          solution = 'Please use a modern browser like Chrome, Firefox, or Safari.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application';
          solution = 'Please close other applications using the camera and try again.';
        } else {
          errorMessage = error.message;
          solution = 'Please try refreshing the page or using a different browser.';
        }
      }
      
      setCameraError(`${errorMessage}. ${solution}`);
    }
  }, []);

  const resetPermissions = useCallback(async () => {
    try {
      // Try to reset permissions by requesting them again
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      
      // Clear error and try to start camera again
      setCameraError(null);
      setTimeout(() => {
        startCamera();
      }, 500);
    } catch (error) {
      console.error('Failed to reset permissions:', error);
      setCameraError('Unable to reset camera permissions. Please manually allow camera access in your browser settings.');
    }
  }, [startCamera]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
      console.log('🛑 Camera stopped');
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        console.log('📸 Photo captured');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Camera Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Camera Controls */}
              <div className="space-y-4">
                <h3 className="font-semibold">Camera Controls</h3>
                
                <div className="space-y-2">
                  <Button 
                    onClick={isCameraActive ? stopCamera : startCamera}
                    className="w-full"
                  >
                    {isCameraActive ? 'Stop Camera' : 'Start Camera'}
                  </Button>
                  
                  {isCameraActive && (
                    <Button 
                      onClick={capturePhoto}
                      className="w-full"
                      variant="outline"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photo
                    </Button>
                  )}
                </div>

                {cameraError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm font-medium mb-2">Camera Error:</p>
                    <div className="text-red-600 text-sm space-y-2">
                      {cameraError.split('. ').map((part, index) => (
                        <p key={index}>{part}</p>
                      ))}
                    </div>
                    <div className="mt-3 space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetPermissions}
                        className="w-full text-red-700 border-red-300 hover:bg-red-100"
                      >
                        Reset Permissions
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={startCamera}
                        className="w-full text-red-700 border-red-300 hover:bg-red-100"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <p><strong>Browser:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown'}</p>
                  <p><strong>HTTPS:</strong> {typeof window !== 'undefined' ? window.location.protocol === 'https:' ? 'Yes' : 'No' : 'Unknown'}</p>
                  <p><strong>MediaDevices:</strong> {typeof navigator !== 'undefined' && navigator.mediaDevices ? 'Supported' : 'Not Supported'}</p>
                  <p><strong>Mobile:</strong> {typeof navigator !== 'undefined' ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Yes' : 'No' : 'Unknown'}</p>
                  <p><strong>Video Ready State:</strong> {videoRef.current?.readyState || 'N/A'}</p>
                  <p><strong>Video Dimensions:</strong> {videoRef.current ? `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}` : 'N/A'}</p>
                </div>
              </div>

              {/* Camera Preview */}
              <div className="space-y-4">
                <h3 className="font-semibold">Camera Preview</h3>
                
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  {!isCameraActive ? (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Camera not active</p>
                      </div>
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }} // Mirror the video for selfie
                    />
                  )}
                </div>

                {/* Captured Image */}
                {capturedImage && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Captured Image:</h4>
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Canvas (hidden) */}
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 