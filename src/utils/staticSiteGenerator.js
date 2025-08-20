/**
 * Static Site Generator for Jetsy
 * Renders React components to static HTML/CSS/JS for Vercel deployment
 */

// Template for the static HTML document
export const createStaticHTMLTemplate = (templateData, projectId) => {
  const { 
    businessName = 'My Business',
    seoTitle,
    businessLogoUrl,
    tagline = '',
    heroDescription = '',
    ctaButtonText = 'Get Started',
    contactInfo = {}
  } = templateData;

  const title = seoTitle || `${businessName} - ${tagline}`;
  const description = heroDescription || `${businessName} - ${tagline}`;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:type" content="website">
    ${businessLogoUrl ? `<meta property="og:image" content="${escapeHtml(businessLogoUrl)}">` : ''}
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    ${businessLogoUrl ? `<meta name="twitter:image" content="${escapeHtml(businessLogoUrl)}">` : ''}
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/favicon.png">
    
    <!-- Tailwind CSS CDN for styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Custom CSS for enhanced styling -->
    <style>
        /* Custom styles for better visual appeal */
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .hero-overlay {
            background: rgba(0, 0, 0, 0.6);
        }
        
        .glass-effect {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .animate-fade-in {
            animation: fadeIn 0.8s ease-out;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .loading-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Main content container -->
    <div id="root">
        <!-- Content will be rendered here -->
    </div>
    
    <!-- Lead capture form success/error messages -->
    <div id="form-messages" class="fixed top-4 right-4 z-50"></div>
    
    <!-- JavaScript for form handling and interactivity -->
    <script>
        // Configuration
        const JETSY_API_BASE = '${getApiBaseUrl()}';
        const PROJECT_ID = '${projectId}';
        const TEMPLATE_DATA = ${JSON.stringify(templateData)};
        
        // Utility functions
        function showMessage(message, type = 'success') {
            const messagesContainer = document.getElementById('form-messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = \`p-4 rounded-lg shadow-lg \${
                type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            } animate-fade-in\`;
            messageDiv.textContent = message;
            
            messagesContainer.appendChild(messageDiv);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }
        
        function showLoading(element) {
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner inline-block mr-2';
            element.prepend(spinner);
            element.disabled = true;
        }
        
        function hideLoading(element) {
            const spinner = element.querySelector('.loading-spinner');
            if (spinner) spinner.remove();
            element.disabled = false;
        }
        
        // Lead form submission handler
        async function submitLeadForm(formData) {
            try {
                const response = await fetch(\`\${JETSY_API_BASE}/api/leads\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...formData,
                        project_id: PROJECT_ID,
                        source: 'vercel_deployment'
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to submit form');
                }
                
                const result = await response.json();
                return { success: true, data: result };
            } catch (error) {
                console.error('Form submission error:', error);
                return { success: false, error: error.message };
            }
        }
        
        // Contact form submission handler
        async function submitContactForm(formData) {
            try {
                const response = await fetch(\`\${JETSY_API_BASE}/api/contact\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...formData,
                        project_id: PROJECT_ID,
                        source: 'vercel_deployment'
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to submit contact form');
                }
                
                const result = await response.json();
                return { success: true, data: result };
            } catch (error) {
                console.error('Contact form submission error:', error);
                return { success: false, error: error.message };
            }
        }
        
        // Analytics tracking
        function trackEvent(eventName, eventData = {}) {
            fetch(\`\${JETSY_API_BASE}/api/track\`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: eventName,
                    data: { project_id: PROJECT_ID, ...eventData },
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    category: 'user_interaction',
                    sessionId: getSessionId(),
                    pageTitle: document.title,
                    referrer: document.referrer,
                    websiteId: PROJECT_ID,
                    userId: PROJECT_ID,
                    jetsyGenerated: true
                })
            }).catch(error => {
                console.error('Analytics tracking error:', error);
            });
        }
        
        // Session management
        function getSessionId() {
            let sessionId = sessionStorage.getItem('jetsy_session_id');
            if (!sessionId) {
                sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem('jetsy_session_id', sessionId);
            }
            return sessionId;
        }
        
        // Initialize page
        document.addEventListener('DOMContentLoaded', () => {
            // Track page view
            trackEvent('page_view', {
                page_title: document.title,
                referrer: document.referrer
            });
            
            // Add smooth scrolling to all anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
            
            // Track CTA button clicks
            document.querySelectorAll('.cta-button').forEach(button => {
                button.addEventListener('click', () => {
                    trackEvent('pricing_plan_select', {
                        button_text: button.textContent,
                        button_location: button.getAttribute('data-location') || 'unknown',
                        plan_type: 'cta_button'
                    });
                });
            });
        });
    </script>
</body>
</html>`;
};

// Utility function to escape HTML special characters
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Get API base URL (same logic as in environment.js)
function getApiBaseUrl() {
  // In static deployment, we'll use the production Jetsy worker API
  return 'https://jetsy-landing.jetsydev.workers.dev';
}

// Generate the static React component content as HTML string
export const generateStaticComponentHTML = (templateData) => {
  const {
    businessName = 'My Business',
    businessLogoUrl,
    tagline = '',
    heroDescription = '',
    ctaButtonText = 'Get Started',
    sectionType = 'features',
    sectionTitle = '',
    sectionSubtitle = '',
    features = [],
    aboutContent = '',
    pricing = [],
    contactInfo = {},
    trustIndicator1 = '',
    trustIndicator2 = '4.8/5 customer satisfaction rating',
    heroBadge = '',
    aboutSectionTitle = 'About Us',
    aboutSectionSubtitle = '',
    aboutBenefits = [],
    pricingSectionTitle = 'Pricing',
    pricingSectionSubtitle = '',
    contactSectionTitle = 'Contact Us',
    contactSectionSubtitle = '',
    contactFormPlaceholders = {},
    footerDescription = '',
    footerProductLinks = [],
    footerCompanyLinks = [],
    heroBackgroundImage,
    aboutBackgroundImage,
    showLeadPhoneField = true,
    showHeroSection = true,
    showHeroBadge = true,
    showHeroCTA = true,
    showHeroSocialProof = true,
    showDynamicSection = true,
    showSectionTitle = true,
    showSectionSubtitle = true,
    showAboutSection = true,
    showAboutTitle = true,
    showAboutSubtitle = true,
    showAboutBenefits = true,
    showPricingSection = true,
    showPricingTitle = true,
    showPricingSubtitle = true,
    showContactSection = true,
    showContactTitle = true,
    showContactSubtitle = true,
    showContactInfoList = true,
    showContactForm = true,
    showFooter = true
  } = templateData;

  // Generate hero section
  const heroSection = showHeroSection ? `
    <section class="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      ${heroBackgroundImage ? `
        <div class="absolute inset-0 bg-cover bg-center bg-no-repeat hero-overlay" style="background-image: url('${heroBackgroundImage}')"></div>
        <div class="absolute inset-0 hero-overlay"></div>
      ` : ''}
      
      <div class="relative z-10 max-w-6xl mx-auto px-4 text-center animate-fade-in">
        ${businessLogoUrl ? `
          <img src="${businessLogoUrl}" alt="${businessName} Logo" class="h-16 w-auto mx-auto mb-6">
        ` : ''}
        
        ${showHeroBadge && heroBadge ? `
          <div class="inline-block px-4 py-2 bg-blue-500 bg-opacity-20 rounded-full text-sm font-medium mb-6 glass-effect">
            ${escapeHtml(heroBadge)}
          </div>
        ` : ''}
        
        <h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          ${escapeHtml(businessName)}
        </h1>
        
        ${tagline ? `
          <p class="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            ${escapeHtml(tagline)}
          </p>
        ` : ''}
        
        ${heroDescription ? `
          <p class="text-lg md:text-xl mb-8 text-gray-200 max-w-4xl mx-auto leading-relaxed">
            ${escapeHtml(heroDescription)}
          </p>
        ` : ''}
        
        ${showHeroCTA ? `
          <div class="space-y-4 mb-12">
            <button class="cta-button px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg transition-all duration-300 hover-lift" data-location="hero">
              ${escapeHtml(ctaButtonText)}
            </button>
          </div>
        ` : ''}
        
        ${showHeroSocialProof && (trustIndicator1 || trustIndicator2) ? `
          <div class="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-8 text-sm text-blue-200">
            ${trustIndicator1 ? `<span>✓ ${escapeHtml(trustIndicator1)}</span>` : ''}
            ${trustIndicator2 ? `<span>✓ ${escapeHtml(trustIndicator2)}</span>` : ''}
          </div>
        ` : ''}
      </div>
    </section>
  ` : '';

  // Generate features section
  const featuresSection = showDynamicSection && sectionType === 'features' && features.length > 0 ? `
    <section class="py-20 bg-white">
      <div class="max-w-6xl mx-auto px-4">
        ${showSectionTitle && sectionTitle ? `
          <h2 class="text-4xl font-bold text-center text-gray-900 mb-4">
            ${escapeHtml(sectionTitle)}
          </h2>
        ` : ''}
        
        ${showSectionSubtitle && sectionSubtitle ? `
          <p class="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            ${escapeHtml(sectionSubtitle)}
          </p>
        ` : ''}
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${features.map(feature => `
            <div class="text-center p-6 rounded-lg hover-lift">
              ${feature.icon ? `
                <div class="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                  ${feature.icon}
                </div>
              ` : ''}
              <h3 class="text-xl font-semibold text-gray-900 mb-3">
                ${escapeHtml(feature.title || '')}
              </h3>
              <p class="text-gray-600 leading-relaxed">
                ${escapeHtml(feature.description || '')}
              </p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  ` : '';

  // Generate about section
  const aboutSection = showAboutSection ? `
    <section class="py-20 ${aboutBackgroundImage ? 'relative' : 'bg-gray-50'}">
      ${aboutBackgroundImage ? `
        <div class="absolute inset-0 bg-cover bg-center bg-no-repeat" style="background-image: url('${aboutBackgroundImage}')"></div>
        <div class="absolute inset-0 bg-black bg-opacity-60"></div>
      ` : ''}
      
      <div class="relative z-10 max-w-6xl mx-auto px-4">
        <div class="text-center mb-16">
          ${showAboutTitle ? `
            <h2 class="text-4xl font-bold ${aboutBackgroundImage ? 'text-white' : 'text-gray-900'} mb-4">
              ${escapeHtml(aboutSectionTitle)}
            </h2>
          ` : ''}
          
          ${showAboutSubtitle && aboutSectionSubtitle ? `
            <p class="text-xl ${aboutBackgroundImage ? 'text-gray-200' : 'text-gray-600'} max-w-3xl mx-auto">
              ${escapeHtml(aboutSectionSubtitle)}
            </p>
          ` : ''}
        </div>
        
        ${aboutContent ? `
          <div class="prose prose-lg mx-auto mb-12 ${aboutBackgroundImage ? 'text-white' : 'text-gray-700'}">
            ${escapeHtml(aboutContent).replace(/\\n/g, '<br>')}
          </div>
        ` : ''}
        
        ${showAboutBenefits && aboutBenefits.length > 0 ? `
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${aboutBenefits.map(benefit => `
              <div class="flex items-start space-x-3 p-4 ${aboutBackgroundImage ? 'bg-white bg-opacity-10 glass-effect' : 'bg-white'} rounded-lg">
                <div class="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <span class="${aboutBackgroundImage ? 'text-white' : 'text-gray-700'} font-medium">
                  ${escapeHtml(benefit)}
                </span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </section>
  ` : '';

  // Generate pricing section
  const pricingSection = showPricingSection && pricing.length > 0 ? `
    <section class="py-20 bg-white">
      <div class="max-w-6xl mx-auto px-4">
        ${showPricingTitle ? `
          <h2 class="text-4xl font-bold text-center text-gray-900 mb-4">
            ${escapeHtml(pricingSectionTitle)}
          </h2>
        ` : ''}
        
        ${showPricingSubtitle && pricingSectionSubtitle ? `
          <p class="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            ${escapeHtml(pricingSectionSubtitle)}
          </p>
        ` : ''}
        
        <div class="grid md:grid-cols-${Math.min(pricing.length, 3)} gap-8 max-w-5xl mx-auto">
          ${pricing.map((plan, index) => `
            <div class="relative p-8 bg-white border-2 ${plan.featured ? 'border-blue-500 shadow-xl scale-105' : 'border-gray-200'} rounded-lg hover-lift">
              ${plan.featured ? `
                <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span class="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              ` : ''}
              
              <div class="text-center">
                <h3 class="text-2xl font-bold text-gray-900 mb-4">
                  ${escapeHtml(plan.name || '')}
                </h3>
                
                <div class="mb-6">
                  <span class="text-4xl font-bold text-gray-900">
                    ${escapeHtml(plan.price || '')}
                  </span>
                  ${(plan.showPeriod !== false && plan.period) ? `
                    <span class="text-gray-600">/${escapeHtml(plan.period)}</span>
                  ` : ''}
                </div>
                
                ${plan.description ? `
                  <p class="text-gray-600 mb-6">
                    ${escapeHtml(plan.description)}
                  </p>
                ` : ''}
                
                ${plan.features && plan.features.length > 0 ? `
                  <ul class="space-y-3 mb-8 text-left">
                    ${plan.features.map(feature => `
                      <li class="flex items-center">
                        <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        ${escapeHtml(feature)}
                      </li>
                    `).join('')}
                  </ul>
                ` : ''}
                
                <button class="cta-button w-full py-3 px-6 ${plan.featured ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} font-semibold rounded-lg transition-all duration-300" data-location="pricing">
                  ${escapeHtml(plan.ctaText || ctaButtonText)}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  ` : '';

  // Generate contact section
  const contactSection = showContactSection ? `
    <section class="py-20 bg-gray-50">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center mb-16">
          ${showContactTitle ? `
            <h2 class="text-4xl font-bold text-gray-900 mb-4">
              ${escapeHtml(contactSectionTitle)}
            </h2>
          ` : ''}
          
          ${showContactSubtitle && contactSectionSubtitle ? `
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              ${escapeHtml(contactSectionSubtitle)}
            </p>
          ` : ''}
        </div>
        
        <div class="grid lg:grid-cols-2 gap-12">
          ${showContactInfoList ? `
            <div class="space-y-6">
              <h3 class="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h3>
              
              ${contactInfo.email ? `
                <div class="flex items-center space-x-3">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-gray-700">${escapeHtml(contactInfo.email)}</span>
                </div>
              ` : ''}
              
              ${contactInfo.phone ? `
                <div class="flex items-center space-x-3">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span class="text-gray-700">${escapeHtml(contactInfo.phone)}</span>
                </div>
              ` : ''}
              
              ${contactInfo.address ? `
                <div class="flex items-start space-x-3">
                  <svg class="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span class="text-gray-700">${escapeHtml(contactInfo.address)}</span>
                </div>
              ` : ''}
            </div>
          ` : ''}
          
          ${showContactForm ? `
            <div class="bg-white p-8 rounded-lg shadow-lg">
              <form id="contact-form" class="space-y-6">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                    ${escapeHtml(contactFormPlaceholders.name || 'Name')}
                  </label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    required 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="${escapeHtml(contactFormPlaceholders.name || 'Your name')}"
                  >
                </div>
                
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                    ${escapeHtml(contactFormPlaceholders.email || 'Email')}
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="${escapeHtml(contactFormPlaceholders.email || 'your@email.com')}"
                  >
                </div>
                
                ${showLeadPhoneField ? `
                  <div>
                    <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                      ${escapeHtml(contactFormPlaceholders.phone || 'Phone')}
                    </label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="${escapeHtml(contactFormPlaceholders.phone || 'Your phone number')}"
                    >
                  </div>
                ` : ''}
                
                <div>
                  <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
                    ${escapeHtml(contactFormPlaceholders.message || 'Message')}
                  </label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows="4" 
                    required 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="${escapeHtml(contactFormPlaceholders.message || 'Tell us about your project...')}"
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  class="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 hover-lift"
                >
                  Send Message
                </button>
              </form>
            </div>
          ` : ''}
        </div>
      </div>
    </section>
  ` : '';

  // Generate footer
  const footer = showFooter ? `
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-6xl mx-auto px-4">
        <div class="grid md:grid-cols-4 gap-8">
          <div class="md:col-span-2">
            ${businessLogoUrl ? `
              <img src="${businessLogoUrl}" alt="${businessName} Logo" class="h-12 w-auto mb-4">
            ` : `
              <h3 class="text-2xl font-bold mb-4">${escapeHtml(businessName)}</h3>
            `}
            
            ${footerDescription ? `
              <p class="text-gray-400 mb-4 max-w-md">
                ${escapeHtml(footerDescription)}
              </p>
            ` : ''}
            
            ${contactInfo.email || contactInfo.phone ? `
              <div class="space-y-2">
                ${contactInfo.email ? `
                  <p class="text-gray-400">
                    <span class="font-medium">Email:</span> ${escapeHtml(contactInfo.email)}
                  </p>
                ` : ''}
                ${contactInfo.phone ? `
                  <p class="text-gray-400">
                    <span class="font-medium">Phone:</span> ${escapeHtml(contactInfo.phone)}
                  </p>
                ` : ''}
              </div>
            ` : ''}
          </div>
          
          ${footerProductLinks.length > 0 ? `
            <div>
              <h4 class="text-lg font-semibold mb-4">Products</h4>
              <ul class="space-y-2">
                ${footerProductLinks.map(link => `
                  <li>
                    <a href="${escapeHtml(link.url || '#')}" class="text-gray-400 hover:text-white transition-colors">
                      ${escapeHtml(link.text || '')}
                    </a>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${footerCompanyLinks.length > 0 ? `
            <div>
              <h4 class="text-lg font-semibold mb-4">Company</h4>
              <ul class="space-y-2">
                ${footerCompanyLinks.map(link => `
                  <li>
                    <a href="${escapeHtml(link.url || '#')}" class="text-gray-400 hover:text-white transition-colors">
                      ${escapeHtml(link.text || '')}
                    </a>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        
        <div class="border-t border-gray-800 mt-8 pt-8 text-center">
          <p class="text-gray-400">
            © ${new Date().getFullYear()} ${escapeHtml(businessName)}. All rights reserved.
            <span class="ml-4 text-sm">
              Powered by <a href="https://jetsy.dev" class="text-blue-400 hover:text-blue-300">Jetsy</a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  ` : '';

  // Combine all sections
  return `
    ${heroSection}
    ${featuresSection}
    ${aboutSection}
    ${pricingSection}
    ${contactSection}
    ${footer}
    
    <script>
      // Form submission handlers
      document.addEventListener('DOMContentLoaded', () => {
        // Contact form handler
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
          contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitButton = e.target.querySelector('button[type="submit"]');
            showLoading(submitButton);
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            const result = await submitContactForm(data);
            
            hideLoading(submitButton);
            
            if (result.success) {
              showMessage('Thank you! Your message has been sent successfully.');
              e.target.reset();
              trackEvent('contact_form_submit', data);
            } else {
              showMessage('Sorry, there was an error sending your message. Please try again.', 'error');
            }
          });
        }
        
        // Lead capture forms (if any exist)
        document.querySelectorAll('.lead-form').forEach(form => {
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitButton = e.target.querySelector('button[type="submit"]');
            showLoading(submitButton);
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            const result = await submitLeadForm(data);
            
            hideLoading(submitButton);
            
            if (result.success) {
              showMessage('Thank you for your interest! We\'ll be in touch soon.');
              e.target.reset();
              trackEvent('lead_form_submit', data);
            } else {
              showMessage('Sorry, there was an error. Please try again.', 'error');
            }
          });
        });
      });
    </script>
  `;
};

// Create the complete static HTML document
export const createCompleteStaticSite = (templateData, projectId) => {
  const componentHTML = generateStaticComponentHTML(templateData);
  const htmlTemplate = createStaticHTMLTemplate(templateData, projectId);
  
  // Replace the root div content with the generated component HTML
  return htmlTemplate.replace(
    '<div id="root">\n        <!-- Content will be rendered here -->\n    </div>',
    `<div id="root">\n${componentHTML}\n    </div>`
  );
};
