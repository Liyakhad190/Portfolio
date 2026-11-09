import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { FaSun, FaMoon } from 'react-icons/fa';
import bangzenLogo from '../assets/images/BGZENBGIJObulat.png';
import { useNavbar } from '../contexts/NavbarContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { StaggeredMenu } from './StaggeredMenu';
import { TypewriterEffectSmooth } from './TypewriterEffect';


const CLIP_PATH =
  'polygon(0 0, 100% 0, 100% 85%, 68% 85%, 64% 100%, 36% 100%, 32% 85%, 0 85%)';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const { isNavbarVisible, hideNavbar, showNavbar, isMenuOpen, setIsMenuOpen } = useNavbar();
  const { theme, toggleTheme } = useTheme();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to hash on location change if on home
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (location.pathname === '/' && !location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);


  // Improved Navigation Handler
  const handleNavClick = (e, href) => {
    e.preventDefault();
    setIsMenuOpen(false);

    if (href.startsWith('#')) {
      if (location.pathname === '/') {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          // Update URL hash without reload
          window.history.pushState(null, '', href);
        }
      } else {
        navigate('/' + href);
      }
    } else {
      navigate(href);
    }
  };

  const NavLink = ({ href, children, isPage }) => {
    // Check active state
    const isActive = isPage
      ? location.pathname === href
      : location.pathname === '/' && location.hash === href;

    return (
      <li>
        <a
          href={href}
          onClick={(e) => handleNavClick(e, href)}
          className={`relative block dark:text-white dark:hover:text-[#aaaaaa] text-slate-700 font-[Rubik] font-bold text-base tracking-wider py-2 transition-transform duration-300 hover:scale-110 group ${isActive ? 'text-slate-200 dark:text-[#ffffff]' : ''}`}
        >
          {children}
          <span className={`absolute bottom-1 left-0 block h-[2px] w-0 dark:bg-[#ffffff] bg-slate-700 transition-all duration-500 group-hover:w-full ${isActive ? 'w-full' : ''}`}></span>
        </a>
      </li>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isNavbarVisible && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-0 left-0 w-full z-50 pointer-events-none"
          >
            {/* Drop Shadow Gradient Animated.
                A full-width `filter: drop-shadow()` over an animated
                `background-position` repaints every single frame. Once scrolled
                the element is fully transparent anyway, so drop the filter and
                the animation — the opacity fade below is unchanged. */}
            {theme === 'dark' ? (
              <div
                className="pointer-events-none absolute left-0 right-0 z-10 transition-opacity duration-500"
                style={{
                  top: '0',
                  height: '85px',
                  WebkitClipPath: isMenuOpen ? 'none' : CLIP_PATH,
                  clipPath: isMenuOpen ? 'none' : CLIP_PATH,
                  background: '#555555',
                  backgroundSize: '300% 100%',
                  animation: isScrolled ? 'none' : 'gradientShadowMove 6s linear infinite',
                  opacity: isScrolled ? 0 : 1,
                  filter: isScrolled ? 'none' : 'drop-shadow(0 16px 24px rgba(255,255,255,0.1))',
                }}
              ></div>
            ) : (
              <div
                className="pointer-events-none absolute left-0 right-0 z-10 transition-opacity duration-500"
                style={{
                  top: '0',
                  height: '85px',
                  WebkitClipPath: isMenuOpen ? 'none' : CLIP_PATH,
                  clipPath: isMenuOpen ? 'none' : CLIP_PATH,
                  background: 'linear-gradient(90deg, #707070, #B0B0B0, #707070, #B0B0B0, #707070)',
                  backgroundSize: '300% 100%',
                  animation: isScrolled ? 'none' : 'gradientShadowMove 6s linear infinite',
                  opacity: isScrolled ? 0 : 1,
                  filter: isScrolled ? 'none' : 'drop-shadow(0 8px 16px rgba(112,112,112,0.18))',
                }}
              ></div>
            )}

            <div
              style={{
                WebkitClipPath: isMenuOpen ? 'none' : CLIP_PATH,
                clipPath: isMenuOpen ? 'none' : CLIP_PATH,
                background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
              }}
              className={`relative z-20 pointer-events-auto transition-all duration-300 ${isMenuOpen ? '' : 'pb-[2px]'}`}
            >
            <header
              style={{
                WebkitClipPath: isMenuOpen ? 'none' : CLIP_PATH,
                clipPath: isMenuOpen ? 'none' : CLIP_PATH,
              }}
              className={`pt-3 ${isMenuOpen ? 'pb-0' : 'pb-5'} relative w-full h-full transition-all duration-300
                ${isMenuOpen
                  ? "dark:bg-[#121212]/95 bg-[#FFFFFF]/95 backdrop-blur-xl shadow-lg"
                  : isScrolled
                    ? "dark:bg-[#121212]/95 bg-[#FFFFFF]/95 shadow-sm"
                    : "dark:bg-[#121212] bg-[#FFFFFF]"
                }`}
            >
              {/* =========== REFACTORED NAVIGATION =========== */}
              <nav className="container mx-auto flex items-center justify-between flex-wrap pb-0 px-1">
                {/* --- MOBILE HEADER --- */}
                <div className="w-full flex items-center justify-between md:hidden">
                  {/* Mobile: Brand Logo & Text (Left) */}
                  <a href="/" onClick={(e) => handleNavClick(e, '#home')} className="flex items-center gap-3 w-full">
                    <img src={bangzenLogo} alt="Logo" className="h-12 w-12 flex-shrink-0" style={{filter: 'grayscale(1) contrast(1.5)'}} />
                    <div className="flex flex-col justify-center w-full">
                      <p className="font-moderniz text-[10px] md:text-[14px] dark:text-white text-slate-800 font-bold text-left uppercase my-0" style={{ textShadow: 'none' }}>
                        LET'S SEE THE AWESOME EXPERIENCE
                      </p>
                    </div>
                  </a>
                  {/* Mobile: Hamburger Button (Right) */}
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="dark:text-[#ffffff] text-slate-800 text-3xl pointer-events-auto ml-2">
                    &#9776;
                  </button>
                </div>

                {/* --- DESKTOP HEADER --- */}
                <div className="hidden w-full md:flex justify-between items-center px-4 lg:px-8 relative min-h-[48px]">
                  {/* Desktop: Left Navigation (Start) */}
                  <div className="flex-1 flex items-center justify-start gap-4 lg:gap-8 z-10 overflow-hidden">
                    <a href="/" onClick={(e) => handleNavClick(e, '#home')} className="flex items-center flex-shrink-0">
                      <img src={bangzenLogo} alt="Logo" className="h-12 w-12" style={{filter: 'grayscale(1) contrast(1.5)'}} />
                    </a>
                    <ul className="flex items-center list-none gap-4 lg:gap-8 flex-shrink-0">
                      <NavLink href="#home">Home</NavLink>
                      <NavLink href="#projects">Project</NavLink>
                      <NavLink href="/gallery" isPage>Gallery</NavLink>
                    </ul>
                  </div>

                  {/* Desktop: Center Text (Center) */}
                  <div className="flex-shrink-0 px-2 flex items-center justify-center z-0 pointer-events-none">
                    <p className="font-moderniz text-[10px] md:text-[12px] lg:text-[14px] xl:text-[16px] dark:text-white text-slate-800 font-bold text-center uppercase whitespace-nowrap my-0" style={{ textShadow: 'none' }}>
                      LET'S SEE THE AWESOME EXPERIENCE
                    </p>
                  </div>

                  {/* Desktop: Right Navigation & Admin Button (End) */}
                  <div className="flex-1 flex items-center justify-end gap-4 lg:gap-8 z-10 overflow-hidden">
                    <ul className="flex items-center list-none gap-4 lg:gap-8 flex-shrink-0">
                      <NavLink href="#about">About</NavLink>
                      <NavLink href="#contact">Contact</NavLink>
                    </ul>
                  </div>
                </div>

              </nav>
            </header>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- STAGGERED MENU (MOVED OUTSIDE HEADER FOR PROPER FIXED POSITIONING) --- */}
      <StaggeredMenu
        isOpen={isMenuOpen}
        onMenuClose={() => setIsMenuOpen(false)}
        items={[
          { label: 'Home', link: '#home', onClick: (e) => handleNavClick(e, '#home') },
          { label: 'Project', link: '#projects', onClick: (e) => handleNavClick(e, '#projects') },
          { label: 'Gallery', link: '/gallery', onClick: (e) => handleNavClick(e, '/gallery') },
          { label: 'About', link: '#about', onClick: (e) => handleNavClick(e, '#about') },
          { label: 'Contact', link: '#contact', onClick: (e) => handleNavClick(e, '#contact') },
        ]}
        socialItems={[]}
        displaySocials={true}
        displayItemNumbering={true}
        colors={['#333333', '#444444', '#222222']} // Grey palette
        accentColor="#ffffff"
      />



      {/* Animasi gradient keyframes */}
      <style>
        {`
          @keyframes gradientShadowMove {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
        `}
      </style>
    </>
  );
};

export default Header;
