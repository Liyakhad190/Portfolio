import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaTrash, 
  FaSave, 
  FaSignOutAlt, 
  FaKey, 
  FaShieldAlt, 
  FaClock, 
  FaProjectDiagram, 
  FaCertificate, 
  FaComments, 
  FaExternalLinkAlt, 
  FaTimes, 
  FaCheck, 
  FaLock, 
  FaUserShield,
  FaRedo,
  FaExclamationTriangle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import projectsData from '../data/projects.json';
import certificatesData from '../data/certificates.json';
import { useTheme } from '../contexts/ThemeContext';
import { useAdmin } from '../contexts/AdminContext';
import AdminLogin from '../components/AdminLogin';

const Admin = () => {
  const { theme } = useTheme();
  const { 
    isAuthenticated, 
    adminUser, 
    logout, 
    getSessionTimeRemaining, 
    extendSession, 
    changePassword 
  } = useAdmin();

  // If not authenticated, show modern Admin Login page
  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  // Authenticated Dashboard State
  const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'certificates', 'comments', 'messages'
  const [projects, setProjects] = useState(projectsData);
  const [certificates, setCertificates] = useState(certificatesData);
  const [comments, setComments] = useState([]);
  const [messagesList, setMessagesList] = useState([]);
  const [sessionTimer, setSessionTimer] = useState('');
  const [isSupabaseActive, setIsSupabaseActive] = useState(false);
  
  // New Project Form
  const [newProject, setNewProject] = useState({
    title: '', description: '', tech: '', link: '', image: '', category: 'Web/Apps'
  });
  
  // New Certificate Form
  const [newCert, setNewCert] = useState({
    title: '', issuer: '', date: '', link: '', image: ''
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ type: '', text: '' });

  // Load Data from Supabase / Backend on mount
  const refreshData = async () => {
    setIsSupabaseActive(apiService.isSupabaseConfigured());
    const [projs, certs, comms, msgs] = await Promise.all([
      apiService.getProjects(),
      apiService.getCertificates(),
      apiService.getComments(),
      apiService.getContactMessages()
    ]);
    if (projs) setProjects(projs);
    if (certs) setCertificates(certs);
    if (comms) setComments(comms);
    if (msgs) setMessagesList(msgs);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Session countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const remainingMs = getSessionTimeRemaining();
      if (remainingMs <= 0) {
        logout();
        return;
      }
      const mins = Math.floor(remainingMs / (1000 * 60));
      const secs = Math.floor((remainingMs % (1000 * 60)) / 1000);
      setSessionTimer(`${mins}:${String(secs).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [getSessionTimeRemaining, logout]);

  const showNotification = (text, type = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  const handleFileUpload = async (e, targetField, bucket = 'portfolio-assets') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    showNotification('Uploading asset to Supabase Storage...', 'info');

    const res = await apiService.uploadStorageFile(file, bucket);
    setUploadingImage(false);

    if (res.success && res.url) {
      if (targetField === 'project') {
        setNewProject(prev => ({ ...prev, image: res.url }));
      } else if (targetField === 'cert') {
        setNewCert(prev => ({ ...prev, image: res.url }));
      }
      showNotification('Asset uploaded successfully!');
    } else {
      showNotification(res.error || 'Asset upload failed. Enter image URL manually.', 'error');
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await apiService.saveProject(newProject);
    setSaving(false);
    if (res.success) {
      showNotification('Project saved to Supabase backend!');
      setNewProject({ title: '', description: '', tech: '', link: '', image: '', category: 'Web/Apps' });
      await refreshData();
    } else {
      showNotification('Failed to save project', 'error');
    }
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await apiService.saveCertificate(newCert);
    setSaving(false);
    if (res.success) {
      showNotification('Certificate saved to Supabase backend!');
      setNewCert({ title: '', issuer: '', date: '', link: '', image: '' });
      await refreshData();
    } else {
      showNotification('Failed to save certificate', 'error');
    }
  };

  // Execute Deletion
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);

    if (deleteTarget.type === 'project') {
      await apiService.deleteProject(deleteTarget.id);
      showNotification(`Project "${deleteTarget.title}" deleted.`);
    } else if (deleteTarget.type === 'certificate') {
      await apiService.deleteCertificate(deleteTarget.id);
      showNotification(`Certificate "${deleteTarget.title}" deleted.`);
    } else if (deleteTarget.type === 'comment') {
      await apiService.deleteComment(deleteTarget.id, deleteTarget.index);
      showNotification('Comment deleted.');
    } else if (deleteTarget.type === 'all_comments') {
      setComments([]);
      localStorage.removeItem('portfolioComments');
      showNotification('All comments cleared.');
    }

    setSaving(false);
    setDeleteTarget(null);
    await refreshData();
  };

  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    const result = changePassword(currentPassword, newPassword);
    if (result.success) {
      setPasswordStatus({ type: 'success', text: result.message });
      setTimeout(() => {
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordStatus({ type: '', text: '' });
        showNotification('Password updated successfully!');
      }, 1200);
    } else {
      setPasswordStatus({ type: 'error', text: result.error });
    }
  };

  return (
    <div className="relative z-10 min-h-screen pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto dark:text-white text-slate-900 transition-colors">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 text-sm font-semibold border ${
              message.type === 'error' 
                ? 'bg-red-500/90 text-white border-red-400' 
                : message.type === 'info'
                ? 'bg-blue-600/90 text-white border-blue-400'
                : 'bg-emerald-600/90 text-white border-emerald-400'
            }`}
          >
            {message.type === 'error' ? <FaTimes /> : <FaCheck />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Admin Control Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/70 dark:bg-[#151518]/80 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 md:p-6 mb-8 shadow-xl flex flex-wrap items-center justify-between gap-4"
      >
        {/* Left: User & Role Badge */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 text-xl font-bold">
            <FaUserShield />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold dark:text-white text-slate-900 tracking-tight font-moderniz">
                Admin Panel
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider border border-cyan-500/20">
                {adminUser?.role || 'Super Admin'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Logged in as <strong className="dark:text-slate-200 text-slate-700">{adminUser?.username || 'admin'}</strong>
            </p>
          </div>
        </div>

        {/* Right: Actions (Session Timer, Change Password, Live Site, Logout) */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Session Timer Badge */}
          <button
            type="button"
            onClick={extendSession}
            title="Click to extend active session duration"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-black/40 hover:bg-slate-200 dark:hover:bg-black/60 border border-slate-200 dark:border-white/10 text-xs font-mono dark:text-slate-300 text-slate-700 transition-all cursor-pointer group"
          >
            <FaClock className="text-cyan-500 group-hover:rotate-180 transition-transform duration-500" />
            <span>Session: <strong>{sessionTimer || '60:00'}</strong></span>
            <FaRedo className="text-[10px] text-slate-400 group-hover:text-cyan-500" />
          </button>

          {/* Change Password Button */}
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-black/40 hover:bg-slate-200 dark:hover:bg-black/60 border border-slate-200 dark:border-white/10 text-xs font-medium dark:text-slate-300 text-slate-700 transition-all cursor-pointer"
          >
            <FaKey className="text-amber-500 text-xs" />
            <span>Change Password</span>
          </button>

          {/* View Live Portfolio */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-black/40 hover:bg-slate-200 dark:hover:bg-black/60 border border-slate-200 dark:border-white/10 text-xs font-medium dark:text-slate-300 text-slate-700 transition-all"
          >
            <FaExternalLinkAlt className="text-xs text-blue-500" />
            <span>Live Site</span>
          </Link>

          {/* Logout Button */}
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold transition-all cursor-pointer"
          >
            <FaSignOutAlt className="text-xs" />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="backdrop-blur-md bg-white/50 dark:bg-white/5 p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl">
            <FaProjectDiagram />
          </div>
          <div>
            <div className="text-2xl font-bold dark:text-white text-slate-900">{projects.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Projects</div>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/50 dark:bg-white/5 p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl">
            <FaCertificate />
          </div>
          <div>
            <div className="text-2xl font-bold dark:text-white text-slate-900">{certificates.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Certificates</div>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/50 dark:bg-white/5 p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-xl">
            <FaComments />
          </div>
          <div>
            <div className="text-2xl font-bold dark:text-white text-slate-900">{comments.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Comments & Feedback</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-slate-200 dark:border-white/10 pb-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <FaProjectDiagram />
          <span>Projects ({projects.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('certificates')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
            activeTab === 'certificates'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <FaCertificate />
          <span>Certificates ({certificates.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
            activeTab === 'comments'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <FaComments />
          <span>Comments ({comments.length})</span>
        </button>
      </div>

      {/* Tab Contents: Projects */}
      {activeTab === 'projects' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Add Project Form */}
          <div className="lg:col-span-5 backdrop-blur-xl bg-white/70 dark:bg-[#151518]/80 p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl">
            <h2 className="text-xl font-bold mb-4 dark:text-white text-slate-900 flex items-center gap-2">
              <FaPlus className="text-cyan-500 text-sm" /> Add New Project
            </h2>
            <form onSubmit={handleAddProject} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Title</label>
                <input required type="text" placeholder="Project Title" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 dark:text-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Description</label>
                <textarea required placeholder="Detailed project description" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 dark:text-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50" rows="3" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Tech Stack (comma separated)</label>
                <input required type="text" placeholder="React, Vite, Tailwind CSS, Node.js" value={newProject.tech} onChange={e => setNewProject({...newProject, tech: e.target.value})} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 dark:text-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Live Demo / Repo URL</label>
                <input required type="text" placeholder="https://..." value={newProject.link} onChange={e => setNewProject({...newProject, link: e.target.value})} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 dark:text-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Cover Image URL</label>
                <div className="flex gap-2">
                  <input required type="text" placeholder="Image URL or upload file" value={newProject.image} onChange={e => setNewProject({...newProject, image: e.target.value})} className="flex-1 p-3 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 dark:text-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50" />
                  <label className="px-3.5 py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all">
                    <span>Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'project', 'portfolio-assets')} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Category</label>
                <select value={newProject.category} onChange={e => setNewProject({...newProject, category: e.target.value})} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 dark:text-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50">
                  <option value="Web/Apps" className="text-slate-900 dark:text-black">Web/Apps</option>
                  <option value="AI & IOT" className="text-slate-900 dark:text-black">AI & IOT</option>
                  <option value="UI/UX Design" className="text-slate-900 dark:text-black">UI/UX Design</option>
                  <option value="Mobile Development" className="text-slate-900 dark:text-black">Mobile Development</option>
                </select>
              </div>
              <button type="submit" disabled={saving} className="mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white p-3.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer">
                <FaPlus /> Add Project
              </button>
            </form>
          </div>

          {/* Project List */}
          <div className="lg:col-span-7 backdrop-blur-xl bg-white/70 dark:bg-[#151518]/80 p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl">
            <h2 className="text-xl font-bold mb-4 dark:text-white text-slate-900">Existing Projects ({projects.length})</h2>
            <div data-lenis-prevent className="flex flex-col gap-3 max-h-[620px] overflow-y-auto pr-2 custom-scrollbar">
              {projects.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-100/80 dark:bg-black/30 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-cyan-500/40 transition-all">
                  <div className="pr-4">
                    <h3 className="font-bold text-base dark:text-white text-slate-900">{p.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{p.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[11px] font-medium">{p.category}</span>
                      <span className="text-[11px] text-slate-400">{Array.isArray(p.tech) ? p.tech.slice(0, 3).join(', ') : p.tech}</span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ type: 'project', id: p.id, title: p.title });
                    }} 
                    title="Delete Project"
                    className="text-red-500 hover:text-red-600 dark:hover:text-red-400 p-2.5 rounded-xl hover:bg-red-500/10 transition-all flex-shrink-0 cursor-pointer"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Contents: Certificates */}
      {activeTab === 'certificates' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Add Certificate Form */}
          <div className="lg:col-span-5 backdrop-blur-xl bg-white/70 dark:bg-[#151518]/80 p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl">
            <h2 className="text-xl font-bold mb-4 dark:text-white text-slate-900 flex items-center gap-2">
              <FaPlus className="text-emerald-500 text-sm" /> Add New Certificate
            </h2>
            <form onSubmit={handleAddCert} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Title</label>
                <input required type="text" placeholder="Certificate Name" value={newCert.title} onChange={e => setNewCert({...newCert, title: e.target.value})} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 dark:text-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Issuer</label>
                <input required type="text" placeholder="e.g. Google, Coursera, Dicoding" value={newCert.issuer} onChange={e => setNewCert({...newCert, issuer: e.target.value})} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 dark:text-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Date</label>
                <input required type="text" placeholder="e.g. Dec 2024" value={newCert.date} onChange={e => setNewCert({...newCert, date: e.target.value})} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 dark:text-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">PDF / Credential Link</label>
                <input required type="text" placeholder="https://..." value={newCert.link} onChange={e => setNewCert({...newCert, link: e.target.value})} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 dark:text-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Image URL</label>
                <input required type="text" placeholder="Image preview URL" value={newCert.image} onChange={e => setNewCert({...newCert, image: e.target.value})} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 dark:text-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <button type="submit" disabled={saving} className="mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-3.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer">
                <FaPlus /> Add Certificate
              </button>
            </form>
          </div>

          {/* Certificate List */}
          <div className="lg:col-span-7 backdrop-blur-xl bg-white/70 dark:bg-[#151518]/80 p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl">
            <h2 className="text-xl font-bold mb-4 dark:text-white text-slate-900">Existing Certificates ({certificates.length})</h2>
            <div data-lenis-prevent className="flex flex-col gap-3 max-h-[620px] overflow-y-auto pr-2 custom-scrollbar">
              {certificates.map(c => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-slate-100/80 dark:bg-black/30 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 transition-all">
                  <div className="pr-4">
                    <h3 className="font-bold text-base dark:text-white text-slate-900">{c.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.issuer} • {c.date}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ type: 'certificate', id: c.id, title: c.title });
                    }} 
                    title="Delete Certificate"
                    className="text-red-500 hover:text-red-600 dark:hover:text-red-400 p-2.5 rounded-xl hover:bg-red-500/10 transition-all flex-shrink-0 cursor-pointer"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Contents: Comments */}
      {activeTab === 'comments' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/70 dark:bg-[#151518]/80 p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold dark:text-white text-slate-900">Portfolio Feedback & Comments ({comments.length})</h2>
            {comments.length > 0 && (
              <button
                type="button"
                onClick={() => setDeleteTarget({ type: 'all_comments', title: 'All Comments' })}
                className="text-xs text-red-500 hover:text-red-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer"
              >
                Clear All Comments
              </button>
            )}
          </div>

          <div data-lenis-prevent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={index} className="flex flex-col p-4 bg-slate-100/80 dark:bg-black/30 rounded-2xl border border-slate-200/80 dark:border-white/10 relative group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-sm dark:text-white text-slate-900">{comment.name || 'Anonymous'}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">{comment.date || 'Recent'}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ type: 'comment', index: index, title: `Comment by ${comment.name || 'Anonymous'}` });
                        }}
                        title="Delete Comment"
                        className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {comment.message || comment.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-400 text-sm">
                No feedback or comments received yet.
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-xl flex-shrink-0">
                  <FaExclamationTriangle />
                </div>
                <div>
                  <h3 className="font-bold text-lg dark:text-white text-slate-900">
                    Confirm Deletion
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Are you sure you want to delete <strong className="dark:text-white text-slate-800">"{deleteTarget.title}"</strong>?
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 bg-red-500/5 dark:bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                This action is permanent and cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={saving}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={saving}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FaTrash className="text-xs" />
                  )}
                  <span>Delete Permanently</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg">
                    <FaLock />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg dark:text-white text-slate-900">Change Admin Password</h3>
                    <p className="text-xs text-slate-500">Update your security credentials</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>

              {passwordStatus.text && (
                <div className={`p-3 rounded-xl mb-4 text-xs font-semibold ${
                  passwordStatus.type === 'error'
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                }`}>
                  {passwordStatus.text}
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 dark:text-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 4 characters"
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 dark:text-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 dark:text-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Admin;
