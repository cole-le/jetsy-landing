import React, { useState } from 'react'
import { trackEvent } from '../utils/analytics'

const QueuePage = ({ email, phone, onPriorityAccessClick }) => {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePriorityAccessClick = async () => {
    setIsProcessing(true)
    // Removed duplicate tracking - parent component will handle this
    
    try {
      await onPriorityAccessClick()
    } catch (error) {
      console.error('Error processing priority access:', error)
      trackEvent('priority_access_error')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12 radial-bg">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          {/* Queue Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 text-orange-600 rounded-full mb-6">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold mb-4 text-text">Jetsy is being used heavily at the moment</h2>
          <p className="text-mutedText mb-6">We are letting people in one at a time to ensure the best experience for everyone.</p>
          
          {/* Priority Access Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-text">Skip the Queue</h3>
            <p className="text-mutedText mb-4">If you'd like to skip the queue and start using Jetsy right now, you can pay $25 for Priority Access.</p>
            
            <button
              onClick={handlePriorityAccessClick}
              disabled={isProcessing}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Purchase Priority Access - $25'
              )}
            </button>
          </div>
          
          {/* Queue Info */}
          <div className="text-sm text-mutedText">
            <p>Your position in queue: <span className="font-semibold text-text">#1,247</span></p>
            <p>Estimated wait time: <span className="font-semibold text-text">~2-3 hours</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QueuePage 