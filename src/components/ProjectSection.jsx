// src/components/ProjectSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useTime, useTransform } from "framer-motion";
import {
  FaExternalLinkAlt, FaReact, FaNodeJs, FaHtml5, FaCss3Alt,
  FaJsSquare, FaTools, FaFigma, FaGithub, FaTimes, FaDownload,
  FaChevronLeft, FaChevronRight, FaCube, FaRocket
} from 'react-icons/fa';
import {
  SiTailwindcss, SiNextdotjs, SiVercel, SiMongodb,
  SiExpress, SiPostgresql, SiSupabase, SiNetlify, SiFramer, SiAndroidstudio
} from 'react-icons/si';
import { PiCodeBold } from "react-icons/pi";
import { VscCode } from "react-icons/vsc";
import { LuBadge } from "react-icons/lu";
import { LiaLayerGroupSolid } from "react-icons/lia";
import { useNavbar } from '../contexts/NavbarContext';
import ProjectMotionGraphic from './ProjectMotionGraphic';
import { VelocityScroll } from './VelocityScroll';
import InteractiveFolderGallery from './InteractiveFolderGallery';
import VariableProximity from './VariableProximity';

// ===================================
// DATA FROM JSON
// ===================================
import projectsData from '../data/projects.json';
import certificatesData from '../data/certificates.json';


const techStack = {
  frontend: [
    { name: "React", level: 90, icon: <FaReact className="text-[#61DAFB]" /> },
    { name: "Next.js", level: 85, icon: <SiNextdotjs className="dark:text-white text-slate-900" /> },
    { name: "JavaScript", level: 95, icon: <FaJsSquare className="text-[#F7DF1E]" /> },
    { name: "Tailwind CSS", level: 90, icon: <SiTailwindcss className="text-[#38B2AC]" /> },
    { name: "HTML5", level: 95, icon: <FaHtml5 className="text-[#E34F26]" /> },
    { name: "CSS3", level: 90, icon: <FaCss3Alt className="text-[#1572B6]" /> },
    { name: "Framer Motion", level: 80, icon: <SiFramer className="text-[#0055FF]" /> },
  ],
  backend: [
    { name: "Node.js", level: 85, icon: <FaNodeJs className="text-[#339933]" /> },
    { name: "Express", level: 80, icon: <SiExpress className="dark:text-white text-slate-900" /> },
  ],
  database: [
    { name: "MongoDB", level: 80, icon: <SiMongodb className="text-[#47A248]" /> },
    { name: "PostgreSQL", level: 75, icon: <SiPostgresql className="text-[#336791]" /> },
    { name: "Supabase", level: 85, icon: <SiSupabase className="text-[#3ECF8E]" /> },
  ],
  tools: [
    { name: "Git & GitHub", level: 90, icon: <FaGithub className="dark:text-white text-slate-900" /> },
    { name: "Vercel", level: 85, icon: <SiVercel className="dark:text-white text-slate-900" /> },
    { name: "Figma", level: 75, icon: <FaFigma className="text-[#F24E1E]" /> },
    { name: "Netlify", level: 85, icon: <SiNetlify className="text-[#00C7B7]" /> },
    { name: "Spline", level: 70, icon: <FaCube className="dark:text-white text-slate-900" /> },
    { name: "VS Code", level: 95, icon: <VscCode className="text-[#007ACC]" /> },
    { name: "Google Android Studio", level: 75, icon: <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Android_Studio_icon_%282023%29.svg" alt="Android Studio" loading="lazy" decoding="async" className="w-6 h-6 object-contain" /> },
    { name: "Antigravity", level: 100, icon: <FaRocket className="text-[#9333ea]" /> },
  ],
};

// ===================================
// HELPER & ANIMATION COMPONENTS
// ===================================
const LineShadowText = ({ children, className, shadowColor = "#888888", ...props }) => {
  return (
    <motion.span
      style={{ "--shadow-color": shadowColor }}
      className={`relative z-0 line-shadow-effect ${className}`}
      data-text={children}
      {...props}
    >
      {children}
    </motion.span>
  );
};

// ===================================
// KOMPONEN KARTU SERTIFIKAT
// ===================================
const CertificateCard = ({ cert, onClick }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative cursor-pointer"
      whileHover={{ y: -8 }}
      onClick={() => onClick(cert)}
    >
      <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden dark:shadow-lg shadow-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/50/30 transition-all duration-500">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-slate-900/30 group-hover:from-slate-900/95 transition-all duration-500"></div>
        </div>
        <div className="absolute inset-0 p-5 flex flex-col justify-between">
          <div className="flex-1 flex items-start justify-between">
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
              <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">{cert.issuer}</span>
            </div>
            <div className="bg-white/8 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
              <span className="text-xs font-bold text-slate-300">{cert.date}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-2 leading-tight">{cert.title}</h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-300">
                <FaDownload className="text-sm" />
                <span className="text-sm font-medium">View Certificate</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/50/30">
                  <FaExternalLinkAlt className="text-white/70 text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 via-transparent to-white/0 group-hover:from-white/8 group-hover:to-white/8 transition-all duration-500"></div>
      </div>
    </motion.div>
  );
};

// ===================================
// KOMPONEN KARTU SERTIFIKAT BESAR
// ===================================
const BigCertificateCard = ({ cert, onClick }) => {
  return (
    <div
      onClick={() => onClick(cert)}
      className="w-full h-[400px] rounded-2xl bg-[#111111] border border-slate-800/50 hover:border-white/50 transition-colors duration-500 shadow-2xl overflow-hidden cursor-pointer flex flex-col group"
    >
      <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-950 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/80 to-transparent"></div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
          {cert.title}
        </h3>
        <p className="text-white/70 text-sm font-semibold mb-1">{cert.issuer}</p>
        {cert.date && (
          <p className="text-slate-300 text-xs font-medium mb-4">
            {cert.date}
          </p>
        )}

        <div className="flex items-center justify-between text-slate-400 text-sm mt-auto">
          <span className="flex items-center gap-2">
            <FaDownload className="text-xs" />
            Click to View
          </span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <FaExternalLinkAlt className="text-white/80" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================================
// KOMPONEN PREVIEW MODAL PROYEK
// ===================================
const ProjectDetailModal = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-12"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative max-w-7xl w-full h-full max-h-[90vh] bg-[#080808] border border-white/10 overflow-hidden flex flex-col rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Editorial Top Bar */}
        <div className="w-full flex justify-between items-center px-8 py-6 border-b border-white/20">
          <div className="font-moderniz text-white/50 text-sm tracking-widest uppercase">Project Detail</div>
          <button onClick={onClose} className="text-white hover:text-cyan-400 uppercase tracking-widest text-xs font-bold transition-colors flex items-center gap-2">
            Close <FaTimes />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 md:p-16 flex flex-col">
            
            {/* Massive Title */}
            <h2 className="text-5xl md:text-7xl lg:text-9xl font-black text-white tracking-tighter mb-12 leading-[0.9] font-moderniz">
              {project.title}
            </h2>

            {/* Divider */}
            <div className="w-full h-[1px] bg-white/20 mb-12"></div>

            {/* Content Grid (Metadata + Description) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
              
              {/* Left Column: Metadata */}
              <div className="lg:col-span-4 flex flex-col gap-8">
                <div className="flex flex-col">
                  <span className="text-white/40 text-[11px] uppercase tracking-widest font-bold mb-2">Category</span>
                  <span className="text-white text-base font-cascadia">{project.category || "Project"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white/40 text-[11px] uppercase tracking-widest font-bold mb-2">Tech Stack</span>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {project.tech.map((t, i) => (
                      <span key={i} className="text-white text-base font-cascadia">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Description & Actions */}
              <div className="lg:col-span-8 flex flex-col gap-10">
                <p className="text-slate-300 text-2xl md:text-3xl font-cascadia leading-relaxed font-light">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-6 pt-8 border-t border-white/10">
                  {project.link !== '#' && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 text-white uppercase tracking-widest text-sm font-bold hover:text-cyan-400 transition-colors"
                    >
                      Live Demo <FaExternalLinkAlt />
                    </a>
                  )}
                  {/* Using project.link as fallback for github if not explicitly set, 
                      or change this if you have a real github field in db */}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 text-white uppercase tracking-widest text-sm font-bold hover:text-cyan-400 transition-colors"
                    >
                      Source Code <FaGithub />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Massive Editorial Image */}
            <div className="w-full relative">
              <img src={project.image} alt={project.title} className="w-full h-auto object-cover border border-white/10 rounded-none" />
            </div>

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ===================================
// ===================================
// KOMPONEN PREVIEW MODAL ORBIT (Simplified for Performance)
// ===================================
// Sub-component to correctly manage per-card hover state in the orbit modal
const OrbitProjectCard = ({ p, i, onProjectClick, customClass = "", onHoverChange }) => {
  const [cardHovered, setCardHovered] = React.useState(false);
  return (
    <motion.div
      key={p.id || i}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: i * 0.1 }}
      className={customClass || "w-full sm:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2rem)]"}
    >
      <div
        className="w-full h-80 bg-neutral-900 border border-white/20 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.05] hover:-translate-y-2 cursor-pointer hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] flex flex-col"
        onClick={() => onProjectClick(p)}
        onMouseEnter={() => { setCardHovered(true); if(onHoverChange) onHoverChange(true); }}
        onMouseLeave={() => { setCardHovered(false); if(onHoverChange) onHoverChange(false); }}
      >
        <div className="w-full h-[55%] relative bg-black overflow-hidden pointer-events-none">
          <img src={p.image} alt={p.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          <ProjectMotionGraphic title={p.title} isHovered={cardHovered} />
        </div>
        <div className="p-6 h-[45%] flex flex-col justify-between bg-neutral-100 pointer-events-none">
          <div>
            <h4 className="text-neutral-900 text-lg font-bold leading-tight font-cascadia">{p.title}</h4>
            <p className="text-neutral-500 text-xs mt-2 line-clamp-2">{p.description}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {p.tech.slice(0, 3).map((t, idx) => (
              <span key={idx} className="text-[10px] px-2.5 py-1 bg-neutral-200 text-neutral-800 rounded-full font-bold">{t}</span>
            ))}
            {p.tech.length > 3 && (
               <span className="text-[10px] px-2.5 py-1 bg-neutral-200 text-neutral-800 rounded-full font-bold">+{p.tech.length - 3}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StackViewModal = ({ category, onClose, onProjectClick }) => {
  const [tick, setTick] = useState(0);
  
  if (!category) return null;
  const { projects, title } = category;

  // Auto-play timer removed based on user request
  // Sliding window of cards to create an infinite stack illusion
  // We always show 8 cards to ensure the stack looks deep, even if there are only 3 real projects
  const visibleCards = Array.from({ length: 8 }).map((_, i) => {
    const globalIndex = tick + i;
    const project = projects[globalIndex % projects.length];
    return {
      ...project,
      globalIndex,
      instanceId: `card-${globalIndex}` // Unique ID so Framer Motion knows when it enters/exits the window
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#0a0a0a] flex flex-col z-[60] overflow-hidden"
    >
      {/* Background Graphic - very subtle radial gradient */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
        <div className="w-[800px] h-[800px] bg-gradient-to-b from-transparent to-cyan-900/20 rounded-full blur-3xl" />
      </div>

      {/* Close button */}
      <div className="absolute top-0 right-0 p-8 z-[70]">
        <button 
          onClick={onClose}
          className="text-white/70 hover:text-white uppercase tracking-widest text-sm font-bold flex items-center gap-2 transition-colors bg-white/10 px-4 py-2 rounded-full shadow-sm border border-white/10"
        >
          Close <FaTimes />
        </button>
      </div>

      {/* Header text - like the Pinterest reference */}
      <div className="absolute top-12 left-0 right-0 flex flex-col items-center z-50 pointer-events-none">
        <motion.h3 
          className="text-slate-400 tracking-[0.3em] text-[10px] sm:text-xs uppercase mb-2 font-bold"
        >
          {title}
        </motion.h3>
        <motion.h2 
          key={visibleCards[0].instanceId} // Re-animate text when active card changes
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl sm:text-3xl md:text-4xl font-moderniz font-bold text-white text-center h-12"
        >
          {visibleCards[0].title}
        </motion.h2>
      </div>

      {/* Pagination Dots on the right - now they just jump the tick forward */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">
        {projects.map((_, idx) => {
          const currentActiveOriginalIndex = tick % projects.length;
          const isActive = currentActiveOriginalIndex === idx;
          
          return (
            <div 
              key={idx}
              onClick={() => {
                // Calculate how many steps forward to reach the clicked dot
                let diff = idx - currentActiveOriginalIndex;
                if (diff <= 0) diff += projects.length;
                setTick(t => t + diff);
              }}
              className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-300 ${isActive ? 'bg-white scale-150' : 'bg-white/20 hover:bg-white/40'}`}
            />
          );
        })}
      </div>

      {/* 3D Stack Container */}
      <div className="w-full h-full flex items-center justify-center relative pt-40 mt-10">
        
        {/* Mobile View - Standard Grid fallback */}
        <div className="md:hidden w-full px-8 py-20 flex flex-col items-center overflow-y-auto h-full custom-scrollbar">
          <div className="flex flex-wrap justify-center gap-8 w-full mt-10">
            {projects.map((p, i) => (
              <OrbitProjectCard key={p.id || i} p={p} i={i} onProjectClick={onProjectClick} />
            ))}
          </div>
        </div>

        {/* Desktop View - Exact Pinterest Stack */}
        <div 
          className="hidden md:flex relative w-[380px] h-[260px] lg:w-[480px] lg:h-[320px]"
          style={{ perspective: '2500px' }}
        >
          <div className="w-full h-full absolute inset-0 preserve-3d" style={{ transformStyle: 'preserve-3d' }}>
            
            <AnimatePresence>
              {visibleCards.map((card, index) => {
                const isFront = index === 0;

                return (
                  <motion.div
                    key={card.instanceId}
                    onClick={() => {
                      if (isFront) onProjectClick(card);
                      else setTick(t => t + index); // Jump forward by index clicks
                    }}
                    className="absolute inset-0 rounded-2xl overflow-hidden cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.15)] bg-black"
                    
                    // Enters from the very back of the stack
                    initial={{ opacity: 0, y: -8 * 35, translateZ: -8 * 40, scale: 0.6 }}
                    
                    // Animates smoothly forward through the stack
                    animate={{
                      translateZ: -index * 40,
                      y: -index * 35,
                      scale: 1 - (index * 0.04),
                      opacity: 1 - (index * 0.05),
                    }}
                    
                    // Exits by dropping down and fading out (like the video)
                    exit={{ opacity: 0, y: 200, translateZ: 100, scale: 1.1 }}
                    
                    // Buttery smooth ease-out (no bounce) to prevent 3D clipping jitter
                    transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                    
                    style={{ 
                      zIndex: 100 - card.globalIndex, // Ensure correct depth sorting even during transit
                      transformOrigin: 'bottom center',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <img 
                      src={card.image} 
                      alt={card.title} 
                      className={`w-full h-full object-cover transition-opacity duration-500 ${isFront ? 'opacity-100' : 'opacity-80'}`} 
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                    <div className={`absolute inset-x-0 bottom-0 p-8 md:p-10 transition-opacity duration-300 ${isFront ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
                       <h4 className="text-white text-2xl font-bold font-cascadia mb-3">{card.title}</h4>
                       <p className="text-white/80 text-sm leading-relaxed line-clamp-2 mb-5">{card.description}</p>
                       <div className="flex flex-wrap gap-2">
                        {card.tech.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="text-[10px] px-3 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-full font-bold tracking-wider">{t}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ===================================
// KOMPONEN KARTU PROYEK
// ===================================
const ProjectFolder = ({ projects, categoryTitle, onClick, onOrbitClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Take up to 5 projects for the deep stack animation
  const displayProjects = projects.slice(0, 5);
  
  return (
    <div 
      className={`flex flex-col items-center transition-all duration-300 relative ${isHovered ? 'z-50' : 'z-10'}`}
      style={{ width: '100%', maxWidth: '36rem' }}
    >
      {/* Category Label — FIXED height so both headings always take same vertical space */}
      <h3
        style={{ height: '7rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '0.5rem', marginBottom: '5rem' }}
        className="w-full text-xl sm:text-2xl md:text-3xl font-moderniz font-bold text-white uppercase tracking-widest opacity-80 text-center"
      >
        {categoryTitle}
      </h3>

      {/* The 3D Folder Container — fixed pixel size, identical on both sides */}
      <div 
        className="relative cursor-pointer hover:-translate-y-2 transition-transform duration-300"
        style={{ width: '100%', maxWidth: '36rem', height: '18rem', perspective: '1500px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onOrbitClick({ projects, title: categoryTitle })}
      >
        
        {/* Back face of the folder */}
        <div className="absolute inset-0 dark:bg-[#1a1a1a] bg-slate-200 border dark:border-[#444444] border-slate-300 rounded-b-xl rounded-tr-xl shadow-lg z-0">
           {/* Tab cut-out detail simulation */}
           <div className="absolute -top-8 left-[-1px] w-[45%] h-8 dark:bg-[#1a1a1a] bg-slate-200 border-t border-l border-r dark:border-[#444444] border-slate-300 rounded-t-xl z-0"></div>
        </div>
        
        {/* The Cards inside the folder */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-b-xl rounded-tr-xl z-10" style={{ clipPath: 'inset(-1000px 0px 0px 0px)' }}>
          {displayProjects.map((p, i) => {
            // Idle state: Hidden inside the folder (folder closed)
            const idleX = 0;
            const idleY = 10;
            const idleScale = 0.85;
            const idleOpacity = 0;

            // Hover state: Contained diagonal fan that doesn't overlap the heading
            const hoverX = -60 + (i * 30);
            const hoverY = -40 - (i * 12);
            const hoverScale = 0.95 - (i * 0.02);
            const hoverRotate = -8 + (i * 4);
            
            return (
              <motion.div
                key={p.id || i}
                initial={{ y: 0, opacity: 0, scale: 0.8 }}
                animate={{
                  y: isHovered ? hoverY : idleY,
                  x: isHovered ? hoverX : idleX,
                  rotateZ: isHovered ? hoverRotate : 0,
                  opacity: isHovered ? 1 : idleOpacity,
                  scale: isHovered ? hoverScale : idleScale
                }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: i * 0.04 }}
                className="absolute w-44 h-56 md:w-56 md:h-72 bg-neutral-900 border border-white/20 rounded-xl overflow-hidden shadow-lg transition-transform duration-300"
                style={{ zIndex: 10 - i }} // Front card has highest z-index
              >
                <div className="w-full h-1/2 relative bg-black overflow-hidden">
                  <img src={p.image} alt={p.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                  <ProjectMotionGraphic title={p.title} isHovered={isHovered && i === 1} />
                </div>
                <div className="p-4 h-1/2 flex flex-col justify-between bg-neutral-100">
                  <h4 className="text-neutral-900 text-xs md:text-sm font-bold leading-tight font-cascadia">{p.title}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.tech.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-neutral-300 text-neutral-800 rounded-full font-bold">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {projects.length > 5 && (
             <motion.div
               animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? -200 : 0, x: isHovered ? 100 : 0 }}
               transition={{ duration: 0.3 }}
               className="absolute text-white/50 text-xs font-bold tracking-widest uppercase mt-4 pointer-events-none"
             >
               + {projects.length - 5} More
             </motion.div>
          )}
        </div>

        {/* Front face of the folder (Flap) */}
        <motion.div 
          className="absolute inset-0 dark:bg-[#222222] bg-slate-100 border-t border-l border-r dark:border-[#444444] border-slate-300 rounded-xl z-20 flex flex-col items-center justify-end pb-8 shadow-lg"
          style={{ transformOrigin: 'bottom' }}
          animate={{ rotateX: isHovered ? -50 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="flex items-center gap-2">
            <span className="dark:text-white text-slate-800 font-bold tracking-widest text-xl md:text-2xl drop-shadow-sm font-moderniz">EXPLORE</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
};


// ===================================
// KOMPONEN PREVIEW MODAL SERTIFIKAT
// ===================================
const CertificatePreviewModal = ({ certificate, onClose }) => {
  if (!certificate) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative max-w-4xl w-full dark:bg-slate-900/90 bg-white/95 backdrop-blur-xl rounded-3xl border dark:border-white/10 border-slate-200 shadow-2xl overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-20">
          <button onClick={onClose} className="dark:bg-black/40 bg-slate-200/80 hover:bg-red-500/20 backdrop-blur-md p-2 rounded-full dark:border-white/10 border-slate-300 hover:border-red-500/30 transition-all duration-300 group">
            <FaTimes className="dark:text-white/70 text-slate-600 group-hover:text-red-500" />
          </button>
        </div>

        {/* Image Section */}
        <div className="w-full md:w-3/5 relative min-h-[300px] md:min-h-[500px] bg-slate-900">
        </div>

        {/* Content Section */}
        <div className="w-full md:w-2/5 p-8 flex flex-col justify-center dark:bg-slate-900/50 bg-white">
          <div className="mb-6">
            <div className="inline-block px-3 py-1 rounded-full bg-white/8 border border-white/20 text-white/60 text-xs font-bold tracking-wider mb-4">
              {certificate.issuer}
            </div>
            <h2 className="text-2xl font-bold dark:text-white text-slate-900 mb-2 leading-tight">{certificate.title}</h2>
            <p className="text-slate-400 font-mono text-sm">{certificate.date}</p>
          </div>

          <div className="space-y-4 mt-auto">
            <a
              href={certificate.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-white/8 group"
            >
              <FaDownload className="group-hover:animate-bounce" />
              <span>Download / View PDF</span>
            </a>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 dark:bg-slate-800 bg-slate-200 dark:hover:bg-slate-700 hover:bg-slate-300 dark:text-slate-300 text-slate-700 font-semibold rounded-xl transition-all duration-300"
            >
              Close Preview
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ===================================
// 3D CAROUSEL COMPONENT
// ===================================


// ===================================
// KOMPONEN UTAMA SECTION PROJECT
// ===================================
function ProjectSection() {
  const [previewCertificate, setPreviewCertificate] = useState(null);
  const [previewProject, setPreviewProject] = useState(null); // ✨ NEW STATE
  const [orbitCategory, setOrbitCategory] = useState(null); // ✨ NEW ORBIT STATE
  const { hideNavbar, showNavbar } = useNavbar();
  const containerRef = useRef(null);

  // === Database States ===
  // Removing state for DB fetch since we use local JSON
  // const [projectsFromDB, setProjectsFromDB] = useState([]);
  // const [certificatesFromDB, setCertificatesFromDB] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingCerts, setLoadingCerts] = useState(false);



  useEffect(() => {
    // Hide navbar when any modal is open
    if (previewCertificate || previewProject || orbitCategory) {
      hideNavbar();
    } else {
      showNavbar();
    }
  }, [previewCertificate, previewProject, orbitCategory, hideNavbar, showNavbar]);

  useEffect(() => {
    return () => {
      showNavbar();
    };
  }, [showNavbar]);

  // Load from JSON
  const activeProjects = projectsData;

  // Transform database projects to match UI format
  const transformedProjects = activeProjects.map(p => {
    // If has UUID id, it's from database - transform it
    if (p.id && typeof p.id === 'string' && p.id.includes('-')) {
      return {
        id: p.id,
        title: p.title,
        description: p.description,
        tech: p.tags || [],
        link: p.demo_url || p.github_url || '#', // Use demo_url as primary link
        github: p.github_url, // Add specific github field
        image: p.image_url,
        category: 'Database', // All DB projects in one category
        featured: p.featured || false
      };
    }
    // Static data already in correct format
    return p;
  });

  // Filter projects by category (only applies to static dummy data)
  const webAppsProjects = transformedProjects.filter(p => p.category === 'Web/Apps' || p.category === 'Database');
  const aiVisionProjects = transformedProjects.filter(p => p.category === 'AI & IOT');

  // Use database certificates if available, fallback to static data
  const activeCertificates = certificatesData;

  return (
    <section id="project" className="py-20">

      <style>{`
        @keyframes line-shadow-anim { 0% { background-position: 0 0; } 100% { background-position: 100% 100%; } }
        .line-shadow-effect::after { content: attr(data-text); position: absolute; z-index: -1; left: 0.04em; top: 0.04em; background-image: linear-gradient(45deg, transparent 45%, var(--shadow-color) 45%, var(--shadow-color) 55%, transparent 0); background-size: 0.06em 0.06em; -webkit-background-clip: text; background-clip: text; color: transparent; animation: line-shadow-anim 30s linear infinite; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-20 cursor-default"
      >
        <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold font-moderniz">
          <VariableProximity
            label="PORTFOLIO SHOWCASE"
            className="dark:text-white text-slate-800"
            fromFontVariationSettings="'wght' 400, 'opsz' 9"
            toFontVariationSettings="'wght' 1000, 'opsz' 40"
            containerRef={containerRef}
            radius={120}
            falloff="linear"
          />
        </h2>
      </motion.div>

      <div className="w-full flex flex-col gap-16 px-4 max-w-7xl mx-auto pb-8">
        <section>
          <h3 className="text-4xl md:text-6xl font-bold mb-4 text-center dark:text-white text-slate-800">PROJECTS</h3>
                <div className="w-full">
                  {loadingProjects ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/50"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 w-full px-4" style={{ gap: '6rem', margin: '0 auto' }}>
                      <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                        className="flex justify-center items-end"
                      >
                        {webAppsProjects.length > 0 ? (
                          <InteractiveFolderGallery 
                            photos={webAppsProjects.map((p) => ({
                              id: p.id || p.title,
                              image: p.image_url || p.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
                              title: p.title
                            }))}
                            folderName="WEB/APPS" 
                            onPhotoClick={(photo) => {
                              const project = webAppsProjects.find(p => (p.id || p.title) === photo.id);
                              if (project) setPreviewProject(project);
                            }}
                          />
                        ) : (
                          <div className="w-full text-center text-slate-400 py-12">
                            No Web/Apps projects available yet.
                          </div>
                        )}
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                        className="flex justify-center items-end"
                      >
                        {aiVisionProjects.length > 0 ? (
                          <InteractiveFolderGallery 
                            photos={aiVisionProjects.map((p) => ({
                              id: p.id || p.title,
                              image: p.image_url || p.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
                              title: p.title
                            }))}
                            folderName="AI & IOT" 
                            onPhotoClick={(photo) => {
                              const project = aiVisionProjects.find(p => (p.id || p.title) === photo.id);
                              if (project) setPreviewProject(project);
                            }}
                          />
                        ) : (
                          <div className="w-full text-center text-slate-400 py-12">
                            No AI &amp; IOT projects yet.
                          </div>
                        )}
                      </motion.div>
                    </div>
                  )}
                </div>
        </section>

        <section className="pt-32 mt-12">
          <h3 className="text-4xl md:text-6xl font-bold mb-12 text-center dark:text-white text-slate-800">CERTIFICATES</h3>
                <div className="w-full">
                  {loadingCerts ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-400"></div>
                    </div>
                  ) : (
                    <div className="relative w-full overflow-hidden flex bg-transparent py-4">
                      <motion.div
                        className="flex gap-6 whitespace-nowrap px-4"
                        // repeat: Infinity kept a ~10,000px-wide strip of cards
                        // translating forever, even when the section was nowhere
                        // near the viewport. whileInView lets it park itself.
                        initial={{ x: '0%' }}
                        whileInView={{ x: ['0%', '-50%'] }}
                        viewport={{ amount: 0 }}
                        transition={{ repeat: Infinity, ease: 'linear', duration: 30 }}
                        style={{ width: 'fit-content' }}
                      >
                        {[...activeCertificates, ...activeCertificates].map((cert, i) => {
                          const formattedCert = cert.id ? {
                            id: cert.id,
                            title: cert.title,
                            issuer: cert.issuer,
                            date: cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
                            link: cert.credential_url || '#',
                            image: cert.image_url || ''
                          } : cert;
                          return (
                            <div key={`${formattedCert.id || formattedCert.title}-${i}`} className="w-[320px] sm:w-[400px] shrink-0 whitespace-normal">
                              <BigCertificateCard 
                                cert={formattedCert} 
                                onClick={() => setPreviewCertificate(formattedCert)} 
                              />
                            </div>
                          );
                        })}
                      </motion.div>
                    </div>
                  )}
                </div>
        </section>
        <section className="mt-20">
          <h3 className="text-4xl md:text-6xl font-bold mb-12 text-center dark:text-white text-slate-800">TECH STACK</h3>
                <div className="space-y-12 w-full mt-8">
                  {Object.entries(techStack).map(([category, techs]) => (
                    <div key={category}>
                      <h3 className="text-2xl font-bold dark:text-[#FFFFFF] text-[#333333] capitalize mb-6 border-b-2 dark:border-[#333333] border-[#B0B0B0]/40 pb-2">{category}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {techs.map((tech, i) => (
                          <div
                            key={i}
                            className="flex flex-col items-center justify-center gap-4 p-6 sm:p-8 rounded-2xl dark:bg-[#1c1c1c] bg-[#F0F0F0] border dark:border-[#333333] border-[#B0B0B0]/40 shadow-sm"
                          >
                            <div className="text-6xl">{tech.icon}</div>
                            <p className="text-lg font-semibold dark:text-slate-300 text-slate-600 w-full text-center whitespace-normal">{tech.name}</p>
                            
                            {tech.level && (
                              <div className="w-full mt-2">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] sm:text-xs font-medium dark:text-slate-400 text-slate-500">Proficiency</span>
                                  <span className="text-[10px] sm:text-xs font-bold dark:text-white text-slate-800">{tech.level}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="h-1.5 rounded-full bg-white"
                                    style={{ width: `${tech.level}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
        </section>
      </div>

      <AnimatePresence>
        {previewCertificate && (
          <CertificatePreviewModal
            certificate={previewCertificate}
            onClose={() => setPreviewCertificate(null)}
          />
        )}
        {/* ✨ Project Detail Modal */}
        {previewProject && (
          <ProjectDetailModal
            project={previewProject}
            onClose={() => setPreviewProject(null)}
          />
        )}
        {/* ✨ Stack View Modal (Pinterest style) */}
        {orbitCategory && (
          <StackViewModal
            category={orbitCategory}
            onClose={() => setOrbitCategory(null)}
            onProjectClick={(p) => {
              setOrbitCategory(null);
              setPreviewProject(p);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

export default ProjectSection;
