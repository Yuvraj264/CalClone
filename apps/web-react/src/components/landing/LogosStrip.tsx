'use client';

import React from 'react';

export const LogosStrip = () => {
  const brands = [
    { name: 'AngelList', icon: 'AngelList' },
    { name: 'Raycast', icon: 'Raycast' },
    { name: 'Vercel', icon: '▲ Vercel' },
    { name: 'supabase', icon: '⚡ supabase' },
    { name: 'Udemy', icon: 'û Udemy' },
    { name: 'Rho', icon: 'Rho' },
  ];

  return (
    <section className="w-full border-t border-b border-gray-100 bg-[#fbfbfb] py-8 my-6">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left explanation label */}
        <p className="text-left text-xs font-semibold text-gray-400 max-w-[200px] leading-relaxed">
          Trusted by fast-growing companies around the world
        </p>

        {/* Muted brands row */}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60 grayscale hover:opacity-80 transition-opacity">
          {brands.map((b) => (
            <div 
              key={b.name}
              className="text-sm font-black tracking-tight text-gray-800 font-sans hover:text-[#111111] cursor-default"
            >
              {b.icon}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
