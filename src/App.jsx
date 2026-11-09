import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Preloader from './components/Preloader';
import ScrollToTop from './components/ScrollToTop';
import { NavbarProvider } from './contexts/NavbarContext';
import { AdminProvider } from './contexts/AdminContext';
import { useTheme } from './contexts/ThemeContext';

// Lazy-loaded Pages for fast initial bundle load
import Home from './pages/Home';
const Gallery = React.lazy(() => import('./pages/Gallery'));
const Admin = React.lazy(() => import('./pages/Admin'));

function App() {
  const { theme } = useTheme();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  return (
    <AdminProvider>
      <NavbarProvider>
        <div className="relative min-h-screen dark:bg-[#121212] bg-[#FFFFFF] transition-colors duration-500 overflow-x-clip">
          {isLoading && <Preloader onFinished={() => setIsLoading(false)} />}
          
          {/* Plain Professional Background with Elegant Minimalism Palette */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 dark:bg-[#121212] bg-[#FFFFFF]" />
            <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(176,176,176,0.05),rgba(18,18,18,0))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(112,112,112,0.03),rgba(255,255,255,0))]" />
          </div>

          {!isLoading && <Header />}

          {/* Page Routing with Transitions & Code Splitting */}
          <React.Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-slate-600 border-t-white rounded-full animate-spin"></div>
            </div>
          }>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/login" element={<Navigate to="/admin" replace />} />
              </Routes>
            </AnimatePresence>
          </React.Suspense>

          <ScrollToTop />

        </div>
      </NavbarProvider>
    </AdminProvider>
  );
}

export default App;