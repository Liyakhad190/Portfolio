import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa';
import apiService from '../services/api';

const ProjectsFromDB = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const data = await apiService.getProjects();
        if (data) {
          setProjects(data);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 dark:border-white/10 border-white/10 dark:border-t-white border-t-white rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 dark:bg-white/10 bg-white/10 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-6 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <p className="text-red-400 font-semibold mb-2">Failed to load projects</p>
          <p className="text-red-300/70 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-8 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
          <p className="text-slate-400 text-lg">No projects found</p>
          <p className="text-slate-500 text-sm mt-2">Add some projects in your Supabase database!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <AnimatePresence>
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-2xl dark:bg-[#111111]/50 bg-slate-900/50 border dark:border-[#444444]/30 border-slate-800/50 dark:hover:border-white/30 hover:border-white/50/50 transition-all duration-500 shadow-lg dark:hover:shadow-white/5 hover:shadow-cyan-500/20"
            whileHover={{ y: -8 }}
          >
            {/* Image Container */}
            {project.image_url && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                
                {/* Featured Badge */}
                {project.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1.5 text-xs font-bold rounded-full dark:bg-gradient-to-r dark:from-white dark:to-slate-400 dark:text-black bg-gradient-to-r from-white to-slate-300 text-slate-900 shadow-lg">
                      ⭐ Featured
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-3 dark:group-hover:text-[#cccccc] group-hover:text-white/60 transition-colors line-clamp-2">
                {project.title}
              </h3>

              {project.description && (
                <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>
              )}

              {/* Tags */}
              {project.tags && Array.isArray(project.tags) && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs font-medium rounded-full dark:bg-white/10 bg-white/8 dark:text-slate-300 text-white/70 border dark:border-white/20 border-white/50/20 dark:hover:bg-white/20 hover:bg-white/15 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Links */}
              <div className="flex gap-3 mt-4">
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2.5 dark:bg-gradient-to-r dark:from-[#444444] dark:to-[#888888] dark:hover:from-[#555555] dark:hover:to-[#999999] bg-gradient-to-r from-slate-700 to-slate-800 hover:from-cyan-500 hover:to-cyan-600 text-white rounded-lg text-center text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg dark:hover:shadow-[#888888]/10 hover:shadow-white/10"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                    <span>Live Demo</span>
                  </a>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg text-center text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-slate-700/50"
                  >
                    <FaGithub className="text-base" />
                    <span>Code</span>
                  </a>
                )}
              </div>
            </div>

            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-transparent to-white/0 group-hover:from-white/5 dark:group-hover:from-white/5 group-hover:to-white/5 dark:group-hover:to-white/5 transition-all duration-500 pointer-events-none rounded-2xl"></div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsFromDB;
