import React, { useState, useRef, Suspense, lazy } from 'react';
import { motion, useInView } from "framer-motion";
import { FaGithub, FaInstagram, FaLinkedin, FaDownload, FaBriefcase, FaCode, FaCertificate, FaGlobe, FaArrowRight, FaCube, FaEnvelope, FaWhatsapp } from 'react-icons/fa';
import RotatingText from '../components/RotatingText';
import TextGenerateEffect from "../components/text-generate-effect";
import TextScramble from '../components/TextScramble';
import Skills from '../components/Skills';
import { VelocityScroll } from '../components/VelocityScroll';
import { ButtonMovingBorder } from '../components/MovingBorderButton';
import ProjectSection from '../components/ProjectSection';
import Contact from '../components/Contact';
import { useTheme } from '../contexts/ThemeContext';
import projectsData from '../data/projects.json';
import certificatesData from '../data/certificates.json';

// Dynamic lazy imports for heavy 3D WebGL modules
const Lanyard = lazy(() => import('../components/Lanyard/Lanyard'));
const Spline = lazy(() => import('@splinetool/react-spline'));

const Render3DFallback = (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
  </div>
);

const Home = () => {
    const { theme } = useTheme();

    const [is3dEnabled, setIs3dEnabled] = useState(() => {
        if (typeof window !== 'undefined') {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const isSmallScreen = window.innerWidth < 1024;
            return !isMobile && !isSmallScreen;
        }
        return true;
    });

    const lanyardRef = useRef(null);
    const isLanyardInView = useInView(lanyardRef, { margin: "0px 0px 200px 0px" });

    const splineRef = useRef(null);
    // Not `once`: a Spline scene owns a permanent WebGL render loop, so keeping
    // it mounted after scrolling past meant that loop ran for the rest of the
    // session. Load it when it approaches the viewport, drop it when it leaves.
    const isSplineInView = useInView(splineRef, { margin: "400px 0px 400px 0px" });
    const hasLoadedSpline = useRef(false);
    if (isSplineInView) hasLoadedSpline.current = true;

    const toggle3dAssets = () => {
        setIs3dEnabled(prev => !prev);
    };

    const stats = [
        { icon: <FaCode />, value: projectsData.length.toString(), title: "TOTAL PROJECTS", description: "Innovative web solutions crafted" },
        { icon: <FaCertificate />, value: certificatesData.length.toString(), title: "CERTIFICATES", description: "Professional skills validated" },
        { icon: <FaGlobe />, value: "3", title: "YEARS OF EXPERIENCE", description: "Continuous learning journey" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto"
        >

            {/* ── HERO SECTION ── */}
            <section id="home" className="flex flex-col md:flex-row items-center gap-10 pt-20 pb-16 lg:pt-0 lg:pb-20">
                <div className="flex-1 dark:text-white text-slate-800 space-y-6 pt-16 md:pt-40 order-last md:order-none text-center md:text-left flex flex-col items-center md:items-start">

                    {/* WELCOME TO MY PORTFOLIO — white neon */}
                    <motion.h1
                        initial={{ opacity: 0, x: -60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
                        className="text-3xl sm:text-4xl font-moderniz font-bold leading-tight select-none main-heading"
                        style={{
                            color: theme === 'dark' ? "#ffffff" : "#0f172a"
                        }}
                    >
                        WELCOME TO MY
                        <span style={{ display: 'block', marginTop: '0.4em' }}>PORTFOLIO</span>
                    </motion.h1>

                    <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}>
                        <RotatingText
                            texts={['Full Stack Developer', 'UI/UX Designer']}
                            mainClassName="text-xl lg:text-3xl font-cascadia font-bold dark:text-white text-slate-800"
                            staggerFrom={"last"}
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "-120%" }}
                            staggerDuration={0.025}
                            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                            transition={{ type: "spring", damping: 30, stiffness: 400 }}
                            rotationInterval={3000}
                        />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}>
                        <TextGenerateEffect words={'I am an AI & ML Engineering student passionate about AI, Machine Learning, IOT, and Full Stack development. I love building intelligent systems and modern digital solutions.'} />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}>
                        <Skills />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.0, ease: "easeOut" }} className="flex flex-row gap-4 mt-8 flex-wrap">
                        <a href="https://github.com/Liyakhad190" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" className="group relative flex h-12 w-12 items-center justify-center rounded-full border dark:border-white/20 border-slate-200 dark:bg-white/5 bg-white transition-all duration-300 hover:border-white/60 dark:hover:bg-white/10 hover:shadow-md dark:hover:shadow-[0_0_20px_2px_rgba(255,255,255,0.25)] hover:scale-110 active:scale-90">
                            <FaGithub className="h-6 w-6 dark:text-slate-300 text-slate-600 transition-all duration-300 dark:group-hover:text-white" />
                        </a>
                        <a href="https://www.linkedin.com/in/liyakhad-ali-780a3132a" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" className="group relative flex h-12 w-12 items-center justify-center rounded-full border dark:border-white/20 border-slate-200 dark:bg-white/5 bg-white transition-all duration-300 hover:border-white/60 dark:hover:bg-white/10 hover:shadow-md dark:hover:shadow-[0_0_20px_2px_rgba(255,255,255,0.25)] hover:scale-110 active:scale-90">
                            <FaLinkedin className="h-6 w-6 dark:text-slate-300 text-slate-600 transition-all duration-300 dark:group-hover:text-white" />
                        </a>
                        <a href="mailto:liyakhad2106@gmail.com" aria-label="Email" className="group relative flex h-12 w-12 items-center justify-center rounded-full border dark:border-white/20 border-slate-200 dark:bg-white/5 bg-white transition-all duration-300 hover:border-white/60 dark:hover:bg-white/10 hover:shadow-md dark:hover:shadow-[0_0_20px_2px_rgba(255,255,255,0.25)] hover:scale-110 active:scale-90">
                            <FaEnvelope className="h-6 w-6 dark:text-slate-300 text-slate-600 transition-all duration-300 dark:group-hover:text-white" />
                        </a>
                        <a href="https://wa.me/916374947834" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="group relative flex h-12 w-12 items-center justify-center rounded-full border dark:border-white/20 border-slate-200 dark:bg-white/5 bg-white transition-all duration-300 hover:border-white/60 dark:hover:bg-white/10 hover:shadow-md dark:hover:shadow-[0_0_20px_2px_rgba(255,255,255,0.25)] hover:scale-110 active:scale-90">
                            <FaWhatsapp className="h-6 w-6 dark:text-slate-300 text-slate-600 transition-all duration-300 dark:group-hover:text-white" />
                        </a>
                    </motion.div>
                </div>

                {/* Lanyard 3D ID Card */}
                <div ref={lanyardRef} className="hidden lg:flex flex-1 justify-center h-[600px] w-full order-first lg:order-none relative z-10">
                    {is3dEnabled && (
                        <Suspense fallback={Render3DFallback}>
                            <Lanyard position={[0, 0, 15]} gravity={[0, -40, 0]} fov={18} transparent={true} visible={isLanyardInView} />
                        </Suspense>
                    )}
                </div>
            </section>

            {/* ── ABOUT SECTION ── */}
            <section
                id="about"
                className="py-12 md:py-18 gap-0 w-full mx-0 pt-20 lg:pt-24"
                style={{ width: "100vw", position: "relative", left: "50%", right: "50%", marginLeft: "-50vw", marginRight: "-50vw" }}
            >
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: "easeOut" }} className="text-center">
                    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden mb-20">
                        {/* White neon ABOUT ME scrolling text */}
                        <VelocityScroll defaultVelocity={3} numRows={1} className="max-w-full">
                            <span className="font-moderniz font-bold" style={{ fontSize: "2.5rem", lineHeight: "1.1", color: theme === 'dark' ? "#ffffff" : "#0891b2", background: "none", WebkitBackgroundClip: "unset", WebkitTextFillColor: "unset", opacity: theme === 'dark' ? 1 : 0.3 }}>
                                ABOUT <span style={{ color: theme === 'dark' ? "#aaaaaa" : "#0891b2" }}>ME</span>
                            </span>
                        </VelocityScroll>
                        <div className={`pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r ${theme === 'dark' ? 'from-[#0a0a0a]' : 'from-slate-50'}`}></div>
                        <div className={`pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l ${theme === 'dark' ? 'from-[#0a0a0a]' : 'from-slate-50'}`}></div>
                        <VelocityScroll defaultVelocity={-3} numRows={1} className="max-w-full">
                            <span className="font-moderniz font-bold" style={{ fontSize: "2.5rem", lineHeight: "1.1", color: theme === 'dark' ? "#ffffff" : "#0891b2", background: "none", WebkitBackgroundClip: "unset", WebkitTextFillColor: "unset", opacity: theme === 'dark' ? 1 : 0.3 }}>
                                ABOUT <span style={{ color: theme === 'dark' ? "#aaaaaa" : "#0891b2" }}>ME</span>
                            </span>
                        </VelocityScroll>
                    </div>
                    <p className="text-lg dark:text-white/60 text-slate-600 mt-2 font-cascadia px-1 mb-6">
                        ✧ Passionate about AI, Machine Learning &amp; creative technology ✧
                    </p>
                </motion.div>

                <div className="flex flex-col md:flex-row items-center justify-center">
                    {is3dEnabled && (
                        <motion.div
                            ref={splineRef}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                            className="md:w-1/3 flex justify-center"
                        >
                            <div className="w-full h-[420px] md:h-[530px] relative overflow-hidden" style={{ clipPath: 'inset(0 0 52px 0)' }}>
                                {isSplineInView && hasLoadedSpline.current && (
                                    <Suspense fallback={Render3DFallback}>
                                        <Spline
                                            scene="https://prod.spline.design/FcZ66SFMX1YbF-0I/scene.splinecode"
                                            style={{ 
                                                width: '100%', 
                                                height: 'calc(100% + 52px)',
                                                filter: 'grayscale(100%) brightness(1.1) contrast(1.2)'
                                            }}
                                        />
                                    </Suspense>
                                )}
                            </div>
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                        className={`dark:text-white text-slate-800 text-center md:text-left px-4 md:px-8 transition-all duration-700 ${is3dEnabled ? 'md:w-1/2' : 'md:w-2/3'}`}
                    >
                        <p className="text-2xl font-moderniz mb-2 uppercase" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                            <span className="text-[#e84e44]">HELLO</span>
                            <span className="dark:text-white text-slate-800">, I'M</span>
                        </p>
                        <h3 className="text-4xl font-bold dark:text-white text-slate-900 my-2 font-moderniz">
                            <TextScramble text="Liyakhad Ali" delay={400} />
                        </h3>
                        <p className="dark:text-white/80 text-slate-600 leading-relaxed mt-4 font-cascadia text-justify">
                            I am an AI &amp; ML Engineering student passionate about AI, Machine Learning, IOT, and Full Stack development. I love building intelligent systems and modern digital solutions that solve real-world problems.
                        </p>
                        <div className="my-6 dark:bg-white/5 bg-slate-50 border-l-4 dark:border-white/40 border-slate-300 p-4 rounded-r-lg italic dark:text-white/70 text-slate-700 font-cascadia dark:shadow-none shadow-md">
                            "Whoever strives shall succeed."
                        </div>
                        <div className="flex flex-row sm:flex-row gap-4 mt-8 justify-center md:justify-start items-center">
                            <ButtonMovingBorder as="a" href="/cv.pdf" download duration={3000} borderRadius="0.75rem" className="dark:bg-white/5 bg-white border dark:border-white/20 border-slate-200 dark:text-white text-slate-800 font-semibold flex items-center justify-center gap-2 transition-all duration-300 dark:shadow-none shadow-md hover:shadow-lg dark:hover:shadow-[0_0_24px_8px_rgba(255,255,255,0.15)]">
                                <FaDownload /> Download CV
                            </ButtonMovingBorder>
                            <ButtonMovingBorder as="a" href="#projects" duration={3000} borderRadius="0.75rem" className="dark:bg-white/5 bg-white border dark:border-white/20 border-slate-200 dark:text-white text-slate-800 font-semibold flex items-center justify-center gap-2 transition-all duration-300 dark:shadow-none shadow-md hover:shadow-lg dark:hover:shadow-[0_0_24px_8px_rgba(255,255,255,0.15)]">
                                <FaBriefcase /> View Projects
                            </ButtonMovingBorder>
                        </div>
                    </motion.div>
                </div>

                {/* Stats Cards */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-10 px-4 md:px-0">
                    {stats.map((stat, index) => (
                        <div key={index} className="group relative p-6 rounded-2xl dark:bg-[#111111] bg-[#111111] border dark:border-white/10 border-slate-800 dark:shadow-none shadow-lg transition-all duration-300 hover:border-white/30 hover:shadow-xl dark:hover:shadow-[0_0_24px_0px_rgba(255,255,255,0.15)] cursor-pointer">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <div className="p-3 mb-4 rounded-full dark:bg-white/10 bg-slate-50 border dark:border-white/10 border-slate-100 w-max dark:group-hover:bg-white/20 group-hover:bg-slate-100 transition-all duration-300">
                                        <div className="text-2xl dark:text-slate-300 text-slate-500 dark:group-hover:text-white transition-colors duration-300">{stat.icon}</div>
                                    </div>
                                    <h3 className="text-sm font-semibold uppercase tracking-wider dark:text-slate-400 text-slate-500 dark:group-hover:text-white transition-colors duration-300">{stat.title}</h3>
                                    <p className="text-xs dark:text-slate-500 text-slate-400 mt-1">{stat.description}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="text-5xl font-bold text-[#e84e44] transition-all duration-300 group-hover:text-[#ff665c]">{stat.value}</p>
                                    <FaArrowRight className="text-slate-400 mt-auto dark:group-hover:text-white transition-all duration-300 -rotate-45" />
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </section>

            <section id="projects" className="md:py-18">
                <ProjectSection />
            </section>

            <section id="contact" className="py-20 pb-16">
                <Contact />
            </section>

            <footer className="py-12 pb-16 text-center text-gray-400 dark:bg-gradient-to-t dark:from-white/5 dark:to-transparent bg-gradient-to-t from-slate-100/50 to-transparent">
                <div className="text-sm">© {new Date().getFullYear()} Liyakhad Ali. All rights reserved.</div>
            </footer>
        </motion.div>
    );
};

export default Home;
