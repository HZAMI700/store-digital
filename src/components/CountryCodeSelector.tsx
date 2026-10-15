'use client';

import React, { useState, useRef, useEffect } from 'react';
import { POPULAR_COUNTRIES } from '@/lib/countries';
import { CountryCode } from '@/lib/types';
import { ChevronDown, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountryCodeSelectorProps {
  selectedCode: string;
  onSelect: (country: CountryCode) => void;
  className?: string;
}

export const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  selectedCode,
  onSelect,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry =
    POPULAR_COUNTRIES.find((c) => c.dialCode === selectedCode) || POPULAR_COUNTRIES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = POPULAR_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-11 px-3 bg-surface-secondary hover:bg-white text-content-primary border border-border rounded-l-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm font-medium"
      >
        <span className="text-base leading-none">{selectedCountry.flag}</span>
        <span className="font-semibold text-content-primary">{selectedCountry.dialCode}</span>
        <ChevronDown className="w-3.5 h-3.5 text-content-secondary opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 mt-1.5 w-64 max-h-72 bg-white border border-border rounded-2xl shadow-dropdown overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-border sticky top-0 bg-white z-10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-content-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search country or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-secondary border border-border rounded-lg text-content-primary placeholder-content-muted focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-56 divide-y divide-border/60 py-1">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-xs text-content-muted">No countries found</div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.dialCode === selectedCountry.dialCode;
                return (
                  <button
                    key={`${c.code}-${c.dialCode}`}
                    type="button"
                    onClick={() => {
                      onSelect(c);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-surface-secondary transition-colors',
                      isSelected ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-content-primary'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <span className="font-mono text-content-secondary">{c.dialCode}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary-500" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
