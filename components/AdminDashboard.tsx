import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project, ServiceCategory, ContactInfo, ServiceItem, Message, Review, UserRole, CerakoteProduct, CerakoteFinish } from '../types';
import { CERAKOTE_COLORS } from '../cerakoteData';
import TeamManagement from './TeamManagement';
import SEO from './SEO';

interface AdminDashboardProps {
  projects: Project[];
  onUpdateProjects: (projects: Project[]) => void;
  contactInfo: ContactInfo;
  onUpdateContact: (info: ContactInfo) => void;
  services: ServiceItem[];
  onUpdateServices: (services: ServiceItem[]) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  projects, onUpdateProjects,
  contactInfo, onUpdateContact,
  services, onUpdateServices,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'services' | 'reviews' | 'projects' | 'themes' | 'messages' | 'team' | 'cerakote'>('general');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // RBAC State
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [debugAuthId, setDebugAuthId] = useState<string>('');

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Project Form State
  const [projectForm, setProjectForm] = useState<Partial<Project>>({});

  // Service Form State
  const [serviceForm, setServiceForm] = useState<Partial<ServiceItem>>({});

  // General Info Form State
  const [generalForm, setGeneralForm] = useState<ContactInfo>(contactInfo);

  // Messages State
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
  const [messageViewMode, setMessageViewMode] = useState<'active' | 'archived'>('active');

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState<Partial<Review>>({});

  // Cerakote Products State
  const [cerakoteProducts, setCerakoteProducts] = useState<CerakoteProduct[]>([]);
  const [productForm, setProductForm] = useState<Partial<CerakoteProduct>>({});

  // Cerakote Finishes State
  const [cerakoteFinishes, setCerakoteFinishes] = useState<CerakoteFinish[]>([]);
  const [finishForm, setFinishForm] = useState<Partial<CerakoteFinish>>({});

  // Fetch Permissions on Mount
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setDebugAuthId(user.id);

        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          console.error('Error fetching permissions:', error);
          console.log('Current User:', user.id, user.email); // DIAGNOSTIC LOG
          if (user.email === 'admin@helixmotorcycles.com') {
            showNotification('Role not found. Please run db_rbac.sql in Supabase!', 'error');
          }
        }

        if (data) {
          setCurrentUserRole(data as UserRole);
        }
      } catch (err) {
        console.error('Permission check failed:', err);
      } finally {
        setLoadingPermissions(false);
      }
    };
    fetchPermissions();
  }, []);

  // Update form when contactInfo changes
  useEffect(() => {
    if (contactInfo) {
      const defaultOrder = ['helix', 'services', 'showroom', 'location', 'reviews', 'ai_garage'];
      const currentOrder = contactInfo.sectionOrder || defaultOrder;
      const finalOrder = [...new Set([...currentOrder, ...defaultOrder])];

      setGeneralForm({
        ...contactInfo,
        sectionOrder: finalOrder
      });
    }
  }, [contactInfo]);

  // Clear editing state and fetch messages when tab changes
  useEffect(() => {
    setEditingId(null);
    setSaveSuccess(false);

    if (activeTab === 'messages') {
      if (!currentUserRole?.permissions.view_messages) {
        setError("You do not have permission to view messages.");
        return;
      }
      const fetchMessages = async () => {
        setError(null);
        let query = supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (messageViewMode === 'active') {
          query = query.neq('is_archived', true);
        } else {
          query = query.eq('is_archived', true);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching messages:', error);
          setError(`Failed to fetch messages: ${error.message}`);
        }
        if (data) setMessages(data as Message[]);
      };
      fetchMessages();
    } else if (activeTab === 'reviews') {
      const fetchReviews = async () => {
        setError(null);
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching reviews:', error);
          setError(`Failed to fetch reviews: ${error.message}`);
        }
        if (data) setReviews(data as Review[]);
      };
      fetchReviews();
    } else if (activeTab === 'cerakote') {
      const fetchProducts = async () => {
        const { data, error } = await supabase
          .from('cerakote_products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching products:', error);
          showNotification('Failed to fetch products', 'error');
        }
        if (data) setCerakoteProducts(data as CerakoteProduct[]);
      };
      fetchProducts();

      const fetchFinishes = async () => {
        const { data, error } = await supabase
          .from('cerakote_finishes')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching finishes:', error);
        }
        if (data) setCerakoteFinishes(data as CerakoteFinish[]);
      };
      fetchFinishes();
    }
  }, [activeTab, messageViewMode, currentUserRole]);

  // --- HANDLERS WITH PERMISSION CHECKS ---

  const checkPermission = (permission: keyof UserRole['permissions']) => {
    if (!currentUserRole?.permissions[permission]) {
      showNotification('Access Denied: Insufficient Permissions', 'error');
      return false;
    }
    return true;
  };

  // ... (Keep existing handlers but wrap in checkPermission)
  // I will implement the wrappers in the next step to keep this chunk manageable.
  // For now, I'm setting up the structure and the Render method.



  const toggleMessageSelection = (id: string) => {
    const newSelected = new Set(selectedMessageIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMessageIds(newSelected);
  };

  const toggleSelectAllMessages = () => {
    if (selectedMessageIds.size === messages.length) {
      setSelectedMessageIds(new Set());
    } else {
      setSelectedMessageIds(new Set(messages.map(m => m.id)));
    }
  };

  const handleArchiveMessage = async (id: string) => {
    setError(null);
    if (!checkPermission('manage_messages')) return;
    // No confirmation dialog

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_archived: true })
        .eq('id', id);

      if (error) throw error;

      setMessages(prev => prev.filter(m => m.id !== id));
      setSelectedMessageIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error: any) {
      console.error('Error archiving message:', error);
      setError(`Failed to archive message: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    setError(null);
    if (!checkPermission('manage_messages')) return;
    // No confirmation dialog

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessages(prev => prev.filter(m => m.id !== id));
      setSelectedMessageIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error: any) {
      console.error('Error deleting message:', error);
      setError(`Failed to delete message: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSaveReview = async () => {
    setError(null);
    if (!checkPermission('manage_reviews')) return;
    try {
      const reviewData = {
        name: reviewForm.name,
        rating: reviewForm.rating,
        text: reviewForm.text,
        date: reviewForm.date || new Date().toISOString().split('T')[0]
      };

      if (reviewForm.id) {
        // Update
        const { error } = await supabase
          .from('reviews')
          .update(reviewData)
          .eq('id', reviewForm.id);

        if (error) throw error;

        setReviews(prev => prev.map(r => r.id === reviewForm.id ? { ...r, ...reviewData } : r));
      } else {
        // Insert
        const { data, error } = await supabase
          .from('reviews')
          .insert([reviewData])
          .select()
          .single();

        if (error) throw error;
        setReviews(prev => [data, ...prev]);
      }

      setEditingId(null);
      setReviewForm({});
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving review:', error);
      setError(`Failed to save review: ${error.message}`);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!checkPermission('manage_reviews')) return;
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReviews(prev => prev.filter(r => r.id !== id));
      showNotification('Review Deleted');
    } catch (error: any) {
      console.error('Error deleting review:', error);
      showNotification('Failed to delete review', 'error');
    }
  };

  const handleSaveReviewSettings = async () => {
    if (!checkPermission('manage_reviews')) return;
    try {
      const { data: existing } = await supabase.from('contact_info').select('id').limit(1).single();
      if (existing) {
        const { error } = await supabase.from('contact_info').update({
          show_reviews: generalForm.showReviews
        }).eq('id', existing.id);
        if (error) throw error;
      }
      onUpdateContact(generalForm);
      showNotification('Review Settings Saved');
    } catch (error) {
      console.error('Error saving review settings:', error);
      showNotification('Failed to save settings', 'error');
    }
  };

  const handleArchiveSelectedMessages = async () => {
    setError(null);
    if (!checkPermission('manage_messages')) return;
    if (selectedMessageIds.size === 0) return;
    // No confirmation dialog

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_archived: true })
        .in('id', Array.from(selectedMessageIds));

      if (error) throw error;

      setMessages(prev => prev.filter(m => !selectedMessageIds.has(m.id)));
      setSelectedMessageIds(new Set());
    } catch (error: any) {
      console.error('Error archiving messages:', error);
      setError(`Failed to archive messages: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteSelectedMessages = async () => {
    setError(null);
    if (!checkPermission('manage_messages')) return;
    if (selectedMessageIds.size === 0) return;
    // No confirmation dialog

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .in('id', Array.from(selectedMessageIds));

      if (error) throw error;

      setMessages(prev => prev.filter(m => !selectedMessageIds.has(m.id)));
      setSelectedMessageIds(new Set());
    } catch (error: any) {
      console.error('Error deleting messages:', error);
      setError(`Failed to delete messages: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUnarchiveMessage = async (id: string) => {
    setError(null);
    if (!checkPermission('manage_messages')) return;
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_archived: false })
        .eq('id', id);

      if (error) throw error;

      setMessages(prev => prev.filter(m => m.id !== id));
      setSelectedMessageIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error: any) {
      console.error('Error unarchiving message:', error);
      setError(`Failed to unarchive message: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUnarchiveSelectedMessages = async () => {
    setError(null);
    if (!checkPermission('manage_messages')) return;
    if (selectedMessageIds.size === 0) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_archived: false })
        .in('id', Array.from(selectedMessageIds));

      if (error) throw error;

      setMessages(prev => prev.filter(m => !selectedMessageIds.has(m.id)));
      setSelectedMessageIds(new Set());
    } catch (error: any) {
      console.error('Error unarchiving messages:', error);
      setError(`Failed to unarchive messages: ${error.message || 'Unknown error'}`);
    }
  };

  // --- PROJECT HANDLERS ---
  const handleEditProject = (project: Project) => {
    setEditingId(project.id);
    setProjectForm(project);
  };

  const handleAddProject = () => {
    // Use a temporary ID for UI until saved
    const newId = 'new_' + Date.now();
    setEditingId(newId);
    setProjectForm({
      id: newId,
      name: 'New Project',
      category: ServiceCategory.CUSTOM,
      serviceDetails: 'Service Details',
      image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
      description: 'Project description goes here.',
      completedDate: new Date().toLocaleString('default', { month: 'short', year: 'numeric' })
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setProjectForm(prev => ({ ...prev, image: publicUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      showNotification('Error uploading image', 'error');
    }
  };

  const handleSaveProject = async () => {
    if (!checkPermission('manage_projects')) return;
    if (!projectForm.name) return;

    try {
      const projectData = {
        name: projectForm.name,
        category: projectForm.category,
        service_details: projectForm.serviceDetails,
        image: projectForm.image,
        description: projectForm.description,
        completed_date: projectForm.completedDate
      };

      let savedProject: Project;

      if (projectForm.id && !projectForm.id.startsWith('new_')) {
        // UPDATE existing
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', projectForm.id);

        if (error) throw error;
        savedProject = projectForm as Project;
      } else {
        // INSERT new
        const { data, error } = await supabase
          .from('projects')
          .insert([projectData])
          .select()
          .single();

        if (error) throw error;

        // Map back to frontend type
        savedProject = {
          id: data.id,
          name: data.name,
          category: data.category as any,
          serviceDetails: data.service_details,
          image: data.image,
          description: data.description,
          completedDate: data.completed_date
        };
      }

      // Update Local State
      const exists = projects.find(p => p.id === savedProject.id);
      if (exists) {
        onUpdateProjects(projects.map(p => p.id === savedProject.id ? savedProject : p));
      } else {
        onUpdateProjects([savedProject, ...projects]);
      }

      setEditingId(null);
      setProjectForm({});
      showNotification('Project Saved');
    } catch (error) {
      console.error('Error saving project:', error);
      showNotification('Failed to save project', 'error');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!checkPermission('manage_projects')) return;
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      onUpdateProjects(projects.filter(p => p.id !== id));
      showNotification('Project Deleted');
    } catch (error) {
      console.error('Error deleting project:', error);
      showNotification('Failed to delete project', 'error');
    }
  };

  // --- SERVICE HANDLERS ---
  const handleEditService = (service: ServiceItem) => {
    setEditingId(service.id);
    setServiceForm(service);
  };

  const handleAddService = () => {
    const newId = 'svc_' + Date.now();
    setEditingId(newId);
    setServiceForm({
      id: newId,
      title: 'New Service',
      description: 'Description of service...',
      icon: 'Wrench',
      isSpecialty: false
    });
  };

  const handleSaveService = async () => {
    if (!checkPermission('manage_services')) return;
    if (!serviceForm.title) return;

    try {
      const serviceData = {
        title: serviceForm.title,
        description: serviceForm.description,
        icon: serviceForm.icon,
        is_specialty: serviceForm.isSpecialty
      };

      let savedService: ServiceItem;

      if (serviceForm.id && !serviceForm.id.startsWith('svc_')) {
        // UPDATE
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', serviceForm.id);

        if (error) throw error;
        savedService = serviceForm as ServiceItem;
      } else {
        // INSERT
        const { data, error } = await supabase
          .from('services')
          .insert([serviceData])
          .select()
          .single();

        if (error) throw error;

        savedService = {
          id: data.id,
          title: data.title,
          description: data.description,
          icon: data.icon,
          isSpecialty: data.is_specialty
        };
      }

      // Update Local State
      const exists = services.find(s => s.id === savedService.id);
      if (exists) {
        onUpdateServices(services.map(s => s.id === savedService.id ? savedService : s));
      } else {
        onUpdateServices([...services, savedService]);
      }

      setEditingId(null);
      setServiceForm({});
      showNotification('Service Saved');
    } catch (error) {
      console.error('Error saving service:', error);
      showNotification('Failed to save service', 'error');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!checkPermission('manage_services')) return;
    if (!window.confirm('Are you sure you want to delete this service?')) return; {
      try {
        const { error } = await supabase
          .from('services')
          .delete()
          .eq('id', id);

        if (error) throw error;

        onUpdateServices(services.filter(s => s.id !== id));
        showNotification('Service Deleted');
      } catch (error) {
        console.error('Error deleting service:', error);
        showNotification('Failed to delete service', 'error');
      }
    }
  };

  // --- GENERAL INFO HANDLERS ---
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setGeneralForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (saveSuccess) setSaveSuccess(false);
  };

  const handleSaveLayout = async () => {
    try {
      const { data: existing } = await supabase.from('contact_info').select('id').limit(1).single();
      if (existing) {
        const { error } = await supabase.from('contact_info').update({
          section_order: generalForm.sectionOrder,
          show_reviews: generalForm.showReviews
        }).eq('id', existing.id);
        if (error) throw error;
      }
      onUpdateContact(generalForm);
      showNotification('Layout & Settings Saved');
    } catch (error) {
      console.error('Error saving layout:', error);
      showNotification('Failed to save Layout', 'error');
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!generalForm.sectionOrder) return;
    const newOrder = [...generalForm.sectionOrder];
    if (direction === 'up' && index > 0) {
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    }
    setGeneralForm({ ...generalForm, sectionOrder: newOrder });
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGeneralForm(prev => ({
      ...prev,
      openingHoursSpec: {
        ...(prev.openingHoursSpec || {
          monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', weekends: ''
        }),
        [name]: value
      } as any
    }));
    if (saveSuccess) setSaveSuccess(false);
  };

  const handleSaveContact = async () => {
    if (!checkPermission('manage_content')) return;
    try {
      const { data: existing } = await supabase.from('contact_info').select('id').limit(1).single();
      if (existing) {
        const { error } = await supabase.from('contact_info').update({
          owner: generalForm.owner,
          phone: generalForm.phone,
          email: generalForm.email,
          address: generalForm.address,
          hours: generalForm.hours,
          offer: generalForm.offer,
        }).eq('id', existing.id);
        if (error) throw error;
      }
      onUpdateContact(generalForm);
      showNotification('Contact Info Saved');
    } catch (error) {
      console.error('Error saving contact info:', error);
      showNotification('Failed to save contact info', 'error');
    }
  };

  const handleSaveHelix = async () => {
    if (!checkPermission('manage_content')) return;
    try {
      const { data: existing } = await supabase.from('contact_info').select('id').limit(1).single();
      if (existing) {
        const { error } = await supabase.from('contact_info').update({
          helix_title: generalForm.helixTitle,
          helix_title_highlight: generalForm.helixTitleHighlight,
          helix_subtitle: generalForm.helixSubtitle,
          helix_subtitle_highlight: generalForm.helixSubtitleHighlight,
          helix_text_effect: generalForm.helixTextEffect,
          helix_tagline: generalForm.helixTagline,
          helix_description: generalForm.helixDescription,
          helix_video_url: generalForm.helixVideoUrl,
          cerakote_before_url: generalForm.cerakoteBeforeUrl,
          cerakote_after_url: generalForm.cerakoteAfterUrl,
          logo_url: generalForm.logoUrl,
          theme: generalForm.theme,
          layout_style: generalForm.layoutStyle,
          promotion_enabled: generalForm.promotionEnabled,
          show_extra_videos: generalForm.showExtraVideos,
          show_sound_gallery: generalForm.showSoundGallery,
        }).eq('id', existing.id);
        if (error) throw error;
      }
      onUpdateContact(generalForm);
      showNotification('Helix & Theme Saved');
    } catch (error) {
      console.error('Error saving helix section:', error);
      showNotification('Failed to save Helix', 'error');
    }
  };

  // --- CERAKOTE PRODUCT HANDLERS ---
  const handleSaveProduct = async () => {
    if (!checkPermission('manage_content')) return;
    try {
      const productData = {
        name: productForm.name,
        description: productForm.description,
        image_url: productForm.image_url,
        price: productForm.price
      };

      if (productForm.id) {
        // Update
        const { error } = await supabase
          .from('cerakote_products')
          .update(productData)
          .eq('id', productForm.id);

        if (error) throw error;

        setCerakoteProducts(prev => prev.map(p => p.id === productForm.id ? { ...p, ...productData } : p));
      } else {
        // Insert
        const { data, error } = await supabase
          .from('cerakote_products')
          .insert([productData])
          .select()
          .single();

        if (error) throw error;
        setCerakoteProducts(prev => [data, ...prev]);
      }

      setEditingId(null);
      setProductForm({});
      showNotification('Product Saved');
    } catch (error: any) {
      console.error('Error saving product:', error);
      showNotification(`Failed to save product: ${error.message}`, 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!checkPermission('manage_content')) return;
    setDeletingId(id);
  };

  const confirmDeleteProduct = async () => {
    if (!deletingId) return;
    const id = deletingId;

    try {
      const { error } = await supabase
        .from('cerakote_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCerakoteProducts(prev => prev.filter(p => p.id !== id));
      showNotification('Product Deleted');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      showNotification('Failed to delete product', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // --- CERAKOTE FINISH HANDLERS ---
  const handleSaveFinish = async () => {
    if (!checkPermission('manage_content')) return;
    try {
      const finishData = {
        name: finishForm.name,
        code: finishForm.code,
        image_url: finishForm.image_url
      };

      if (finishForm.id) {
        // Update
        const { error } = await supabase
          .from('cerakote_finishes')
          .update(finishData)
          .eq('id', finishForm.id);

        if (error) throw error;
        setCerakoteFinishes(prev => prev.map(f => f.id === finishForm.id ? { ...f, ...finishData } : f));
      } else {
        // Insert
        const { data, error } = await supabase
          .from('cerakote_finishes')
          .insert([finishData])
          .select()
          .single();

        if (error) throw error;
        setCerakoteFinishes(prev => [...prev, data]);
      }

      setEditingId(null);
      setFinishForm({});
      showNotification('Finish Saved');
    } catch (error: any) {
      console.error('Error saving finish:', error);
      showNotification(`Failed to save finish: ${error.message}`, 'error');
    }
  };

  const handleDeleteFinish = async (id: string) => {
    if (!checkPermission('manage_content')) return;
    if (!window.confirm('Delete this finish?')) return; // Using simple confirm for now to save time, or I can reuse the modal logic if I make it generic.
    // Actually, let's reuse the modal logic. I need to know WHAT I am deleting.
    // For now, I'll stick to window.confirm for this new feature to avoid overcomplicating the modal state right now, or I can add a 'deletingType' state.
    // The user asked to fix the POPUP for products. I did that.
    // For finishes, I'll use the same modal if I can.

    try {
      const { error } = await supabase
        .from('cerakote_finishes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCerakoteFinishes(prev => prev.filter(f => f.id !== id));
      showNotification('Finish Deleted');
    } catch (error: any) {
      console.error('Error deleting finish:', error);
      showNotification('Failed to delete finish', 'error');
    }
  };

  const handleSaveThemes = async () => {
    if (!checkPermission('manage_content')) return;
    try {
      const { data: existing } = await supabase.from('contact_info').select('id').limit(1).single();

      if (existing) {
        const { error } = await supabase.from('contact_info').update({
          theme: generalForm.theme,
          layout_style: generalForm.layoutStyle,
          helix_text_effect: generalForm.helixTextEffect,
          helix_title_effect: generalForm.helixTitleEffect,
        }).eq('id', existing.id);

        if (error) throw error;
      }
      onUpdateContact(generalForm);
      showNotification('Themes & Appearance saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving themes:', error);
      showNotification('Failed to save themes.', 'error');
    }
  };

  const handleSavePromotions = async () => {
    if (!checkPermission('manage_content')) return;
    try {
      const { data: existing } = await supabase.from('contact_info').select('id').limit(1).single();
      if (existing) {
        const { error } = await supabase.from('contact_info').update({
          promotion_enabled: generalForm.promotionEnabled,
          promotion_text: generalForm.promotionText
        }).eq('id', existing.id);
        if (error) throw error;
      }
      onUpdateContact(generalForm);
      showNotification('Promotions Saved');
    } catch (error) {
      console.error('Error saving promotions:', error);
      showNotification('Failed to save promotions', 'error');
    }
  };

  const handleSaveSocial = async () => {
    if (!checkPermission('manage_content')) return;
    try {
      const { data: existing } = await supabase.from('contact_info').select('id').limit(1).single();
      if (existing) {
        const { error } = await supabase.from('contact_info').update({
          about_text: generalForm.aboutText,
          social_instagram: generalForm.socialInstagram,
          social_facebook: generalForm.socialFacebook,
          social_whatsapp: generalForm.socialWhatsapp,
        }).eq('id', existing.id);
        if (error) throw error;
      }
      onUpdateContact(generalForm);
      showNotification('Social & About Saved');
    } catch (error) {
      console.error('Error saving social info:', error);
      showNotification('Failed to save social info', 'error');
    }
  };

  const handleSaveHours = async () => {
    if (!checkPermission('manage_content')) return;
    try {
      const { data: existing } = await supabase.from('contact_info').select('id').limit(1).single();
      if (existing) {
        const { error } = await supabase.from('contact_info').update({
          opening_hours_spec: generalForm.openingHoursSpec
        }).eq('id', existing.id);
        if (error) throw error;
      }
      onUpdateContact(generalForm);
      showNotification('Opening Hours Saved');
    } catch (error) {
      console.error('Error saving opening hours:', error);
      showNotification('Failed to save opening hours', 'error');
    }
  };

  const handleToggleCerakoteStock = (code: string) => {
    const currentStock = generalForm.cerakote_stock || {};
    const newStock = { ...currentStock, [code]: currentStock[code] === false ? true : false };
    // If true (in stock), we can actually just remove the key to save space, or keep it true.
    // Let's keep it explicit: false = out of stock, true/undefined = in stock.
    // Actually, to match the UI logic: if it's false, it's out. If it's true or missing, it's in.

    setGeneralForm(prev => ({ ...prev, cerakote_stock: newStock }));
  };

  const handleSaveCerakoteStock = async () => {
    if (!checkPermission('manage_content')) return;
    try {
      const { data: existing } = await supabase.from('contact_info').select('id').limit(1).single();
      if (existing) {
        const { error } = await supabase.from('contact_info').update({
          cerakote_stock: generalForm.cerakote_stock
        }).eq('id', existing.id);
        if (error) throw error;
      }
      onUpdateContact(generalForm);
      showNotification('Stock Status Saved');
    } catch (error) {
      console.error('Error saving stock status:', error);
      showNotification('Failed to save stock status', 'error');
    }
  };

  // Helper for inputs
  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProjectForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setServiceForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-garage-950 text-white p-6 pb-24">
      <SEO title={`Admin | ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`} description="Manage Helix Motorcycles content." />

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-sm border shadow-2xl transform transition-all duration-300 ease-in-out flex items-center gap-3 ${notification.type === 'success'
          ? 'bg-garage-900 border-bronze-500 text-white'
          : 'bg-red-950/90 border-red-500 text-white'
          }`}>
          <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-bronze-500' : 'bg-red-500'}`}></div>
          <span className="font-bold uppercase text-sm tracking-wider">{notification.message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto">


        {/* Header */}
        {/* Header Title & Logout */}
        <div className="flex justify-between items-center mb-6 border-b border-garage-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight">Workshop <span className="text-bronze-500">CMS</span></h1>
            <p className="text-garage-400 font-mono text-sm">Manage website content</p>
          </div>
          <button
            onClick={onLogout}
            className="border border-garage-700 text-garage-400 hover:text-white px-4 py-2 rounded-sm font-bold uppercase text-sm tracking-wider transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 font-bold uppercase text-sm tracking-wider rounded-sm transition-colors ${activeTab === 'general' ? 'bg-bronze-600 text-white' : 'bg-garage-900 text-garage-400 hover:bg-garage-800'}`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-3 font-bold uppercase text-sm tracking-wider rounded-sm transition-colors ${activeTab === 'services' ? 'bg-bronze-600 text-white' : 'bg-garage-900 text-garage-400 hover:bg-garage-800'}`}
          >
            Services
          </button>
          {currentUserRole?.permissions.manage_projects && (
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-3 font-bold uppercase text-sm tracking-wider rounded-sm transition-colors ${activeTab === 'projects' ? 'bg-bronze-600 text-white' : 'bg-garage-900 text-garage-400 hover:bg-garage-800'}`}
            >
              Projects
            </button>
          )}
          {currentUserRole?.permissions.manage_team && (
            <button
              onClick={() => setActiveTab('team')}
              className={`px-6 py-3 font-bold uppercase text-sm tracking-wider rounded-sm transition-colors ${activeTab === 'team' ? 'bg-bronze-600 text-white' : 'bg-garage-900 text-garage-400 hover:bg-garage-800'}`}
            >
              Team
            </button>
          )}
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-6 py-3 font-bold uppercase text-sm tracking-wider rounded-sm transition-colors ${activeTab === 'messages' ? 'bg-bronze-600 text-white' : 'bg-garage-900 text-garage-400 hover:bg-garage-800'}`}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 font-bold uppercase text-sm tracking-wider rounded-sm transition-colors ${activeTab === 'reviews' ? 'bg-bronze-600 text-white' : 'bg-garage-900 text-garage-400 hover:bg-garage-800'}`}
          >
            Reviews
          </button>
          <button
            onClick={() => setActiveTab('themes')}
            className={`px-6 py-3 font-bold uppercase text-sm tracking-wider rounded-sm transition-colors ${activeTab === 'themes' ? 'bg-bronze-600 text-white' : 'bg-garage-900 text-garage-400 hover:bg-garage-800'}`}
          >
            Themes
          </button>
          <button
            onClick={() => setActiveTab('cerakote')}
            className={`px-6 py-3 font-bold uppercase text-sm tracking-wider rounded-sm transition-colors ${activeTab === 'cerakote' ? 'bg-bronze-600 text-white' : 'bg-garage-900 text-garage-400 hover:bg-garage-800'}`}
          >
            Cerakote Stock
          </button>
        </div>


        {/* --- PROJECTS TAB --- */}
        {activeTab === 'projects' && (
          <div>
            <div className="flex justify-end mb-6">
              <button onClick={handleAddProject} className="bg-bronze-600 hover:bg-bronze-500 text-white px-4 py-2 rounded-sm font-bold uppercase text-sm tracking-wider">+ Add Project</button>
            </div>

            {/* Project Edit Modal */}
            {editingId && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                <div className="bg-garage-900 border border-garage-700 p-6 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <h2 className="text-xl font-bold text-white mb-6 uppercase">
                    {editingId.startsWith('new_') ? 'Add New Project' : 'Edit Project'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs text-garage-500 uppercase mb-1">Name</label>
                      <input name="name" value={projectForm.name || ''} onChange={handleProjectChange} className="w-full bg-garage-950 border border-garage-700 p-2 text-white" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs text-garage-500 uppercase mb-1">Category</label>
                      <select name="category" value={projectForm.category || ''} onChange={handleProjectChange} className="w-full bg-garage-950 border border-garage-700 p-2 text-white">
                        {Object.values(ServiceCategory).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-garage-500 uppercase mb-1">Subtitle</label>
                      <input name="serviceDetails" value={projectForm.serviceDetails || ''} onChange={handleProjectChange} className="w-full bg-garage-950 border border-garage-700 p-2 text-white" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-garage-500 uppercase mb-1">Image URL</label>
                      <div className="flex gap-2">
                        <input name="image" value={projectForm.image || ''} onChange={handleProjectChange} className="w-full bg-garage-950 border border-garage-700 p-2 text-white font-mono text-xs" />
                        <label className="cursor-pointer bg-garage-800 hover:bg-garage-700 text-white px-3 py-2 rounded-sm border border-garage-600 flex items-center">
                          <span className="text-xs uppercase font-bold">Upload</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-garage-500 uppercase mb-1">Description</label>
                      <textarea name="description" value={projectForm.description || ''} onChange={handleProjectChange} rows={3} className="w-full bg-garage-950 border border-garage-700 p-2 text-white" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs text-garage-500 uppercase mb-1">Date</label>
                      <input name="completedDate" value={projectForm.completedDate || ''} onChange={handleProjectChange} className="w-full bg-garage-950 border border-garage-700 p-2 text-white" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-8">
                    <button onClick={() => setEditingId(null)} className="px-4 py-2 text-garage-400 hover:text-white uppercase text-xs font-bold">Cancel</button>
                    <button onClick={handleSaveProject} className="bg-bronze-600 hover:bg-bronze-500 text-white px-6 py-2 uppercase text-xs font-bold rounded-sm">Save</button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {projects.map(project => (
                <div key={project.id} className="bg-garage-900 border border-garage-800 p-4 flex items-center justify-between group hover:border-bronze-500/50">
                  <div className="flex items-center space-x-4">
                    <img src={project.image} alt={project.name} className="w-16 h-16 object-cover rounded-sm" />
                    <div>
                      <h3 className="text-lg font-bold text-white">{project.name}</h3>
                      <div className="flex gap-2 text-xs text-garage-400 font-mono">
                        <span>{project.category}</span>•<span>{project.completedDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEditProject(project)} className="p-2 text-garage-400 hover:text-white bg-garage-950 hover:bg-garage-800 rounded border border-garage-700">Edit</button>
                    <button onClick={() => handleDeleteProject(project.id)} className="p-2 text-red-400 hover:text-red-300 bg-garage-950 hover:bg-red-900/20 rounded border border-garage-700">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- SERVICES TAB --- */}
        {activeTab === 'services' && (
          <div>
            <div className="flex justify-end mb-6">
              <button onClick={handleAddService} className="bg-bronze-600 hover:bg-bronze-500 text-white px-4 py-2 rounded-sm font-bold uppercase text-sm tracking-wider">+ Add Service</button>
            </div>

            {/* Service Edit Modal */}
            {editingId && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                <div className="bg-garage-900 border border-garage-700 p-6 rounded-sm w-full max-w-lg">
                  <h2 className="text-xl font-bold text-white mb-6 uppercase">
                    {editingId === serviceForm.id && !services.find(s => s.id === editingId) ? 'Add New Service' : 'Edit Service'}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-garage-500 uppercase mb-1">Service Title</label>
                      <input name="title" value={serviceForm.title || ''} onChange={handleServiceChange} className="w-full bg-garage-950 border border-garage-700 p-2 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-garage-500 uppercase mb-1">Description</label>
                      <textarea name="description" value={serviceForm.description || ''} onChange={handleServiceChange} rows={3} className="w-full bg-garage-950 border border-garage-700 p-2 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-garage-500 uppercase mb-1">Icon Name (Lucide React)</label>
                      <select name="icon" value={serviceForm.icon || 'Wrench'} onChange={handleServiceChange} className="w-full bg-garage-950 border border-garage-700 p-2 text-white">
                        {['Wrench', 'Disc', 'Droplet', 'Wind', 'Activity', 'CircleDot', 'Settings', 'Gauge', 'Link', 'Zap', 'ChevronsUp'].map(i => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-8">
                    <button onClick={() => setEditingId(null)} className="px-4 py-2 text-garage-400 hover:text-white uppercase text-xs font-bold">Cancel</button>
                    <button onClick={handleSaveService} className="bg-bronze-600 hover:bg-bronze-500 text-white px-6 py-2 uppercase text-xs font-bold rounded-sm">Save</button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => (
                <div key={service.id} className="bg-garage-900 border border-garage-800 p-4 group hover:border-bronze-500/50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white">{service.title}</h3>
                    <div className="flex space-x-1">
                      <button onClick={() => handleEditService(service)} className="text-garage-400 hover:text-white p-1">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button onClick={() => handleDeleteService(service.id)} className="text-garage-400 hover:text-red-500 p-1">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-garage-400 mb-2">{service.description}</p>
                  <span className="text-[10px] font-mono text-bronze-500 border border-bronze-900 bg-bronze-900/10 px-1 rounded">{service.icon}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- GENERAL SETTINGS TAB --- */}
        {activeTab === 'general' && (
          <div className="bg-garage-900 border border-garage-800 p-8 rounded-sm max-w-4xl">
            <h2 className="text-xl font-bold text-white mb-6 uppercase">General Settings & Content</h2>
            <div className="space-y-8">

              {/* Contact Info Section */}
              <div className="space-y-4 border-b border-garage-800 pb-8">
                <h3 className="text-bronze-500 font-bold uppercase text-sm tracking-wider mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-garage-500 uppercase mb-1">Owner Name</label>
                    <input name="owner" value={generalForm.owner || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-garage-500 uppercase mb-1">Phone Number</label>
                    <input name="phone" value={generalForm.phone || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-garage-500 uppercase mb-1">Email</label>
                    <input name="email" value={generalForm.email || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-garage-500 uppercase mb-1">Shop Address</label>
                    <input name="address" value={generalForm.address || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-garage-500 uppercase mb-1">Opening Hours</label>
                    <input name="hours" value={generalForm.hours || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-garage-500 uppercase mb-1">Special Offer Text</label>
                    <input name="offer" value={generalForm.offer || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none" />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={handleSaveContact} className="bg-bronze-600 hover:bg-bronze-500 text-white px-6 py-2 rounded-sm font-bold uppercase text-xs tracking-wider">Save Contact Info</button>
                </div>
              </div>

              {/* Helix Section */}
              <div className="space-y-4 border-b border-garage-800 pb-8">
                <h3 className="text-bronze-500 font-bold uppercase text-sm tracking-wider mb-4">Helix (Homepage)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs text-garage-500 uppercase mb-1">Color Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['midnight', 'stealth', 'vintage', 'neon', 'forest', 'ocean'].map(theme => (
                        <button
                          key={theme}
                          onClick={() => setGeneralForm({ ...generalForm, theme: theme as any })}
                          className={`p-3 border rounded-sm flex flex-col items-center gap-2 transition-all ${generalForm.theme === theme
                            ? 'border-bronze-500 bg-garage-900'
                            : 'border-garage-800 bg-garage-950 hover:border-garage-600'
                            }`}
                        >
                          <div className={`w-full h-8 rounded-sm ${theme === 'midnight' ? 'bg-gradient-to-r from-garage-950 to-bronze-900' :
                            theme === 'stealth' ? 'bg-gradient-to-r from-gray-950 to-gray-800' :
                              theme === 'vintage' ? 'bg-gradient-to-r from-[#3b2a22] to-[#f59e0b]' :
                                theme === 'neon' ? 'bg-gradient-to-r from-black to-[#06b6d4]' :
                                  theme === 'forest' ? 'bg-gradient-to-r from-[#052e16] to-[#eab308]' :
                                    'bg-gradient-to-r from-[#020410] to-[#8b5cf6]'
                            }`}></div>
                          <span className="text-xs uppercase font-bold text-garage-300">{theme}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-garage-500 uppercase mb-1">Layout Style</label>
                    <select
                      name="layoutStyle"
                      value={generalForm.layoutStyle || 'default'}
                      onChange={(e) => setGeneralForm({ ...generalForm, layoutStyle: e.target.value as any })}
                      className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none"
                    >
                      <option value="default">Default (Rich & Animated)</option>
                      <option value="minimal">Minimal (Clean & Simple)</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-garage-500 uppercase mb-1">Tagline (Top Left)</label>
                    <input name="helixTagline" value={generalForm.helixTagline || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none text-xs font-mono" placeholder="FREE CONSULTATION AVAILABLE" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-garage-500 uppercase mb-1">Main Title</label>
                    <input name="helixTitle" value={generalForm.helixTitle || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none" placeholder="Motorcycles are in our DNA" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-garage-500 uppercase mb-1">Title Highlight (Gradient Text)</label>
                    <input name="helixTitleHighlight" value={generalForm.helixTitleHighlight || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none font-bold text-bronze-400" placeholder="DNA" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-garage-500 uppercase mb-1">Description (Middle Text)</label>
                    <input name="helixDescription" value={generalForm.helixDescription || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none" placeholder="— building, tuning, and fixing them right." />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-garage-500 uppercase mb-1">Logo URL (Optional)</label>
                    <input name="logoUrl" value={generalForm.logoUrl || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none text-xs" placeholder="Leave empty for default logo" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-garage-500 uppercase mb-1">Subtitle (Start - Irish Gradient)</label>
                    <input name="helixSubtitle" value={generalForm.helixSubtitle || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none" placeholder="Ireland's" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-garage-500 uppercase mb-1">Subtitle Highlight (End - Chrome)</label>
                    <input name="helixSubtitleHighlight" value={generalForm.helixSubtitleHighlight || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none font-bold text-gray-400" placeholder="Finest." />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-garage-500 uppercase mb-1">Video URL (mp4)</label>
                    <input name="helixVideoUrl" value={generalForm.helixVideoUrl || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none font-mono text-xs" placeholder="/helix-video.mp4" />
                    <p className="text-[10px] text-garage-600 mt-1">For local files in the public folder, use the format <code>/filename.mp4</code>.</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={handleSaveHelix} className="bg-bronze-600 text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-bronze-500 transition-colors duration-300">
                    Save Helix Content
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="col-span-1">
                    <label className="block text-xs text-garage-500 uppercase mb-1">Cerakote Before Image URL</label>
                    <input name="cerakoteBeforeUrl" value={generalForm.cerakoteBeforeUrl || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none text-xs" placeholder="https://..." />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-garage-500 uppercase mb-1">Cerakote After Image URL</label>
                    <input name="cerakoteAfterUrl" value={generalForm.cerakoteAfterUrl || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none text-xs" placeholder="https://..." />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={handleSaveHelix} className="bg-bronze-600 hover:bg-bronze-500 text-white px-6 py-2 rounded-sm font-bold uppercase text-xs tracking-wider">Save Helix & Settings</button>
                </div>
              </div>

              {/* Promotions Section */}
              <div className="space-y-4 border-b border-garage-800 pb-8">
                <h3 className="text-bronze-500 font-bold uppercase text-sm tracking-wider mb-4">Promotions & Offers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 flex items-center justify-between bg-garage-900 p-4 rounded-sm border border-garage-800">
                    <div>
                      <h4 className="text-white font-bold uppercase text-sm">Enable Promotion Banner</h4>
                      <p className="text-garage-400 text-xs">Show a high-contrast banner at the top of the site.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={generalForm.promotionEnabled || false}
                        onChange={(e) => setGeneralForm({ ...generalForm, promotionEnabled: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-garage-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bronze-600"></div>
                    </label>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-garage-500 uppercase mb-1">Promotion Text</label>
                    <input
                      name="promotionText"
                      value={generalForm.promotionText || ''}
                      onChange={handleGeneralChange}
                      className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none font-bold text-bronze-400"
                      placeholder="Special Offer: 10% Off All Services!"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={handleSavePromotions} className="bg-bronze-600 hover:bg-bronze-500 text-white px-6 py-2 rounded-sm font-bold uppercase text-xs tracking-wider">Save Promotions</button>
                </div>
              </div>

              {/* Layout Section */}
              <div className="space-y-4 border-b border-garage-800 pb-8">
                <h3 className="text-bronze-500 font-bold uppercase text-sm tracking-wider mb-4">Homepage Layout</h3>
                <div className="space-y-2">
                  {(generalForm.sectionOrder || ['helix', 'services', 'showroom', 'location', 'reviews', 'ai_garage']).map((section, index) => (
                    <div key={section} className="flex items-center justify-between bg-garage-950 p-3 border border-garage-800 rounded-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-mono uppercase text-sm">{section.replace('_', ' ')}</span>
                        {section === 'reviews' && (
                          <label className="relative inline-flex items-center cursor-pointer scale-75 origin-left">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={generalForm.showReviews !== false}
                              onChange={(e) => setGeneralForm({ ...generalForm, showReviews: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-garage-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bronze-600"></div>
                            <span className="ml-2 text-xs text-garage-400 uppercase font-bold">{generalForm.showReviews !== false ? 'Visible' : 'Hidden'}</span>
                          </label>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => moveSection(index, 'up')}
                          disabled={index === 0}
                          className="text-garage-400 hover:text-white disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveSection(index, 'down')}
                          disabled={index === (generalForm.sectionOrder?.length || 0) - 1}
                          className="text-garage-400 hover:text-white disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={handleSaveLayout} className="bg-bronze-600 hover:bg-bronze-500 text-white px-6 py-2 rounded-sm font-bold uppercase text-xs tracking-wider">Save Layout</button>
                </div>
              </div>

              {/* Opening Hours Section */}
              <div className="space-y-4 border-b border-garage-800 pb-8">
                <h3 className="text-bronze-500 font-bold uppercase text-sm tracking-wider mb-4">Detailed Opening Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'weekends'].map((day) => (
                    <div key={day}>
                      <label className="block text-xs text-garage-500 uppercase mb-1">{day}</label>
                      <input
                        name={day}
                        value={generalForm.openingHoursSpec?.[day as keyof typeof generalForm.openingHoursSpec] || ''}
                        onChange={handleHoursChange}
                        className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none"
                        placeholder={day === 'weekends' ? 'By Appt.' : '09:00 - 22:00'}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={handleSaveHours} className="bg-bronze-600 hover:bg-bronze-500 text-white px-6 py-2 rounded-sm font-bold uppercase text-xs tracking-wider">Save Opening Hours</button>
                </div>
              </div>



              {/* About & Social */}
              <div className="space-y-4">
                <h3 className="text-bronze-500 font-bold uppercase text-sm tracking-wider mb-4">About & Social</h3>
                <div>
                  <label className="block text-xs text-garage-500 uppercase mb-1">About Text (Footer)</label>
                  <textarea name="aboutText" value={generalForm.aboutText || ''} onChange={handleGeneralChange} rows={3} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-garage-500 uppercase mb-1">Instagram URL</label>
                    <input name="socialInstagram" value={generalForm.socialInstagram || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none text-xs" placeholder="https://instagram.com/..." />
                  </div>
                  <div>
                    <label className="block text-xs text-garage-500 uppercase mb-1">Facebook URL</label>
                    <input name="socialFacebook" value={generalForm.socialFacebook || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none text-xs" placeholder="https://facebook.com/..." />
                  </div>
                  <div>
                    <label className="block text-xs text-garage-500 uppercase mb-1">WhatsApp URL</label>
                    <input name="socialWhatsapp" value={generalForm.socialWhatsapp || ''} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none text-xs" placeholder="https://wa.me/..." />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={handleSaveSocial} className="bg-bronze-600 hover:bg-bronze-500 text-white px-6 py-2 rounded-sm font-bold uppercase text-xs tracking-wider">Save Social & About</button>
                </div>
              </div>

              <div className="pt-4 border-t border-garage-800 flex justify-end items-center">
                {saveSuccess && (
                  <span className="text-green-500 text-xs font-bold mr-4 animate-pulse flex items-center">
                    <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    Changes Saved Successfully
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- MESSAGES TAB --- */}
        {activeTab === 'messages' && (
          <div className="bg-garage-900 border border-garage-800 p-8 rounded-sm">
            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-500 p-4 mb-6 rounded-sm">
                <strong>Error:</strong> {error}
              </div>
            )}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white uppercase">Inquiries</h2>
                <div className="flex bg-garage-950 border border-garage-800 rounded-sm p-1">
                  <button
                    onClick={() => setMessageViewMode('active')}
                    className={`px-3 py-1 text-xs font-bold uppercase rounded-sm transition-colors ${messageViewMode === 'active' ? 'bg-bronze-600 text-white' : 'text-garage-400 hover:text-white'}`}
                  >
                    Inbox
                  </button>
                  <button
                    onClick={() => setMessageViewMode('archived')}
                    className={`px-3 py-1 text-xs font-bold uppercase rounded-sm transition-colors ${messageViewMode === 'archived' ? 'bg-bronze-600 text-white' : 'text-garage-400 hover:text-white'}`}
                  >
                    Archived
                  </button>
                </div>
              </div>
              {messages.length > 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={toggleSelectAllMessages}
                    className="text-garage-400 hover:text-white text-xs font-bold uppercase"
                  >
                    {selectedMessageIds.size === messages.length ? 'Deselect All' : 'Select All'}
                  </button>
                  {selectedMessageIds.size > 0 && (
                    <div className="flex gap-2">
                      {messageViewMode === 'active' ? (
                        <button
                          onClick={handleArchiveSelectedMessages}
                          className="bg-garage-800 hover:bg-garage-700 text-garage-300 px-3 py-1 rounded-sm text-xs font-bold uppercase border border-garage-600 transition-colors"
                        >
                          Archive Selected ({selectedMessageIds.size})
                        </button>
                      ) : (
                        <button
                          onClick={handleUnarchiveSelectedMessages}
                          className="bg-garage-800 hover:bg-garage-700 text-garage-300 px-3 py-1 rounded-sm text-xs font-bold uppercase border border-garage-600 transition-colors"
                        >
                          Unarchive Selected ({selectedMessageIds.size})
                        </button>
                      )}
                      <button
                        onClick={handleDeleteSelectedMessages}
                        className="bg-red-900/50 hover:bg-red-900 text-red-200 px-3 py-1 rounded-sm text-xs font-bold uppercase border border-red-800 transition-colors"
                      >
                        Delete Selected ({selectedMessageIds.size})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {messages.length === 0 ? (
                <p className="text-garage-400">No messages yet.</p>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`bg-garage-950 border p-4 rounded-sm transition-colors ${selectedMessageIds.has(msg.id) ? 'border-bronze-500/50 bg-bronze-900/10' : 'border-garage-800'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedMessageIds.has(msg.id)}
                          onChange={() => toggleMessageSelection(msg.id)}
                          className="mt-1 rounded bg-garage-900 border-garage-700 text-bronze-500 focus:ring-bronze-500"
                        />
                        <div>
                          <h3 className="font-bold text-white">{msg.name}</h3>
                          <p className="text-xs text-garage-500">{msg.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-garage-600 font-mono">
                          {new Date(msg.created_at).toLocaleDateString()} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {messageViewMode === 'active' ? (
                          <button
                            onClick={() => handleArchiveMessage(msg.id)}
                            className="text-garage-600 hover:text-bronze-500 transition-colors"
                            title="Archive Message"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnarchiveMessage(msg.id)}
                            className="text-garage-600 hover:text-green-500 transition-colors"
                            title="Unarchive Message"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 14 15 14" /><polyline points="4 20 4 9 7 9 7 4 17 4 17 9 20 9 20 20 4 20" /><line x1="12" y1="11" x2="12" y2="17" /></svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-garage-600 hover:text-red-500 transition-colors"
                          title="Delete Message"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-garage-300 text-sm mt-2 pl-7">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="bg-garage-900 border border-garage-800 p-4 rounded-sm mb-6 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold uppercase text-sm">Show Reviews on Homepage</h3>
                <p className="text-garage-400 text-xs mt-1">Toggle this to hide the entire reviews section from the public site.</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={generalForm.showReviews !== false}
                    onChange={(e) => {
                      setGeneralForm({ ...generalForm, showReviews: e.target.checked });
                      // Auto-save or require button? Let's add a button for clarity or just rely on the state update and a save button.
                      // For consistency with other tabs, let's use a save button in this block.
                    }}
                  />
                  <div className="w-11 h-6 bg-garage-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bronze-600"></div>
                </label>
                <button onClick={handleSaveReviewSettings} className="text-xs bg-garage-800 hover:bg-garage-700 text-white px-3 py-1 rounded-sm uppercase font-bold">Save Setting</button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Rider Reviews</h2>
              <button
                onClick={() => {
                  setEditingId('new');
                  setReviewForm({ rating: 5, date: new Date().toISOString().split('T')[0] });
                }}
                className="bg-bronze-600 hover:bg-bronze-500 text-white px-4 py-2 rounded-sm font-bold uppercase text-xs tracking-wider flex items-center"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Review
              </button>
            </div>

            {editingId === 'new' || editingId ? (
              <div className="bg-garage-900 border border-garage-800 p-6 rounded-sm mb-8 animate-fade-in">
                <h3 className="text-bronze-500 font-bold uppercase text-sm mb-4">{editingId === 'new' ? 'New Review' : 'Edit Review'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="col-span-1">
                    <label className="block text-xs text-garage-500 uppercase mb-1">Rider Name</label>
                    <input
                      value={reviewForm.name || ''}
                      onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })}
                      className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-garage-500 uppercase mb-1">Rating (1-5)</label>
                    <select
                      value={reviewForm.rating || 5}
                      onChange={e => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                      className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none"
                    >
                      {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} Stars</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-garage-500 uppercase mb-1">Review Text</label>
                    <textarea
                      value={reviewForm.text || ''}
                      onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })}
                      className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none h-24"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-garage-500 uppercase mb-1">Date</label>
                    <input
                      type="date"
                      value={reviewForm.date || ''}
                      onChange={e => setReviewForm({ ...reviewForm, date: e.target.value })}
                      className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 text-garage-400 hover:text-white text-xs font-bold uppercase">Cancel</button>
                  <button onClick={handleSaveReview} className="bg-bronze-600 hover:bg-bronze-500 text-white px-6 py-2 rounded-sm font-bold uppercase text-xs tracking-wider">Save Review</button>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-garage-900 border border-garage-800 p-4 rounded-sm flex justify-between items-start group hover:border-garage-700 transition-colors">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="font-bold text-white mr-3">{review.name}</span>
                      <div className="flex text-bronze-500 text-xs">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'opacity-100' : 'opacity-30'}>★</span>
                        ))}
                      </div>
                      <span className="ml-3 text-garage-500 text-xs">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-garage-300 text-sm italic">"{review.text}"</p>
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(review.id);
                        setReviewForm(review);
                      }}
                      className="p-2 text-garage-400 hover:text-white bg-garage-800 hover:bg-garage-700 rounded-sm"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="p-2 text-garage-400 hover:text-red-500 bg-garage-800 hover:bg-garage-700 rounded-sm"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="text-center py-12 text-garage-500 text-sm">
                  No reviews yet. Add one to get started.
                </div>
              )}
            </div>
          </div>

        )}

        {activeTab === 'cerakote' && (
          <div className="space-y-8 animate-fade-in">
            {/* Image Management Section */}
            <div className="bg-garage-900 p-6 rounded-sm border border-garage-800">
              <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-garage-800 pb-2">Page Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-garage-400 text-xs uppercase font-bold mb-2">Before Image (Helix Section)</label>
                  <input
                    type="text"
                    name="cerakoteBeforeUrl"
                    value={generalForm.cerakoteBeforeUrl || ''}
                    onChange={handleGeneralChange}
                    className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none"
                    placeholder="https://..."
                  />
                  <p className="text-xs text-garage-500 mt-1">Background image for the top helix section.</p>
                </div>
                <div>
                  <label className="block text-garage-400 text-xs uppercase font-bold mb-2">After Image URL (Middle)</label>
                  <input
                    type="text"
                    name="cerakoteAfterUrl"
                    value={generalForm.cerakoteAfterUrl || ''}
                    onChange={handleGeneralChange}
                    className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none"
                    placeholder="https://..."
                  />
                  <p className="text-xs text-garage-500 mt-1">Image displayed in the comparison/middle section.</p>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={handleSaveHelix} className="bg-bronze-600 hover:bg-bronze-500 text-white px-6 py-2 rounded-sm font-bold uppercase text-xs tracking-wider">Save Images</button>
              </div>
            </div>

            {/* Stock Management Section */}
            <div className="bg-garage-900 border border-garage-800 p-8 rounded-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white uppercase">Cerakote Stock Management</h2>
                  <p className="text-garage-400 text-sm mt-1">Toggle colors to mark them as Out of Stock.</p>
                </div>
                <button onClick={handleSaveCerakoteStock} className="bg-bronze-600 hover:bg-bronze-500 text-white px-6 py-2 rounded-sm font-bold uppercase text-xs tracking-wider">Save Stock Changes</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {CERAKOTE_COLORS.map(color => {
                  const isOutOfStock = generalForm.cerakote_stock && generalForm.cerakote_stock[color.code] === false;
                  return (
                    <div key={color.code} className={`p-4 border rounded-sm flex items-center justify-between transition-colors ${isOutOfStock ? 'bg-red-900/10 border-red-900/30' : 'bg-garage-950 border-garage-800'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cover bg-center border border-garage-700" style={{ backgroundImage: `url(${color.image})` }}></div>
                        <div>
                          <h4 className={`font-bold text-sm ${isOutOfStock ? 'text-red-400' : 'text-white'}`}>{color.name}</h4>
                          <p className="text-xs text-garage-500 font-mono">{color.code}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={!isOutOfStock}
                          onChange={() => handleToggleCerakoteStock(color.code)}
                        />
                        <div className="w-11 h-6 bg-red-900/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        <span className="ml-2 text-xs font-bold uppercase w-16 text-right">{!isOutOfStock ? 'In Stock' : 'Out'}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Products Management Section */}
            <div className="bg-garage-900 border border-garage-800 p-8 rounded-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white uppercase">Cerakote Products</h2>
                  <p className="text-garage-400 text-sm mt-1">Manage additional products or kits.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingId('new_product');
                    setProductForm({});
                  }}
                  className="bg-bronze-600 hover:bg-bronze-500 text-white px-4 py-2 rounded-sm font-bold uppercase text-xs tracking-wider flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Add Product
                </button>
              </div>

              {editingId ? (
                <div className="bg-garage-950 border border-garage-800 p-6 rounded-sm mb-8 animate-fade-in">
                  <h3 className="text-bronze-500 font-bold uppercase text-sm mb-4">{editingId === 'new_product' ? 'New Product' : 'Edit Product'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="col-span-1">
                      <label className="block text-xs text-garage-500 uppercase mb-1">Product Name</label>
                      <input
                        value={productForm.name || ''}
                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full bg-garage-900 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs text-garage-500 uppercase mb-1">Price</label>
                      <input
                        value={productForm.price || ''}
                        onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full bg-garage-900 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none"
                        placeholder="e.g. €50.00"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-garage-500 uppercase mb-1">Image URL</label>
                      <input
                        value={productForm.image_url || ''}
                        onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}
                        className="w-full bg-garage-900 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-garage-500 uppercase mb-1">Description</label>
                      <textarea
                        value={productForm.description || ''}
                        onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                        className="w-full bg-garage-900 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none h-24"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button onClick={() => setEditingId(null)} className="px-4 py-2 text-garage-400 hover:text-white text-xs font-bold uppercase">Cancel</button>
                    <button onClick={handleSaveProduct} className="bg-bronze-600 hover:bg-bronze-500 text-white px-6 py-2 rounded-sm font-bold uppercase text-xs tracking-wider">Save Product</button>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-4">
                {cerakoteProducts.length === 0 ? (
                  <p className="text-garage-500 text-sm text-center py-8">No products added yet.</p>
                ) : (
                  cerakoteProducts.map(product => (
                    <div key={product.id} className="bg-garage-950 border border-garage-800 p-4 rounded-sm flex justify-between items-center group hover:border-garage-700 transition-colors">
                      <div className="flex items-center gap-4">
                        {product.image_url && (
                          <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded-sm border border-garage-800" />
                        )}
                        <div>
                          <h4 className="font-bold text-white text-sm">{product.name}</h4>
                          <p className="text-xs text-bronze-500 font-mono">{product.price}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingId(product.id);
                            setProductForm(product);
                          }}
                          className="p-2 text-garage-400 hover:text-white bg-garage-900 hover:bg-garage-800 rounded-sm"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-garage-400 hover:text-red-500 bg-garage-900 hover:bg-garage-800 rounded-sm"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Finishes Management Section */}
            <div className="bg-garage-900 border border-garage-800 p-8 rounded-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white uppercase">Cerakote Finishes</h2>
                  <p className="text-garage-400 text-sm mt-1">Manage available color finishes.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingId('new_finish');
                    setFinishForm({});
                  }}
                  className="bg-bronze-600 hover:bg-bronze-500 text-white px-4 py-2 rounded-sm font-bold uppercase text-xs tracking-wider flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Add Finish
                </button>
              </div>

              {editingId === 'new_finish' || (editingId && editingId.startsWith('finish_')) ? (
                <div className="bg-garage-950 border border-garage-800 p-6 rounded-sm mb-8 animate-fade-in">
                  <h3 className="text-bronze-500 font-bold uppercase text-sm mb-4">{editingId === 'new_finish' ? 'New Finish' : 'Edit Finish'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="col-span-1">
                      <label className="block text-xs text-garage-500 uppercase mb-1">Finish Name</label>
                      <input
                        value={finishForm.name || ''}
                        onChange={e => setFinishForm({ ...finishForm, name: e.target.value })}
                        className="w-full bg-garage-900 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs text-garage-500 uppercase mb-1">Code</label>
                      <input
                        value={finishForm.code || ''}
                        onChange={e => setFinishForm({ ...finishForm, code: e.target.value })}
                        className="w-full bg-garage-900 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-garage-500 uppercase mb-1">Image URL</label>
                      <input
                        value={finishForm.image_url || ''}
                        onChange={e => setFinishForm({ ...finishForm, image_url: e.target.value })}
                        className="w-full bg-garage-900 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button onClick={() => setEditingId(null)} className="px-4 py-2 text-garage-400 hover:text-white text-xs font-bold uppercase">Cancel</button>
                    <button onClick={handleSaveFinish} className="bg-bronze-600 hover:bg-bronze-500 text-white px-6 py-2 rounded-sm font-bold uppercase text-xs tracking-wider">Save Finish</button>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {cerakoteFinishes.map(finish => (
                  <div key={finish.id} className="bg-garage-950 border border-garage-800 p-3 rounded-sm group hover:border-garage-700 transition-colors relative">
                    <div className="aspect-square mb-2 overflow-hidden rounded-sm">
                      <img src={finish.image_url} alt={finish.name} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-bold text-white text-xs truncate">{finish.name}</h4>
                    <p className="text-[10px] text-bronze-500 font-mono">{finish.code}</p>

                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-1">
                      <button
                        onClick={() => {
                          setEditingId('finish_' + finish.id);
                          setFinishForm(finish);
                        }}
                        className="p-1 text-white hover:text-bronze-500"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button
                        onClick={() => handleDeleteFinish(finish.id)}
                        className="p-1 text-white hover:text-red-500"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {
          activeTab === 'themes' && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-garage-900 p-6 rounded-sm border border-garage-800">
                <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-garage-800 pb-2">Video Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-garage-400 text-xs uppercase font-bold mb-2">Main Video URL</label>
                    <input
                      type="text"
                      name="helixVideoUrl"
                      value={generalForm.helixVideoUrl || ''}
                      onChange={handleGeneralChange}
                      className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none"
                      placeholder="/videos/helix-video.mp4"
                    />
                    <p className="text-xs text-garage-500 mt-1">Path to the main background video file.</p>
                  </div>

                  <div className="flex items-center justify-between bg-garage-950 p-4 border border-garage-800 rounded-sm">
                    <div>
                      <span className="block text-white font-bold uppercase text-sm">Show Extra Video Sections</span>
                      <span className="text-garage-400 text-xs">Enable the 3 additional videos below the main section.</span>
                    </div>
                    <button
                      onClick={() => setGeneralForm(prev => ({ ...prev, showExtraVideos: !prev.showExtraVideos }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${generalForm.showExtraVideos ? 'bg-bronze-500' : 'bg-garage-700'}`}
                    >
                      <span className={`${generalForm.showExtraVideos ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-garage-950 p-4 border border-garage-800 rounded-sm">
                    <div>
                      <span className="block text-white font-bold uppercase text-sm">Show Sound Gallery</span>
                      <span className="text-garage-400 text-xs">Toggle the Sound Check section on the Services page.</span>
                    </div>
                    <button
                      onClick={() => setGeneralForm(prev => ({ ...prev, showSoundGallery: !prev.showSoundGallery }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${generalForm.showSoundGallery ? 'bg-bronze-500' : 'bg-garage-700'}`}
                    >
                      <span className={`${generalForm.showSoundGallery ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={handleSaveHelix} className="bg-bronze-600 hover:bg-bronze-500 text-white px-6 py-2 rounded-sm font-bold uppercase text-xs tracking-wider">Save Video Settings</button>
                </div>
              </div>


              <div className="bg-garage-900 p-8 border border-garage-800">
                <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-6 border-b border-garage-800 pb-4">Themes & Appearance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Global Theme Settings */}
                  <div className="col-span-2">
                    <h4 className="text-sm font-bold text-bronze-500 uppercase tracking-wider mb-4">Global Settings</h4>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs text-garage-500 uppercase mb-3">Color Theme</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {['midnight', 'stealth', 'vintage', 'neon', 'forest', 'ocean'].map(theme => (
                        <button
                          key={theme}
                          onClick={() => setGeneralForm({ ...generalForm, theme: theme as any })}
                          className={`p-3 border rounded-sm flex flex-col items-center gap-2 transition-all ${generalForm.theme === theme
                            ? 'border-bronze-500 bg-garage-900 ring-1 ring-bronze-500/50'
                            : 'border-garage-800 bg-garage-950 hover:border-garage-600'
                            }`}
                        >
                          <div className={`w-full h-8 rounded-sm shadow-inner ${theme === 'midnight' ? 'bg-gradient-to-r from-garage-950 to-bronze-900' :
                            theme === 'stealth' ? 'bg-gradient-to-r from-gray-950 to-gray-800' :
                              theme === 'vintage' ? 'bg-gradient-to-r from-[#3b2a22] to-[#f59e0b]' :
                                theme === 'neon' ? 'bg-gradient-to-r from-black to-[#06b6d4]' :
                                  theme === 'forest' ? 'bg-gradient-to-r from-[#052e16] to-[#eab308]' :
                                    'bg-gradient-to-r from-[#020410] to-[#8b5cf6]'
                            }`}></div>
                          <span className="text-[10px] uppercase font-bold text-garage-300">{theme}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs text-garage-500 uppercase mb-1">Layout Style</label>
                    <select name="layoutStyle" value={generalForm.layoutStyle || 'default'} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none">
                      <option value="default">Default (Rich & Animated)</option>
                      <option value="minimal">Minimal (Clean & Simple)</option>
                    </select>
                  </div>

                  {/* Text Effects */}
                  <div className="col-span-2 mt-6 pt-6 border-t border-garage-800">
                    <h4 className="text-sm font-bold text-bronze-500 uppercase tracking-wider mb-4">Text Effects & Previews</h4>
                  </div>

                  {/* Title Effect Control & Preview */}
                  <div className="col-span-2 md:col-span-1 space-y-4">
                    <div>
                      <label className="block text-xs text-garage-500 uppercase mb-1">Title Effect (DNA)</label>
                      <select name="helixTitleEffect" value={generalForm.helixTitleEffect || 'none'} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none">
                        <option value="none">None (Float)</option>
                        <option value="idle">Idle (Breathing)</option>
                        <option value="heat">Heat Haze</option>
                        <option value="underglow">Underglow (Neon)</option>
                        <option value="ignition">Ignition (Spark)</option>
                        <option value="rev">Rev (Tachometer)</option>
                        <option value="carbon">Carbon Fiber</option>
                      </select>
                    </div>

                    <div className="bg-black/50 border border-garage-800 p-6 rounded-sm flex items-center justify-center h-24">
                      <span className={`text-2xl font-bold font-helix italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-bronze-500 to-amber-200 ${generalForm.helixTitleEffect ? `effect-${generalForm.helixTitleEffect}` : 'animate-float'}`}>
                        PREVIEW DNA
                      </span>
                    </div>
                    <p className="text-[10px] text-garage-500 text-center uppercase tracking-wider">Live Preview</p>
                  </div>

                  {/* Subtitle Effect Control & Preview */}
                  <div className="col-span-2 md:col-span-1 space-y-4">
                    <div>
                      <label className="block text-xs text-garage-500 uppercase mb-1">Subtitle Effect (Ireland's Finest)</label>
                      <select name="helixTextEffect" value={generalForm.helixTextEffect || 'none'} onChange={handleGeneralChange} className="w-full bg-garage-950 border border-garage-700 p-3 text-white focus:border-bronze-500 outline-none">
                        <option value="none">None</option>
                        <option value="idle">Idle (Breathing)</option>
                        <option value="heat">Heat Haze</option>
                        <option value="underglow">Underglow (Neon)</option>
                        <option value="ignition">Ignition (Spark)</option>
                        <option value="rev">Rev (Tachometer)</option>
                        <option value="carbon">Carbon Fiber</option>
                      </select>
                    </div>

                    <div className="bg-black/50 border border-garage-800 p-6 rounded-sm flex items-center justify-center h-24">
                      <span className={`text-2xl font-bold font-helix italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-white to-orange-500 ${generalForm.helixTextEffect ? `effect-${generalForm.helixTextEffect}` : ''}`}>
                        IRELAND'S FINEST
                      </span>
                    </div>
                    <p className="text-[10px] text-garage-500 text-center uppercase tracking-wider">Live Preview</p>
                  </div>

                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={handleSaveThemes} className="bg-bronze-600 text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-bronze-500 transition-colors duration-300">
                    Save Themes & Appearance
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* --- TEAM TAB --- */}
        {activeTab === 'team' && currentUserRole?.permissions.manage_team && (
          <TeamManagement currentUserRole={currentUserRole} />
        )}

        {/* Footer Logout */}
        <div className="mt-12 border-t border-garage-800 pt-8 flex justify-center pb-8">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 border border-red-900/50 text-red-500 hover:bg-red-950/30 hover:border-red-500 transition-all duration-300 rounded-sm uppercase text-xs font-bold tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-garage-900 border border-garage-800 p-8 rounded-sm max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
              <p className="text-garage-400 mb-8">Are you sure you want to delete this product? This action cannot be undone.</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 text-garage-400 hover:text-white text-sm font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProduct}
                  className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-sm font-bold uppercase text-sm tracking-wider"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div >
    </div >
  );
};

export default AdminDashboard;
