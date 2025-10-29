import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, LogOut, Settings, Shield, Home, ShoppingCart, Gavel, Building, 
  Phone, MapPin, Calendar, CreditCard, Star, Trophy, TrendingUp,
  Mail, Globe, Hash
} from 'lucide-react';
import { User as UserType } from '@/types';
import { useAuth } from '@/components/UserAuth';

export const UserProfileDialog = () => {
  const { currentUser, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(currentUser || {} as UserType);

  if (!currentUser) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'landowner': return <Home className="w-4 h-4" />;
      case 'buyer': return <ShoppingCart className="w-4 h-4" />;
      case 'authority': return <Building className="w-4 h-4" />;
      case 'arbitrator': return <Gavel className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'landowner': return 'bg-blue-100 text-blue-800';
      case 'buyer': return 'bg-green-100 text-green-800';
      case 'authority': return 'bg-purple-100 text-purple-800';
      case 'arbitrator': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReputationLevel = (score: number) => {
    if (score >= 95) return { level: 'Excellent', color: 'text-green-600', icon: '🏆' };
    if (score >= 85) return { level: 'Very Good', color: 'text-blue-600', icon: '⭐' };
    if (score >= 70) return { level: 'Good', color: 'text-orange-600', icon: '👍' };
    if (score >= 50) return { level: 'Fair', color: 'text-yellow-600', icon: '👌' };
    return { level: 'Poor', color: 'text-red-600', icon: '⚠️' };
  };

  const handleSaveProfile = () => {
    updateProfile(editData);
    setIsEditing(false);
  };

  const reputation = getReputationLevel(currentUser.reputation.score);

  return (
    <div className="flex items-center gap-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={currentUser.profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`} />
              <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Profile
            </DialogTitle>
            <DialogDescription>
              Manage your account information, reputation, and settings
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="reputation">Reputation</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={currentUser.profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} />
                  <AvatarFallback className="text-2xl">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold">{currentUser.name}</h3>
                    <Badge className={getRoleColor(currentUser.role)}>
                      {getRoleIcon(currentUser.role)}
                      <span className="ml-1 capitalize">{currentUser.role}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getVerificationColor(currentUser.verificationStatus)}>
                      <Shield className="w-3 h-3 mr-1" />
                      {currentUser.verificationStatus}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">{currentUser.reputation.score}/100</span>
                      <span className={`text-sm ${reputation.color}`}>
                        {reputation.icon} {reputation.level}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {currentUser.profile.bio}
                  </p>
                </div>
              </div>

              <Separator />

              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={editData.profile?.phone || ''}
                        onChange={(e) => setEditData({ 
                          ...editData, 
                          profile: { ...editData.profile, phone: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={editData.profile?.dateOfBirth || ''}
                        onChange={(e) => setEditData({ 
                          ...editData, 
                          profile: { ...editData.profile, dateOfBirth: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Address Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Street Address</Label>
                        <Input
                          value={editData.profile?.address || ''}
                          onChange={(e) => setEditData({ 
                            ...editData, 
                            profile: { ...editData.profile, address: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          value={editData.profile?.city || ''}
                          onChange={(e) => setEditData({ 
                            ...editData, 
                            profile: { ...editData.profile, city: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Input
                          value={editData.profile?.state || ''}
                          onChange={(e) => setEditData({ 
                            ...editData, 
                            profile: { ...editData.profile, state: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Input
                          value={editData.profile?.country || ''}
                          onChange={(e) => setEditData({ 
                            ...editData, 
                            profile: { ...editData.profile, country: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Postal Code</Label>
                        <Input
                          value={editData.profile?.postalCode || ''}
                          onChange={(e) => setEditData({ 
                            ...editData, 
                            profile: { ...editData.profile, postalCode: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      value={editData.profile?.bio || ''}
                      onChange={(e) => setEditData({ 
                        ...editData, 
                        profile: { ...editData.profile, bio: e.target.value }
                      })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Wallet Address</Label>
                    <Input
                      value={editData.walletAddress}
                      onChange={(e) => setEditData({ ...editData, walletAddress: e.target.value })}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{currentUser.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{currentUser.profile.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </h4>
                    <div className="space-y-2">
                      <p>{currentUser.profile.address}</p>
                      <p>{currentUser.profile.city}, {currentUser.profile.state} {currentUser.profile.postalCode}</p>
                      <p>{currentUser.profile.country}</p>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">{new Date(currentUser.profile.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">National ID</p>
                        <p className="font-medium font-mono">{currentUser.profile.nationalId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <p className="font-medium">{new Date(currentUser.joinedDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Active</p>
                        <p className="font-medium">{new Date(currentUser.lastActive).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Information */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Blockchain Information
                    </h4>
                    <div>
                      <p className="text-sm text-muted-foreground">Wallet Address</p>
                      <p className="font-mono text-sm break-all">{currentUser.walletAddress}</p>
                    </div>
                  </div>

                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reputation" className="space-y-6">
              {/* Reputation Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Reputation Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{currentUser.reputation.score}/100</p>
                      <p className={`text-sm ${reputation.color}`}>
                        {reputation.icon} {reputation.level}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{new Date(currentUser.reputation.lastUpdated).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Progress value={currentUser.reputation.score} className="h-3" />
                </CardContent>
              </Card>

              {/* Reputation Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{currentUser.reputation.totalTransactions}</div>
                      <p className="text-sm text-muted-foreground">Total Transactions</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Trophy className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{currentUser.reputation.successfulTransactions}</div>
                      <p className="text-sm text-muted-foreground">Successful</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Gavel className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{currentUser.reputation.disputesWon}</div>
                      <p className="text-sm text-muted-foreground">Disputes Won</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{currentUser.reputation.communityVotes}</div>
                      <p className="text-sm text-muted-foreground">Community Votes</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Success Rate */}
              <Card>
                <CardHeader>
                  <CardTitle>Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Transaction Success Rate</span>
                      <span className="font-medium">
                        {((currentUser.reputation.successfulTransactions / currentUser.reputation.totalTransactions) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={(currentUser.reputation.successfulTransactions / currentUser.reputation.totalTransactions) * 100} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-2 border rounded">
                        <Shield className="w-4 h-4 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Profile Verified</p>
                          <p className="text-xs text-muted-foreground">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 border rounded">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Reputation Updated</p>
                          <p className="text-xs text-muted-foreground">1 week ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 border rounded">
                        <Gavel className="w-4 h-4 text-orange-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Participated in Dispute Vote</p>
                          <p className="text-xs text-muted-foreground">2 weeks ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Profile Completeness</span>
                        <span className="font-medium">95%</span>
                      </div>
                      <Progress value={95} className="h-2" />
                      
                      <div className="flex justify-between">
                        <span className="text-sm">Verification Level</span>
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm">Account Age</span>
                        <span className="font-medium">
                          {Math.floor((new Date().getTime() - new Date(currentUser.joinedDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <Button variant="ghost" size="sm" onClick={logout}>
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
};