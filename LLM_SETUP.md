# LLM Integration Setup Guide

## 🤖 OpenAI API Integration

Your AI landing page builder now supports real LLM integration with OpenAI GPT-4!

### 📋 Setup Steps:

1. **Get OpenAI API Key**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Add API Key to Wrangler (Local Development)**
   ```bash
   npx wrangler secret put OPENAI_API_KEY
   # Enter your API key when prompted
   ```

3. **Add API Key to Production (Optional)**
   ```bash
   npx wrangler secret put OPENAI_API_KEY --env production
   ```

### 🧪 Testing the Integration:

1. **Start your development servers:**
   ```bash
   # Terminal 1: Vite dev server
   npm run dev
   
   # Terminal 2: Cloudflare Worker
   npx wrangler dev --port 8787
   ```

2. **Test the chat:**
   - Go to `http://localhost:3000/chat`
   - Type: "Create a landing page for my SaaS startup"
   - Watch the AI generate real code!

### 🔄 How It Works:

1. **Real LLM First**: If API key is available, uses OpenAI GPT-4
2. **Mock Fallback**: If no API key or API fails, uses mock responses
3. **Smart Prompts**: Sends comprehensive prompts for better code generation
4. **Error Handling**: Graceful fallback if API calls fail

### 💰 Cost Considerations:

- **GPT-4**: ~$0.03 per 1K tokens (input + output)
- **Typical request**: ~2-4K tokens = $0.06-0.12 per chat message
- **Mock mode**: Free, but limited functionality

### 🎯 What the LLM Can Do:

- ✅ Generate complete landing pages
- ✅ Modify existing code (colors, text, layout)
- ✅ Add new components and sections
- ✅ Optimize for conversions and UX
- ✅ Create responsive designs
- ✅ Add animations and interactions

### 🔧 Customization Options:

You can easily switch to other LLM providers:
- **Anthropic Claude**: Replace `callOpenAI` with Claude API
- **Google Gemini**: Use Gemini API for similar functionality
- **Local Models**: Use Ollama or similar for privacy

### 🚀 Next Steps:

1. **Test with real API key** - See the difference in code quality
2. **Implement live preview** - Show generated pages in real-time
3. **Add event tracking** - Track user interactions on generated pages
4. **Deploy to production** - Make it available to users

The system is now ready for real LLM-powered landing page generation! 🎉 