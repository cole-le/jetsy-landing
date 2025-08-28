import React, { useState, useEffect, useRef } from 'react'
import { trackEvent } from '../utils/analytics'
import useBillingPlan from '../utils/useBillingPlan'
import PricingModal from './PricingModal'

const FloatingChatBox = ({ onClose, onExpand, onIdeaSubmit }) => {
  const [idea, setIdea] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [showDropdown, setShowDropdown] = useState(false)
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const { plan } = useBillingPlan()

  const placeholders = [
    'Describe your startup idea...',
    'What problem are you solving?',
    'Who is your target audience?',
    'What makes your solution unique?'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [placeholders.length])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!idea.trim()) return

    trackEvent('floating_chat_submit', { visibility })
    onIdeaSubmit(idea, visibility)
    setIdea('')
    setShowDropdown(false)
  }

  const handleVisibilityChange = (newVisibility) => {
    // If user is trying to set private visibility and is on free plan, show pricing modal
    if (newVisibility === 'private' && plan === 'free') {
      setShowPricingModal(true);
      setShowDropdown(false);
      return;
    }
    
    // Otherwise, proceed with normal visibility update
    setVisibility(newVisibility)
    setShowDropdown(false)
  }

  const handleClose = () => {
    trackEvent('floating_chat_close')
    onClose()
  }

  const handleExpand = () => {
    trackEvent('floating_chat_expand')
    onExpand()
  }

  return (
    <>
      <div className="chat-box animate-float">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-text">Jetsy AI</span>
            </div>
            <button
              onClick={handleClose}
              className="text-mutedText hover:text-text transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder={placeholders[currentPlaceholderIndex]}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-text placeholder-mutedText focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-mutedText hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
                >
                  <span>{visibility === 'public' ? 'Public' : 'Private'}</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      type="button"
                      onClick={() => handleVisibilityChange('public')}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-200 ${
                        visibility === 'public' ? 'text-accent bg-gray-50' : 'text-mutedText'
                      }`}
                    >
                      Public
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVisibilityChange('private')}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-200 ${
                        visibility === 'private' ? 'text-accent bg-gray-50' : 'text-mutedText'
                      }`}
                    >
                      Private
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!idea.trim()}
                className="px-4 py-2 bg-accent hover:bg-buttonHover disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors duration-200"
              >
                Send
              </button>
            </div>
          </form>

          {/* Info */}
          <p className="text-xs text-mutedText mt-2 font-normal">
            {visibility === 'public' ? 'Public project' : 'Private project - requires plan'}
          </p>
        </div>
      </div>

      {/* Pricing Modal for free users trying to set private visibility */}
      {showPricingModal && (
        <PricingModal
          onClose={() => setShowPricingModal(false)}
          showUpgradeMessage={true}
          upgradeTitle="Upgrade Required"
          upgradeDescription="You need to upgrade to a paid plan to switch project visibility to private."
          currentPlanType="free"
        />
      )}
    </>
  )
}

export default FloatingChatBox 