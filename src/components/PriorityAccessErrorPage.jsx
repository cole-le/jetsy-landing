import React from 'react'
import { trackEvent } from '../utils/analytics'

const PriorityAccessErrorPage = ({ email, phone, onReset }) => {
  const handleReset = () => {
    trackEvent('priority_access_error_reset')
    onReset()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12 radial-bg">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          {/* Error Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-6">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold mb-4 text-text">We are so sorry</h2>
          <p className="text-mutedText mb-6">But our system is so heavily in demand, we will email you when you can start using Jetsy.</p>
          
          {/* Email Confirmation */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-text">We'll keep you updated</h3>
            <p className="text-mutedText mb-4">We've saved your information and will notify you at <span className="font-semibold text-text">{email}</span> when you can access Jetsy.</p>
          </div>
          
          {/* Next Steps */}
          <div className="text-left bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <h3 className="font-semibold mb-3 text-text">What happens next?</h3>
            <ul className="space-y-2 text-sm text-mutedText">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>We'll email you within 24-48 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>You'll get immediate access to Jetsy</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Start validating your startup idea right away</span>
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="btn btn-primary"
        >
          Start Another Test
        </button>
      </div>
    </div>
  )
}

export default PriorityAccessErrorPage 