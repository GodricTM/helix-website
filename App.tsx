import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Helix from './components/Helix';
import Showroom from './components/Showroom';
import Services from './components/Services';
import AIGarage from './components/AIGarage';
import LocationMap from './components/LocationMap';
import Footer from './components/Footer';
import ProjectsPage from './components/ProjectsPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import RiderReviews from './components/RiderReviews';
import PromotionBanner from './components/PromotionBanner';
import {
  PROJECTS as INITIAL_PROJECTS,
  CONTACT_INFO as INITIAL_CONTACT_INFO,
  STANDARD_SERVICES as INITIAL_SERVICES
} from './constants';
import { Project, ContactInfo, ServiceItem, Review } from './types';
import { supabase } from './lib/supabase';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'projects' | 'admin_login' | 'admin_dashboard'>(() => {
    const path = window.location.pathname;
    if (path === '/admin') return 'admin_login';
    return 'home';
  });

  // Supabase State
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [contactInfo, setContactInfo] = useState<ContactInfo>(INITIAL_CONTACT_INFO);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        setCurrentPage(prev => prev === 'admin_dashboard' ? 'admin_dashboard' : 'admin_login');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch Initial Data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      console.log('App: Fetching data...');
      console.log('App: Supabase client exists?', !!supabase);

      if (!supabase) {
        console.warn('Supabase client not initialized. Using local constants.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch Projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (projectsData && !projectsError) {
          // Map snake_case DB fields to camelCase frontend types
          const mappedProjects: Project[] = projectsData.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category as any, // Cast to enum
            serviceDetails: p.service_details,
            image: p.image,
            description: p.description,
            completedDate: p.completed_date
          }));
          if (mappedProjects.length > 0) setProjects(mappedProjects);
        }

        // Fetch Services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: true });

        if (servicesData && !servicesError) {
          const mappedServices: ServiceItem[] = servicesData.map(s => ({
            id: s.id,
            title: s.title,
            description: s.description,
            icon: s.icon,
            isSpecialty: s.is_specialty
          }));
          if (mappedServices.length > 0) setServices(mappedServices);
        }

        // Fetch Contact Info
        const { data: contactData, error: contactError } = await supabase
          .from('contact_info')
          .select('*')
          .limit(1)
          .single();

        if (contactData && !contactError) {
          setContactInfo({
            owner: contactData.owner,
            phone: contactData.phone,
            email: contactData.email,
            address: contactData.address,
            hours: contactData.hours,
            offer: contactData.offer,
            // New Editable Content
            helixTitle: contactData.helix_title,
            helixTitleHighlight: contactData.helix_title_highlight,
            helixTitleEffect: contactData.helix_title_effect,
            helixSubtitle: contactData.helix_subtitle,
            helixSubtitleHighlight: contactData.helix_subtitle_highlight,
            helixTextEffect: contactData.helix_text_effect,
            helixTagline: contactData.helix_tagline,
            helixDescription: contactData.helix_description,
            helixVideoUrl: contactData.helix_video_url,
            aboutText: contactData.about_text,
            socialInstagram: contactData.social_instagram,
            socialFacebook: contactData.social_facebook,
            socialWhatsapp: contactData.social_whatsapp,
            openingHoursSpec: contactData.opening_hours_spec,
            sectionOrder: contactData.section_order || ['helix', 'services', 'showroom', 'location', 'reviews', 'ai_garage'],
            cerakoteBeforeUrl: contactData.cerakote_before_url,
            cerakoteAfterUrl: contactData.cerakote_after_url,
            logoUrl: contactData.logo_url,
            showReviews: contactData.show_reviews ?? true,
            theme: contactData.theme || 'midnight',
            layoutStyle: contactData.layout_style || 'default',
            promotionEnabled: contactData.promotion_enabled ?? false,
            promotionText: contactData.promotion_text
          });
        }

        // Fetch Reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .order('date', { ascending: false });

        if (reviewsError) throw reviewsError;

        if (reviewsData) {
          setReviews(reviewsData);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Auth Listener
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;

    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          // User is signed in
        } else {
          // User is signed out
          if (currentPage === 'admin_dashboard') {
            setCurrentPage('admin_login');
          }
        }
      });
      authListener = data;
    }

    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, [currentPage]);

  // Apply Theme
  useEffect(() => {
    const root = document.documentElement;
    const theme = contactInfo.theme || 'midnight';

    const themes = {
      midnight: {
        '--color-garage-50': '#fafaf9',
        '--color-garage-100': '#f5f5f4',
        '--color-garage-200': '#e7e5e4',
        '--color-garage-300': '#d6d3d1',
        '--color-garage-400': '#a8a29e',
        '--color-garage-500': '#78716c',
        '--color-garage-600': '#57534e',
        '--color-garage-700': '#44403c',
        '--color-garage-800': '#292524',
        '--color-garage-900': '#1c1917',
        '--color-garage-950': '#0c0a09',
        '--color-bronze-50': '#fdf8f4',
        '--color-bronze-100': '#fbf1e6',
        '--color-bronze-200': '#f5dfcc',
        '--color-bronze-300': '#ecc5a3',
        '--color-bronze-400': '#e0a373',
        '--color-bronze-500': '#cd7f32',
        '--color-bronze-600': '#a45d21',
        '--color-bronze-700': '#85471c',
        '--color-bronze-800': '#6d3a1b',
        '--color-bronze-900': '#593119',
        '--color-bronze-950': '#30190b',
      },
      stealth: {
        '--color-garage-50': '#f9fafb',
        '--color-garage-100': '#f3f4f6',
        '--color-garage-200': '#e5e7eb',
        '--color-garage-300': '#d1d5db',
        '--color-garage-400': '#9ca3af',
        '--color-garage-500': '#6b7280',
        '--color-garage-600': '#4b5563',
        '--color-garage-700': '#374151',
        '--color-garage-800': '#1f2937',
        '--color-garage-900': '#111827',
        '--color-garage-950': '#030712', // Deep Black
        '--color-bronze-50': '#f8fafc',
        '--color-bronze-100': '#f1f5f9',
        '--color-bronze-200': '#e2e8f0',
        '--color-bronze-300': '#cbd5e1',
        '--color-bronze-400': '#94a3b8',
        '--color-bronze-500': '#64748b', // Slate Blue/Grey
        '--color-bronze-600': '#475569',
        '--color-bronze-700': '#334155',
        '--color-bronze-800': '#1e293b',
        '--color-bronze-900': '#0f172a',
        '--color-bronze-950': '#020617',
      },
      vintage: {
        '--color-garage-50': '#fdfbf7',
        '--color-garage-100': '#f7f3e8',
        '--color-garage-200': '#efe5d0',
        '--color-garage-300': '#e3d1b0',
        '--color-garage-400': '#d4b689',
        '--color-garage-500': '#c49a68',
        '--color-garage-600': '#a87e51',
        '--color-garage-700': '#8b6542',
        '--color-garage-800': '#73533b',
        '--color-garage-900': '#5e4435',
        '--color-garage-950': '#3b2a22', // Warm Brown
        '--color-bronze-50': '#fffbeb',
        '--color-bronze-100': '#fef3c7',
        '--color-bronze-200': '#fde68a',
        '--color-bronze-300': '#fcd34d',
        '--color-bronze-400': '#fbbf24',
        '--color-bronze-500': '#f59e0b', // Gold
        '--color-bronze-600': '#d97706',
        '--color-bronze-700': '#b45309',
        '--color-bronze-800': '#92400e',
        '--color-bronze-900': '#78350f',
        '--color-bronze-950': '#451a03',
      },
      neon: {
        '--color-garage-50': '#fdf2f8',
        '--color-garage-100': '#fce7f3',
        '--color-garage-200': '#fbcfe8',
        '--color-garage-300': '#f9a8d4',
        '--color-garage-400': '#f472b6',
        '--color-garage-500': '#ec4899',
        '--color-garage-600': '#db2777',
        '--color-garage-700': '#be185d',
        '--color-garage-800': '#9d174d',
        '--color-garage-900': '#831843',
        '--color-garage-950': '#050505', // Black
        '--color-bronze-50': '#ecfeff',
        '--color-bronze-100': '#cffafe',
        '--color-bronze-200': '#a5f3fc',
        '--color-bronze-300': '#67e8f9',
        '--color-bronze-400': '#22d3ee',
        '--color-bronze-500': '#06b6d4', // Cyan
        '--color-bronze-600': '#0891b2',
        '--color-bronze-700': '#0e7490',
        '--color-bronze-800': '#155e75',
        '--color-bronze-900': '#164e63',
        '--color-bronze-950': '#083344',
      },
      forest: {
        '--color-garage-50': '#f2fcf5',
        '--color-garage-100': '#e3f9e9',
        '--color-garage-200': '#c6f2d3',
        '--color-garage-300': '#98e6b3',
        '--color-garage-400': '#60d18f',
        '--color-garage-500': '#3bb574',
        '--color-garage-600': '#29945b',
        '--color-garage-700': '#23754b',
        '--color-garage-800': '#1f5d3e',
        '--color-garage-900': '#1a4c35',
        '--color-garage-950': '#052e16', // Deep Green
        '--color-bronze-50': '#fefce8',
        '--color-bronze-100': '#fef9c3',
        '--color-bronze-200': '#fef08a',
        '--color-bronze-300': '#fde047',
        '--color-bronze-400': '#facc15',
        '--color-bronze-500': '#eab308', // Yellow/Gold
        '--color-bronze-600': '#ca8a04',
        '--color-bronze-700': '#a16207',
        '--color-bronze-800': '#854d0e',
        '--color-bronze-900': '#713f12',
        '--color-bronze-950': '#422006',
      },
      ocean: {
        '--color-garage-50': '#f0f9ff',
        '--color-garage-100': '#e0f2fe',
        '--color-garage-200': '#bae6fd',
        '--color-garage-300': '#7dd3fc',
        '--color-garage-400': '#38bdf8',
        '--color-garage-500': '#0ea5e9',
        '--color-garage-600': '#0284c7',
        '--color-garage-700': '#0369a1',
        '--color-garage-800': '#075985',
        '--color-garage-900': '#0c4a6e',
        '--color-garage-950': '#020410', // Deep Blue Black
        '--color-bronze-50': '#f5f3ff',
        '--color-bronze-100': '#ede9fe',
        '--color-bronze-200': '#ddd6fe',
        '--color-bronze-300': '#c4b5fd',
        '--color-bronze-400': '#a78bfa',
        '--color-bronze-500': '#8b5cf6', // Violet
        '--color-bronze-600': '#7c3aed',
        '--color-bronze-700': '#6d28d9',
        '--color-bronze-800': '#5b21b6',
        '--color-bronze-900': '#4c1d95',
        '--color-bronze-950': '#2e1065',
      }
    };

    const selectedTheme = themes[theme as keyof typeof themes] || themes.midnight;

    Object.entries(selectedTheme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

  }, [contactInfo.theme]);

  // Force scroll to top on initial page load / refresh
  useEffect(() => {
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  const navigateTo = (page: 'home' | 'projects' | 'admin_login') => {
    setCurrentPage(page);
    if (page === 'admin_login') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogin = async () => {
    if (!supabase) {
      alert("Database connection failed. Cannot login.");
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setCurrentPage('admin_dashboard');
    }
  };

  const handleAdminLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentPage('home');
    window.history.pushState({}, '', '/');
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-garage-950 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-garage-800 border-t-bronze-500 rounded-full animate-spin mb-4"></div>
        <p className="font-mono text-garage-400 animate-pulse">INITIALIZING HELIX SYSTEM...</p>
      </div>
    );
  }

  // Render Admin Pages
  if (currentPage === 'admin_login') {
    return <AdminLogin onLogin={handleAdminLogin} />;
  }

  if (currentPage === 'admin_dashboard') {
    return (
      <AdminDashboard
        projects={projects}
        onUpdateProjects={setProjects}
        contactInfo={contactInfo}
        onUpdateContact={setContactInfo}
        services={services}
        onUpdateServices={setServices}
        onLogout={handleAdminLogout}
      />
    );
  }

  // Render Main Website
  return (
    <div className={`min-h-screen bg-garage-950 text-white font-sans selection:bg-bronze-500 selection:text-white ${contactInfo.layoutStyle === 'minimal' ? 'layout-minimal' : ''}`}>

      {/* Promotion Banner */}
      {contactInfo.promotionEnabled && contactInfo.promotionText && (
        <PromotionBanner text={contactInfo.promotionText} />
      )}

      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        contactInfo={contactInfo}
      />

      {/* Scroll Buttons Container */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {/* Scroll to Top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-bronze-600 hover:bg-bronze-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
          title="Scroll to Top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>

        {/* Scroll to Bottom */}
        <button
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          className="bg-garage-800 hover:bg-garage-700 text-garage-300 hover:text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group border border-garage-700"
          title="Scroll to Bottom"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>

      <main>
        {currentPage === 'home' ? (
          <>
            {/* Dynamic Section Rendering */}
            {/* Dynamic Section Rendering */}
            {(() => {
              const defaultOrder = ['helix', 'services', 'showroom', 'location', 'reviews', 'ai_garage'];
              const currentOrder = contactInfo.sectionOrder || defaultOrder;
              // Ensure all known sections are present (append missing ones)
              const finalOrder = [...new Set([...currentOrder, ...defaultOrder])];

              return finalOrder.map(section => {
                switch (section) {
                  case 'helix': return <Helix key="helix" contactInfo={contactInfo} />;
                  case 'services': return <Services key="services" services={services} contactInfo={contactInfo} />;
                  case 'showroom': return <Showroom key="showroom" projects={projects} onViewAll={() => navigateTo('projects')} />;
                  case 'location':
                    return <LocationMap key={section} />;
                  case 'reviews':
                    return contactInfo.showReviews !== false ? <RiderReviews key={section} reviews={reviews} /> : null;
                  case 'ai_garage':
                    return <AIGarage key={section} contactInfo={contactInfo} />;
                  default:
                    return null;
                }
              });
            })()}
          </>
        ) : (
          <ProjectsPage projects={projects} />
        )}
      </main>
      <Footer contactInfo={contactInfo} onAdminClick={() => navigateTo('admin_login')} />
    </div >
  );
}

export default App;
