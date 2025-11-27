import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, Crown, Users, Gavel, 
  MapPin, FileText, BarChart3, Settings,
  Bell, Search, Plus, Eye
} from 'lucide-react';
import { useAuth } from '@/components/UserAuth';

interface RoleBasedUIProps {
  children: ReactNode;
}

export const RoleBasedUI = ({ children }: RoleBasedUIProps) => {
  const { currentUser } = useAuth();

  if (!currentUser) return <>{children}</>;

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'landowner':
        return {
          theme: 'from-green-500 to-emerald-600',
          bgGradient: 'from-green-50 to-emerald-50',
          accentColor: 'text-green-600',
          badgeColor: 'bg-green-100 text-green-800',
          icon: <MapPin className="w-5 h-5" />,
          title: 'Landowner Dashboard',
          description: 'Manage your land properties and registrations',
          features: [
            { icon: <Plus className="w-4 h-4" />, label: 'Register New Land', action: 'register' },
            { icon: <Eye className="w-4 h-4" />, label: 'View My Properties', action: 'view' },
            { icon: <FileText className="w-4 h-4" />, label: 'Upload Documents', action: 'documents' },
            { icon: <BarChart3 className="w-4 h-4" />, label: 'Property Analytics', action: 'analytics' }
          ]
        };
      
      case 'buyer':
        return {
          theme: 'from-blue-500 to-cyan-600',
          bgGradient: 'from-blue-50 to-cyan-50',
          accentColor: 'text-blue-600',
          badgeColor: 'bg-blue-100 text-blue-800',
          icon: <Search className="w-5 h-5" />,
          title: 'Buyer Dashboard',
          description: 'Discover and purchase land properties',
          features: [
            { icon: <Search className="w-4 h-4" />, label: 'Browse Properties', action: 'browse' },
            { icon: <MapPin className="w-4 h-4" />, label: 'Map Search', action: 'map' },
            { icon: <Bell className="w-4 h-4" />, label: 'Price Alerts', action: 'alerts' },
            { icon: <FileText className="w-4 h-4" />, label: 'Purchase History', action: 'history' }
          ]
        };
      
      case 'authority':
        return {
          theme: 'from-purple-500 to-indigo-600',
          bgGradient: 'from-purple-50 to-indigo-50',
          accentColor: 'text-purple-600',
          badgeColor: 'bg-purple-100 text-purple-800',
          icon: <Shield className="w-5 h-5" />,
          title: 'Authority Dashboard',
          description: 'Government land administration and oversight',
          features: [
            { icon: <Shield className="w-4 h-4" />, label: 'Verify Documents', action: 'verify' },
            { icon: <Users className="w-4 h-4" />, label: 'User Management', action: 'users' },
            { icon: <BarChart3 className="w-4 h-4" />, label: 'System Analytics', action: 'analytics' },
            { icon: <Settings className="w-4 h-4" />, label: 'System Settings', action: 'settings' }
          ]
        };
      
      case 'arbitrator':
        return {
          theme: 'from-orange-500 to-red-600',
          bgGradient: 'from-orange-50 to-red-50',
          accentColor: 'text-orange-600',
          badgeColor: 'bg-orange-100 text-orange-800',
          icon: <Gavel className="w-5 h-5" />,
          title: 'Arbitrator Dashboard',
          description: 'Resolve land disputes and conflicts',
          features: [
            { icon: <Gavel className="w-4 h-4" />, label: 'Active Disputes', action: 'disputes' },
            { icon: <FileText className="w-4 h-4" />, label: 'Case Reviews', action: 'reviews' },
            { icon: <Users className="w-4 h-4" />, label: 'Community Voting', action: 'voting' },
            { icon: <Crown className="w-4 h-4" />, label: 'Final Decisions', action: 'decisions' }
          ]
        };
      
      default:
        return {
          theme: 'from-gray-500 to-slate-600',
          bgGradient: 'from-gray-50 to-slate-50',
          accentColor: 'text-gray-600',
          badgeColor: 'bg-gray-100 text-gray-800',
          icon: <Users className="w-5 h-5" />,
          title: 'User Dashboard',
          description: 'Welcome to the land registry platform',
          features: []
        };
    }
  };

  const config = getRoleConfig(currentUser.role);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient}`}>
      {/* Role-based Header */}
      <div className={`bg-gradient-to-r ${config.theme} text-white py-6 px-6 shadow-lg`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                {config.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{config.title}</h1>
                <p className="text-white/90">{config.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge className={`${config.badgeColor} border-0`}>
                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
              </Badge>
              <div className="text-right">
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-sm text-white/80">{currentUser.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role-based Quick Actions */}
      {config.features.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className={`${config.accentColor} flex items-center gap-2`}>
                <Crown className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks for {currentUser.role}s
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {config.features.map((feature, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${config.theme} text-white`}>
                      {feature.icon}
                    </div>
                    <span className="text-sm font-medium text-center">{feature.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content with Role-based Styling */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="space-y-6">
          {children}
        </div>
      </div>

      {/* Role-based Footer */}
      <div className={`mt-12 py-8 px-6 bg-gradient-to-r ${config.theme} text-white`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {config.icon}
            <span className="font-semibold">
              {currentUser.organization || `${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Portal`}
            </span>
          </div>
          <p className="text-white/80 text-sm">
            Secure • Transparent • Blockchain-powered Land Registry
          </p>
        </div>
      </div>
    </div>
  );
};

export const RoleBasedCard = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return <Card className={className}>{children}</Card>;
  
  const getRoleBorder = (role: string) => {
    switch (role) {
      case 'landowner': return 'border-l-4 border-l-green-500';
      case 'buyer': return 'border-l-4 border-l-blue-500';
      case 'authority': return 'border-l-4 border-l-purple-500';
      case 'arbitrator': return 'border-l-4 border-l-orange-500';
      default: return 'border-l-4 border-l-gray-500';
    }
  };

  return (
    <Card className={`${className} ${getRoleBorder(currentUser.role)} shadow-sm hover:shadow-md transition-shadow`}>
      {children}
    </Card>
  );
};