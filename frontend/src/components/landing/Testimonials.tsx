'use client';

import React from 'react';
import { Quote } from 'lucide-react';

export const Testimonials = () => {
  const reviews = [
    {
      quote: "We made the move to Cal.com and never looked back. It is so easy to find how to edit events in the dashboard.",
      author: "CTO, Supabase",
      role: "Supabase Integration Team",
      logoType: "supabase",
    },
    {
      quote: "At Navi, protecting personal health information is a non-negotiable, so choosing Cal.com for scheduling just makes sense.",
      author: "Micah Friedland",
      role: "CEO & Founder, Navi",
      logoType: "navi",
    },
    {
      quote: "More elegant than Calendly, more open than SavvyCal. Cal.com just works and it feels just right.",
      author: "Flo Merian",
      role: "Product Marketing, Mintlify",
      logoType: "mintlify",
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-20 border-t border-gray-100 text-center">
      
      {/* Testimonials Badge */}
      <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-150 text-xs font-semibold text-gray-500 shadow-sm cursor-default">
        <span className="text-[10px] text-gray-400">👤</span>
        Testimonials
      </div>

      <h2 className="text-3xl sm:text-5xl font-black text-[#111111] tracking-tight mb-4 leading-tight">
        Don&apos;t just take our word for it
      </h2>
      
      <p className="text-[#6b6b6b] text-base sm:text-lg max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
        Our users are our best ambassadors. Discover why we&apos;re the top choice for scheduling meetings.
      </p>

      {/* Testimonials Grid/Carousel */}
      <div className="grid md:grid-cols-3 gap-8 text-left">
        {reviews.map((r) => (
          <div
            key={r.author}
            className="bg-white rounded-3xl border border-[#e5e7eb] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between min-h-[260px] group"
          >
            <p className="text-[#111111] text-sm font-semibold leading-relaxed mb-8">
              &ldquo;{r.quote}&rdquo;
            </p>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
              <div>
                <h4 className="text-xs font-bold text-[#111111]">{r.author}</h4>
                <p className="text-[10px] text-[#6b6b6b] font-medium">{r.role}</p>
              </div>

              {/* Muted Brand Indicators inside the card */}
              <div className="text-[11px] font-black tracking-tight text-gray-400 uppercase">
                {r.logoType === 'navi' && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded bg-[#0f172a] text-white flex items-center justify-center font-bold text-[9px]">n</div>
                    <span className="text-[#0f172a] lowercase font-sans font-bold">navi</span>
                  </div>
                )}
                {r.logoType === 'supabase' && <span className="lowercase font-bold text-gray-800">⚡ supabase</span>}
                {r.logoType === 'mintlify' && <span className="lowercase font-bold text-gray-800">🍃 mintlify</span>}
              </div>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
};
