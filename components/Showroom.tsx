
import React from 'react';
import { Project } from '../types';
import Lightbox from './Lightbox';

interface ShowroomProps {
  projects: Project[];
  onViewAll: () => void;
}

const Showroom: React.FC<ShowroomProps> = ({ projects, onViewAll }) => {
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  // Only show the first 2 projects as a teaser on the homepage
  const teaserProjects = projects.slice(0, 2);

  return (
    <section id="gallery" className="py-20 bg-garage-950 relative">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-bronze-600/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-garage-800 pb-6">
          <div>
            <h2 className="text-4xl font-bold text-white uppercase tracking-tight mb-2">Featured Work</h2>
            <p className="text-garage-400 font-mono">Highlights from the Helix workshop.</p>
          </div>

          <div className="mt-6 md:mt-0">
            <button
              onClick={onViewAll}
              className="group flex items-center text-bronze-500 font-bold uppercase tracking-wider text-sm hover:text-white transition-colors"
            >
              View Full Gallery
              <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {teaserProjects.map((project) => (
            <div
              key={project.id}
              className="group relative bg-garage-900 border border-garage-800 hover:border-bronze-600 transition-all duration-300 flex flex-col md:flex-row h-full overflow-hidden rounded-sm cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <div className="w-full md:w-2/5 relative overflow-hidden">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-64 md:h-full object-cover transform group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-garage-900 via-transparent to-transparent md:bg-gradient-to-r opacity-90" />
              </div>

              <div className="p-6 flex-grow flex flex-col justify-between w-full md:w-3/5">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-block bg-garage-800 text-bronze-500 text-xs font-bold px-2 py-1 uppercase tracking-wider">
                      {project.category}
                    </span>
                    <div className="flex items-center text-garage-500 text-xs font-mono">
                      <svg className="mr-1 h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
                      </svg>
                      {project.completedDate}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{project.name}</h3>
                  <h4 className="text-sm font-bold text-garage-300 uppercase mb-4 border-b border-garage-800 pb-2">
                    {project.serviceDetails}
                  </h4>

                  <p className="text-garage-400 text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Lightbox
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        image={selectedProject?.image || ''}
        title={selectedProject?.name || ''}
      />
    </section>
  );
};

export default Showroom;
