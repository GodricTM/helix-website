import { Project, ServiceCategory, ServiceItem } from './types';

export const CONTACT_INFO = {
  owner: "Liam",
  phone: "+353 87 373 5709",
  email: "liam@helixmotorcycles.com",
  address: "High Street, Stratford-on-Slaney, Co. Wicklow, W91 KV20",
  hours: "Mon – Fri: 09:00 – 22:00",
  offer: "Free Consultation: Quick inspection of any issues present on your motorcycle.",
  openingHoursSpec: {
    monday: "09:00 - 22:00",
    tuesday: "09:00 - 22:00",
    wednesday: "09:00 - 22:00",
    thursday: "09:00 - 22:00",
    friday: "09:00 - 22:00",
    weekends: "By Appt."
  },
  sectionOrder: ['helix', 'services', 'showroom', 'location', 'ai_garage'],
  showExtraVideos: true
};

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Ducati Panigale V4',
    category: ServiceCategory.CERAKOTE,
    serviceDetails: 'Full Exhaust Cerakote (Glacier Black)',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
    description: 'High-temp ceramic coating applied to headers and exhaust system for superior heat management and durability.',
    completedDate: 'Oct 2023',
  },
  {
    id: 'p2',
    name: 'Honda CB750',
    category: ServiceCategory.REBUILD,
    serviceDetails: 'Full Engine Rebuild & Blueprint',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
    description: 'Complete tear-down, valve clearance adjustment, carb tuning, and gasket replacement.',
    completedDate: 'Dec 2023',
  },
  {
    id: 'p3',
    name: 'Yamaha MT-07',
    category: ServiceCategory.MAINTENANCE,
    serviceDetails: 'Tyres, Chain & Oil Service',
    image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=800',
    description: 'Routine maintenance package including wheel balancing, chain tensioning, and high-performance oil change.',
    completedDate: 'Jan 2024',
  },
  {
    id: 'p4',
    name: 'Custom Scrambler',
    category: ServiceCategory.CUSTOM,
    serviceDetails: 'Frame Powder Coat & Fabrication',
    image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&q=80&w=800',
    description: 'Subframe modification and chassis refinishing for a rugged off-road aesthetic.',
    completedDate: 'Nov 2023',
  },
];

export const SPECIALTY_SERVICES: ServiceItem[] = [
  {
    id: 's_spec_1',
    title: 'Cerakote Spray Painting',
    description: 'Specializing in ceramic coatings for fairings, engine parts, exhausts, and frames. Provides durable, heat-resistant, and corrosion-proof finishes.',
    icon: 'SprayCan',
    isSpecialty: true
  }
];

export const STANDARD_SERVICES: ServiceItem[] = [
  { id: 's1', title: 'Engine Rebuild', description: 'Comprehensive engine strip-down and rebuilding.', icon: 'Wrench' },
  { id: 's2', title: 'Tyre Replacement + Wheel Balancing', description: 'Expert fitting and precision balancing.', icon: 'Disc' },
  { id: 's3', title: 'Oil + Filter', description: 'High-quality oil and filter changes.', icon: 'Droplet' },
  { id: 's4', title: 'Air Filter', description: 'Replacement or cleaning for optimal airflow.', icon: 'Wind' },
  { id: 's5', title: 'Brake Pads & Fluids', description: 'Safety-critical brake maintenance.', icon: 'Activity' },
  { id: 's6', title: 'Caliper Rebuild', description: 'Restoring braking performance.', icon: 'CircleDot' },
  { id: 's7', title: 'Carb Tuning & Cleaning', description: 'Ultrasonic cleaning and synchronization.', icon: 'Settings' },
  { id: 's8', title: 'Valve Clearances', description: 'Adjustment for engine longevity.', icon: 'Gauge' },
  { id: 's9', title: 'Chain Maintenance', description: 'Cleaning, tensioning, and lubrication.', icon: 'Link' },
  { id: 's10', title: 'Spark Plugs', description: 'Ignition system service.', icon: 'Zap' },
  { id: 's11', title: 'Cable Tensioning', description: 'Throttle and clutch cable adjustment.', icon: 'ChevronsUp' },
];