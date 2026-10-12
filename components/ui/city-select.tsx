'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { City } from 'country-state-city';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Top popular Indian cities prioritized
const TOP_INDIAN_CITIES = [
  'Jaipur',
  'New Delhi',
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Hyderabad',
  'Ahmedabad',
  'Pune',
  'Kolkata',
  'Surat',
  'Lucknow',
  'Kanpur',
  'Indore',
  'Chandigarh',
  'Bhopal',
  'Patna',
  'Vadodara',
  'Ghaziabad',
  'Ludhiana',
  'Agra',
  'Nashik',
  'Faridabad',
  'Meerut',
  'Rajkot',
  'Varanasi',
  'Srinagar',
  'Amritsar',
  'Jodhpur',
  'Kota',
  'Udaipur',
  'Noida',
  'Gurugram',
  'Dehradun',
  'Guwahati',
  'Raipur',
  'Ranchi',
];

export interface CitySelectProps {
  label?: string;
  value: string;
  onChange: (city: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function CitySelect({
  label = 'City *',
  value,
  onChange,
  error,
  placeholder = 'Select or type city (e.g. Jaipur, Delhi...)',
  required,
  className,
}: CitySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Load cities using country-state-city
  const allIndianCities = useMemo(() => {
    try {
      const cities = City.getCitiesOfCountry('IN') || [];
      const cityNames = new Set<string>(TOP_INDIAN_CITIES);
      cities.forEach((c) => {
        if (c.name) cityNames.add(c.name);
      });
      return Array.from(cityNames);
    } catch {
      return TOP_INDIAN_CITIES;
    }
  }, []);

  // Filter based on input
  const filteredCities = useMemo(() => {
    if (!query.trim()) {
      return TOP_INDIAN_CITIES;
    }
    const q = query.toLowerCase();
    return allIndianCities.filter((name) => name.toLowerCase().includes(q)).slice(0, 50);
  }, [query, allIndianCities]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectCity = (cityName: string) => {
    onChange(cityName);
    setQuery(cityName);
    setIsOpen(false);
  };

  return (
    <div className={cn('w-full relative', className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={cn(
            'w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
          )}
        />
        <MapPin className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
        >
          <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
        </button>
      </div>

      {error && <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>}

      {/* DROPDOWN */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-56 overflow-y-auto">
          <div className="p-1.5 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
            <span>{query ? `Matching Cities (${filteredCities.length})` : 'Popular Cities'}</span>
            <span className="text-amber-600 font-semibold">India</span>
          </div>

          {filteredCities.length === 0 ? (
            <div className="p-3 text-xs text-gray-400 text-center">
              No matching city found. You can keep typing "{query}".
            </div>
          ) : (
            filteredCities.map((cityName) => {
              const isSelected = value?.toLowerCase() === cityName.toLowerCase();
              return (
                <button
                  key={cityName}
                  type="button"
                  onClick={() => handleSelectCity(cityName)}
                  className={cn(
                    'w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-amber-50/80 transition-colors border-b border-gray-50 last:border-0 cursor-pointer',
                    isSelected ? 'bg-amber-50 text-amber-900 font-bold' : 'text-gray-700'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className={cn('w-3.5 h-3.5', isSelected ? 'text-amber-600' : 'text-gray-400')} />
                    <span>{cityName}</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
