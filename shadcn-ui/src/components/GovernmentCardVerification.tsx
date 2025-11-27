import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, Scan, CheckCircle, AlertTriangle, 
  Camera, Upload, Eye, Fingerprint, Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface VerificationResult {
  isValid: boolean;
  confidence: number;
  cardType: string;
  country: string;
  issuingAuthority: string;
  expiryDate: string;
  biometricMatch?: boolean;
}

export const GovernmentCardVerification = () => {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [scannedImage, setScannedImage] = useState<string | null>(null);

  const africanCountries = [
    { code: 'NG', name: 'Nigeria', cardType: 'National ID Card (NIN)' },
    { code: 'ZA', name: 'South Africa', cardType: 'Smart ID Card' },
    { code: 'KE', name: 'Kenya', cardType: 'Huduma Namba ID' },
    { code: 'GH', name: 'Ghana', cardType: 'Ghana Card' },
    { code: 'EG', name: 'Egypt', cardType: 'National ID Card' },
    { code: 'MA', name: 'Morocco', cardType: 'CNIE (Carte Nationale)' },
    { code: 'ET', name: 'Ethiopia', cardType: 'Ethiopian ID Card' },
    { code: 'TZ', name: 'Tanzania', cardType: 'National ID Card' },
    { code: 'UG', name: 'Uganda', cardType: 'National ID Card' },
    { code: 'RW', name: 'Rwanda', cardType: 'National ID Card' }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setScannedImage(e.target?.result as string);
        toast.success('Card image uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateVerification = async () => {
    if (!selectedCountry || !cardNumber) {
      toast.error('Please select country and enter card number');
      return;
    }

    setIsVerifying(true);
    setVerificationProgress(0);

    // Simulate verification process
    const steps = [
      { progress: 20, message: 'Validating card format...' },
      { progress: 40, message: 'Checking government database...' },
      { progress: 60, message: 'Verifying biometric data...' },
      { progress: 80, message: 'Cross-referencing records...' },
      { progress: 100, message: 'Verification complete' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setVerificationProgress(step.progress);
      toast.info(step.message);
    }

    // Mock verification result
    const result: VerificationResult = {
      isValid: Math.random() > 0.2, // 80% success rate
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100% confidence
      cardType: africanCountries.find(c => c.code === selectedCountry)?.cardType || 'Unknown',
      country: africanCountries.find(c => c.code === selectedCountry)?.name || 'Unknown',
      issuingAuthority: 'National Identity Management Authority',
      expiryDate: '2030-12-31',
      biometricMatch: Math.random() > 0.1 // 90% biometric match rate
    };

    setVerificationResult(result);
    setIsVerifying(false);
    
    if (result.isValid) {
      toast.success('Card verification successful!');
    } else {
      toast.error('Card verification failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Verification Card */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            Government Card Verification
          </CardTitle>
          <CardDescription className="text-slate-600">
            Verify government-issued identity cards across African countries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Country Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country" className="text-slate-700">Country</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="bg-white/80 border-slate-200">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {africanCountries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{country.name}</span>
                        <span className="text-xs text-slate-500">({country.cardType})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-slate-700">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="Enter government card number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="bg-white/80 border-slate-200"
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label className="text-slate-700">Card Image (Optional)</Label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50">
              {scannedImage ? (
                <div className="space-y-4">
                  <img 
                    src={scannedImage} 
                    alt="Scanned card" 
                    className="max-w-xs mx-auto rounded-lg shadow-sm"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => setScannedImage(null)}
                    className="border-slate-200"
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-slate-600 mb-2">Upload card image for enhanced verification</p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" className="border-slate-200" asChild>
                        <label htmlFor="card-upload" className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </label>
                      </Button>
                      <Button variant="outline" className="border-slate-200">
                        <Scan className="w-4 h-4 mr-2" />
                        Scan Card
                      </Button>
                    </div>
                    <input
                      id="card-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verification Progress */}
          {isVerifying && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-slate-700">Verifying card...</span>
              </div>
              <Progress value={verificationProgress} className="w-full" />
            </div>
          )}

          {/* Verification Button */}
          <Button 
            onClick={simulateVerification}
            disabled={isVerifying || !selectedCountry || !cardNumber}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            size="lg"
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Verify Government Card
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Verification Results */}
      {verificationResult && (
        <Card className={`bg-white/60 backdrop-blur-sm border-slate-200/60 ${
          verificationResult.isValid ? 'ring-2 ring-green-200' : 'ring-2 ring-red-200'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {verificationResult.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              Verification Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-600">Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={verificationResult.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {verificationResult.isValid ? 'Valid' : 'Invalid'}
                  </Badge>
                  <span className="text-sm text-slate-500">
                    {verificationResult.confidence}% confidence
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-slate-600">Card Type</Label>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {verificationResult.cardType}
                </p>
              </div>

              <div>
                <Label className="text-slate-600">Country</Label>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {verificationResult.country}
                </p>
              </div>

              <div>
                <Label className="text-slate-600">Issuing Authority</Label>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {verificationResult.issuingAuthority}
                </p>
              </div>

              <div>
                <Label className="text-slate-600">Expiry Date</Label>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {verificationResult.expiryDate}
                </p>
              </div>

              {verificationResult.biometricMatch !== undefined && (
                <div>
                  <Label className="text-slate-600">Biometric Match</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Fingerprint className={`w-4 h-4 ${verificationResult.biometricMatch ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={`text-sm font-medium ${verificationResult.biometricMatch ? 'text-green-700' : 'text-red-700'}`}>
                      {verificationResult.biometricMatch ? 'Matched' : 'No Match'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!verificationResult.isValid && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  Card verification failed. Please check the card number and try again, or contact the issuing authority.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Supported Countries Grid */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="text-slate-900">Supported Countries</CardTitle>
          <CardDescription className="text-slate-600">
            Government card verification available across Africa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {africanCountries.map((country) => (
              <div key={country.code} className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-lg border border-slate-200/60">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{country.name}</p>
                  <p className="text-xs text-slate-500">{country.cardType}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};