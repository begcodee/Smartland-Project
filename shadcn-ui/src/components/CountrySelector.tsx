import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { countries } from '@/lib/mockData';

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export const CountrySelector = ({ value, onChange, label, placeholder }: CountrySelectorProps) => {
  const [detectedCountry, setDetectedCountry] = useState<string>('');

  // Auto-detect user's country based on their location/timezone
  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Try to get country from timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Map common timezones to countries
        const timezoneCountryMap: { [key: string]: string } = {
          'Africa/Accra': 'GH',
          'Africa/Lagos': 'NG',
          'Africa/Nairobi': 'KE',
          'Africa/Johannesburg': 'ZA',
          'Africa/Cairo': 'EG',
          'Africa/Casablanca': 'MA',
          'Africa/Addis_Ababa': 'ET',
          'Africa/Dar_es_Salaam': 'TZ',
          'Africa/Kampala': 'UG',
          'Africa/Kigali': 'RW',
          'Africa/Dakar': 'SN',
          'Africa/Abidjan': 'CI',
          'Africa/Ouagadougou': 'BF',
          'Africa/Bamako': 'ML',
          'Africa/Porto-Novo': 'BJ',
          'Africa/Lome': 'TG',
          'Africa/Monrovia': 'LR',
          'Africa/Freetown': 'SL',
          'Africa/Conakry': 'GN',
          'Africa/Banjul': 'GM'
        };

        let countryCode = timezoneCountryMap[timezone];

        // If not found in timezone map, try to detect from locale
        if (!countryCode) {
          const locale = navigator.language || 'en-US';
          const localeParts = locale.split('-');
          if (localeParts.length > 1) {
            const localeCountry = localeParts[1].toUpperCase();
            // Check if the locale country exists in our countries list
            if (countries.find(c => c.code === localeCountry)) {
              countryCode = localeCountry;
            }
          }
        }

        // Default to Ghana if no detection possible
        if (!countryCode) {
          countryCode = 'GH';
        }

        setDetectedCountry(countryCode);
        
        // Auto-set the country if no value is currently selected
        if (!value && countryCode) {
          onChange(countryCode);
        }
      } catch (error) {
        // Fallback to Ghana
        setDetectedCountry('GH');
        if (!value) {
          onChange('GH');
        }
      }
    };

    detectCountry();
  }, [value, onChange]);

  const selectedCountry = countries.find(c => c.code === value);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder || "Select your country"}>
            {selectedCountry && (
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span>{selectedCountry.name}</span>
                <span className="text-muted-foreground text-sm">{selectedCountry.dialCode}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {detectedCountry && (
            <>
              <SelectItem value={detectedCountry}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{countries.find(c => c.code === detectedCountry)?.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{countries.find(c => c.code === detectedCountry)?.name}</span>
                    <span className="text-xs text-muted-foreground">Detected from your location</span>
                  </div>
                  <span className="text-muted-foreground text-sm ml-auto">
                    {countries.find(c => c.code === detectedCountry)?.dialCode}
                  </span>
                </div>
              </SelectItem>
              <div className="px-2 py-1">
                <div className="border-t border-border"></div>
              </div>
            </>
          )}
          {countries
            .filter(country => country.code !== detectedCountry)
            .map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{country.flag}</span>
                  <span>{country.name}</span>
                  <span className="text-muted-foreground text-sm ml-auto">{country.dialCode}</span>
                </div>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};