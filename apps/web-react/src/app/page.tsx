import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { LogosStrip } from '../components/landing/LogosStrip';
import { EasyScheduling } from '../components/landing/EasyScheduling';
import { FeatureGrid } from '../components/landing/FeatureGrid';
import { MoreFeatures } from '../components/landing/MoreFeatures';
import { Testimonials } from '../components/landing/Testimonials';
import { AppSync } from '../components/landing/AppSync';
import { WallOfLove } from '../components/landing/WallOfLove';
import { BottomLogos } from '../components/landing/BottomLogos';
import { FinalCta } from '../components/landing/FinalCta';
import { Footer } from '../components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col justify-between overflow-x-hidden relative font-sans animate-none">
      
      {/* 1. Floating Sticky Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-grow">
        
        {/* 2. Hero Section: Emma Brown's Office Hours split scheduler */}
        <HeroSection />

        {/* 3. Top Enterprise Brands Strip */}
        <LogosStrip />

        {/* 4. Easy Scheduling: 01 Connect Calendar, 02 Availability, 03 Choose Channels */}
        <EasyScheduling />

        {/* 5. Benefits: Overload Buffers form, Bailey Pumfleet Custom Booking profile */}
        <FeatureGrid />

        {/* 6. ...and so much more: 8 grids of minimal icons */}
        <MoreFeatures />

        {/* 7. Testimonials: Navi Micah, Mintlify Flo, Supabase CTO */}
        <Testimonials />

        {/* 8. AppSync store: zoom, GA, Calendar, zapier, stripe, hubspot, salesforce, outlook */}
        <AppSync />

        {/* 9. Wall of love: Twitter/X-style tweets grid of Anurag, Serg, Francis, Guillermo */}
        <WallOfLove />

        {/* 10. Bottom Brands Ribbon */}
        <BottomLogos />

        {/* 11. Final Conversion CTA card: PH awards & Ratings */}
        <FinalCta />

      </main>

      {/* 12. Comprehensive Master Footer */}
      <Footer />

    </div>
  );
}
