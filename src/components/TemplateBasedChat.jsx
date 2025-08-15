import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import ProjectSelector from './ProjectSelector';
import ExceptionalTemplate from './ExceptionalTemplate';
import VercelDeploymentManager from './VercelDeploymentManager';
import { getApiBaseUrl } from '../config/environment';

// Fixed trust/rating text to ensure consistent partial star rendering on the frontend
const FIXED_RATING_TEXT = '4.8/5 customer satisfaction rating';

// Mobile CSS overrides for viewport simulation
const getMobileViewportStyles = (previewMode) => {
  if (previewMode === 'desktop') return '';
  
  const isPhone = previewMode === 'phone';
  const scale = isPhone ? 0.95 : 0.9; // Further increased scale for bigger viewport
  const width = isPhone ? '375px' : '768px';
  const height = isPhone ? '667px' : '1024px';
  
  return `
    .mobile-viewport-simulator {
      width: ${width} !important;
      height: ${height} !important;
      transform: scale(${scale}) !important;
      transform-origin: top center !important;
      overflow: visible !important;
      border-radius: ${isPhone ? '20px' : '12px'} !important;
      background: white !important;
      position: relative !important;
      margin: 0 auto !important;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
    }
    
    /* Force mobile breakpoints - override all md: and lg: classes */
    .mobile-viewport-simulator .md\\:block { display: none !important; }
    .mobile-viewport-simulator .md\\:hidden { display: block !important; }
    .mobile-viewport-simulator .md\\:grid { display: block !important; }
    .mobile-viewport-simulator .md\\:grid-cols-3 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
    .mobile-viewport-simulator .md\\:grid-cols-2 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
    
    /* Responsive text sizing for mobile viewport */
    .mobile-viewport-simulator .md\\:text-7xl { font-size: 2.5rem !important; line-height: 1.1 !important; }
    .mobile-viewport-simulator .md\\:text-5xl { font-size: 2rem !important; line-height: 1.2 !important; }
    .mobile-viewport-simulator .md\\:text-3xl { font-size: 1.5rem !important; line-height: 1.3 !important; }
    .mobile-viewport-simulator .md\\:text-2xl { font-size: 1.25rem !important; line-height: 1.4 !important; }
    .mobile-viewport-simulator .md\\:text-xl { font-size: 1.125rem !important; line-height: 1.4 !important; }
    .mobile-viewport-simulator .md\\:text-lg { font-size: 1rem !important; line-height: 1.5 !important; }
    .mobile-viewport-simulator .md\\:text-base { font-size: 0.875rem !important; line-height: 1.5 !important; }
    
    /* Mobile spacing adjustments */
    .mobile-viewport-simulator .md\\:p-8 { padding: 1rem !important; }
    .mobile-viewport-simulator .md\\:p-6 { padding: 0.75rem !important; }
    .mobile-viewport-simulator .md\\:gap-8 { gap: 1rem !important; }
    .mobile-viewport-simulator .md\\:gap-6 { gap: 0.75rem !important; }
    .mobile-viewport-simulator .md\\:space-x-8 { margin-left: 0 !important; }
    .mobile-viewport-simulator .md\\:space-x-8 > * + * { margin-left: 0 !important; }
    .mobile-viewport-simulator .md\\:flex-row { flex-direction: column !important; }
    .mobile-viewport-simulator .md\\:space-y-0 { margin-top: 0 !important; }
    .mobile-viewport-simulator .md\\:space-y-0 > * + * { margin-top: 0.75rem !important; }
    
    /* Hero section specific mobile adjustments */
    .mobile-viewport-simulator .min-h-screen { min-height: 100vh !important; }
    .mobile-viewport-simulator .max-w-7xl { max-width: 100% !important; }
    .mobile-viewport-simulator .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
    .mobile-viewport-simulator .sm\\:px-6 { padding-left: 1rem !important; padding-right: 1rem !important; }
    .mobile-viewport-simulator .lg\\:px-8 { padding-left: 1rem !important; padding-right: 1rem !important; }
    
    /* Hero text spacing and sizing */
    .mobile-viewport-simulator .text-4xl { font-size: 1.75rem !important; line-height: 1.2 !important; }
    .mobile-viewport-simulator .sm\\:text-5xl { font-size: 2rem !important; line-height: 1.2 !important; }
    .mobile-viewport-simulator .text-lg { font-size: 1rem !important; line-height: 1.5 !important; }
    .mobile-viewport-simulator .sm\\:text-xl { font-size: 1.125rem !important; line-height: 1.4 !important; }
    .mobile-viewport-simulator .text-base { font-size: 0.875rem !important; line-height: 1.5 !important; }
    .mobile-viewport-simulator .sm\\:text-lg { font-size: 1rem !important; line-height: 1.5 !important; }
    
    /* Hero section margins and spacing */
    .mobile-viewport-simulator .mb-8 { margin-bottom: 1.5rem !important; }
    .mobile-viewport-simulator .mb-6 { margin-bottom: 1rem !important; }
    .mobile-viewport-simulator .mb-12 { margin-bottom: 2rem !important; }
    .mobile-viewport-simulator .max-w-3xl { max-width: 100% !important; }
    .mobile-viewport-simulator .max-w-2xl { max-width: 100% !important; }
    
    /* Hero badge adjustments */
    .mobile-viewport-simulator .px-4 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
    .mobile-viewport-simulator .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
    .mobile-viewport-simulator .text-sm { font-size: 0.75rem !important; }
    
    /* CTA button mobile adjustments */
    .mobile-viewport-simulator .px-8 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
    .mobile-viewport-simulator .py-4 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
    .mobile-viewport-simulator .text-sm { font-size: 0.875rem !important; }
    
    /* Social proof section mobile adjustments */
    .mobile-viewport-simulator .space-y-4 { margin-top: 0 !important; }
    .mobile-viewport-simulator .space-y-4 > * + * { margin-top: 0.75rem !important; }
    .mobile-viewport-simulator .sm\\:space-y-0 { margin-top: 0 !important; }
    .mobile-viewport-simulator .sm\\:space-y-0 > * + * { margin-top: 0.75rem !important; }
    .mobile-viewport-simulator .sm\\:space-x-8 { margin-left: 0 !important; }
    .mobile-viewport-simulator .sm\\:space-x-8 > * + * { margin-left: 0 !important; }
    .mobile-viewport-simulator .sm\\:flex-row { flex-direction: column !important; }
    
    /* Special handling for mobile menu - don't override md:hidden for menu items */
    .mobile-viewport-simulator .md\\:hidden.block { display: block !important; }
    .mobile-viewport-simulator .md\\:hidden.hidden { display: none !important; }
    
    /* Mobile button styling */
    .mobile-viewport-simulator .mobile-cta { 
      width: 100% !important; 
      padding: 1rem !important; 
      font-size: 1.125rem !important; 
    }
    
    /* Enable scrolling within the mobile viewport */
    .mobile-viewport-simulator {
      overflow-y: auto !important;
      overflow-x: hidden !important;
    }
    
    .mobile-viewport-simulator html, 
    .mobile-viewport-simulator body {
      overflow-x: hidden !important;
      width: 100% !important;
      height: auto !important;
    }
    
    /* Ensure proper text colors */
    .mobile-viewport-simulator .text-gray-900 { color: #111827 !important; }
    .mobile-viewport-simulator .text-gray-700 { color: #374151 !important; }
    .mobile-viewport-simulator .text-gray-600 { color: #4b5563 !important; }
    .mobile-viewport-simulator .text-gray-500 { color: #6b7280 !important; }
    .mobile-viewport-simulator .text-gray-400 { color: #9ca3af !important; }
    
    /* Ensure background images work */
    .mobile-viewport-simulator .bg-cover { background-size: cover !important; }
    .mobile-viewport-simulator .bg-center { background-position: center !important; }
    .mobile-viewport-simulator .bg-no-repeat { background-repeat: no-repeat !important; }
    
    /* Force mobile layout */
    .mobile-viewport-simulator .grid { display: grid !important; }
    .mobile-viewport-simulator .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
    
    /* Ensure proper z-index for overlays */
    .mobile-viewport-simulator .relative { position: relative !important; }
    .mobile-viewport-simulator .absolute { position: absolute !important; }
    .mobile-viewport-simulator .z-10 { z-index: 10 !important; }
    
    /* Fix mobile menu - ensure it's closed by default and toggle works */
    .mobile-viewport-simulator .md\\:hidden { display: none !important; }
    .mobile-viewport-simulator .md\\:hidden.block { display: block !important; }
    
    /* Ensure mobile menu toggle works */
    .mobile-viewport-simulator button { 
      cursor: pointer !important; 
      pointer-events: auto !important; 
    }
    
    /* Ensure mobile menu toggle button is visible and clickable */
    .mobile-viewport-simulator .md\\:hidden.inline-flex { 
      display: inline-flex !important; 
    }
  `;
};

// Default template data for new projects
export const DEFAULT_TEMPLATE_DATA = {
  businessName: 'Your Amazing Startup',
  seoTitle: 'Transform your idea into reality',
  businessLogoUrl: null,
  tagline: 'Transform your idea into reality with our innovative solution',
  heroDescription: 'Join thousands of satisfied customers who have already made the leap.',
  ctaButtonText: 'Start Building Free',
  sectionType: 'features', // 'features' for SaaS/tech, 'services' for restaurants/bars, 'highlights' for other businesses
  sectionTitle: 'Everything you need to succeed',
  sectionSubtitle: 'Our platform combines cutting-edge AI with proven design principles to create landing pages that convert.',
  features: [
    {
      icon: "🚀",
      title: "AI-Powered Design",
      description: "Our AI analyzes your business and creates stunning, conversion-optimized designs automatically."
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Build and deploy your landing page in minutes, not hours. Get to market faster than ever."
    },
    {
      icon: "📱",
      title: "Mobile-First",
      description: "Every landing page is optimized for mobile devices, ensuring perfect performance everywhere."
    },
    {
      icon: "🎨",
      title: "Customizable",
      description: "Easily customize colors, fonts, layouts, and content to match your brand perfectly."
    },
    {
      icon: "📊",
      title: "Analytics Built-in",
      description: "Track conversions, user behavior, and performance with our integrated analytics dashboard."
    },
    {
      icon: "🔒",
      title: "Secure & Reliable",
      description: "Built on enterprise-grade infrastructure with 99.9% uptime and advanced security."
    }
  ],
  aboutContent: "We understand the challenges of bringing ideas to life. That's why we've built a platform that makes it effortless to create professional landing pages that actually convert visitors into customers.",
  pricing: [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for trying out our platform",
      features: ["1 landing page", "Basic templates", "Email support", "Analytics dashboard"],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For growing businesses and creators",
      features: ["Unlimited landing pages", "Premium templates", "Priority support", "Advanced analytics", "Custom domains", "A/B testing"],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "For large teams and agencies",
      features: ["Everything in Pro", "Team collaboration", "White-label options", "API access", "Dedicated support", "Custom integrations"],
      cta: "Contact Sales",
      popular: false
    }
  ],
  contactInfo: {
    email: "hello@jetsy.com",
    phone: "+1 (555) 123-4567",
    office: "San Francisco, CA"
  },
  trustIndicator1: "Join 10,000+ creators",
  trustIndicator2: FIXED_RATING_TEXT,
  // New dynamic fields
  heroBadge: "Now Available - AI-Powered Landing Pages",
  aboutSectionTitle: "Built by creators, for creators",
  aboutSectionSubtitle: "Our platform combines cutting-edge AI with proven design principles to create landing pages that convert.",
  aboutBenefits: [
    "No coding knowledge required",
    "AI-powered design optimization",
    "Built-in analytics and tracking"
  ],
  pricingSectionTitle: "Simple, transparent pricing",
  pricingSectionSubtitle: "Choose the plan that's right for you. All plans include our core features and 24/7 support.",
  contactSectionTitle: "Ready to get started?",
  contactSectionSubtitle: "Let's discuss how we can help you create the perfect landing page for your business. Our team is here to support you every step of the way.",
  contactFormPlaceholders: {
    name: "Your name",
    email: "your@email.com",
    company: "Your company",
    message: "Tell us about your project..."
  },
  footerDescription: "Build beautiful, conversion-optimized landing pages with AI. Transform your ideas into reality in minutes.",
  footerProductLinks: ["Features", "Pricing", "Templates", "API"],
  footerCompanyLinks: ["About", "Blog", "Careers", "Contact"],
  landingPagesCreated: "10,000+ Landing Pages Created",
  // Background image URLs (user-uploaded or AI-generated)
  heroBackgroundImage: null,
  aboutBackgroundImage: null
  ,
  // Lead form settings
  showLeadPhoneField: true,
  // Visibility flags for removing sections/components
  showHeroSection: true,
  showHeroBadge: true,
  showHeroCTA: true,
  showHeroSocialProof: true,
  showDynamicSection: true,
  showSectionTitle: true,
  showSectionSubtitle: true,
  showAboutSection: true,
  showAboutTitle: true,
  showAboutSubtitle: true,
  showAboutBenefits: true,
  showPricingSection: true,
  showPricingTitle: true,
  showPricingSubtitle: true,
  showContactSection: true,
  showContactTitle: true,
  showContactSubtitle: true,
  showContactInfoList: true,
  showContactForm: true,
  showFooter: true
};

const TemplateBasedChat = forwardRef(({ onBackToHome, onSaveChanges, previewMode = 'desktop' }, ref) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [showProjectPanel, setShowProjectPanel] = useState(false);
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [templateData, setTemplateData] = useState(DEFAULT_TEMPLATE_DATA);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [domainStatus, setDomainStatus] = useState(null); // { domain, status }
  const [isSubmittingDomain, setIsSubmittingDomain] = useState(false);

  const submitCustomDomain = async () => {
    if (!currentProject?.id || !customDomainInput) return;
    setIsSubmittingDomain(true);
    try {
      const payload = {
        domain: customDomainInput.trim().toLowerCase(),
        project_id: currentProject.id,
        user_id: currentProject.user_id || 0
      };
      const res = await fetch(`${getApiBaseUrl()}/api/custom-domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      let j; try { j = JSON.parse(text); } catch { j = { raw: text }; }
      if (!res.ok || j?.ok === false) {
        console.error('Create custom domain failed', j);
        alert('Failed to submit custom domain: ' + (j?.error || JSON.stringify(j)));
        return;
      }
      console.log('Create custom domain OK', j);
      setDomainStatus({ domain: payload.domain, status: 'pending' });
      setShowDomainModal(false);
    } catch (e) {
      alert('Error submitting custom domain');
    } finally {
      setIsSubmittingDomain(false);
    }
  };

  // Poll for status if pending
  useEffect(() => {
    let timer;
    const poll = async () => {
      if (!domainStatus?.domain || domainStatus.status !== 'pending') return;
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/custom-domains/${encodeURIComponent(domainStatus.domain)}`);
        if (res.status === 404) {
          // No mapping exists anymore; clear local state
          setDomainStatus(null);
          return;
        }
        if (res.ok) {
          const j = await res.json();
          const st = j?.mapping?.status;
          if (st === 'active') setDomainStatus({ domain: domainStatus.domain, status: 'active' });
        }
      } catch {}
      timer = setTimeout(poll, 5000);
    };
    poll();
    return () => timer && clearTimeout(timer);
  }, [domainStatus?.domain, domainStatus?.status]);
  
  // Compute the initial user idea message for display in editor mode
  const initialUserIdea = React.useMemo(() => {
    if (!messages || messages.length === 0) return null;
    // Prefer explicit flag if available
    const flagged = messages.find((m) => m.is_initial_message && m.role === 'user');
    if (flagged) return flagged;
    // Fallback: earliest user message by timestamp
    const userMessages = messages.filter((m) => m.role === 'user' && m.timestamp);
    if (userMessages.length === 0) return null;
    userMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    return userMessages[0] || null;
  }, [messages]);

  // Expose saveTemplateData method to parent component
  useImperativeHandle(ref, () => ({
    saveTemplateData: async () => {
      if (!currentProject?.id) return;
      
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/projects/${currentProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            template_data: templateData
          })
        });
        
        if (response.ok) {
          console.log('Template data saved successfully');
          alert('Changes saved successfully!');
        } else {
          console.error('Failed to save template data');
          alert('Failed to save changes. Please try again.');
        }
      } catch (error) {
        console.error('Error saving template data:', error);
        alert('Error saving changes. Please try again.');
      }
    }
  }));

  // Load existing project when component mounts
  useEffect(() => {
    loadOrRestoreProject();
  }, []);

  // When we have a project, load any existing custom domain mapping
  useEffect(() => {
    const fetchDomains = async () => {
      if (!currentProject?.id) return;
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/custom-domains?project_id=${encodeURIComponent(currentProject.id)}`);
        if (res.ok) {
          const data = await res.json();
          const domains = data?.domains || [];
          const active = domains.find(d => d.status === 'active');
          const pending = domains.find(d => d.status === 'pending');
          if (active) setDomainStatus({ domain: active.domain, status: 'active' });
          else if (pending) setDomainStatus({ domain: pending.domain, status: 'pending' });
          else setDomainStatus(null);
        }
      } catch {}
    };
    fetchDomains();
  }, [currentProject?.id]);

  // Auto-save template data when it changes
  useEffect(() => {
    if (currentProject?.id && isEditorMode) {
      const saveTemplateData = async () => {
        try {
          const response = await fetch(`${getApiBaseUrl()}/api/projects/${currentProject.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              template_data: templateData
            })
          });
          
          if (response.ok) {
            console.log('Template data auto-saved successfully');
          } else {
            console.error('Failed to auto-save template data');
          }
        } catch (error) {
          console.error('Error auto-saving template data:', error);
        }
      };

      // Debounce the save to avoid too many API calls
      const timeoutId = setTimeout(saveTemplateData, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [templateData, currentProject?.id, isEditorMode]);

  const getStoredProjectId = () => {
    return localStorage.getItem('jetsy_current_project_id');
  };

  const setStoredProjectId = (projectId) => {
    localStorage.setItem('jetsy_current_project_id', projectId);
  };

  const loadOrRestoreProject = async () => {
    try {
      const storedProjectId = getStoredProjectId();
      
      if (storedProjectId) {
        const response = await fetch(`${getApiBaseUrl()}/api/projects/${storedProjectId}`);
        if (response.ok) {
          const result = await response.json();
          const project = result.project;
          setCurrentProject({
            id: project.id,
            user_id: project.user_id,
            project_name: project.project_name,
            files: JSON.parse(project.files)
          });
          
          // Load saved template data if it exists
          if (project.template_data) {
            console.log('🔍 Found template_data in project:', project.template_data);
            try {
              // Parse template_data if it's a JSON string
              const parsedTemplateData = typeof project.template_data === 'string' 
                ? JSON.parse(project.template_data) 
                : project.template_data;
              console.log('✅ Parsed template_data:', parsedTemplateData);
              // Merge with default template data to ensure all fields are present
              const mergedTemplateData = { ...DEFAULT_TEMPLATE_DATA, ...parsedTemplateData };
              setTemplateData(mergedTemplateData);
              // Switch to editor mode if template data exists
              setIsEditorMode(true);
            } catch (error) {
              console.error('❌ Error parsing template_data:', error);
              console.log('🔍 Raw template_data:', project.template_data);
            }
          } else {
            console.log('⚠️ No template_data found in project');
            // Reset to default template data and switch to chat mode
            setTemplateData(DEFAULT_TEMPLATE_DATA);
            setIsEditorMode(false);
          }
          
          await loadChatMessages(project.id);
          return;
        }
      }

      const projectsResponse = await fetch('/api/projects?user_id=1');
      if (projectsResponse.ok) {
        const result = await projectsResponse.json();
        if (result.projects && result.projects.length > 0) {
          const mostRecent = result.projects[0];
          setCurrentProject({
            id: mostRecent.id,
            user_id: mostRecent.user_id,
            project_name: mostRecent.project_name,
            files: JSON.parse(mostRecent.files)
          });
          
          // Load saved template data if it exists
          if (mostRecent.template_data) {
            console.log('🔍 Found template_data in mostRecent project:', mostRecent.template_data);
            try {
              // Parse template_data if it's a JSON string
              const parsedTemplateData = typeof mostRecent.template_data === 'string' 
                ? JSON.parse(mostRecent.template_data) 
                : mostRecent.template_data;
              console.log('✅ Parsed template_data from mostRecent:', parsedTemplateData);
              // Merge with default template data to ensure all fields are present
              const mergedTemplateData = { ...DEFAULT_TEMPLATE_DATA, ...parsedTemplateData };
              setTemplateData(mergedTemplateData);
              // Switch to editor mode if template data exists
              setIsEditorMode(true);
            } catch (error) {
              console.error('❌ Error parsing template_data from mostRecent:', error);
              console.log('🔍 Raw template_data from mostRecent:', mostRecent.template_data);
            }
          } else {
            console.log('⚠️ No template_data found in mostRecent project');
            // Reset to default template data and switch to chat mode
            setTemplateData(DEFAULT_TEMPLATE_DATA);
            setIsEditorMode(false);
          }
          
          setStoredProjectId(mostRecent.id);
          await loadChatMessages(mostRecent.id);
          return;
        }
      }

      await createDefaultProject();
    } catch (error) {
      console.error('Error loading/restoring project:', error);
      await createDefaultProject();
    }
  };

  const createDefaultProject = async () => {
    try {
      const projectData = {
        project_name: "AI Landing Page Builder",
        user_id: 1,
        files: {
          "src/App.jsx": `import React from 'react';\nimport './index.css';\nfunction App() {\n  return (\n    <div className=\"min-h-screen bg-gray-50\">\n      <div className=\"container mx-auto px-4 py-8\">\n        <h1 className=\"text-4xl font-bold text-center text-gray-900 mb-8\">Welcome to Your Landing Page</h1>\n        <p className=\"text-center text-gray-600 mb-8\">This is a placeholder. Start chatting to customize your landing page!</p>\n      </div>\n    </div>\n  );\n}\nexport default App;`,
          "src/index.css": `@tailwind base;\n@tailwind components;\n@tailwind utilities;`
        }
        // Don't include template_data for new projects - let users chat first
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        const result = await response.json();
        const newProject = { id: result.project_id, ...projectData };
        setCurrentProject(newProject);
        setStoredProjectId(result.project_id);
        // Start in chat mode for new projects
        setIsEditorMode(false);
        setTemplateData(DEFAULT_TEMPLATE_DATA);
        await loadChatMessages(result.project_id);
      }
    } catch (error) {
      console.error('Error creating default project:', error);
    }
  };

  const loadChatMessages = async (projectId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/chat_messages?project_id=${projectId}`);
      if (response.ok) {
        const result = await response.json();
        const messages = result.messages || [];
        setMessages(messages);
        
        // Don't override editor mode here - it should be controlled by template data presence
        // The editor mode is set in handleProjectSelect and loadOrRestoreProject based on template_data
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentProject) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      message: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Add user message to chat history
      await fetch(`${getApiBaseUrl()}/api/chat_messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: currentProject.id,
          role: 'user',
          message: inputMessage,
          is_initial_message: messages.length === 0
        })
      });

      // Call AI to generate template content
      const aiResponse = await fetch(`${getApiBaseUrl()}/api/template-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: currentProject.id,
          user_message: inputMessage,
          current_template_data: templateData
        })
      });

      if (aiResponse.ok) {
        const result = await aiResponse.json();
        
        // Update template data with AI-generated content
        if (result.template_data) {
          setTemplateData(result.template_data);
          
          // Save the AI-generated template data to database
          try {
            const saveResponse = await fetch(`${getApiBaseUrl()}/api/projects/${currentProject.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                template_data: result.template_data
              })
            });
            
            if (saveResponse.ok) {
              console.log('AI-generated template data saved successfully');
            } else {
              console.error('Failed to save AI-generated template data');
            }
          } catch (error) {
            console.error('Error saving AI-generated template data:', error);
          }
        }



        // Handle generated background images and AI-generated logo
        if (result.generated_images && result.generated_images.length > 0) {
          console.log('🎨 Generated background images:', result.generated_images);
          
          // Extract background image URLs
          const heroBackgroundImage = result.generated_images.find(img => img.placement === 'hero_background')?.url;
          const aboutBackgroundImage = result.generated_images.find(img => img.placement === 'about_background')?.url;
          const businessLogoUrl = result.generated_images.find(img => img.placement === 'logo')?.url;
          
          console.log('🎨 Extracted hero background image URL:', heroBackgroundImage);
          console.log('🎨 Extracted about background image URL:', aboutBackgroundImage);
          console.log('🎨 Extracted business logo URL:', businessLogoUrl);
          
          // Update template data with background images
          if (heroBackgroundImage || aboutBackgroundImage || businessLogoUrl) {
            setTemplateData(prev => {
              const updatedData = {
                ...prev,
                heroBackgroundImage,
                aboutBackgroundImage,
                businessLogoUrl
              };
              console.log('🎨 Updated template data with background images:', updatedData);
              return updatedData;
            });
          }
        }

        // Add AI response to chat
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          message: result.assistant_message || 'I\'ve updated your landing page with the new content!',
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, aiMessage]);

        // Switch to editor mode after first message
        if (messages.length === 0) {
          setIsEditorMode(true);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Fallback response
      const fallbackMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        message: 'I\'ve updated your landing page with the new content! You can now use the editor to make further customizations.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, fallbackMessage]);
      setIsEditorMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleProjectSelect = async (project) => {
    setCurrentProject({
      id: project.id,
      user_id: project.user_id,
      project_name: project.project_name,
      files: typeof project.files === 'string' ? JSON.parse(project.files) : project.files
    });
    setStoredProjectId(project.id);
    await loadChatMessages(project.id);
    
    // Load saved template data if it exists
    if (project.template_data) {
      console.log('🔍 Found template_data in selected project:', project.template_data);
      try {
        // Parse template_data if it's a JSON string
        const parsedTemplateData = typeof project.template_data === 'string' 
          ? JSON.parse(project.template_data) 
          : project.template_data;
        console.log('✅ Parsed template_data from selected project:', parsedTemplateData);
        // Merge with default template data to ensure all fields are present
        const mergedTemplateData = { ...DEFAULT_TEMPLATE_DATA, ...parsedTemplateData };
        setTemplateData(mergedTemplateData);
        // Switch to editor mode if template data exists
        setIsEditorMode(true);
      } catch (error) {
        console.error('❌ Error parsing template_data from selected project:', error);
        console.log('🔍 Raw template_data from selected project:', project.template_data);
      }
    } else {
      console.log('⚠️ No template_data found in selected project');
      // Reset to default template data and switch to chat mode
      setTemplateData(DEFAULT_TEMPLATE_DATA);
      setIsEditorMode(false);
    }
    
    setShowProjectPanel(false);
  };

  const handleAllProjectsDeleted = async () => {
    setCurrentProject(null);
    setMessages([]);
    setStoredProjectId(null);
    await createDefaultProject();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Inject mobile viewport styles */}
      <style dangerouslySetInnerHTML={{ __html: getMobileViewportStyles(previewMode) }} />
      {/* Left Side - Chat/Editor Panel */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isEditorMode ? 'Template Editor' : 'AI Chat'}
                </h1>
                <p className="text-sm text-gray-500">
                  {currentProject?.project_name || 'Loading...'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  console.log('Toggling project panel, current state:', showProjectPanel);
                  setShowProjectPanel(!showProjectPanel);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Projects
              </button>
            </div>
          </div>
        </div>

        {/* Project Panel */}
        {showProjectPanel && (
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="p-4">
              <ProjectSelector
                onProjectSelect={handleProjectSelect}
                currentProjectId={currentProject?.id}
                onAllProjectsDeleted={handleAllProjectsDeleted}
              />
            </div>
          </div>
        )}

        {/* Chat/Editor Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {!isEditorMode ? (
            // Chat Mode
            <>
                              {/* Messages */}
                <div className="h-[calc(100vh-400px)] overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4">
                <div className="relative bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Describe your startup idea or business..."
                        className="w-full px-4 py-3 bg-transparent border-none outline-none resize-none text-text placeholder-mutedText text-lg leading-relaxed min-h-[80px] md:min-h-[60px] max-h-[400px] md:max-h-[200px]"
                        rows={4}
                        disabled={isLoading}
                        style={{ fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>
                  
                  {/* Submit Button - Positioned in bottom right corner */}
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className={`absolute bottom-6 right-6 p-3 rounded-full transition-colors duration-200 flex-shrink-0 ${
                      inputMessage.trim() && !isLoading
                        ? 'bg-black hover:bg-gray-800' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    title="Submit message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 -960 960 960" className={`shrink-0 h-6 w-6 ${inputMessage.trim() && !isLoading ? 'text-white' : 'text-gray-500'}`} fill="currentColor">
                      <path d="M442.39-616.87 309.78-487.26q-11.82 11.83-27.78 11.33t-27.78-12.33q-11.83-11.83-11.83-27.78 0-15.96 11.83-27.79l198.43-199q11.83-11.82 28.35-11.82t28.35 11.82l198.43 199q11.83 11.83 11.83 27.79 0 15.95-11.83 27.78-11.82 11.83-27.78 11.83t-27.78-11.83L521.61-618.87v348.83q0 16.95-11.33 28.28-11.32 11.33-28.28 11.33t-28.28-11.33q-11.33-11.33-11.33-28.28z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Editor Mode
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  {initialUserIdea ? (
                    <div className="mb-4">
                      <div className="flex justify-end">
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-blue-600 text-white`}>
                          <p className="text-sm whitespace-pre-wrap">{initialUserIdea.message}</p>
                          {initialUserIdea.timestamp ? (
                            <p className="text-xs opacity-70 mt-1">{new Date(initialUserIdea.timestamp).toLocaleString()}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <p className="text-gray-600 mb-6">
                    Your landing page has been generated! Customize the content below and see changes in real-time.
                  </p>
                </div>
                
                {/* SEO Title & Website Headline */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Website Title & SEO
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website Title
                      </label>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                          <span className="font-medium">Full SEO Title:</span> {templateData.businessName || 'Business Name'} - {templateData.seoTitle || 'Headline'}
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-gray-600">Business Name</label>
                          <input
                            type="text"
                            value={templateData.businessName || ''}
                            onChange={(e) => setTemplateData(prev => ({ ...prev, businessName: e.target.value }))}
                            placeholder="Your Business Name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            maxLength={30}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-gray-600">(appears in browser tab & search results)</label>
                          <input
                            type="text"
                            value={`${templateData.businessName || 'Business Name'} - ${templateData.seoTitle || 'Headline'}`}
                            onChange={(e) => {
                              // Extract the headline part from the full title input
                              const fullTitle = e.target.value;
                              const businessName = templateData.businessName || 'Business Name';
                              if (fullTitle.startsWith(businessName + ' - ')) {
                                const headline = fullTitle.substring((businessName + ' - ').length);
                                setTemplateData(prev => ({ ...prev, seoTitle: headline }));
                              } else {
                                // If format doesn't match, just update the headline
                                setTemplateData(prev => ({ ...prev, seoTitle: fullTitle }));
                              }
                            }}
                            placeholder="Business Name - Compelling Description"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            maxLength={60}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: 50-60 characters for the full title.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business Logo (above Hero Section) */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Business Logo
                  </h4>
                  <div className="space-y-4">
                    {templateData.businessLogoUrl ? (
                      <div className="flex items-center space-x-4">
                        <img src={templateData.businessLogoUrl} alt="Logo" className="h-12 w-auto border rounded" />
                        <button
                          onClick={() => setTemplateData(prev => ({ ...prev, businessLogoUrl: null }))}
                          className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                        >Remove</button>
                      </div>
                    ) : null}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Logo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !currentProject?.id) return;
                          const formData = new FormData();
                          formData.append('project_id', currentProject.id);
                          formData.append('file', file);
                          try {
                            const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
                            if (res.ok) {
                              const data = await res.json();
                              setTemplateData(prev => ({ ...prev, businessLogoUrl: data.url }));
                            }
                          } catch (err) {
                            console.error('Logo upload failed', err);
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Hero Section Editor */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Hero Section
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showHeroSection: !prev.showHeroSection }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showHeroSection ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showHeroSection ? 'Hide entire section' : 'Show section'}
                    </button>
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showHeroBadge: !prev.showHeroBadge }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showHeroBadge ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showHeroBadge ? 'Hide badge' : 'Show badge'}
                    </button>
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showHeroCTA: !prev.showHeroCTA }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showHeroCTA ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showHeroCTA ? 'Hide CTA' : 'Show CTA'}
                    </button>
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showHeroSocialProof: !prev.showHeroSocialProof }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showHeroSocialProof ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showHeroSocialProof ? 'Hide social proof' : 'Show social proof'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                      <input
                        type="text"
                        value={templateData.businessName}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, businessName: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your business name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                      <input
                        type="text"
                        value={templateData.tagline}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, tagline: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your tagline"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hero Description</label>
                      <textarea
                        value={templateData.heroDescription}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, heroDescription: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Enter your hero description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
                      <input
                        type="text"
                        value={templateData.ctaButtonText}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, ctaButtonText: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your CTA button text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lead Form Settings</label>
                      <div className="flex items-center space-x-3">
                        <input
                          id="togglePhoneField"
                          type="checkbox"
                          checked={templateData.showLeadPhoneField}
                          onChange={(e) => setTemplateData(prev => ({ ...prev, showLeadPhoneField: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label htmlFor="togglePhoneField" className="text-sm text-gray-700">Show phone number field in lead form</label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">If disabled, the form subtitle updates to “Enter your email to get started”.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hero Badge</label>
                      <input
                        type="text"
                        value={templateData.heroBadge}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, heroBadge: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your hero badge text"
                      />
                    </div>
                    {/* Hero Background Image Uploader */}
                    <div className="pt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hero Background Image</label>
                      {templateData.heroBackgroundImage ? (
                        <div className="flex items-center space-x-4 mb-3">
                          <div
                            className="h-12 w-20 rounded border bg-cover bg-center"
                            style={{ backgroundImage: `url(${templateData.heroBackgroundImage})` }}
                          />
                          <button
                            onClick={() => setTemplateData(prev => ({ ...prev, heroBackgroundImage: null }))}
                            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                          >Remove</button>
                        </div>
                      ) : null }
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !currentProject?.id) return;
                          const formData = new FormData();
                          formData.append('project_id', currentProject.id);
                          formData.append('file', file);
                          try {
                            const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
                            if (res.ok) {
                              const data = await res.json();
                              setTemplateData(prev => ({ ...prev, heroBackgroundImage: data.url }));
                            }
                          } catch (err) {
                            console.error('Hero background upload failed', err);
                          }
                        }}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-2">We automatically add a dark overlay for readability with white text.</p>
                    </div>
                  </div>
                </div>

                {/* Dynamic Section Editor */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {templateData.sectionType === 'features' ? 'Features' : 
                     templateData.sectionType === 'services' ? 'Services' : 'Highlights'} Section
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showDynamicSection: !prev.showDynamicSection }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showDynamicSection ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showDynamicSection ? 'Hide entire section' : 'Show section'}
                    </button>
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showSectionTitle: !prev.showSectionTitle }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showSectionTitle ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showSectionTitle ? 'Hide title' : 'Show title'}
                    </button>
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showSectionSubtitle: !prev.showSectionSubtitle }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showSectionSubtitle ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showSectionSubtitle ? 'Hide subtitle' : 'Show subtitle'}
                    </button>
                  </div>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Section Type</label>
                      <select
                        value={templateData.sectionType}
                        onChange={(e) => setTemplateData(prev => ({ 
                          ...prev, 
                          sectionType: e.target.value,
                          sectionTitle: e.target.value === 'features' ? 'Everything you need to succeed' :
                                        e.target.value === 'services' ? 'Our exceptional services' :
                                        'What makes us special'
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="features">Features (for SaaS/Tech)</option>
                        <option value="services">Services (for Restaurants/Bars)</option>
                        <option value="highlights">Highlights (for Other Businesses)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                      <input
                        type="text"
                        value={templateData.sectionTitle}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, sectionTitle: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter section title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
                      <textarea
                        value={templateData.sectionSubtitle}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, sectionSubtitle: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="Enter section subtitle"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {(templateData.features || []).map((feature, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Feature {index + 1}</span>
                          <button
                            onClick={() => {
                              const newFeatures = templateData.features.filter((_, i) => i !== index);
                              setTemplateData(prev => ({ ...prev, features: newFeatures }));
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Icon</label>
                            <input
                              type="text"
                              value={feature.icon}
                              onChange={(e) => {
                                const newFeatures = [...templateData.features];
                                newFeatures[index].icon = e.target.value;
                                setTemplateData(prev => ({ ...prev, features: newFeatures }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="🚀"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Title</label>
                            <input
                              type="text"
                              value={feature.title}
                              onChange={(e) => {
                                const newFeatures = [...templateData.features];
                                newFeatures[index].title = e.target.value;
                                setTemplateData(prev => ({ ...prev, features: newFeatures }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Feature title"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Description</label>
                            <textarea
                              value={feature.description}
                              onChange={(e) => {
                                const newFeatures = [...templateData.features];
                                newFeatures[index].description = e.target.value;
                                setTemplateData(prev => ({ ...prev, features: newFeatures }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={2}
                              placeholder="Feature description"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newFeature = {
                          icon: "✨",
                          title: "New Feature",
                          description: "Add your feature description here"
                        };
                        setTemplateData(prev => ({
                          ...prev,
                          features: [...prev.features, newFeature]
                        }));
                      }}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                    >
                      + Add Feature
                    </button>
                  </div>
                </div>

                {/* About Section Editor */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    About Section
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showAboutSection: !prev.showAboutSection }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showAboutSection ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showAboutSection ? 'Hide entire section' : 'Show section'}
                    </button>
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showAboutTitle: !prev.showAboutTitle }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showAboutTitle ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showAboutTitle ? 'Hide title' : 'Show title'}
                    </button>
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showAboutSubtitle: !prev.showAboutSubtitle }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showAboutSubtitle ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showAboutSubtitle ? 'Hide subtitle' : 'Show subtitle'}
                    </button>
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showAboutBenefits: !prev.showAboutBenefits }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showAboutBenefits ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showAboutBenefits ? 'Hide benefits list' : 'Show benefits list'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">About Content</label>
                      <textarea
                        value={templateData.aboutContent}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, aboutContent: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Enter your about section content"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">About Section Title</label>
                      <input
                        type="text"
                        value={templateData.aboutSectionTitle}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, aboutSectionTitle: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Built by creators, for creators"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">About Section Subtitle</label>
                      <textarea
                        value={templateData.aboutSectionSubtitle}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, aboutSectionSubtitle: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="Enter about section subtitle"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">About Benefits</label>
                      {(templateData.aboutBenefits || []).map((benefit, index) => (
                        <div key={index} className="mb-2">
                          <input
                            type="text"
                            value={benefit}
                            onChange={(e) => {
                              const newBenefits = [...(templateData.aboutBenefits || [])];
                              newBenefits[index] = e.target.value;
                              setTemplateData(prev => ({ ...prev, aboutBenefits: newBenefits }));
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Benefit ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Landing Pages Created</label>
                      <input
                        type="text"
                        value={templateData.landingPagesCreated}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, landingPagesCreated: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 10,000+ Landing Pages Created"
                      />
                    </div>
                    {/* About Background Image Uploader */}
                    <div className="pt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">About Background Image</label>
                      {templateData.aboutBackgroundImage ? (
                        <div className="flex items-center space-x-4 mb-3">
                          <div
                            className="h-12 w-20 rounded border bg-cover bg-center"
                            style={{ backgroundImage: `url(${templateData.aboutBackgroundImage})` }}
                          />
                          <button
                            onClick={() => setTemplateData(prev => ({ ...prev, aboutBackgroundImage: null }))}
                            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                          >Remove</button>
                        </div>
                      ) : null }
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !currentProject?.id) return;
                          const formData = new FormData();
                          formData.append('project_id', currentProject.id);
                          formData.append('file', file);
                          try {
                            const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
                            if (res.ok) {
                              const data = await res.json();
                              setTemplateData(prev => ({ ...prev, aboutBackgroundImage: data.url }));
                            }
                          } catch (err) {
                            console.error('About background upload failed', err);
                          }
                        }}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-2">We automatically add a dark overlay for readability with white text.</p>
                    </div>
                  </div>
                </div>

                {/* Pricing Section Editor */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Pricing Section
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showPricingSection: !prev.showPricingSection }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showPricingSection ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showPricingSection ? 'Hide entire section' : 'Show section'}
                    </button>
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showPricingTitle: !prev.showPricingTitle }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showPricingTitle ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showPricingTitle ? 'Hide title' : 'Show title'}
                    </button>
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showPricingSubtitle: !prev.showPricingSubtitle }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showPricingSubtitle ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showPricingSubtitle ? 'Hide subtitle' : 'Show subtitle'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Section Title</label>
                      <input
                        type="text"
                        value={templateData.pricingSectionTitle}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, pricingSectionTitle: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Simple, transparent pricing"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Section Subtitle</label>
                      <textarea
                        value={templateData.pricingSectionSubtitle}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, pricingSectionSubtitle: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="Enter pricing section subtitle"
                      />
                    </div>
                    {(templateData.pricing || []).map((plan, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">{plan.name} Plan</span>
                          <button
                            onClick={() => {
                              const newPricing = templateData.pricing.filter((_, i) => i !== index);
                              setTemplateData(prev => ({ ...prev, pricing: newPricing }));
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Plan Name</label>
                            <input
                              type="text"
                              value={plan.name}
                              onChange={(e) => {
                                const newPricing = [...templateData.pricing];
                                newPricing[index].name = e.target.value;
                                setTemplateData(prev => ({ ...prev, pricing: newPricing }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Price</label>
                            <input
                              type="text"
                              value={plan.price}
                              onChange={(e) => {
                                const newPricing = [...templateData.pricing];
                                newPricing[index].price = e.target.value;
                                setTemplateData(prev => ({ ...prev, pricing: newPricing }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-600 mb-1">Description</label>
                            <input
                              type="text"
                              value={plan.description}
                              onChange={(e) => {
                                const newPricing = [...templateData.pricing];
                                newPricing[index].description = e.target.value;
                                setTemplateData(prev => ({ ...prev, pricing: newPricing }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-600 mb-1">CTA Button Text</label>
                            <input
                              type="text"
                              value={plan.cta}
                              onChange={(e) => {
                                const newPricing = [...templateData.pricing];
                                newPricing[index].cta = e.target.value;
                                setTemplateData(prev => ({ ...prev, pricing: newPricing }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newPlan = {
                          name: "New Plan",
                          price: "$0",
                          description: "Plan description",
                          features: ["Feature 1", "Feature 2"],
                          cta: "Get Started",
                          popular: false
                        };
                        setTemplateData(prev => ({
                          ...prev,
                          pricing: [...prev.pricing, newPlan]
                        }));
                      }}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                    >
                      + Add Pricing Plan
                    </button>
                  </div>
                </div>

                {/* Contact Section Editor */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Contact Section
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showContactSection: !prev.showContactSection }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showContactSection ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showContactSection ? 'Hide entire section' : 'Show section'}
                    </button>
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showContactTitle: !prev.showContactTitle }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showContactTitle ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showContactTitle ? 'Hide title' : 'Show title'}
                    </button>
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showContactSubtitle: !prev.showContactSubtitle }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showContactSubtitle ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showContactSubtitle ? 'Hide subtitle' : 'Show subtitle'}
                    </button>
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showContactInfoList: !prev.showContactInfoList }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showContactInfoList ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showContactInfoList ? 'Hide info list' : 'Show info list'}
                    </button>
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showContactForm: !prev.showContactForm }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showContactForm ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showContactForm ? 'Hide form' : 'Show form'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Section Title</label>
                      <input
                        type="text"
                        value={templateData.contactSectionTitle}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, contactSectionTitle: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Ready to get started?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Section Subtitle</label>
                      <textarea
                        value={templateData.contactSectionSubtitle}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, contactSectionSubtitle: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Enter contact section subtitle"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={templateData.contactInfo.email}
                            onChange={(e) => setTemplateData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, email: e.target.value }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="hello@yourcompany.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <input
                            type="text"
                            value={templateData.contactInfo.phone}
                            onChange={(e) => setTemplateData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, phone: e.target.value }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Office Location</label>
                          <input
                            type="text"
                            value={templateData.contactInfo.office}
                            onChange={(e) => setTemplateData(prev => ({
                              ...prev,
                              contactInfo: { ...prev.contactInfo, office: e.target.value }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="San Francisco, CA"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Form Placeholders</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Name Placeholder</label>
                          <input
                            type="text"
                            value={(templateData.contactFormPlaceholders || {}).name || ''}
                            onChange={(e) => setTemplateData(prev => ({
                              ...prev,
                              contactFormPlaceholders: { ...(prev.contactFormPlaceholders || {}), name: e.target.value }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Your name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Email Placeholder</label>
                          <input
                            type="text"
                            value={(templateData.contactFormPlaceholders || {}).email || ''}
                            onChange={(e) => setTemplateData(prev => ({
                              ...prev,
                              contactFormPlaceholders: { ...(prev.contactFormPlaceholders || {}), email: e.target.value }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., your@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Company Placeholder</label>
                          <input
                            type="text"
                            value={(templateData.contactFormPlaceholders || {}).company || ''}
                            onChange={(e) => setTemplateData(prev => ({
                              ...prev,
                              contactFormPlaceholders: { ...(prev.contactFormPlaceholders || {}), company: e.target.value }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Your company"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Message Placeholder</label>
                          <input
                            type="text"
                            value={(templateData.contactFormPlaceholders || {}).message || ''}
                            onChange={(e) => setTemplateData(prev => ({
                              ...prev,
                              contactFormPlaceholders: { ...(prev.contactFormPlaceholders || {}), message: e.target.value }
                            }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Tell us about your project..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Content Editor */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                    Footer Content
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <button
                      onClick={() => setTemplateData(prev => ({ ...prev, showFooter: !prev.showFooter }))}
                      className={`px-3 py-1 text-xs rounded ${templateData.showFooter ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}
                    >
                      {templateData.showFooter ? 'Hide entire footer' : 'Show footer'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Footer Description</label>
                      <textarea
                        value={templateData.footerDescription}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, footerDescription: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Enter footer description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Links (comma-separated)</label>
                      <input
                        type="text"
                        value={(templateData.footerProductLinks || []).join(', ')}
                        onChange={(e) => setTemplateData(prev => ({
                          ...prev,
                          footerProductLinks: e.target.value.split(',').map(link => link.trim()).filter(link => link)
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Features, Pricing, Templates, API"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Links (comma-separated)</label>
                      <input
                        type="text"
                        value={(templateData.footerCompanyLinks || []).join(', ')}
                        onChange={(e) => setTemplateData(prev => ({
                          ...prev,
                          footerCompanyLinks: e.target.value.split(',').map(link => link.trim()).filter(link => link)
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="About, Blog, Careers, Contact"
                      />
                    </div>
                  </div>
                </div>

                {/* Trust Indicators Editor */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                    Trust Indicators
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trust Indicator 1</label>
                      <input
                        type="text"
                        value={templateData.trustIndicator1}
                        onChange={(e) => setTemplateData(prev => ({ 
                          ...prev, 
                          trustIndicator1: e.target.value
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Join 10,000+ creators"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trust Indicator 2</label>
                      <input
                        type="text"
                        value={templateData.trustIndicator2}
                        onChange={(e) => setTemplateData(prev => ({ 
                          ...prev, 
                          trustIndicator2: e.target.value
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 4.9/5 rating"
                      />
                    </div>
                  </div>
                </div>

                {/* Vercel Deployment Section */}
                <VercelDeploymentManager 
                  projectId={currentProject?.id}
                  templateData={templateData}
                />

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Live Preview */}
      <div className="w-3/4 bg-white flex flex-col">
        {/* Preview Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Real-time updates</span>
              </div>
              {currentProject?.id ? (
                <>
                  {/* Add custom domain button (left of View button) */}
                  <button
                    type="button"
                    onClick={() => setShowDomainModal(true)}
                    className="px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
                  >
                    Add custom domain name
                  </button>

                  {/* Decide link target based on domain status */}
                  <a
                    href={domainStatus?.status === 'active' && domainStatus?.domain
                      ? `https://${domainStatus.domain}`
                      : `/${(currentProject?.user_id || 1)}-${currentProject.id}`}
                    className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
                  >
                    <span>View Live Website 🌐</span>
                  </a>
                </>
              ) : null}
            </div>
          </div>
        </div>
        
                 <div className="flex-1 overflow-y-auto bg-gray-100">
           {/* CSS Transform-based Mobile/Tablet Preview */}
           {previewMode === 'phone' || previewMode === 'tablet' ? (
             <div className="flex justify-center items-start min-h-full">
                <div className="mobile-viewport-simulator">
                <ExceptionalTemplate 
                  businessName={templateData.businessName || ''}
                  seoTitle={templateData.seoTitle || null}
                  businessLogoUrl={templateData.businessLogoUrl || null}
                  tagline={templateData.tagline || ''}
                  isLiveWebsite={false}
                  heroDescription={templateData.heroDescription || ''}
                  ctaButtonText={templateData.ctaButtonText || ''}
                  sectionType={templateData.sectionType || 'features'}
                  sectionTitle={templateData.sectionTitle || ''}
                  sectionSubtitle={templateData.sectionSubtitle || ''}
                  features={templateData.features || []}
                  aboutContent={templateData.aboutContent || ''}
                  pricing={templateData.pricing || []}
                  contactInfo={templateData.contactInfo || {}}
                  trustIndicator1={templateData.trustIndicator1 || ''}
                  trustIndicator2={FIXED_RATING_TEXT}
                  heroBadge={templateData.heroBadge || ''}
                  aboutSectionTitle={templateData.aboutSectionTitle || ''}
                  aboutSectionSubtitle={templateData.aboutSectionSubtitle || ''}
                  aboutBenefits={templateData.aboutBenefits || []}
                  pricingSectionTitle={templateData.pricingSectionTitle || ''}
                  pricingSectionSubtitle={templateData.pricingSectionSubtitle || ''}
                  contactSectionTitle={templateData.contactSectionTitle || ''}
                  contactSectionSubtitle={templateData.contactSectionSubtitle || ''}
                  contactFormPlaceholders={templateData.contactFormPlaceholders || {}}
                  footerDescription={templateData.footerDescription || ''}
                  footerProductLinks={templateData.footerProductLinks || []}
                  footerCompanyLinks={templateData.footerCompanyLinks || []}
                   landingPagesCreated={templateData.landingPagesCreated || ''}
                  heroBackgroundImage={templateData.heroBackgroundImage || null}
                   aboutBackgroundImage={templateData.aboutBackgroundImage || null}
                   showLeadPhoneField={templateData.showLeadPhoneField}
                   projectId={currentProject?.id || null}
                   showHeroSection={templateData.showHeroSection}
                   showHeroBadge={templateData.showHeroBadge}
                   showHeroCTA={templateData.showHeroCTA}
                   showHeroSocialProof={templateData.showHeroSocialProof}
                   showDynamicSection={templateData.showDynamicSection}
                   showSectionTitle={templateData.showSectionTitle}
                   showSectionSubtitle={templateData.showSectionSubtitle}
                   showAboutSection={templateData.showAboutSection}
                   showAboutTitle={templateData.showAboutTitle}
                   showAboutSubtitle={templateData.showAboutSubtitle}
                   showAboutBenefits={templateData.showAboutBenefits}
                   showPricingSection={templateData.showPricingSection}
                   showPricingTitle={templateData.showPricingTitle}
                   showPricingSubtitle={templateData.showPricingSubtitle}
                   showContactSection={templateData.showContactSection}
                   showContactTitle={templateData.showContactTitle}
                   showContactSubtitle={templateData.showContactSubtitle}
                   showContactInfoList={templateData.showContactInfoList}
                   showContactForm={templateData.showContactForm}
                   showFooter={templateData.showFooter}
                />
              </div>
            </div>
          ) : (
            <div className="max-w-full">
              <ExceptionalTemplate 
                businessName={templateData.businessName || ''}
                seoTitle={templateData.seoTitle || null}
                businessLogoUrl={templateData.businessLogoUrl || null}
                tagline={templateData.tagline || ''}
                isLiveWebsite={false}
                heroDescription={templateData.heroDescription || ''}
                ctaButtonText={templateData.ctaButtonText || ''}
                sectionType={templateData.sectionType || 'features'}
                sectionTitle={templateData.sectionTitle || ''}
                sectionSubtitle={templateData.sectionSubtitle || ''}
                features={templateData.features || []}
                aboutContent={templateData.aboutContent || ''}
                pricing={templateData.pricing || []}
                contactInfo={templateData.contactInfo || {}}
                trustIndicator1={templateData.trustIndicator1 || ''}
                trustIndicator2={FIXED_RATING_TEXT}
                heroBadge={templateData.heroBadge || ''}
                aboutSectionTitle={templateData.aboutSectionTitle || ''}
                aboutSectionSubtitle={templateData.aboutSectionSubtitle || ''}
                aboutBenefits={templateData.aboutBenefits || []}
                pricingSectionTitle={templateData.pricingSectionTitle || ''}
                pricingSectionSubtitle={templateData.pricingSectionSubtitle || ''}
                contactSectionTitle={templateData.contactSectionTitle || ''}
                contactSectionSubtitle={templateData.contactSectionSubtitle || ''}
                contactFormPlaceholders={templateData.contactFormPlaceholders || {}}
                footerDescription={templateData.footerDescription || ''}
                footerProductLinks={templateData.footerProductLinks || []}
                footerCompanyLinks={templateData.footerCompanyLinks || []}
                landingPagesCreated={templateData.landingPagesCreated || ''}
                heroBackgroundImage={templateData.heroBackgroundImage || null}
                aboutBackgroundImage={templateData.aboutBackgroundImage || null}
                showLeadPhoneField={templateData.showLeadPhoneField}
                projectId={currentProject?.id || null}
                showHeroSection={templateData.showHeroSection}
                showHeroBadge={templateData.showHeroBadge}
                showHeroCTA={templateData.showHeroCTA}
                showHeroSocialProof={templateData.showHeroSocialProof}
                showDynamicSection={templateData.showDynamicSection}
                showSectionTitle={templateData.showSectionTitle}
                showSectionSubtitle={templateData.showSectionSubtitle}
                showAboutSection={templateData.showAboutSection}
                showAboutTitle={templateData.showAboutTitle}
                showAboutSubtitle={templateData.showAboutSubtitle}
                showAboutBenefits={templateData.showAboutBenefits}
                showPricingSection={templateData.showPricingSection}
                showPricingTitle={templateData.showPricingTitle}
                showPricingSubtitle={templateData.showPricingSubtitle}
                showContactSection={templateData.showContactSection}
                showContactTitle={templateData.showContactTitle}
                showContactSubtitle={templateData.showContactSubtitle}
                showContactInfoList={templateData.showContactInfoList}
                showContactForm={templateData.showContactForm}
                showFooter={templateData.showFooter}
              />
            </div>
          )}
        </div>
      </div>

      {/* Custom Domain Modal */}
      {showDomainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Connect a custom domain</h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your domain</label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2 mb-3"
              placeholder="e.g., www.userdomain.com"
              value={customDomainInput}
              onChange={(e) => setCustomDomainInput(e.target.value)}
            />
            <div className="text-sm text-gray-600 mb-3">
              Add this DNS record at your DNS provider:
              <div className="mt-2 p-3 bg-gray-50 rounded border">
                <div><strong>Type:</strong> CNAME</div>
                <div><strong>Name/Host:</strong> www</div>
                <div><strong>Target/Value:</strong> api.jetsy.dev</div>
                <div><strong>TTL:</strong> Auto</div>
                <div className="mt-2">Remove any A/AAAA/MX/TXT records that exist for the same label (www).</div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowDomainModal(false)} className="px-4 py-2 rounded border">Cancel</button>
              <button onClick={submitCustomDomain} disabled={isSubmittingDomain || !customDomainInput} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60">
                {isSubmittingDomain ? 'Submitting…' : 'Connect domain'}
              </button>
            </div>
            {domainStatus?.status === 'pending' && domainStatus?.domain && (
              <div className="mt-4 text-sm text-blue-700">
                Status: pending verification for {domainStatus.domain}. We will auto-detect when it becomes active.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default TemplateBasedChat; 