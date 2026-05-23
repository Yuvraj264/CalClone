'use client';

import React, { useState, useEffect } from 'react';
import { Grid, ArrowRight, Loader2, Check } from 'lucide-react';

const apps = [
  { name: 'Zoom', color: 'bg-[#2d8cff]', text: 'Z' },
  { name: 'Google Analytics', color: 'bg-[#f9ab00]', text: '📊' },
  { name: 'Google Calendar', color: 'bg-white border border-gray-150', text: '17', isCal: true },
  { name: 'Zapier', color: 'bg-[#ff4f00]', text: 'z' },
  { name: 'Stripe', color: 'bg-[#635bff]', text: 'S' },
  { name: 'HubSpot', color: 'bg-[#ff7a59]', text: 'h' },
  { name: 'Salesforce', color: 'bg-[#00a1e0]', text: '☁️' },
  { name: 'Outlook', color: 'bg-[#0078d4]', text: 'O' },
];

export const AppSync = () => {
  // Connected integrations state (pre-connect Google Calendar for a realistic landing page)
  const [connectedApps, setConnectedApps] = useState<string[]>(['Google Calendar']);
  const [connectingApp, setConnectingApp] = useState<string | null>(null);
  const [integrationToast, setIntegrationToast] = useState<string | null>(null);
  const [toastTimeoutId, setToastTimeoutId] = useState<any | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);
  const userInteracted = interactionCount > 0;
  const setUserInteracted = (val: boolean) => {
    if (val) {
      setInteractionCount((prev) => prev + 1);
    } else {
      setInteractionCount(0);
    }
  };

  const simulateAppAction = (appName: string) => {
    if (connectingApp) return;

    const isConnected = connectedApps.includes(appName);

    // Clear active toast timeouts
    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId);
    }

    if (isConnected) {
      // Disconnect
      setConnectedApps((prev) => prev.filter((name) => name !== appName));
      setIntegrationToast(`✗ Disconnected ${appName} integration`);
      const id = setTimeout(() => setIntegrationToast(null), 2500);
      setToastTimeoutId(id);
    } else {
      // Sleek connection simulated loading state
      setConnectingApp(appName);
      setTimeout(() => {
        setConnectedApps((prev) => [...prev, appName]);
        setConnectingApp(null);
        setIntegrationToast(`✓ Connected ${appName} successfully!`);
        const id = setTimeout(() => setIntegrationToast(null), 2500);
        setToastTimeoutId(id);
      }, 900);
    }
  };

  const handleAppClick = (appName: string) => {
    setUserInteracted(true);
    simulateAppAction(appName);
  };

  // Automated Idle Playback Loop ("working randomly")
  useEffect(() => {
    if (userInteracted) {
      // Resume auto-playback after 12 seconds of zero manual interaction
      const timer = setTimeout(() => setUserInteracted(false), 12000);
      return () => clearTimeout(timer);
    }

    const intervalId = setInterval(() => {
      const randomApp = apps[Math.floor(Math.random() * apps.length)];
      simulateAppAction(randomApp.name);
    }, 6000); // Trigger a random change every 6 seconds

    return () => clearInterval(intervalId);
  }, [interactionCount, connectedApps, connectingApp]);

  return (
    <section id="integrations" className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-20 border-t border-gray-100 relative">
      <style>{`
        @keyframes slide-down-center {
          0% { transform: translate(-50%, -20px); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-slide-down-center {
          animation: slide-down-center 0.2s ease-out forwards;
        }
      `}</style>

      {/* Floating System Connection Toast */}
      {integrationToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white shadow-2xl text-xs font-bold animate-slide-down-center">
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${integrationToast.startsWith('✓') ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${integrationToast.startsWith('✓') ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          </span>
          <span>{integrationToast}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-[#e5e7eb] p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.02)] grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column */}
        <div className="lg:col-span-6 text-left max-w-lg">
          
          {/* App store Badge */}
          <div className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-150 text-xs font-semibold text-gray-500 shadow-sm cursor-default">
            <Grid size={13} className="text-gray-400" />
            App store
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[#111111] tracking-tight mb-4 leading-tight font-sans">
            All your key tools in-sync <br />
            with your meetings
          </h2>
          
          <p className="text-[#6b6b6b] text-sm sm:text-base leading-relaxed mb-8 font-semibold">
            Cal.com works with all apps already in your flow ensuring everything works perfectly together.
          </p>

          <div className="flex items-center gap-3">
            <a href="/event-types" className="px-5 py-2.5 rounded-xl bg-[#111111] text-white hover:bg-black text-sm font-bold shadow-sm transition flex items-center gap-1.5 group">
              Get started <ArrowRight size={14} className="group-hover:translate-x-0.5 transition" />
            </a>
            <a href="/bookings" className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-bold text-[#2b2b2b] shadow-sm transition flex items-center gap-1">
              Explore apps <span className="text-gray-400 font-bold">&gt;</span>
            </a>
          </div>

        </div>

        {/* Right Column: Sleek dividable integrations grid */}
        <div className="lg:col-span-6 w-full flex items-center justify-center relative bg-gray-50/50 rounded-2xl border border-gray-100 p-6 sm:p-8">
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full relative">
            
            {apps.map((app) => {
              const isConnected = connectedApps.includes(app.name);
              const isConnecting = connectingApp === app.name;

              return (
                <div 
                  key={app.name}
                  onClick={() => handleAppClick(app.name)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white border transition-all duration-300 min-h-[96px] group cursor-pointer relative select-none hover:shadow-md ${
                    isConnected 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/10' 
                      : 'border-gray-150/60 shadow-sm'
                  }`}
                >
                  {/* Status Indicator Dot */}
                  {isConnected && (
                    <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}

                  {/* App Icon Container */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm transition-transform duration-300 relative ${
                    isConnecting ? 'bg-gray-100 text-gray-400' : `${app.color} text-white`
                  } ${!isConnecting && 'group-hover:scale-105'}`}>
                    {isConnecting ? (
                      <Loader2 size={16} className="animate-spin text-zinc-600" />
                    ) : app.isCal ? (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[5px] font-black text-red-500 uppercase leading-none">JUL</span>
                        <span className="text-[10px] font-black text-gray-800 leading-none">17</span>
                      </div>
                    ) : (
                      app.text
                    )}
                  </div>

                  <span className={`text-[8.5px] font-extrabold mt-2.5 text-center truncate w-full transition ${
                    isConnected ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-700'
                  }`}>
                    {isConnected ? '✓ Connected' : app.name}
                  </span>
                </div>
              );
            })}

          </div>

        </div>

      </div>
    </section>
  );
};
