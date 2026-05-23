'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Video, Star, Clock, Calendar as CalendarIcon, Check, ArrowRight, Mail, User, FileText, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';

export const HeroSection = () => {
  const [duration, setDuration] = useState('15m');
  const [selectedDate, setSelectedDate] = useState(16);
  const [isHovered, setIsHovered] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Advanced Interactive Scheduler States
  const [showSlots, setShowSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmSlot, setConfirmSlot] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<'select' | 'form' | 'success'>('select');

  // Booking Form Fields
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Duration-based Mock Slot Intervals
  const slotsMap: Record<string, string[]> = {
    '15m': ['9:00 am', '9:15 am', '9:30 am', '9:45 am', '10:00 am', '10:15 am', '10:30 am', '10:45 am'],
    '30m': ['9:00 am', '9:30 am', '10:00 am', '10:30 am', '11:00 am', '11:30 am', '1:00 pm', '1:30 pm'],
    '45m': ['9:00 am', '9:45 am', '10:30 am', '11:15 am', '12:00 pm', '1:30 pm', '2:15 pm', '3:00 pm'],
    '1h': ['9:00 am', '10:00 am', '11:00 am', '12:00 pm', '1:00 pm', '2:00 pm', '3:00 pm', '4:00 pm'],
  };

  const currentSlots = slotsMap[duration] || slotsMap['15m'];

  // Auto-Simulation Cycle (Running only when user hasn't interacted & is not hovering)
  useEffect(() => {
    if (isHovered || userInteracted) return;

    const durations = ['15m', '30m', '45m', '1h'];
    const dates = [6, 7, 8, 9, 15, 16, 20, 21, 22, 23];
    let step = 0;

    const interval = setInterval(() => {
      // Step-based sequence for realistic scheduler demonstration
      if (step === 0) {
        // 1. Select a new duration and date, reset states
        setBookingStep('select');
        setShowSlots(false);
        setSelectedSlot(null);
        setConfirmSlot(null);
        setGuestName('');
        setGuestEmail('');
        setGuestNotes('');

        const nextDur = durations[Math.floor(Math.random() * durations.length)];
        const nextDate = dates[Math.floor(Math.random() * dates.length)];
        setDuration(nextDur);
        setSelectedDate(nextDate);
        step = 1;
      } else if (step === 1) {
        // 2. Open slots column
        setShowSlots(true);
        step = 2;
      } else if (step === 2) {
        // 3. Highlight a random slot and show Confirm button
        const slotsForDur = slotsMap[duration];
        const randomSlot = slotsForDur[Math.floor(Math.random() * slotsForDur.length)];
        setSelectedSlot(randomSlot);
        setConfirmSlot(randomSlot);
        step = 3;
      } else if (step === 3) {
        // 4. Open the details form
        setBookingStep('form');
        step = 4;
      } else if (step === 4) {
        // 5. Simulate filling out form fields
        setGuestName('John Doe');
        setGuestEmail('john.doe@example.com');
        setGuestNotes('Discuss scheduling options and integration details.');
        step = 5;
      } else if (step === 5) {
        // 6. Trigger loading spinner
        setIsSubmitting(true);
        step = 6;
      } else if (step === 6) {
        // 7. Show success confirmation
        setIsSubmitting(false);
        setBookingStep('success');
        step = 0; // Reset loop to step 0
      }
    }, 3800);

    return () => clearInterval(interval);
  }, [isHovered, userInteracted, duration]);

  // Pause cycle permanently upon manual click interaction
  const handleInteraction = () => {
    setUserInteracted(true);
    setIsHovered(true);
  };

  const handleDateClick = (day: number) => {
    handleInteraction();
    setSelectedDate(day);
    setShowSlots(true);
    setSelectedSlot(null);
    setConfirmSlot(null);
    if (bookingStep !== 'select') setBookingStep('select');
  };

  const handleDurationClick = (d: string) => {
    handleInteraction();
    setDuration(d);
    setSelectedSlot(null);
    setConfirmSlot(null);
    if (bookingStep !== 'select') setBookingStep('select');
  };

  const handleSlotClick = (slot: string) => {
    handleInteraction();
    setSelectedSlot(slot);
    setConfirmSlot(slot);
  };

  const handleConfirmClick = () => {
    handleInteraction();
    setBookingStep('form');
  };

  const handleBackToSelect = () => {
    handleInteraction();
    setBookingStep('select');
    setConfirmSlot(null);
  };

  const handleBookingFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleInteraction();
    setValidationError('');

    if (!guestName.trim()) {
      setValidationError('Please enter your name.');
      return;
    }
    if (!guestEmail.trim() || !/\S+@\S+\.\S+/.test(guestEmail)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingStep('success');
    }, 1200);
  };

  const handleResetScheduler = () => {
    setUserInteracted(false); // Enable auto-cycle again if they reset
    setBookingStep('select');
    setShowSlots(false);
    setSelectedSlot(null);
    setConfirmSlot(null);
    setGuestName('');
    setGuestEmail('');
    setGuestNotes('');
  };

  const RenderStars = ({ count, color }: { count: number; color: string }) => {
    return (
      <div className="flex gap-0.5 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <Star key={i} size={13} fill={color} stroke="none" />
        ))}
      </div>
    );
  };

  // List of active bookable dates in the calendar grid
  const activeDays = [6, 7, 8, 9, 15, 16, 20, 21, 22, 23];

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-12 py-12 lg:py-20 overflow-hidden">
      
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Copy & CTAs */}
        <div className="lg:col-span-5 flex flex-col items-start text-left max-w-xl">
          
          <div className="mb-6 px-3.5 py-1 rounded-full bg-[#f4f4f5] border border-[#e4e4e7] hover:bg-[#e4e4e7] text-xs font-semibold text-[#18181b] inline-flex items-center gap-1.5 transition cursor-pointer hover:scale-102 active:scale-98">
            Cal.com launches v6.5
            <span className="text-[10px] text-gray-400 font-bold">&gt;</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#111111] leading-[1.08] mb-6 font-sans">
            The better way <br />
            to schedule your <br />
            meetings
          </h1>

          <p className="text-[#6b6b6b] text-base sm:text-lg font-normal leading-relaxed mb-8">
            A fully customizable scheduling software for individuals, businesses taking calls and developers building scheduling platforms where users meet users.
          </p>

          <div className="w-full flex flex-col gap-3 mb-4 max-w-md">
            
            <button className="w-full py-3.5 px-6 rounded-xl bg-[#1c1c1c] hover:bg-black text-white text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-3">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>

            <button className="w-full py-3.5 px-6 rounded-xl bg-[#f4f4f5] border border-[#e4e4e7] hover:bg-[#e4e4e7] text-[#1c1c1c] text-sm font-bold transition-all active:scale-[0.99] flex items-center justify-center gap-1">
              Sign up with email <span className="text-gray-400 font-bold ml-1">&gt;</span>
            </button>

          </div>

          <p className="text-gray-400 text-xs font-normal mb-8">
            No credit card required
          </p>

          <div className="flex flex-wrap items-center gap-6 border-t border-gray-100 pt-6 w-full">
            
            <div className="flex flex-col gap-1 text-left">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((x) => (
                  <div key={x} className="w-3.5 h-3.5 bg-[#00b67a] flex items-center justify-center rounded-sm">
                    <Star size={10} fill="white" stroke="none" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-black tracking-tight text-gray-800 flex items-center gap-0.5 mt-0.5">
                ★ Trustpilot
              </span>
            </div>

            <div className="flex flex-col gap-1 text-left">
              <RenderStars count={5} color="#ea580c" />
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-4 h-4 rounded-full bg-[#da552f] text-white flex items-center justify-center text-[10px] font-black font-sans">
                  P
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-left">
              <RenderStars count={5} color="#ff2a3a" />
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-4 h-4 rounded-full bg-[#ff2a3a] text-white flex items-center justify-center text-[10px] font-black font-sans">
                  G
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Side: Replicated Dynamic Scheduler Widget */}
        <div 
          className="lg:col-span-7 w-full flex items-center justify-center relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Active Status Badge for Simulation */}
          {!userInteracted && (
            <div className="absolute -top-3 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00b67a]/10 border border-[#00b67a]/20 text-[10px] font-bold text-[#00b67a] animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00b67a]"></span>
              Live Demo Cycle Running
            </div>
          )}

          {userInteracted && (
            <button 
              onClick={handleResetScheduler}
              className="absolute -top-3 right-4 z-20 flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-250 text-[10px] font-bold text-gray-700 shadow-sm transition"
            >
              🔄 Reset to Demo
            </button>
          )}
          
          <div className="w-full bg-white rounded-3xl border border-[#e5e7eb] shadow-[0_12px_48px_rgba(0,0,0,0.06)] flex flex-col md:flex-row overflow-hidden min-h-[420px] transition-all duration-500 hover:shadow-[0_16px_56px_rgba(0,0,0,0.08)]">
            
            {/* 1. Host Section */}
            <div className="w-full md:w-[35%] p-5 border-b md:border-b-0 md:border-r border-gray-150 flex flex-col justify-between text-left">
              <div>
                <div className="w-9 h-9 rounded-full bg-[#2a2a2a] text-white flex items-center justify-center font-bold text-sm mb-4 hover:rotate-6 transition-transform cursor-pointer">
                  E
                </div>
                
                <h4 className="text-xs font-semibold text-[#6b6b6b] mb-0.5">
                  Emma Brown
                </h4>
                
                <h3 className="text-base font-bold text-[#111111] mb-2">
                  Office Hours
                </h3>
                
                <p className="text-[11px] text-[#6b6b6b] leading-relaxed mb-6 font-medium">
                  Join a virtual meeting to discuss your child&apos;s academic progress and development plan.
                </p>
              </div>

              <div>
                {/* Interactive Duration Selector */}
                <div className="flex items-center gap-1 mb-4 bg-gray-50/60 p-1 rounded-lg border border-gray-150/60">
                  {['15m', '30m', '45m', '1h'].map((d) => (
                    <button
                      key={d}
                      onClick={() => handleDurationClick(d)}
                      className={`flex-grow py-1 rounded text-[10px] font-bold transition-all duration-200 ${
                        duration === d 
                          ? 'bg-white text-gray-900 shadow-sm border border-gray-200 font-extrabold' 
                          : 'text-[#6b6b6b] hover:text-[#111111] hover:bg-white/40'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-[#2b2b2b] font-semibold mb-2">
                  <Video size={13} className="text-[#4f46e5]" />
                  <span>MS Teams</span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-[#6b6b6b] font-semibold">
                  <Globe size={13} className="text-gray-400" />
                  <span className="truncate">America/New York</span>
                  <span className="text-[9px] text-gray-400 font-bold">&gt;</span>
                </div>
              </div>

            </div>

            {/* 2. Interactive Flow Panel Container */}
            <div className="flex-1 flex flex-col justify-between bg-white text-left min-h-[320px]">
              
              {/* SCREEN A: CALENDAR AND TIME SLOTS SELECTOR */}
              {bookingStep === 'select' && (
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex flex-col md:flex-row h-full">
                    
                    {/* Left: Calendar Component */}
                    <div className={`p-5 flex-1 transition-all duration-300 ${showSlots ? 'md:max-w-[55%]' : 'w-full'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-gray-900">
                          May <span className="text-gray-400 font-medium">2026</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5 text-center mb-3">
                        {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day) => (
                          <span key={day} className="text-[9px] font-extrabold text-gray-400 tracking-wider">
                            {day}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-5 gap-1.5 text-center">
                        <span className="text-[11px] text-gray-300 font-semibold py-1.5">1</span>
                        <span className="text-[11px] text-gray-300 font-semibold py-1.5">2</span>

                        <span className="text-[11px] text-gray-300 font-semibold py-1.5">5</span>
                        {/* Render active dates */}
                        {activeDays.slice(0, 4).map((day) => (
                          <button 
                            key={day}
                            onClick={() => handleDateClick(day)}
                            className={`text-[11px] font-bold py-1.5 rounded-md transition-all duration-200 relative ${
                              selectedDate === day 
                                ? 'bg-black text-white scale-105 shadow-sm' 
                                : 'bg-gray-50 hover:bg-gray-150 text-[#111111]'
                            }`}
                          >
                            <span>{day}</span>
                            <span className={`w-0.75 h-0.75 rounded-full absolute bottom-0.70 ${selectedDate === day ? 'bg-white' : 'bg-black/50'}`} />
                          </button>
                        ))}

                        <span className="text-[11px] text-gray-300 font-semibold py-1.5">12</span>
                        <span className="text-[11px] text-gray-300 font-semibold py-1.5">13</span>
                        <span className="text-[11px] text-gray-300 font-semibold py-1.5">14</span>

                        {activeDays.slice(4, 6).map((day) => (
                          <button 
                            key={day}
                            onClick={() => handleDateClick(day)}
                            className={`text-[11px] font-bold py-1.5 rounded-md transition-all duration-200 relative ${
                              selectedDate === day 
                                ? 'bg-black text-white scale-105 shadow-sm' 
                                : 'bg-gray-50 hover:bg-gray-150 text-[#111111]'
                            }`}
                          >
                            <span>{day}</span>
                            <span className={`w-0.75 h-0.75 rounded-full absolute bottom-0.70 ${selectedDate === day ? 'bg-white' : 'bg-black/50'}`} />
                          </button>
                        ))}

                        <span className="text-[11px] text-gray-300 font-semibold py-1.5">19</span>
                        
                        {activeDays.slice(6).map((day) => (
                          <button 
                            key={day}
                            onClick={() => handleDateClick(day)}
                            className={`text-[11px] font-bold py-1.5 rounded-md transition-all duration-200 relative ${
                              selectedDate === day 
                                ? 'bg-black text-white scale-105 shadow-sm' 
                                : 'bg-gray-50 hover:bg-gray-150 text-[#111111]'
                            }`}
                          >
                            <span>{day}</span>
                            <span className={`w-0.75 h-0.75 rounded-full absolute bottom-0.70 ${selectedDate === day ? 'bg-white' : 'bg-black/50'}`} />
                          </button>
                        ))}

                        <span className="text-[11px] text-gray-300 font-semibold py-1.5">26</span>
                        <span className="text-[11px] text-gray-300 font-semibold py-1.5">27</span>
                        <span className="text-[11px] text-gray-300 font-semibold py-1.5">28</span>
                        <span className="text-[11px] text-gray-300 font-semibold py-1.5">29</span>
                        <span className="text-[11px] text-gray-300 font-semibold py-1.5">30</span>
                      </div>
                    </div>

                    {/* Right: Slots List Panel (Slides Open) */}
                    {showSlots && (
                      <div className="flex-1 p-5 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col h-full bg-gray-50/20 transition-all duration-300 max-h-[300px] md:max-h-full overflow-y-auto">
                        <div className="mb-2">
                          <h4 className="text-[10px] font-extrabold text-gray-400 tracking-wider uppercase mb-1">
                            May {selectedDate} — Available Slots
                          </h4>
                          <span className="text-[9px] text-[#6b6b6b] font-medium">Select a start time:</span>
                        </div>

                        <div className="flex flex-col gap-1.5 py-1">
                          {currentSlots.map((slot) => {
                            const isSelected = selectedSlot === slot;
                            const isConfirmed = confirmSlot === slot;

                            return (
                              <div key={slot} className="w-full flex gap-1 relative transition-all duration-200">
                                <button
                                  onClick={() => handleSlotClick(slot)}
                                  className={`flex-grow py-2 rounded-lg text-xs font-bold text-center border transition-all duration-250 ${
                                    isSelected
                                      ? 'bg-gray-100 border-black/40 text-black w-1/2 scale-98'
                                      : 'bg-white border-gray-200 hover:border-black/60 text-[#111111]'
                                  }`}
                                >
                                  {slot}
                                </button>
                                
                                {isConfirmed && (
                                  <button
                                    onClick={handleConfirmClick}
                                    className="w-1/2 bg-black hover:bg-black/90 text-white rounded-lg text-xs font-bold py-2 flex items-center justify-center gap-1 shadow-sm border border-black transition-all duration-300 animate-slide-left"
                                  >
                                    Confirm <ChevronRight size={12} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>

                  <div className="p-4 border-t border-gray-150 flex justify-between items-center text-[10px] text-gray-450 font-bold bg-white z-10">
                    <span className="flex items-center gap-1">
                      📅 May {selectedDate}, 2026
                    </span>
                    <span className="text-gray-800 font-extrabold">
                      {currentSlots.length} Slots available
                    </span>
                  </div>
                </div>
              )}

              {/* SCREEN B: INLINE BOOKING DETAILS FORM */}
              {bookingStep === 'form' && (
                <div className="flex-grow flex flex-col p-5 justify-between">
                  <div className="flex items-center gap-2 mb-4">
                    <button 
                      onClick={handleBackToSelect}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                    >
                      <ArrowRight size={13} className="rotate-180 text-gray-500" />
                    </button>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Enter Details</h3>
                      <span className="text-[10px] text-gray-500 font-medium">May {selectedDate} at {selectedSlot} ({duration})</span>
                    </div>
                  </div>

                  <form onSubmit={handleBookingFormSubmit} className="flex-grow flex flex-col gap-3.5">
                    <div>
                      <label className="text-[9px] font-extrabold text-gray-400 tracking-wider uppercase block mb-1">
                        Your Name
                      </label>
                      <div className="relative">
                        <User size={12} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => {
                            handleInteraction();
                            setGuestName(e.target.value);
                          }}
                          placeholder="e.g. John Doe"
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:border-black bg-gray-50/20 focus:bg-white transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-extrabold text-gray-400 tracking-wider uppercase block mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail size={12} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => {
                            handleInteraction();
                            setGuestEmail(e.target.value);
                          }}
                          placeholder="e.g. john@example.com"
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:border-black bg-gray-50/20 focus:bg-white transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-extrabold text-gray-400 tracking-wider uppercase block mb-1">
                        Additional Notes (Optional)
                      </label>
                      <div className="relative">
                        <FileText size={12} className="absolute left-3 top-2.5 text-gray-400" />
                        <textarea
                          value={guestNotes}
                          onChange={(e) => {
                            handleInteraction();
                            setGuestNotes(e.target.value);
                          }}
                          placeholder="e.g. Topics to cover"
                          rows={2}
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:border-black bg-gray-50/20 focus:bg-white transition resize-none"
                        />
                      </div>
                    </div>

                    {validationError && (
                      <p className="text-[10px] font-bold text-rose-500">{validationError}</p>
                    )}

                    <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handleBackToSelect}
                        className="px-4 py-1.5 rounded-lg border border-gray-250 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                      >
                        Back
                      </button>
                      
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-1.5 rounded-lg bg-black text-white hover:bg-black/90 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            Booking...
                          </>
                        ) : (
                          <>
                            Schedule <Check size={12} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* SCREEN C: GORGEOUS MEETING SCHEDULED SUCCESS SCREEN */}
              {bookingStep === 'success' && (
                <div className="flex-grow flex flex-col p-6 items-center justify-center text-center animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4 text-emerald-600 animate-bounce">
                    <CheckCircle2 size={24} />
                  </div>
                  
                  <h3 className="text-base font-black text-[#111111] mb-1 font-sans">
                    This meeting is scheduled
                  </h3>
                  
                  <p className="text-[11px] text-[#6b6b6b] leading-normal max-w-xs mb-5 font-semibold">
                    We&apos;ve sent a calendar invitation and details packet to <span className="text-black font-extrabold underline">{guestEmail || 'john.doe@example.com'}</span>.
                  </p>

                  <div className="w-full bg-gray-50 rounded-2xl border border-gray-150 p-4 text-left max-w-xs flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] text-[#111111] font-bold">
                      <span className="text-gray-400">Host:</span>
                      <span>Emma Brown</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#111111] font-bold border-t border-gray-100 pt-2">
                      <span className="text-gray-400">Event Type:</span>
                      <span>Office Hours ({duration})</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#111111] font-bold border-t border-gray-100 pt-2">
                      <span className="text-gray-400">Date/Time:</span>
                      <span>May {selectedDate}, 2026 @ {selectedSlot || '10:30 am'}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleResetScheduler}
                    className="mt-6 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-250 text-xs font-bold text-gray-800 transition shadow-sm active:scale-98"
                  >
                    Book Another Event
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

