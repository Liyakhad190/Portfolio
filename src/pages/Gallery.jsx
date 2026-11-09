import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useNavbar } from '../contexts/NavbarContext';
import { FaPlay, FaHeart, FaComment, FaChevronLeft, FaChevronRight, FaImages, FaVideo } from 'react-icons/fa';

const dummyActivities = [
  {
    id: 1,
    title: "AI Workshop",
    description: "Attended a workshop on deep learning and neural networks.",
    src: "https://images.unsplash.com/photo-1591436152140-5fbdf17c6276?w=800",
    date: "12 Oct 2024",
    likes: 12,
    type: 'image'
  },
  {
    id: 2,
    title: "Hackathon Winner",
    description: "Won 1st place in the national hackathon for our AI-based solution.",
    src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
    date: "25 Sep 2024",
    likes: 34,
    type: 'image'
  },
  {
    id: 3,
    title: "Tech Conference Speaker",
    description: "Spoke about the future of web technologies and AI integration.",
    src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    date: "05 Sep 2024",
    likes: 45,
    type: 'image'
  }
];

const Gallery = () => {
    const { theme } = useTheme();
    const { hideNavbar, showNavbar } = useNavbar();
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        if (selectedActivity) {
            hideNavbar();
            setCurrentSlide(0); // Reset slide on open
        } else {
            showNavbar();
        }
        // Restore navbar on unmount
        return () => showNavbar();
    }, [selectedActivity, hideNavbar, showNavbar]);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        setIsLoading(true);
        setTimeout(() => {
            setActivities(dummyActivities);
            setIsLoading(false);
        }, 500);
    };


    const handleLike = (e, activity) => {
        e.stopPropagation();
        const updatedActivities = activities.map(a =>
            a.id === activity.id ? { ...a, likes: (a.likes || 0) + 1 } : a
        );
        setActivities(updatedActivities);
        if (selectedActivity && selectedActivity.id === activity.id) {
            setSelectedActivity(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 max-w-7xl mx-auto pt-24 md:pt-32 pb-20"
        >
            <div className="text-center mb-8 md:mb-16 px-4">
                <h1 className="text-3xl md:text-6xl font-black font-moderniz tracking-tighter mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 dark:from-[#ffffff] dark:to-[#999999] filter drop-shadow-lg">
                        ACTIVITY
                    </span>
                    <br className="md:hidden" />
                    <span className="dark:text-white text-slate-800 ml-0 md:ml-4">
                        GALLERY
                    </span>
                </h1>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 dark:border-white"></div>
                </div>
            )}

            {/* Masonry Layout (Modern & Responsive) */}
            {!isLoading && (
                <div className="columns-2 md:columns-3 gap-3 space-y-3 md:gap-6 md:space-y-6 px-2 md:px-8">
                    {activities.map((activity) => {
                        const isVideo = activity.type === 'video';
                        const isMulti = activity.media_urls && activity.media_urls.length > 1;

                        return (
                            <motion.div
                                key={activity.id}
                                layoutId={`activity-${activity.id}`}
                                className="break-inside-avoid relative group rounded-xl md:rounded-2xl overflow-hidden cursor-pointer bg-white dark:bg-[#111111] border dark:border-[#444444]/30 border-slate-200 shadow-sm md:shadow-lg hover:shadow-xl transition-all duration-300"
                                onClick={() => setSelectedActivity(activity)}
                                whileHover={{ y: -5 }}
                            >
                                <div className="relative w-full">
                                    {isVideo ? (
                                        <video
                                            src={activity.src}
                                            className="w-full h-auto object-cover"
                                            muted
                                            loop
                                            playsInline
                                            autoPlay
                                        />
                                    ) : (
                                        <img
                                            src={activity.src}
                                            alt={activity.title}
                                            className="w-full h-auto object-cover"
                                            loading="lazy"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/600x400?text=No+Image'}
                                        />
                                    )}

                                    {/* Mobile Indicators (Top Right) - kept minimal */}
                                    <div className="absolute top-2 right-2 md:hidden text-white drop-shadow-md bg-black/30 backdrop-blur-sm rounded-full p-1.5 px-2 text-xs flex items-center">
                                        {isVideo && <FaVideo />}
                                        {!isVideo && isMulti && <FaImages />}
                                    </div>

                                    {/* Gradient Overlay (Desktop Hover) */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 hidden md:flex">
                                        <span className="text-white/70 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">{activity.date}</span>
                                        <h3 className="text-white font-bold text-lg leading-tight">{activity.title}</h3>
                                    </div>
                                </div>

                                {/* Minimal info for Mobile (re-added but minimal) */}
                                <div className="p-3 md:p-4 flex items-center justify-between md:border-t dark:border-[#444444]/30 border-slate-100 bg-white dark:bg-[#111111]">
                                    <div className="flex items-center space-x-2 text-xs md:text-sm dark:text-slate-400 text-slate-500">
                                        <FaHeart className="text-red-500" /> <span>{activity.likes || 0}</span>
                                    </div>
                                    {/* Title truncation for mobile context */}
                                    <div className="md:hidden text-xs font-bold dark:text-slate-300 text-slate-700 truncate ml-2 flex-1 text-right">
                                        {activity.title}
                                    </div>
                                    <div className="hidden md:block text-xs font-mono dark:text-slate-500 text-slate-400">
                                        View Details
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && activities.length === 0 && (
                <div className="text-center py-20 dark:text-slate-500 text-slate-400">
                    <p>No activities found yet. Check back later!</p>
                </div>
            )}

            {/* Modal Detail */}
            <AnimatePresence>
                {selectedActivity && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/90 md:bg-black/80 backdrop-blur-md"
                        onClick={() => setSelectedActivity(null)}
                    >
                        <motion.div
                            layoutId={`activity-${selectedActivity.id}`}
                            className="relative w-full md:max-w-5xl bg-white dark:bg-[#111111] md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-full md:h-[80vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Media Section (Left/Top) */}
                            <div className="w-full md:w-[60%] bg-black flex items-center justify-center relative h-[45%] md:h-full group">
                                {(() => {
                                    const files = (selectedActivity.media_urls && selectedActivity.media_urls.length > 0)
                                        ? selectedActivity.media_urls
                                        : [selectedActivity.src];

                                    const currentFile = files[currentSlide] || files[0];
                                    const isVideoFile = currentFile.match(/\.(mp4|webm|ogg)$/i) || (selectedActivity.type === 'video' && files.length === 1);

                                    return (
                                        <>
                                            {isVideoFile ? (
                                                <video
                                                    src={currentFile}
                                                    controls
                                                    autoPlay
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            ) : (
                                                <img
                                                    src={currentFile}
                                                    alt={selectedActivity.title}
                                                    className="max-h-full max-w-full object-contain transition-opacity duration-300"
                                                />
                                            )}

                                            {/* Navigation Arrows */}
                                            {files.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCurrentSlide(prev => (prev === 0 ? files.length - 1 : prev - 1));
                                                        }}
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                                    >
                                                        <FaChevronLeft size={20} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCurrentSlide(prev => (prev === files.length - 1 ? 0 : prev + 1));
                                                        }}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                                    >
                                                        <FaChevronRight size={20} />
                                                    </button>

                                                    {/* Dots Indicator */}
                                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                                        {files.map((_, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-white w-4' : 'bg-white/50'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    );
                                })()}

                                <button
                                    onClick={() => setSelectedActivity(null)}
                                    className="absolute top-4 left-4 md:hidden p-2 bg-black/50 text-white rounded-full z-10"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Info & Comments Section (Right/Bottom) */}
                            <div className="w-full md:w-[40%] flex flex-col h-[55%] md:h-full border-l dark:border-[#444444]/30 border-slate-200">
                                {/* Header Info */}
                                <div className="p-4 md:p-6 border-b dark:border-[#444444]/30 border-slate-200 flex-shrink-0 bg-white dark:bg-[#111111]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-200 dark:bg-[#1a1a1a] text-slate-200 dark:text-[#cccccc]">
                                            {selectedActivity.date}
                                        </span>
                                        <button onClick={() => setSelectedActivity(null)} className="hidden md:block text-slate-400 hover:text-red-500 transition-colors">
                                            ✕
                                        </button>
                                    </div>
                                    <h2 className="text-lg md:text-xl font-bold dark:text-white text-slate-900 mb-1">{selectedActivity.title}</h2>
                                    <p className="text-xs md:text-sm dark:text-slate-400 text-slate-600 leading-relaxed line-clamp-3">
                                        {selectedActivity.description}
                                    </p>
                                </div>

                                {/* Interaction Area (Fixed Bottom) */}
                                <div className="p-4 border-t dark:border-[#444444]/30 border-slate-200 bg-white dark:bg-[#111111] flex-shrink-0 pb-safe">
                                    <div className="flex items-center gap-4 mb-3">
                                        <button
                                            onClick={(e) => handleLike(e, selectedActivity)}
                                            className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors group"
                                        >
                                            <FaHeart className={`text-xl transition-transform group-active:scale-125 ${selectedActivity.likes > 0 ? 'text-red-500' : ''}`} />
                                            <span className="font-semibold">{selectedActivity.likes || 0} Likes</span>
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Gallery;
