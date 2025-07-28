// Enhanced AI Knowledge Base for Landing Page Generation
// This file contains comprehensive information about modern React libraries,
// design patterns, and best practices for the AI to reference

export const ENHANCED_BUSINESS_TYPES = {
  // E-commerce Store
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

  // Mobile App
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

  // Consulting Service
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

  // Online Course
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

  // Real Estate
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

  // Healthcare Wellness
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

  // Creative Agency
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

  // Subscription Box
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

  // Local Service
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

  // SaaS B2B
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

export const ENHANCED_COLOR_SCHEMES = {
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
};

export const ENHANCED_IMAGE_GUIDELINES = {
  hero: {
    aspect_ratio: "16:9",
    style: "High-quality, professional, represents the business",
    examples: {
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
  
  features: {
    aspect_ratio: "4:3",
    style: "Clean, focused on the specific feature or benefit",
    examples: {
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
  
  logo: {
    aspect_ratio: "1:1",
    style: "Simple, memorable, scalable",
    examples: {
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
  }
};

export const ENHANCED_PROMPT_TEMPLATES = {
  initial_generation: `
    Create a stunning, conversion-optimized landing page for a {business_type} called "{business_name}".
    
    DESIGN REQUIREMENTS:
    - Use {color_scheme} color palette with {primary_color} as primary
    - Implement {layout_variant} layout pattern
    - Include {form_type} lead capture form
    - Add {animation_style} animations and interactions
    - Ensure mobile-first responsive design
    
    CONTENT REQUIREMENTS:
    - Compelling hero section with {business_name} and "{tagline}"
    - {feature_count} feature sections highlighting: {features}
    - Social proof section with testimonials
    - Clear value proposition and benefits
    - Strong call-to-action: "{cta_text}"
    
    TECHNICAL REQUIREMENTS:
    - Modern React components with hooks
    - Tailwind CSS with custom gradients
    - Smooth scroll navigation
    - Form validation and error handling
    - Loading states and micro-interactions
  `,
  
  style_variations: {
    minimalist: "Clean, spacious design with lots of whitespace",
    bold_modern: "High contrast, geometric shapes, strong typography", 
    elegant_luxury: "Sophisticated colors, premium imagery, refined typography",
    playful_creative: "Bright colors, organic shapes, fun animations",
    corporate_professional: "Conservative colors, structured layout, business-focused"
  }
};

export default {
  ENHANCED_BUSINESS_TYPES,
  ENHANCED_COLOR_SCHEMES,
  ENHANCED_IMAGE_GUIDELINES,
  ENHANCED_PROMPT_TEMPLATES
}; 