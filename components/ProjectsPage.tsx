
import React, { useState } from 'react';
import { ServiceCategory, Project } from '../types';
import Lightbox from './Lightbox';

interface ProjectsPageProps {
  projects: Project[];
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ projects }) => {
  const [filter, setFilter] = useState<ServiceCategory | 'ALL'>('ALL');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = filter === 'ALL'
    ? projects
    : projects.filter(p => p.category === filter);

  return (
    <div className="bg-garage-950 min-h-screen pt-20">
      {/* Page Header */}
      <div className="bg-garage-900 border-b border-garage-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight mb-4">
            Project <span className="text-bronze-500">Gallery</span>
          </h1>
          <p className="text-garage-400 font-mono max-w-2xl mx-auto">
            A comprehensive collection of our custom builds, restorations, and specialized finishes.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-6 py-2 text-sm font-bold uppercase tracking-wider border rounded-sm transition-all duration-300 ${filter === 'ALL' ? 'bg-bronze-600 border-bronze-600 text-white shadow-[0_0_15px_rgba(205,127,50,0.3)]' : 'bg-transparent border-garage-700 text-garage-400 hover:border-bronze-500 hover:text-white'}`}
          >
            All Work
          </button>
          {Object.values(ServiceCategory).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2 text-sm font-bold uppercase tracking-wider border rounded-sm transition-all duration-300 ${filter === type ? 'bg-bronze-600 border-bronze-600 text-white shadow-[0_0_15px_rgba(205,127,50,0.3)]' : 'bg-transparent border-garage-700 text-garage-400 hover:border-bronze-500 hover:text-white'}`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {filteredProjects.map((project) => (
            <div key={project.id} className="group bg-garage-900 border border-garage-800 hover:border-bronze-600 transition-all duration-300 rounded-sm overflow-hidden flex flex-col">
              <div
                className="relative h-64 overflow-hidden cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 filter grayscale group-hover:grayscale-0"
                />
                <div className="absolute top-4 right-4 bg-garage-950/90 text-bronze-500 text-xs font-bold px-3 py-1 uppercase tracking-wider border border-bronze-500/30">
                  {project.category}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                  <div className="bg-bronze-600/90 p-2 rounded-full">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-bronze-500 transition-colors">{project.name}</h3>
                  <span className="text-xs font-mono text-garage-500">{project.completedDate}</span>
                </div>

                <h4 className="text-sm font-bold text-garage-300 uppercase mb-3 pb-2 border-b border-garage-800">
                  {project.serviceDetails}
                </h4>

                <p className="text-garage-400 text-sm leading-relaxed mb-4 flex-grow">
                  {project.description}
                </p>

                <button
                  onClick={() => setSelectedProject(project)}
                  className="w-full py-2 mt-auto border border-garage-700 text-garage-400 hover:text-white hover:border-bronze-500 hover:bg-bronze-500/10 text-xs font-bold uppercase tracking-widest transition-all"
                >
                  View Details
                </button>
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
    </div>
  );
};

export default ProjectsPage;
