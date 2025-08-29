import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import ProjectSelector from './ProjectSelector';
import ExceptionalTemplate from './ExceptionalTemplate';
import DeploymentButton from './DeploymentButton';
import { getVercelApiBaseUrl } from '../config/environment';
import { useAuth } from './auth/AuthProvider';
import VisibilityToggle from './VisibilityToggle';
import PricingModal from './PricingModal';
import useBillingPlan from '../utils/useBillingPlan';

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
  businessName: 'Your Amazing Business',
  seoTitle: 'Transform your idea into reality',
  businessLogoUrl: null,
  tagline: 'Idea into Business in 24 hours',
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
      showPeriod: true,
      description: "For growing businesses and creators",
      features: ["Unlimited landing pages", "Premium templates", "Priority support", "Advanced analytics", "Custom domains", "A/B testing"],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      showPeriod: true,
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

const TemplateBasedChat = forwardRef(({ onBackToHome, onSaveChanges, previewMode = 'desktop', initialProjectId, onNavigateToProfile, onNavigateToAdCreatives, onNavigateToDataAnalytics, onNavigateToLaunch, billingSuccess, billingSuccessPlan, onBillingSuccessClose }, ref) => {
  const { session, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [showProjectPanel, setShowProjectPanel] = useState(false);
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [templateData, setTemplateData] = useState(DEFAULT_TEMPLATE_DATA);
  const [isRegeneratingBusinessName, setIsRegeneratingBusinessName] = useState(false);
  const skipAutoSaveRef = useRef(false);
  const [isRegeneratingLogo, setIsRegeneratingLogo] = useState(false);
  const [isRegeneratingHeroBg, setIsRegeneratingHeroBg] = useState(false);
  const [isRegeneratingAboutBg, setIsRegeneratingAboutBg] = useState(false);
  const isInitialLoadRef = useRef(true);
  // Mobile responsiveness: toggle Chat/Preview panes on small screens
  const [mobileView, setMobileView] = useState('chat');
  const [isMobile, setIsMobile] = useState(false);
  const [showWorkflowPanel, setShowWorkflowPanel] = useState(false);
  const [showPublishPanel, setShowPublishPanel] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeOutOfCredits, setUpgradeOutOfCredits] = useState(false);
  const [isWebsiteGenerated, setIsWebsiteGenerated] = useState(false);
  const [showBillingSuccessAlert, setShowBillingSuccessAlert] = useState(false);

  // Redirect unauthenticated users once auth has finished loading
  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      try { window.location.href = '/'; } catch (_) {}
    }
  }, [authLoading, session]);



  // Effect to detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setMobileView('chat'); // default to Chat on mobile
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  // Prefill chat input with idea saved from landing page after auth
  useEffect(() => {
    if (authLoading) return;
    if (!session) return;
    try {
      const savedIdea = localStorage.getItem('jetsy_prefill_idea');
      if (savedIdea && !inputMessage) {
        setInputMessage(savedIdea);
        localStorage.removeItem('jetsy_prefill_idea');
      }
    } catch (_) {}
  }, [authLoading, session, inputMessage]);



  // Effect to dispatch navbar visibility event
  useEffect(() => {
    if (isMobile) {
      const shouldHideNavbar = mobileView === 'preview';
      window.dispatchEvent(new CustomEvent('mobile-navbar-visibility', { detail: { hide: shouldHideNavbar } }));
    } else {
      // Ensure navbar is visible on desktop
      window.dispatchEvent(new CustomEvent('mobile-navbar-visibility', { detail: { hide: false } }));
    }
  }, [mobileView, isMobile]);

  // Screenshot capture is now handled automatically when someone visits the project URL
  // No need to trigger it manually from the chat page

  // Listen for project panel toggle from Navbar
  useEffect(() => {
    const handleToggleProjectPanel = () => {
      setShowProjectPanel((v) => !v);
    };

    window.addEventListener('toggle-project-panel', handleToggleProjectPanel);
    return () => window.removeEventListener('toggle-project-panel', handleToggleProjectPanel);
  }, []);



  // Listen for workflow panel toggle from Navbar
  useEffect(() => {
    const handleToggleWorkflowPanel = () => {
      setShowWorkflowPanel((v) => !v);
    };

    window.addEventListener('toggle-workflow-panel', handleToggleWorkflowPanel);
    return () => window.removeEventListener('toggle-workflow-panel', handleToggleWorkflowPanel);
  }, []);

  // Handle billing success from Stripe checkout
  useEffect(() => {
    if (billingSuccess && billingSuccessPlan) {
      setShowBillingSuccessAlert(true);
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setShowBillingSuccessAlert(false);
        if (onBillingSuccessClose) {
          onBillingSuccessClose();
        }
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [billingSuccess, billingSuccessPlan, onBillingSuccessClose]);

  // Check if website has been generated by comparing templateData with default values
  useEffect(() => {
    const hasBeenCustomized = 
      templateData.businessName !== DEFAULT_TEMPLATE_DATA.businessName ||
      templateData.tagline !== DEFAULT_TEMPLATE_DATA.tagline ||
      templateData.heroDescription !== DEFAULT_TEMPLATE_DATA.heroDescription ||
      templateData.businessLogoUrl !== null ||
      templateData.heroBackgroundImage !== null ||
      templateData.aboutBackgroundImage !== null ||
      (templateData.features && templateData.features.length > 0 && 
       JSON.stringify(templateData.features) !== JSON.stringify(DEFAULT_TEMPLATE_DATA.features)) ||
      (templateData.aboutContent && templateData.aboutContent !== DEFAULT_TEMPLATE_DATA.aboutContent) ||
      (templateData.pricing && templateData.pricing.length > 0 && 
       JSON.stringify(templateData.pricing) !== JSON.stringify(DEFAULT_TEMPLATE_DATA.pricing));

    setIsWebsiteGenerated(hasBeenCustomized);
  }, [templateData]);

  // Handle mobile viewport height for full-screen loading animation
  useEffect(() => {
    const setFullHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setFullHeight();
    window.addEventListener('resize', setFullHeight);
    window.addEventListener('orientationchange', setFullHeight);
    
    return () => {
      window.removeEventListener('resize', setFullHeight);
      window.removeEventListener('orientationchange', setFullHeight);
    };
  }, []);

  // Add custom CSS for mobile full-height loading animation and slow bounce
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .magic-loading-container {
        min-height: calc(var(--vh, 1vh) * 100) !important;
        height: 100% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      @media (max-width: 768px) {
        .magic-loading-container {
          min-height: calc(var(--vh, 1vh) * 100) !important;
          height: 100vh !important;
        }
      }
      @keyframes bounce-slow {
        0%, 20%, 53%, 80%, 100% {
          transform: translate3d(0, 0, 0);
        }
        40%, 43% {
          transform: translate3d(0, -30px, 0);
        }
        70% {
          transform: translate3d(0, -15px, 0);
        }
        90% {
          transform: translate3d(0, -4px, 0);
        }
      }
      .animate-bounce-slow {
        animation: bounce-slow 3s infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Close workflow panel when clicking outside on mobile
  useEffect(() => {
    if (!showWorkflowPanel || !isMobile) return;
    
    const handleClickOutside = (event) => {
      if (showWorkflowPanel && !event.target.closest('.workflow-panel-container')) {
        setShowWorkflowPanel(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showWorkflowPanel, isMobile]);

  // Close publish panel when clicking outside on mobile
  useEffect(() => {
    if (!showPublishPanel || !isMobile) return;
    const handleClickOutside = (event) => {
      if (showPublishPanel && !event.target.closest('.publish-panel-container')) {
        setShowPublishPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPublishPanel, isMobile]);

  // Determine if project has already been published (successful deployment)
  useEffect(() => {
    const loadPublishedState = async () => {
      try {
        if (!showPublishPanel || !currentProject?.id) return;
        const headers = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        const res = await fetch(`${getVercelApiBaseUrl()}/api/vercel/status/${currentProject.id}`, { headers });
        const json = await res.json();
        if (json?.success && json.deployment && json.deployment.status === 'READY') {
          setIsPublished(true);
        } else {
          setIsPublished(false);
        }
      } catch (_) {
        // keep prior state on error
      }
    };
    loadPublishedState();
  }, [showPublishPanel, currentProject?.id]);

  // Load user credits when auth is ready
  useEffect(() => {
    const loadUserCredits = async () => {
      if (authLoading || !session?.access_token) return;
      
      setCreditsLoading(true);
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        const response = await fetch(`${getApiBaseUrl()}/api/user-credits`, {
          headers
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.credits !== undefined) {
            setUserCredits(data.credits);
          }
        }
      } catch (error) {
        console.error('Error loading user credits:', error);
        // Keep default value of 0 on error
      } finally {
        setCreditsLoading(false);
      }
    };
    
    loadUserCredits();
  }, [authLoading, session?.access_token]);

  // Function to refresh user credits (can be called after credit-consuming operations)
  const refreshUserCredits = async () => {
    if (!session?.access_token) return;
    
    setCreditsLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(`${getApiBaseUrl()}/api/user-credits`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.credits !== undefined) {
          setUserCredits(data.credits);
        }
      }
    } catch (error) {
      console.error('Error refreshing user credits:', error);
    } finally {
      setCreditsLoading(false);
    }
  };

  // Progress tracking state
  const [aiProgress, setAiProgress] = useState({
    isActive: false,
    currentStep: '',
    steps: [],
    completedSteps: [],
    currentStepIndex: 0,
    startTime: null,
    estimatedTimePerStep: 0
  });

  // Progress tracking functions
  const startAiProgress = (steps) => {
    const estimatedTimePerStep = 4000; // 4 seconds per step on average for much longer, realistic timing
    setAiProgress({
      isActive: true,
      currentStep: steps[0] || '',
      steps: steps,
      completedSteps: [],
      currentStepIndex: 0,
      startTime: Date.now(),
      estimatedTimePerStep
    });
  };

  const updateAiProgress = (stepIndex, stepName, isCompleted = false) => {
    setAiProgress(prev => {
      const newCompletedSteps = [...prev.completedSteps];
      if (isCompleted && stepIndex < prev.steps.length) {
        newCompletedSteps[stepIndex] = prev.steps[stepIndex];
      }
      
      return {
        ...prev,
        currentStep: stepName,
        currentStepIndex: stepIndex,
        completedSteps: newCompletedSteps
      };
    });
  };

  const completeAiProgress = () => {
    setAiProgress(prev => ({
      ...prev,
      isActive: false,
      currentStep: 'Complete!',
      completedSteps: [...prev.steps]
    }));
    
    // Switch to Preview mode on mobile after AI generation completes
    if (isMobile) {
      setTimeout(() => {
        setMobileView('preview');
      }, 1000); // Small delay to show completion state
    }
    
    // Clear progress after a delay
    setTimeout(() => {
      setAiProgress({
        isActive: false,
        currentStep: '',
        steps: [],
        completedSteps: [],
        currentStepIndex: 0,
        startTime: null,
        estimatedTimePerStep: 0
      });
    }, 3000);
  };

  // Calculate estimated time remaining
  const getEstimatedTimeRemaining = () => {
    if (!aiProgress.isActive || !aiProgress.startTime) return 0;
    
    const elapsed = Date.now() - aiProgress.startTime;
    const totalEstimated = aiProgress.steps.length * aiProgress.estimatedTimePerStep;
    const remaining = Math.max(0, totalEstimated - elapsed);
    
    return Math.ceil(remaining / 1000); // Return seconds
  };

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
        const headers = { 'Content-Type': 'application/json' };
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        const response = await fetch(`${getApiBaseUrl()}/api/projects/${currentProject.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            template_data: templateData,
            // Ensure project_name stays in sync with businessName on manual save
            project_name: templateData?.businessName || currentProject?.project_name
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
        alert('Failed to save changes. Please try again.');
      }
    }
  }));

  // Load existing project when auth is ready (prevents unauthenticated calls)
  useEffect(() => {
    if (authLoading) return; // wait for auth to resolve
    // When session changes from null->value or route param changes, (re)load
    loadOrRestoreProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, session?.access_token, initialProjectId]);

  // Dispatch project name update event when currentProject changes
  useEffect(() => {
    if (currentProject?.project_name) {
      // Cache under both global and per-project keys
      try {
        localStorage.setItem('jetsy_current_project_name', currentProject.project_name);
        if (currentProject?.id) {
          localStorage.setItem(`jetsy_project_name_${currentProject.id}`, currentProject.project_name);
        }
      } catch (_) {}
      window.dispatchEvent(new CustomEvent('project-name-update', { 
        detail: { projectName: currentProject.project_name } 
      }));
    }
  }, [currentProject?.project_name, currentProject?.id]);

  // Dispatch project name update event when template data business name changes
  useEffect(() => {
    if (templateData?.businessName && templateData.businessName !== currentProject?.project_name && isEditorMode && currentProject?.id) {
      // Only update if we're not in the process of creating a new project
      if (currentProject.project_name !== 'New business' || templateData.businessName !== 'Your Amazing Business') {
        // Update currentProject state with new business name
        setCurrentProject(prev => ({
          ...prev,
          project_name: templateData.businessName
        }));
        
        // Dispatch project name update event
        try {
          localStorage.setItem('jetsy_current_project_name', templateData.businessName);
          if (currentProject?.id) {
            localStorage.setItem(`jetsy_project_name_${currentProject.id}`, templateData.businessName);
          }
        } catch (_) {}
        window.dispatchEvent(new CustomEvent('project-name-update', { 
          detail: { projectName: templateData.businessName } 
        }));

        // Update project name in database as well
        const updateProjectName = async () => {
          try {
            const headers = { 'Content-Type': 'application/json' };
            if (session?.access_token) {
              headers['Authorization'] = `Bearer ${session.access_token}`;
            }
            
            await fetch(`${getApiBaseUrl()}/api/projects/${currentProject.id}`, {
              method: 'PUT',
              headers,
              body: JSON.stringify({
                project_name: templateData.businessName
              })
            });
          } catch (error) {
            console.error('Error updating project name in database:', error);
          }
        };

        // Debounce the database update to avoid excessive API calls
        const timeoutId = setTimeout(updateProjectName, 300);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [templateData?.businessName, currentProject?.project_name, isEditorMode, currentProject?.id, session]);

  // When we have a project, load any existing custom domain mapping


    // Auto-save template data when it changes
  useEffect(() => {
    if (currentProject?.id && isEditorMode) {
      if (skipAutoSaveRef.current) {
        // Skip this auto-save cycle (used after AI regeneration where user must click Save)
        skipAutoSaveRef.current = false;
        return;
      }
      
      // Skip auto-save on initial load to prevent unnecessary API calls
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        return;
      }
      
      // Only auto-save if we have meaningful changes and not just initial load
      if (!templateData || Object.keys(templateData).length === 0) {
        return;
      }
      
      // Prevent auto-save if templateData is the same as DEFAULT_TEMPLATE_DATA (no real changes)
      if (JSON.stringify(templateData) === JSON.stringify(DEFAULT_TEMPLATE_DATA)) {
        return;
      }
      
      console.log('🔄 Auto-save triggered for project:', currentProject.id, 'in', 10000, 'ms');
      
      const saveTemplateData = async () => {
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
          }
          
          const response = await fetch(`${getApiBaseUrl()}/api/projects/${currentProject.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              template_data: templateData,
              // Keep project_name synced during auto-save as well
              project_name: templateData?.businessName || currentProject?.project_name
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

      // Increased debounce time and added better conditions to prevent excessive API calls
      const timeoutId = setTimeout(() => {
        // Only save if we're still in editor mode and have a valid project
        if (currentProject?.id && isEditorMode && templateData) {
          saveTemplateData();
        }
      }, 10000); // Increased to 10 seconds for even better debouncing
      
      return () => clearTimeout(timeoutId);
    }
  }, [templateData, currentProject?.id, isEditorMode, session]);

  const handleRegenerateBusinessName = async () => {
    if (!currentProject?.id || isRegeneratingBusinessName) return;
    try {
      setIsRegeneratingBusinessName(true);
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const resp = await fetch(`${getApiBaseUrl()}/api/generate-business-name`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ projectId: currentProject.id, currentName: (templateData.businessName || '').trim() })
      });
      if (resp.status === 402) {
        setUpgradeOutOfCredits(true);
        setShowUpgradeModal(true);
        return;
      }
      if (!resp.ok) throw new Error('Failed to generate business name');
      const data = await resp.json();
      if (data.success && data.businessName) {
        // Suppress the next auto-save so user must click Save
        skipAutoSaveRef.current = true;
        setTemplateData(prev => ({ ...prev, businessName: data.businessName }));
        
        // Update project name in currentProject state and dispatch event
        if (currentProject?.id) {
          setCurrentProject(prev => ({
            ...prev,
            project_name: data.businessName
          }));
          
          // Dispatch project name update event
          window.dispatchEvent(new CustomEvent('project-name-update', { 
            detail: { projectName: data.businessName } 
          }));
        }
        
        // Refresh credits after successful business name generation
        refreshUserCredits();
      } else {
        throw new Error(data.error || 'No name returned');
      }
    } catch (e) {
      console.error('Regenerate business name failed:', e);
      alert('Failed to regenerate business name. Please try again.');
    } finally {
      setIsRegeneratingBusinessName(false);
    }
  };

  const handleRegenerateHeroBackground = async () => {
    if (!currentProject?.id || isRegeneratingHeroBg) return;
    try {
      setIsRegeneratingHeroBg(true);
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const resp = await fetch(`${getApiBaseUrl()}/api/regenerate-background`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          project_id: currentProject.id,
          target: 'hero_background'
        })
      });
      if (resp.status === 402) {
        setShowUpgradeModal(true);
        return;
      }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (!(data.success && data.images && data.images.length > 0)) {
        throw new Error('No images generated');
      }
      const url = data.images[0].url;
      // Suppress the next auto-save so user must click Save Changes
      skipAutoSaveRef.current = true;
      setTemplateData(prev => ({ ...prev, heroBackgroundImage: url }));
      try { refreshUserCredits(); } catch (_) {}
    } catch (e) {
      console.error('Hero background regeneration failed:', e);
      const msg = String(e?.message || e);
      if (msg.includes('402') || msg.toLowerCase().includes('insufficient')) {
        setUpgradeOutOfCredits(true);
        setShowUpgradeModal(true);
      } else {
        alert('Failed to regenerate hero background. Please try again.');
      }
    } finally {
      setIsRegeneratingHeroBg(false);
    }
  };

  // Local storage helpers and project name cache utilities
  const getStoredProjectId = () => {
    try {
      return localStorage.getItem('jetsy_current_project_id');
    } catch (_) {
      return null;
    }
  };

  const setStoredProjectId = (projectId) => {
    localStorage.setItem('jetsy_current_project_id', projectId);
  };

  const clearStoredProjectId = () => {
    try {
      localStorage.removeItem('jetsy_current_project_id');
      localStorage.removeItem('jetsy_current_project_name');
    } catch (_) {}
  };

  // Clear all cached project data to prevent state leakage
  const clearAllCachedProjectData = () => {
    try {
      // Clear current project data
      localStorage.removeItem('jetsy_current_project_id');
      localStorage.removeItem('jetsy_current_project_name');
      
      // Clear any other project-related cached data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('jetsy_project_name_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear any cached template data
      localStorage.removeItem('jetsy_prefill_idea');
    } catch (_) {}
  };

  // Force immediate project name update in UI
  const forceProjectNameUpdate = (projectName, projectId) => {
    // Update localStorage immediately
    try {
      localStorage.setItem('jetsy_current_project_name', projectName);
      if (projectId) {
        localStorage.setItem(`jetsy_project_name_${projectId}`, projectName);
      }
    } catch (_) {}
    
    // Dispatch event immediately
    window.dispatchEvent(new CustomEvent('project-name-update', { 
      detail: { projectName } 
    }));
    
    // Force a re-render by updating state
    setCachedProjectName(projectName, projectId);
  };

  // Cache project name in both global and per-project scoped keys for Navbar/UI hydration
  const setCachedProjectName = (name, projectId) => {
    try {
      if (typeof name === 'string' && name.length) {
        localStorage.setItem('jetsy_current_project_name', name);
        if (projectId) {
          localStorage.setItem(`jetsy_project_name_${projectId}`, name);
        }
      }
    } catch (_) {}
  };

  // Regenerate About background with 402 handling
  const handleRegenerateAboutBackground = async () => {
    if (!currentProject?.id || isRegeneratingAboutBg) return;
    try {
      setIsRegeneratingAboutBg(true);
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const resp = await fetch(`${getApiBaseUrl()}/api/regenerate-background`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          project_id: currentProject.id,
          target: 'about_background'
        })
      });
      if (resp.status === 402) {
        setShowUpgradeModal(true);
        return;
      }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (!(data.success && data.images && data.images.length > 0)) {
        throw new Error('No images generated');
      }
      const url = data.images[0].url;
      // Suppress the next auto-save so user must click Save Changes
      skipAutoSaveRef.current = true;
      setTemplateData(prev => ({ ...prev, aboutBackgroundImage: url }));
      try { refreshUserCredits(); } catch (_) {}
    } catch (e) {
      console.error('About background regeneration failed:', e);
      const msg = String(e?.message || e);
      if (msg.includes('402') || msg.toLowerCase().includes('insufficient')) {
        setUpgradeOutOfCredits(true);
        setShowUpgradeModal(true);
      } else {
        alert('Failed to regenerate about background. Please try again.');
      }
    } finally {
      setIsRegeneratingAboutBg(false);
    }
  };

  // Regenerate Business Logo with 402 handling
  const handleRegenerateLogo = async () => {
    if (!currentProject?.id || isRegeneratingLogo) return;
    try {
      setIsRegeneratingLogo(true);
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const resp = await fetch(`${getApiBaseUrl()}/api/generate-image`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          project_id: currentProject.id,
          prompt: `Flat, minimal, modern logo mark for ${templateData.businessName || 'Your Business'}. Clean vector style, centered emblem or monogram, high contrast, no gradients, no text, no watermarks, no brand names.`,
          aspect_ratio: '1:1',
          number_of_images: 1
        })
      });
      if (resp.status === 402) {
        setShowUpgradeModal(true);
        return;
      }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (!(data.success && data.images && data.images.length > 0)) {
        throw new Error('No images generated');
      }
      const url = data.images[0].url;
      // Suppress the next auto-save so user must click Save Changes
      skipAutoSaveRef.current = true;
      setTemplateData(prev => ({ ...prev, businessLogoUrl: url }));
      try { refreshUserCredits(); } catch (_) {}
    } catch (e) {
      console.error('Logo regeneration failed:', e);
      const msg = String(e?.message || e);
      if (msg.includes('402') || msg.toLowerCase().includes('insufficient')) {
        setUpgradeOutOfCredits(true);
        setShowUpgradeModal(true);
      } else {
        alert('Failed to regenerate logo. Please try again.');
      }
    } finally {
      setIsRegeneratingLogo(false);
    }
  };

  const loadOrRestoreProject = async () => {
    try {
      // Check if we have an initialProjectId from the route first
      const projectIdToLoad = initialProjectId || getStoredProjectId();
      
      if (projectIdToLoad) {
        const headers = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        const response = await fetch(`${getApiBaseUrl()}/api/projects/${projectIdToLoad}`, {
          headers
        });
        if (response.ok) {
          const result = await response.json();
          const project = result.project;
          setCurrentProject({
            id: project.id,
            user_id: project.user_id,
            project_name: project.project_name,
            files: JSON.parse(project.files),
            visibility: project.visibility
          });
          setCachedProjectName(project.project_name, project.id);
          
          // Dispatch project name update event
          window.dispatchEvent(new CustomEvent('project-name-update', { 
            detail: { projectName: project.project_name } 
          }));
          
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
              // Immediately notify navbar about workflow state
              try {
                window.dispatchEvent(new CustomEvent('chat:workflow-status', {
                  detail: {
                    projectId: project.id,
                    hasTemplateData: true,
                    adsExist: !!project.ads_data,
                    // We don't know deployment here; let Navbar fetch. Leave undefined.
                    websiteDeployed: undefined
                  }
                }));
              } catch (_) {}
            } catch (error) {
              console.error('❌ Error parsing template_data:', error);
              console.log('🔍 Raw template_data:', project.template_data);
            }
          } else {
            console.log('⚠️ No template_data found in project');
            // Reset to default template data and switch to chat mode
            setTemplateData(DEFAULT_TEMPLATE_DATA);
            setIsEditorMode(false);
            // Notify navbar so it can render stage states
            try {
              window.dispatchEvent(new CustomEvent('chat:workflow-status', {
                detail: {
                  projectId: project.id,
                  hasTemplateData: false,
                  adsExist: !!project.ads_data,
                  websiteDeployed: undefined
                }
              }));
            } catch (_) {}
          }
          
          // Update stored project ID if we loaded from initialProjectId
          if (initialProjectId) {
            setStoredProjectId(project.id);
          }
          
          await loadChatMessages(project.id);
          return;
        }
      }

      // Try to load existing projects
      const headers = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const projectsResponse = await fetch(`${getApiBaseUrl()}/api/projects`, {
        headers
      });
      if (projectsResponse.ok) {
        const result = await projectsResponse.json();
        if (result.projects && result.projects.length > 0) {
          const mostRecent = result.projects[0];
          setCurrentProject({
            id: mostRecent.id,
            user_id: mostRecent.user_id,
            project_name: mostRecent.project_name,
            files: JSON.parse(mostRecent.files),
            visibility: mostRecent.visibility
          });
          setCachedProjectName(mostRecent.project_name, mostRecent.id);
          
          // Dispatch project name update event
          window.dispatchEvent(new CustomEvent('project-name-update', { 
            detail: { projectName: mostRecent.project_name } 
          }));
          
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
              // Notify navbar immediately (fix for /chat auto-load flow)
              try {
                window.dispatchEvent(new CustomEvent('chat:workflow-status', {
                  detail: {
                    projectId: mostRecent.id,
                    hasTemplateData: true,
                    adsExist: !!mostRecent.ads_data,
                    websiteDeployed: undefined
                  }
                }));
              } catch (_) {}
            } catch (error) {
              console.error('❌ Error parsing template_data from mostRecent:', error);
              console.log('🔍 Raw template_data from mostRecent:', mostRecent.template_data);
            }
          } else {
            console.log('⚠️ No template_data found in mostRecent project');
            // Reset to default template data and switch to chat mode
            setTemplateData(DEFAULT_TEMPLATE_DATA);
            setIsEditorMode(false);
            try {
              window.dispatchEvent(new CustomEvent('chat:workflow-status', {
                detail: {
                  projectId: mostRecent.id,
                  hasTemplateData: false,
                  adsExist: !!mostRecent.ads_data,
                  websiteDeployed: undefined
                }
              }));
            } catch (_) {}
          }
          
          setStoredProjectId(mostRecent.id);
          await loadChatMessages(mostRecent.id);
          return;
        }
      }

      // No projects exist, create a new one with proper state reset
      await createDefaultProject();
    } catch (error) {
      console.error('Error loading/restoring project:', error);
      // On error, create a new project with proper state reset
      await createDefaultProject();
    }
  };

  const createDefaultProject = async () => {
    try {
      // Reset all state before creating new project
      setMessages([]);
      setInputMessage('');
      setIsLoading(false);
      setIsEditorMode(false);
      setTemplateData(DEFAULT_TEMPLATE_DATA);
      setAiProgress({
        isActive: false,
        currentStep: '',
        steps: [],
        completedSteps: [],
        currentStepIndex: 0,
        startTime: null,
        estimatedTimePerStep: 0
      });
      
      // Clear all cached project data to prevent state leakage
      clearAllCachedProjectData();
      
      const projectData = {
        project_name: "New business",
        user_id: 1,
        files: {
          "src/App.jsx": `import React from 'react';\nimport './index.css';\nfunction App() {\n  return (\n    <div className=\"min-h-screen bg-gray-50\">\n      <div className=\"container mx-auto px-4 py-8\">\n        <h1 className=\"text-4xl font-bold text-center text-gray-900 mb-8\">Welcome to Your Landing Page</h1>\n        <p className=\"text-center text-gray-600 mb-8\">This is a placeholder. Start chatting to customize your landing page!</p>\n      </div>\n    </div>\n  );\n}\nexport default App;`,
          "src/index.css": `@tailwind base;\n@tailwind components;\n@tailwind utilities;`
        }
        // Don't include template_data for new projects - let users chat first
      };

      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(`${getApiBaseUrl()}/api/projects`, {
        method: 'POST',
        headers,
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        const result = await response.json();
        const newProject = { id: result.project_id, ...projectData };
        
        // Force immediate project name update in UI with "New business"
        forceProjectNameUpdate("New business", result.project_id);
        
        // Set the new project with explicit "New business" name
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
      const headers = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(`${getApiBaseUrl()}/api/chat_messages?project_id=${projectId}`, {
        headers
      });
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

    // Start progress tracking for AI generation
    const progressSteps = [
      'Analyzing your business idea...',
      'Researching industry best practices...',
      'Designing landing page structure...',
      'Selecting optimal color scheme...',
      'Choosing typography and fonts...',
      'Creating responsive layout grid...',
      'Designing hero section layout...',
      'Planning content hierarchy...',
      'Structuring navigation menu...',
      'Designing feature sections...',
      'Creating pricing table layout...',
      'Designing contact form...',
      'Planning footer structure...',
      'Setting up responsive breakpoints...',
      'Configuring mobile navigation...',
      'Optimizing touch targets...',
      'Setting up grid systems...',
      'Configuring spacing scales...',
      'Setting up component library...',
      'Configuring animation system...',
      'Setting up CSS custom properties...',
      'Configuring dark mode support...',
      'Setting up accessibility features...',
      'Configuring performance optimizations...',
      'Setting up testing framework...',
      'Configuring build system...',
      'Setting up deployment pipeline...',
      'Finalizing design system...',
      'Generating hero background image...',
      'Creating business logo...',
      'Generating about section background...',
      'Optimizing for mobile devices...',
      'Implementing SEO best practices...',
      'Finalizing your landing page...'
    ];
    
    startAiProgress(progressSteps);

    // Start fake progress updates in parallel with real AI call
    const startFakeProgress = async () => {
      // Step 1: Analyzing business idea (longer wait)
      updateAiProgress(0, progressSteps[0]);
      await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 1000));

      // Step 2: Researching industry best practices (longer wait)
      updateAiProgress(1, progressSteps[1]);
      await new Promise(resolve => setTimeout(resolve, 6000 + Math.random() * 1000));

      // Step 3: Designing landing page structure (longer wait)
      updateAiProgress(2, progressSteps[2]);
      await new Promise(resolve => setTimeout(resolve, 7000 + Math.random() * 1000));

      // Step 4: Selecting optimal color scheme (longer wait)
      updateAiProgress(3, progressSteps[3]);
      await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 1000));

      // Step 5: Choosing typography and fonts (longer wait)
      updateAiProgress(4, progressSteps[4]);
      await new Promise(resolve => setTimeout(resolve, 6000 + Math.random() * 1000));

      // Step 6: Creating responsive layout grid (longer wait)
      updateAiProgress(5, progressSteps[5]);
      await new Promise(resolve => setTimeout(resolve, 7000 + Math.random() * 1000));

      // Step 7: Designing hero section layout (longer wait)
      updateAiProgress(6, progressSteps[6]);
      await new Promise(resolve => setTimeout(resolve, 6000 + Math.random() * 1000));

      // Step 8: Planning content hierarchy (longest wait - this is where the real work happens)
      updateAiProgress(7, progressSteps[7]);
      await new Promise(resolve => setTimeout(resolve, 12000 + Math.random() * 2000));

      // Continue with remaining steps if AI hasn't finished yet
      for (let i = 8; i < progressSteps.length; i++) {
        updateAiProgress(i, progressSteps[i]);
        await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 1000));
      }
    };

    // Start fake progress in background
    startFakeProgress();

    try {
      // Add user message to chat history
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      await fetch(`${getApiBaseUrl()}/api/chat_messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          project_id: currentProject.id,
          role: 'user',
          message: inputMessage,
          is_initial_message: messages.length === 0
        })
      });

      // Call AI to generate template content IMMEDIATELY (this is the fix!)
      const aiResponse = await fetch(`${getApiBaseUrl()}/api/template-generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          project_id: currentProject.id,
          user_message: inputMessage,
          current_template_data: templateData
        })
      });
      if (aiResponse.status === 402) {
        setUpgradeOutOfCredits(true);
        setShowUpgradeModal(true);
        // stop progress UI if any
        completeAiProgress();
        return;
      }
      if (aiResponse.ok) {
        const result = await aiResponse.json();
        
        // Complete progress immediately when AI finishes (this stops the fake progress)
        completeAiProgress();
        
        // Update template data with AI-generated content
        if (result.template_data) {
          setTemplateData(result.template_data);
          
                      // Save the AI-generated template data to database
            try {
              const saveResponse = await fetch(`${getApiBaseUrl()}/api/projects/${currentProject.id}`, {
                method: 'PUT',
                headers,
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

        // Update project name if AI suggests a better one
        if (result.suggested_project_name && result.suggested_project_name !== currentProject.project_name) {
          try {
            const updateNameResponse = await fetch(`${getApiBaseUrl()}/api/projects/${currentProject.id}`, {
              method: 'PUT',
              headers,
              body: JSON.stringify({
                project_name: result.suggested_project_name
              })
            });
            
            if (updateNameResponse.ok) {
              console.log('Project name updated successfully:', result.suggested_project_name);
              // Update the current project state with the new name
              setCurrentProject(prev => ({
                ...prev,
                project_name: result.suggested_project_name
              }));
              
              // Dispatch project name update event
              window.dispatchEvent(new CustomEvent('project-name-update', { 
                detail: { projectName: result.suggested_project_name } 
              }));
              
              // Add a notification message about the name update
              const nameUpdateMessage = {
                id: Date.now() + 2,
                role: 'assistant',
                message: `✨ I've updated your project name to "${result.suggested_project_name}" to better reflect your business idea!`,
                timestamp: new Date().toISOString()
              };
              setMessages(prev => [...prev, nameUpdateMessage]);
            } else {
              console.error('Failed to update project name');
            }
          } catch (error) {
            console.error('Error updating project name:', error);
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
        
        // Refresh credits after successful AI generation
        refreshUserCredits();
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Complete progress even on error
      completeAiProgress();
      
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
      // Ensure progress is cleared if it wasn't already
      if (aiProgress.isActive) {
        completeAiProgress();
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleProjectSelect = async (project) => {
    // Reset all state when switching projects to prevent leakage
    setMessages([]);
    setInputMessage('');
    setIsLoading(false);
    setIsEditorMode(false);
    setTemplateData(DEFAULT_TEMPLATE_DATA);
    setAiProgress({
      isActive: false,
      currentStep: '',
      steps: [],
      completedSteps: [],
      currentStepIndex: 0,
      startTime: null,
      estimatedTimePerStep: 0
    });
    
    // Clear all cached project data to prevent state leakage
    clearAllCachedProjectData();
    
    // Ensure proper project name (critical for new projects)
    const projectName = project.project_name || 'New business';
    
    // Force immediate project name update in UI
    forceProjectNameUpdate(projectName, project.id);
    
    // Set the new project with explicit project name
    setCurrentProject({
      id: project.id,
      user_id: project.user_id,
      project_name: projectName,
      files: typeof project.files === 'string' ? JSON.parse(project.files) : project.files,
      visibility: project.visibility
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

  // Update local state when visibility changes via toggle
  const handleVisibilityChange = (projectId, newVisibility) => {
    setCurrentProject((prev) => {
      if (!prev || prev.id !== projectId) return prev;
      return { ...prev, visibility: newVisibility };
    });
  };

  const handleAllProjectsDeleted = async () => {
    // Clear all state and cached data
    setCurrentProject(null);
    setMessages([]);
    clearAllCachedProjectData();
    
    // Force immediate UI update to clear project name
    forceProjectNameUpdate('', null);
    
    // Create a new default project
    await createDefaultProject();
  };



  const effectivePreviewMode = isMobile ? 'phone' : previewMode;
  const { plan } = useBillingPlan();

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 pb-24 lg:pb-0">
      {/* Inject mobile viewport styles */}
      <style dangerouslySetInnerHTML={{ __html: getMobileViewportStyles(effectivePreviewMode) }} />

      {/* Billing Success Alert */}
      {showBillingSuccessAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-md">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">
                Subscription activated!
              </h3>
              <p className="text-sm text-green-700 mt-1">
                {billingSuccessPlan ? `Your ${billingSuccessPlan} plan is now active.` : 'Your plan is now active.'}
              </p>
              <p className="text-xs text-green-600 mt-1">
                You can start using your new credits and features right away.
              </p>
            </div>
            <button
              onClick={() => {
                setShowBillingSuccessAlert(false);
                if (onBillingSuccessClose) {
                  onBillingSuccessClose();
                }
              }}
              className="flex-shrink-0 text-green-400 hover:text-green-600"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <PricingModal
          onPlanSelect={() => { /* no-op for now */ }}
          onClose={() => setShowUpgradeModal(false)}
          showUpgradeMessage={upgradeOutOfCredits}
          upgradeTitle="You're out of credits"
          upgradeDescription="Free plan includes 15 credits. Upgrade to a paid plan to get a higher monthly credit allowance and continue generating."
          currentPlanType={plan}
        />
      )}
      {/* Left Side - Chat/Editor Panel */}
      <div className={`${mobileView === 'chat' ? 'flex' : 'hidden'} lg:flex lg:w-1/4 bg-white border-r border-gray-200 flex-col`}>
        {/* Header */}
        {!isMobile && (
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
            <div className="flex items-center justify-between">
              {/* Left: Project Name (non-clickable text on desktop) */}
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                {/* Project Name as plain text (no dropdown on desktop) */}
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <span className="text-sm lg:text-base font-medium text-gray-900 truncate">
                    {currentProject?.project_name || 'Loading...'}
                  </span>
                </div>
              </div>
              
              {/* Right: Projects Button */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Visibility Toggle - to the left of Projects button on desktop */}
                {currentProject && (
                  <VisibilityToggle 
                    project={currentProject} 
                    onVisibilityChange={handleVisibilityChange}
                    className="mr-1"
                  />
                )}
                <button
                  onClick={() => {
                    console.log('Toggling project panel, current state:', showProjectPanel);
                    setShowProjectPanel(!showProjectPanel);
                  }}
                  className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Projects
                </button>
              </div>
            </div>
          </div>
        )}

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
                <div className={`h-[calc(100vh-400px)] overflow-y-auto p-6 space-y-4 ${isMobile ? 'pt-4' : ''}`}>
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
                        <span className="text-sm">
                          {aiProgress.isActive ? aiProgress.currentStep : 'AI is thinking...'}
                        </span>
                      </div>
                      
                      {/* Show progress steps in chat mode for initial generation */}
                      {aiProgress.isActive && messages.length === 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="space-y-2">
                            {aiProgress.steps.map((step, index) => {
                              const isCompleted = aiProgress.completedSteps.includes(step);
                              const isCurrent = aiProgress.currentStep === step;
                              
                              return (
                                <div key={index} className={`flex items-center space-x-2 text-xs ${
                                  isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600 font-medium' : 'text-gray-500'
                                }`}>
                                  <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                                    isCompleted 
                                      ? 'bg-green-500 text-white' 
                                      : isCurrent 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-300'
                                  }`}>
                                    {isCompleted ? '✓' : isCurrent ? '⟳' : '•'}
                                  </div>
                                  <span>{step}</span>
                                  {isCurrent && (
                                    <span className="ml-auto text-blue-500 animate-pulse">⟳</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-3 pt-2 border-t border-gray-200 text-center">
                            <div className="text-xs text-gray-500">
                              Estimated time: ~{getEstimatedTimeRemaining()} seconds
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4">
                {/* Progress indicator for AI generation in chat mode */}
                {aiProgress.isActive && messages.length === 0 && (
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-sm text-blue-700">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="font-medium">Current step:</span>
                      <span>{aiProgress.currentStep}</span>
                    </div>
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${(aiProgress.completedSteps.length / aiProgress.steps.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-blue-600">
                      <span>{aiProgress.completedSteps.length} of {aiProgress.steps.length} steps</span>
                      <span>~{getEstimatedTimeRemaining()}s remaining</span>
                    </div>
                  </div>
                )}
                
                <div className="relative bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={aiProgress.isActive ? "AI is generating your website... Please wait." : "Describe your startup idea or business..."}
                        className="w-full px-4 py-3 bg-transparent border-none outline-none resize-none text-text placeholder-mutedText text-lg leading-relaxed min-h-[80px] md:min-h-[60px] max-h-[400px] md:max-h-[200px]"
                        rows={4}
                        disabled={isLoading || aiProgress.isActive}
                        style={{ fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>
                  
                  {/* Submit Button - Positioned in bottom right corner */}
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim() || aiProgress.isActive}
                    className={`absolute bottom-6 right-6 p-3 rounded-full transition-colors duration-200 flex-shrink-0 ${
                      inputMessage.trim() && !isLoading && !aiProgress.isActive
                        ? 'bg-black hover:bg-gray-800' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    title="Submit message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 -960 960 960" className={`shrink-0 h-6 w-6 ${inputMessage.trim() && !isLoading && !aiProgress.isActive ? 'text-white' : 'text-gray-500'}`} fill="currentColor">
                      <path d="M442.39-616.87 309.78-487.26q-11.82 11.83-27.78 11.33t-27.78-12.33q-11.83-11.83-11.83-27.78 0-15.96 11.83-27.79l198.43-199q11.83-11.82 28.35-11.82t28.35 11.82l198.43 199q11.83 11.83 11.83 27.79 0 15.95-11.83 27.78-11.82 11.83-27.78 11.83t-27.78-11.83L521.61-618.87v348.83q0 16.95-11.33 28.28-11.32 11.33-28.28 11.33t-28.28-11.33q-11.33-11.33-11.33-28.28z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Editor Mode
            <div className={`flex-1 p-6 overflow-y-auto ${isMobile ? 'pt-4' : ''}`}>
              <div className="space-y-6">
                <div>
                  {initialUserIdea ? (
                    <div className="mb-4">
                      <div className="flex justify-end">
                        <div className="relative max-w-xs lg:max-w-md">
                          {/* Chat bubble with tail */}
                          <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-br-sm">
                            <p className="text-sm whitespace-pre-wrap">{initialUserIdea.message}</p>
                            {initialUserIdea.timestamp ? (
                              <p className="text-xs opacity-70 mt-1 text-right">
                                {new Date(initialUserIdea.timestamp).toLocaleString()}
                              </p>
                            ) : null}
                          </div>
                          {/* Chat bubble tail pointing to the right */}
                          <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[8px] border-l-blue-600 border-t-[8px] border-t-transparent"></div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  
                  {/* AI Generation Progress Display */}
                  {aiProgress.isActive && (
                    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                        <h3 className="text-lg font-semibold text-blue-900">AI is building your website...</h3>
                      </div>
                      
                      <div className="space-y-3">
                        {aiProgress.steps.map((step, index) => {
                          const isCompleted = aiProgress.completedSteps.includes(step);
                          const isCurrent = aiProgress.currentStep === step;
                          const isUpcoming = index > aiProgress.currentStepIndex;
                          
                          return (
                            <div key={index} className={`flex items-center space-x-3 transition-all duration-300 ${
                              isCompleted ? 'opacity-100' : isCurrent ? 'opacity-100' : 'opacity-60'
                            }`}>
                              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                                isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : isCurrent 
                                    ? 'bg-blue-500 text-white animate-pulse' 
                                    : 'bg-gray-300 text-gray-600'
                              }`}>
                                {isCompleted ? '✓' : isCurrent ? '⟳' : (index + 1)}
                              </div>
                              <span className={`text-sm ${
                                isCompleted 
                                  ? 'text-green-700 font-medium' 
                                  : isCurrent 
                                    ? 'text-blue-700 font-semibold' 
                                    : 'text-gray-600'
                              }`}>
                                {step}
                              </span>
                              {isCurrent && (
                                <div className="ml-auto">
                                  <div className="animate-pulse bg-blue-400 h-2 w-2 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <div className="flex items-center justify-between text-sm text-blue-700">
                          <span>Progress: {aiProgress.completedSteps.length} of {aiProgress.steps.length} steps</span>
                          <div className="flex items-center space-x-3">
                            <span className="font-medium">
                              {Math.round((aiProgress.completedSteps.length / aiProgress.steps.length) * 100)}%
                            </span>
                            {aiProgress.isActive && (
                              <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                                ~{getEstimatedTimeRemaining()}s remaining
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ 
                              width: `${(aiProgress.completedSteps.length / aiProgress.steps.length) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
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
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={handleRegenerateBusinessName}
                              disabled={isRegeneratingBusinessName}
                              className={`px-3 py-1.5 text-xs rounded-md bg-black text-white hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed`}
                              title="Regenerate business name with AI (not saved)"
                            >
                              {isRegeneratingBusinessName ? (
                                <span className="flex items-center space-x-2">
                                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
                                  <span>Regenerating ...</span>
                                </span>
                              ) : '✨ Regenerate Business Name with AI'}
                            </button>
                          </div>
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
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setTemplateData(prev => ({ ...prev, businessLogoUrl: null }))}
                            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                          >Remove</button>
                        </div>
                      </div>
                    ) : null}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleRegenerateLogo}
                        disabled={isRegeneratingLogo}
                        className={`px-3 py-1.5 text-xs rounded-md bg-black text-white hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed`}
                        title="Regenerate business logo with AI (not saved until auto-save or manual save)"
                      >
                        {isRegeneratingLogo ? (
                          <span className="flex items-center space-x-2">
                            <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
                            <span>Regenerating ...</span>
                          </span>
                        ) : '✨ Regenerate Logo with AI'}
                      </button>
                    </div>
                    <div data-logo-section>
                      <div className="flex items-center space-x-4">
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
                                const headers = {};
                                if (session?.access_token) {
                                  headers['Authorization'] = `Bearer ${session.access_token}`;
                                }
                                
                                const res = await fetch(`${getApiBaseUrl()}/api/upload-image`, { 
                                  method: 'POST', 
                                  headers,
                                  body: formData 
                                });
                                if (res.ok) {
                                  const data = await res.json();
                                  setTemplateData(prev => ({ ...prev, businessLogoUrl: data.url }));
                                  
                                  // Refresh credits after successful image upload
                                  refreshUserCredits();
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
                    <p className="text-xs text-gray-500">
                      Upload your own logo or generate an AI logo using your business name. AI logos are abstract symbols that work well at any size.
                    </p>
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
                      <p className="text-xs text-gray-500 mt-1">If disabled, the form subtitle updates to "Enter your email to get started".</p>
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
                      <div className="flex justify-end mb-3">
                        <button
                          type="button"
                          onClick={handleRegenerateHeroBackground}
                          disabled={isRegeneratingHeroBg}
                          className={`px-3 py-1.5 text-xs rounded-md bg-black text-white hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed`}
                          title="Regenerate hero background image with AI (not saved until auto-save or manual save)"
                        >
                          {isRegeneratingHeroBg ? (
                            <span className="flex items-center space-x-2">
                              <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
                              <span>Regenerating ...</span>
                            </span>
                          ) : '✨ Regenerate Hero Background with AI'}
                        </button>
                      </div>
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
                            const headers = {};
                            if (session?.access_token) {
                              headers['Authorization'] = `Bearer ${session.access_token}`;
                            }
                            
                            const res = await fetch(`${getApiBaseUrl()}/api/upload-image`, { 
                              method: 'POST', 
                              headers,
                              body: formData 
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setTemplateData(prev => ({ ...prev, heroBackgroundImage: data.url }));
                              
                              // Refresh credits after successful image upload
                              refreshUserCredits();
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
                      <div className="flex justify-end mb-3">
                        <button
                          type="button"
                          onClick={handleRegenerateAboutBackground}
                          disabled={isRegeneratingAboutBg}
                          className={`px-3 py-1.5 text-xs rounded-md bg-black text-white hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed`}
                          title="Regenerate about background image with AI (not saved until auto-save or manual save)"
                        >
                          {isRegeneratingAboutBg ? (
                            <span className="flex items-center space-x-2">
                              <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
                              <span>Regenerating ...</span>
                            </span>
                          ) : '✨ Regenerate About Background with AI'}
                        </button>
                      </div>
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
                            const headers = {};
                            if (session?.access_token) {
                              headers['Authorization'] = `Bearer ${session.access_token}`;
                            }
                            
                            const res = await fetch(`${getApiBaseUrl()}/api/upload-image`, { 
                              method: 'POST', 
                              headers,
                              body: formData 
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setTemplateData(prev => ({ ...prev, aboutBackgroundImage: data.url }));
                              
                              // Refresh credits after successful image upload
                              refreshUserCredits();
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
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Period (e.g., /month)</label>
                            <input
                              type="text"
                              value={plan.period || ''}
                              onChange={(e) => {
                                const newPricing = [...templateData.pricing];
                                newPricing[index].period = e.target.value;
                                setTemplateData(prev => ({ ...prev, pricing: newPricing }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="/month, /year, or leave empty"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="block text-xs text-gray-600 mb-1">Show Period</label>
                            <button
                              onClick={() => {
                                const newPricing = [...templateData.pricing];
                                newPricing[index].showPeriod = !newPricing[index].showPeriod;
                                setTemplateData(prev => ({ ...prev, pricing: newPricing }));
                              }}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                plan.showPeriod !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {plan.showPeriod !== false ? 'ON' : 'OFF'}
                            </button>
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
                          period: "/month",
                          showPeriod: true,
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



              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Live Preview */}
      <div className={`${mobileView === 'preview' ? 'flex' : 'hidden'} lg:flex lg:w-3/4 bg-white flex flex-col`}>
        {/* Preview Header - Hidden on mobile */}
        {!isMobile && (
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
              <div className="flex items-center space-x-3">
                {/* Upgrade button to open Pricing modal */}
                <button
                  type="button"
                  onClick={() => { setUpgradeOutOfCredits(false); setShowUpgradeModal(true); }}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm inline-flex items-center gap-1.5"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon-sm">
                    <path d="M17.665 10C17.665 10.6877 17.1785 11.2454 16.5488 11.3945L16.4219 11.4189C14.7098 11.6665 13.6129 12.1305 12.877 12.8623C12.1414 13.5938 11.6742 14.6843 11.4238 16.3887C11.3197 17.0973 10.7182 17.665 9.96484 17.665C9.27085 17.665 8.68836 17.1772 8.53613 16.5215C8.12392 14.7459 7.6623 13.619 6.95703 12.8652C6.31314 12.1772 5.39414 11.7268 3.88672 11.4688L3.57715 11.4199C2.88869 11.319 2.33496 10.734 2.33496 10C2.33496 9.26603 2.88869 8.681 3.57715 8.58008L3.88672 8.53125C5.39414 8.27321 6.31314 7.82277 6.95703 7.13477C7.6623 6.38104 8.12392 5.25413 8.53613 3.47852L8.56934 3.35742C8.76133 2.76356 9.31424 2.33496 9.96484 2.33496C10.7182 2.33497 11.3197 2.9027 11.4238 3.61133L11.5283 4.22266C11.7954 5.58295 12.2334 6.49773 12.877 7.1377C13.6129 7.86952 14.7098 8.33351 16.4219 8.58105C17.1119 8.68101 17.665 9.26667 17.665 10Z"></path>
                  </svg>
                  Upgrade your plan
                </button>
                {/* Credit Badge */}
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                    <div className="flex items-center space-x-1.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.5 12.5l7-4.5-7-4.5v9z"/>
                      </svg>
                      <span>
                        {creditsLoading ? (
                          <span className="inline-flex items-center">
                            <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                          </span>
                        ) : (
                          `${userCredits || 0} Credits`
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Real-time updates</span>
                </div>

              </div>
            </div>
          </div>
        )}
        
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'bg-white' : 'bg-gray-100'}`}>
           {/* Show magic icon loading animation when website hasn't been generated */}
           {!isWebsiteGenerated ? (
                           <div className="magic-loading-container bg-gradient-to-br from-purple-50 to-blue-50">
               <div className="text-center">
                 <div className="relative mb-6">
                                       {/* Magic wand icon with rotation animation */}
                    <div className="w-24 h-24 mx-auto mb-4 relative">
                      <svg 
                        className={`w-full h-full text-purple-500 ${aiProgress.isActive ? 'animate-pulse' : 'animate-bounce-slow'}`}
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                      >
                        <path d="M7.5 5.6c1.2-1.2 3.1-1.2 4.3 0l7.1 7.1c1.2 1.2 1.2 3.1 0 4.3l-1.4 1.4c-1.2 1.2-3.1 1.2-4.3 0L6.1 11.3c-1.2-1.2-1.2-3.1 0-4.3l1.4-1.4z"/>
                        <path d="M19.5 4.5l-2.1 2.1-1.4-1.4 2.1-2.1 1.4 1.4z"/>
                        <path d="M12 2l-1.4 1.4L9.2 2 10.6.6 12 2z"/>
                      </svg>
                      {/* Sparkles around the wand - more active when generating */}
                      <div className="absolute inset-0">
                        <div className={`absolute top-0 left-1/2 w-2 h-2 bg-yellow-400 rounded-full ${aiProgress.isActive ? 'animate-ping' : 'animate-pulse'}`} style={{ animationDelay: '0s' }}></div>
                        <div className={`absolute top-2 right-2 w-1.5 h-1.5 bg-pink-400 rounded-full ${aiProgress.isActive ? 'animate-ping' : 'animate-pulse'}`} style={{ animationDelay: '0.5s' }}></div>
                        <div className={`absolute bottom-2 left-2 w-1 h-1 bg-blue-400 rounded-full ${aiProgress.isActive ? 'animate-ping' : 'animate-pulse'}`} style={{ animationDelay: '1s' }}></div>
                        <div className={`absolute bottom-0 right-1/2 w-1.5 h-1.5 bg-green-400 rounded-full ${aiProgress.isActive ? 'animate-ping' : 'animate-pulse'}`} style={{ animationDelay: '1.5s' }}></div>
                      </div>
                    </div>
                 </div>
                 
                                   <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {aiProgress.isActive ? '✨ Magic in Progress ✨' : '✨ Waiting for your business idea ✨'}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                    {aiProgress.isActive 
                      ? 'Jetsy is crafting your perfect website based on your business idea. This will only take a moment...'
                      : messages.length === 0 
                        ? 'Jetsy will create the perfect website based on your business idea. Share your idea in the chat to get started!'
                        : 'Jetsy is ready to generate your website. The magic will begin soon!'
                    }
                  </p>
                 
                 {/* Animated dots */}
                 <div className="flex justify-center space-x-1 mt-6">
                   <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                   <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 </div>
               </div>
             </div>
           ) : (
             <>
               {/* CSS Transform-based Mobile/Tablet Preview */}
               {effectivePreviewMode === 'phone' || effectivePreviewMode === 'tablet' ? (
             <div className={`${isMobile ? 'w-full h-full' : 'flex justify-center items-start min-h-full'}`}>
                <div className={`${isMobile ? 'w-full h-full' : 'mobile-viewport-simulator'}`}>
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
            <div className={`${isMobile ? 'w-full h-full' : 'max-w-full'}`}>
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
             </>
           )}
        </div>
      </div>

      {/* Mobile bottom toggle bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-transparent z-50">
        <div className="max-w-sm md:max-w-md mx-auto flex items-center justify-between px-3 py-2">
          {/* Spacer to balance center group due to right globe */}
          <div className="w-11" />

          {/* Centered compact toggle buttons */}
          <div className="flex items-center gap-2 mx-auto">
            <button
              onClick={() => setMobileView('chat')}
              className={`w-28 h-11 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 touch-manipulation ${mobileView === 'chat' ? 'bg-black text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              <span>Chat</span>
            </button>
            <button
              onClick={() => setMobileView('preview')}
              className={`w-28 h-11 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 touch-manipulation ${mobileView === 'preview' ? 'bg-black text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              <span>Preview</span>
            </button>
          </div>

          {/* Globe secondary action button */}
          <button
            onClick={() => setShowPublishPanel(true)}
            aria-label="Globe"
            className="ml-auto w-11 h-11 flex items-center justify-center rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M2 12h20"></path>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Workflow Panel */}
      {showWorkflowPanel && (
        <div className={`workflow-panel-container ${isMobile ? 'fixed inset-0 bg-black bg-opacity-50 z-50' : 'border-b border-gray-200 bg-gray-50'}`}>
          <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-xl max-h-[80vh] overflow-y-auto' : 'p-4'}`}>
            <div className="space-y-4">
              {/* Mobile Header */}
              {isMobile && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
                  <button
                    onClick={() => setShowWorkflowPanel(false)}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div className={`${isMobile ? 'p-4' : ''}`}>
                {/* Mobile: Credits badge and Upgrade button */}
                {isMobile && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-[120px]">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full text-[11px] font-medium shadow-sm inline-flex items-center gap-1.5 whitespace-nowrap">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.5 12.5l7-4.5-7-4.5v9z" />
                          </svg>
                          {creditsLoading ? '...' : `${userCredits || 0} credits`}
                        </div>
                      </div>
                      <button
                        onClick={() => { setUpgradeOutOfCredits(false); setShowUpgradeModal(true); }}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full text-[11px] font-medium shadow-sm inline-flex items-center gap-1.5"
                        aria-label="Upgrade your plan"
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="mr-1">
                          <path d="M17.665 10C17.665 10.688 17.179 11.245 16.549 11.395l-.127.024c-1.713.247-2.81.711-3.546 1.443-.736.732-1.203 1.822-1.453 3.527-.104.708-.706 1.276-1.459 1.276-.695 0-1.277-.488-1.429-1.144-.412-1.775-.874-2.902-1.579-3.656-.644-.688-1.563-1.138-3.071-1.396l-.309-.049C2.889 11.319 2.335 10.734 2.335 10c0-.734.554-1.319 1.242-1.42l.31-.049c1.507-.258 2.426-.708 3.07-1.396.705-.754 1.167-1.88 1.579-3.656l.033-.121c.192-.594.745-1.023 1.396-1.023.753 0 1.355.568 1.459 1.276l.104.611c.267 1.36.705 2.274 1.349 2.914.736.732 1.833 1.196 3.545 1.444.69.1 1.243.686 1.243 1.419z" />
                        </svg>
                        Upgrade your plan
                      </button>
                    </div>
                  </div>
                )}
                {/* Mobile: Project Visibility Toggle chip above progress */}
                {isMobile && currentProject && (
                  <div className="mb-4">
                    <div className="text-xs font-medium text-gray-500 mb-1">Project visibility</div>
                    <VisibilityToggle
                      project={currentProject}
                      onVisibilityChange={handleVisibilityChange}
                    />
                  </div>
                )}
                {/* Workflow Progress */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">{isMobile ? 'Launch your business 🚀' : 'Website Creation Progress'}</h3>
                  <div className="space-y-3">
                    {/* Step 1: Website Creation */}
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                        <span className="text-lg">🌐</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          // Already on website creation; simply close the panel to reveal the editor
                          setShowWorkflowPanel(false);
                        }}
                        className={`text-sm font-medium px-3 py-1 rounded-lg shadow-sm transition-colors border 
                          ${isEditorMode 
                            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                            : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`}
                        aria-label="Go to Website creation"
                      >
                        Website creation
                      </button>
                    </div>
                    
                    {/* Step 2: Ads Creation */}
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 relative shadow-md shadow-blue-300/50">
                        <span className="text-lg">📢</span>
                        {/* Stronger attention effect: inner pulse ring + outer ping glow */}
                        <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-blue-500/90 ring-inset animate-pulse"></div>
                        <div className="pointer-events-none absolute -inset-2 rounded-full bg-blue-400/25 blur-sm animate-ping"></div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (currentProject?.id && onNavigateToAdCreatives) {
                            onNavigateToAdCreatives(currentProject.id);
                          }
                        }}
                        className="text-sm font-semibold text-gray-700 px-3 py-1 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
                        aria-label="Go to Ads creation"
                      >
                        Ads creation
                      </button>
                    </div>
                    
                    {/* Step 3: Launch and Monitor */}
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                        <span className="text-lg">🚀</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (currentProject?.id && onNavigateToLaunch) {
                            onNavigateToLaunch(currentProject.id);
                          }
                        }}
                        className="text-sm font-semibold text-gray-700 px-3 py-1 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
                        aria-label="Go to Launch and Monitor"
                      >
                        Launch and monitor
                      </button>
                    </div>
                    
                  </div>
                </div>
                
                {/* Data Analytics Button */}
                <button
                  onClick={() => {
                    // Navigate to data analytics page
                    if (currentProject?.id && onNavigateToDataAnalytics) {
                      onNavigateToDataAnalytics(currentProject.id);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 inline-flex items-center gap-2 justify-center mt-4"
                >
                  <span>Data Analytics</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-gray-500">
                    <path d="M5 3a1 1 0 0 1 1 1v14h12a1 1 0 1 1 0 2H5a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1h1Zm4.5 5a1 1 0 0 1 1 1v7h-2v-7a1 1 0 0 1 1-1Zm4 -2a1 1 0 0 1 1 1v9h-2V7a1 1 0 0 1 1-1Zm4 4a1 1 0 0 1 1 1v5h-2v-5a1 1 0 0 1 1-1Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Panel (mobile bottom sheet) */}
      {showPublishPanel && isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60]">
          <div className="publish-panel-container fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Publish</h3>
              <button
                onClick={() => setShowPublishPanel(false)}
                className="text-gray-400 hover:text-gray-600 p-2"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {!isPublished && (
                <button
                  onClick={() => { /* mirrors desktop publish action; Deployment UI below */ }}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-semibold"
                >
                  Publish 🚀
                </button>
              )}

              <div className="border border-gray-200 rounded-lg">
                <div className="p-4">
                  <DeploymentButton projectId={currentProject?.id || undefined} showAsModal={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TemplateBasedChat; 