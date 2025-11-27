import React, { useState } from 'react';
import { SPECIALTY_SERVICES } from '../constants';
import { ServiceItem, ContactInfo } from '../types';
import BeforeAfterSlider from './BeforeAfterSlider';

interface ServicesProps {
  services: ServiceItem[];
  contactInfo?: ContactInfo;
}

const icons: Record<string, React.ReactNode> = {
  'Wrench': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
  'Disc': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>,
  'Droplet': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg>,
  'Activity': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
  'Settings': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>,
  'Link': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
  'Gauge': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>,
  'ChevronsUp': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 11-5-5-5 5" /><path d="m17 18-5-5-5 5" /></svg>,
  'SprayCan': <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h.01" /><path d="M7 5h.01" /><path d="M11 7h.01" /><path d="M3 7h.01" /><path d="M7 9h.01" /><path d="M11 11h.01" /><rect width="4" height="4" x="15" y="5" /><path d="m19 9 2 2v10c0 .6-.4 1-1 1h-6c-.6 0-1-.4-1-1V11l2-2" /><path d="m13 14 8-2" /><path d="m13 19 8-2" /></svg>,
  'Wind': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" /><path d="M9.6 4.6A2 2 0 1 1 11 8H2" /><path d="M12.6 19.4A2 2 0 1 0 14 16H2" /></svg>,
  'Zap': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  'CircleDot': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="1" /></svg>,
};

const Services: React.FC<ServicesProps> = ({ services, contactInfo }) => {
  const [flippedId, setFlippedId] = useState<string | null>(null);

  return (
    <section id="services" className="py-24 bg-garage-900 border-y border-garage-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white uppercase tracking-tight mb-4">Workshop Services</h2>
          <div className="h-1 w-20 bg-bronze-500 mx-auto"></div>
          <p className="mt-4 text-garage-400 max-w-2xl mx-auto">
            Professional maintenance, rebuilds, and custom finishing in Wicklow.
          </p>
        </div>

        {/* Featured Service: Cerakote */}
        <div className="mb-16">
          {SPECIALTY_SERVICES.map(service => (
            <div key={service.id} className="relative bg-garage-950 border border-bronze-500/30 overflow-hidden rounded-sm flex flex-col md:flex-row shadow-[0_0_30px_rgba(205,127,50,0.05)]">
              <div className="p-8 md:p-12 md:w-3/5 z-10">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-bronze-600 rounded-lg text-white mr-4">
                    {icons[service.icon]}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-wider">{service.title}</h3>
                </div>
                <p className="text-garage-300 text-lg leading-relaxed mb-6">
                  {service.description}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm text-garage-400 font-mono">
                  <span className="flex items-center"><span className="w-1.5 h-1.5 bg-bronze-500 rounded-full mr-2"></span>Heat Resistant</span>
                  <span className="flex items-center"><span className="w-1.5 h-1.5 bg-bronze-500 rounded-full mr-2"></span>Corrosion Proof</span>
                  <span className="flex items-center"><span className="w-1.5 h-1.5 bg-bronze-500 rounded-full mr-2"></span>Exhausts & Frames</span>
                  <span className="flex items-center"><span className="w-1.5 h-1.5 bg-bronze-500 rounded-full mr-2"></span>Custom Finishes</span>
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2">
                <BeforeAfterSlider
                  beforeImage={contactInfo?.cerakoteBeforeUrl || "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800"}
                  afterImage={contactInfo?.cerakoteAfterUrl || "https://images.nicindustries.com/cerakote/projects/92676/harley-davidson-rims-in-gold-high-gloss-clear-coat-thumbnail.jpg?1690947983&size=450"}
                  alt="Cerakote Transformation"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-garage-950/90 via-garage-950/20 to-transparent pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Standard Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="relative h-[200px] cursor-pointer group perspective"
              onClick={() => setFlippedId(flippedId === service.id ? null : service.id)}
            >
              <div
                className="w-full h-full transition-all duration-500 preserve-3d"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flippedId === service.id ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Front Face */}
                <div
                  className="absolute inset-0 backface-hidden bg-garage-950 p-6 border border-garage-800 hover:border-bronze-600/50 transition-colors flex flex-col"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-garage-500 group-hover:text-bronze-500 transition-colors">
                      {icons[service.icon] || icons['Wrench']}
                    </div>
                    <div className="h-[1px] flex-1 bg-garage-800 ml-4 group-hover:bg-bronze-900 transition-colors"></div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-garage-400 text-xs leading-relaxed">{service.description}</p>
                </div>

                {/* Back Face */}
                <div
                  className="absolute inset-0 backface-hidden bg-garage-900 p-6 border border-bronze-500 flex flex-col items-center justify-center text-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <h3 className="text-white font-bold uppercase mb-4">Interested?</h3>
                  <a
                    href="https://wa.link/b4y8g6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-bronze-600 hover:bg-bronze-500 text-white px-6 py-2 rounded-sm text-sm font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-transform"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Book Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Services;
