import React, { useState, useEffect } from 'react'
import ChatInputWithToggle from './ChatInputWithToggle'
import { trackEvent } from '../utils/analytics'

const HeroSection = ({ onIdeaSubmit, onPricingShown, expandChat }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in the hero section
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleIdeaSubmit = (idea, visibility) => {
    // Removed duplicate tracking - parent component will handle this
    onIdeaSubmit(idea, visibility)
  }

  return (
    <section className="min-h-screen flex items-start justify-center px-4 pt-20 pb-12 relative lovable-gradient">
      <div className="max-w-screen-xl mx-auto text-center relative z-10">


        {/* Headline */}
        <h1 className={`text-3xl md:text-5xl font-bold mb-6 mt-12 md:mt-24 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
           Would anyone pay 💸 {' '}
          <span className="text-gradient">for your idea?</span>
        </h1>

        {/* Subheadline */}
        <p className={`text-lg md:text-xl text-mutedText mb-12 max-w-3xl mx-auto leading-relaxed font-medium transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        Jetsy launches landing pages and ads to validate your startup idea quickly
        </p>

        {/* Chat Input with Toggle */}
        <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <ChatInputWithToggle onSubmit={handleIdeaSubmit} onPricingShown={onPricingShown} expandChat={expandChat} />
        </div>

        {/* Trust indicators */}
        <div className={`mt-16 flex flex-wrap justify-center items-center gap-8 text-mutedText transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>No code required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Save time building something no one wants</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>See real purchase intent</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection 