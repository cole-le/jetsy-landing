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
    <section className="min-h-screen flex items-start justify-center px-4 pt-8 md:pt-12 pb-12 relative lovable-gradient">
      <div className="max-w-screen-xl mx-auto text-center relative z-10">


        {/* Headline */}
        <h1 className={`text-3xl md:text-5xl font-bold mb-6 mt-2 md:mt-6 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <img
            src="/jetsy_colorful_transparent_horizontal.png"
            alt="Jetsy logo"
            className="inline-block h-16 md:h-20 align-middle mr-3 relative -top-[6px] md:-top-[4px]"
          />
          <span className="text-gradient"> a Business Today </span>
        </h1>

        {/* Subheadline */}
        <p className={`text-lg md:text-xl text-mutedText mb-12 max-w-3xl mx-auto leading-relaxed font-medium transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        Create website, run ads, and see if people pay — all in 24 hours with AI
        </p>

        {/* Chat Input with Toggle */}
        <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <ChatInputWithToggle onSubmit={handleIdeaSubmit} onPricingShown={onPricingShown} expandChat={expandChat} />
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
    </section>
  )
}

export default HeroSection 