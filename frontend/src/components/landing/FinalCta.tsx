'use client';

import React from 'react';
import { Star } from 'lucide-react';

export const FinalCta = () => {
  return (
    <section className="relative w-full bg-[#fbfbfb] border-t border-gray-150 py-24 overflow-hidden">
      
      {/* Background faint rounded boxes grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex flex-wrap gap-4 items-center justify-center p-8">
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className="w-16 h-16 rounded-2xl border border-gray-900" />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-6 sm:px-12 text-center z-10">
        
        <h2 className="text-4xl sm:text-6xl font-black text-[#111111] tracking-tight leading-none mb-10 font-sans">
          Smarter, simpler scheduling
        </h2>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
          <a 
            href="/event-types"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#111111] text-white hover:bg-black text-sm font-bold shadow-md hover:shadow-lg transition"
          >
            Get started
          </a>
          <a 
            href="/bookings"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-bold text-[#2b2b2b] shadow-sm transition"
          >
            Talk to sales <span className="text-gray-400 font-bold ml-0.5">&gt;</span>
          </a>
        </div>

        {/* Product Hunt / Review Badges Underneath */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 border-t border-gray-100 pt-10">
          
          {/* PH Badges */}
          <div className="flex items-center gap-4 text-left">
            <div className="border border-gray-200/80 bg-white rounded-lg p-2 flex flex-col items-center shadow-xs">
              <span className="text-[7px] font-black text-gray-400 uppercase leading-none">Product of the day</span>
              <span className="text-xs font-black text-[#da552f] mt-0.5">1st</span>
            </div>
            <div className="border border-gray-200/80 bg-white rounded-lg p-2 flex flex-col items-center shadow-xs">
              <span className="text-[7px] font-black text-gray-400 uppercase leading-none">Product of the week</span>
              <span className="text-xs font-black text-[#da552f] mt-0.5">1st</span>
            </div>
            <div className="border border-gray-200/80 bg-white rounded-lg p-2 flex flex-col items-center shadow-xs">
              <span className="text-[7px] font-black text-gray-400 uppercase leading-none">Product of the month</span>
              <span className="text-xs font-black text-[#da552f] mt-0.5">1st</span>
            </div>
          </div>

          {/* Ratings indicators */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-0.5 text-left">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((x) => <Star key={x} size={11} fill="#da552f" stroke="none" />)}
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#da552f] text-white flex items-center justify-center text-[7px] font-black mt-1">P</div>
            </div>

            <div className="flex flex-col gap-0.5 text-left">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((x) => <Star key={x} size={11} fill="#ff2a3a" stroke="none" />)}
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#ff2a3a] text-white flex items-center justify-center text-[7px] font-black mt-1">G</div>
            </div>

            <div className="flex flex-col gap-0.5 text-left">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((x) => <Star key={x} size={11} fill="#00b67a" stroke="none" />)}
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#00b67a] text-white flex items-center justify-center text-[7px] font-black mt-1">★</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
