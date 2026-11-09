import { createClient } from '@supabase/supabase-js';
import defaultProjects from '../data/projects.json';
import defaultCertificates from '../data/certificates.json';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('YOUR_SUPABASE'));
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==============================================================================
// AUTHENTICATION API (SUPABASE AUTH)
// ==============================================================================
export const supabaseSignIn = async (emailOrUser, password) => {
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  // Allow email or username (convert admin username to email format if needed)
  const email = emailOrUser.includes('@') ? emailOrUser.trim() : `${emailOrUser.trim()}@admin.local`;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password.trim()
  });

  if (error) {
    // Try raw email in case admin registered with email
    const fallbackRes = await supabase.auth.signInWithPassword({
      email: emailOrUser.trim(),
      password: password.trim()
    });
    if (!fallbackRes.error) {
      return { success: true, user: fallbackRes.data.user, session: fallbackRes.data.session };
    }
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user, session: data.session };
};

export const supabaseSignOut = async () => {
  if (supabase) {
    await supabase.auth.signOut();
  }
};

export const getSupabaseUser = async () => {
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  }
  return null;
};

// ==============================================================================
// PROJECTS API
// ==============================================================================
export const getProjects = async () => {
  if (supabase) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map(p => ({
        ...p,
        tech: typeof p.tech === 'string' ? JSON.parse(p.tech) : p.tech
      }));
    }
  }

  // Fallback to local storage or local JSON
  try {
    const local = localStorage.getItem('portfolio_projects');
    if (local) return JSON.parse(local);
  } catch (e) {
    console.warn('Fallback to default projects JSON');
  }
  return defaultProjects;
};

export const saveProject = async (projectData) => {
  if (supabase) {
    const payload = {
      title: projectData.title,
      description: projectData.description,
      tech: Array.isArray(projectData.tech) ? projectData.tech : projectData.tech.split(',').map(t => t.trim()),
      link: projectData.link || '',
      image: projectData.image || '',
      category: projectData.category || 'Web/Apps',
      display_order: projectData.display_order || 0
    };

    if (projectData.id && typeof projectData.id === 'string' && projectData.id.includes('-')) {
      const { data, error } = await supabase.from('projects').update(payload).eq('id', projectData.id).select();
      if (!error) return { success: true, data: data[0] };
    } else {
      const { data, error } = await supabase.from('projects').insert([payload]).select();
      if (!error) return { success: true, data: data[0] };
    }
  }

  // Local fallback
  const current = await getProjects();
  const newProject = {
    id: projectData.id || Date.now().toString(),
    ...projectData,
    tech: Array.isArray(projectData.tech) ? projectData.tech : projectData.tech.split(',').map(t => t.trim())
  };
  const updated = [newProject, ...current.filter(p => String(p.id) !== String(newProject.id))];
  localStorage.setItem('portfolio_projects', JSON.stringify(updated));
  return { success: true, data: newProject };
};

export const deleteProjectFromDB = async (id) => {
  if (supabase && typeof id === 'string' && id.includes('-')) {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) return true;
  }

  const current = await getProjects();
  const updated = current.filter(p => String(p.id) !== String(id));
  localStorage.setItem('portfolio_projects', JSON.stringify(updated));
  return true;
};

// ==============================================================================
// CERTIFICATES API
// ==============================================================================
export const getCertificates = async () => {
  if (supabase) {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  }

  try {
    const local = localStorage.getItem('portfolio_certificates');
    if (local) return JSON.parse(local);
  } catch (e) {
    console.warn('Fallback to default certificates JSON');
  }
  return defaultCertificates;
};

export const saveCertificate = async (certData) => {
  if (supabase) {
    const payload = {
      title: certData.title,
      issuer: certData.issuer,
      date: certData.date,
      link: certData.link || '',
      image: certData.image || '',
      display_order: certData.display_order || 0
    };

    if (certData.id && typeof certData.id === 'string' && certData.id.includes('-')) {
      const { data, error } = await supabase.from('certificates').update(payload).eq('id', certData.id).select();
      if (!error) return { success: true, data: data[0] };
    } else {
      const { data, error } = await supabase.from('certificates').insert([payload]).select();
      if (!error) return { success: true, data: data[0] };
    }
  }

  const current = await getCertificates();
  const newCert = { id: certData.id || Date.now().toString(), ...certData };
  const updated = [newCert, ...current.filter(c => String(c.id) !== String(newCert.id))];
  localStorage.setItem('portfolio_certificates', JSON.stringify(updated));
  return { success: true, data: newCert };
};

export const deleteCertificateFromDB = async (id) => {
  if (supabase && typeof id === 'string' && id.includes('-')) {
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    if (!error) return true;
  }

  const current = await getCertificates();
  const updated = current.filter(c => String(c.id) !== String(id));
  localStorage.setItem('portfolio_certificates', JSON.stringify(updated));
  return true;
};

// ==============================================================================
// COMMENTS & FEEDBACK API
// ==============================================================================
export const getComments = async () => {
  if (supabase) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) return data;
  }

  try {
    return JSON.parse(localStorage.getItem('portfolioComments') || '[]');
  } catch (e) {
    return [];
  }
};

export const postCommentToDB = async (comment) => {
  if (supabase) {
    const { data, error } = await supabase.from('comments').insert([{
      name: comment.name || 'Anonymous',
      email: comment.email || '',
      message: comment.message || comment.comment,
      is_approved: true
    }]).select();

    if (!error) return { success: true, data: data[0] };
  }

  const current = await getComments();
  const updated = [{ id: Date.now().toString(), created_at: new Date().toISOString(), ...comment }, ...current];
  localStorage.setItem('portfolioComments', JSON.stringify(updated));
  return { success: true };
};

export const deleteCommentFromDB = async (id, index) => {
  if (supabase && typeof id === 'string' && id.includes('-')) {
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (!error) return true;
  }

  const current = await getComments();
  const updated = current.filter((_, idx) => idx !== index);
  localStorage.setItem('portfolioComments', JSON.stringify(updated));
  return true;
};

// ==============================================================================
// MESSAGES API (CONTACT FORM)
// ==============================================================================
export const postContactMessage = async (msg) => {
  if (supabase) {
    const { data, error } = await supabase.from('messages').insert([{
      name: msg.name,
      email: msg.email,
      subject: msg.subject || 'Portfolio Inquiry',
      message: msg.message
    }]).select();

    if (!error) return { success: true, data: data[0] };
  }

  const current = JSON.parse(localStorage.getItem('portfolioMessages') || '[]');
  const updated = [{ id: Date.now().toString(), created_at: new Date().toISOString(), ...msg }, ...current];
  localStorage.setItem('portfolioMessages', JSON.stringify(updated));
  return { success: true };
};

export const getContactMessages = async () => {
  if (supabase) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) return data;
  }

  return JSON.parse(localStorage.getItem('portfolioMessages') || '[]');
};

// ==============================================================================
// STORAGE UPLOAD API
// ==============================================================================
export const uploadStorageFile = async (file, bucketName = 'portfolio-assets') => {
  if (!supabase) {
    return { success: false, error: 'Supabase client not configured.' };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (error) return { success: false, error: error.message };

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    return { success: true, url: publicUrlData.publicUrl };
  } catch (e) {
    return { success: false, error: e.message };
  }
};
