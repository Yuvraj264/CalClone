'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Video, Globe, Check } from 'lucide-react';

export const FeatureGrid = () => {
  // Card 1 interactive states
  const [minNotice, setMinNotice] = useState('3 hours');
  const [bufferBefore, setBufferBefore] = useState('15 mins');
  const [bufferAfter, setBufferAfter] = useState('15 mins');
  const [interval, setIntervalVal] = useState('15 mins');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [toastTimeoutId, setToastTimeoutId] = useState<any | null>(null);

  // Card 2 interactive states
  const [baileyDuration, setBaileyDuration] = useState('15m');
  const [customUsername, setCustomUsername] = useState('bailey');
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  // User manual interaction lock with counter to reset the idle timeout on repeated interactions
  const [interactionCount, setInteractionCount] = useState(0);
  const userInteracted = interactionCount > 0;
  const setUserInteracted = (val: boolean) => {
    if (val) {
      setInteractionCount((prev) => prev + 1);
    } else {
      setInteractionCount(0);
    }
  };

  // Automated Idle Playback Loop ("working randomly")
  useEffect(() => {
    if (userInteracted) {
      // Resume auto-playback after 12 seconds of zero manual interaction
      const timer = setTimeout(() => setUserInteracted(false), 12000);
      return () => clearTimeout(timer);
    }

    const intervalId = setInterval(() => {
      const actions = ['notice', 'buffer_before', 'buffer_after', 'slot_interval', 'duration', 'username'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];

      switch (randomAction) {
        case 'notice': {
          const notices = ['1 hour', '2 hours', '3 hours', '4 hours'];
          const randomVal = notices[Math.floor(Math.random() * notices.length)];
          triggerSaveToast('Minimum Notice', randomVal, setMinNotice);
          break;
        }
        case 'buffer_before': {
          const buffers = ['5 mins', '10 mins', '15 mins', '30 mins'];
          const randomVal = buffers[Math.floor(Math.random() * buffers.length)];
          triggerSaveToast('Buffer Before', randomVal, setBufferBefore);
          break;
        }
        case 'buffer_after': {
          const buffers = ['5 mins', '10 mins', '15 mins', '30 mins'];
          const randomVal = buffers[Math.floor(Math.random() * buffers.length)];
          triggerSaveToast('Buffer After', randomVal, setBufferAfter);
          break;
        }
        case 'slot_interval': {
          const intervals = ['15 mins', '30 mins', '60 mins'];
          const randomVal = intervals[Math.floor(Math.random() * intervals.length)];
          triggerSaveToast('Time-slot Interval', randomVal, setIntervalVal);
          break;
        }
        case 'duration': {
          const durations = ['15m', '30m', '45m', '1h'];
          const randomVal = durations[Math.floor(Math.random() * durations.length)];
          setBaileyDuration(randomVal);
          break;
        }
        case 'username': {
          const usernames = ['bailey', 'yuvraj', 'steve', 'sarah', 'elena'];
          const randomVal = usernames[Math.floor(Math.random() * usernames.length)];
          setCustomUsername(randomVal);
          break;
        }
      }
    }, 4500); // Trigger a random change every 4.5 seconds

    return () => clearInterval(intervalId);
  }, [interactionCount]);

  // Trigger floating save-toasts for settings changes
  const triggerSaveToast = (settingName: string, value: string, setter: (val: string) => void) => {
    setter(value);
    
    // Clear any active toast timeout
    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId);
    }

    setSaveToast(`✓ Saved: ${settingName} set to ${value}`);
    
    const id = setTimeout(() => {
      setSaveToast(null);
    }, 2500);
    setToastTimeoutId(id);
  };

  // Helper to parse duration string to minutes for timeline proportions
  const parseMinutes = (val: string) => {
    const num = parseInt(val);
    if (isNaN(num)) return 15;
    if (val.toLowerCase().includes('hour')) {
      return num * 60;
    }
    return num;
  };

  const beforeMins = parseMinutes(bufferBefore);
  const meetingMins = parseMinutes(interval);
  const afterMins = parseMinutes(bufferAfter);
  const totalMins = beforeMins + meetingMins + afterMins;

  // Dynamic Avatar and Title mapping for Card 2
  const displayName = customUsername.toLowerCase() === 'bailey' 
    ? 'Bailey Pumfleet' 
    : customUsername.charAt(0).toUpperCase() + customUsername.slice(1);
  const displayAvatar = customUsername.toLowerCase() === 'bailey' 
    ? 'BP' 
    : customUsername.substring(0, 2).toUpperCase();

  return (
    <section id="features" className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-20 border-t border-gray-100 relative">
      <style>{`
        @keyframes stripes-move {
          0% { background-position: 0 0; }
          100% { background-position: 20px 0; }
        }
        .timeline-stripes {
          background-size: 20px 20px;
          animation: stripes-move 0.8s linear infinite;
        }
      `}</style>

      {/* Save Toast Banner */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-white shadow-2xl text-xs font-bold animate-[slide-up_0.2s_ease-out]">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Benefits Badge */}
      <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-150 text-xs font-semibold text-gray-500 shadow-sm cursor-default">
        <Sparkles size={13} className="text-gray-400" />
        Benefits
      </div>

      <h2 className="text-3xl sm:text-5xl font-black text-[#111111] tracking-tight mb-4 max-w-3xl mx-auto leading-tight text-center">
        Your all-purpose scheduling app
      </h2>
      
      <p className="text-[#6b6b6b] text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium text-center">
        Discover a variety of our advanced features. Unlimited and free for individuals.
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

      {/* 2 Large Side-by-Side SaaS Feature Cards */}
      <div className="grid lg:grid-cols-2 gap-8 text-left">
        
        {/* Card 1: Avoid meeting overload */}
        <div className="bg-[#fcfcfc] rounded-3xl border border-[#e5e7eb] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-[560px] transition hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          
          <div className="mb-6">
            <h3 className="font-bold text-xl text-[#111111] mb-3">
              Avoid meeting overload
            </h3>
            <p className="text-xs text-[#6b6b6b] leading-relaxed font-semibold">
              Only get booked when you want to. Set daily, weekly or monthly limits and add buffers around your events to allow you to focus or take a break.
            </p>
          </div>

          {/* Form Illustration */}
          <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm flex flex-col gap-4">
            
            <span className="text-xs font-bold text-[#111111] block border-b border-gray-100 pb-2">
              Notice and buffers
            </span>

            {/* Minimum Notice */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">
                Minimum notice
              </label>
              <select 
                value={minNotice} 
                onChange={(e) => { triggerSaveToast('Minimum Notice', e.target.value, setMinNotice); setUserInteracted(true); }}
                className="w-full py-2 px-3 rounded-lg border border-gray-150 text-xs font-bold text-gray-800 focus:outline-none bg-gray-50/50 hover:border-black/30 transition cursor-pointer"
              >
                <option value="1 hour">1 hour</option>
                <option value="2 hours">2 hours</option>
                <option value="3 hours">3 hours</option>
                <option value="4 hours">4 hours</option>
              </select>
            </div>

            {/* Buffers Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">
                  Buffer before event
                </label>
                <select 
                  value={bufferBefore} 
                  onChange={(e) => { triggerSaveToast('Buffer Before', e.target.value, setBufferBefore); setUserInteracted(true); }}
                  className="w-full py-2 px-3 rounded-lg border border-gray-150 text-xs font-bold text-gray-800 focus:outline-none bg-gray-50/50 hover:border-black/30 transition cursor-pointer"
                >
                  <option value="5 mins">5 mins</option>
                  <option value="10 mins">10 mins</option>
                  <option value="15 mins">15 mins</option>
                  <option value="30 mins">30 mins</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">
                  Buffer after event
                </label>
                <select 
                  value={bufferAfter} 
                  onChange={(e) => { triggerSaveToast('Buffer After', e.target.value, setBufferAfter); setUserInteracted(true); }}
                  className="w-full py-2 px-3 rounded-lg border border-gray-150 text-xs font-bold text-gray-800 focus:outline-none bg-gray-50/50 hover:border-black/30 transition cursor-pointer"
                >
                  <option value="5 mins">5 mins</option>
                  <option value="10 mins">10 mins</option>
                  <option value="15 mins">15 mins</option>
                  <option value="30 mins">30 mins</option>
                </select>
              </div>
            </div>

            {/* Time Slot Intervals */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">
                Time-slot intervals
              </label>
              <select 
                value={interval} 
                onChange={(e) => { triggerSaveToast('Time-slot Interval', e.target.value, setIntervalVal); setUserInteracted(true); }}
                className="w-full py-2 px-3 rounded-lg border border-gray-150 text-xs font-bold text-gray-800 focus:outline-none bg-gray-50/50 hover:border-black/30 transition cursor-pointer"
              >
                <option value="15 mins">15 mins</option>
                <option value="30 mins">30 mins</option>
                <option value="60 mins">60 mins</option>
              </select>
            </div>

            {/* Interactive Timeline Strip */}
            <div className="mt-2 border border-gray-100 rounded-xl p-3 bg-gray-50/30">
              <span className="text-[9px] font-bold text-gray-400 block mb-2 uppercase tracking-wider">Visual Buffer Timeline</span>
              <div className="flex h-10 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                
                {/* Buffer Before Block */}
                <div 
                  style={{ flexGrow: beforeMins, minWidth: '45px' }} 
                  className="bg-indigo-50/70 border-r border-indigo-100 flex flex-col items-center justify-center text-indigo-700 text-[8px] font-black transition-all duration-500 relative overflow-hidden bg-[linear-gradient(45deg,#f0f4ff_25%,transparent_25%,transparent_50%,#f0f4ff_50%,#f0f4ff_75%,transparent_75%,transparent)] timeline-stripes"
                >
                  <span className="leading-none">Buffer</span>
                  <span className="text-[7px] text-indigo-500 font-bold mt-0.5">{bufferBefore}</span>
                </div>

                {/* Meeting Slot */}
                <div 
                  style={{ flexGrow: meetingMins, minWidth: '80px' }} 
                  className="bg-zinc-900 flex flex-col items-center justify-center text-white text-[9px] font-black transition-all duration-500 relative px-2 text-center"
                >
                  <div className="flex items-center gap-1 leading-none">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Meeting Event</span>
                  </div>
                  <span className="text-[7px] text-gray-400 font-medium mt-0.5">{interval} duration</span>
                </div>

                {/* Buffer After Block */}
                <div 
                  style={{ flexGrow: afterMins, minWidth: '45px' }} 
                  className="bg-indigo-50/70 border-l border-indigo-100 flex flex-col items-center justify-center text-indigo-700 text-[8px] font-black transition-all duration-500 relative overflow-hidden bg-[linear-gradient(45deg,#f0f4ff_25%,transparent_25%,transparent_50%,#f0f4ff_50%,#f0f4ff_75%,transparent_75%,transparent)] timeline-stripes"
                >
                  <span className="leading-none">Buffer</span>
                  <span className="text-[7px] text-indigo-500 font-bold mt-0.5">{bufferAfter}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-1.5 px-0.5 text-[8px] font-bold text-gray-400">
                <span>Total Blocked Calendar Time: {totalMins} mins</span>
                <span className="text-zinc-600">Intervals: every {interval}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Card 2: Stand out with a custom booking link */}
        <div className="bg-[#fcfcfc] rounded-3xl border border-[#e5e7eb] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-[560px] transition hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          
          <div className="mb-6">
            <h3 className="font-bold text-xl text-[#111111] mb-3">
              Stand out with a custom booking link
            </h3>
            <p className="text-xs text-[#6b6b6b] leading-relaxed font-semibold">
              Customize your booking link so it&apos;s short and easy to remember for your bookers. No more long, complicated links one can easily forget.
            </p>
          </div>

          {/* Bailey Pumfleet booking mockup illustration */}
          <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm relative overflow-hidden flex flex-col gap-4 transition-all duration-300 hover:border-gray-300">
            
            {/* Top link badge: Content Editable / Click to Edit input */}
            {isEditingUsername ? (
              <div className="absolute top-3 right-4 bg-white border border-black/40 rounded-full px-2 py-0.5 text-[9px] font-bold shadow-md flex items-center gap-0.5 z-20 animate-[slide-down_0.1s_ease-out]">
                <span className="text-gray-400 cursor-default">cal.com/</span>
                <input
                  type="text"
                  value={customUsername}
                  onChange={(e) => { setCustomUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '')); setUserInteracted(true); }}
                  onBlur={() => {
                    if (!customUsername.trim()) setCustomUsername('bailey');
                    setIsEditingUsername(false);
                  }}
                  onKeyDown={(e) => { 
                    if (e.key === 'Enter') {
                      if (!customUsername.trim()) setCustomUsername('bailey');
                      setIsEditingUsername(false); 
                    }
                  }}
                  autoFocus
                  className="w-16 bg-transparent focus:outline-none border-none p-0 text-[9px] font-bold text-gray-800"
                />
              </div>
            ) : (
              <button 
                onClick={() => { setIsEditingUsername(true); setUserInteracted(true); }}
                title="Click to edit link"
                className="absolute top-3 right-4 bg-gray-50 hover:bg-gray-100 border border-gray-150 hover:border-gray-300 rounded-full px-3 py-0.5 text-[9px] font-bold text-gray-600 shadow-sm transition flex items-center gap-0.5 group/badge"
              >
                <span className="text-gray-400">cal.com/</span>
                <span className="text-gray-900 font-extrabold group-hover/badge:underline">{customUsername}</span>
                <span className="text-[7px] text-gray-400 opacity-0 group-hover/badge:opacity-100 transition-opacity ml-1">✎</span>
              </button>
            )}

            <div className="flex items-center gap-3">
              {/* Initials Avatar */}
              <div className="w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs shadow-inner transition-all duration-300 transform group-hover:scale-105">
                {displayAvatar}
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-gray-400">
                  {displayName}
                </h4>
                <h3 className="text-sm font-bold text-[#111111] leading-none mt-0.5">
                  Business meeting
                </h3>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 leading-normal font-semibold">
              Want to talk strategy, partnerships, or the bigger picture of scheduling infrastructure? Let&apos;s discuss how Cal.com fits into your business goals.
            </p>

            {/* Durations */}
            <div className="flex gap-1.5 bg-gray-50/50 p-1 rounded-xl border border-gray-100/60">
              {['15m', '30m', '45m', '1h'].map((d) => (
                <button
                  key={d}
                  onClick={() => { setBaileyDuration(d); setUserInteracted(true); }}
                  className={`flex-grow py-1 rounded-lg text-[10px] font-bold transition ${
                    baileyDuration === d 
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-150' 
                      : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Bottom config line items */}
            <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold border-t border-gray-100 pt-3">
              <span className="flex items-center gap-1">
                <Video size={12} className="text-indigo-500" /> Zoom
              </span>
              <span className="flex items-center gap-1 hover:text-gray-700 transition cursor-default">
                <Globe size={12} className="text-gray-400" /> North America/California &gt;
              </span>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
