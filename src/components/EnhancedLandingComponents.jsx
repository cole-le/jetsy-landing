import React, { useState, useEffect } from 'react';

// Enhanced Hero Section with Split Screen Layout
export const SplitScreenHero = ({ 
  title, 
  subtitle, 
  primaryCTA, 
  secondaryCTA, 
  heroImage, 
  colorScheme = "tech_startup",
  onPrimaryClick,
  onSecondaryClick 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="min-h-screen flex items-center relative overflow-hidden">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        <div className={`text-content ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onPrimaryClick}
              className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {primaryCTA}
            </button>
            <button 
              onClick={onSecondaryClick}
              className="border-2 border-primary text-primary px-8 py-4 rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-300"
            >
              {secondaryCTA}
            </button>
          </div>
        </div>
        <div className={`image-content ${isVisible ? 'animate-slide-in' : 'opacity-0 translate-x-20'}`}>
          <img 
            src={heroImage} 
            alt="Hero" 
            className="rounded-2xl shadow-2xl w-full h-auto object-cover"
          />
        </div>
      </div>
    </section>
  );
};

// Enhanced Feature Grid with Hover Effects
export const FeatureGrid = ({ 
  title, 
  subtitle, 
  features, 
  colorScheme = "tech_startup" 
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 ${
                hoveredIndex === index ? 'ring-2 ring-primary ring-opacity-50' : ''
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 transform transition-transform duration-300 hover:scale-110">
                <i className={`fa fa-${feature.icon} text-white text-2xl`}></i>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Timeline Feature Section
export const TimelineFeatures = ({ 
  title, 
  subtitle, 
  features, 
  colorScheme = "tech_startup" 
}) => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xl text-gray-600">
            {subtitle}
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-primary to-secondary"></div>
          {features.map((feature, index) => (
            <div key={index} className="relative mb-12">
              <div className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="w-1/2 px-8">
                  <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
                <div className="w-4 h-4 bg-primary rounded-full border-4 border-white shadow-lg"></div>
                <div className="w-1/2 px-8"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Enhanced Lead Capture Form
export const EnhancedLeadForm = ({ 
  title = "Get Started", 
  subtitle = "Join our waitlist", 
  formType = "newsletter_signup",
  colorScheme = "tech_startup",
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    date: '',
    preferences: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formType === 'consultation_booking' && !formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (formType === 'consultation_booking' && !formData.phone) {
      newErrors.phone = 'Phone number is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ name: '', email: '', phone: '', company: '', service: '', date: '', preferences: [] });
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormFields = () => {
    switch (formType) {
      case 'newsletter_signup':
        return (
          <>
            <div>
              <input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={formData.preferences.includes('updates')}
                  onChange={(e) => {
                    const newPrefs = e.target.checked 
                      ? [...formData.preferences, 'updates']
                      : formData.preferences.filter(p => p !== 'updates');
                    setFormData({ ...formData, preferences: newPrefs });
                  }}
                />
                <span className="text-sm">Product updates</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={formData.preferences.includes('offers')}
                  onChange={(e) => {
                    const newPrefs = e.target.checked 
                      ? [...formData.preferences, 'offers']
                      : formData.preferences.filter(p => p !== 'offers');
                    setFormData({ ...formData, preferences: newPrefs });
                  }}
                />
                <span className="text-sm">Exclusive offers</span>
              </label>
            </div>
          </>
        );

      case 'consultation_booking':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.phone ? 'border-red-500' : ''
                }`}
              />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <select
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select Service</option>
              <option value="strategy">Strategy Consulting</option>
              <option value="design">Design Services</option>
              <option value="development">Development</option>
            </select>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </>
        );

      case 'style_quiz':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">What's your preferred style?</h4>
              <div className="space-y-2">
                {['Casual & Comfortable', 'Professional & Polished', 'Trendy & Fashion-Forward'].map((style) => (
                  <label key={style} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="style"
                      value={style}
                      className="mr-3"
                      checked={formData.style === style}
                      onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                    />
                    <span>{style}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <input
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.email ? 'border-red-500' : ''
              }`}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>
        );
    }
  };

  const getButtonText = () => {
    switch (formType) {
      case 'newsletter_signup': return 'Subscribe';
      case 'consultation_booking': return 'Book Consultation';
      case 'style_quiz': return 'Get Recommendations';
      default: return 'Submit';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{subtitle}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderFormFields()}
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : getButtonText()}
        </button>
      </form>
    </div>
  );
};

// Animated Counter Component
export const AnimatedCounter = ({ 
  end, 
  duration = 2000, 
  label, 
  prefix = "", 
  suffix = "" 
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`counter-${label}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [label]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <div id={`counter-${label}`} className="text-center">
      <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
        {prefix}{count}{suffix}
      </div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );
};

// Testimonials Section
export const TestimonialsSection = ({ 
  title, 
  subtitle, 
  testimonials, 
  colorScheme = "tech_startup" 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xl text-gray-600">
            {subtitle}
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="text-center">
              <div className="text-2xl md:text-3xl text-gray-600 mb-6 italic">
                "{testimonials[currentIndex].quote}"
              </div>
              <div className="flex items-center justify-center space-x-4">
                <img 
                  src={testimonials[currentIndex].avatar} 
                  alt={testimonials[currentIndex].name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonials[currentIndex].name}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {testimonials[currentIndex].position}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// CSS Animations
const styles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-in {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.8s ease-out forwards;
  }
  
  .animate-slide-in {
    animation: slide-in 0.8s ease-out forwards;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default {
  SplitScreenHero,
  FeatureGrid,
  TimelineFeatures,
  EnhancedLeadForm,
  AnimatedCounter,
  TestimonialsSection
}; 