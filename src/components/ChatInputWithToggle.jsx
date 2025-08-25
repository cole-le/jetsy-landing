import React, { useState, useEffect, useRef } from 'react'
import { trackEvent } from '../utils/analytics'
import PricingModal from './PricingModal'

const ChatInputWithToggle = ({ onSubmit, onPricingShown, expandChat }) => {
  const [idea, setIdea] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [showModal, setShowModal] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0)
  const [typingText, setTypingText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isReversing, setIsReversing] = useState(false)
  const modalRef = useRef(null)

  const baseText = "Ask Jetsy to create "
  const businessIdeas = [
    "a dog walking business 🐶",
    "a clothing brand 👕",
    "a subscription box service 📦",
    "a fitness coaching program 💪",
    "an online course marketplace 🎓",
    "a food delivery side hustle 🍔",
    "a SaaS tool for freelancers 💻",
    "a pet sitting service 🐾",
    "a language learning platform 🌍",
  ]

  // Safely split text into user-perceived characters (grapheme clusters)
  const getGraphemes = (text) => {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
      return Array.from(seg.segment(text), s => s.segment)
    }
    // Fallback: spread to code points (handles surrogate pairs, not full ZWJ sequences)
    try {
      return [...text]
    } catch (e) {
      return text.split('')
    }
  }

  // Typing animation effect
  useEffect(() => {
    let timeoutId
    
    const animateText = async () => {
      const currentIdea = businessIdeas[currentPlaceholderIndex]
      const graphemes = getGraphemes(currentIdea)
      
      // Type out the text
      setIsTyping(true)
      setIsReversing(false)
      
      for (let i = 0; i <= graphemes.length; i++) {
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, 100) // Typing speed
        })
        setTypingText(graphemes.slice(0, i).join(''))
      }
      
      // Wait a bit before reversing
      await new Promise(resolve => {
        timeoutId = setTimeout(resolve, 1500)
      })
      
      // Reverse the text
      setIsReversing(true)
      for (let i = graphemes.length; i >= 0; i--) {
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, 50) // Faster reverse speed
        })
        setTypingText(graphemes.slice(0, i).join(''))
      }
      
      // Move to next idea
      setCurrentPlaceholderIndex((prev) => (prev + 1) % businessIdeas.length)
    }

    animateText()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [currentPlaceholderIndex, businessIdeas.length])

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false)
      }
    }

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showModal])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (idea.trim()) {
      // Removed duplicate tracking - parent component will handle this
      onSubmit(idea.trim(), visibility)
    }
  }

  const handleVisibilityChange = (newVisibility) => {
    if (newVisibility === 'private') {
      setShowPricingModal(true)
      setShowModal(false)
      // Notify parent that pricing modal has been shown
      if (onPricingShown) {
        onPricingShown()
      }
    } else {
      setVisibility(newVisibility)
      setShowModal(false)
      trackEvent('visibility_toggle', { visibility: newVisibility })
    }
  }

  const currentPlaceholder = baseText + typingText + (isTyping && !isReversing ? '|' : '')

  return (
    <div className={`max-w-4xl mx-auto transition-transform duration-500 ${expandChat ? 'scale-105 shadow-2xl' : 'scale-100'} `} style={{ zIndex: expandChat ? 50 : 'auto' }}>
      <form onSubmit={handleSubmit} className="relative">
        <div className={`bg-white border border-gray-200 rounded-2xl shadow-lg p-3 relative transition-all duration-500 ${expandChat ? 'ring-4 ring-accent' : ''}` }>
          {/* Main Input Area */}
          <div className="flex items-start gap-4">
            {/* Chat Input */}
            <div className="flex-1">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder={currentPlaceholder}
                className="w-full px-4 py-2 bg-transparent border-none outline-none resize-none text-text placeholder-mutedText text-lg leading-normal min-h-[48px] md:min-h-[44px] max-h-[400px] md:max-h-[200px]"
                rows={3}
                style={{ fontFamily: 'inherit' }}
              />
            </div>
          </div>

          {/* Submit Button - Positioned in bottom right corner */}
          <button
            type="submit"
            disabled={!idea.trim()}
            className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors duration-200 flex-shrink-0 ${
              idea.trim() 
                ? 'bg-black hover:bg-gray-800' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            title="Submit idea"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 -960 960 960" className={`shrink-0 h-6 w-6 ${idea.trim() ? 'text-white' : 'text-gray-500'}`} fill="currentColor">
              <path d="M442.39-616.87 309.78-487.26q-11.82 11.83-27.78 11.33t-27.78-12.33q-11.83-11.83-11.83-27.78 0-15.96 11.83-27.79l198.43-199q11.83-11.82 28.35-11.82t28.35 11.82l198.43 199q11.83 11.83 11.83 27.79 0 15.95-11.83 27.78-11.82 11.83-27.78 11.83t-27.78-11.83L521.61-618.87v348.83q0 16.95-11.33 28.28-11.32 11.33-28.28 11.33t-28.28-11.33q-11.33-11.33-11.33-28.28z"></path>
            </svg>
          </button>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-4">
              {/* Visibility Toggle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowModal(!showModal)}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="flex items-center gap-2 px-3 py-2 text-mutedText hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 border border-gray-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  <span className="text-sm font-medium">
                    {visibility === 'public' ? 'Public' : 'Personal'}
                  </span>
                </button>

                {/* Tooltip */}
                {showTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-20">
                    Change project visibility
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change project visibility</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleVisibilityChange('public')}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 rounded-lg border border-gray-200 ${
                    visibility === 'public' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  <div>
                    <div className="font-semibold">Public</div>
                    <div className="text-sm text-gray-500 font-normal">Anyone can view and remix</div>
                  </div>
                  {visibility === 'public' && (
                    <svg className="w-5 h-5 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleVisibilityChange('private')}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 rounded-lg border border-gray-200 ${
                    visibility === 'private' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-semibold">Personal</div>
                    <div className="text-sm text-gray-500 font-normal">Only visible to yourself, unless shared</div>
                  </div>
                  {visibility === 'private' && (
                    <svg className="w-5 h-5 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricingModal && (
        <PricingModal
          onPlanSelect={(plan) => {
            setShowPricingModal(false)
            setVisibility('private')
            // Track the pricing plan selection event
            trackEvent('pricing_plan_select', { plan: plan.type })
          }}
          onClose={() => setShowPricingModal(false)}
          showUpgradeMessage={false}
          currentPlanType="free"
        />
      )}
    </div>
  )
}

export default ChatInputWithToggle 