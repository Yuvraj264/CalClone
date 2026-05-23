'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Copy, Video, Mic, MessageSquare, Monitor, PhoneCall, Check, MicOff, VideoOff, RefreshCw } from 'lucide-react';

export const EasyScheduling = () => {
  // Card 2 interactive availability states
  const [monActive, setMonActive] = useState(true);
  const [monStart, setMonStart] = useState('8:30 am');
  const [monEnd, setMonEnd] = useState('5:00 pm');

  const [tueActive, setTueActive] = useState(false);
  const [tueStart, setTueStart] = useState('9:00 am');
  const [tueEnd, setTueEnd] = useState('6:30 pm');

  const [wedActive, setWedActive] = useState(true);
  const [wedStart, setWedStart] = useState('10:00 am');
  const [wedEnd, setWedEnd] = useState('7:00 pm');

  // Copy click feedback helpers
  const [copiedDay, setCopiedDay] = useState<string | null>(null);
  const [cardToast, setCardToast] = useState<string | null>(null);

  // Card 3 Interactive Video conference mockup states
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

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

  const triggerCopyFeedback = (day: string) => {
    setCopiedDay(day);
    
    // Copy Monday's active values to all other days
    if (day === 'mon') {
      setTueActive(true);
      setTueStart(monStart);
      setTueEnd(monEnd);
      
      setWedActive(true);
      setWedStart(monStart);
      setWedEnd(monEnd);

      setCardToast("Copied Monday's schedule (8:30 am - 5:00 pm) to Tuesday & Wednesday!");
    } else if (day === 'tue') {
      setMonActive(true);
      setMonStart(tueStart);
      setMonEnd(tueEnd);

      setWedActive(true);
      setWedStart(tueStart);
      setWedEnd(tueEnd);
      setCardToast("Copied Tuesday's schedule to Monday & Wednesday!");
    } else if (day === 'wed') {
      setMonActive(true);
      setMonStart(wedStart);
      setMonEnd(wedEnd);

      setTueActive(true);
      setTueStart(wedStart);
      setTueEnd(wedEnd);
      setCardToast("Copied Wednesday's schedule to Monday & Tuesday!");
    }

    setTimeout(() => setCopiedDay(null), 1500);
    setTimeout(() => setCardToast(null), 4000);
  };

  // Automated Idle Playback Loop ("working randomly")
  useEffect(() => {
    if (userInteracted) {
      // Resume auto-playback after 12 seconds of zero manual interaction
      const timer = setTimeout(() => setUserInteracted(false), 12000);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      const actions = [
        'toggle_day',
        'change_time',
        'copy_schedule',
        'toggle_mic',
        'toggle_video',
        'toggle_screenshare',
        'toggle_chat',
        'toggle_call'
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];

      switch (randomAction) {
        case 'toggle_day': {
          const days = ['mon', 'tue', 'wed'];
          const randomDay = days[Math.floor(Math.random() * days.length)];
          if (randomDay === 'mon') setMonActive((prev) => !prev);
          else if (randomDay === 'tue') setTueActive((prev) => !prev);
          else if (randomDay === 'wed') setWedActive((prev) => !prev);
          break;
        }
        case 'change_time': {
          const startTimes = ['8:00 am', '8:30 am', '9:00 am', '9:30 am'];
          const randomTime = startTimes[Math.floor(Math.random() * startTimes.length)];
          setMonStart(randomTime);
          break;
        }
        case 'copy_schedule': {
          // Only trigger if Monday is active
          if (monActive) {
            triggerCopyFeedback('mon');
          }
          break;
        }
        case 'toggle_mic': {
          if (!callEnded) setMicMuted((prev) => !prev);
          break;
        }
        case 'toggle_video': {
          if (!callEnded) setVideoOff((prev) => !prev);
          break;
        }
        case 'toggle_screenshare': {
          if (!callEnded) setScreenShareActive((prev) => !prev);
          break;
        }
        case 'toggle_chat': {
          if (!callEnded) setChatOpen((prev) => !prev);
          break;
        }
        case 'toggle_call': {
          setCallEnded((prev) => !prev);
          if (callEnded) {
            setMicMuted(false);
            setVideoOff(false);
            setScreenShareActive(false);
            setChatOpen(false);
          }
          break;
        }
      }
    }, 4000); // Trigger a random change every 4 seconds

    return () => clearInterval(interval);
  }, [interactionCount, callEnded, monActive, monStart, monEnd]);

  return (
    <section className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-20 text-center relative">
      
      {/* Top How it works Badge */}
      <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-150 text-xs font-semibold text-gray-500 shadow-sm cursor-default">
        <HelpCircle size={13} className="text-gray-400" />
        How it works
      </div>

      <h2 className="text-3xl sm:text-5xl font-black text-[#111111] tracking-tight mb-4 max-w-3xl mx-auto leading-tight">
        With us, appointment scheduling is easy
      </h2>
      
      <p className="text-[#6b6b6b] text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
        Effortless scheduling for business and individuals, powerful solutions for fast-growing modern companies.
      </p>

      {/* Under-header CTAs */}
      <div className="flex items-center justify-center gap-3 mb-16">
        <LinkButton href="/event-types" className="px-5 py-2.5 rounded-xl bg-[#111111] text-white hover:bg-black text-sm font-bold shadow-sm transition">
          Get started
        </LinkButton>
        <LinkButton href="/bookings" className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-bold text-[#2b2b2b] shadow-sm transition flex items-center gap-1">
          Book a demo <span className="text-gray-400 font-bold">&gt;</span>
        </LinkButton>
      </div>

      {/* Replicated Cards Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Card 1: Connect your calendar */}
        <div className="bg-white rounded-3xl border border-[#e5e7eb] p-8 text-left shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[460px] relative overflow-hidden group">
          
          <div>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs mb-6">
              01
            </div>
            <h3 className="font-bold text-lg text-[#111111] mb-2 font-sans">
              Connect your calendar
            </h3>
            <p className="text-xs text-[#6b6b6b] leading-relaxed font-semibold">
              We&apos;ll handle all the cross-referencing, so you don&apos;t have to worry about double bookings.
            </p>
          </div>

          {/* Illustration: Central Cal.com orbiting rings with app logos */}
          <div className="relative flex-grow flex items-center justify-center h-48 w-full overflow-hidden mt-6">
            
            {/* Outer Ring */}
            <div className="absolute w-44 h-44 rounded-full border border-dashed border-gray-150 animate-[spin_40s_linear_infinite]" />
            {/* Middle Ring */}
            <div className="absolute w-32 h-32 rounded-full border border-gray-150 animate-[spin_25s_linear_infinite_reverse]" />
            {/* Inner Ring */}
            <div className="absolute w-20 h-20 rounded-full border border-dotted border-gray-200" />

            {/* Central Cal.com circular logo */}
            <div className="absolute w-16 h-16 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center z-10">
              <span className="font-black text-xs text-[#111111]">Cal.com</span>
            </div>

            {/* Floating Calendar app icons positioned along the rings */}
            
            {/* Google Calendar (Top right orbit) */}
            <div className="absolute top-8 right-16 w-8 h-8 rounded-lg bg-white border border-gray-150 shadow-sm flex items-center justify-center z-10 transition hover:scale-105">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="#4285F4"/>
                <path d="M21 5v14c0 1.1-.9 2-2 2h-4V11l-3 3-3-3v10H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2z" fill="#34A853"/>
                <path d="M19 3v8L12 5l-7 6V3c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2z" fill="#FBBC05"/>
              </svg>
            </div>

            {/* Outlook Calendar (Bottom left orbit) */}
            <div className="absolute bottom-6 left-14 w-8 h-8 rounded-lg bg-white border border-gray-150 shadow-sm flex items-center justify-center z-10 transition hover:scale-105">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="4" fill="#0078d4"/>
                <path d="M6 6h12v12H6V6zm2 2v8h8V8H8z" fill="white"/>
              </svg>
            </div>

            {/* Apple Calendar (Bottom right orbit) */}
            <div className="absolute bottom-10 right-14 w-8 h-8 rounded-lg bg-white border border-gray-150 shadow-sm flex items-center justify-center z-10 transition hover:scale-105">
              <div className="flex flex-col items-center justify-center">
                <span className="text-[6px] font-black text-red-500 uppercase leading-none">MAY</span>
                <span className="text-xs font-bold text-gray-800 leading-none">17</span>
              </div>
            </div>

          </div>

        </div>

        {/* Card 2: Set your availability */}
        <div className="bg-white rounded-3xl border border-[#e5e7eb] p-8 text-left shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[460px] relative overflow-hidden group">
          
          {/* Card-specific Floating Toast Alert */}
          {cardToast && (
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-150 shadow-md text-[10px] font-bold animate-slide-down">
              <Check size={11} className="text-emerald-600" />
              <span>{cardToast}</span>
            </div>
          )}

          <div>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs mb-6">
              02
            </div>
            <h3 className="font-bold text-lg text-[#111111] mb-2 font-sans">
              Set your availability
            </h3>
            <p className="text-xs text-[#6b6b6b] leading-relaxed font-semibold">
              Want to block off weekends? Set up any buffers? We make that easy.
            </p>
          </div>

          {/* Illustration: Interactive availability switches */}
          <div className="h-56 w-full bg-gray-50/50 rounded-2xl border border-gray-100 p-4 flex flex-col justify-center gap-3 relative mt-6">
            
            {/* Monday row */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-100/60 pb-2">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setMonActive(!monActive); setUserInteracted(true); }}
                  className={`w-8 h-5 rounded-full transition-colors relative ${monActive ? 'bg-black' : 'bg-gray-200'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-all ${monActive ? 'right-0.75' : 'left-0.75'}`} />
                </button>
                <span className={`text-xs font-bold ${monActive ? 'text-gray-800' : 'text-gray-400'}`}>Mon</span>
              </div>
              <div className="flex items-center gap-1">
                <input 
                  type="text" 
                  value={monStart} 
                  onChange={(e) => { setMonStart(e.target.value); setUserInteracted(true); }}
                  disabled={!monActive} 
                  className={`w-16 py-1 rounded bg-white border border-gray-150 text-[10px] font-bold text-center text-gray-700 focus:outline-none focus:border-black/50 ${!monActive && 'opacity-40'}`} 
                />
                <span className="text-[10px] text-gray-400 font-bold">-</span>
                <input 
                  type="text" 
                  value={monEnd} 
                  onChange={(e) => { setMonEnd(e.target.value); setUserInteracted(true); }}
                  disabled={!monActive} 
                  className={`w-16 py-1 rounded bg-white border border-gray-150 text-[10px] font-bold text-center text-gray-700 focus:outline-none focus:border-black/50 ${!monActive && 'opacity-40'}`} 
                />
              </div>
              <div className="flex gap-1 text-gray-400">
                <button onClick={() => setUserInteracted(true)} className="p-1 hover:text-gray-700"><Plus size={11} /></button>
                <button onClick={() => { triggerCopyFeedback('mon'); setUserInteracted(true); }} className="p-1 hover:text-gray-700 relative transition-transform active:scale-90">
                  {copiedDay === 'mon' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                </button>
              </div>
            </div>

            {/* Tuesday row */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-100/60 pb-2">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setTueActive(!tueActive); setUserInteracted(true); }}
                  className={`w-8 h-5 rounded-full transition-colors relative ${tueActive ? 'bg-black' : 'bg-gray-200'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-all ${tueActive ? 'right-0.75' : 'left-0.75'}`} />
                </button>
                <span className={`text-xs font-bold ${tueActive ? 'text-gray-800' : 'text-gray-400'}`}>Tue</span>
              </div>
              <div className="flex items-center gap-1">
                <input 
                  type="text" 
                  value={tueStart} 
                  onChange={(e) => { setTueStart(e.target.value); setUserInteracted(true); }}
                  disabled={!tueActive} 
                  className={`w-16 py-1 rounded bg-white border border-gray-150 text-[10px] font-bold text-center text-gray-700 focus:outline-none focus:border-black/50 disabled:opacity-40`} 
                />
                <span className="text-[10px] text-gray-400 font-bold">-</span>
                <input 
                  type="text" 
                  value={tueEnd} 
                  onChange={(e) => { setTueEnd(e.target.value); setUserInteracted(true); }}
                  disabled={!tueActive} 
                  className={`w-16 py-1 rounded bg-white border border-gray-150 text-[10px] font-bold text-center text-gray-700 focus:outline-none focus:border-black/50 disabled:opacity-40`} 
                />
              </div>
              <div className="flex gap-1 text-gray-400">
                <button onClick={() => setUserInteracted(true)} className="p-1 hover:text-gray-700"><Plus size={11} /></button>
                <button onClick={() => { triggerCopyFeedback('tue'); setUserInteracted(true); }} className="p-1 hover:text-gray-700 relative transition-transform active:scale-90">
                  {copiedDay === 'tue' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                </button>
              </div>
            </div>

            {/* Wednesday row */}
            <div className="flex items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setWedActive(!wedActive); setUserInteracted(true); }}
                  className={`w-8 h-5 rounded-full transition-colors relative ${wedActive ? 'bg-black' : 'bg-gray-200'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-all ${wedActive ? 'right-0.75' : 'left-0.75'}`} />
                </button>
                <span className={`text-xs font-bold ${wedActive ? 'text-gray-800' : 'text-gray-400'}`}>Wed</span>
              </div>
              <div className="flex items-center gap-1">
                <input 
                  type="text" 
                  value={wedStart} 
                  onChange={(e) => { setWedStart(e.target.value); setUserInteracted(true); }}
                  disabled={!wedActive} 
                  className={`w-16 py-1 rounded bg-white border border-gray-150 text-[10px] font-bold text-center text-gray-700 focus:outline-none focus:border-black/50 ${!wedActive && 'opacity-40'}`} 
                />
                <span className="text-[10px] text-gray-400 font-bold">-</span>
                <input 
                  type="text" 
                  value={wedEnd} 
                  onChange={(e) => { setWedEnd(e.target.value); setUserInteracted(true); }}
                  disabled={!wedActive} 
                  className={`w-16 py-1 rounded bg-white border border-gray-150 text-[10px] font-bold text-center text-gray-700 focus:outline-none focus:border-black/50 ${!wedActive && 'opacity-40'}`} 
                />
              </div>
              <div className="flex gap-1 text-gray-400">
                <button onClick={() => setUserInteracted(true)} className="p-1 hover:text-gray-700"><Plus size={11} /></button>
                <button onClick={() => { triggerCopyFeedback('wed'); setUserInteracted(true); }} className="p-1 hover:text-gray-700 relative transition-transform active:scale-90">
                  {copiedDay === 'wed' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Card 3: Choose how to meet */}
        <div className="bg-white rounded-3xl border border-[#e5e7eb] p-8 text-left shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[460px] relative overflow-hidden group">
          
          <div>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs mb-6">
              03
            </div>
            <h3 className="font-bold text-lg text-[#111111] mb-2 font-sans">
              Choose how to meet
            </h3>
            <p className="text-xs text-[#6b6b6b] leading-relaxed font-semibold">
              It could be a video chat, phone call, or a walk in the park!
            </p>
          </div>

          {/* Illustration: Video conference split-screen mockup */}
          <div className="h-56 w-full bg-gray-900 rounded-2xl border border-gray-950 p-3.5 flex flex-col justify-between relative mt-6 transition-all duration-300">
            
            {callEnded ? (
              // Call Ended Screen
              <div className="flex-grow flex flex-col items-center justify-center text-center p-4 animate-fade-in">
                <span className="text-[10px] font-bold text-gray-400 mb-3">Call disconnected.</span>
                <button 
                  onClick={() => {
                    setCallEnded(false);
                    setMicMuted(false);
                    setVideoOff(false);
                    setUserInteracted(true);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-900 text-[10px] font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                >
                  <RefreshCw size={10} className="animate-spin-slow" /> Reconnect call
                </button>
              </div>
            ) : (
              // Active Call View
              <>
                {/* Top row: Video split screens */}
                <div className="flex-grow grid grid-cols-2 gap-2.5">
                  
                  {/* Left: Emma's Screen */}
                  <div className={`rounded-xl border transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden shadow-sm ${
                    videoOff 
                      ? 'bg-gray-950 border-gray-800' 
                      : 'bg-gradient-to-tr from-indigo-900/60 via-purple-900/40 to-pink-900/30 border-purple-500/20'
                  }`}>
                    {videoOff ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-black text-gray-400">
                          EB
                        </div>
                        <span className="text-[7px] text-gray-500 font-extrabold tracking-wide uppercase">Camera off</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-[9px] font-bold border border-white/5 relative shadow-inner animate-pulse">
                          E
                        </div>
                        <span className="absolute bottom-1.5 left-2 px-1 rounded bg-black/45 text-[7px] text-white font-bold backdrop-blur-sm">
                          Emma (Host)
                        </span>
                      </>
                    )}

                    {/* Mute indicator overlay */}
                    {micMuted && (
                      <span className="absolute top-1.5 right-2 px-1 py-0.5 rounded bg-rose-500/90 text-[6px] font-extrabold text-white uppercase tracking-wider animate-pulse">
                        Muted
                      </span>
                    )}
                  </div>

                  {/* Right: Guest's Screen */}
                  <div className={`rounded-xl border flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-emerald-950/40 via-teal-900/30 to-sky-950/40 shadow-sm transition-all duration-300 ${
                    screenShareActive ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-gray-800'
                  }`}>
                    {screenShareActive ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gray-950/80 animate-fade-in">
                        <div className="w-full flex flex-col gap-1 text-[6px] font-mono text-emerald-400 border border-emerald-500/20 rounded p-1.5 bg-black/60 shadow-inner overflow-hidden max-h-[60px]">
                          <div>const meet = &#123;</div>
                          <div className="pl-2">platform: &apos;calclone&apos;,</div>
                          <div className="pl-2">status: &apos;connected&apos;</div>
                          <div>&#125;;</div>
                        </div>
                        <span className="text-[7px] text-emerald-400 font-black mt-2 tracking-wide uppercase animate-pulse">Sharing Screen</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-[9px] font-bold border border-white/5 relative shadow-inner">
                          G
                        </div>
                        <span className="absolute bottom-1.5 left-2 px-1 rounded bg-black/45 text-[7px] text-white font-bold backdrop-blur-sm">
                          You (Guest)
                        </span>
                      </>
                    )}

                    {chatOpen && (
                      <div className="absolute top-1.5 left-1.5 right-1.5 bg-white border border-gray-150 rounded-lg p-1.5 shadow-md text-[7px] font-bold text-gray-800 animate-slide-down flex items-center justify-between">
                        <span>👋 Hello Emma, excited to connect!</span>
                        <button onClick={() => { setChatOpen(false); setUserInteracted(true); }} className="text-gray-400 hover:text-black">×</button>
                      </div>
                    )}
                  </div>

                </div>

                {/* Bottom row: Control toolbar icons */}
                <div className="mt-2.5 h-8 bg-[#18181b] border border-gray-800 rounded-xl px-3 flex items-center justify-center gap-4 shadow-md max-w-[210px] mx-auto z-10 relative">
                  <button 
                    onClick={() => { setMicMuted(!micMuted); setUserInteracted(true); }}
                    title={micMuted ? "Unmute Mic" : "Mute Mic"}
                    className={`p-1.5 rounded-lg hover:bg-gray-800 transition ${micMuted ? 'text-rose-500' : 'text-gray-300'}`}
                  >
                    {micMuted ? <MicOff size={11} /> : <Mic size={11} />}
                  </button>

                  <button 
                    onClick={() => { setVideoOff(!videoOff); setUserInteracted(true); }}
                    title={videoOff ? "Turn Video On" : "Turn Video Off"}
                    className={`p-1.5 rounded-lg hover:bg-gray-800 transition ${videoOff ? 'text-rose-500' : 'text-gray-300'}`}
                  >
                    {videoOff ? <VideoOff size={11} /> : <Video size={11} />}
                  </button>

                  <button 
                    onClick={() => { setChatOpen(!chatOpen); setUserInteracted(true); }}
                    title="Send Chat Message"
                    className={`p-1.5 rounded-lg hover:bg-gray-800 transition ${chatOpen ? 'text-sky-400' : 'text-gray-300'}`}
                  >
                    <MessageSquare size={11} />
                  </button>

                  <button 
                    onClick={() => { setScreenShareActive(!screenShareActive); setUserInteracted(true); }}
                    title="Toggle Screen Share"
                    className={`p-1.5 rounded-lg hover:bg-gray-800 transition ${screenShareActive ? 'text-emerald-400' : 'text-gray-300'}`}
                  >
                    <Monitor size={11} />
                  </button>

                  <button 
                    onClick={() => { setCallEnded(true); setUserInteracted(true); }}
                    title="Disconnect Call"
                    className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition transition-transform active:scale-90"
                  >
                    <PhoneCall size={11} />
                  </button>
                </div>
              </>
            )}

          </div>

        </div>

      </div>

    </section>
  );
};


// Reusable local LinkButton
const LinkButton = ({ href, children, className }: { href: string, children: React.ReactNode, className: string }) => {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
};
