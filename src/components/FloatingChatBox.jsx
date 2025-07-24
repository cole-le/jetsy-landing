import React, { useState, useEffect } from 'react'
import { trackEvent } from '../utils/analytics'

const FloatingChatBox = ({ onIdeaSubmit, onClose }) => {
  const [idea, setIdea] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [showDropdown, setShowDropdown] = useState(false)
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)

  const placeholders = [
    "Build a job board for musicians",
    "Launch a fitness AI coach", 
    "Create a Chrome extension for book lovers"
  ]

  // Rotate placeholders every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [placeholders.length])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (idea.trim()) {
      trackEvent('floating_chat_submit', { 
        idea_length: idea.length,
        visibility 
      })
      onIdeaSubmit(idea.trim(), visibility)
    }
  }

  const handleVisibilityChange = (newVisibility) => {
    setVisibility(newVisibility)
    setShowDropdown(false)
    trackEvent('floating_visibility_toggle', { visibility: newVisibility })
  }

  const handleExpand = () => {
    setIsExpanded(true)
    trackEvent('floating_chat_expand')
  }

  const handleClose = () => {
    setIsExpanded(false)
    setIdea('')
    onClose()
    trackEvent('floating_chat_close')
  }

  if (!isExpanded) {
    return (
      <div className="chat-box animate-float">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
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
          <p className="text-sm text-mutedText mb-3 font-normal">
            What startup idea do you want to validate?
          </p>
          <button
            onClick={handleExpand}
            className="w-full px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-buttonHover transition-colors duration-200"
          >
            Start typing...
          </button>
        </div>
      </div>
    )
  }

  return (
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
  )
}

export default FloatingChatBox 