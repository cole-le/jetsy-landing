import React, { useState, useEffect } from 'react'
import ChatInputWithToggle from './ChatInputWithToggle'
import CommunityShowcase from './CommunityShowcase'
import { trackEvent } from '../utils/analytics'

const HeroSection = ({ onIdeaSubmit, onPricingShown, expandChat, onShowSignup }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [currentProofIndex, setCurrentProofIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const proofTexts = [
    { text: "🌐 No code — just your idea, live", icon: "🌐" },
    { text: "📢 Real ads, real traffic", icon: "📢" },
    { text: "💵 Real proof: will it sell or not?", icon: "💵" }
  ]

  useEffect(() => {
    // Animate in the hero section
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Rotate proof texts on mobile with smooth transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      
      // Wait for fade out, then change text and fade in
      setTimeout(() => {
        setCurrentProofIndex((prev) => (prev + 1) % proofTexts.length)
        setIsTransitioning(false)
      }, 1000) // Increased to 1000ms for 1 second fade-out
    }, 3000) // Increased to 3 seconds to accommodate 2s display + 1s fade-out

    return () => clearInterval(interval)
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
        <div className={`mt-16 transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Mobile: Single rotating text with smooth transitions */}
          <div className="lg:hidden flex justify-center items-center">
            <div className="text-sm text-mutedText min-h-[1.5rem] flex items-center justify-center">
              <span 
                className={`transition-all duration-800 ease-in-out ${
                  isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
              >
                {proofTexts[currentProofIndex].text}
              </span>
            </div>
          </div>
          
          {/* Desktop: All three texts horizontally */}
          <div className="hidden lg:flex flex-wrap justify-center items-center gap-8 text-mutedText">
            {proofTexts.map((proof, index) => (
              <div key={index} className="flex items-center gap-2">
                <span>{proof.text}</span>
              </div>
            ))}
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