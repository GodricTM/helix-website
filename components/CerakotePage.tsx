import React, { useState } from 'react';
import { ContactInfo, CerakoteProduct, CerakoteFinish } from '../types';
import { CERAKOTE_COLORS } from '../cerakoteData';

interface CerakotePageProps {
  onBack: () => void;
  contactInfo: ContactInfo;
  products?: CerakoteProduct[];
  finishes?: CerakoteFinish[];
}

const CerakotePage: React.FC<CerakotePageProps> = ({ onBack, contactInfo, products = [], finishes = [] }) => {
  const [selectedColor, setSelectedColor] = useState<any | null>(null);

  // Use dynamic finishes if available, otherwise fallback to static data
  const displayFinishes = finishes.length > 0 ? finishes : CERAKOTE_COLORS;

  return (
    <div className="min-h-screen bg-garage-950 text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center text-bronze-500 hover:text-bronze-400 transition-colors group"
        >
          <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>

        {/* Hero Section */}
        < div className="relative rounded-2xl overflow-hidden mb-16 border border-garage-800 shadow-2xl" >
          <div className="absolute inset-0">
            <img
              src={contactInfo.cerakoteBeforeUrl || "https://images.unsplash.com/photo-1626847037657-fd3622613ce3?auto=format&fit=crop&q=80&w=2000"}
              alt="Cerakote Background"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-garage-950 via-garage-950/80 to-transparent"></div>
          </div>

          <div className="relative z-10 p-8 md:p-16 text-center">
            <div className="inline-block p-4 bg-bronze-600/20 rounded-full mb-6 backdrop-blur-sm border border-bronze-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-bronze-500"><path d="M3 3h.01" /><path d="M7 5h.01" /><path d="M11 7h.01" /><path d="M3 7h.01" /><path d="M7 9h.01" /><path d="M11 11h.01" /><rect width="4" height="4" x="15" y="5" /><path d="m19 9 2 2v10c0 .6-.4 1-1 1h-6c-.6 0-1-.4-1-1V11l2-2" /><path d="m13 14 8-2" /><path d="m13 19 8-2" /></svg>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              CERAKOTE <span className="text-bronze-500">CUSTOM FINISHES</span>
            </h1>
            <p className="text-xl text-garage-300 max-w-3xl mx-auto leading-relaxed">
              The world's leading thin-film ceramic coating technology. Unmatched corrosion resistance, chemical resistance, and durability.
            </p>
          </div>
        </div >

        {/* Content Grid */}
        < div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16" >
          <div className="space-y-8">
            <div className="bg-garage-900 p-8 rounded-xl border border-garage-800 hover:border-bronze-500/30 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="w-2 h-8 bg-bronze-500 mr-4 rounded-full"></span>
                Why Cerakote?
              </h3>
              <p className="text-garage-400 leading-relaxed mb-6">
                Cerakote is not just paint; it's a polymer-ceramic composite coating that can be applied to metals, plastics, polymers, and wood. The unique formulation used for Cerakote ceramic coating enhances a number of physical performance properties including abrasion/wear resistance, corrosion resistance, chemical resistance, impact strength, and hardness.
              </p>
              <ul className="space-y-3">
                {['Heat Resistant up to 2000°F', 'Corrosion Protection', 'Chemical Resistance', 'Extreme Durability'].map((item, i) => (
                  <li key={i} className="flex items-center text-garage-300">
                    <svg className="w-5 h-5 text-bronze-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-garage-900 p-8 rounded-xl border border-garage-800 hover:border-bronze-500/30 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="w-2 h-8 bg-bronze-500 mr-4 rounded-full"></span>
                Applications
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-garage-950 rounded-lg text-center border border-garage-800">
                  <span className="block text-bronze-400 font-bold mb-1">Exhausts</span>
                  <span className="text-xs text-garage-500">High Temp Series</span>
                </div>
                <div className="p-4 bg-garage-950 rounded-lg text-center border border-garage-800">
                  <span className="block text-bronze-400 font-bold mb-1">Engine Parts</span>
                  <span className="text-xs text-garage-500">Heat Dissipation</span>
                </div>
                <div className="p-4 bg-garage-950 rounded-lg text-center border border-garage-800">
                  <span className="block text-bronze-400 font-bold mb-1">Frames</span>
                  <span className="text-xs text-garage-500">Durability</span>
                </div>
                <div className="p-4 bg-garage-950 rounded-lg text-center border border-garage-800">
                  <span className="block text-bronze-400 font-bold mb-1">Components</span>
                  <span className="text-xs text-garage-500">Custom Colors</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-garage-900 p-2 rounded-xl border border-garage-800 h-full min-h-[400px]">
              <img
                src={contactInfo.cerakoteAfterUrl || "https://images.nicindustries.com/cerakote/projects/92676/harley-davidson-rims-in-gold-high-gloss-clear-coat-thumbnail.jpg?1690947983&size=450"}
                alt="Cerakote Example"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div >

        {/* Popular Colors */}
        < div className="mb-16" >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Popular C-Series Finishes</h2>
            <div className="h-1 w-20 bg-bronze-500 mx-auto"></div>
            <p className="mt-4 text-garage-400 max-w-2xl mx-auto">
              A selection of our most requested high-temperature ceramic coatings.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayFinishes.map((color: any) => {
              const isOutOfStock = contactInfo.cerakote_stock && contactInfo.cerakote_stock[color.code] === false;
              const imageUrl = color.image_url || color.image;

              return (
                <div
                  key={color.code}
                  className={`group cursor-pointer ${isOutOfStock ? 'opacity-60' : ''}`}
                  onClick={() => setSelectedColor({ ...color, image: imageUrl })}
                  onMouseEnter={() => {
                    const img = new Image();
                    img.src = imageUrl.includes('?') ? imageUrl.replace(/size=\d+/, 'size=800') : imageUrl + '?size=800';
                  }}
                >
                  <div className="relative aspect-square rounded-full mb-4 overflow-hidden border-4 border-garage-800 shadow-xl group-hover:scale-105 transition-transform duration-300 group-hover:border-bronze-500">
                    <div
                      className={`absolute inset-0 bg-cover bg-center ${isOutOfStock ? 'grayscale' : ''}`}
                      style={{ backgroundImage: `url(${imageUrl})`, backgroundColor: '#fff' }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-white/10 pointer-events-none"></div>
                    {isOutOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <span className="text-white font-bold text-xs uppercase border border-white px-2 py-1 rounded">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h4 className="text-white font-bold text-sm group-hover:text-bronze-500 transition-colors line-clamp-1" title={color.name}>{color.name}</h4>
                    <p className="text-[10px] text-garage-500 font-mono">{color.code}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div >

      </div >

      {/* Products Section */}
      {
        products && products.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Cerakote Products</h2>
              <div className="h-1 w-20 bg-bronze-500 mx-auto"></div>
              <p className="mt-4 text-garage-400 max-w-2xl mx-auto">
                Exclusive Cerakote-finished parts and kits ready to install.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(product => (
                <div key={product.id} className="bg-garage-900 border border-garage-800 rounded-xl overflow-hidden hover:border-bronze-500/30 transition-all duration-300 group flex flex-col">
                  {product.image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white group-hover:text-bronze-500 transition-colors">{product.name}</h3>
                      {product.price && (
                        <span className="bg-bronze-600/20 text-bronze-500 px-3 py-1 rounded-full text-sm font-bold font-mono border border-bronze-500/30">
                          {product.price}
                        </span>
                      )}
                    </div>
                    <p className="text-garage-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                      {product.description}
                    </p>
                    <a
                      href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g, '')}?text=I'm interested in the ${product.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-garage-800 hover:bg-bronze-600 text-white py-3 rounded-sm font-bold uppercase text-xs tracking-wider transition-colors mt-auto"
                    >
                      Inquire Now
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }



      {/* CTA */}
      <div className="text-center bg-gradient-to-r from-bronze-900/20 to-garage-900 border border-bronze-500/20 rounded-2xl p-12">
        <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Ride?</h2>
        <p className="text-garage-300 mb-8 max-w-2xl mx-auto">
          Contact us today to discuss your project and get a quote for professional Cerakote application.
        </p>
        <a
          href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-bronze-600 hover:bg-bronze-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-bronze-500/20"
        >
          <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          Get a Quote
        </a>
      </div>

      {/* Lightbox Modal */}
      {
        selectedColor && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedColor(null)}
          >
            <div
              className="relative bg-garage-900 rounded-2xl p-8 max-w-lg w-full border border-bronze-500/30 shadow-2xl transform transition-all animate-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedColor(null)}
                className="absolute top-4 right-4 text-garage-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="rounded-lg overflow-hidden border-4 border-bronze-500 shadow-inner bg-white mb-6 mx-auto max-w-[500px]">
                <img
                  src={selectedColor.image.includes('?') ? selectedColor.image.replace(/size=\d+/, 'size=800') : selectedColor.image + '?size=800'}
                  alt={selectedColor.name}
                  className="w-full h-auto"
                />
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">{selectedColor.name}</h3>
                <p className="text-bronze-500 font-mono text-lg">{selectedColor.code}</p>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default CerakotePage;
