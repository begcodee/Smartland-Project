import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, BarChart3, PieChart, 
  DollarSign, MapPin, Users, Activity, Calendar,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { mockLandParcels, mockDisputes, mockTransfers, mockUsers } from '@/lib/mockData';
import { useAuth } from '@/components/UserAuth';

export const Analytics = () => {
  const { currentUser } = useAuth();

  // Calculate analytics data
  const totalProperties = mockLandParcels.length;
  const totalValue = mockLandParcels.reduce((sum, p) => sum + p.value, 0);
  const activeDisputes = mockDisputes.filter(d => d.status !== 'resolved').length;
  const pendingTransfers = mockTransfers.filter(t => t.status === 'pending').length;
  const verifiedUsers = mockUsers.filter(u => u.verificationStatus === 'verified').length;

  // Monthly trends (mock data)
  const monthlyData = {
    properties: { current: 15, previous: 12, change: 25 },
    transactions: { current: 8, previous: 6, change: 33.3 },
    disputes: { current: 2, previous: 4, change: -50 },
    value: { current: 395000, previous: 320000, change: 23.4 }
  };

  // Property distribution by status
  const statusDistribution = {
    active: mockLandParcels.filter(p => p.status === 'active').length,
    disputed: mockLandParcels.filter(p => p.status === 'disputed').length,
    transferPending: mockLandParcels.filter(p => p.status === 'transfer_pending').length
  };

  // User role distribution
  const roleDistribution = {
    landowners: mockUsers.filter(u => u.role === 'landowner').length,
    buyers: mockUsers.filter(u => u.role === 'buyer').length,
    authorities: mockUsers.filter(u => u.role === 'authority').length,
    arbitrators: mockUsers.filter(u => u.role === 'arbitrator').length
  };

  const getTrendIcon = (change: number) => {
    return change > 0 ? (
      <ArrowUpRight className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-600" />
    );
  };

  const getTrendColor = (change: number) => {
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-700">Total Properties</p>
                <p className="text-3xl font-bold text-blue-900">{totalProperties}</p>
                <div className="flex items-center gap-1">
                  {getTrendIcon(monthlyData.properties.change)}
                  <span className={`text-xs ${getTrendColor(monthlyData.properties.change)}`}>
                    {monthlyData.properties.change}% from last month
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
                <MapPin className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-700">Total Value</p>
                <p className="text-3xl font-bold text-green-900">${(totalValue / 1000).toFixed(0)}K</p>
                <div className="flex items-center gap-1">
                  {getTrendIcon(monthlyData.value.change)}
                  <span className={`text-xs ${getTrendColor(monthlyData.value.change)}`}>
                    {monthlyData.value.change}% from last month
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-orange-700">Active Disputes</p>
                <p className="text-3xl font-bold text-orange-900">{activeDisputes}</p>
                <div className="flex items-center gap-1">
                  {getTrendIcon(monthlyData.disputes.change)}
                  <span className={`text-xs ${getTrendColor(monthlyData.disputes.change)}`}>
                    {Math.abs(monthlyData.disputes.change)}% from last month
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-700">Verified Users</p>
                <p className="text-3xl font-bold text-purple-900">{verifiedUsers}</p>
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600">
                    {((verifiedUsers / mockUsers.length) * 100).toFixed(0)}% verification rate
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 text-white">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Status Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Property Status Distribution
            </CardTitle>
            <CardDescription>Current status of all registered properties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{statusDistribution.active}</span>
                  <Badge variant="outline">
                    {((statusDistribution.active / totalProperties) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
              <Progress value={(statusDistribution.active / totalProperties) * 100} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Disputed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{statusDistribution.disputed}</span>
                  <Badge variant="outline">
                    {((statusDistribution.disputed / totalProperties) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
              <Progress value={(statusDistribution.disputed / totalProperties) * 100} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Transfer Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{statusDistribution.transferPending}</span>
                  <Badge variant="outline">
                    {((statusDistribution.transferPending / totalProperties) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
              <Progress value={(statusDistribution.transferPending / totalProperties) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* User Role Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Role Distribution
            </CardTitle>
            <CardDescription>Platform users by role type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Landowners</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{roleDistribution.landowners}</span>
                  <Badge variant="outline">
                    {((roleDistribution.landowners / mockUsers.length) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
              <Progress value={(roleDistribution.landowners / mockUsers.length) * 100} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Buyers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{roleDistribution.buyers}</span>
                  <Badge variant="outline">
                    {((roleDistribution.buyers / mockUsers.length) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
              <Progress value={(roleDistribution.buyers / mockUsers.length) * 100} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Authorities</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{roleDistribution.authorities}</span>
                  <Badge variant="outline">
                    {((roleDistribution.authorities / mockUsers.length) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
              <Progress value={(roleDistribution.authorities / mockUsers.length) * 100} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Arbitrators</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{roleDistribution.arbitrators}</span>
                  <Badge variant="outline">
                    {((roleDistribution.arbitrators / mockUsers.length) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
              <Progress value={(roleDistribution.arbitrators / mockUsers.length) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Monthly Performance Trends
          </CardTitle>
          <CardDescription>Key metrics comparison with previous month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">New Properties</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-1">
                {monthlyData.properties.current}
              </div>
              <div className="flex items-center justify-center gap-1">
                {getTrendIcon(monthlyData.properties.change)}
                <span className={`text-xs ${getTrendColor(monthlyData.properties.change)}`}>
                  {monthlyData.properties.change}%
                </span>
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-green-50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Transactions</span>
              </div>
              <div className="text-2xl font-bold text-green-900 mb-1">
                {monthlyData.transactions.current}
              </div>
              <div className="flex items-center justify-center gap-1">
                {getTrendIcon(monthlyData.transactions.change)}
                <span className={`text-xs ${getTrendColor(monthlyData.transactions.change)}`}>
                  {monthlyData.transactions.change}%
                </span>
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-orange-50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Disputes</span>
              </div>
              <div className="text-2xl font-bold text-orange-900 mb-1">
                {monthlyData.disputes.current}
              </div>
              <div className="flex items-center justify-center gap-1">
                {getTrendIcon(monthlyData.disputes.change)}
                <span className={`text-xs ${getTrendColor(monthlyData.disputes.change)}`}>
                  {Math.abs(monthlyData.disputes.change)}%
                </span>
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-purple-50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Total Value</span>
              </div>
              <div className="text-2xl font-bold text-purple-900 mb-1">
                ${(monthlyData.value.current / 1000).toFixed(0)}K
              </div>
              <div className="flex items-center justify-center gap-1">
                {getTrendIcon(monthlyData.value.change)}
                <span className={`text-xs ${getTrendColor(monthlyData.value.change)}`}>
                  {monthlyData.value.change}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};