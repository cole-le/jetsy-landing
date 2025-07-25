import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { trackEvent } from '../utils/analytics'

const PricingModal = ({ onPlanSelect, onClose, showUpgradeMessage = false, onBookDemo }) => {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [isAnnual, setIsAnnual] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const plans = [
    {
      type: 'free',
      name: 'Free',
      price: 0,
      period: '/month',
      color: 'green',
      subtitle: 'Discover what Jetsy can do for you',
      features: [
        '5 daily credits (up to 30/month)',
        'Public projects',
      ],
      buttonText: 'Get Started',
      popular: false
    },
    {
      type: 'pro',
      name: 'Pro',
      price: isAnnual ? 21 : 25,
      period: isAnnual ? '/month (billed annually)' : '/month',
      color: 'blue',
      subtitle: 'Designed for fast-moving teams building together in real time.',
      features: [
        'Everything in Free, plus:',
        '100 monthly credits',
        '5 daily credits (up to 150/month)',
        'Private projects',
        'Custom domains',
      ],
      buttonText: 'Get Started',
      popular: true
    },
    {
      type: 'business',
      name: 'Business',
      price: isAnnual ? 42 : 50,
      period: isAnnual ? '/month (billed annually)' : '/month',
      color: 'purple',
      subtitle: 'Advanced controls and power features for growing departments',
      features: [
        'Everything in Pro, plus:',
        'Advanced analytics dashboard',
        'Real-time metrics (click heatmaps, scroll depth)',
        'Priority access to new features'
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
        'Dedicated support',
        'Onboarding services',
        'Custom integrations',
        'Group-based access control',
        'Custom design systems',
      ],
      buttonText: 'Book a Demo',
      popular: false
    }
  ]

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan)
    // Removed duplicate tracking - parent component will handle this
    onPlanSelect(plan)
  }

  const getColorClasses = (color) => {
    switch (color) {
      case 'green':
        return 'border-green-500 bg-green-50'
      case 'blue':
        return 'border-blue-500 bg-blue-50'
      case 'purple':
        return 'border-purple-500 bg-purple-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  const getButtonColor = (color) => {
    switch (color) {
      case 'green':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
      case 'purple':
        return 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
      default:
        return 'bg-accent hover:bg-buttonHover focus:ring-accent'
    }
  }

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* Upgrade Required Message */}
          {showUpgradeMessage && (
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-text">Upgrade required</h2>
              <p className="text-mutedText font-normal">You need to be on a business plan to make your project personal.</p>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-text">Choose Your Plan</h2>
            <p className="text-mutedText font-normal">Start validating your startup idea today</p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="text-sm text-mutedText">Annual billing gets</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">2 months free</span>
              <div className="flex items-center ml-4">
                <span className={`text-sm font-medium ${!isAnnual ? 'text-blue-600' : 'text-gray-400'}`}>Monthly</span>
                <button
                  className={`mx-2 w-10 h-6 flex items-center bg-gray-200 rounded-full p-1 transition-colors duration-200 focus:outline-none ${isAnnual ? 'bg-blue-500' : 'bg-gray-200'}`}
                  onClick={() => {
                    setIsAnnual((prev) => !prev)
                    trackEvent('pricing_toggle_annual', { annual: !isAnnual })
                  }}
                  aria-label="Toggle annual billing"
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full shadow transition-transform duration-200 ${isAnnual ? 'translate-x-4' : 'translate-x-0'}`}
                  />
                </button>
                <span className={`text-sm font-medium ${isAnnual ? 'text-blue-600' : 'text-gray-400'}`}>Annual</span>
              </div>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.type}
                className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 flex flex-col h-full ${
                  plan.popular ? 'border-blue-500 bg-blue-50 shadow-lg' : plan.type === 'enterprise' ? 'border-gray-400 bg-gray-50' : 'border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                    plan.color === 'green' ? 'bg-green-100 text-green-600' :
                    plan.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    plan.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {/* Icon logic unchanged for brevity */}
                    {plan.color === 'green' && (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {plan.color === 'blue' && (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {plan.color === 'purple' && (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {plan.color === 'gray' && (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-2-7a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-text">{plan.name}</h3>
                  <div className="mb-2">
                    {plan.price !== null ? (
                      <><span className="text-3xl font-bold text-text">${plan.price}</span><span className="text-mutedText font-normal">{plan.period}</span></>
                    ) : (
                      <span className="text-2xl font-bold text-text">Flexible Billing</span>
                    )}
                  </div>
                  <p className="text-sm text-mutedText font-medium">{plan.subtitle}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-text font-normal">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                {plan.type === 'enterprise' ? (
                  <button
                    onClick={() => {
                      if (onBookDemo) onBookDemo()
                      trackEvent('book_demo_click')
                    }}
                    className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white bg-gray-700 hover:bg-gray-800 text-white mt-auto"
                  >
                    {plan.buttonText}
                  </button>
                ) : (
                  <button
                    onClick={() => handlePlanSelect(plan)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white mt-auto ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white' 
                        : plan.type === 'free'
                        ? 'bg-white hover:bg-gray-50 focus:ring-blue-500 text-blue-600 border border-blue-600'
                        : getButtonColor(plan.color)
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Close Button */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="text-mutedText hover:text-text transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (!mounted) return null

  return createPortal(modalContent, document.body)
}

export default PricingModal 