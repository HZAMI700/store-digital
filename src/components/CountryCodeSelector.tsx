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
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef} dir="ltr">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-11 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-l-xl focus:outline-none focus:border-brand-primary transition-all text-xs font-bold"
      >
        <span className="text-base leading-none">{selectedCountry.flag}</span>
        <span className="font-mono text-slate-700">{selectedCountry.dialCode}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 mt-1.5 w-64 max-h-72 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-slate-200 sticky top-0 bg-white z-10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث عن دولة أو رمز..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:bg-white"
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-56 divide-y divide-slate-100 py-1 custom-scrollbar">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">لا توجد نتائج</div>
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
                      'w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors',
                      isSelected ? 'bg-sky-50 text-brand-primary font-bold' : 'text-slate-800'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <span className="font-mono text-slate-500">{c.dialCode}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-brand-primary" />}
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
