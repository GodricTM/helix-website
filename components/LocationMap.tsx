import React, { useEffect, useRef } from 'react';

// Declare the global Leaflet variable loaded via script tag
declare const L: any;

// Coordinates for Stratford-on-Slaney (High St) / W91 KV20
// Updated to specific coordinates: 52.988368, -6.674094
const LOCATION_COORDS: [number, number] = [52.988368, -6.674094]; // [Lat, Lng] for Leaflet

const LocationMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return;

    if (typeof window !== 'undefined' && (window as any).L) {
      
      // 1. Define Base Layers
      
      // Dark Matter (Default)
      const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      });

      // OpenStreetMap (Street View)
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      });

      // Satellite Hybrid (Esri Imagery + CartoDB Labels)
      const satelliteBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
      });
      
      const satelliteLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      });
      
      const satelliteHybrid = L.layerGroup([satelliteBase, satelliteLabels]);


      // 2. Initialize Leaflet Map
      map.current = L.map(mapContainer.current, {
        center: LOCATION_COORDS,
        zoom: 19, // Zoomed in for exact location
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: false,
        layers: [darkLayer] // Default layer
      });

      // 3. Add Layer Control
      const baseMaps = {
        "Dark Matter": darkLayer,
        "Street View": streetLayer,
        "Satellite Hybrid": satelliteHybrid
      };

      L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map.current);


      // 4. Create Custom Bronze Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="position: relative; width: 40px; height: 40px; transform: translate(-25%, -25%);">
            <svg viewBox="0 0 24 24" fill="#cd7f32" stroke="#1c1917" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3" fill="#1c1917"></circle>
            </svg>
          </div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -35]
      });

      // 5. Add Marker
      const marker = L.marker(LOCATION_COORDS, { icon: customIcon }).addTo(map.current);

      const popupContent = `
        <div style="font-family: 'Oswald', sans-serif;">
          <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 4px; color: #cd7f32;">HELIX MOTORCYCLES</h3>
          <p style="font-family: 'Roboto Mono', monospace; font-size: 11px; color: #d6d3d1; line-height: 1.4; margin: 0;">
            High Street, Stratford-on-Slaney<br/>
            Co. Wicklow, W91 KV20
          </p>
        </div>
      `;

      marker.bindPopup(popupContent).openPopup();

      // 6. Add Tooltip Annotation
      // Permanent text label
      marker.bindTooltip("HELIX MOTORCYCLES", {
        permanent: true,
        direction: 'top',
        className: 'custom-tooltip',
        offset: [0, -38]
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <section className="bg-garage-950 border-t border-garage-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white uppercase tracking-tight mb-2">Find The Garage</h2>
            <div className="h-1 w-16 bg-bronze-500 mx-auto"></div>
            <p className="mt-3 text-garage-400 font-mono text-sm">Helix Motorcycles, High Street, Stratford-on-Slaney, Co. Wicklow, W91 KV20</p>
        </div>
        
        <div className="relative h-[400px] w-full rounded-sm overflow-hidden border border-garage-700 shadow-2xl bg-garage-900 z-0">
          <div ref={mapContainer} className="absolute inset-0 z-0" />
          
          {/* Overlay gradient for smooth integration (only visible on Dark layer really, but adds depth) */}
          <div className="absolute inset-0 pointer-events-none border-inset border-2 border-bronze-500/10 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] z-10"></div>
        </div>
        
        <div className="mt-8 flex justify-center">
             <a 
                href="https://www.google.com/maps/dir/?api=1&destination=52.988368,-6.674094"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-bronze-500 hover:text-white transition-colors font-mono text-sm group border border-bronze-900 bg-bronze-900/10 px-6 py-3 rounded-sm hover:bg-bronze-900/30"
             >
                <svg className="mr-2 h-4 w-4 transform group-hover:-translate-y-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
                Get Directions on Google Maps
             </a>
        </div>
      </div>
    </section>
  );
};

export default LocationMap;