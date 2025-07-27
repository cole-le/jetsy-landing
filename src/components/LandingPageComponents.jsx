import React, { useState, useEffect } from 'react';

// Lead Capture Form Component
export const LeadCaptureForm = ({ onSubmit, title = "Get Started", subtitle = "Join our waitlist", buttonText = "Submit", fields = ['email', 'phone'] }) => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (fields.includes('email') && (!formData.email || !validateEmail(formData.email))) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (fields.includes('phone') && (!formData.phone || !validatePhone(formData.phone))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (fields.includes('name') && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ email: '', phone: '', name: '' });
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{subtitle}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.includes('name') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Your name"
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>
        )}

        {fields.includes('email') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>
        )}

        {fields.includes('phone') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="(555) 123-4567"
            />
            {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </div>
          ) : (
            buttonText
          )}
        </button>
      </form>
    </div>
  );
};

// Animated Hero Section Component
export const AnimatedHero = ({ 
  title, 
  subtitle, 
  backgroundImage, 
  overlay = true, 
  ctaText = "Get Started",
  onCtaClick,
  children 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <img
            src={backgroundImage}
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          {overlay && (
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className={`transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
          
          {children}

          <button
            onClick={onCtaClick}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-full text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            {ctaText}
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

// Feature Section Component
export const FeatureSection = ({ title, subtitle, features, backgroundColor = "bg-white" }) => {
  return (
    <section className={`${backgroundColor} py-20`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className={`fa fa-${feature.icon} text-white text-2xl`}></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing Section Component
export const PricingSection = ({ title, subtitle, plans, backgroundColor = "bg-gray-50" }) => {
  return (
    <section className={`${backgroundColor} py-20`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-lg p-8 ${
                plan.featured ? 'ring-2 ring-blue-500 transform scale-105' : ''
              }`}
            >
              {plan.featured && (
                <div className="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600">/{plan.period}</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <i className="fa fa-check text-green-500 mr-3"></i>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                {plan.ctaText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Contact Section Component
export const ContactSection = ({ title, subtitle, contactInfo, backgroundColor = "bg-white" }) => {
  return (
    <section className={`${backgroundColor} py-20`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Send us a message</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your message"
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Get in touch</h3>
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                    <i className={`fa fa-${info.icon} text-white`}></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{info.title}</h4>
                    <p className="text-gray-600">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer Component
export const Footer = ({ businessName, tagline, socialLinks, backgroundColor = "bg-gray-900" }) => {
  return (
    <footer className={`${backgroundColor} text-white py-12`}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Business Info */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-2">{businessName}</h3>
            <p className="text-gray-400 mb-4">{tagline}</p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <i className={`fa fa-${link.icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Services</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>info@{businessName.toLowerCase().replace(/\s+/g, '')}.com</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Business St, City, State</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 {businessName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Modal Component for Lead Capture
export const LeadCaptureModal = ({ isOpen, onClose, onSubmit, title, subtitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fa fa-times text-xl"></i>
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">{subtitle}</p>
          
          <LeadCaptureForm
            onSubmit={onSubmit}
            title=""
            subtitle=""
            buttonText="Submit"
            fields={['name', 'email', 'phone']}
          />
        </div>
      </div>
    </div>
  );
};

// Utility function to generate color schemes
export const generateColorScheme = (businessType) => {
  const schemes = {
    'miami-beach-bar': {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#A55EEA',
      background: '#1A1A2E',
      text: '#FFFFFF'
    },
    'tech-startup': {
      primary: '#3B82F6',
      secondary: '#6B7280',
      accent: '#10B981',
      background: '#F9FAFB',
      text: '#111827'
    },
    'restaurant': {
      primary: '#F59E0B',
      secondary: '#DC2626',
      accent: '#FEF3C7',
      background: '#FFFFFF',
      text: '#1F2937'
    },
    'fitness': {
      primary: '#10B981',
      secondary: '#1F2937',
      accent: '#F59E0B',
      background: '#FFFFFF',
      text: '#111827'
    },
    'luxury': {
      primary: '#111827',
      secondary: '#F59E0B',
      accent: '#F9FAFB',
      background: '#FFFFFF',
      text: '#111827'
    }
  };

  return schemes[businessType] || schemes['tech-startup'];
};

export default {
  LeadCaptureForm,
  AnimatedHero,
  FeatureSection,
  PricingSection,
  ContactSection,
  Footer,
  LeadCaptureModal,
  generateColorScheme
}; 