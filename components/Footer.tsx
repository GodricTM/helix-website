
import React from 'react';
import { ContactInfo } from '../types';
import Logo from './Logo';
import ContactForm from './ContactForm';

interface FooterProps {
  contactInfo: ContactInfo;
  onAdminClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ contactInfo, onAdminClick }) => {
  return (
    <footer id="contact" className="bg-garage-950 border-t border-garage-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <ContactForm />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <Logo className="h-16 w-16 text-bronze-500 mb-4" logoUrl={contactInfo.logoUrl} />
              <h2 className="text-2xl font-bold text-white tracking-wider uppercase leading-none">HELIX <span className="text-garage-500">MOTORCYCLES</span></h2>
            </div>
            <p className="text-garage-400 text-sm mb-6 max-w-sm leading-relaxed">
              {contactInfo.aboutText || "Co. Wicklow's specialist motorcycle garage. Expert engine rebuilds, maintenance, and custom Cerakote finishes. Owned and operated by Liam."}
            </p>
            <div className="flex space-x-4">
              {contactInfo.socialInstagram && (
                <a href={contactInfo.socialInstagram} target="_blank" rel="noopener noreferrer" className="bg-garage-900 p-2 rounded-sm text-garage-400 hover:text-bronze-500 hover:bg-garage-800 transition-all border border-garage-800 hover:border-bronze-500/30">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
              )}
              {contactInfo.socialFacebook && (
                <a href={contactInfo.socialFacebook} target="_blank" rel="noopener noreferrer" className="bg-garage-900 p-2 rounded-sm text-garage-400 hover:text-bronze-500 hover:bg-garage-800 transition-all border border-garage-800 hover:border-bronze-500/30">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              )}
              {contactInfo.socialWhatsapp && (
                <a href={contactInfo.socialWhatsapp} target="_blank" rel="noopener noreferrer" className="bg-garage-900 p-2 rounded-sm text-garage-400 hover:text-bronze-500 hover:bg-garage-800 transition-all border border-garage-800 hover:border-bronze-500/30">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold uppercase mb-4 text-sm tracking-wider">Contact</h3>
            <ul className="space-y-3 text-garage-400 text-sm">
              <li className="flex items-start">
                <svg className="mr-2 mt-1 text-bronze-500 flex-shrink-0 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <span>{contactInfo.address.replace(/, /g, ',<br/>').split('<br/>').map((line, i) => <span key={i}>{line}<br /></span>)}</span>
              </li>
              <li className="flex items-center">
                <svg className="mr-2 text-bronze-500 flex-shrink-0 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>{contactInfo.phone}</span>
              </li>
              <li className="flex items-center">
                <svg className="mr-2 text-bronze-500 flex-shrink-0 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span>{contactInfo.email}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold uppercase mb-4 text-sm tracking-wider">Opening Hours</h3>
            <ul className="space-y-2 text-garage-400 text-sm font-mono">
              {contactInfo.openingHoursSpec ? (
                <>
                  <li className="flex justify-between items-center border-b border-garage-900 pb-1">
                    <span className="flex items-center">
                      <svg className="mr-2 h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      Monday
                    </span>
                    <span className="text-white">{contactInfo.openingHoursSpec.monday}</span>
                  </li>
                  {['tuesday', 'wednesday', 'thursday', 'friday'].map((day) => (
                    <li key={day} className="flex justify-between items-center border-b border-garage-900 pb-1">
                      <span className="ml-[22px] capitalize">{day}</span>
                      <span className="text-white">{contactInfo.openingHoursSpec![day as keyof typeof contactInfo.openingHoursSpec]}</span>
                    </li>
                  ))}
                  <li className="flex justify-between items-center pt-2">
                    <span className="ml-[22px]">Weekends</span>
                    <span className="text-bronze-500">{contactInfo.openingHoursSpec.weekends}</span>
                  </li>
                </>
              ) : (
                // Fallback if no spec exists yet
                <>
                  <li className="flex justify-between items-center border-b border-garage-900 pb-1">
                    <span className="flex items-center">
                      <svg className="mr-2 h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      Monday
                    </span>
                    <span className="text-white">09:00 - 22:00</span>
                  </li>
                  {['Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                    <li key={day} className="flex justify-between items-center border-b border-garage-900 pb-1">
                      <span className="ml-[22px]">{day}</span>
                      <span className="text-white">09:00 - 22:00</span>
                    </li>
                  ))}
                  <li className="flex justify-between items-center pt-2">
                    <span className="ml-[22px]">Weekends</span>
                    <span className="text-bronze-500">By Appt.</span>
                  </li>
                </>
              )}
            </ul>
            <div className="mt-6 p-4 bg-bronze-900/10 border border-bronze-500/20 rounded-sm">
              <p className="text-bronze-500 text-xs font-bold uppercase mb-1">Free Consultation</p>
              <p className="text-garage-300 text-xs">{contactInfo.offer}</p>
            </div>
          </div>

        </div>

        <div className="border-t border-garage-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-garage-600 text-xs">
            &copy; {new Date().getFullYear()} Helix Motorcycles. All rights reserved.
          </p>
          <div className="flex items-center mt-2 md:mt-0 gap-4">
            <p className="text-garage-600 text-xs">
              Forged in Stratford-on-Slaney
            </p>
            {onAdminClick && (
              <button
                onClick={onAdminClick}
                className="text-garage-600 hover:text-bronze-500 transition-colors"
                title="Admin Login"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
