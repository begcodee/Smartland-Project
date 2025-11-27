import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin, Search, Filter, Eye, 
  CheckCircle, AlertTriangle, Users, CreditCard
} from 'lucide-react';

interface CountryData {
  code: string;
  name: string;
  verificationCount: number;
  successRate: number;
  cardTypes: string[];
  status: 'active' | 'pending' | 'inactive';
  population: number;
}

export const AfricaMapViewer = () => {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');

  const countriesData: CountryData[] = [
    { code: 'NG', name: 'Nigeria', verificationCount: 45678, successRate: 97.2, cardTypes: ['National ID (NIN)', 'Voter\'s Card'], status: 'active', population: 218000000 },
    { code: 'ZA', name: 'South Africa', verificationCount: 32145, successRate: 95.8, cardTypes: ['Smart ID Card', 'Driver\'s License'], status: 'active', population: 60000000 },
    { code: 'KE', name: 'Kenya', verificationCount: 28934, successRate: 96.5, cardTypes: ['Huduma Namba ID'], status: 'active', population: 54000000 },
    { code: 'GH', name: 'Ghana', verificationCount: 18567, successRate: 94.3, cardTypes: ['Ghana Card'], status: 'active', population: 32000000 },
    { code: 'EG', name: 'Egypt', verificationCount: 41234, successRate: 93.7, cardTypes: ['National ID Card'], status: 'active', population: 104000000 },
    { code: 'MA', name: 'Morocco', verificationCount: 15678, successRate: 92.1, cardTypes: ['CNIE'], status: 'pending', population: 37000000 },
    { code: 'ET', name: 'Ethiopia', verificationCount: 12456, successRate: 89.4, cardTypes: ['Ethiopian ID'], status: 'pending', population: 120000000 },
    { code: 'TZ', name: 'Tanzania', verificationCount: 9876, successRate: 91.2, cardTypes: ['National ID'], status: 'active', population: 61000000 },
    { code: 'UG', name: 'Uganda', verificationCount: 7654, successRate: 88.9, cardTypes: ['National ID'], status: 'pending', population: 47000000 },
    { code: 'RW', name: 'Rwanda', verificationCount: 5432, successRate: 96.8, cardTypes: ['National ID'], status: 'active', population: 13000000 }
  ];

  const filteredCountries = countriesData.filter(country => {
    const matchesSearch = country.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || country.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'inactive': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />;
      case 'pending': return <AlertTriangle className="w-3 h-3" />;
      case 'inactive': return <AlertTriangle className="w-3 h-3" />;
      default: return <AlertTriangle className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 border-slate-200"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'active', 'pending', 'inactive'] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className={filterStatus === status ? '' : 'border-slate-200'}
            >
              <Filter className="w-4 h-4 mr-2" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Visualization */}
        <div className="lg:col-span-2">
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 h-[500px]">
            <CardContent className="p-6 h-full">
              <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-slate-200/60 flex items-center justify-center">
                {/* Simplified Africa Map Representation */}
                <div className="relative w-full h-full max-w-md">
                  <svg viewBox="0 0 400 400" className="w-full h-full">
                    {/* Simplified Africa continent shape */}
                    <path
                      d="M200 50 C250 60, 300 100, 320 150 C330 200, 320 250, 300 300 C280 340, 240 360, 200 370 C160 360, 120 340, 100 300 C80 250, 70 200, 80 150 C100 100, 150 60, 200 50 Z"
                      fill="#e2e8f0"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      className="hover:fill-indigo-100 transition-colors cursor-pointer"
                    />
                    
                    {/* Country markers */}
                    {filteredCountries.slice(0, 8).map((country, index) => {
                      const positions = [
                        { x: 180, y: 120 }, // Nigeria
                        { x: 220, y: 280 }, // South Africa
                        { x: 260, y: 180 }, // Kenya
                        { x: 140, y: 140 }, // Ghana
                        { x: 200, y: 80 },  // Egypt
                        { x: 120, y: 90 },  // Morocco
                        { x: 240, y: 160 }, // Ethiopia
                        { x: 250, y: 200 }  // Tanzania
                      ];
                      
                      const pos = positions[index] || { x: 200 + index * 20, y: 200 + index * 15 };
                      
                      return (
                        <g key={country.code}>
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r="8"
                            fill={country.status === 'active' ? '#10b981' : country.status === 'pending' ? '#f59e0b' : '#ef4444'}
                            stroke="white"
                            strokeWidth="2"
                            className="cursor-pointer hover:r-10 transition-all"
                            onClick={() => setSelectedCountry(country)}
                          />
                          <text
                            x={pos.x}
                            y={pos.y + 20}
                            textAnchor="middle"
                            className="text-xs font-medium fill-slate-700"
                          >
                            {country.code}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                
                {/* Map Legend */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-slate-200/60">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Status</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Active</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Inactive</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Country Details Panel */}
        <div className="space-y-4">
          {selectedCountry ? (
            <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">{selectedCountry.name}</h3>
                  <Badge className={getStatusColor(selectedCountry.status)}>
                    {getStatusIcon(selectedCountry.status)}
                    <span className="ml-1">{selectedCountry.status}</span>
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-slate-700">
                      {selectedCountry.verificationCount.toLocaleString()} verifications
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-slate-700">
                      {selectedCountry.successRate}% success rate
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">
                      {(selectedCountry.population / 1000000).toFixed(1)}M population
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Supported Card Types</h4>
                  <div className="space-y-1">
                    {selectedCountry.cardTypes.map((cardType, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-slate-200">
                        {cardType}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
              <CardContent className="p-6 text-center">
                <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">Click on a country marker to view details</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {filteredCountries.filter(c => c.status === 'active').length}
                </p>
                <p className="text-xs text-slate-500">Active Countries</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round(filteredCountries.reduce((sum, c) => sum + c.successRate, 0) / filteredCountries.length)}%
                </p>
                <p className="text-xs text-slate-500">Avg Success Rate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Countries List */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">All Countries</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCountries.map((country) => (
              <div
                key={country.code}
                onClick={() => setSelectedCountry(country)}
                className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-lg border border-slate-200/60 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className={`w-3 h-3 rounded-full ${
                  country.status === 'active' ? 'bg-green-500' : 
                  country.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{country.name}</p>
                  <p className="text-xs text-slate-500">
                    {country.verificationCount.toLocaleString()} verifications
                  </p>
                </div>
                <Badge className={getStatusColor(country.status)} variant="outline">
                  {country.successRate}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};