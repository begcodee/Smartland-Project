import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, TrendingUp, Users, Shield, 
  CheckCircle, AlertTriangle, Globe, Activity
} from 'lucide-react';

export const VerificationAnalytics = () => {
  const analyticsData = {
    totalVerifications: 247856,
    successRate: 96.8,
    averageTime: 2.3,
    activeCountries: 54,
    dailyGrowth: 12.5,
    weeklyGrowth: 8.7,
    monthlyGrowth: 23.4
  };

  const countryStats = [
    { country: 'Nigeria', verifications: 45678, successRate: 97.2, growth: 15.3 },
    { country: 'South Africa', verifications: 32145, successRate: 95.8, growth: 12.1 },
    { country: 'Kenya', verifications: 28934, successRate: 96.5, growth: 18.7 },
    { country: 'Ghana', verifications: 18567, successRate: 94.3, growth: 9.8 },
    { country: 'Egypt', verifications: 41234, successRate: 93.7, growth: 7.2 }
  ];

  const biometricStats = [
    { type: 'Fingerprint', usage: 45, accuracy: 98.7, color: 'bg-blue-500' },
    { type: 'Face Recognition', usage: 32, accuracy: 96.3, color: 'bg-green-500' },
    { type: 'Voice Print', usage: 15, accuracy: 94.1, color: 'bg-purple-500' },
    { type: 'Iris Scan', usage: 8, accuracy: 99.2, color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {analyticsData.totalVerifications.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500">Total Verifications</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+{analyticsData.dailyGrowth}% today</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{analyticsData.successRate}%</p>
                <p className="text-sm text-slate-500">Success Rate</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+{analyticsData.weeklyGrowth}% this week</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{analyticsData.averageTime}s</p>
                <p className="text-sm text-slate-500">Avg. Verification Time</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">15% faster</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{analyticsData.activeCountries}</p>
                <p className="text-sm text-slate-500">Active Countries</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+{analyticsData.monthlyGrowth}% this month</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Country Performance */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Top Performing Countries
          </CardTitle>
          <CardDescription className="text-slate-600">
            Verification statistics by country
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {countryStats.map((country, index) => (
            <div key={country.country} className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-lg border border-slate-200/60">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-indigo-600">#{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{country.country}</p>
                  <p className="text-sm text-slate-500">
                    {country.verifications.toLocaleString()} verifications
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{country.successRate}%</p>
                  <p className="text-xs text-slate-500">Success Rate</p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-sm font-medium text-green-600">+{country.growth}%</span>
                  </div>
                  <p className="text-xs text-slate-500">Growth</p>
                </div>
                
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Biometric Usage Analytics */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Users className="w-5 h-5 text-indigo-600" />
            Biometric Method Usage
          </CardTitle>
          <CardDescription className="text-slate-600">
            Distribution and accuracy of biometric authentication methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {biometricStats.map((stat) => (
            <div key={stat.type} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${stat.color}`}></div>
                  <span className="font-medium text-slate-900">{stat.type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">{stat.usage}% usage</span>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    {stat.accuracy}% accuracy
                  </Badge>
                </div>
              </div>
              <Progress value={stat.usage} className="w-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
          <CardHeader>
            <CardTitle className="text-slate-900">System Performance</CardTitle>
            <CardDescription className="text-slate-600">
              Real-time system metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">API Response Time</span>
              <span className="text-sm font-medium text-slate-900">145ms</span>
            </div>
            <Progress value={85} className="w-full" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Database Performance</span>
              <span className="text-sm font-medium text-slate-900">98.7%</span>
            </div>
            <Progress value={98.7} className="w-full" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Server Uptime</span>
              <span className="text-sm font-medium text-slate-900">99.9%</span>
            </div>
            <Progress value={99.9} className="w-full" />
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
          <CardHeader>
            <CardTitle className="text-slate-900">Security Alerts</CardTitle>
            <CardDescription className="text-slate-600">
              Recent security events and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50/80 rounded-lg border border-green-200/60">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">All systems operational</p>
                <p className="text-xs text-green-600">Last checked: 2 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-yellow-50/80 rounded-lg border border-yellow-200/60">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-900">High verification volume</p>
                <p className="text-xs text-yellow-600">Nigeria region - 15 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50/80 rounded-lg border border-blue-200/60">
              <Shield className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Security update deployed</p>
                <p className="text-xs text-blue-600">Version 2.1.4 - 1 hour ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};