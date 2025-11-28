import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ContactInfo } from '../types';
import Logo from './Logo';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void; // Kept for compatibility but unused internally
  contactInfo?: ContactInfo;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, contactInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path: string, hash?: string) => {
    setIsOpen(false);

    if (path === '/' && hash) {
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for navigation to complete before scrolling
        setTimeout(() => {
          const element = document.querySelector(hash);
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        const element = document.querySelector(hash);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
      navigate(path);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-garage-950/90 backdrop-blur-md border-b border-garage-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center group cursor-pointer" onClick={() => handleNavClick('/')}>
            <div className="relative flex-shrink-0 text-bronze-500 mr-3">
              <Logo
                className="h-14 w-14 text-garage-400 group-hover:text-bronze-500 transition-colors duration-500"
                logoUrl={contactInfo?.logoUrl}
              />
            </div>
            <div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-wider text-white leading-none">HELIX</span>
                <span className="text-xs font-light tracking-[0.3em] text-garage-400 leading-none mt-1">MOTORCYCLES</span>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button
                onClick={() => handleNavClick('/')}
                className={`${location.pathname === '/' ? 'text-white' : 'text-garage-300'} hover:text-bronze-500 px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                HOME
              </button>
              <Link
                to="/services"
                className={`${location.pathname === '/services' ? 'text-white' : 'text-garage-300'} hover:text-bronze-500 px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                SERVICES
              </Link>
              <Link
                to="/projects"
                className={`${location.pathname === '/projects' ? 'text-white' : 'text-garage-300'} hover:text-bronze-500 px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                PROJECTS
              </Link>
              <Link
                to="/cerakote"
                className={`${location.pathname === '/cerakote' ? 'text-white' : 'text-garage-300'} hover:text-bronze-500 px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                CERAKOTE
              </Link>
              <a
                href="https://wa.link/b4y8g6"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-bronze-600 hover:bg-bronze-500 text-white px-4 py-2 rounded-sm text-sm font-bold skew-x-[-10deg] transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(205,127,50,0.3)]"
              >
                <span className="skew-x-[10deg] inline-block">BOOK INSPECTION</span>
              </a>
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-garage-400 hover:text-white hover:bg-garage-800 focus:outline-none"
            >
              {isOpen ? (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-garage-900 border-b border-garage-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => handleNavClick('/', '#helix')} className="text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">HOME</button>
            <Link to="/services" onClick={() => setIsOpen(false)} className="text-garage-300 block px-3 py-2 rounded-md text-base font-medium w-full text-left">SERVICES</Link>
            <Link to="/projects" onClick={() => setIsOpen(false)} className="text-garage-300 block px-3 py-2 rounded-md text-base font-medium w-full text-left">PROJECTS</Link>
            <Link to="/cerakote" onClick={() => setIsOpen(false)} className="text-garage-300 block px-3 py-2 rounded-md text-base font-medium w-full text-left">CERAKOTE</Link>
            <button onClick={() => handleNavClick('/', '#contact')} className="text-bronze-500 block px-3 py-2 rounded-md text-base font-medium w-full text-left">CONTACT</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
