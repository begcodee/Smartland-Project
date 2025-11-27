import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Fingerprint, Shield, Smartphone, Key, 
  CheckCircle, AlertTriangle, Lock, Unlock,
  Eye, Scan, Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface PasskeyDevice {
  id: string;
  name: string;
  type: 'fingerprint' | 'face' | 'pin' | 'pattern';
  isActive: boolean;
  lastUsed: string;
  trustLevel: 'high' | 'medium' | 'low';
}

export const PasskeyAuthentication = () => {
  const [isPasskeyEnabled, setIsPasskeyEnabled] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<PasskeyDevice[]>([
    {
      id: '1',
      name: 'iPhone Face ID',
      type: 'face',
      isActive: true,
      lastUsed: '2024-01-15 14:30',
      trustLevel: 'high'
    },
    {
      id: '2',
      name: 'Samsung Fingerprint',
      type: 'fingerprint',
      isActive: true,
      lastUsed: '2024-01-14 09:15',
      trustLevel: 'high'
    },
    {
      id: '3',
      name: 'Windows Hello',
      type: 'face',
      isActive: false,
      lastUsed: '2024-01-10 16:45',
      trustLevel: 'medium'
    }
  ]);

  const handlePasskeyRegistration = async () => {
    setIsRegistering(true);
    
    try {
      // Simulate WebAuthn registration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newDevice: PasskeyDevice = {
        id: Date.now().toString(),
        name: 'New Biometric Device',
        type: 'fingerprint',
        isActive: true,
        lastUsed: new Date().toLocaleString(),
        trustLevel: 'high'
      };
      
      setDevices([...devices, newDevice]);
      toast.success('Passkey registered successfully!');
    } catch (error) {
      toast.error('Failed to register passkey');
    } finally {
      setIsRegistering(false);
    }
  };

  const handlePasskeyAuthentication = async () => {
    setIsAuthenticating(true);
    setAuthSuccess(null);
    
    try {
      // Simulate WebAuthn authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const success = Math.random() > 0.1; // 90% success rate
      setAuthSuccess(success);
      
      if (success) {
        toast.success('Authentication successful!');
      } else {
        toast.error('Authentication failed');
      }
    } catch (error) {
      setAuthSuccess(false);
      toast.error('Authentication error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const toggleDevice = (deviceId: string) => {
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? { ...device, isActive: !device.isActive }
        : device
    ));
  };

  const removeDevice = (deviceId: string) => {
    setDevices(devices.filter(device => device.id !== deviceId));
    toast.success('Device removed successfully');
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'face': return <Eye className="w-4 h-4" />;
      case 'fingerprint': return <Fingerprint className="w-4 h-4" />;
      case 'pin': return <Key className="w-4 h-4" />;
      default: return <Scan className="w-4 h-4" />;
    }
  };

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Passkey Setup Card */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Fingerprint className="w-5 h-5 text-indigo-600" />
            Passkey Authentication Setup
          </CardTitle>
          <CardDescription className="text-slate-600">
            Configure biometric authentication using WebAuthn standard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Passkey */}
          <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-lg border border-slate-200/60">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="font-medium text-slate-900">Enable Passkey Authentication</p>
                <p className="text-sm text-slate-500">Use biometrics for secure login</p>
              </div>
            </div>
            <Switch 
              checked={isPasskeyEnabled} 
              onCheckedChange={setIsPasskeyEnabled}
            />
          </div>

          {isPasskeyEnabled && (
            <>
              {/* Authentication Test */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Test Authentication</h3>
                <div className="flex gap-3">
                  <Button 
                    onClick={handlePasskeyAuthentication}
                    disabled={isAuthenticating}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {isAuthenticating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <Fingerprint className="w-4 h-4 mr-2" />
                        Test Biometric Auth
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handlePasskeyRegistration}
                    disabled={isRegistering}
                    className="border-slate-200"
                  >
                    {isRegistering ? (
                      <>
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        Register New Device
                      </>
                    )}
                  </Button>
                </div>

                {authSuccess !== null && (
                  <Alert className={authSuccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    {authSuccess ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={authSuccess ? 'text-green-700' : 'text-red-700'}>
                      {authSuccess 
                        ? 'Biometric authentication successful! Your identity has been verified.'
                        : 'Biometric authentication failed. Please try again or use an alternative method.'
                      }
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Registered Devices */}
      {isPasskeyEnabled && (
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Smartphone className="w-5 h-5 text-indigo-600" />
              Registered Devices
            </CardTitle>
            <CardDescription className="text-slate-600">
              Manage your biometric authentication devices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 bg-slate-50/80 rounded-lg border border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${device.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{device.name}</p>
                      <Badge className={getTrustLevelColor(device.trustLevel)}>
                        {device.trustLevel} trust
                      </Badge>
                      {device.isActive ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-200 text-slate-500">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">Last used: {device.lastUsed}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleDevice(device.id)}
                    className="border-slate-200"
                  >
                    {device.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeDevice(device.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Security Settings */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Settings className="w-5 h-5 text-indigo-600" />
            Security Configuration
          </CardTitle>
          <CardDescription className="text-slate-600">
            Advanced passkey security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeout" className="text-slate-700">Authentication Timeout</Label>
              <Input 
                id="timeout"
                type="number" 
                defaultValue="300" 
                className="bg-white/80 border-slate-200"
              />
              <p className="text-xs text-slate-500">Seconds before re-authentication required</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="attempts" className="text-slate-700">Max Failed Attempts</Label>
              <Input 
                id="attempts"
                type="number" 
                defaultValue="3" 
                className="bg-white/80 border-slate-200"
              />
              <p className="text-xs text-slate-500">Lock account after failed attempts</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Require User Verification</p>
                <p className="text-sm text-slate-500">Always require biometric confirmation</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Cross-Platform Authentication</p>
                <p className="text-sm text-slate-500">Allow authentication from different devices</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Backup Authentication</p>
                <p className="text-sm text-slate-500">Enable fallback to traditional login</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Guide */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="text-slate-900">WebAuthn Implementation</CardTitle>
          <CardDescription className="text-slate-600">
            Technical details for passkey integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Supported Authenticators</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Platform authenticators (Face ID, Touch ID, Windows Hello)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Cross-platform authenticators (USB security keys)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Mobile device biometrics (fingerprint, face recognition)
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Security Features</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  FIDO2/WebAuthn standard compliance
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  Public key cryptography
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  Anti-phishing protection
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};