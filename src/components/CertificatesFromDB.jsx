import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaExternalLinkAlt, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import apiService from '../services/api';

const CertificatesFromDB = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewCert, setPreviewCert] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchCertificates() {
      try {
        setLoading(true);
        const data = await apiService.getCertificates();
        if (data) {
          setCertificates(data);
        }
      } catch (err) {
        console.error('Error fetching certificates:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCertificates();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const nextCert = () => {
    setCurrentIndex((prev) => (prev + 1) % certificates.length);
  };

  const prevCert = () => {
    setCurrentIndex((prev) => (prev - 1 + certificates.length) % certificates.length);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-200/20 border-t-emerald-400 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-emerald-400/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-6 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <p className="text-red-400 font-semibold mb-2">Failed to load certificates</p>
          <p className="text-red-300/70 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-8 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
          <p className="text-slate-400 text-lg">No certificates found</p>
          <p className="text-slate-500 text-sm mt-2">Add certificates in your Supabase database!</p>
        </div>
      </div>
    );
  }

  // Calculate carousel positions
  const getCardStyle = (index) => {
    const offset = index - currentIndex;
    const total = certificates.length;
    
    // Normalize offset to handle wrap-around correctly for the carousel
    let normalizedOffset = offset;
    if (offset > Math.floor(total / 2)) {
      normalizedOffset -= total;
    } else if (offset < -Math.floor(total / 2)) {
      normalizedOffset += total;
    }

    const isCenter = normalizedOffset === 0;
    const isLeft = normalizedOffset < 0;
    const isRight = normalizedOffset > 0;
    const absOffset = Math.abs(normalizedOffset);
    
    // Items that are too far away shouldn't be rendered or should be completely hidden
    const isVisible = absOffset <= 2;

    if (!isVisible) {
      return { opacity: 0, scale: 0.5, zIndex: 0, display: 'none' };
    }

    return {
      x: isCenter ? 0 : isLeft ? `${-80 * absOffset}%` : `${80 * absOffset}%`,
      rotateY: isCenter ? 0 : isLeft ? 60 : -60,
      scale: isCenter ? 1 : Math.max(1 - 0.25 * absOffset, 0.5),
      zIndex: 10 - absOffset,
      opacity: isCenter ? 1 : Math.max(1 - 0.5 * absOffset, 0),
      filter: isCenter ? 'brightness(1)' : 'brightness(0.3)',
    };
  };

  return (
    <>
      <div className="relative w-full max-w-5xl mx-auto py-12 px-4 flex flex-col items-center">
        {/* 3D Carousel Container */}
        <div 
          className="relative w-full h-[500px] flex justify-center items-center"
          style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
        >
          {certificates.map((cert, index) => {
            const style = getCardStyle(index);
            const isCenter = index === currentIndex;
            
            return (
              <motion.div
                key={cert.id}
                initial={false}
                animate={{
                  x: style.x,
                  rotateY: style.rotateY,
                  scale: style.scale,
                  zIndex: style.zIndex,
                  opacity: style.opacity,
                  filter: style.filter,
                }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 25 }}
                className={`absolute w-full max-w-[320px] sm:max-w-[400px] rounded-2xl bg-slate-900 border transition-colors duration-500 shadow-2xl overflow-hidden cursor-pointer
                  ${isCenter ? 'border-emerald-400/50 shadow-emerald-500/20' : 'border-slate-800/50 hover:border-slate-600'}`}
                style={{
                  display: style.display || 'block',
                  transformOrigin: 'center center',
                }}
                onClick={() => {
                  if (isCenter) {
                    setPreviewCert(cert);
                  } else {
                    setCurrentIndex(index);
                  }
                }}
              >
                {cert.image_url && (
                  <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-950">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {cert.title}
                  </h3>
                  <p className="text-cyan-400 text-sm font-semibold mb-1">{cert.issuer}</p>
                  {cert.issue_date && (
                    <p className="text-emerald-400 text-xs font-medium mb-4">
                      {formatDate(cert.issue_date)}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-slate-400 text-sm mt-4">
                    <span className="flex items-center gap-2">
                      <FaDownload className="text-xs" />
                      {isCenter ? 'Click to View' : 'Focus'}
                    </span>
                    <div className={`transition-opacity ${isCenter ? 'opacity-100' : 'opacity-0'}`}>
                      <FaExternalLinkAlt className="text-emerald-300" />
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-cyan-500/0 transition-all duration-500 pointer-events-none rounded-2xl"></div>
              </motion.div>
            );
          })}
        </div>

        {/* Navigation Controls */}
        {certificates.length > 1 && (
          <div className="flex items-center gap-6 mt-10">
            <button
              onClick={prevCert}
              className="p-4 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300"
            >
              <FaChevronLeft className="text-lg" />
            </button>
            
            <div className="flex gap-2">
              {certificates.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex 
                      ? 'w-8 bg-emerald-400' 
                      : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextCert}
              className="p-4 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300"
            >
              <FaChevronRight className="text-lg" />
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewCert(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative max-w-4xl w-full bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setPreviewCert(null)}
                  className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md p-3 rounded-full border border-red-400/30 transition-all duration-300 group"
                >
                  <FaTimes className="text-red-300 group-hover:text-red-200" />
                </button>
              </div>

              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-white mb-3">{previewCert.title}</h2>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-cyan-500/20 rounded-full text-cyan-300 font-semibold border border-cyan-400/30">
                      {previewCert.issuer}
                    </span>
                    <span className="px-4 py-2 bg-emerald-500/20 rounded-full text-emerald-300 font-semibold border border-emerald-400/30">
                      {formatDate(previewCert.issue_date)}
                    </span>
                  </div>
                </div>

                {previewCert.image_url && (
                  <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-6">
                    <img
                      src={previewCert.image_url}
                      alt={previewCert.title}
                      className="w-full h-auto max-h-[60vh] object-contain"
                    />
                  </div>
                )}

                {previewCert.credential_url && (
                  <div className="flex justify-center">
                    <a
                      href={previewCert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group px-8 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold rounded-full transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-cyan-500/25"
                    >
                      <FaDownload className="group-hover:scale-110 transition-transform" />
                      <span>View Credential</span>
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CertificatesFromDB;
