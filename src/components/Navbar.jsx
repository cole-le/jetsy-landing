import React, { useState } from 'react'

const Navbar = ({ onPricingClick, onFAQClick, onLogoClick, onGetStartedClick, onChatClick, onSaveChanges, isChatMode = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handlePricingClick = (e) => {
    e.preventDefault()
    if (onPricingClick) {
      onPricingClick()
    }
    setIsMobileMenuOpen(false)
  }

  const handleFAQClick = (e) => {
    e.preventDefault()
    if (onFAQClick) {
      onFAQClick()
    }
    setIsMobileMenuOpen(false)
  }

  const handleLogoClick = (e) => {
    e.preventDefault()
    if (onLogoClick) {
      onLogoClick()
    }
    setIsMobileMenuOpen(false)
  }

  const handleGetStartedClick = (e) => {
    e.preventDefault();
    if (onGetStartedClick) {
      onGetStartedClick();
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="relative bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className="flex items-center mr-auto">
            <button
              onClick={handleLogoClick}
              className="flex items-center hover:opacity-80 transition-opacity duration-200"
            >
              <img 
                src="/jetsy_colorful_transparent_horizontal.png" 
                alt="Jetsy" 
                className="h-8 sm:h-10 md:h-12 w-auto"
              />
            </button>
          </div>

          {/* Desktop Navigation and Account Actions */}
          {!isChatMode && (
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={onFAQClick}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                FAQ
              </button>
              <button
                onClick={onPricingClick}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={onChatClick}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Chat
              </button>
              <button 
                onClick={handleGetStartedClick}
                className="px-4 py-2 bg-accent hover:bg-buttonHover text-white rounded-lg transition-colors duration-200 font-semibold">
                Get started
              </button>
            </div>
          )}

          {/* Save Changes button (chat mode) or Mobile menu button */}
          {isChatMode ? (
            <div className="flex items-center">
              <button 
                onClick={onSaveChanges}
                className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors duration-200 font-semibold">
                Save Changes
              </button>
            </div>
          ) : (
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-text hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200/50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button 
                onClick={handlePricingClick}
                className="block w-full text-left px-3 py-2 text-text hover:text-accent transition-colors duration-200 font-medium"
              >
                Pricing
              </button>
              <button 
                onClick={handleFAQClick}
                className="block w-full text-left px-3 py-2 text-text hover:text-accent transition-colors duration-200 font-medium"
              >
                FAQ
              </button>
              <button 
                onClick={onChatClick}
                className="block w-full text-left px-3 py-2 text-text hover:text-accent transition-colors duration-200 font-medium"
              >
                Chat
              </button>
              <button 
                onClick={handleGetStartedClick}
                className="block w-full text-left px-3 py-2 bg-accent hover:bg-buttonHover text-white rounded-lg transition-colors duration-200 font-semibold">
                Get started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar 