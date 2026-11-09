// API service backed by Supabase & Local Fallbacks
import { 
  getProjects, 
  saveProject, 
  deleteProjectFromDB, 
  getCertificates, 
  saveCertificate, 
  deleteCertificateFromDB,
  getComments,
  postCommentToDB,
  deleteCommentFromDB,
  postContactMessage,
  getContactMessages,
  uploadStorageFile,
  isSupabaseConfigured
} from '../lib/supabaseClient';

export const apiService = {
  isSupabaseConfigured,
  getProjects,
  saveProject,
  deleteProject: deleteProjectFromDB,
  getCertificates,
  saveCertificate,
  deleteCertificate: deleteCertificateFromDB,
  getComments,
  postComment: postCommentToDB,
  deleteComment: deleteCommentFromDB,
  postContactMessage,
  getContactMessages,
  uploadStorageFile,

  async getGallery() {
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) return await res.json();
      return JSON.parse(localStorage.getItem('portfolio_gallery') || '[]');
    } catch (e) {
      return JSON.parse(localStorage.getItem('portfolio_gallery') || '[]');
    }
  },

  async saveGallery(items) {
    try {
      localStorage.setItem('portfolio_gallery', JSON.stringify(items));
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });
      return res.ok;
    } catch (e) {
      return true;
    }
  },
};

export default apiService;
