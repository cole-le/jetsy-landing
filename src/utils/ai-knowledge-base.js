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
    miami_beach: {
      primary: "#FF6B6B", // Coral pink
      secondary: "#4ECDC4", // Ocean blue
      accent: "#A55EEA", // Neon purple
      background: "#1A1A2E", // Dark blue
      text: "#FFFFFF"
    },
    tech_startup: {
      primary: "#3B82F6", // Blue
      secondary: "#6B7280", // Gray
      accent: "#10B981", // Green
      background: "#F9FAFB", // Light gray
      text: "#111827"
    },
    restaurant: {
      primary: "#F59E0B", // Orange
      secondary: "#DC2626", // Red
      accent: "#FEF3C7", // Cream
      background: "#FFFFFF",
      text: "#1F2937"
    },
    fitness: {
      primary: "#10B981", // Green
      secondary: "#1F2937", // Dark gray
      accent: "#F59E0B", // Yellow
      background: "#FFFFFF",
      text: "#111827"
    },
    luxury: {
      primary: "#111827", // Black
      secondary: "#F59E0B", // Gold
      accent: "#F9FAFB", // White
      background: "#FFFFFF",
      text: "#111827"
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
  // Hero Section
  hero: {
    structure: `
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-90"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">{title}</h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">{subtitle}</p>
          <button className="bg-accent text-white font-bold py-4 px-8 rounded-full hover:scale-105 transition-all">
            {ctaText}
          </button>
        </div>
      </section>
    `,
    variations: [
      "Background image with overlay",
      "Video background",
      "Animated gradient",
      "Parallax scrolling"
    ]
  },
  
  // Feature Section
  features: {
    structure: `
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{title}</h2>
            <p className="text-xl text-gray-600">{subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(feature => (
              <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa fa-{feature.icon} text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    `
  },
  
  // Lead Capture Form
  lead_form: {
    structure: `
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-gray-600">{subtitle}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="your@email.com"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
          />
          <input
            type="tel"
            placeholder="(555) 123-4567"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-6 rounded-lg hover:scale-105 transition-all"
          >
            {buttonText}
          </button>
        </form>
      </div>
    `,
    validation: {
      email: "/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/",
      phone: "/^[\\+]?[1-9][\\d]{0,15}$/"
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
  }
};

export const BUSINESS_TYPES = {
  miami_beach_bar: {
    name_suggestions: ["Neon Palms", "Sunset Sips", "Ocean Vibes", "Coral Coast"],
    tagline_suggestions: [
      "Where Miami Beach comes alive",
      "Experience the ultimate beachside nightlife",
      "Craft cocktails with ocean views"
    ],
    features: [
      "Signature cocktails",
      "Live music",
      "Oceanfront seating",
      "Happy hour specials"
    ],
    color_scheme: "miami_beach",
    cta_options: ["Book a Table", "Join the Party", "Reserve Now"]
  },
  
  tech_startup: {
    name_suggestions: ["TechFlow", "InnovateHub", "DataSync", "CloudCore"],
    tagline_suggestions: [
      "Transforming the future of technology",
      "Innovation at your fingertips",
      "Building tomorrow's solutions today"
    ],
    features: [
      "AI-powered solutions",
      "Cloud infrastructure",
      "Real-time analytics",
      "24/7 support"
    ],
    color_scheme: "tech_startup",
    cta_options: ["Start Free Trial", "Get Started", "Request Demo"]
  },
  
  restaurant: {
    name_suggestions: ["Culinary Haven", "Taste & Tradition", "Fresh Bites", "Kitchen Craft"],
    tagline_suggestions: [
      "Where every meal tells a story",
      "Crafting culinary excellence",
      "Fresh ingredients, bold flavors"
    ],
    features: [
      "Farm-to-table ingredients",
      "Chef's specials",
      "Private dining",
      "Catering services"
    ],
    color_scheme: "restaurant",
    cta_options: ["Make Reservation", "Order Online", "Book Catering"]
  },
  
  fitness: {
    name_suggestions: ["FitLife", "PowerGym", "Elite Fitness", "Peak Performance"],
    tagline_suggestions: [
      "Transform your body, transform your life",
      "Where strength meets community",
      "Your journey to peak fitness starts here"
    ],
    features: [
      "Personal training",
      "Group classes",
      "Nutrition coaching",
      "24/7 access"
    ],
    color_scheme: "fitness",
    cta_options: ["Join Now", "Free Trial", "Book Consultation"]
  }
};

export const IMAGE_GUIDELINES = {
  // Hero Images
  hero: {
    aspect_ratio: "16:9",
    style: "High-quality, professional, represents the business",
    examples: {
      miami_beach_bar: "Vibrant Miami Beach bar with neon lights, palm trees, and ocean view",
      tech_startup: "Modern office with people collaborating, screens with data, clean design",
      restaurant: "Beautiful food presentation, elegant dining room, chef in action",
      fitness: "People working out, modern gym equipment, energetic atmosphere"
    }
  },
  
  // Feature Images
  features: {
    aspect_ratio: "4:3",
    style: "Clean, focused on the specific feature or benefit",
    examples: {
      cocktails: "Artistically crafted cocktails with garnishes",
      technology: "Screens with data, mobile apps, cloud infrastructure",
      food: "Close-up of signature dishes, fresh ingredients",
      equipment: "Modern fitness equipment, people exercising"
    }
  },
  
  // Logo Concepts
  logo: {
    aspect_ratio: "1:1",
    style: "Simple, memorable, scalable",
    examples: {
      miami_beach_bar: "Palm tree with neon glow, cocktail glass, sunset colors",
      tech_startup: "Abstract geometric shapes, modern typography, blue gradient",
      restaurant: "Elegant typography, food icon, warm colors",
      fitness: "Dynamic movement, strength symbols, energetic colors"
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