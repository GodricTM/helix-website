
export enum ServiceCategory {
  CERAKOTE = 'Cerakote',
  REBUILD = 'Rebuild',
  MAINTENANCE = 'Maintenance',
  CUSTOM = 'Custom'
}

export interface Project {
  id: string;
  name: string;
  category: ServiceCategory;
  serviceDetails: string;
  image: string;
  description: string;
  completedDate: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string; // Using Lucide icon names
  isSpecialty?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface ContactInfo {
  owner: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  offer: string;
  // New Editable Content
  helixTitle?: string;
  helixTitleHighlight?: string;
  helixTitleEffect?: 'none' | 'idle' | 'heat' | 'underglow' | 'ignition' | 'rev' | 'carbon';
  helixSubtitle?: string;
  helixSubtitleHighlight?: string;
  helixTagline?: string;
  helixTextEffect?: 'none' | 'idle' | 'heat' | 'underglow' | 'ignition' | 'rev' | 'carbon';
  helixDescription?: string;
  helixVideoUrl?: string;
  aboutText?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialWhatsapp?: string;
  openingHoursSpec?: OpeningHoursSpec;
  sectionOrder?: string[];
  cerakoteBeforeUrl?: string;
  cerakoteAfterUrl?: string;
  logoUrl?: string;
  showReviews?: boolean;
  theme?: 'midnight' | 'stealth' | 'vintage' | 'neon' | 'forest' | 'ocean';
  layoutStyle?: 'default' | 'minimal';
  promotionEnabled?: boolean;
  promotionText?: string;
}

export interface OpeningHoursSpec {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  weekends: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}

export interface Message {
  id: string;
  created_at: string;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read';
  is_archived?: boolean;
}
