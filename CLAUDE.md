# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start Vite development server (frontend)
- `npm run dev:worker` - Start Cloudflare Worker development server with remote bindings
- `npm run dev:pages` - Start Cloudflare Pages development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Database Operations
- `npm run db:create` - Create new D1 database
- `npm run db:migrate` - Apply schema.sql to database
- `npm run db:query` - Execute queries against D1 database

### Deployment
- `npm run deploy` - Deploy to Cloudflare Workers
- `npm run deploy:pages` - Deploy to Cloudflare Pages
- `npm run deploy:staging` - Deploy to staging environment
- `npm run deploy:production` - Deploy to production environment

### Production Deployment Commands
```bash
# 1. Build the main website
cd jetsy-pages && npm run build

# 2. Deploy main website to production
npx wrangler pages deploy dist --project-name=jetsy-pages --branch=main

# 3. Deploy worker to production
npx wrangler deploy --config wrangler.worker.toml
```

### Testing & Utilities
- `npm run test:image` - Test image generation functionality
- `npm run test:option2` - Test hybrid option functionality
- `npm run test:llm` - Test LLM integration
- `npm run clear:projects` - Clear all projects from database
- `npm run clear:database` - Completely clear database

## Architecture Overview

### Frontend (React + Vite)
- **Main App**: `src/App.jsx` - Central router handling different user flow steps (hero, pricing, lead-capture, onboarding, chat)
- **Components**: Modular React components in `src/components/`
- **Chat System**: Two main chat interfaces:
  - `ChatPage.jsx` - Full chat interface for project conversations
  - `TemplateBasedChat.jsx` - Template-based chat with live preview
  - `FloatingChatBox.jsx` - Cursor-style floating chat interface

### Backend (Cloudflare Workers)
- **Main Worker**: `src/worker.js` - API routes and business logic
- **Database**: Cloudflare D1 (SQLite) with schema in `schema.sql`
- **Storage**: R2 bucket for image storage (`jetsy-images-prod/dev`)
- **APIs**: RESTful endpoints for leads, onboarding, project management

### Key Components
- **HeroSection**: Landing page with chat input and visibility toggle
- **PricingModal**: Three-tier pricing (Free $0, Pro $15, Business $29)
- **LeadCaptureForm**: Email/phone collection with validation
- **OnboardingForm**: Detailed startup idea information collection
- **TemplateBasedChat**: AI-powered landing page generation with live preview

### Data Flow
1. User submits startup idea via chat input or floating chat
2. Leads captured in D1 database (`leads` table)
3. Onboarding data stored (`onboarding_data` table)
4. AI generates landing page templates using OpenAI/Gemini APIs
5. Projects tracked with analytics events (`tracking_events` table)

### AI Integration
- **OpenAI API**: Primary LLM for chat and content generation
- **Gemini API**: Alternative/backup LLM (Google GenAI)
- **Image Generation**: Google Gemini Imagen 3 integration via `utils/imageGeneration.js`
- **Knowledge Base**: AI prompts and templates in `utils/ai-knowledge-base.js`

### Database Schema
Key tables: `leads`, `ideas`, `plan_selections`, `onboarding_data`, `funnel_completions`, `tracking_events`, `projects`

### Environment Configuration
- **wrangler.toml**: Cloudflare configuration with D1 and R2 bindings
- **src/config/environment.js**: API base URL configuration
- Secrets: `OPENAI_API_KEY`, `GEMINI_API_KEY` (set via wrangler secret)

### Styling & Design
- **Tailwind CSS**: Utility-first styling
- **Light theme**: Lovable.dev inspired design with Inter font
- **Mobile-first**: Responsive design with smooth scaling
- **Color scheme**: `#F9F9F9` background, `#111827` primary text/buttons

### Analytics & Tracking
- **Google Tag Manager**: Event tracking integration
- **Custom Analytics**: `utils/analytics.js` for event tracking
- **Funnel Tracking**: Complete user journey from idea to conversion

### Deployment Architecture
- **Frontend**: Cloudflare Pages (static React build)
- **Backend**: Cloudflare Workers (API endpoints)
- **Database**: Cloudflare D1 (SQLite)
- **Images**: Cloudflare R2 Storage
- **Domain**: Custom domain support via Cloudflare

### Development Workflow
1. Frontend changes: Edit React components, test with `npm run dev`
2. Backend changes: Modify `src/worker.js`, test with `npm run dev:worker`
3. Database changes: Update `schema.sql`, apply with `npm run db:migrate`
4. Full deployment: `npm run build && npm run deploy`

### Testing Strategy
Multiple test files for different aspects:
- `test-*-images.js` - Image generation testing
- `test-*-llm.js` - LLM integration testing
- `test-*-option2.js` - Hybrid functionality testing
- `test-*-vercel-integration.js` - Vercel deployment testing