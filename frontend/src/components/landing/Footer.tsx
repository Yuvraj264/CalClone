'use client';

import React from 'react';
import { Smartphone, Monitor, Globe, Star, ChevronDown, Check } from 'lucide-react';

export const Footer = () => {
  const downloadDevices = [
    { name: 'iPhone', icon: Smartphone },
    { name: 'Android', icon: Smartphone },
    { name: 'Chrome', icon: Monitor },
    { name: 'Safari', icon: Monitor },
    { name: 'Edge', icon: Monitor },
    { name: 'Firefox', icon: Monitor },
    { name: 'macOS', icon: Monitor },
    { name: 'Windows', icon: Monitor },
    { name: 'Linux', icon: Monitor },
  ];

  const solutions = [
    'iOS/Android App', 'Self-hosted', 'Pricing', 'Docs', 
    'Cal.ai - AI Phone Agent', 'Enterprise', 'Integrate Cal.com', 
    'Routing', 'Cal.com Atoms', 'Desktop App', 'FAQ', 
    'Enterprise API', 'Github', 'Docker'
  ];

  const useCases = [
    'Sales', 'Marketing', 'Talent Acquisition', 'Customer Support', 
    'Higher Education', 'Telehealth', 'Professional Services', 
    'Hiring Marketplace', 'Human Resources', 'Tutoring', 'C-suite', 'Law'
  ];

  const resources = [
    'Affiliate Program', 'Help Docs', 'Blog', 'Cal Fonts', 
    'Teams', 'Embed', 'Recurring events', 'Developers', 'OOO', 
    'Workflows', 'Instant Meetings', 'App Store', 
    'Requires confirmation', 'Payments', 'Video Conferencing'
  ];

  const company = [
    'Jobs', 'About', 'Open Startup', 'Support', 'Privacy', 
    'Terms', 'License', 'Security', 'Changelog', 'Get a demo', 'Talk to sales'
  ];

  return (
    <footer className="w-full bg-[#fafafa] border-t border-gray-150 py-16 text-left">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 grid lg:grid-cols-12 gap-12">
        
        {/* Left Side: Logo, Compliance, Downloads */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          <div>
            <span className="text-xl font-bold tracking-tight text-[#111111] font-sans block mb-3">
              Cal.com
            </span>
            <p className="text-[10px] text-gray-400 font-semibold leading-relaxed max-w-sm">
              Cal.com&reg; and Cal&reg; are a registered trademark by Cal.com, Inc. All rights reserved.
            </p>
          </div>

          {/* Compliance Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {['ISO 27001', 'SOC 2 TYPE II', 'CCPA COMPLIANT', 'GDPR COMPLIANT', 'HIPAA COMPLIANT'].map((badge) => (
              <span 
                key={badge}
                className="px-2 py-0.5 border border-gray-200/80 bg-white rounded text-[8px] font-black text-gray-500 tracking-wider uppercase"
              >
                {badge}
              </span>
            ))}
          </div>

          <p className="text-[11px] text-gray-500 font-semibold leading-relaxed max-w-xs">
            Our mission is to connect a billion people by 2031 through calendar scheduling.
          </p>

          {/* Status & Locale */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Locale Dropdown */}
            <div className="border border-gray-200 bg-white rounded-lg px-3 py-1 flex items-center gap-1.5 text-[10px] font-bold text-gray-600 cursor-pointer hover:bg-gray-50">
              <Globe size={11} className="text-gray-400" />
              <span>English</span>
              <ChevronDown size={10} className="text-gray-400" />
            </div>

            {/* Operational status */}
            <div className="border border-gray-200 bg-white rounded-lg px-3 py-1 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 cursor-pointer hover:bg-gray-50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>All Systems Operational</span>
            </div>

          </div>

          {/* Downloads Block */}
          <div>
            <h4 className="text-[10px] font-black tracking-wider text-gray-400 uppercase mb-3">
              Downloads
            </h4>
            <div className="grid grid-cols-3 gap-2 max-w-xs">
              {downloadDevices.map((d) => {
                const Icon = d.icon;
                return (
                  <div 
                    key={d.name}
                    className="border border-gray-200 bg-white rounded-lg p-1.5 flex items-center justify-center gap-1 text-[9px] font-bold text-gray-700 hover:bg-gray-50 cursor-pointer shadow-xs transition"
                  >
                    <Icon size={10} className="text-gray-400" />
                    <span>{d.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trustpilot & G2 boxes */}
          <div className="flex gap-4 items-center">
            
            {/* Trustpilot Box */}
            <div className="flex-grow max-w-[140px] bg-[#ea580c]/5 border border-[#ea580c]/20 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-xs">
              <div className="flex gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((x) => <Star key={x} size={9} fill="#ea580c" stroke="none" />)}
              </div>
              <span className="text-[8px] font-bold text-[#ea580c]">Read our reviews on Trustpilot</span>
            </div>

            {/* G2 Box */}
            <div className="flex-grow max-w-[140px] bg-[#00b67a]/5 border border-[#00b67a]/20 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-xs">
              <div className="flex gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((x) => <Star key={x} size={9} fill="#00b67a" stroke="none" />)}
              </div>
              <span className="text-[8px] font-bold text-[#00b67a]">Read our reviews on G2</span>
            </div>

          </div>

          {/* Help contact */}
          <p className="text-[10px] text-gray-400 font-bold">
            Need Help? <a href="mailto:support@cal.com" className="text-[#111111] hover:underline">support@cal.com</a> or visit <a href="https://cal.com/help" target="_blank" rel="noreferrer" className="text-[#111111] hover:underline">cal.com/help</a>.
          </p>

        </div>

        {/* Right Side: Columns solutions, usecases, resources, company */}
        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Solutions Column */}
          <div>
            <h4 className="text-[10px] font-black tracking-wider text-gray-400 uppercase mb-4">
              Solutions
            </h4>
            <ul className="flex flex-col gap-2.5">
              {solutions.map((item) => (
                <li key={item}>
                  <a href="/event-types" className="text-[11px] font-semibold text-gray-500 hover:text-[#111111] transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Use Cases Column */}
          <div>
            <h4 className="text-[10px] font-black tracking-wider text-gray-400 uppercase mb-4">
              Use Cases
            </h4>
            <ul className="flex flex-col gap-2.5">
              {useCases.map((item) => (
                <li key={item}>
                  <a href="/event-types" className="text-[11px] font-semibold text-gray-500 hover:text-[#111111] transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-[10px] font-black tracking-wider text-gray-400 uppercase mb-4">
              Resources
            </h4>
            <ul className="flex flex-col gap-2.5">
              {resources.map((item) => (
                <li key={item}>
                  <a href="/event-types" className="text-[11px] font-semibold text-gray-500 hover:text-[#111111] transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-[10px] font-black tracking-wider text-gray-400 uppercase mb-4">
              Company
            </h4>
            <ul className="flex flex-col gap-2.5">
              {company.map((item) => (
                <li key={item}>
                  <a href="/event-types" className="text-[11px] font-semibold text-gray-500 hover:text-[#111111] transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </footer>
  );
};
