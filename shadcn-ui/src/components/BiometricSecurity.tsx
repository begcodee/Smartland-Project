import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, Fingerprint, Mic, Scan, Shield, 
  CheckCircle, AlertTriangle, Camera, 
  Lock, Unlock, Settings, Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface BiometricTemplate {
  id: string;
  type: 'fingerprint' | 'face' | 'voice' | 'iris';
  quality: number;
  enrolled: boolean;
  lastVerified: string;
  matchAccuracy: number;
}

export const BiometricSecurity = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState<string>('');
  const [scanProgress, setScanProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState<{ success: boolean; confidence: number } | null>(null);
  
  const [biometricTemplates, setBiometricTemplates] = useState<BiometricTemplate[]>([
    {
      id: '1',
      type: 'fingerprint',
      quality: 95,
      enrolled: true,
      lastVerified: '2024-01-15 14:30',
      matchAccuracy: 98.7
    },
    {
      id: '2',
      type: 'face',
      quality: 92,
      enrolled: true,
      lastVerified: '2024-01-15 09:15',
      matchAccuracy: 96.3
    },
    {
      id: '3',
      type: 'voice',
      quality: 88,
      enrolled: false,
      lastVerified: 'Never',
      matchAccuracy: 0
    },
    {
      id: '4',
      type: 'iris',
      quality: 0,
      enrolled: false,
      lastVerified: 'Never',
      matchAccuracy: 0
    }
  ]);

  const handleBiometricScan = async (type: string) => {
    setIsScanning(true);
    setScanType(type);
    setScanProgress(0);
    setVerificationResult(null);

    // Simulate biometric scanning process
    const steps = [
      { progress: 20, message: 'Initializing scanner...' },
      { progress: 40, message: 'Capturing biometric data...' },
      { progress: 60, message: 'Processing template...' },
      { progress: 80, message: 'Matching against database...' },
      { progress: 100, message: 'Verification complete' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setScanProgress(step.progress);
      toast.info(step.message);
    }

    // Mock verification result
    const success = Math.random() > 0.15; // 85% success rate
    const confidence = success ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 50) + 30;
    
    setVerificationResult({ success, confidence });
    setIsScanning(false);
    setScanType('');

    if (success) {
      toast.success(`${type} verification successful!`);
      // Update last verified time
      setBiometricTemplates(templates => 
        templates.map(template => 
          template.type === type 
            ? { ...template, lastVerified: new Date().toLocaleString(), matchAccuracy: confidence }
            : template
        )
      );
    } else {
      toast.error(`${type} verification failed`);
    }
  };

  const enrollBiometric = async (type: string) => {
    setIsScanning(true);
    setScanType(type);
    setScanProgress(0);

    // Simulate enrollment process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setScanProgress(i);
    }

    setBiometricTemplates(templates => 
      templates.map(template => 
        template.type === type 
          ? { 
              ...template, 
              enrolled: true, 
              quality: Math.floor(Math.random() * 20) + 80,
              lastVerified: new Date().toLocaleString()
            }
          : template
      )
    );

    setIsScanning(false);
    setScanType('');
    toast.success(`${type} enrolled successfully!`);
  };

  const getBiometricIcon = (type: string) => {
    switch (type) {
      case 'fingerprint': return <Fingerprint className="w-5 h-5" />;
      case 'face': return <Eye className="w-5 h-5" />;
      case 'voice': return <Mic className="w-5 h-5" />;
      case 'iris': return <Scan className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 90) return 'text-green-600';
    if (quality >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBadge = (quality: number) => {
    if (quality >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (quality >= 70) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Biometric Overview */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Shield className="w-5 h-5 text-indigo-600" />
            Biometric Security System
          </CardTitle>
          <CardDescription className="text-slate-600">
            Multi-modal biometric authentication for enhanced security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => handleBiometricScan('fingerprint')}
              disabled={isScanning}
              variant="outline"
              className="h-20 flex-col gap-2 border-slate-200"
            >
              <Fingerprint className="w-6 h-6 text-indigo-600" />
              <span className="text-xs">Fingerprint</span>
            </Button>
            
            <Button
              onClick={() => handleBiometricScan('face')}
              disabled={isScanning}
              variant="outline"
              className="h-20 flex-col gap-2 border-slate-200"
            >
              <Eye className="w-6 h-6 text-indigo-600" />
              <span className="text-xs">Face Recognition</span>
            </Button>
            
            <Button
              onClick={() => handleBiometricScan('voice')}
              disabled={isScanning}
              variant="outline"
              className="h-20 flex-col gap-2 border-slate-200"
            >
              <Mic className="w-6 h-6 text-indigo-600" />
              <span className="text-xs">Voice Print</span>
            </Button>
            
            <Button
              onClick={() => handleBiometricScan('iris')}
              disabled={isScanning}
              variant="outline"
              className="h-20 flex-col gap-2 border-slate-200"
            >
              <Scan className="w-6 h-6 text-indigo-600" />
              <span className="text-xs">Iris Scan</span>
            </Button>
          </div>

          {/* Scanning Progress */}
          {isScanning && (
            <div className="space-y-3 p-4 bg-indigo-50/80 rounded-lg border border-indigo-200/60">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-indigo-900">
                  Scanning {scanType}...
                </span>
              </div>
              <Progress value={scanProgress} className="w-full" />
            </div>
          )}

          {/* Verification Result */}
          {verificationResult && (
            <Alert className={verificationResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {verificationResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={verificationResult.success ? 'text-green-700' : 'text-red-700'}>
                {verificationResult.success 
                  ? `Biometric verification successful with ${verificationResult.confidence}% confidence`
                  : `Biometric verification failed with ${verificationResult.confidence}% confidence`
                }
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Enrolled Biometrics */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Activity className="w-5 h-5 text-indigo-600" />
            Biometric Templates
          </CardTitle>
          <CardDescription className="text-slate-600">
            Manage your enrolled biometric data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {biometricTemplates.map((template) => (
            <div key={template.id} className="flex items-center justify-between p-4 bg-slate-50/80 rounded-lg border border-slate-200/60">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${template.enrolled ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  {getBiometricIcon(template.type)}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-900 capitalize">{template.type}</h3>
                    {template.enrolled ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Enrolled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-slate-200 text-slate-500">
                        Not Enrolled
                      </Badge>
                    )}
                  </div>
                  
                  {template.enrolled && (
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>Quality: 
                        <span className={`font-medium ml-1 ${getQualityColor(template.quality)}`}>
                          {template.quality}%
                        </span>
                      </span>
                      <span>Last verified: {template.lastVerified}</span>
                      {template.matchAccuracy > 0 && (
                        <span>Accuracy: {template.matchAccuracy}%</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {template.enrolled ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBiometricScan(template.type)}
                      disabled={isScanning}
                      className="border-slate-200"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Verify
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => enrollBiometric(template.type)}
                    disabled={isScanning}
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Enroll
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">98.7%</p>
                <p className="text-sm text-slate-500">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">2.3s</p>
                <p className="text-sm text-slate-500">Avg. Scan Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">0.01%</p>
                <p className="text-sm text-slate-500">False Accept Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Information */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Settings className="w-5 h-5 text-indigo-600" />
            Technical Specifications
          </CardTitle>
          <CardDescription className="text-slate-600">
            Biometric system capabilities and standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Supported Modalities</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Fingerprint className="w-4 h-4 text-indigo-600" />
                  <span>Fingerprint (minutiae-based, 500 DPI)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <span>Face Recognition (3D facial geometry)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mic className="w-4 h-4 text-indigo-600" />
                  <span>Voice Print (spectral analysis)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Scan className="w-4 h-4 text-indigo-600" />
                  <span>Iris Recognition (texture analysis)</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Security Standards</h4>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>ISO/IEC 19794 biometric data formats</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>FIDO2 biometric authentication</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>AES-256 template encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Liveness detection algorithms</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};