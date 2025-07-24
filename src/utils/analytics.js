// Enhanced analytics utility for Jetsy - supports both GTM and custom D1 tracking
export const trackEvent = (eventName, eventData = {}) => {
  const enrichedData = {
    ...eventData,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    sessionId: getSessionId(),
    pageTitle: document.title,
    referrer: document.referrer
  }

  // Send to GTM if available
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...enrichedData
    })
  }
  
  // Always send to our custom D1 tracking
  sendToCustomTracking(eventName, enrichedData)
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', eventName, enrichedData)
  }
}

// Send tracking data to our custom D1 backend
async function sendToCustomTracking(eventName, eventData) {
  try {
    const response = await fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventName,
        data: eventData,
        timestamp: eventData.timestamp,
        userAgent: eventData.userAgent,
        url: eventData.url
      })
    })
    
    if (!response.ok) {
      console.error('Failed to send tracking data to D1')
    }
  } catch (error) {
    console.error('Error sending tracking data to D1:', error)
  }
}

// Generate or retrieve session ID
function getSessionId() {
  let sessionId = sessionStorage.getItem('jetsy_session_id')
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    sessionStorage.setItem('jetsy_session_id', sessionId)
  }
  return sessionId
}

// Track page views with enhanced data
export const trackPageView = (pageName, additionalData = {}) => {
  trackEvent('page_view', { 
    page: pageName,
    page_load_time: performance.now(),
    ...additionalData 
  })
}

// Track button clicks with categorization
export const trackButtonClick = (buttonName, buttonCategory = 'general', additionalData = {}) => {
  trackEvent('button_click', { 
    button: buttonName,
    category: buttonCategory,
    ...additionalData 
  })
}

// Track form submissions with validation data
export const trackFormSubmit = (formName, formData = {}, additionalData = {}) => {
  trackEvent('form_submit', { 
    form: formName,
    field_count: Object.keys(formData).length,
    has_errors: additionalData.hasErrors || false,
    ...additionalData 
  })
}

// Track pricing interactions with conversion data
export const trackPricingInteraction = (action, planType, additionalData = {}) => {
  trackEvent('pricing_interaction', { 
    action,
    plan_type: planType,
    conversion_stage: additionalData.stage || 'view',
    ...additionalData 
  })
}

// Track user engagement metrics
export const trackEngagement = (metric, value, additionalData = {}) => {
  trackEvent('engagement', { 
    metric,
    value,
    ...additionalData 
  })
}

// Track conversion funnel steps
export const trackFunnelStep = (step, stepData = {}) => {
  trackEvent('funnel_step', { 
    step,
    step_number: stepData.stepNumber || 1,
    completion_percentage: stepData.completionPercentage || 0,
    ...stepData 
  })
}

// Track errors and issues
export const trackError = (errorType, errorMessage, additionalData = {}) => {
  trackEvent('error', { 
    error_type: errorType,
    error_message: errorMessage,
    ...additionalData 
  })
}

// Track performance metrics
export const trackPerformance = (metric, value, additionalData = {}) => {
  trackEvent('performance', { 
    metric,
    value,
    ...additionalData 
  })
}

// Auto-track common user interactions
export const initializeAutoTracking = () => {
  // Track scroll depth
  let maxScroll = 0
  window.addEventListener('scroll', () => {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent
      if (scrollPercent % 25 === 0) { // Track at 25%, 50%, 75%, 100%
        trackEngagement('scroll_depth', scrollPercent)
      }
    }
  })

  // Track time on page
  let startTime = Date.now()
  window.addEventListener('beforeunload', () => {
    const timeOnPage = Date.now() - startTime
    trackEngagement('time_on_page', timeOnPage)
  })

  // Track external link clicks
  document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.hostname !== window.location.hostname) {
      trackEvent('external_link_click', {
        url: e.target.href,
        link_text: e.target.textContent
      })
    }
  })
}

// Jetsy-specific tracking for generated websites
export const trackJetsyEvent = (eventName, websiteId, userId, eventData = {}) => {
  trackEvent(eventName, {
    website_id: websiteId,
    user_id: userId,
    jetsy_generated: true,
    ...eventData
  })
}

// Track website performance for Jetsy-generated sites
export const trackJetsyPerformance = (websiteId, metrics) => {
  trackEvent('jetsy_performance', {
    website_id: websiteId,
    metrics: metrics
  })
} 