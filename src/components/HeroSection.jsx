import React, { useState, useEffect } from 'react'
import ChatInputWithToggle from './ChatInputWithToggle'
import CommunityShowcase from './CommunityShowcase'
import { trackEvent } from '../utils/analytics'

const HeroSection = ({ onIdeaSubmit, onPricingShown, expandChat, onShowSignup }) => {
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
    <section className="min-h-screen flex flex-col items-start justify-start px-4 pt-8 md:pt-12 pb-12 relative">
      {/* Mobile-specific background container */}
      <div className="mobile-top-gradient absolute inset-0 pointer-events-none"></div>
      
      {/* Desktop background */}
      <div className="hidden lg:block lovable-gradient absolute inset-0 pointer-events-none"></div>
      
      <div className="max-w-screen-xl mx-auto text-center relative z-10 w-full">

        {/* Headline */}
        <h1 className={`text-3xl md:text-5xl font-bold mb-6 mt-2 md:mt-6 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <img
            src="/jetsy_colorful_transparent_horizontal.png"
            alt="Jetsy logo"
            className="inline-block h-16 md:h-20 align-middle mr-0 relative -top-[6px] md:-top-[4px]"
          />
          <span className="text-gradient"> a Business Today </span>
        </h1>

        {/* Subheadline */}
        <p className={`text-lg md:text-xl text-mutedText mb-12 max-w-3xl mx-auto leading-relaxed font-medium transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        Create website, run ads, and see if people pay — all in 24 hours with AI
        </p>

        {/* Chat Input with Toggle */}
        <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <ChatInputWithToggle onSubmit={handleIdeaSubmit} onPricingShown={onPricingShown} expandChat={expandChat} onShowSignup={onShowSignup} />
        </div>

        {/* Trust indicators */}
        <div className={`mt-16 flex flex-wrap justify-center items-center gap-8 text-mutedText transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center gap-2">
            <span>🌐 No code — just your idea, live</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📢 Real ads, real traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💵 Real proof: will it sell or not?</span>
          </div>
        </div>
      </div>

      {/* Community Showcase - positioned to be visible like Lovable website */}
      <div className={`w-full mt-16 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <CommunityShowcase />
      </div>
    </section>
  )
}

export default HeroSection 