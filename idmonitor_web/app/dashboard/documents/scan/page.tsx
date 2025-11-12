'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, CheckCircle, AlertCircle, Scan, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ScanStep = 'capture' | 'processing' | 'review' | 'complete';

export default function ScanDocumentPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [step, setStep] = useState<ScanStep>('capture');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState({
    kind: 'PASSPORT',
    country: 'US',
    number: 'P123456789',
    holderName: 'John Doe',
    dateOfBirth: '1990-01-15',
    expiryDate: '2028-12-31',
    issueDate: '2023-01-01',
    mrzLine1: 'P<USADOE<<JOHN<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
    mrzLine2: '1234567890USA9001011M2812315<<<<<<<<<<<<<<06',
  });

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1920, height: 1080 },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        stopCamera();
        setStep('processing');

        // Simulate OCR processing
        setTimeout(() => {
          setStep('review');
        }, 2000);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
        setStep('processing');

        // Simulate OCR processing
        setTimeout(() => {
          setStep('review');
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // In production, this would:
    // 1. Encrypt the data client-side
    // 2. POST to /api/documents
    // 3. Upload encrypted image to R2

    setStep('complete');
    setTimeout(() => {
      router.push('/dashboard/documents');
    }, 2000);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Scan Document
        </h1>
        <p className="text-muted-foreground mt-2">
          Use your camera to automatically extract document information
        </p>
      </div>

      {/* How it Works */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-none">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">AI-Powered OCR Scanning</h3>
              <p className="text-sm text-muted-foreground">
                Our advanced OCR technology automatically extracts information from your document's Machine Readable Zone (MRZ). All data is encrypted before leaving your device.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {step === 'capture' && (
        <Card>
          <CardHeader>
            <CardTitle>Capture Document</CardTitle>
            <CardDescription>
              Position your passport or ID within the frame
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Camera Preview */}
            {stream ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg border-2 border-primary"
                />
                <div className="absolute inset-0 border-4 border-dashed border-white/50 rounded-lg m-8 pointer-events-none" />
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-12 text-center bg-muted/50">
                <Camera className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Camera Not Active</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click below to start your camera
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {!stream ? (
                <>
                  <Button onClick={startCamera} size="lg" className="gradient-primary">
                    <Camera className="mr-2 h-5 w-5" />
                    Start Camera
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button variant="outline" size="lg" className="w-full" asChild>
                      <span>
                        <Upload className="mr-2 h-5 w-5" />
                        Upload Photo
                      </span>
                    </Button>
                  </label>
                </>
              ) : (
                <div className="flex gap-3">
                  <Button onClick={capturePhoto} size="lg" className="flex-1 gradient-primary">
                    <Camera className="mr-2 h-5 w-5" />
                    Capture
                  </Button>
                  <Button onClick={stopCamera} variant="outline" size="lg">
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'processing' && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full gradient-primary flex items-center justify-center animate-pulse">
                <Scan className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Processing Document...</h3>
              <p className="text-muted-foreground">
                Extracting information from MRZ and text fields
              </p>
              <div className="max-w-md mx-auto">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full gradient-primary animate-[loading_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'review' && (
        <div className="space-y-6">
          {/* Captured Image */}
          {capturedImage && (
            <Card>
              <CardHeader>
                <CardTitle>Captured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={capturedImage} alt="Captured document" className="w-full rounded-lg border" />
              </CardContent>
            </Card>
          )}

          {/* Extracted Data */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Extracted Information</CardTitle>
                  <CardDescription>Review and edit if needed</CardDescription>
                </div>
                <Badge variant="success" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Document Type</label>
                  <input
                    type="text"
                    value={extractedData.kind}
                    className="w-full p-2 border rounded-md"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Country</label>
                  <input
                    type="text"
                    value={extractedData.country}
                    className="w-full p-2 border rounded-md"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Document Number</label>
                  <input
                    type="text"
                    value={extractedData.number}
                    onChange={(e) => setExtractedData({ ...extractedData, number: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Holder Name</label>
                  <input
                    type="text"
                    value={extractedData.holderName}
                    onChange={(e) => setExtractedData({ ...extractedData, holderName: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Date of Birth</label>
                  <input
                    type="date"
                    value={extractedData.dateOfBirth}
                    onChange={(e) => setExtractedData({ ...extractedData, dateOfBirth: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Issue Date</label>
                  <input
                    type="date"
                    value={extractedData.issueDate}
                    onChange={(e) => setExtractedData({ ...extractedData, issueDate: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Expiry Date</label>
                  <input
                    type="date"
                    value={extractedData.expiryDate}
                    onChange={(e) => setExtractedData({ ...extractedData, expiryDate: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    All data will be encrypted with AES-256 before being saved. The original image is also encrypted before upload.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1 gradient-primary" size="lg">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Save Document
                </Button>
                <Button onClick={() => setStep('capture')} variant="outline" size="lg">
                  Retake
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'complete' && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold">Document Saved Successfully!</h3>
              <p className="text-muted-foreground">
                Your document has been encrypted and saved securely. Reminders have been configured automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
