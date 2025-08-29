import React, { useState, useEffect, useRef } from 'react'
import { getApiBaseUrl } from './config/environment'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import FAQ from './components/FAQ'
import PricingModal from './components/PricingModal'
import LeadCaptureForm from './components/LeadCaptureForm'
import OnboardingForm from './components/OnboardingForm'
import LoginForm from './components/LoginForm'
import Footer from './components/Footer'
import QueuePage from './components/QueuePage'
import PriorityAccessErrorPage from './components/PriorityAccessErrorPage'
import { trackEvent } from './utils/analytics'
import DemoBookingForm from './components/DemoBookingForm'
import ChatInputWithToggle from './components/ChatInputWithToggle'
import ChatPage from './components/ChatPage'
import TemplateBasedChat from './components/TemplateBasedChat'
import ExceptionalTemplate from './components/ExceptionalTemplate'
import ProjectDataAnalytics from './components/ProjectDataAnalytics'
import PublicRouteView from './components/PublicRouteView'
import AdCreativesPage from './components/AdCreativesPage'
import AdsTemplatePage from './components/AdsTemplatePage'
import LaunchMonitorPage from './components/LaunchMonitorPage'
import IdeaModal from './components/IdeaModal'
import { AuthProvider, useAuth } from './components/auth/AuthProvider'
import SignUpForm from './components/auth/SignUpForm'
import ProfilePage from './components/auth/ProfilePage'
import { getCurrentSession } from './config/supabase'
import VerifyEmailPage from './components/auth/VerifyEmailPage'
import NameCaptureModal from './components/auth/NameCaptureModal'
import UpgradePlanPage from './components/UpgradePlanPage'

import useBillingPlan from './utils/useBillingPlan'
import OAuthCallbackHandler from './components/OAuthCallbackHandler'

function App() {
  const [currentStep, setCurrentStep] = useState('hero') // hero, faq, pricing, lead-capture, onboarding, login, signup, demo-booking, demo-thankyou, chat, profile
  const [startupIdea, setStartupIdea] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showNavbarPricingModal, setShowNavbarPricingModal] = useState(false)
  const [leadData, setLeadData] = useState(null)
  const [hasSeenPricing, setHasSeenPricing] = useState(false)
  const [expandChat, setExpandChat] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop, phone, tablet
  const templateChatRef = useRef(null);
  const [analyticsProjectId, setAnalyticsProjectId] = useState(null);
  const [routeUserId, setRouteUserId] = useState(null);
  const [routeProjectId, setRouteProjectId] = useState(null);
  const [adCreativesProjectId, setAdCreativesProjectId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth ? useAuth() : { user: null };
  const [showNameCapture, setShowNameCapture] = useState(false);
  // Billing success modal state
  const [showBillingSuccess, setShowBillingSuccess] = useState(false);
  const [billingSuccessPlan, setBillingSuccessPlan] = useState(null);
  // Idea modal state
  const [ideaModal, setIdeaModal] = useState({ isOpen: false, project: null, businessIdea: '' });
  const { plan } = useBillingPlan();

  // Fetch billing and broadcast to interested components
  const refreshBillingState = React.useCallback(async () => {
    try {
      const session = await getCurrentSession();
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
      const res = await fetch(`${getApiBaseUrl()}/api/billing/me`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      // Persist for components that prefer polling/localStorage
      try {
        localStorage.setItem('jetsy_billing_plan', data?.plan || 'free');
        if (typeof data?.credits === 'number') localStorage.setItem('jetsy_credits', String(data.credits));
        if (data?.credit_limit) localStorage.setItem('jetsy_credit_limit', String(data.credit_limit));
        if (data?.next_refresh_at) localStorage.setItem('jetsy_next_refresh_at', String(data.next_refresh_at));
      } catch {}
      // Broadcast for live consumers
      window.dispatchEvent(new CustomEvent('billing:updated', { detail: data }));
    } catch (e) {
      // silent fail
    }
  }, []);

  // Handle showing idea modal
  const handleShowIdea = async (project) => {
    try {
      setIdeaModal({ isOpen: true, project, businessIdea: 'Loading...' });
      
      // Fetch the business idea from the project's initial message
      const res = await fetch(`${getApiBaseUrl()}/api/projects/${project.id}/idea`);
      if (res.ok) {
        const data = await res.json();
        setIdeaModal({ isOpen: true, project, businessIdea: data.idea || 'No business idea available for this project.' });
      } else {
        setIdeaModal({ isOpen: true, project, businessIdea: 'Unable to load business idea for this project.' });
      }
    } catch (error) {
      console.error('Error fetching business idea:', error);
      setIdeaModal({ isOpen: true, project, businessIdea: 'Error loading business idea. Please try again.' });
    }
  };

  const closeIdeaModal = () => {
    setIdeaModal({ isOpen: false, project: null, businessIdea: '' });
  };

  useEffect(() => {
    // Track page view
    trackEvent('page_view', { page: 'home' })
  }, [])

  // Effect to detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show name capture modal when user is signed in but missing full_name
  useEffect(() => {
    if (!user) {
      setShowNameCapture(false);
      return;
    }
    const name = user.user_metadata?.full_name;
    setShowNameCapture(!name || name.trim() === '');
  }, [user]);

  // Handle URL-based routing
  useEffect(() => {
    const path = window.location.pathname;
    console.log('URL pathname:', path);
    const params = new URLSearchParams(window.location.search);
    const wantSignup = params.get('signup') === '1';
    
    // Detect OAuth callback in URL fragment
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token') || hash.includes('code'))) {
      console.log('🔑 OAuth callback detected in URL fragment');
      setCurrentStep('oauth-callback');
      return;
    }
    
    // Detect billing success flag from Stripe redirect and show confirmation modal
    const billingFlag = params.get('billing');
    if (billingFlag === 'success') {
      const planParam = params.get('plan');
      if (planParam) setBillingSuccessPlan(planParam);
      
      // Only show global modal if not on chat page
      if (path !== '/chat' && !path.startsWith('/chat/')) {
        setShowBillingSuccess(true);
      }
      
      // Do not mutate URL here to avoid losing state if user reloads; we'll clean on modal close
      // Refresh billing state as soon as we detect success
      (async () => { await refreshBillingState(); })();
    }
    if (path === '/verify_email') {
      setCurrentStep('verify-email');
    } else if (path === '/chat') {
      // Only authenticated users can access chat
      setCurrentStep('chat');
    } else if (path.startsWith('/chat/')) {
      // Handle /chat/{project-id} routes
      const projectIdStr = path.slice('/chat/'.length);
      const pid = parseInt(projectIdStr, 10);
      if (!isNaN(pid)) {
        setRouteProjectId(pid);
        setCurrentStep('chat');
      }
    } else if (path === '/profile') {
      setCurrentStep('profile');
    } else if (path === '/upgrade_plan') {
      setCurrentStep('upgrade-plan');
    } else if (path.startsWith('/ad-creatives/')) {
      // Handle /ad-creatives/{project-id} routes
      const projectIdStr = path.slice('/ad-creatives/'.length);
      const pid = parseInt(projectIdStr, 10);
      if (!isNaN(pid)) {
        setAdCreativesProjectId(pid);
        setCurrentStep('ad-creatives');
      }
    } else if (path.startsWith('/launch/')) {
      const projectIdStr = path.slice('/launch/'.length);
      const pid = parseInt(projectIdStr, 10);
      if (!isNaN(pid)) {
        setRouteProjectId(pid);
        setCurrentStep('launch-monitor');
      }
    } else if (path === '/ads_template') {
      // Handle ads template route - no password required
      setCurrentStep('ads-template');
    } else if (/^\/[0-9]+-[0-9]+$/.test(path)) {
      const pair = path.slice(1);
      const [userIdStr, projectIdStr] = pair.split('-');
      const pid = parseInt(projectIdStr, 10);
      const uid = parseInt(userIdStr, 10);
      if (!isNaN(pid)) {
        setRouteProjectId(pid);
        if (!isNaN(uid)) setRouteUserId(uid);
        setCurrentStep('public-route');
      }
    } else if (/^\/[0-9]+$/.test(path)) {
      // Handle /{projectId} routes for public projects
      const projectIdStr = path.slice(1);
      const pid = parseInt(projectIdStr, 10);
      if (!isNaN(pid)) {
        setRouteProjectId(pid);
        setRouteUserId(null); // No userId for public project routes
        setCurrentStep('public-route');
      }
    } else if (path.startsWith('/route/')) {
      // Backward compatibility: redirect old /route/{uid}-{pid} to new /{uid}-{pid}
      const pair = path.slice('/route/'.length);
      if (pair && pair.includes('-')) {
        window.history.replaceState({}, '', `/${pair}`);
        const [userIdStr, projectIdStr] = pair.split('-');
        const pid = parseInt(projectIdStr, 10);
        const uid = parseInt(userIdStr, 10);
        if (!isNaN(pid)) {
          setRouteProjectId(pid);
          if (!isNaN(uid)) setRouteUserId(uid);
          setCurrentStep('public-route');
        }
      }
    } else if (path.startsWith('/data_analytics/project_')) {
      const num = path.replace('/data_analytics/project_', '');
      const pid = parseInt(num, 10);
      if (!isNaN(pid)) {
        setAnalyticsProjectId(pid);
        setCurrentStep('data-analytics');
      }
    } else if (path === '/faq') {
      setCurrentStep('faq');
    } else if (path === '/template') {
      setCurrentStep('template');
      // Check if this is a custom domain (not jetsy.dev or localhost)
      // Expose API base for templates that might post with window-scoped config
      try { window.JETSY_API_BASE = getApiBaseUrl(); } catch {}
      
      const hostname = window.location.hostname;
      if (!hostname.includes("jetsy.dev") && !hostname.includes("localhost")) {
        // This is a custom domain, fetch project info
        (async () => {
          try {
            // Pass the original hostname as a query parameter to ensure proper resolution
            const res = await fetch(`${getApiBaseUrl()}/api/domain/resolve?domain=${encodeURIComponent(hostname)}`);
            if (res.ok) {
              const data = await res.json();
              console.log('Domain resolve response:', data); // Debug logging
              if (data && data.project_id) {
                setRouteProjectId(data.project_id);
                setCurrentStep("public-route");
                setIsInitialLoad(false);
                return;
              }
            }
          } catch (error) {
            console.error('Domain resolve error:', error); // Debug logging
          }
          setCurrentStep("hero");
          setIsInitialLoad(false);
        })();
      } else {
        // This is jetsy.dev or localhost, show hero
        setCurrentStep("hero");
        setIsInitialLoad(false);
      }
    } else if (path === '/') {
      // Root path - check if this is a custom domain
      const hostname = window.location.hostname;
      
      // Expose API base for templates that might post with window-scoped config
      try { window.JETSY_API_BASE = getApiBaseUrl(); } catch {}
      
      if (!hostname.includes('jetsy.dev') && !hostname.includes('localhost')) {
        // This IS a custom domain - call API to get project info
        (async () => {
          try {
            // Pass the original hostname as a query parameter to ensure proper resolution
            console.log('Custom domain detected:', hostname);
            const res = await fetch(`${getApiBaseUrl()}/api/domain/resolve?domain=${encodeURIComponent(hostname)}`);
            if (res.ok) {
              const data = await res.json();
              console.log('Domain resolve response:', data); // Debug logging
              if (data && data.project_id) {
                setRouteProjectId(data.project_id);
                setCurrentStep('public-route'); // Show the custom website
                setIsInitialLoad(false);
                return;
              }
            }
          } catch (error) {
            console.error('Domain resolve error:', error); // Debug logging
          }
          // If domain resolution fails, show the default hero page
          setCurrentStep('hero');
          setIsInitialLoad(false);
        })();
        return; // avoid marking initial load twice below
      } else {
        // This is jetsy.dev or localhost - show hero by default.
        // If logged in but email not confirmed, show verify-email instead.
        (async () => {
          try {
            const session = await getCurrentSession();
            if (session && session.user && !session.user.email_confirmed_at) {
              setCurrentStep('verify-email');
              setIsInitialLoad(false);
              return;
            }
          } catch (e) {
            console.error('Error checking auth session on home:', e);
          }
          // If URL requests signup (from unauthenticated Remix), go to signup
          if (wantSignup) {
            setCurrentStep('signup');
          } else {
            setCurrentStep('hero');
          }
          setIsInitialLoad(false);
        })();
      }
    }
    
    // Mark initial load as complete
    setIsInitialLoad(false);
  }, []);

  // Update URL when step changes (but avoid infinite loops)
  useEffect(() => {
    // Don't update URL during initial load
    if (isInitialLoad) return;
    
    const path = window.location.pathname;
    console.log('currentStep changed to:', currentStep);
    
    // Only update URL if it doesn't match the current step
    if (currentStep === 'chat' && routeProjectId && path !== `/chat/${routeProjectId}`) {
      window.history.pushState({}, '', `/chat/${routeProjectId}`);
    } else if (currentStep === 'chat' && !routeProjectId && path !== '/chat') {
      window.history.pushState({}, '', '/chat');
    } else if (currentStep === 'profile' && path !== '/profile') {
      window.history.pushState({}, '', '/profile');
    } else if (currentStep === 'verify-email' && path !== '/verify_email') {
      window.history.pushState({}, '', '/verify_email');
    } else if (currentStep === 'ad-creatives' && adCreativesProjectId && path !== `/ad-creatives/${adCreativesProjectId}`) {
      window.history.pushState({}, '', `/ad-creatives/${adCreativesProjectId}`);
    } else if (currentStep === 'launch-monitor' && routeProjectId && path !== `/launch/${routeProjectId}`) {
      window.history.pushState({}, '', `/launch/${routeProjectId}`);
    } else if (currentStep === 'ads-template' && path !== '/ads_template') {
      window.history.pushState({}, '', '/ads_template');
    } else if (currentStep === 'data-analytics' && analyticsProjectId && path !== `/data_analytics/project_${analyticsProjectId}`) {
      window.history.pushState({}, '', `/data_analytics/project_${analyticsProjectId}`);
    } else if (currentStep === 'faq' && path !== '/faq') {
      window.history.pushState({}, '', '/faq');
    } else if (currentStep === 'upgrade-plan' && path !== '/upgrade_plan') {
      window.history.pushState({}, '', '/upgrade_plan');
    } else if (currentStep === 'template' && path !== '/template') {
      window.history.pushState({}, '', '/template');
    } else if (currentStep === 'hero' && path !== '/') {
      window.history.pushState({}, '', '/');
    }
  }, [currentStep, isInitialLoad, analyticsProjectId, routeProjectId, adCreativesProjectId]);

  const handleChatClick = () => {
    setCurrentStep('chat');
    trackEvent('chat_page_click');
  };

  const handleIdeaSubmit = (idea, visibility) => {
    setStartupIdea(idea)
    setVisibility(visibility)
    
    trackEvent('chat_input_submit', { 
      idea_length: idea.length,
      idea_content: idea,
      visibility: visibility 
    })

    // Persist idea so we can prefill it after signup/login on /chat
    try {
      localStorage.setItem('jetsy_prefill_idea', idea)
    } catch {}

    // If user has already seen pricing modal, go directly to signup
    if (hasSeenPricing) {
      setCurrentStep('signup')
    } else {
      // Show pricing modal for the first time
      setShowPricingModal(true)
    }
  }

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan)
    setShowPricingModal(false)
    setHasSeenPricing(true)
    setCurrentStep('signup')
    
    trackEvent('pricing_plan_select', { plan: plan.type })
  }

  const handleNavbarPricingClick = () => {
    setShowNavbarPricingModal(true)
    trackEvent('navbar_pricing_click')
  }

  const handleFAQClick = () => {
    setCurrentStep('faq')
    trackEvent('faq_click')
  }

  const handleBackToHome = () => {
    setCurrentStep('hero')
    trackEvent('back_to_home')
  }

  const handleLogoClick = () => {
    setCurrentStep('hero')
    trackEvent('logo_click')
  }

  const handleNavbarPlanSelect = (plan) => {
    setSelectedPlan(plan)
    setShowNavbarPricingModal(false)
    setHasSeenPricing(true)
    setCurrentStep('signup')
    trackEvent('pricing_plan_select', { plan: plan.type })
  }

  const handleShowLogin = () => {
    setCurrentStep('login')
    trackEvent('show_login_form')
  }

  const handleBackToSignup = () => {
    setCurrentStep('signup')
    trackEvent('back_to_signup_form')
  }

  const handleAuthSuccess = (user) => {
    console.log('Authentication successful:', user);
    // Try to perform pending remix if present
    ;(async () => {
      const done = await performPendingRemix();
      if (!done) {
        // Fallback: go to chat
        setCurrentStep('chat');
      }
    })();
  }

  const handleShowSignup = () => {
    setCurrentStep('signup')
  }

  const handleBackToChat = () => {
    setCurrentStep('chat')
  }

  const handleLeadSubmit = async (email, phone) => {
    const leadInfo = { email, phone }
    setLeadData(leadInfo)
    
    trackEvent('lead_form_submit', { 
      email: email, // Capture the email
      phone: phone, // Capture the phone number
      has_plan: !!selectedPlan,
      plan_type: selectedPlan?.type || 'free'
    })

    // Save to database via Cloudflare Worker
    try {
              const response = await fetch(`${getApiBaseUrl()}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phone,
          startupIdea,
          visibility,
          planType: selectedPlan?.type || 'free',
          timestamp: Date.now()
        })
      })

      if (response.ok) {
        // Removed lead_saved_success tracking
        trackEvent('queue_view', { email, phone })
        setCurrentStep('queue')
      } else {
        trackEvent('lead_save_error')
        console.error('Failed to save lead')
      }
    } catch (error) {
      trackEvent('lead_save_error')
      console.error('Error saving lead:', error)
    }
  }

  const handleOnboardingSubmit = async (onboardingData) => {
    trackEvent('onboarding_complete', {
      plan_type: selectedPlan?.type || 'free',
      has_idea_title: !!onboardingData.ideaTitle,
      has_description: !!onboardingData.description
    })

    // Save onboarding data to database
    try {
              const response = await fetch(`${getApiBaseUrl()}/api/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...onboardingData,
          leadId: leadData?.id,
          planType: selectedPlan?.type || 'free',
          timestamp: Date.now()
        })
      })

      if (response.ok) {
        // Removed onboarding_saved_success tracking
        // Show success state or redirect
        setCurrentStep('success')
      } else {
        trackEvent('onboarding_save_error')
        console.error('Failed to save onboarding data')
      }
    } catch (error) {
      trackEvent('onboarding_save_error')
      console.error('Error saving onboarding data:', error)
    }
  }

  const handlePriorityAccessClick = async () => {
    trackEvent('priority_access_attempt', { 
      email: leadData?.email, // Capture the email
      phone: leadData?.phone  // Capture the phone number
    })

    // Save priority access attempt to database
    try {
              const response = await fetch(`${getApiBaseUrl()}/api/priority-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: leadData?.email,
          phone: leadData?.phone,
          leadId: leadData?.id,
          timestamp: Date.now()
        })
      })

      if (response.ok) {
        // Removed priority_access_saved_success tracking
        setCurrentStep('priority-access-error')
      } else {
        trackEvent('priority_access_save_error')
        console.error('Failed to save priority access attempt')
        setCurrentStep('priority-access-error')
      }
    } catch (error) {
      trackEvent('priority_access_save_error')
      console.error('Error saving priority access attempt:', error)
      setCurrentStep('priority-access-error')
    }
  }

  const resetFlow = () => {
    setCurrentStep('hero')
    setStartupIdea('')
    setVisibility('public')
    setSelectedPlan(null)
    setShowPricingModal(false)
    setLeadData(null)
    setHasSeenPricing(false)
    
    trackEvent('flow_reset')
  }

  // Add handler for Book a Demo
  const handleBookDemo = () => {
    setShowPricingModal(false)
    setShowNavbarPricingModal(false)
    setCurrentStep('demo-booking')
    trackEvent('demo_booking_start')
  }

  // Add handler for demo lead submit
  const handleDemoLeadSubmit = async (formData) => {
    trackEvent('demo_lead_submit', formData)
    try {
              const response = await fetch(`${getApiBaseUrl()}/api/demo-leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, timestamp: Date.now() })
      })
      if (response.ok) {
        setCurrentStep('demo-thankyou')
        trackEvent('demo_lead_success', formData)
      } else {
        trackEvent('demo_lead_error', { error: 'Failed to save demo lead' })
        // Optionally show error
      }
    } catch (error) {
      trackEvent('demo_lead_error', { error: error.message })
      // Optionally show error
    }
  }

  const handleGetStartedClick = () => {
    // Route to signup page instead of highlighting chat form
    setCurrentStep('signup');
  };

  const handleSaveChanges = async () => {
    // Call the save function in TemplateBasedChat component
    if (templateChatRef.current && templateChatRef.current.saveTemplateData) {
      await templateChatRef.current.saveTemplateData();
    }
  };

  const handlePreviewModeChange = (newMode) => {
    setPreviewMode(newMode);
  };

  // Perform pending remix if a project ID is stored in localStorage and user has a session
  const performPendingRemix = async () => {
    let pendingId = null;
    try { pendingId = localStorage.getItem('jetsy_pending_remix_project_id'); } catch {}
    if (!pendingId) return false;
    try {
      const session = await getCurrentSession();
      const token = session?.access_token;
      if (!token) return false;
      const res = await fetch(`${getApiBaseUrl()}/api/projects/${pendingId}/remix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        console.error('Pending remix failed');
        return false;
      }
      const data = await res.json();
      const newProjectId = data?.project?.id;
      try { localStorage.removeItem('jetsy_pending_remix_project_id'); } catch {}
      if (newProjectId) {
        setRouteProjectId(newProjectId);
        setCurrentStep('chat');
        return true;
      }
      return false;
    } catch (e) {
      console.error('performPendingRemix error', e);
      return false;
    }
  };

  // Attempt remix on load if user is already authenticated after returning from OAuth
  useEffect(() => {
    (async () => {
      await performPendingRemix();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navbar (hidden on public full-screen route, on mobile ad-creatives, and on upgrade-plan page) */}
      {currentStep !== 'public-route' && !(currentStep === 'ad-creatives' && isMobile) && currentStep !== 'upgrade-plan' && (
        <Navbar 
          onPricingClick={handleNavbarPricingClick} 
          onFAQClick={handleFAQClick} 
          onLogoClick={handleLogoClick} 
          onGetStartedClick={handleGetStartedClick}
          onChatClick={handleChatClick}
          onLoginClick={handleShowLogin}
          onSaveChanges={handleSaveChanges}
          isChatMode={currentStep === 'chat'}
          isAdCreativesMode={currentStep === 'ad-creatives'}
          isLaunchMonitorMode={currentStep === 'launch-monitor'}
          previewMode={previewMode}
          onPreviewModeChange={handlePreviewModeChange}
          isMainPage={currentStep === 'hero'}
          isProfilePage={currentStep === 'profile'}
          hideWorkflowAndAnalytics={currentStep === 'login' || currentStep === 'signup' || currentStep === 'faq'}
          // Add navigation callbacks for workflow stages
          onNavigateToWebsiteCreation={(projectId) => {
            setRouteProjectId(projectId);
            setCurrentStep('chat');
          }}
          onNavigateToAdCreatives={(projectId) => {
            setAdCreativesProjectId(projectId);
            setCurrentStep('ad-creatives');
          }}
          onNavigateToLaunchMonitor={(projectId) => {
            setRouteProjectId(projectId);
            setCurrentStep('launch-monitor');
          }}
          onProfileClick={() => setCurrentStep('profile')}
        />
      )}
      
      {/* Hero Section */}
      {currentStep === 'hero' && (
        <HeroSection 
          onIdeaSubmit={handleIdeaSubmit}
          onPricingShown={() => setHasSeenPricing(true)}
          expandChat={expandChat}
          onShowSignup={handleShowSignup}
          onShowIdea={handleShowIdea}
        />
      )}


      {/* FAQ Section */}
      {currentStep === 'faq' && (
        <FAQ />
      )}

      {/* Pricing Modal */}
      {showPricingModal && (
        <PricingModal 
          onPlanSelect={handlePlanSelect}
          onClose={() => setShowPricingModal(false)}
          onBookDemo={handleBookDemo}
          currentPlanType={user ? plan : null}
        />
      )}

      {/* Navbar Pricing Modal */}
      {showNavbarPricingModal && (
        <PricingModal 
          onPlanSelect={handleNavbarPlanSelect}
          onClose={() => setShowNavbarPricingModal(false)}
          onBookDemo={handleBookDemo}
          currentPlanType={user ? plan : null}
        />
      )}

      {/* Lead Capture Form */}
      {currentStep === 'lead-capture' && (
        <LeadCaptureForm 
          onSubmit={handleLeadSubmit}
          startupIdea={startupIdea}
          selectedPlan={selectedPlan}
          onReset={resetFlow}
          onShowLogin={handleShowLogin}
        />
      )}

      {/* Queue Page */}
      {currentStep === 'queue' && (
        <QueuePage 
          email={leadData?.email}
          phone={leadData?.phone}
          onPriorityAccessClick={handlePriorityAccessClick}
        />
      )}

      {/* Priority Access Error Page */}
      {currentStep === 'priority-access-error' && (
        <PriorityAccessErrorPage 
          email={leadData?.email}
          phone={leadData?.phone}
          onReset={resetFlow}
        />
      )}

      {/* Onboarding Form */}
      {currentStep === 'onboarding' && (
        <OnboardingForm 
          onSubmit={handleOnboardingSubmit}
          startupIdea={startupIdea}
          selectedPlan={selectedPlan}
          onReset={resetFlow}
        />
      )}

      {/* Login Form */}
      {currentStep === 'login' && (
        <LoginForm 
          onBackToSignup={handleBackToSignup}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Sign Up Form */}
      {currentStep === 'signup' && (
        <SignUpForm 
          onShowLogin={handleShowLogin}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Verify Email Page */}
      {currentStep === 'verify-email' && (
        <VerifyEmailPage />
      )}

      {/* Profile Page */}
      {currentStep === 'profile' && (
        <ProfilePage 
          onBackToChat={handleBackToChat}
        />
      )}

      {/* Upgrade Plan Page */}
      {currentStep === 'upgrade-plan' && (
        <UpgradePlanPage 
          onBackToChat={handleBackToChat}
          onNavigateToProfile={() => setCurrentStep('profile')}
        />
      )}

      {/* Success State */}
      {currentStep === 'success' && (
        <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12 radial-bg">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4 text-text">Your validation test is ready! 🚀</h2>
              <p className="text-mutedText mb-8">We'll start generating your landing page and send you the link within 24 hours.</p>
            </div>

            <div className="bg-white rounded-xl p-6 mb-8 text-left shadow-sm border border-gray-200">
              <h3 className="font-semibold mb-4 text-text">What happens next?</h3>
              <ul className="space-y-3 text-sm text-mutedText">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>AI generates your landing page</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Share with potential customers</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Track real user behavior</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Get detailed analytics and insights</span>
                </li>
              </ul>
            </div>

            <button
              onClick={resetFlow}
              className="btn btn-primary"
            >
              Start Another Test
            </button>
          </div>
        </div>
      )}

      {/* Demo Booking Form */}
      {currentStep === 'demo-booking' && (
        <DemoBookingForm onSubmit={handleDemoLeadSubmit} />
      )}
      {/* Demo Thank You Page */}
      {currentStep === 'demo-thankyou' && (
        <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12 radial-bg">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4 text-text">Thank you for your interest!</h2>
              <p className="text-mutedText mb-8">Our representative will reach out to you soon to schedule a demo.</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Page */}
      {currentStep === 'chat' && (
        <TemplateBasedChat 
          ref={templateChatRef}
          onBackToHome={() => setCurrentStep('hero')} 
          onSaveChanges={handleSaveChanges}
          previewMode={previewMode}
          initialProjectId={routeProjectId}
          onNavigateToProfile={() => setCurrentStep('profile')}
          onNavigateToAdCreatives={(projectId) => {
            setAdCreativesProjectId(projectId);
            setCurrentStep('ad-creatives');
          }}
          onNavigateToDataAnalytics={(projectId) => {
            setAnalyticsProjectId(projectId);
            setCurrentStep('data-analytics');
          }}
          onNavigateToLaunch={(projectId) => {
            setRouteProjectId(projectId);
            setCurrentStep('launch-monitor');
          }}
          billingSuccess={showBillingSuccess}
          billingSuccessPlan={billingSuccessPlan}
          onBillingSuccessClose={() => setShowBillingSuccess(false)}
        />
      )}

      {/* OAuth Callback Handler */}
      {currentStep === 'oauth-callback' && (
        <OAuthCallbackHandler />
      )}

      {/* Ad Creatives Page */}
      {currentStep === 'ad-creatives' && adCreativesProjectId && (
        <AdCreativesPage 
          projectId={adCreativesProjectId}
          onNavigateToChat={(projectId) => {
            setRouteProjectId(projectId);
            setCurrentStep('chat');
          }}
          onNavigateToLaunch={(projectId) => {
            setRouteProjectId(projectId);
            setCurrentStep('launch-monitor');
          }}
          onNavigateToDataAnalytics={(projectId) => {
            setAnalyticsProjectId(projectId);
            setCurrentStep('data-analytics');
          }}
        />
      )}

      {/* Ads Template Page */}
      {currentStep === 'ads-template' && (
        <AdsTemplatePage 
          onBackToHome={() => setCurrentStep('hero')}
        />
      )}

      {/* Launch & Monitor Page */}
      {currentStep === 'launch-monitor' && routeProjectId && (
        <LaunchMonitorPage 
          projectId={routeProjectId}
          onNavigateToChat={(projectId) => {
            setRouteProjectId(projectId);
            setCurrentStep('chat');
          }}
          onNavigateToAdCreatives={(projectId) => {
            setAdCreativesProjectId(projectId);
            setCurrentStep('ad-creatives');
          }}
        />
      )}

      {/* Public full-screen route */}
      {currentStep === 'public-route' && routeProjectId && (
        <PublicRouteView userId={routeUserId} projectId={routeProjectId} />
      )}

      {/* Data Analytics Page */}
      {currentStep === 'data-analytics' && analyticsProjectId && (
        <ProjectDataAnalytics 
          projectId={analyticsProjectId}
      onBack={() => {
            try { localStorage.setItem('jetsy_current_project_id', String(analyticsProjectId)); } catch {}
            setCurrentStep('chat');
          }}
        />
      )}

      {/* Exceptional Template */}
      {currentStep === 'template' && (
        <ExceptionalTemplate />
      )}

      {/* Footer */}
      {currentStep !== 'template' && currentStep !== 'public-route' && currentStep !== 'chat' && <Footer />}

      {/* Name Capture Modal (blocking) */}
      <NameCaptureModal
        isOpen={!!user && showNameCapture}
        onCompleted={() => {
          setShowNameCapture(false);
          if (currentStep !== 'chat') setCurrentStep('chat');
        }}
      />

      {/* Billing Success Modal */}
      {showBillingSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 border border-gray-200">
            {/* Close (X) */}
            <button
              aria-label="Close"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setShowBillingSuccess(false);
                // Remove billing-related query params but keep current path and other params
                try {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('billing');
                  url.searchParams.delete('plan');
                  window.history.replaceState({}, '', url.toString());
                } catch {}
                // Refresh billing state one more time on close to ensure UI sync
                (async () => { await refreshBillingState(); })();
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-text">Subscription activated!</h3>
              <p className="text-mutedText mb-4">{billingSuccessPlan ? `Your ${billingSuccessPlan} plan is now active.` : 'Your plan is now active.'}</p>
              <p className="text-sm text-mutedText">You can start using your new credits and features right away.</p>
            </div>
          </div>
        </div>
      )}

      {/* Idea Modal */}
      <IdeaModal
        isOpen={ideaModal.isOpen}
        onClose={closeIdeaModal}
        project={ideaModal.project}
        businessIdea={ideaModal.businessIdea}
      />

    </div>
  )
}

export default App 