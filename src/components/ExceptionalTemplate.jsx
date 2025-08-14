import React, { useState, useEffect, useRef } from 'react';
import { getApiBaseUrl } from '../config/environment';

// Utility function to calculate optimal overlay and text settings for readability
const calculateOptimalTextColor = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let totalLuminance = 0;
        let sampleCount = 0;
        
        // Sample pixels to calculate average luminance
        for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate luminance using standard formula
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          totalLuminance += luminance;
          sampleCount++;
        }
        
        const averageLuminance = totalLuminance / sampleCount;
        
        // Always use white text with strong black overlay for maximum readability
        const textColor = '#ffffff'; // Always white text
        const shadowColor = 'rgba(0, 0, 0, 0.9)'; // Strong black shadow
        
        // Calculate overlay opacity based on image complexity
        // Higher opacity for lighter/more complex backgrounds
        let overlayOpacity = 0.6; // Default strong overlay
        if (averageLuminance > 0.6) {
          overlayOpacity = 0.7; // Stronger overlay for very light backgrounds
        } else if (averageLuminance < 0.3) {
          overlayOpacity = 0.5; // Slightly lighter overlay for already dark backgrounds
        }
        
        resolve({
          textColor,
          shadowColor,
          luminance: averageLuminance,
          overlayOpacity
        });
      } catch (error) {
        console.warn('Could not analyze image for color optimization:', error);
        // Fallback to strong overlay for maximum readability
        resolve({
          textColor: '#ffffff',
          shadowColor: 'rgba(0, 0, 0, 0.9)',
          luminance: 0.3,
          overlayOpacity: 0.6
        });
      }
    };
    
    img.onerror = () => {
      // Fallback if image fails to load - use strong overlay
      resolve({
        textColor: '#ffffff',
        shadowColor: 'rgba(0, 0, 0, 0.9)',
        luminance: 0.3,
        overlayOpacity: 0.6
      });
    };
    
    img.src = imageUrl;
  });
};

const ExceptionalTemplate = ({ 
  businessName = 'Your Amazing Startup',
  seoTitle = null,
  businessLogoUrl = null,
  tagline = 'Transform your idea into reality with our innovative solution',
  isLiveWebsite = false,
  heroDescription = 'Join thousands of satisfied customers who have already made the leap.',
  ctaButtonText = 'Start Building Free',
  sectionType = 'features',
  sectionTitle = 'Everything you need to succeed',
  sectionSubtitle = 'Our platform combines cutting-edge AI with proven design principles to create landing pages that convert.',
  features = [
    {
      icon: "🚀",
      title: "AI-Powered Design",
      description: "Our AI analyzes your business and creates stunning, conversion-optimized designs automatically."
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Build and deploy your landing page in minutes, not hours. Get to market faster than ever."
    },
    {
      icon: "📱",
      title: "Mobile-First",
      description: "Every landing page is optimized for mobile devices, ensuring perfect performance everywhere."
    },
    {
      icon: "🎨",
      title: "Customizable",
      description: "Easily customize colors, fonts, layouts, and content to match your brand perfectly."
    },
    {
      icon: "📊",
      title: "Analytics Built-in",
      description: "Track conversions, user behavior, and performance with our integrated analytics dashboard."
    },
    {
      icon: "🔒",
      title: "Secure & Reliable",
      description: "Built on enterprise-grade infrastructure with 99.9% uptime and advanced security."
    }
  ],
  aboutContent = "We understand the challenges of bringing ideas to life. That's why we've built a platform that makes it effortless to create professional landing pages that actually convert visitors into customers.",
  pricing = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for trying out our platform",
      features: ["1 landing page", "Basic templates", "Email support", "Analytics dashboard"],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For growing businesses and creators",
      features: ["Unlimited landing pages", "Premium templates", "Priority support", "Advanced analytics", "Custom domains", "A/B testing"],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "For large teams and agencies",
      features: ["Everything in Pro", "Team collaboration", "White-label options", "API access", "Dedicated support", "Custom integrations"],
      cta: "Contact Sales",
      popular: false
    }
  ],
  contactInfo = {
    email: "hello@jetsy.com",
    phone: "+1 (555) 123-4567",
    office: "San Francisco, CA"
  },
  trustIndicator1 = "Join 10,000+ creators",
  trustIndicator2 = "4.8/5 customer satisfaction rating",
  // New dynamic props
  heroBadge = "Now Available - AI-Powered Landing Pages",
  aboutSectionTitle = "Built by creators, for creators",
  aboutSectionSubtitle = "Our platform combines cutting-edge AI with proven design principles to create landing pages that convert.",
  aboutBenefits = [
    "No coding knowledge required",
    "AI-powered design optimization",
    "Built-in analytics and tracking"
  ],
  pricingSectionTitle = "Simple, transparent pricing",
  pricingSectionSubtitle = "Choose the plan that's right for you. All plans include our core features and 24/7 support.",
  contactSectionTitle = "Ready to get started?",
  contactSectionSubtitle = "Let's discuss how we can help you create the perfect landing page for your business. Our team is here to support you every step of the way.",
  contactFormPlaceholders = {
    name: "Your name",
    email: "your@email.com",
    company: "Your company",
    message: "Tell us about your project..."
  },
  footerDescription = "Build beautiful, conversion-optimized landing pages with AI. Transform your ideas into reality in minutes.",
  footerProductLinks = ["Features", "Pricing", "Templates", "API"],
  footerCompanyLinks = ["About", "Blog", "Careers", "Contact"],
  landingPagesCreated = "10,000+ Landing Pages Created",
  // Background image props
  heroBackgroundImage = null,
  aboutBackgroundImage = null,
  // Lead form options
  showLeadPhoneField = true,
  projectId = null,
  // Visibility flags
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
}) => {
  // Debug background images
  console.log('🎨 ExceptionalTemplate received heroBackgroundImage:', heroBackgroundImage);
  console.log('🎨 ExceptionalTemplate received aboutBackgroundImage:', aboutBackgroundImage);
  
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const rootRef = useRef(null);
  const [overlayRect, setOverlayRect] = useState({ top: 0, height: 0 });
  const scrollContainerRef = useRef(null);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  
  // Pool of avatar images to randomly display for social proof
  const avatarImagePool = [
    'https://randomuser.me/api/portraits/women/68.jpg',
    'https://randomuser.me/api/portraits/men/32.jpg',
    'https://randomuser.me/api/portraits/women/12.jpg',
    'https://randomuser.me/api/portraits/men/77.jpg',
    'https://randomuser.me/api/portraits/women/65.jpg',
    'https://randomuser.me/api/portraits/men/41.jpg',
    'https://randomuser.me/api/portraits/women/29.jpg',
    'https://randomuser.me/api/portraits/men/81.jpg',
    'https://randomuser.me/api/portraits/women/44.jpg',
    'https://randomuser.me/api/portraits/men/67.jpg'
  ];

  const [selectedAvatars, setSelectedAvatars] = useState([]);

  // Utility to select n unique random items from an array
  const selectRandomUnique = (items, count) => {
    const pool = [...items];
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
  };

  useEffect(() => {
    setSelectedAvatars(selectRandomUnique(avatarImagePool, 4));
  }, []);

  // Find nearest scrollable ancestor for positioning modal within the visible Live Preview area
  const findScrollContainer = (node) => {
    let current = node?.parentElement || null;
    while (current) {
      const style = window.getComputedStyle(current);
      const overflowY = style.overflowY;
      const isScrollable = (overflowY === 'auto' || overflowY === 'scroll') && current.scrollHeight > current.clientHeight;
      if (isScrollable) return current;
      current = current.parentElement;
    }
    return null;
  };

  const updateOverlayPosition = () => {
    const rootEl = rootRef.current;
    if (!rootEl) return;
    const scroller = scrollContainerRef.current || findScrollContainer(rootEl);
    if (!scroller) {
      // Standalone page: align overlay to current viewport over the hero
      const rootRect = rootEl.getBoundingClientRect();
      const rootOffsetTop = rootRect.top + window.scrollY;
      const visibleTopInRoot = Math.max(0, window.scrollY - rootOffsetTop);
      setOverlayRect({ top: visibleTopInRoot, height: window.innerHeight });
      return;
    }
    scrollContainerRef.current = scroller;
    const scrollerRect = scroller.getBoundingClientRect();
    const rootRect = rootEl.getBoundingClientRect();
    // Compute the visible top in root coordinates
    const rootOffsetWithinScroller = rootRect.top - scrollerRect.top + scroller.scrollTop;
    const visibleTopInRoot = scroller.scrollTop - rootOffsetWithinScroller;
    const clampedTop = Math.max(0, Math.min(visibleTopInRoot, Math.max(rootEl.scrollHeight - scroller.clientHeight, 0)));
    setOverlayRect({ top: clampedTop, height: scroller.clientHeight });
  };

  useEffect(() => {
    if (!isLeadModalOpen) return;
    updateOverlayPosition();
    const scroller = scrollContainerRef.current || findScrollContainer(rootRef.current);
    const onScroll = () => updateOverlayPosition();
    const onResize = () => updateOverlayPosition();
    if (scroller) scroller.addEventListener('scroll', onScroll, { passive: true });
    else window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      if (scroller) scroller.removeEventListener('scroll', onScroll);
      else window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [isLeadModalOpen]);
  
  // State for dynamic text colors
  const [heroTextColors, setHeroTextColors] = useState({
    textColor: '#ffffff',
    shadowColor: 'rgba(0, 0, 0, 0.9)',
    overlayOpacity: 0.6
  });
  const [aboutTextColors, setAboutTextColors] = useState({
    textColor: '#ffffff',
    shadowColor: 'rgba(0, 0, 0, 0.9)',
    overlayOpacity: 0.6
  });

  useEffect(() => {
    setIsVisible(true);
    
    // Smooth scroll for navigation
    const handleSmoothScroll = (e) => {
      if (e.target.hash) {
        e.preventDefault();
        const target = document.querySelector(e.target.hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    // Close mobile menu when clicking outside
    const handleClickOutside = (e) => {
      if (isMobileMenuOpen && !e.target.closest('nav')) {
        setIsMobileMenuOpen(false);
      }
    };

    // Close mobile menu on window resize
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleSmoothScroll);
    });

    document.addEventListener('click', handleClickOutside);
    window.addEventListener('resize', handleResize);

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', handleSmoothScroll);
      });
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileMenuOpen]);

  // Set document title and favicon dynamically - only for live websites
  useEffect(() => {
    // Only apply custom branding for live websites, keep Jetsy branding in editor
    if (!isLiveWebsite) return;
    
    // Set document title for SEO and browser tab - always format as "Business Name - Headline"
    let headline = seoTitle;
    if (!headline) {
      // Fallback to tagline if no SEO title, or default message
      headline = tagline || 'Transform your idea into reality';
    }
    
    // Ensure we always have the format: "Business Name - Headline"
    const title = `${businessName} - ${headline}`;
    document.title = title;
    
    // Set favicon using business logo if available
    if (businessLogoUrl) {
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(link => link.remove());
      
      // Add new favicon link
      const faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      faviconLink.type = 'image/png';
      faviconLink.href = businessLogoUrl;
      document.head.appendChild(faviconLink);
    }
  }, [isLiveWebsite, seoTitle, businessName, tagline, businessLogoUrl]);

  // Analyze background images and update text colors
  useEffect(() => {
    const analyzeBackgroundImages = async () => {
      if (heroBackgroundImage) {
        console.log('🎨 Analyzing hero background image for color optimization...');
        const colors = await calculateOptimalTextColor(heroBackgroundImage);
        setHeroTextColors(colors);
        console.log('🎨 Hero text colors optimized:', colors);
      }
      
      if (aboutBackgroundImage) {
        console.log('🎨 Analyzing about background image for color optimization...');
        const colors = await calculateOptimalTextColor(aboutBackgroundImage);
        setAboutTextColors(colors);
        console.log('🎨 About text colors optimized:', colors);
      }
    };

    analyzeBackgroundImages();
  }, [heroBackgroundImage, aboutBackgroundImage]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          message: formData.message,
          project_id: projectId || 1,
          submitted_at: new Date().toISOString(),
        })
      });
      if (res.ok) {
        alert('Thank you! We\'ll be in touch soon.');
        setFormData({ name: '', email: '', company: '', message: '' });
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div ref={rootRef} className="relative min-h-screen bg-white">
      {/* Navigation */}
      <nav className="relative bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {businessLogoUrl ? (
                  <img src={businessLogoUrl} alt={businessName} className="h-8 w-auto" />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">J</span>
                  </div>
                )}
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold text-gray-900">{businessName}</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#home" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Home</a>
                {showDynamicSection && (
                  <a href={`#${sectionType}`} className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                    {sectionType === 'features' ? 'Features' : 
                     sectionType === 'services' ? 'Services' : 'Highlights'}
                  </a>
                )}
                {showAboutSection && (
                  <a href="#about" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">About</a>
                )}
                {showPricingSection && (
                  <a href="#pricing" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Pricing</a>
                )}
                {showContactSection && (
                  <a href="#contact" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Contact</a>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Desktop CTA Button */}
              <button onClick={() => setIsLeadModalOpen(true)} className="hidden md:block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                Get Started
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-100">
              <a 
                href="#home" 
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </a>
              {showDynamicSection && (
                <a 
                  href={`#${sectionType}`} 
                  className="text-gray-500 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {sectionType === 'features' ? 'Features' : 
                   sectionType === 'services' ? 'Services' : 'Highlights'}
                </a>
              )}
              {showAboutSection && (
                <a 
                  href="#about" 
                  className="text-gray-500 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </a>
              )}
              {showPricingSection && (
                <a 
                  href="#pricing" 
                  className="text-gray-500 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </a>
              )}
              {showContactSection && (
                <a 
                  href="#contact" 
                  className="text-gray-500 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </a>
              )}
              <div className="pt-4 pb-3 border-t border-gray-200">
                <button onClick={() => { setIsLeadModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-base font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {showHeroSection && (
      <section id="home" className="relative min-h-screen flex items-start justify-center overflow-hidden pt-8 sm:pt-12 md:pt-16">
        {/* Background Image */}
        {heroBackgroundImage ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${heroBackgroundImage})` }}
            ></div>
            <div 
              className="absolute inset-0"
              style={{ 
                backgroundColor: `rgba(0, 0, 0, ${heroTextColors.overlayOpacity})`,
                backdropFilter: 'blur(2px)'
              }}
            ></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            {showHeroBadge && (
              <div 
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-8 sm:mb-10"
                style={{
                  backgroundColor: heroBackgroundImage ? 'rgba(0, 0, 0, 0.8)' : 'rgb(219, 234, 254)',
                  color: heroBackgroundImage ? '#ffffff' : '#1e40af',
                  textShadow: heroBackgroundImage ? `0 1px 2px ${heroTextColors.shadowColor}` : 'none',
                  border: heroBackgroundImage ? '1px solid rgba(255, 255, 255, 0.2)' : 'none'
                }}
              >
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                {heroBadge}
              </div>
            )}
            
            <h1 
              className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight px-4"
              style={{
                color: heroBackgroundImage ? '#ffffff' : '#1f2937',
                textShadow: heroBackgroundImage ? `0 3px 6px ${heroTextColors.shadowColor}` : 'none'
              }}
            >
              {businessName}
            </h1>
            
            <p 
              className="text-lg sm:text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed px-4"
              style={{
                color: heroBackgroundImage ? '#ffffff' : '#4b5563',
                textShadow: heroBackgroundImage ? `0 2px 4px ${heroTextColors.shadowColor}` : 'none'
              }}
            >
              {tagline}
            </p>
            
            <p 
              className="text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed px-4"
              style={{
                color: heroBackgroundImage ? '#ffffff' : '#4b5563',
                textShadow: heroBackgroundImage ? `0 2px 4px ${heroTextColors.shadowColor}` : 'none'
              }}
            >
              {heroDescription}
            </p>
            
            {showHeroCTA && (
              <div className="flex justify-center items-center mb-12">
                <button onClick={() => setIsLeadModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl">
                  {ctaButtonText}
                </button>
              </div>
            )}
            
            {showHeroSocialProof && (
              <div 
                className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm px-4"
                style={{
                  color: heroBackgroundImage ? '#ffffff' : '#6b7280',
                  textShadow: heroBackgroundImage ? `0 2px 4px ${heroTextColors.shadowColor}` : 'none'
                }}
              >
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-3">
                    {(selectedAvatars.length ? selectedAvatars : selectRandomUnique(avatarImagePool, 4)).map((src, index) => (
                      <div
                        key={`${src}-${index}`}
                        className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gradient-to-r from-blue-400 to-purple-400"
                        title="Happy customer"
                      >
                        <img
                          src={src}
                          alt="Customer avatar"
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = '/jetsy_logo.png';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <span>{trustIndicator1}</span>
                </div>
                <div className="flex items-center">
                  {(() => {
                    const text = `${trustIndicator2 ?? ''}`
                    const match = text.match(/(\d+(?:\.\d+)?)[\s]*\/[\s]*5/)
                    const fallbackMatch = text.match(/(\d+(?:\.\d+)?)/)
                    let rating = 5
                    if (match && !Number.isNaN(parseFloat(match[1]))) {
                      rating = parseFloat(match[1])
                    } else if (fallbackMatch && !Number.isNaN(parseFloat(fallbackMatch[1]))) {
                      rating = parseFloat(fallbackMatch[1])
                    }
                    rating = Math.max(0, Math.min(5, rating))
                    const fullStars = Math.floor(rating)
                    const fraction = rating - fullStars
                    const starPath = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    const starPrefix = `sp-${projectId || 'x'}`
                    return (
                      <div className="flex mr-2">
                        {[1, 2, 3, 4, 5].map((i) => {
                          let fill = 0
                          if (i <= fullStars) fill = 1
                          else if (i === fullStars + 1) fill = fraction
                          const clipId = `${starPrefix}-clip-${i}`
                          return (
                            <div key={i} className="relative w-4 h-4 mr-0.5">
                              <svg className="w-4 h-4" viewBox="0 0 20 20">
                                <path d={starPath} fill="#D1D5DB" />
                              </svg>
                              {fill > 0 && (
                                <svg className="absolute top-0 left-0 w-4 h-4" viewBox="0 0 20 20">
                                  <defs>
                                    <clipPath id={clipId}>
                                      <rect x="0" y="0" width={20 * fill} height="20" />
                                    </clipPath>
                                  </defs>
                                  <path d={starPath} fill="#F59E0B" clipPath={`url(#${clipId})`} />
                                </svg>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                  <span>{trustIndicator2}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Floating Elements - Removed blinking circles animation */}
      </section>
      )}

      {/* Dynamic Section (Features/Services/Highlights) */}
      {showDynamicSection && (
      <section id={sectionType} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {sectionTitle.split(' ').slice(0, -1).join(' ')}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> {sectionTitle.split(' ').slice(-1)[0]}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {sectionSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-6 md:p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-3xl md:text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* About Section */}
      {showAboutSection && (
      <section id="about" className="py-20 relative">
        {/* Background Image */}
        {aboutBackgroundImage ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${aboutBackgroundImage})` }}
            ></div>
            <div 
              className="absolute inset-0"
              style={{ 
                backgroundColor: `rgba(0, 0, 0, ${Math.min(aboutTextColors.overlayOpacity, 0.5)})`,
                backdropFilter: 'blur(2px)'
              }}
            ></div>
            {/* Subtle color wash to match hero section aesthetics */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50"></div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 gap-8 lg:gap-12 items-center">
            <div>
              {showAboutTitle && (
                <h2 
                  className="text-4xl md:text-5xl font-bold mb-6"
                  style={{
                    color: aboutBackgroundImage ? '#ffffff' : '#1f2937',
                    textShadow: aboutBackgroundImage ? `0 3px 6px ${aboutTextColors.shadowColor}` : 'none'
                  }}
                >
                  {aboutSectionTitle.split(',')[0]},
                  <br />
                  {aboutSectionTitle.split(',')[1]}
                </h2>
              )}
              {showAboutSubtitle && (
                <p 
                  className="text-xl mb-8 leading-relaxed"
                  style={{
                    color: aboutBackgroundImage ? '#ffffff' : '#4b5563',
                    textShadow: aboutBackgroundImage ? `0 2px 4px ${aboutTextColors.shadowColor}` : 'none'
                  }}
                >
                  {aboutSectionSubtitle}
                </p>
              )}
              
              <div className="space-y-4">
                {aboutBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-4"
                      style={{
                        backgroundColor: aboutBackgroundImage ? 'rgba(0, 0, 0, 0.8)' : 'rgb(219, 234, 254)',
                        border: aboutBackgroundImage ? '1px solid rgba(255, 255, 255, 0.2)' : 'none'
                      }}
                    >
                      <svg 
                        className="w-4 h-4" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                        style={{
                          color: aboutBackgroundImage ? '#60a5fa' : '#2563eb'
                        }}
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span 
                      style={{
                        color: aboutBackgroundImage ? '#ffffff' : '#374151',
                        textShadow: aboutBackgroundImage ? `0 2px 4px ${aboutTextColors.shadowColor}` : 'none'
                      }}
                    >
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Pricing Section */}
      {showPricingSection && (
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {pricingSectionTitle.split(' ').slice(0, -1).join(' ')}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> {pricingSectionTitle.split(' ').slice(-1)[0]}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {pricingSectionSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, index) => (
              <div key={index} className={`relative p-6 md:p-8 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-2 ${
                plan.popular 
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-purple-50 shadow-2xl' 
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-xl'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-600">{plan.period}</span>}
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Contact Section */}
      {showContactSection && (
      <section id="contact" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {contactSectionTitle.split(' ').slice(0, -1).join(' ')}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> {contactSectionTitle.split(' ').slice(-1)[0]}</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {contactSectionSubtitle}
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                                         <div className="font-semibold text-gray-900">Email</div>
                     <div className="text-gray-600">{contactInfo.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                                         <div className="font-semibold text-gray-900">Phone</div>
                     <div className="text-gray-600">{contactInfo.phone}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                                         <div className="font-semibold text-gray-900">Office</div>
                     <div className="text-gray-600">{contactInfo.office}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={contactFormPlaceholders.name}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={contactFormPlaceholders.email}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                                      <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={contactFormPlaceholders.company}
                    />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                      <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={contactFormPlaceholders.message}
                      required
                    ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Footer */}
      {showFooter && (
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 mr-3">
                    {businessLogoUrl ? (
                      <img src={businessLogoUrl} alt={businessName} className="h-8 w-auto" />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">J</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xl font-bold">{businessName}</span>
                </div>
                <p className="text-gray-400 mb-6 max-w-md">{footerDescription}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 {businessName}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}

      {/* Lead Capture Modal */}
      {isLeadModalOpen && (
        <div className="absolute z-50 w-full" style={{ left: 0, right: 0, top: overlayRect.top, height: overlayRect.height }}>
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsLeadModalOpen(false)}></div>
          <div className="relative w-full h-full flex items-center justify-center p-4" onClick={() => setIsLeadModalOpen(false)}>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              {/* Close button */}
              <button
                type="button"
                aria-label="Close"
                onClick={() => setIsLeadModalOpen(false)}
                className="absolute top-3 right-3 p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            <div className="mb-4">
              <h3 className="text-2xl font-semibold text-gray-900">Create Your Account</h3>
              <p className="text-gray-600 mt-1">
                {showLeadPhoneField ? 'Enter your email and phone number to get started' : 'Enter your email to get started'}
              </p>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                try {
                  const res = await fetch(`${getApiBaseUrl()}/api/leads`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: leadEmail,
                      phone: showLeadPhoneField ? leadPhone : '',
                      project_id: projectId || 1,
                      submitted_at: new Date().toISOString(),
                    })
                  });
                  if (res.ok) {
                    setIsLeadModalOpen(false);
                    setLeadEmail('');
                    setLeadPhone('');
                    alert('Thanks! Your account has been created.');
                  } else {
                    const data = await res.json().catch(() => ({}));
                    alert(data?.error || 'Failed to submit. Please try again.');
                  }
                } catch (err) {
                  console.error(err);
                  alert('Network error. Please try again.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {showLeadPhoneField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="1 555 123 4567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Create your Account'}
              </button>
              <div className="text-center text-sm text-gray-600">
                Already have an account? <a href="#" className="text-blue-600 hover:underline">Log in</a>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExceptionalTemplate; 