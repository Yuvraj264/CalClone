'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';

export const WallOfLove = () => {
  const column1 = [
    {
      author: 'Anurag Banerjee',
      handle: '@anurag_banerjee2',
      avatar: 'A',
      avatarColor: 'bg-slate-700',
      badge: 'P',
      text: 'Switched from Calendly in an instance. Love their open source model. And of course, beautiful design!',
    },
    {
      author: 'Francis Lacson',
      handle: '@francis_lacson',
      avatar: 'FL',
      avatarColor: 'bg-black',
      badge: '★',
      text: "Cal.com has really upped the ante for scheduling tools! I knew right away, even when I started using it, that it was one step above the rest. It has an intuitive interface, flexibility in customization options, and seamless integration into my workflow that makes it a must-have for my business.\n\nA special thank you to Milos for going the extra mile to ensure I had the best experience. His support was prompt, professional, and tailored to my needs.",
    },
  ];

  const column2 = [
    {
      author: 'Serg Lotz',
      handle: '@serglotz',
      avatar: 'SL',
      avatarColor: 'bg-gray-800',
      badge: 'P',
      text: 'Easy to modify; just open a PR on Github, ping Peer, and voilà.',
    },
    {
      author: 'Mrugesh Mohapatra',
      handle: '@raisedadead',
      avatar: 'MM',
      avatarColor: 'bg-zinc-800',
      badge: 'X',
      text: "Ya'all, I just moved my calendar booking page from Calendly to - Use this to book some face time with me.",
    },
    {
      author: 'Jessie Zwaan✨',
      handle: '@jessicamayzwaan',
      avatar: 'JZ',
      avatarColor: 'bg-stone-700',
      badge: 'X',
      text: 'Consider me a convert!\n\n@calcom has shared an easy how-to guide on integrating @whereby rooms into your scheduling. ⚡⚡⚡\n\ncal.com/blog/customizable...',
    },
  ];

  const column3 = [
    {
      author: 'Guillermo Rauch',
      handle: '@rauchg',
      avatar: 'GR',
      avatarColor: 'bg-black',
      badge: 'P',
      text: "Coolest domain. Check\nCoolest mission. Check\nCoolest product. Check\n\ncal.com",
    },
    {
      author: 'Andrew S. Rosen',
      handle: '@Andrew_S_Rosen',
      avatar: 'AR',
      avatarColor: 'bg-indigo-950',
      badge: 'X',
      text: "Regarding productivity software that I've been binging lately, I just tried out (@calcom), and it is an amazing (better) alternative to Calendly in my opinion. This is particularly true for the free tier.\n\nI think I'll add this one to my email signature.",
    },
    {
      author: 'Deyson',
      handle: '@deyson',
      avatar: 'D',
      avatarColor: 'bg-blue-900',
      badge: '★',
      text: 'Cal.com has made booking meetings so fast. Fully recommend giving it a try!',
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-20 border-t border-gray-100 text-center">
      
      {/* Wall of love Badge */}
      <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-150 text-xs font-semibold text-gray-500 shadow-sm cursor-default">
        <MessageSquare size={13} className="text-gray-400" />
        Wall of love
      </div>

      <h2 className="text-3xl sm:text-5xl font-black text-[#111111] tracking-tight mb-4 leading-tight">
        See why our users love Cal.com
      </h2>
      
      <p className="text-[#6b6b6b] text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
        Read the impact we&apos;ve had from those who matter most - our customers.
      </p>

      {/* Buttons */}
      <div className="flex items-center justify-center gap-3 mb-16">
        <a href="/event-types" className="px-5 py-2.5 rounded-xl bg-[#111111] text-white hover:bg-black text-sm font-bold shadow-sm transition">
          Get started
        </a>
        <a href="/bookings" className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-bold text-[#2b2b2b] shadow-sm transition flex items-center gap-1">
          Book a demo <span className="text-gray-400 font-bold">&gt;</span>
        </a>
      </div>

      {/* Wall of love tweets grid */}
      <div className="grid md:grid-cols-3 gap-8 text-left">
        
        {/* Column 1 */}
        <div className="flex flex-col gap-8">
          {column1.map((t) => (
            <div key={t.author} className="bg-white rounded-3xl border border-[#e5e7eb] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.02)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${t.avatarColor} text-white flex items-center justify-center font-bold text-xs relative`}>
                    {t.avatar}
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[7px] font-black text-orange-500 shadow-sm">{t.badge}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111111] leading-none">{t.author}</h4>
                    <span className="text-[10px] text-gray-400 font-semibold">{t.handle}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#2b2b2b] font-semibold leading-relaxed whitespace-pre-line">
                {t.text}
              </p>
            </div>
          ))}
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-8">
          {column2.map((t) => (
            <div key={t.author} className="bg-white rounded-3xl border border-[#e5e7eb] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.02)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${t.avatarColor} text-white flex items-center justify-center font-bold text-xs relative`}>
                    {t.avatar}
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[7px] font-black text-orange-500 shadow-sm">{t.badge}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111111] leading-none">{t.author}</h4>
                    <span className="text-[10px] text-gray-400 font-semibold">{t.handle}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#2b2b2b] font-semibold leading-relaxed whitespace-pre-line">
                {t.text}
              </p>
            </div>
          ))}
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-8">
          {column3.map((t) => (
            <div key={t.author} className="bg-white rounded-3xl border border-[#e5e7eb] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.02)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${t.avatarColor} text-white flex items-center justify-center font-bold text-xs relative`}>
                    {t.avatar}
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[7px] font-black text-orange-500 shadow-sm">{t.badge}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111111] leading-none">{t.author}</h4>
                    <span className="text-[10px] text-gray-400 font-semibold">{t.handle}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#2b2b2b] font-semibold leading-relaxed whitespace-pre-line">
                {t.text}
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* Show more button */}
      <button className="mt-12 px-6 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-800 shadow-sm transition">
        Show more
      </button>

    </section>
  );
};
