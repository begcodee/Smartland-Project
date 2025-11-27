import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, Camera, Shield, CheckCircle, Clock, 
  AlertTriangle, FileImage, User, CreditCard 
} from 'lucide-react';
import { toast } from 'sonner';

interface GhanaCardVerificationProps {
  onVerificationComplete: (verificationData: VerificationData) => void;
  userCountry: string;
}

interface VerificationData {
  frontCardImage: string;
  backCardImage: string;
  faceImage: string;
  cardNumber: string;
  fullName: string;
  status: 'pending' | 'verified' | 'rejected';
}

export const GhanaCardVerification = ({ onVerificationComplete, userCountry }: GhanaCardVerificationProps) => {
  const [step, setStep] = useState(1);
  const [frontCard, setFrontCard] = useState<string>('');
  const [backCard, setBackCard] = useState<string>('');
  const [faceImage, setFaceImage] = useState<string>('');
  const [cardNumber, setCardNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getIdCardName = (country: string) => {
    const cardNames: { [key: string]: string } = {
      'GH': 'Ghana Card',
      'NG': 'National ID Card',
      'KE': 'Huduma Namba',
      'ZA': 'Smart ID Card',
      'EG': 'National ID Card',
      'MA': 'CNIE (Carte Nationale)',
      'ET': 'Ethiopian ID',
      'TZ': 'National ID',
      'UG': 'National ID',
      'RW': 'National ID'
    };
    return cardNames[country] || 'National ID Card';
  };

  const handleFileUpload = (file: File, type: 'front' | 'back' | 'face') => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      switch (type) {
        case 'front':
          setFrontCard(result);
          break;
        case 'back':
          setBackCard(result);
          break;
        case 'face':
          setFaceImage(result);
          break;
      }
    };
    reader.readAsDataURL(file);
  };

  const startFacialRecognition = () => {
    setIsProcessing(true);
    
    // Simulate camera access and facial recognition
    setTimeout(() => {
      // Mock facial recognition result
      const mockFaceImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
      setFaceImage(mockFaceImage);
      setIsProcessing(false);
      setStep(3);
      toast.success('Facial recognition completed successfully!');
    }, 3000);
  };

  const submitVerification = () => {
    setIsProcessing(true);
    
    // Simulate verification submission
    setTimeout(() => {
      const verificationData: VerificationData = {
        frontCardImage: frontCard,
        backCardImage: backCard,
        faceImage: faceImage,
        cardNumber: cardNumber,
        fullName: fullName,
        status: 'pending'
      };
      
      onVerificationComplete(verificationData);
      setIsProcessing(false);
      toast.success('Verification submitted! You will be notified within 24 hours.');
    }, 2000);
  };

  const progressValue = (step / 3) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {getIdCardName(userCountry)} Verification
        </CardTitle>
        <CardDescription>
          Complete identity verification to access the land registry platform
        </CardDescription>
        <Progress value={progressValue} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <Alert>
              <CreditCard className="h-4 w-4" />
              <AlertDescription>
                Please upload clear photos of the front and back of your {getIdCardName(userCountry)}. 
                Ensure all text is readable and the card is well-lit.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Front Card Upload */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <FileImage className="w-4 h-4" />
                  Front of {getIdCardName(userCountry)}
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {frontCard ? (
                    <div className="space-y-2">
                      <img src={frontCard} alt="Front card" className="max-h-32 mx-auto rounded" />
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500">Upload front side</p>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'front')}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Back Card Upload */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <FileImage className="w-4 h-4" />
                  Back of {getIdCardName(userCountry)}
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {backCard ? (
                    <div className="space-y-2">
                      <img src={backCard} alt="Back card" className="max-h-32 mx-auto rounded" />
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500">Upload back side</p>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'back')}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder={userCountry === 'GH' ? 'GHA-XXXXXXXXX-X' : 'Enter card number'}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name (as on card)</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setStep(2)} 
              disabled={!frontCard || !backCard || !cardNumber || !fullName}
              className="w-full"
            >
              Continue to Facial Recognition
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 text-center">
            <Alert>
              <Camera className="h-4 w-4" />
              <AlertDescription>
                For security purposes, we need to verify that you are the person on the ID card. 
                Please position your face in front of the camera for facial recognition.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {!faceImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  {isProcessing ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                        <Camera className="w-8 h-8 text-blue-600 animate-pulse" />
                      </div>
                      <p className="text-sm text-gray-600">Processing facial recognition...</p>
                      <Progress value={66} className="w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">Click to start facial recognition</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <img src={faceImage} alt="Face verification" className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-green-500" />
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Face Verified
                  </Badge>
                </div>
              )}
            </div>

            {!faceImage && (
              <Button 
                onClick={startFacialRecognition} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Start Facial Recognition'}
              </Button>
            )}

            {faceImage && (
              <Button onClick={() => setStep(3)} className="w-full">
                Continue to Final Step
              </Button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Verification Complete</h3>
              <p className="text-gray-600">
                Your identity verification has been submitted successfully. 
                Our system will review your documents and facial recognition data.
              </p>
            </div>

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Steps:</strong> You will receive a notification within 24 hours 
                regarding your verification status. Once verified, you'll have full access 
                to the land registry platform.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <Badge variant="outline" className="w-full justify-center">
                  <FileImage className="w-3 h-3 mr-1" />
                  ID Card
                </Badge>
                <p className="text-xs text-green-600">✓ Uploaded</p>
              </div>
              <div className="space-y-1">
                <Badge variant="outline" className="w-full justify-center">
                  <Camera className="w-3 h-3 mr-1" />
                  Face Scan
                </Badge>
                <p className="text-xs text-green-600">✓ Completed</p>
              </div>
              <div className="space-y-1">
                <Badge variant="outline" className="w-full justify-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Security
                </Badge>
                <p className="text-xs text-blue-600">⏳ Processing</p>
              </div>
            </div>

            <Button 
              onClick={submitVerification} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Submitting...' : 'Complete Verification'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};