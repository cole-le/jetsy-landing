import React, { useState, useEffect, useRef } from 'react';

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
  businessLogoUrl = null,
  tagline = 'Transform your idea into reality with our innovative solution',
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
  trustIndicator2 = "4.9/5 rating",
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
  aboutBackgroundImage = null
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
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('Thank you! We\'ll be in touch soon.');
    setFormData({ name: '', email: '', company: '', message: '' });
    setIsSubmitting(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white">
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
                <a href={`#${sectionType}`} className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  {sectionType === 'features' ? 'Features' : 
                   sectionType === 'services' ? 'Services' : 'Highlights'}
                </a>
                <a href="#about" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">About</a>
                <a href="#pricing" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Pricing</a>
                <a href="#contact" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Contact</a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Desktop CTA Button */}
              <button className="hidden md:block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
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
              <a 
                href={`#${sectionType}`} 
                className="text-gray-500 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {sectionType === 'features' ? 'Features' : 
                 sectionType === 'services' ? 'Services' : 'Highlights'}
              </a>
              <a 
                href="#about" 
                className="text-gray-500 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
              <a 
                href="#pricing" 
                className="text-gray-500 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a 
                href="#contact" 
                className="text-gray-500 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </a>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-base font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-0">
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
            <div 
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-8"
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
            
            <div className="flex justify-center items-center mb-12">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl">
                {ctaButtonText}
              </button>
            </div>
            
            {/* Social Proof */}
            <div 
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm px-4"
              style={{
                color: heroBackgroundImage ? '#ffffff' : '#6b7280',
                textShadow: heroBackgroundImage ? `0 2px 4px ${heroTextColors.shadowColor}` : 'none'
              }}
            >
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 border-2 border-white"></div>
                  ))}
                </div>
                <span>{trustIndicator1}</span>
              </div>
              <div className="flex items-center">
                <div className="flex text-yellow-400 mr-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span>{trustIndicator2}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements - Removed blinking circles animation */}
      </section>

      {/* Dynamic Section (Features/Services/Highlights) */}
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

      {/* About Section */}
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
                backgroundColor: `rgba(0, 0, 0, ${aboutTextColors.overlayOpacity})`,
                backdropFilter: 'blur(2px)'
              }}
            ></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50"></div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 
                className="text-4xl md:text-5xl font-bold mb-6"
                style={{
                  color: aboutBackgroundImage ? '#ffffff' : '#1f2937',
                  textShadow: aboutBackgroundImage ? `0 3px 6px ${aboutTextColors.shadowColor}` : 'none'
                }}
              >
                {aboutSectionTitle.split(',')[0]},
                <br />
                <span 
                  style={{
                    background: aboutBackgroundImage 
                      ? 'linear-gradient(to right, #ffffff, #e5e7eb)' 
                      : 'linear-gradient(to right, #2563eb, #7c3aed)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: aboutBackgroundImage ? `0 3px 6px ${aboutTextColors.shadowColor}` : 'none'
                  }}
                >
                  {aboutSectionTitle.split(',')[1]}
                </span>
              </h2>
              <p 
                className="text-xl mb-8 leading-relaxed"
                style={{
                  color: aboutBackgroundImage ? '#ffffff' : '#4b5563',
                  textShadow: aboutBackgroundImage ? `0 2px 4px ${aboutTextColors.shadowColor}` : 'none'
                }}
              >
                {aboutSectionSubtitle}
              </p>
              
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
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="text-white text-center">
                  <div className="text-3xl font-bold mb-2">{landingPagesCreated.split(' ')[0]}</div>
                  <div className="text-sm opacity-90">{landingPagesCreated.split(' ').slice(1).join(' ')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
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

      {/* Contact Section */}
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">J</span>
                </div>
                <span className="text-xl font-bold">{businessName}</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                {footerDescription}
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                {footerProductLinks.map((link, index) => (
                  <li key={index}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                {footerCompanyLinks.map((link, index) => (
                  <li key={index}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {businessName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExceptionalTemplate; 