# Authentication System Setup

This project now includes a complete user authentication system built with Supabase.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account/project
2. Note your project URL and anon key from the project settings

### 2. Environment Variables

Create a `.env` file in your project root with:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Existing variables...
OPENAI_API_KEY=your-openai-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here
ADMIN_CHAT_PASSWORD=your-admin-password-here
VERCEL_API_TOKEN=your-vercel-api-token-here
```

### 3. Configure Supabase Auth

1. **Enable Email/Password Authentication:**
   - Go to Authentication > Providers in Supabase dashboard
   - Ensure Email provider is enabled

2. **Enable Google OAuth:**
   - In the same Providers section, enable Google provider
   - Set up Google OAuth credentials
   - Add redirect URI: `https://yourdomain.com/chat`

3. **Configure Redirect URLs:**
   - Go to Authentication > URL Configuration
   - Set Site URL to your app's base URL
   - Add redirect URLs:
     - `https://yourdomain.com/chat`
     - `https://yourdomain.com/profile`

### 4. Database Schema

The system automatically creates user profiles using Supabase's built-in auth tables. No additional database setup is required.

## 🔐 Features

- **Email/Password Sign Up & Login**
- **Google OAuth Integration**
- **Email Verification** (automatic)
- **User Profile Management**
- **Secure Session Management**
- **Protected Routes**

## 📱 User Flow

1. **Sign Up:** Users can create accounts with email/password or Google
2. **Email Verification:** Supabase automatically sends verification emails
3. **Login:** Users can sign in with email/password or Google
4. **Chat Access:** After authentication, users are redirected to `/chat`
5. **Profile Management:** Users can view/edit their profile via the profile icon

## 🛡️ Security Features

- JWT-based authentication
- Automatic session management
- Email verification required
- Secure password handling
- OAuth integration with Google

## 🔧 Development

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

### Testing Authentication

1. Start the development server
2. Navigate to the signup/login forms
3. Test both email/password and Google OAuth flows
4. Verify email verification works
5. Test profile management

## 📁 File Structure

```
src/
├── components/
│   └── auth/
│       ├── AuthProvider.jsx      # Authentication context
│       ├── SignUpForm.jsx        # User registration
│       ├── LoginForm.jsx         # User login (updated)
│       └── ProfilePage.jsx       # User profile management
├── config/
│   └── supabase.js              # Supabase client configuration
└── main.jsx                     # App wrapper with AuthProvider
```

## 🚨 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading:**
   - Ensure `.env` file is in project root
   - Restart development server after changes

2. **Google OAuth Not Working:**
   - Check redirect URIs in Supabase dashboard
   - Verify Google OAuth credentials

3. **Email Verification Issues:**
   - Check Supabase email templates
   - Verify SMTP settings

4. **Profile Not Loading:**
   - Check user metadata in Supabase auth
   - Verify user permissions

### Support

For authentication issues, check:
- Supabase dashboard logs
- Browser console errors
- Network tab for failed requests

## 🔄 Migration from Old System

The old fake authentication forms have been replaced with real Supabase authentication. Users will need to create new accounts, but the system maintains the same user experience flow.

## 📈 Next Steps

- Add password reset functionality
- Implement two-factor authentication
- Add social login providers (GitHub, etc.)
- User role management
- Advanced profile customization
