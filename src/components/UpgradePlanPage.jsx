import React, { useState, useEffect, useRef } from 'react';
import { trackEvent } from '../utils/analytics';
import { useAuth } from './auth/AuthProvider';
import { getApiBaseUrl } from '../config/environment';
import WorkflowProgressBar from './WorkflowProgressBar';
import useBillingPlan from '../utils/useBillingPlan';

const UpgradePlanPage = ({ onBackToChat, onNavigateToProfile }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const { plan } = useBillingPlan();
  const plansContainerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    
    // Check for billing success from Stripe redirect
    const urlParams = new URLSearchParams(window.location.search);
    const billingSuccess = urlParams.get('billing');
    const planParam = urlParams.get('plan');
    
    if (billingSuccess === 'success' && planParam) {
      // Update URL to chat page with success parameters
      const chatUrl = `/chat?billing=success&plan=${encodeURIComponent(planParam)}`;
      window.history.pushState({}, '', chatUrl);
      
      // Call the parent handler to navigate to chat
      onBackToChat();
      return;
    }
    
    return () => setMounted(false);
  }, [onBackToChat]);

  // On mobile, scroll to the user's current plan card when the modal opens
  useEffect(() => {
    if (!mounted) return;
    if (!plan) return;
    // Tailwind md breakpoint is ~768px; treat below that as mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (!isMobile) return;
    // Wait for layout
    const id = window.setTimeout(() => {
      try {
        const el = document.querySelector(`[data-plan-card="${plan}"]`);
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch {}
    }, 50);
    return () => window.clearTimeout(id);
  }, [mounted, plan]);

  const plans = [
    {
      type: 'free',
      name: 'Free',
      price: 0,
      period: '/month',
      color: 'green',
      subtitle: 'Discover what Jetsy can do for you',
      features: [
        '15 credits',
        'Public projects',
      ],
      buttonText: 'Get Started',
      popular: false
    },
    {
      type: 'pro',
      name: 'Pro',
      price: 25,
      period: '/month',
      color: 'blue',
      subtitle: 'Designed for fast-moving teams building together in real time.',
      features: [
        'Everything in Free, plus:',
        '100 monthly credits',
        'Private projects',
        'Custom website domains',
      ],
      buttonText: 'Get Started',
      popular: true
    },
    {
      type: 'business',
      name: 'Business',
      price: 50,
      period: '/month',
      color: 'purple',
      subtitle: 'Advanced controls and power features for growing departments',
      features: [
        'Everything in Pro, plus:',
        '300 monthly credits',
      ],
      buttonText: 'Get Started',
      popular: false
    },
    {
      type: 'enterprise',
      name: 'Enterprise',
      price: null,
      period: '',
      color: 'gray',
      subtitle: 'For organizations with advanced needs',
      features: [
        'Custom credits',
        'Dedicated support',
        'Custom integrations',
        'Group-based access control',
      ],
      buttonText: 'Book a Demo',
      popular: false
    }
  ];

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    // Removed duplicate tracking - parent component will handle this
    if (plan.type === 'pro' || plan.type === 'business') {
      startCheckout(plan.type);
    }
  };

  const startCheckout = async (planType) => {
    try {
      if (!isAuthenticated || !user?.id) {
        // Not authenticated: go to Create Account flow via parent handler
        if (onPlanSelect) {
          onPlanSelect({ type: planType });
        }
        return;
      }
      setLoadingPlan(planType);
      trackEvent('upgrade_click', { plan: planType });
      // Capture the current location to return after Stripe checkout
      const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const res = await fetch(`${getApiBaseUrl()}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planType, user_id: user.id, mode: 'subscription', return_to: returnTo })
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        console.error('Failed to create checkout session:', data);
        alert(data?.error || 'Failed to start checkout. Please try again.');
        setLoadingPlan(null);
        return;
      }
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Unexpected error. Please try again.');
      setLoadingPlan(null);
    }
  };

  const getColorClasses = (color) => {
    switch (color) {
      case 'green':
        return 'border-green-500 bg-green-50';
      case 'blue':
        return 'border-blue-500 bg-blue-50';
      case 'purple':
        return 'border-purple-500 bg-purple-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getButtonColor = (color) => {
    switch (color) {
      case 'green':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
      case 'purple':
        return 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500';
      default:
        return 'bg-accent hover:bg-buttonHover focus:ring-accent';
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navbar-like structure */}
      <nav className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center h-16">
          {/* Logo - positioned at far left with some padding */}
          <div className="flex items-center pl-3 sm:pl-6 lg:pl-8 flex-shrink-0 min-w-[72px]">
            <button 
              onClick={onBackToChat}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity flex-shrink-0"
            >
              <img 
                src="/jetsy_colorful_transparent_horizontal.png" 
                alt="Jetsy" 
                className="h-8 sm:h-10 md:h-12 w-auto flex-shrink-0"
              />
            </button>
          </div>

          {/* Centered container for workflow bar */}
          <div className="flex-1 flex justify-center">
            <div className="max-w-7xl w-full px-2 sm:px-4 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Left side - Empty for balance when workflow bar is centered */}
                <div className="flex items-center">
                  {/* This div is intentionally empty to balance the layout */}
                </div>

                {/* Center - Workflow Progress Bar */}
                <div className="flex items-center justify-center flex-1">
                  <div className="flex items-center space-x-4 flex-nowrap">
                    <WorkflowProgressBar 
                      currentStage={1}
                      projectId={null}
                      websiteDeployed={false}
                      adsExist={false}
                      hasTemplateData={false}
                      onStageClick={(stageId) => {
                        if (stageId === 1) {
                          onBackToChat();
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Right side - Profile icon */}
                <div className="flex items-center pr-3 sm:pr-6 lg:pr-8">
                  <button
                    onClick={onNavigateToProfile}
                    className="p-2 rounded-full hover:bg-gray-100 border border-gray-200"
                    title={user?.email || 'Account'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-700">
                      <path fillRule="evenodd" d="M12 2a5 5 0 100 10 5 5 0 000-10zm-7 17a7 7 0 1114 0v1H5v-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upgrade Required Message */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Upgrade Required</h2>
          <p className="text-lg text-gray-600 mb-2">You need to upgrade to a paid plan to connect your own custom domain name to your website</p>
          <p className="text-sm text-gray-500">Choose a plan below to unlock custom domain functionality and more features</p>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-gray-900">Choose Your Plan</h2>
          <p className="text-gray-600">Idea into Business in 24 hours 🚀</p>
        </div>

        {/* Plans Grid */}
        <div ref={plansContainerRef} className="grid md:grid-cols-4 gap-6 mb-8">
          {plans.map((planItem) => (
            <div
              key={planItem.type}
              data-plan-card={planItem.type}
              className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 flex flex-col h-full ${
                planItem.popular ? 'border-blue-500 bg-blue-50 shadow-lg' : planItem.type === 'enterprise' ? 'border-gray-400 bg-gray-50' : 'border-gray-200 bg-white'
              }`}
            >
              {planItem.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                  planItem.color === 'green' ? 'bg-green-100 text-green-600' :
                  planItem.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  planItem.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {planItem.color === 'green' && (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {planItem.color === 'blue' && (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {planItem.color === 'purple' && (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {planItem.color === 'gray' && (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-2-7a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{planItem.name}</h3>
                <div className="mb-2">
                  {planItem.price !== null ? (
                    <><span className="text-3xl font-bold text-gray-900">${planItem.price}</span><span className="text-gray-600">{planItem.period}</span></>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">Flexible Billing</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6 flex-1">
                {planItem.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button or Current Plan Label */}
              {planItem.type === plan ? (
                <div className="w-full py-3 px-4 rounded-lg font-semibold bg-gray-100 text-gray-600 border border-gray-300 text-center mt-auto">
                  Your current plan
                </div>
              ) : planItem.type === 'enterprise' ? (
                <button
                  onClick={() => {
                    trackEvent('book_demo_click');
                    // For now, just show an alert - you can implement demo booking later
                    alert('Please contact us for enterprise pricing and demo booking.');
                  }}
                  className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white bg-gray-700 hover:bg-gray-800 text-white mt-auto"
                >
                  {planItem.buttonText}
                </button>
              ) : (
                // Hide Free plan CTA when the user is already on a paid plan
                (plan && plan !== 'free' && planItem.type === 'free') ? (
                  <div className="mt-auto h-10" />
                ) : (
                  <button
                    onClick={() => handlePlanSelect(planItem)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white mt-auto ${
                      planItem.popular 
                        ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white' 
                        : planItem.type === 'free'
                        ? 'bg-white hover:bg-gray-50 focus:ring-blue-500 text-blue-600 border border-blue-600'
                        : getButtonColor(planItem.color)
                    }`}
                    disabled={loadingPlan === planItem.type}
                  >
                    {loadingPlan === planItem.type ? 'Redirecting…' : planItem.buttonText}
                  </button>
                )
              )}
            </div>
          ))}
        </div>

        {/* Back to Chat Button */}
        <div className="text-center">
          <button
            onClick={onBackToChat}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium"
          >
            ← Back to Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePlanPage;
