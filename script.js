// Global state
let currentStep = 'hero';
let leadData = {};
let selectedPlan = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTracking();
    setupFormHandlers();
    setupMobileMenu();
    setupSmoothScrolling();
});

// Google Tag Manager tracking
function initializeTracking() {
    // Track page view
    if (typeof dataLayer !== 'undefined') {
        dataLayer.push({
            'event': 'page_view',
            'page_title': 'Jetsy Landing Page',
            'page_location': window.location.href
        });
    }
}

// Track custom events
function trackEvent(eventName, eventData = {}) {
    console.log('Tracking event:', eventName, eventData);
    
    if (typeof dataLayer !== 'undefined') {
        dataLayer.push({
            'event': eventName,
            ...eventData
        });
    }
    
    // Also send to our backend for Cloudflare D1 storage
    sendTrackingData(eventName, eventData);
}

// Send tracking data to backend
async function sendTrackingData(eventName, eventData) {
    try {
        const response = await fetch('/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: eventName,
                data: eventData,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href
            })
        });
        
        if (!response.ok) {
            console.error('Failed to send tracking data');
        }
    } catch (error) {
        console.error('Error sending tracking data:', error);
    }
}

// Form handlers
function setupFormHandlers() {
    // Lead capture form
    const leadForm = document.getElementById('lead-form');
    if (leadForm) {
        leadForm.addEventListener('submit', handleLeadCapture);
    }
    
    // Idea form
    const ideaForm = document.getElementById('idea-form');
    if (ideaForm) {
        ideaForm.addEventListener('submit', handleIdeaSubmit);
    }
    
    // Checkout form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
}

// Handle lead capture form submission
async function handleLeadCapture(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const phone = formData.get('phone');
    
    // Validate inputs
    if (!email || !phone) {
        showError('Please fill in all required fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (!isValidPhone(phone)) {
        showError('Please enter a valid phone number');
        return;
    }
    
    // Store lead data
    leadData = { email, phone };
    
    // Track the event
    trackEvent('lead_form_submit', { email, phone });
    
    // Store in Cloudflare D1
    await storeLeadInDatabase(email, phone);
    
    // Show onboarding form
    showSection('onboarding');
}

// Handle idea submission
async function handleIdeaSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const ideaName = formData.get('ideaName');
    const ideaDescription = formData.get('ideaDescription');
    
    if (!ideaName || !ideaDescription) {
        showError('Please fill in all required fields');
        return;
    }
    
    // Track the event
    trackEvent('chat_input_submit', { 
      idea_content: ideaName + ': ' + ideaDescription,
      idea_length: (ideaName + ideaDescription).length
    });
    
    // Show loading
    showLoading();
    
    // Simulate processing
    setTimeout(() => {
        hideLoading();
        showSection('pricing');
        scrollToSection('pricing');
    }, 2000);
}

// Handle checkout
async function handleCheckout(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const cardName = formData.get('cardName');
    const cardNumber = formData.get('cardNumber');
    const cardExpiry = formData.get('cardExpiry');
    const cardCvv = formData.get('cardCvv');
    
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        showError('Please fill in all required fields');
        return;
    }
    
    // Track the event
    trackEvent('payment_attempt', { 
        plan: selectedPlan,
        cardName: cardName.substring(0, 3) + '***' // Partial data for privacy
    });
    
    // Show loading
    showLoading();
    
    // Simulate payment processing
    setTimeout(() => {
        hideLoading();
        trackEvent('funnel_complete', { plan: selectedPlan });
        showSection('thank-you');
    }, 1500);
}

// Store lead in Cloudflare D1
async function storeLeadInDatabase(email, phone) {
    try {
        const response = await fetch('/api/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                phone,
                timestamp: Date.now()
            })
        });
        
        if (!response.ok) {
            console.error('Failed to store lead in database');
        } else {
            console.log('Lead stored successfully');
        }
    } catch (error) {
        console.error('Error storing lead:', error);
    }
}

// Navigation functions
function showLeadCapture() {
    trackEvent('hero_cta_click');
    showSection('lead-capture');
    scrollToSection('lead-capture');
}

function showHowItWorks() {
    showModal('how-it-works-modal');
}

function selectPlan(plan) {
    selectedPlan = plan;
    
    // Track plan selection
    trackEvent(`plan_click_${plan}`);
    
    if (plan === 'free') {
        // For free plan, go directly to thank you
        trackEvent('funnel_complete', { plan });
        showSection('thank-you');
    } else {
        // For paid plans, show checkout
        updateCheckoutSummary(plan);
        showSection('checkout');
        scrollToSection('checkout');
    }
}

function updateCheckoutSummary(plan) {
    const planNames = {
        'basic': 'Basic Plan',
        'pro': 'Pro Plan'
    };
    
    const planPrices = {
        'basic': '$19/month',
        'pro': '$49/month'
    };
    
    document.getElementById('selected-plan').textContent = planNames[plan];
    document.getElementById('selected-price').textContent = planPrices[plan];
}

// Section management
function showSection(sectionId) {
    // Hide all sections
    const sections = ['hero', 'lead-capture', 'onboarding', 'pricing', 'checkout', 'thank-you'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.classList.add('hidden');
        }
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        currentStep = sectionId;
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function scrollToHero() {
    showSection('hero');
    scrollToSection('hero');
}

// Modal management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.add('hidden');
    });
    document.body.style.overflow = '';
}

// Loading management
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.remove('hidden');
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
    }
}

// Mobile menu
function setupMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

// Smooth scrolling
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Basic phone validation - allows various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
}

function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 300);
    }, 3000);
}

function resetFlow() {
    // Reset all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.reset());
    
    // Reset state
    currentStep = 'hero';
    leadData = {};
    selectedPlan = null;
    
    // Show hero section
    showSection('hero');
    scrollToSection('hero');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Add CSS animations for error notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .nav-menu.active {
        display: flex !important;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        padding: 24px;
        border-top: 1px solid var(--border-color);
        box-shadow: var(--shadow-lg);
    }
    
    .nav-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
`;
document.head.appendChild(style);

// Input formatting
document.addEventListener('DOMContentLoaded', function() {
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = `(${value}`;
                } else if (value.length <= 6) {
                    value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                } else {
                    value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
                }
            }
            e.target.value = value;
        });
    }
    
    // Credit card number formatting
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = value;
        });
    }
    
    // Expiry date formatting
    const expiryInput = document.getElementById('card-expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // CVV formatting
    const cvvInput = document.getElementById('card-cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            e.target.value = value.slice(0, 4);
        });
    }
});

// Performance optimization
window.addEventListener('load', function() {
    // Preload critical resources
    const criticalImages = [
        // Add any critical images here
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
});

// Analytics and performance tracking
window.addEventListener('beforeunload', function() {
    // Track session duration
    const sessionDuration = Date.now() - performance.timing.navigationStart;
    trackEvent('session_end', { duration: sessionDuration });
}); 