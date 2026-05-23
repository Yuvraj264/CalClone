'use client';

import React from 'react';
import { Video, Calendar, ShieldCheck, Mail, Database, Brain } from 'lucide-react';

export const Integrations = () => {
  const integrations = [
    { name: 'Google Meet', detail: 'Video Conferencing', icon: Video },
    { name: 'Zoom Conferencing', detail: 'Video Meetings', icon: Video },
    { name: 'Microsoft Teams', detail: 'Enterprise Chat', icon: Video },
    { name: 'Office 365 Outlook', detail: 'Calendar & Mail', icon: Calendar },
    { name: 'HubSpot CRM', detail: 'Sales Contacts', icon: ShieldCheck },
    { name: 'Cal.ai scheduling', detail: 'AI Assistant', icon: Brain },
    { name: 'Stripe Payments', detail: 'Meeting Deposits', icon: Database },
    { name: 'Apple iCloud', detail: 'iOS Calendar Sync', icon: Calendar },
  ];

  return (
    <section id="integrations" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-gray-100">
      
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase block mb-3">
          App Ecosystem
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-[#111111] tracking-tight leading-tight">
          Integrate with the tools <br />
          <span className="text-gray-400">you already use.</span>
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
        {integrations.map((app) => {
          const Icon = app.icon;
          return (
            <div 
              key={app.name}
              className="bg-white rounded-2xl border border-[#e5e7eb] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all flex items-center gap-4 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-800 transition-transform group-hover:scale-105">
                <Icon size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#111111]">{app.name}</h4>
                <p className="text-[11px] text-[#6b6b6b]">{app.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};
