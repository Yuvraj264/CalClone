'use client';

import React from 'react';
import { CreditCard, Video, Link as LinkIcon, Shield, Languages, Code2, Grid, Sliders } from 'lucide-react';

export const MoreFeatures = () => {
  const secondaryFeatures = [
    { name: 'Accept payments', icon: CreditCard },
    { name: 'Built-in video conferencing', icon: Video },
    { name: 'Short booking links', icon: LinkIcon },
    { name: 'Privacy first', icon: Shield },
    { name: '65+ languages', icon: Languages },
    { name: 'Easy embeds', icon: Code2 },
    { name: 'All your favorite apps', icon: Grid },
    { name: 'Simple customization', icon: Sliders },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-20 border-t border-gray-100 text-center">
      
      <h2 className="text-3xl sm:text-5xl font-black text-[#111111] tracking-tight mb-16 leading-tight">
        ...and so much more!
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {secondaryFeatures.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.name}
              className="bg-white rounded-3xl border border-[#e5e7eb] p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all flex flex-col items-center justify-center min-h-[160px] group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-800 mb-5 transition-transform group-hover:scale-105">
                <Icon size={20} className="text-gray-800" />
              </div>
              <h4 className="text-sm font-bold text-[#111111] font-sans">
                {item.name}
              </h4>
            </div>
          );
        })}
      </div>

    </section>
  );
};
