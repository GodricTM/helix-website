
import React from 'react';
import { ContactInfo } from '../types';
import DNAHelix from './DNAHelix';

interface HelixProps {
  contactInfo: ContactInfo;
}

const Helix: React.FC<HelixProps> = ({ contactInfo }) => {
  return (
    <section id="helix" className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-garage-950">
      {/* Background Video with Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1625828552673-863a35c596d6?q=80&w=2000"
        >
          {/* Points to 'helix-video.mp4' in your 'public' folder */}
          <source src={contactInfo.helixVideoUrl || "/helix-video.mp4?v=3"} type="video/mp4" />
          <img src="https://images.unsplash.com/photo-1486262715619-01b80250e0dc?auto=format&fit=crop&q=80&w=1600" alt="Motorcycle Garage" className="w-full h-full object-cover" />
        </video>

        {/* Overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-garage-950 via-garage-950/80 to-transparent" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">

        {/* Main Text Content */}
        <div className="max-w-4xl text-left">
          <div className="inline-flex items-center bg-bronze-900/30 border border-bronze-500/50 rounded-full px-4 py-1 mb-8 backdrop-blur-sm animate-pulse shadow-[0_0_15px_rgba(205,127,50,0.5)]">
            <span className="w-2 h-2 bg-bronze-500 rounded-full mr-2"></span>
            <span className="text-bronze-100 text-xs font-mono tracking-widest uppercase">{contactInfo.helixTagline || 'FREE CONSULTATION AVAILABLE'}</span>
          </div>

          <div className="border-l-4 border-bronze-500 pl-6 text-left mb-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-helix italic text-white uppercase tracking-tight mb-2 leading-tight">
              {contactInfo.helixTitle || 'Motorcycles are in our'} <span
                onClick={() => {
                  const audio = new Audio('/motorcycle-rev.mp3');
                  audio.volume = 0.5;
                  audio.play().catch(e => console.error("Audio play failed", e));
                }}
                className={`text-transparent bg-clip-text bg-gradient-to-r from-bronze-500 to-amber-200 inline-block cursor-pointer hover:scale-110 transition-transform duration-200 ${contactInfo.helixTitleEffect ? `effect-${contactInfo.helixTitleEffect}` : 'animate-float'}`}
              >
                {contactInfo.helixTitleHighlight || 'DNA'}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-garage-300 font-helix italic font-medium tracking-wide mb-6">
              {contactInfo.helixDescription || '— building, tuning, and fixing them right.'}
            </p>
            <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold font-helix italic uppercase tracking-tight py-4 leading-normal relative group ${contactInfo.helixTextEffect ? `effect-${contactInfo.helixTextEffect}` : ''}`}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-white to-orange-500 drop-shadow-sm pr-6 pb-2 inline-block relative z-10">{contactInfo.helixSubtitle || "Ireland's"}</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-100 via-gray-300 to-gray-500 drop-shadow-sm pr-6 pb-2 inline-block relative z-10">
                {contactInfo.helixSubtitleHighlight || "Finest."}
              </span>
            </h1>
          </div>

          <p className="text-left text-garage-300 text-lg md:text-xl font-mono max-w-2xl mb-8 pl-7">
            Specializing in Cerakote painting, engine rebuilds, and expert maintenance. {contactInfo.offer}
          </p>

          <div className="flex flex-col sm:flex-row items-start pl-7 gap-4">
            <a href="#services" className="inline-block bg-bronze-600 text-white px-8 py-4 text-lg font-bold uppercase tracking-widest hover:bg-bronze-500 transition-all duration-300 skew-x-[-10deg] shadow-[0_0_20px_rgba(205,127,50,0.4)] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(205,127,50,0.6)]">
              <span className="skew-x-[10deg] inline-block">Our Services</span>
            </a>
            <a
              href="https://wa.link/b4y8g6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-garage-400 text-garage-300 px-8 py-4 text-lg font-bold uppercase tracking-widest hover:border-bronze-500 hover:text-white transition-all duration-300 skew-x-[-10deg] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
            >
              <span className="skew-x-[10deg] inline-block">Book Now</span>
            </a>
          </div>

          <div className="flex items-center mt-12 pl-7 text-garage-500 text-sm font-mono">
            <svg className="mr-2 text-bronze-500 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {contactInfo.address}
          </div>
        </div>

        {/* 3D Animated DNA Helix - Hidden on very small screens, prominent on desktop */}
        <div className="hidden lg:flex flex-col items-center justify-center md:ml-10 opacity-80 hover:opacity-100 transition-opacity duration-500">
          <DNAHelix />
          <div className="mt-4 text-[10px] text-bronze-500 font-mono tracking-[0.5em] uppercase text-center">Engineered<br />to Perfection</div>
        </div>

      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-garage-500">
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </section >
  );
};

export default Helix;
