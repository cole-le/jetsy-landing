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

function App() {
  const [currentStep, setCurrentStep] = useState('hero') // hero, faq, pricing, lead-capture, onboarding, login, demo-booking, demo-thankyou, chat
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

  useEffect(() => {
    // Track page view
    trackEvent('page_view', { page: 'home' })
  }, [])

  // Handle URL-based routing
  useEffect(() => {
    const path = window.location.pathname;
    console.log('URL pathname:', path);
    
    const verifyChatPassword = async () => {
      try {
        const pw = prompt('Enter password to access /chat');
        if (!pw) return false;
        const resp = await fetch(`${getApiBaseUrl()}/api/chat-password-verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pw })
        });
        if (!resp.ok) return false;
        const j = await resp.json().catch(() => ({}));
        return !!j?.ok;
      } catch {
        return false;
      }
    };
    
    if (path === '/chat') {
      // Simple password gate for both local and production
      (async () => {
        const allowed = await verifyChatPassword();
        setCurrentStep(allowed ? 'chat' : 'hero');
      })();
    } else if (path.startsWith('/chat/')) {
      // Handle /chat/{project-id} routes
      const projectIdStr = path.slice('/chat/'.length);
      const pid = parseInt(projectIdStr, 10);
      if (!isNaN(pid)) {
        (async () => {
          const allowed = await verifyChatPassword();
          if (allowed) {
            setRouteProjectId(pid);
            setCurrentStep('chat');
          } else {
            setCurrentStep('hero');
          }
        })();
      }
    } else if (path.startsWith('/ad-creatives/')) {
      // Handle /ad-creatives/{project-id} routes
      const projectIdStr = path.slice('/ad-creatives/'.length);
      const pid = parseInt(projectIdStr, 10);
      if (!isNaN(pid)) {
        setAdCreativesProjectId(pid);
        setCurrentStep('ad-creatives');
      }
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
        // This is jetsy.dev or localhost - show the normal Jetsy interface
        setCurrentStep('hero');
        setIsInitialLoad(false);
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
    } else if (currentStep === 'ad-creatives' && adCreativesProjectId && path !== `/ad-creatives/${adCreativesProjectId}`) {
      window.history.pushState({}, '', `/ad-creatives/${adCreativesProjectId}`);
    } else if (currentStep === 'data-analytics' && analyticsProjectId && path !== `/data_analytics/project_${analyticsProjectId}`) {
      window.history.pushState({}, '', `/data_analytics/project_${analyticsProjectId}`);
    } else if (currentStep === 'faq' && path !== '/faq') {
      window.history.pushState({}, '', '/faq');
    } else if (currentStep === 'template' && path !== '/template') {
      window.history.pushState({}, '', '/template');
    } else if (currentStep === 'hero' && path !== '/') {
      window.history.pushState({}, '', '/');
    }
  }, [currentStep, isInitialLoad, analyticsProjectId, routeProjectId, adCreativesProjectId]);

  const handleChatClick = async () => {
    const verify = async () => {
      try {
        const pw = prompt('Enter password to access /chat');
        if (!pw) return false;
        const resp = await fetch(`${getApiBaseUrl()}/api/chat-password-verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pw })
        });
        if (!resp.ok) return false;
        const j = await resp.json().catch(() => ({}));
        return !!j?.ok;
      } catch {
        return false;
      }
    };
    const allowed = await verify();
    if (allowed) {
      setCurrentStep('chat');
      trackEvent('chat_page_click');
    }
  };

  const handleIdeaSubmit = (idea, visibility) => {
    setStartupIdea(idea)
    setVisibility(visibility)
    
    trackEvent('chat_input_submit', { 
      idea_length: idea.length,
      idea_content: idea,
      visibility: visibility 
    })

    // If user has already seen pricing modal, go directly to lead capture
    if (hasSeenPricing) {
      setCurrentStep('lead-capture')
    } else {
      // Show pricing modal for the first time
      setShowPricingModal(true)
    }
  }

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan)
    setShowPricingModal(false)
    setHasSeenPricing(true)
    setCurrentStep('lead-capture')
    
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
    setCurrentStep('lead-capture')
    trackEvent('pricing_plan_select', { plan: plan.type })
  }

  const handleShowLogin = () => {
    setCurrentStep('login')
    trackEvent('show_login_form')
  }

  const handleBackToSignup = () => {
    setCurrentStep('lead-capture')
    trackEvent('back_to_signup_form')
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
    setExpandChat(true);
    setTimeout(() => setExpandChat(false), 1000); // expand for 1s
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

  return (
    <div className="min-h-screen">
      {/* Navbar (hidden on public full-screen route) */}
      {currentStep !== 'public-route' && (
        <Navbar 
          onPricingClick={handleNavbarPricingClick} 
          onFAQClick={handleFAQClick} 
          onLogoClick={handleLogoClick} 
          onGetStartedClick={handleGetStartedClick}
          onChatClick={handleChatClick}
          onSaveChanges={handleSaveChanges}
          isChatMode={currentStep === 'chat'}
          previewMode={previewMode}
          onPreviewModeChange={handlePreviewModeChange}
        />
      )}
      
      {/* Hero Section */}
      {currentStep === 'hero' && (
        <HeroSection 
          onIdeaSubmit={handleIdeaSubmit}
          onPricingShown={() => setHasSeenPricing(true)}
          expandChat={expandChat}
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
        />
      )}

      {/* Navbar Pricing Modal */}
      {showNavbarPricingModal && (
        <PricingModal 
          onPlanSelect={handleNavbarPlanSelect}
          onClose={() => setShowNavbarPricingModal(false)}
          onBookDemo={handleBookDemo}
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
        />
      )}

      {/* Ad Creatives Page */}
      {currentStep === 'ad-creatives' && adCreativesProjectId && (
        <AdCreativesPage 
          projectId={adCreativesProjectId}
          onNavigateToChat={(projectId) => {
            setRouteProjectId(projectId);
            setCurrentStep('chat');
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
      onBack={async () => {
            try { localStorage.setItem('jetsy_current_project_id', String(analyticsProjectId)); } catch {}
            // Re-gate on returning to chat
            try {
              const pw = prompt('Enter password to access /chat');
              if (!pw) { setCurrentStep('hero'); return; }
              const resp = await fetch(`${getApiBaseUrl()}/api/chat-password-verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: pw })
              });
              if (resp.ok) {
                const j = await resp.json().catch(() => ({}));
                if (j && j.ok) { setCurrentStep('chat'); return; }
              }
              setCurrentStep('hero');
            } catch {
              setCurrentStep('hero');
            }
          }}
        />
      )}

      {/* Exceptional Template */}
      {currentStep === 'template' && (
        <ExceptionalTemplate />
      )}

      {/* Footer */}
      {currentStep !== 'template' && currentStep !== 'public-route' && <Footer />}

    </div>
  )
}

export default App 