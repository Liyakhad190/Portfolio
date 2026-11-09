import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGithub,
  FaLinkedin,
  FaPaperPlane,
  FaUser,
  FaEnvelope,
  FaComment,
  FaCamera,
  FaHeart,
  FaReply,
  FaTrash,
  FaCog,
  FaThumbtack,
  FaWhatsapp
} from 'react-icons/fa';

const Contact = () => {
  // States untuk contact form
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // States untuk comments
  const [commentForm, setCommentForm] = useState({
    name: '',
    message: '',
    photo: null,
    photoPreview: null
  });
  const [comments, setComments] = useState([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const isAuthenticated = false;

  // Load comments dari Supabase
  useEffect(() => {
    fetchComments();
  }, []);

  // Fetch comments dari database
  const fetchComments = async () => {
    try {
      const savedComments = localStorage.getItem('portfolioComments');
      if (savedComments) {
        setComments(JSON.parse(savedComments));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Handle contact form
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingContact(true);

    try {
      // 2. Send Email Notification via Web3Forms
      const formData = new FormData();
      // ⚠️ IMPORTANT: Replace this with your Web3Forms access key!
      formData.append("access_key", "c2cc0c3d-3cf4-4c92-9ee3-f263b5e02cdd");
      formData.append("name", contactForm.name);
      formData.append("email", contactForm.email);
      formData.append("message", contactForm.message);
      formData.append("subject", "New Contact Message from Portfolio");

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        console.log('Message sent via Web3Forms');
        alert('Message sent successfully! Thank you for contacting me. 📧');
        setContactForm({ name: '', email: '', message: '' });
      } else {
        throw new Error(result.message || "Email notification failed");
      }

    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert(`Failed to send message: ${error.message}. Please try again later.`);
    } finally {
      setIsSubmittingContact(false);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCommentForm(prev => ({
          ...prev,
          photo: file,
          photoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle comment submit
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentForm.name.trim() || !commentForm.message.trim()) return;

    setIsSubmittingComment(true);

    try {
      // Save comment to localStorage
      const newComment = {
        id: Date.now(),
        name: commentForm.name,
        message: commentForm.message,
        photo: commentForm.photoPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(commentForm.name)}&background=00ffdc&color=000754&size=100`,
        timestamp: new Date().toISOString(),
        likes: 0,
        isPinned: false
      };
      const updatedComments = [newComment, ...comments];
      setComments(updatedComments);
      localStorage.setItem('portfolioComments', JSON.stringify(updatedComments));

      // Reset form
      setCommentForm({ name: '', message: '', photo: null, photoPreview: null });

      // Show success message
      alert('Comment berhasil dipost! 🎉');

    } catch (error) {
      console.error('Error submitting comment:', error);
      alert(`Gagal posting comment: ${error.message}.`);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle like comment
  const handleLikeComment = async (commentId) => {
    try {
      // Find current comment
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      // Update local state untuk tampilan langsung
      const updatedComments = comments.map(c =>
        c.id === commentId
          ? { ...c, likes: c.likes + 1 }
          : c
      );
      setComments(updatedComments);
      localStorage.setItem('portfolioComments', JSON.stringify(updatedComments));

    } catch (error) {
      console.error('Error liking comment:', error);
      alert(`Gagal like comment: ${error.message}`);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      // Update local state untuk tampilan langsung
      const updatedComments = comments.filter(c => c.id !== commentId);
      setComments(updatedComments);
      localStorage.setItem('portfolioComments', JSON.stringify(updatedComments));
      
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(`Gagal delete comment: ${error.message}`);
    }
  };


  const socialLinks = [
    {
      name: 'GitHub',
      icon: <FaGithub />,
      url: 'https://github.com/Liyakhad190',
      hoverClass: 'hover:from-gray-900 hover:to-black hover:shadow-black/50'
    },
    {
      name: 'LinkedIn',
      icon: <FaLinkedin />,
      url: 'https://www.linkedin.com/in/liyakhad-ali-780a3132a',
      hoverClass: 'hover:from-blue-600 hover:to-blue-800 hover:shadow-blue-500/25'
    },
    {
      name: 'Email',
      icon: <FaEnvelope />,
      url: 'mailto:liyakhad2106@gmail.com',
      hoverClass: 'hover:from-red-500 hover:to-red-700 hover:shadow-red-500/25'
    },
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp />,
      url: 'https://wa.me/916374947834',
      hoverClass: 'hover:from-green-500 hover:to-green-700 hover:shadow-green-500/25'
    }
  ];

  return (
    <section id="contact" className="py-20 px-4 pb-32 relative overflow-hidden min-h-screen">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-transparent"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/8 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-500"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20 relative"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-moderniz mb-4">
            <span className="dark:bg-gradient-to-r dark:from-white dark:via-gray-400 dark:to-gray-600 dark:bg-clip-text dark:text-transparent text-gray-200">
              GET IN
            </span>
            {' '}
            <span className="dark:text-white text-gray-800">TOUCH</span>
          </h2>
          <p className="text-xl dark:text-gray-400 text-gray-600 font-cascadia">
            Let's collaborate and create something amazing!
          </p>

        </motion.div>

        <div className="flex flex-col max-w-4xl mx-auto gap-24 lg:gap-32">
          
          {/* 1. Contact Form Panel */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full"
          >
            <div className="relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 dark:bg-gradient-to-r dark:from-gray-600 dark:to-gray-700 bg-gray-700 rounded-full">
                  <FaPaperPlane className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold dark:text-white text-gray-900">Contact Me</h3>
                  <p className="text-lg dark:text-gray-400 text-gray-600 mt-1">Have something to discuss? Send me a message!</p>
                </div>
              </div>

                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                    className="group"
                  >
                    <div className="relative">
                      <FaUser className="absolute z-10 pointer-events-none left-5 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-400 group-focus-within:text-gray-200 dark:group-focus-within:text-gray-600 transition-colors duration-300 text-xl" />
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-14 pr-6 py-5 text-lg dark:bg-gray-800/75 bg-white/85 border border-gray-300/50 dark:border-gray-600/50 rounded-2xl dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-500 focus:bg-white focus:text-black dark:focus:bg-white dark:focus:text-black focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-300 shadow-sm"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                    className="group"
                  >
                    <div className="relative">
                      <FaEnvelope className="absolute z-10 pointer-events-none left-5 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-500 group-focus-within:text-gray-600 transition-colors duration-300 text-xl" />
                      <input
                        type="email"
                        placeholder="Your Email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-14 pr-6 py-5 text-lg dark:bg-gray-800/75 bg-white/85 border border-gray-300/50 dark:border-gray-600/50 rounded-2xl dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-500 focus:bg-white focus:text-black dark:focus:bg-white dark:focus:text-black focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-300 shadow-sm"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                    className="group"
                  >
                    <div className="relative">
                      <FaComment className="absolute z-10 pointer-events-none left-5 top-6 dark:text-gray-400 text-gray-500 group-focus-within:text-gray-600 transition-colors duration-300 text-xl" />
                      <textarea
                        placeholder="Your Message"
                        rows="5"
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full pl-14 pr-6 py-5 text-lg dark:bg-gray-800/75 bg-white/85 border border-gray-300/50 dark:border-gray-600/50 rounded-2xl dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-500 focus:bg-white focus:text-black dark:focus:bg-white dark:focus:text-black focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-300 resize-none shadow-sm"
                        required
                      ></textarea>
                    </div>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={isSubmittingContact}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full dark:bg-[#FFFFFF] dark:text-[#333333] hover:dark:bg-[#F0F0F0] bg-[#333333] text-[#FFFFFF] hover:bg-[#707070] font-bold text-xl py-5 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isSubmittingContact ? (
                      <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FaPaperPlane />
                        <span>Send Message</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>

            </motion.div>

            {/* 2. Social Media Panel */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full"
            >
              <h3 className="text-3xl md:text-4xl font-bold dark:text-white text-gray-900 mb-8 text-center">Connect With Me</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {socialLinks.map((social, index) => (
                    <motion.div
                      key={social.name}
                      onClick={() => window.open(social.url, '_blank', 'noopener,noreferrer')}
                      onHoverStart={() => setHoveredSocial(social.name)}
                      onHoverEnd={() => setHoveredSocial(null)}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      className={`cursor-pointer group flex items-center gap-5 p-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl text-white transition-all duration-300 ${social.hoverClass} hover:shadow-xl border border-gray-700/50`}
                    >
                      <motion.div 
                        className="text-4xl"
                        animate={hoveredSocial === social.name ? {
                          scale: [1, 0.7, 1.3, 1],
                          rotate: [0, -20, 20, -10, 0]
                        } : {
                          scale: 1,
                          rotate: 0
                        }}
                        transition={{ duration: 0.6, type: "spring", bounce: 0.6 }}
                      >
                        {social.icon}
                      </motion.div>
                      <div className="flex-1">
                        <span className="font-bold text-xl">{social.name}</span>
                        <p className="text-base opacity-90 mt-1">Follow me on {social.name}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-2xl">
                        <FaReply className="rotate-180" />
                      </div>
                    </motion.div>
                  ))}
                </div>
            </motion.div>

            {/* 3. Comments System */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full space-y-12"
            >
              {/* Comment Form Panel */}
              <div className="relative">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 dark:bg-gradient-to-r dark:from-gray-700 dark:to-gray-600 bg-gray-700 rounded-full">
                    <FaComment className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold dark:text-white text-gray-900">Leave a Comment</h3>
                    <p className="text-lg dark:text-gray-400 text-gray-600 mt-1">Share your thoughts!</p>
                  </div>
                </div>

                <form onSubmit={handleCommentSubmit} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                      className="flex-shrink-0 flex justify-center md:justify-start"
                    >
                      <div className="relative">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full dark:bg-gray-800/75 bg-white/85 border border-gray-300/50 dark:border-gray-600/50 overflow-hidden shadow-sm">
                          {commentForm.photoPreview ? (
                            <img src={commentForm.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                              <FaUser />
                            </div>
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 md:bottom-2 md:right-2 dark:bg-white dark:text-black bg-gray-900 text-white p-3 md:p-4 rounded-full cursor-pointer hover:scale-110 shadow-lg transition-transform duration-300">
                          <FaCamera className="text-lg md:text-xl" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                      className="flex-1 space-y-6"
                    >
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={commentForm.name}
                        onChange={(e) => setCommentForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-6 py-5 text-lg dark:bg-gray-800/75 bg-white/85 border border-gray-300/50 dark:border-gray-600/50 rounded-2xl dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-500 focus:bg-white focus:text-black dark:focus:bg-white dark:focus:text-black focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-300 shadow-sm"
                        required
                      />
                      <textarea
                        placeholder="Write your comment..."
                        rows="4"
                        value={commentForm.message}
                        onChange={(e) => setCommentForm(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full px-6 py-5 text-lg dark:bg-gray-800/75 bg-white/85 border border-gray-300/50 dark:border-gray-600/50 rounded-2xl dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-500 focus:bg-white focus:text-black dark:focus:bg-white dark:focus:text-black focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-300 resize-none shadow-sm"
                        required
                      ></textarea>
                    </motion.div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmittingComment}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-6 dark:bg-[#FFFFFF] dark:text-[#333333] hover:dark:bg-[#F0F0F0] bg-[#333333] text-[#FFFFFF] hover:bg-[#707070] font-bold text-xl py-5 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isSubmittingComment ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FaComment />
                        <span>Post Comment</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>

            {/* Comments Display */}
            <div className="space-y-6 pt-10 border-t dark:border-gray-800 border-gray-200">
              <h4 className="text-2xl font-bold dark:text-white text-gray-900 flex items-center gap-3">
                <FaComment className="dark:text-white/60 text-gray-500 text-3xl" />
                Comments ({comments.length})
              </h4>

              <div className="relative">
                <div data-lenis-prevent className="space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar pb-20 pr-4">
                  <AnimatePresence>
                    {comments.map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, x: -100 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`group relative rounded-2xl p-6 border transition-all duration-300 ${comment.isPinned
                          ? 'bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-white/50/50 shadow-lg shadow-white/20/10'
                          : 'dark:bg-gray-800/50 bg-white border-gray-200 dark:border-gray-700/30 hover:border-white/50/30 shadow-sm'
                          }`}
                      >
                        {/* 📌 Pin Indicator */}
                        {comment.isPinned && (
                          <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full border border-white/50/30">
                            <FaThumbtack className="w-4 h-4 text-white/60" />
                            <span className="text-xs font-semibold text-white/70">Pinned</span>
                          </div>
                        )}

                        <div className="flex gap-4">
                          <img
                            src={comment.photo}
                            alt={comment.name}
                            className="w-16 h-16 rounded-full object-cover border-2 dark:border-gray-600 border-gray-300"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="text-lg font-bold dark:text-white text-gray-900">{comment.name}</h5>
                                <p className="text-sm dark:text-gray-400 text-gray-500 mt-1">
                                  {new Date(comment.timestamp).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <p className="text-lg dark:text-gray-300 text-gray-700 mt-3 leading-relaxed">{comment.message}</p>
                            <div className="flex items-center gap-6 mt-5">
                              <button
                                onClick={() => handleLikeComment(comment.id)}
                                className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors duration-300 group/like"
                              >
                                <FaHeart className="group-hover/like:scale-110 transition-transform duration-300" />
                                <span className="text-sm">{comment.likes}</span>
                              </button>
                              
                              {isAuthenticated && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors duration-300 group/delete"
                                  title="Delete comment"
                                >
                                  <FaTrash className="group-hover/delete:scale-110 transition-transform duration-300" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {comments.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                      <FaComment className="text-6xl text-gray-400 mx-auto mb-6" />
                      <p className="text-xl text-gray-500 font-cascadia">No comments yet. Be the first!</p>
                    </div>
                  )}
                </div>

                {/* ✨ Gradient Fade Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t dark:from-[#0a0a0a] from-slate-50 via-slate-50/60 dark:via-[#0a0a0a]/60 to-transparent pointer-events-none z-10 rounded-b-2xl" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #10b981);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #059669);
        }
      `}</style>
    </section>
  );
};

export default Contact;