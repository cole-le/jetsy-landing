// Jetsy Analytics Tracking Snippet
// This snippet is automatically injected into Jetsy-generated websites

(function() {
  'use strict';
  
  // Configuration
  const JETSY_CONFIG = {
    websiteId: '{{WEBSITE_ID}}', // Will be replaced by Jetsy
    userId: '{{USER_ID}}', // Will be replaced by Jetsy
    apiEndpoint: 'https://jetsy.com/api/jetsy-analytics', // Jetsy analytics endpoint
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    autoTrack: true
  };

  // Session management
  let sessionId = null;
  let sessionStartTime = Date.now();
  let lastActivity = Date.now();

  // Initialize session
  function initializeSession() {
    sessionId = sessionStorage.getItem('jetsy_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('jetsy_session_id', sessionId);
    }
    
    // Track session start
    trackEvent('session_start', {
      session_id: sessionId,
      website_id: JETSY_CONFIG.websiteId
    });
  }

  // Track events
  function trackEvent(eventName, eventData = {}) {
    const enrichedData = {
      ...eventData,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: sessionId,
      pageTitle: document.title,
      referrer: document.referrer,
      websiteId: JETSY_CONFIG.websiteId,
      userId: JETSY_CONFIG.userId
    };

    // Send to Jetsy analytics
    sendToJetsyAnalytics(eventName, enrichedData);
    
    // Log in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Jetsy Analytics Event:', eventName, enrichedData);
    }
  }

  // Send data to Jetsy analytics API
  async function sendToJetsyAnalytics(eventName, eventData) {
    try {
      const response = await fetch(JETSY_CONFIG.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteId: JETSY_CONFIG.websiteId,
          userId: JETSY_CONFIG.userId,
          sessionId: sessionId,
          event: eventName,
          data: eventData,
          timestamp: eventData.timestamp,
          userAgent: eventData.userAgent,
          url: eventData.url,
          category: getEventCategory(eventName),
          pageTitle: eventData.pageTitle,
          referrer: eventData.referrer,
          jetsyGenerated: true
        })
      });
      
      if (!response.ok) {
        console.error('Failed to send Jetsy analytics data');
      }
    } catch (error) {
      console.error('Error sending Jetsy analytics data:', error);
    }
  }

  // Categorize events
  function getEventCategory(eventName) {
    if (eventName.includes('page_view')) return 'page_view';
    if (eventName.includes('click')) return 'user_interaction';
    if (eventName.includes('submit')) return 'conversion';
    if (eventName.includes('scroll')) return 'engagement';
    if (eventName.includes('error')) return 'error';
    if (eventName.includes('performance')) return 'performance';
    return 'user_interaction';
  }

  // Auto-tracking functions
  function initializeAutoTracking() {
    if (!JETSY_CONFIG.autoTrack) return;

    // Track page view
    trackEvent('page_view', {
      page: window.location.pathname,
      page_load_time: performance.now()
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (scrollPercent % 25 === 0) {
          trackEvent('scroll_depth', { depth: scrollPercent });
        }
      }
      lastActivity = Date.now();
    });

    // Track button clicks
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
        const buttonText = e.target.textContent?.trim() || '';
        const buttonId = e.target.id || '';
        const buttonClass = e.target.className || '';
        
        trackEvent('button_click', {
          button_text: buttonText,
          button_id: buttonId,
          button_class: buttonClass,
          button_tag: e.target.tagName.toLowerCase()
        });
      }
      lastActivity = Date.now();
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      const formId = e.target.id || '';
      const formAction = e.target.action || '';
      const formMethod = e.target.method || 'POST';
      
      trackEvent('form_submit', {
        form_id: formId,
        form_action: formAction,
        form_method: formMethod,
        field_count: e.target.elements.length
      });
      lastActivity = Date.now();
    });

    // Track external link clicks
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && e.target.hostname !== window.location.hostname) {
        trackEvent('external_link_click', {
          url: e.target.href,
          link_text: e.target.textContent?.trim() || ''
        });
      }
    });

    // Track session end
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - sessionStartTime;
      trackEvent('session_end', {
        duration: sessionDuration,
        last_activity: lastActivity
      });
    });

    // Track performance metrics
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          if (perfData) {
            trackEvent('performance', {
              metrics: {
                page_load_time: perfData.loadEventEnd - perfData.loadEventStart,
                dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                first_byte: perfData.responseStart - perfData.requestStart,
                total_time: perfData.loadEventEnd - perfData.navigationStart
              }
            });
          }
        }, 1000);
      });
    }
  }

  // Public API for manual tracking
  window.JetsyAnalytics = {
    track: trackEvent,
    trackPageView: (pageName) => trackEvent('page_view', { page: pageName }),
    trackButtonClick: (buttonName, additionalData = {}) => 
      trackEvent('button_click', { button: buttonName, ...additionalData }),
    trackFormSubmit: (formName, additionalData = {}) => 
      trackEvent('form_submit', { form: formName, ...additionalData }),
    trackConversion: (conversionType, additionalData = {}) => 
      trackEvent('conversion', { type: conversionType, ...additionalData }),
    trackError: (errorType, errorMessage, additionalData = {}) => 
      trackEvent('error', { error_type: errorType, error_message: errorMessage, ...additionalData }),
    trackPerformance: (metric, value, additionalData = {}) => 
      trackEvent('performance', { metric, value, ...additionalData })
  };

  // Initialize tracking
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeSession();
      initializeAutoTracking();
    });
  } else {
    initializeSession();
    initializeAutoTracking();
  }

})(); 