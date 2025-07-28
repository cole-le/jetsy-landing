// AI Knowledge Base for Landing Page Generation
// This file contains comprehensive information about modern React libraries,
// design patterns, and best practices for the AI to reference

export const REACT_LIBRARIES = {
  // Animation Libraries
  framer_motion: {
    description: "Production-ready motion library for React",
    usage: "import { motion } from 'framer-motion'",
    examples: [
      "motion.div with animate, transition, and hover props",
      "motion.button with whileHover and whileTap",
      "AnimatePresence for exit animations"
    ],
    alternatives: ["react-spring", "react-transition-group"]
  },
  
  // UI Component Libraries
  headlessui: {
    description: "Unstyled, accessible UI components",
    usage: "import { Dialog, Menu, Transition } from '@headlessui/react'",
    examples: [
      "Dialog for modals and popups",
      "Menu for dropdown menus",
      "Transition for smooth animations"
    ]
  },
  
  // Icon Libraries
  heroicons: {
    description: "Beautiful hand-crafted SVG icons",
    usage: "import { BeakerIcon } from '@heroicons/react/24/outline'",
    examples: [
      "24x24 outline and solid icons",
      "20x20 mini icons",
      "Customizable stroke width and colors"
    ]
  },
  
  // Form Libraries
  react_hook_form: {
    description: "Performant forms with easy validation",
    usage: "import { useForm } from 'react-hook-form'",
    examples: [
      "Built-in validation with yup or zod",
      "Error handling and field registration",
      "Performance optimized re-renders"
    ]
  },
  
  // Styling Libraries
  tailwindcss: {
    description: "Utility-first CSS framework",
    usage: "className='bg-blue-500 hover:bg-blue-700'",
    examples: [
      "Responsive design with md:, lg: prefixes",
      "Dark mode with dark: prefix",
      "Custom animations and transitions"
    ]
  }
};

export const DESIGN_PATTERNS = {
  // Color Schemes
  color_schemes: {
    // Enhanced existing schemes
    miami_beach: {
      primary: "#FF6B6B", // Coral pink
      secondary: "#4ECDC4", // Ocean blue
      accent: "#A55EEA", // Neon purple
      background: "#1A1A2E", // Dark blue
      text: "#FFFFFF",
      gradient: "linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)"
    },
    tech_startup: {
      primary: "#3B82F6", // Blue
      secondary: "#6B7280", // Gray
      accent: "#10B981", // Green
      background: "#F9FAFB", // Light gray
      text: "#111827",
      gradient: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)"
    },
    restaurant: {
      primary: "#F59E0B", // Orange
      secondary: "#DC2626", // Red
      accent: "#FEF3C7", // Cream
      background: "#FFFFFF",
      text: "#1F2937",
      gradient: "linear-gradient(135deg, #F59E0B 0%, #DC2626 100%)"
    },
    fitness: {
      primary: "#10B981", // Green
      secondary: "#1F2937", // Dark gray
      accent: "#F59E0B", // Yellow
      background: "#FFFFFF",
      text: "#111827",
      gradient: "linear-gradient(135deg, #10B981 0%, #F59E0B 100%)"
    },
    luxury: {
      primary: "#111827", // Black
      secondary: "#F59E0B", // Gold
      accent: "#F9FAFB", // White
      background: "#FFFFFF",
      text: "#111827",
      gradient: "linear-gradient(135deg, #111827 0%, #F59E0B 100%)"
    },

    // NEW SOPHISTICATED COLOR SCHEMES
    
    ecommerce_fashion: {
      primary: "#FF6B9D", // Rose pink
      secondary: "#4A90E2", // Sky blue  
      accent: "#F8B500", // Golden yellow
      neutral: "#2C3E50", // Dark slate
      background: "#FAFAFA", // Off-white
      text: "#2C3E50",
      gradient: "linear-gradient(135deg, #FF6B9D 0%, #4A90E2 100%)"
    },
    
    mobile_app: {
      primary: "#6366F1", // Indigo
      secondary: "#EC4899", // Pink
      accent: "#10B981", // Emerald
      neutral: "#1F2937", // Gray-800
      background: "#FFFFFF",
      text: "#1F2937",
      gradient: "linear-gradient(135deg, #6366F1 0%, #EC4899 100%)"
    },
    
    consulting_service: {
      primary: "#1E40AF", // Blue-800
      secondary: "#7C3AED", // Violet-600
      accent: "#F59E0B", // Amber-500
      neutral: "#374151", // Gray-700
      background: "#F9FAFB",
      text: "#111827",
      gradient: "linear-gradient(135deg, #1E40AF 0%, #7C3AED 100%)"
    },
    
    online_education: {
      primary: "#059669", // Emerald-600
      secondary: "#7C3AED", // Violet-600
      accent: "#F59E0B", // Amber-500
      neutral: "#374151", // Gray-700
      background: "#FFFFFF",
      text: "#111827",
      gradient: "linear-gradient(135deg, #059669 0%, #7C3AED 100%)"
    },
    
    real_estate: {
      primary: "#DC2626", // Red-600
      secondary: "#1E40AF", // Blue-800
      accent: "#F59E0B", // Amber-500
      neutral: "#374151", // Gray-700
      background: "#FFFFFF",
      text: "#111827",
      gradient: "linear-gradient(135deg, #DC2626 0%, #1E40AF 100%)"
    },
    
    healthcare_wellness: {
      primary: "#059669", // Emerald-600
      secondary: "#3B82F6", // Blue-500
      accent: "#F59E0B", // Amber-500
      neutral: "#374151", // Gray-700
      background: "#F0FDF4", // Green-50
      text: "#111827",
      gradient: "linear-gradient(135deg, #059669 0%, #3B82F6 100%)"
    },
    
    creative_agency: {
      primary: "#7C3AED", // Violet-600
      secondary: "#EC4899", // Pink-500
      accent: "#F59E0B", // Amber-500
      neutral: "#1F2937", // Gray-800
      background: "#FFFFFF",
      text: "#111827",
      gradient: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)"
    },
    
    subscription_box: {
      primary: "#EC4899", // Pink-500
      secondary: "#8B5CF6", // Violet-500
      accent: "#F59E0B", // Amber-500
      neutral: "#374151", // Gray-700
      background: "#FDF2F8", // Pink-50
      text: "#111827",
      gradient: "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)"
    },
    
    local_service: {
      primary: "#1E40AF", // Blue-800
      secondary: "#059669", // Emerald-600
      accent: "#F59E0B", // Amber-500
      neutral: "#374151", // Gray-700
      background: "#FFFFFF",
      text: "#111827",
      gradient: "linear-gradient(135deg, #1E40AF 0%, #059669 100%)"
    },
    
    saas_b2b: {
      primary: "#1E40AF", // Blue-800
      secondary: "#374151", // Gray-700
      accent: "#10B981", // Emerald-500
      neutral: "#6B7280", // Gray-500
      background: "#F9FAFB", // Gray-50
      text: "#111827",
      gradient: "linear-gradient(135deg, #1E40AF 0%, #10B981 100%)"
    }
  },
  
  // Typography
  typography: {
    headings: {
      h1: "text-5xl md:text-7xl font-bold",
      h2: "text-4xl font-bold",
      h3: "text-2xl font-semibold",
      h4: "text-xl font-semibold"
    },
    body: {
      large: "text-xl",
      medium: "text-base",
      small: "text-sm"
    }
  },
  
  // Spacing
  spacing: {
    section: "py-20",
    container: "px-4",
    grid: "gap-8",
    button: "py-3 px-6"
  }
};

export const COMPONENT_PATTERNS = {
  // Hero Section Variants
  hero_variants: {
    split_screen: {
      description: "Two-column layout with image/text",
      structure: `
        <section className="min-h-screen flex items-center">
          <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-content">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">{title}</h1>
              <p className="text-xl md:text-2xl mb-8">{subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="primary-cta">{primaryCTA}</button>
                <button className="secondary-cta">{secondaryCTA}</button>
              </div>
            </div>
            <div className="image-content">
              <img src="{GENERATED_IMAGE_URL_HERO}" alt="Hero" className="rounded-2xl shadow-2xl" />
            </div>
          </div>
        </section>
      `
    },
    
    full_screen_video: {
      description: "Video background with overlay",
      structure: `
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <video className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop>
            <source src="{VIDEO_URL}" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative z-10 text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">{title}</h1>
            <p className="text-xl md:text-2xl mb-8">{subtitle}</p>
            <button className="primary-cta">{ctaText}</button>
          </div>
        </section>
      `
    },
    
    animated_gradient: {
      description: "Moving gradient background",
      structure: `
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent animate-gradient"></div>
          <div className="relative z-10 text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">{title}</h1>
            <p className="text-xl md:text-2xl mb-8 animate-fade-in-delay">{subtitle}</p>
            <button className="primary-cta animate-bounce">{ctaText}</button>
          </div>
        </section>
      `
    },
    
    parallax_scroll: {
      description: "Parallax scrolling effect",
      structure: `
        <section className="relative min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary transform translate-y-0 parallax-bg"></div>
          <div className="relative z-10 text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">{title}</h1>
            <p className="text-xl md:text-2xl mb-8">{subtitle}</p>
            <button className="primary-cta">{ctaText}</button>
          </div>
        </section>
      `
    }
  },
  
  // Feature Section Variants
  feature_variants: {
    grid_cards: {
      description: "Feature cards in grid layout",
      structure: `
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">{title}</h2>
              <p className="text-xl text-gray-600">{subtitle}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fa fa-{feature.icon} text-white text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-center">{feature.title}</h3>
                  <p className="text-gray-600 text-center">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      `
    },
    
    timeline: {
      description: "Chronological feature progression",
      structure: `
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">{title}</h2>
              <p className="text-xl text-gray-600">{subtitle}</p>
            </div>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-primary to-secondary"></div>
              {features.map((feature, index) => (
                <div key={index} className="relative mb-12">
                  <div className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="w-1/2 px-8">
                      <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
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
      `
    },
    
    comparison_table: {
      description: "Feature comparison matrix",
      structure: `
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">{title}</h2>
              <p className="text-xl text-gray-600">{subtitle}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left font-semibold">Features</th>
                    {plans.map(plan => (
                      <th key={plan.name} className="p-4 text-center font-semibold">{plan.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-4 font-medium">{feature.name}</td>
                      {plans.map(plan => (
                        <td key={plan.name} className="p-4 text-center">
                          {plan.features.includes(feature.name) ? (
                            <i className="fa fa-check text-green-500 text-xl"></i>
                          ) : (
                            <i className="fa fa-times text-red-500 text-xl"></i>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      `
    }
  },

  // Advanced Form Types
  form_variants: {
    newsletter_signup: {
      description: "Email + preferences",
      structure: `
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Stay Updated</h3>
            <p className="text-gray-600">Get the latest news and exclusive offers</p>
          </div>
          <form className="space-y-4">
            <div>
              <input type="email" placeholder="your@email.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Product updates</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Exclusive offers</span>
              </label>
            </div>
            <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      `
    },
    
    consultation_booking: {
      description: "Name, email, phone, service type, date",
      structure: `
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Book Your Consultation</h3>
            <p className="text-gray-600">Let's discuss your project</p>
          </div>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="First Name" className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
              <input type="text" placeholder="Last Name" className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <input type="email" placeholder="Email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
            <input type="tel" placeholder="Phone" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              <option>Select Service</option>
              <option>Strategy Consulting</option>
              <option>Design Services</option>
              <option>Development</option>
            </select>
            <input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
            <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
              Book Consultation
            </button>
          </form>
        </div>
      `
    },
    
    style_quiz: {
      description: "Interactive quiz for fashion",
      structure: `
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Find Your Style</h3>
            <p className="text-gray-600">Take our quick quiz to get personalized recommendations</p>
          </div>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">What's your preferred style?</h4>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name="style" className="mr-3" />
                  <span>Casual & Comfortable</span>
                </label>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name="style" className="mr-3" />
                  <span>Professional & Polished</span>
                </label>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name="style" className="mr-3" />
                  <span>Trendy & Fashion-Forward</span>
                </label>
              </div>
            </div>
            <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
              Get Recommendations
            </button>
          </div>
        </div>
      `
    }
  }
};

export const ANIMATION_PATTERNS = {
  // Fade In
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  },
  
  // Slide In
  slideIn: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.8 }
  },
  
  // Scale In
  scaleIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.5 }
  },
  
  // Hover Effects
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  
  // Gradient Animation
  gradient: {
    animation: "gradient 3s ease infinite",
    keyframes: `
      @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `
  },
  
  // Parallax
  parallax: {
    transform: "translateY(var(--parallax-y))",
    transition: "transform 0.1s ease-out"
  }
};

export const BUSINESS_TYPES = {
  // Existing types with enhancements
  miami_beach_bar: {
    name_suggestions: ["Neon Palms", "Sunset Sips", "Ocean Vibes", "Coral Coast", "Tropicana Nights"],
    tagline_suggestions: [
      "Where Miami Beach comes alive",
      "Experience the ultimate beachside nightlife",
      "Craft cocktails with ocean views",
      "Where every sunset tells a story"
    ],
    features: [
      "Signature cocktails",
      "Live music",
      "Oceanfront seating",
      "Happy hour specials",
      "Private events"
    ],
    color_scheme: "miami_beach",
    cta_options: ["Book a Table", "Join the Party", "Reserve Now", "Get VIP Access"],
    layout_variants: ["hero_slider", "split_screen", "full_screen_video"],
    form_types: ["reservation_form", "vip_signup", "event_booking"]
  },
  
  tech_startup: {
    name_suggestions: ["TechFlow", "InnovateHub", "DataSync", "CloudCore", "FutureStack"],
    tagline_suggestions: [
      "Transforming the future of technology",
      "Innovation at your fingertips",
      "Building tomorrow's solutions today",
      "Where ideas become reality"
    ],
    features: [
      "AI-powered solutions",
      "Cloud infrastructure",
      "Real-time analytics",
      "24/7 support",
      "Enterprise security"
    ],
    color_scheme: "tech_startup",
    cta_options: ["Start Free Trial", "Get Started", "Request Demo", "Join Beta"],
    layout_variants: ["dashboard_preview", "feature_grid", "testimonial_showcase"],
    form_types: ["trial_signup", "demo_request", "beta_access"]
  },
  
  restaurant: {
    name_suggestions: ["Culinary Haven", "Taste & Tradition", "Fresh Bites", "Kitchen Craft", "Gourmet Grove"],
    tagline_suggestions: [
      "Where every meal tells a story",
      "Crafting culinary excellence",
      "Fresh ingredients, bold flavors",
      "A dining experience like no other"
    ],
    features: [
      "Farm-to-table ingredients",
      "Chef's specials",
      "Private dining",
      "Catering services",
      "Wine pairing"
    ],
    color_scheme: "restaurant",
    cta_options: ["Make Reservation", "Order Online", "Book Catering", "View Menu"],
    layout_variants: ["food_gallery", "menu_showcase", "chef_story"],
    form_types: ["reservation_form", "catering_quote", "newsletter_signup"]
  },
  
  fitness: {
    name_suggestions: ["FitLife", "PowerGym", "Elite Fitness", "Peak Performance", "TransformHub"],
    tagline_suggestions: [
      "Transform your body, transform your life",
      "Where strength meets community",
      "Your journey to peak fitness starts here",
      "Unlock your potential"
    ],
    features: [
      "Personal training",
      "Group classes",
      "Nutrition coaching",
      "24/7 access",
      "Progress tracking"
    ],
    color_scheme: "fitness",
    cta_options: ["Join Now", "Free Trial", "Book Consultation", "Start Journey"],
    layout_variants: ["before_after", "class_schedule", "transformation_stories"],
    form_types: ["membership_signup", "consultation_booking", "fitness_assessment"]
  },

  // NEW BUSINESS TYPES - Based on industry best practices
  
  ecommerce_store: {
    name_suggestions: ["StyleHub", "TrendBox", "FashionForward", "ChicCollective", "LuxeCart"],
    tagline_suggestions: [
      "Curated fashion for the modern lifestyle",
      "Discover your unique style",
      "Fashion that fits your life",
      "Where style meets convenience"
    ],
    features: [
      "Curated collections",
      "Personalized recommendations",
      "Free shipping & returns",
      "Size finder tool",
      "Loyalty rewards"
    ],
    color_scheme: "ecommerce_fashion",
    cta_options: ["Shop Now", "Browse Collection", "Get 20% Off", "Join VIP"],
    layout_variants: ["product_grid", "category_browse", "trending_now"],
    form_types: ["newsletter_signup", "size_finder", "style_quiz", "wishlist"]
  },

  mobile_app: {
    name_suggestions: ["AppFlow", "MobileHub", "AppCraft", "SmartApp", "AppGenius"],
    tagline_suggestions: [
      "Your digital life, simplified",
      "Apps that make life better",
      "Innovation in your pocket",
      "Where convenience meets technology"
    ],
    features: [
      "Intuitive interface",
      "Cross-platform sync",
      "Offline functionality",
      "Real-time updates",
      "Advanced analytics"
    ],
    color_scheme: "mobile_app",
    cta_options: ["Download Now", "Try Free", "Join Beta", "Get Early Access"],
    layout_variants: ["app_preview", "feature_showcase", "user_reviews"],
    form_types: ["beta_signup", "download_tracking", "feedback_form"]
  },

  consulting_service: {
    name_suggestions: ["ConsultPro", "StrategyHub", "BusinessFlow", "ExpertEdge", "ConsultCraft"],
    tagline_suggestions: [
      "Transforming businesses through strategic insight",
      "Expert guidance for your success",
      "Where strategy meets execution",
      "Your business growth partner"
    ],
    features: [
      "Strategic planning",
      "Market analysis",
      "Process optimization",
      "Team training",
      "Ongoing support"
    ],
    color_scheme: "consulting_service",
    cta_options: ["Book Consultation", "Get Proposal", "Free Assessment", "Start Project"],
    layout_variants: ["case_studies", "expert_profiles", "service_matrix"],
    form_types: ["consultation_booking", "proposal_request", "assessment_quiz"]
  },

  online_course: {
    name_suggestions: ["LearnHub", "SkillCraft", "EduFlow", "CourseGenius", "LearnPro"],
    tagline_suggestions: [
      "Master new skills at your own pace",
      "Learn from industry experts",
      "Transform your career with knowledge",
      "Education that empowers"
    ],
    features: [
      "Expert-led courses",
      "Interactive lessons",
      "Progress tracking",
      "Community support",
      "Certificate completion"
    ],
    color_scheme: "online_education",
    cta_options: ["Start Learning", "Enroll Now", "Free Preview", "Join Course"],
    layout_variants: ["course_preview", "curriculum_showcase", "student_success"],
    form_types: ["course_enrollment", "free_preview", "newsletter_signup"]
  },

  real_estate: {
    name_suggestions: ["RealEstatePro", "PropertyHub", "HomeCraft", "EstateFlow", "PropertyGenius"],
    tagline_suggestions: [
      "Finding your perfect home",
      "Where dreams become addresses",
      "Your trusted real estate partner",
      "Excellence in property services"
    ],
    features: [
      "Property search",
      "Virtual tours",
      "Market analysis",
      "Financing options",
      "Professional guidance"
    ],
    color_scheme: "real_estate",
    cta_options: ["Search Properties", "Get Valuation", "Book Viewing", "Contact Agent"],
    layout_variants: ["property_gallery", "market_insights", "agent_profiles"],
    form_types: ["property_search", "valuation_request", "viewing_booking"]
  },

  healthcare_wellness: {
    name_suggestions: ["WellnessHub", "HealthFlow", "CareCraft", "WellnessPro", "HealthGenius"],
    tagline_suggestions: [
      "Your health, our priority",
      "Wellness that works",
      "Caring for your well-being",
      "Health solutions that heal"
    ],
    features: [
      "Telemedicine consultations",
      "Wellness programs",
      "Health monitoring",
      "Expert care team",
      "24/7 support"
    ],
    color_scheme: "healthcare_wellness",
    cta_options: ["Book Appointment", "Start Consultation", "Join Program", "Get Care"],
    layout_variants: ["service_overview", "doctor_profiles", "patient_testimonials"],
    form_types: ["appointment_booking", "consultation_request", "health_assessment"]
  },

  creative_agency: {
    name_suggestions: ["CreativeHub", "DesignFlow", "AgencyCraft", "CreativePro", "DesignGenius"],
    tagline_suggestions: [
      "Where creativity meets strategy",
      "Designing brands that matter",
      "Creative solutions that convert",
      "Your vision, our expertise"
    ],
    features: [
      "Brand identity design",
      "Digital marketing",
      "Web development",
      "Content creation",
      "Strategy consulting"
    ],
    color_scheme: "creative_agency",
    cta_options: ["Start Project", "Get Quote", "View Portfolio", "Book Consultation"],
    layout_variants: ["portfolio_showcase", "service_grid", "client_stories"],
    form_types: ["project_quote", "portfolio_request", "consultation_booking"]
  },

  subscription_box: {
    name_suggestions: ["BoxCraft", "SubscriptionHub", "CuratedBox", "BoxFlow", "SubscriptionPro"],
    tagline_suggestions: [
      "Curated surprises delivered monthly",
      "Discover amazing products",
      "Your monthly dose of joy",
      "Curated for you, delivered to you"
    ],
    features: [
      "Curated selections",
      "Flexible subscriptions",
      "Personalized preferences",
      "Free shipping",
      "Skip or cancel anytime"
    ],
    color_scheme: "subscription_box",
    cta_options: ["Start Subscription", "Get First Box", "Join Waitlist", "View Past Boxes"],
    layout_variants: ["box_preview", "past_boxes", "unboxing_experience"],
    form_types: ["subscription_signup", "preference_quiz", "waitlist_join"]
  },

  local_service: {
    name_suggestions: ["ServicePro", "LocalHub", "ServiceCraft", "LocalFlow", "ServiceGenius"],
    tagline_suggestions: [
      "Professional services, local expertise",
      "Your trusted local service provider",
      "Quality service, guaranteed",
      "Local experts you can trust"
    ],
    features: [
      "Licensed professionals",
      "Same-day service",
      "Satisfaction guarantee",
      "Emergency response",
      "Transparent pricing"
    ],
    color_scheme: "local_service",
    cta_options: ["Book Service", "Get Quote", "Emergency Call", "Schedule Visit"],
    layout_variants: ["service_areas", "professional_profiles", "service_gallery"],
    form_types: ["service_booking", "quote_request", "emergency_contact"]
  },

  saas_b2b: {
    name_suggestions: ["SaaSFlow", "EnterpriseHub", "BusinessCraft", "SaaSPro", "EnterpriseGenius"],
    tagline_suggestions: [
      "Enterprise solutions that scale",
      "Powering business growth",
      "Software that works for you",
      "Enterprise-grade simplicity"
    ],
    features: [
      "Scalable infrastructure",
      "Enterprise security",
      "API integration",
      "Custom solutions",
      "Dedicated support"
    ],
    color_scheme: "saas_b2b",
    cta_options: ["Start Free Trial", "Request Demo", "Get Pricing", "Contact Sales"],
    layout_variants: ["dashboard_preview", "integration_showcase", "case_studies"],
    form_types: ["trial_signup", "demo_request", "pricing_quote", "sales_contact"]
  }
};

export const IMAGE_GUIDELINES = {
  // Hero Images
  hero: {
    aspect_ratio: "16:9",
    style: "High-quality, professional, represents the business",
    examples: {
      miami_beach_bar: "Vibrant Miami Beach bar with neon lights, palm trees, and ocean view, people enjoying cocktails",
      tech_startup: "Modern office with people collaborating, screens with data, clean design, innovation atmosphere",
      restaurant: "Beautiful food presentation, elegant dining room, chef in action, warm lighting",
      fitness: "People working out, modern gym equipment, energetic atmosphere, transformation focus",
      ecommerce_store: "Stylish fashion models, modern retail space, product displays, shopping experience",
      mobile_app: "Smartphone with app interface, modern UI design, user interaction, digital lifestyle",
      consulting_service: "Professional business meeting, charts and graphs, modern office, strategic planning",
      online_course: "Students learning online, laptop screens, educational content, knowledge sharing",
      real_estate: "Beautiful modern house, real estate agent, property viewing, luxury home",
      healthcare_wellness: "Medical professionals, wellness activities, modern clinic, health and care",
      creative_agency: "Creative workspace, design tools, portfolio showcase, artistic collaboration",
      subscription_box: "Unboxing experience, curated products, monthly delivery, surprise elements",
      local_service: "Professional service provider, local business, quality work, customer satisfaction",
      saas_b2b: "Enterprise software dashboard, business analytics, team collaboration, professional tools"
    }
  },
  
  // Feature Images
  features: {
    aspect_ratio: "4:3",
    style: "Clean, focused on the specific feature or benefit",
    examples: {
      cocktails: "Artistically crafted cocktails with garnishes, bar setting",
      technology: "Screens with data, mobile apps, cloud infrastructure, digital tools",
      food: "Close-up of signature dishes, fresh ingredients, culinary excellence",
      equipment: "Modern fitness equipment, people exercising, workout environment",
      fashion: "Stylish clothing items, fashion accessories, modern styling",
      app_interface: "Mobile app screens, user interface, app features",
      business_strategy: "Strategic planning, business charts, consulting process",
      learning: "Online course interface, educational content, learning progress",
      properties: "Beautiful homes, property features, real estate listings",
      healthcare: "Medical services, wellness activities, health monitoring",
      design_work: "Creative design process, portfolio pieces, artistic work",
      subscription: "Monthly box contents, curated products, delivery experience",
      service_quality: "Professional service delivery, quality workmanship",
      enterprise: "Business software, team collaboration, enterprise solutions"
    }
  },
  
  // Logo Concepts
  logo: {
    aspect_ratio: "1:1",
    style: "Simple, memorable, scalable",
    examples: {
      miami_beach_bar: "Palm tree with neon glow, cocktail glass, sunset colors, beach vibes",
      tech_startup: "Abstract geometric shapes, modern typography, blue gradient, innovation",
      restaurant: "Elegant typography, food icon, warm colors, culinary excellence",
      fitness: "Dynamic movement, strength symbols, energetic colors, transformation",
      ecommerce_store: "Modern shopping bag, fashion icon, stylish typography, retail",
      mobile_app: "App icon design, modern symbols, digital interface, technology",
      consulting_service: "Professional badge, business symbols, trust indicators, expertise",
      online_course: "Graduation cap, book icon, learning symbols, education",
      real_estate: "House icon, key symbol, property markers, real estate",
      healthcare_wellness: "Medical cross, wellness symbols, health indicators, care",
      creative_agency: "Creative tools, design elements, artistic symbols, innovation",
      subscription_box: "Gift box, surprise elements, delivery symbols, curation",
      local_service: "Service tools, local markers, quality symbols, professionalism",
      saas_b2b: "Enterprise symbols, business tools, professional design, technology"
    }
  },

  // Background Images
  background: {
    aspect_ratio: "16:9",
    style: "Subtle, non-distracting, enhances content",
    examples: {
      miami_beach_bar: "Blurred beach scene, ocean waves, sunset colors",
      tech_startup: "Abstract technology patterns, digital networks, modern office",
      restaurant: "Subtle food textures, kitchen elements, dining atmosphere",
      fitness: "Gym environment, workout equipment, energetic patterns",
      ecommerce_store: "Fashion runway, shopping environment, retail space",
      mobile_app: "Digital patterns, app interfaces, technology background",
      consulting_service: "Business environment, professional setting, corporate",
      online_course: "Educational environment, learning materials, knowledge",
      real_estate: "Beautiful properties, architectural elements, luxury homes",
      healthcare_wellness: "Medical environment, wellness activities, health",
      creative_agency: "Creative workspace, design elements, artistic background",
      subscription_box: "Gift wrapping, delivery elements, surprise background",
      local_service: "Service environment, professional tools, local business",
      saas_b2b: "Enterprise environment, business tools, professional setting"
    }
  }
};

export const RESPONSIVE_PATTERNS = {
  // Mobile First
  mobile: {
    text: {
      h1: "text-3xl",
      h2: "text-2xl",
      h3: "text-xl",
      body: "text-base"
    },
    spacing: {
      section: "py-12",
      container: "px-4",
      grid: "gap-4"
    }
  },
  
  // Tablet
  tablet: {
    text: {
      h1: "md:text-5xl",
      h2: "md:text-3xl",
      h3: "md:text-2xl"
    },
    spacing: {
      section: "md:py-16",
      grid: "md:gap-6"
    }
  },
  
  // Desktop
  desktop: {
    text: {
      h1: "lg:text-7xl",
      h2: "lg:text-4xl",
      h3: "lg:text-2xl"
    },
    spacing: {
      section: "lg:py-20",
      grid: "lg:gap-8"
    }
  }
};

export const ACCESSIBILITY_GUIDELINES = {
  // Color Contrast
  contrast: {
    minimum: "4.5:1 for normal text",
    large_text: "3:1 for large text (18pt+)",
    decorative: "No contrast requirements for decorative elements"
  },
  
  // Keyboard Navigation
  keyboard: {
    focus_visible: "Always show focus indicators",
    tab_order: "Logical tab order",
    skip_links: "Provide skip navigation links"
  },
  
  // Screen Readers
  screen_readers: {
    alt_text: "Descriptive alt text for images",
    aria_labels: "Use aria-label for interactive elements",
    headings: "Proper heading hierarchy (h1, h2, h3)"
  }
};

export const PERFORMANCE_BEST_PRACTICES = {
  // Image Optimization
  images: {
    format: "Use WebP with fallback to JPEG",
    lazy_loading: "Implement lazy loading for images below the fold",
    responsive: "Serve appropriate sizes for different screen sizes"
  },
  
  // Code Splitting
  code_splitting: {
    routes: "Split by routes",
    components: "Lazy load heavy components",
    libraries: "Load third-party libraries asynchronously"
  },
  
  // Caching
  caching: {
    static_assets: "Cache static assets with long TTL",
    api_responses: "Cache API responses appropriately",
    cdn: "Use CDN for global delivery"
  }
};

export default {
  REACT_LIBRARIES,
  DESIGN_PATTERNS,
  COMPONENT_PATTERNS,
  ANIMATION_PATTERNS,
  BUSINESS_TYPES,
  IMAGE_GUIDELINES,
  RESPONSIVE_PATTERNS,
  ACCESSIBILITY_GUIDELINES,
  PERFORMANCE_BEST_PRACTICES
}; 