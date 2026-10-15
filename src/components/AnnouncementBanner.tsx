'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, MessageSquare, Flame, Lock } from 'lucide-react';

export const AnnouncementBanner: React.FC = () => {
  const items = [
    {
      icon: MessageSquare,
      text: 'Direct WhatsApp Contact — No Online Card Charges',
      badge: 'Manual Orders',
    },
    {
      icon: ShieldCheck,
      text: '100% Guaranteed Replacement Warranty on All Digital Accounts',
      badge: 'Protected',
    },
    {
      icon: Flame,
      text: 'Steam GTA V / FiveM, Game Pass, ChatGPT & Canva Ready',
      badge: 'Top Deals',
    },
    {
      icon: Lock,
      text: 'Dedicated Single-Use Private Credentials — Never Shared',
      badge: 'Private',
    },
  ];

  return (
    <div className="relative overflow-hidden bg-white border-b border-border text-xs text-content-primary py-2 shadow-subtle select-none">
      <div className="flex w-max animate-marquee space-x-8">
        {[...items, ...items, ...items].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-2 whitespace-nowrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary-700 border border-primary-200">
                <Icon className="w-3 h-3 text-primary-500" />
                <span>{item.badge}</span>
              </span>
              <span className="text-content-secondary font-medium hover:text-content-primary transition-colors">
                {item.text}
              </span>
              <span className="text-border mx-2">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
