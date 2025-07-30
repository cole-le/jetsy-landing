import React, { useState, useEffect, useRef } from 'react';
import ProjectSelector from './ProjectSelector';
import ExceptionalTemplate from './ExceptionalTemplate';

const TemplateBasedChat = ({ onBackToHome }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [showProjectPanel, setShowProjectPanel] = useState(false);
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [templateData, setTemplateData] = useState({
    businessName: 'Your Amazing Startup',
    tagline: 'Transform your idea into reality with our innovative solution',
    heroDescription: 'Join thousands of satisfied customers who have already made the leap.',
    features: [
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
    aboutContent: "We understand the challenges of bringing ideas to life. That's why we've built a platform that makes it effortless to create professional landing pages that actually convert visitors into customers.",
    pricing: [
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
    contactInfo: {
      email: "hello@jetsy.com",
      phone: "+1 (555) 123-4567",
      office: "San Francisco, CA"
    }
  });

  // Load existing project when component mounts
  useEffect(() => {
    loadOrRestoreProject();
  }, []);

  const getStoredProjectId = () => {
    return localStorage.getItem('jetsy_current_project_id');
  };

  const setStoredProjectId = (projectId) => {
    localStorage.setItem('jetsy_current_project_id', projectId);
  };

  const loadOrRestoreProject = async () => {
    try {
      const storedProjectId = getStoredProjectId();
      
      if (storedProjectId) {
        const response = await fetch(`/api/projects/${storedProjectId}`);
        if (response.ok) {
          const result = await response.json();
          const project = result.project;
          setCurrentProject({
            id: project.id,
            project_name: project.project_name,
            files: JSON.parse(project.files)
          });
          await loadChatMessages(project.id);
          return;
        }
      }

      const projectsResponse = await fetch('/api/projects?user_id=1');
      if (projectsResponse.ok) {
        const result = await projectsResponse.json();
        if (result.projects && result.projects.length > 0) {
          const mostRecent = result.projects[0];
          setCurrentProject({
            id: mostRecent.id,
            project_name: mostRecent.project_name,
            files: JSON.parse(mostRecent.files)
          });
          setStoredProjectId(mostRecent.id);
          await loadChatMessages(mostRecent.id);
          return;
        }
      }

      await createDefaultProject();
    } catch (error) {
      console.error('Error loading/restoring project:', error);
      await createDefaultProject();
    }
  };

  const createDefaultProject = async () => {
    try {
      const projectData = {
        project_name: "AI Landing Page Builder",
        user_id: 1,
        files: {
          "src/App.jsx": `import React from 'react';\nimport './index.css';\nfunction App() {\n  return (\n    <div className=\"min-h-screen bg-gray-50\">\n      <div className=\"container mx-auto px-4 py-8\">\n        <h1 className=\"text-4xl font-bold text-center text-gray-900 mb-8\">Welcome to Your Landing Page</h1>\n        <p className=\"text-center text-gray-600 mb-8\">This is a placeholder. Start chatting to customize your landing page!</p>\n      </div>\n    </div>\n  );\n}\nexport default App;`,
          "src/index.css": `@tailwind base;\n@tailwind components;\n@tailwind utilities;`
        }
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        const result = await response.json();
        const newProject = { id: result.project_id, ...projectData };
        setCurrentProject(newProject);
        setStoredProjectId(result.project_id);
        await loadChatMessages(result.project_id);
      }
    } catch (error) {
      console.error('Error creating default project:', error);
    }
  };

  const loadChatMessages = async (projectId) => {
    try {
      const response = await fetch(`/api/chat_messages?project_id=${projectId}`);
      if (response.ok) {
        const result = await response.json();
        setMessages(result.messages || []);
        
        // If there are messages, switch to editor mode
        if (result.messages && result.messages.length > 0) {
          setIsEditorMode(true);
        }
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentProject) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      message: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Add user message to chat history
      await fetch('/api/chat_messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: currentProject.id,
          role: 'user',
          message: inputMessage,
          is_initial_message: messages.length === 0
        })
      });

      // Call AI to generate template content
      const aiResponse = await fetch('/api/template-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: currentProject.id,
          user_message: inputMessage,
          current_template_data: templateData
        })
      });

      if (aiResponse.ok) {
        const result = await aiResponse.json();
        
        // Update template data with AI-generated content
        if (result.template_data) {
          setTemplateData(result.template_data);
        }

        // Add AI response to chat
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          message: result.assistant_message || 'I\'ve updated your landing page with the new content!',
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, aiMessage]);

        // Switch to editor mode after first message
        if (messages.length === 0) {
          setIsEditorMode(true);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Fallback response
      const fallbackMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        message: 'I\'ve updated your landing page with the new content! You can now use the editor to make further customizations.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, fallbackMessage]);
      setIsEditorMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleProjectSelect = async (project) => {
    setCurrentProject({
      id: project.id,
      project_name: project.project_name,
      files: typeof project.files === 'string' ? JSON.parse(project.files) : project.files
    });
    setStoredProjectId(project.id);
    await loadChatMessages(project.id);
    setShowProjectPanel(false);
  };

  const handleAllProjectsDeleted = async () => {
    setCurrentProject(null);
    setMessages([]);
    setStoredProjectId(null);
    await createDefaultProject();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Side - Chat/Editor Panel */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToHome}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isEditorMode ? 'Template Editor' : 'AI Chat'}
                </h1>
                <p className="text-sm text-gray-500">
                  {currentProject?.project_name || 'Loading...'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  console.log('Toggling project panel, current state:', showProjectPanel);
                  setShowProjectPanel(!showProjectPanel);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Projects {showProjectPanel ? '(Hide)' : '(Show)'}
              </button>
            </div>
          </div>
        </div>

        {/* Project Panel */}
        {showProjectPanel && (
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="p-4">
              <ProjectSelector
                onProjectSelect={handleProjectSelect}
                currentProjectId={currentProject?.id}
                onAllProjectsDeleted={handleAllProjectsDeleted}
              />
            </div>
          </div>
        )}

        {/* Chat/Editor Content */}
        <div className="flex-1 flex flex-col">
          {!isEditorMode ? (
            // Chat Mode
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex space-x-4">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your startup idea or business..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Editor Mode
            <div className="flex-1 p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Editor</h3>
                  <p className="text-gray-600 mb-6">
                    Your landing page has been generated! You can now customize the content using the editor below.
                  </p>
                </div>
                
                {/* Editor will be implemented in the next step */}
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <p className="text-gray-500">Editor interface coming in the next step...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Live Preview */}
      <div className="w-3/4 bg-white flex flex-col">
        {/* Preview Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Real-time updates</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            <ExceptionalTemplate 
              businessName={templateData.businessName}
              tagline={templateData.tagline}
              heroDescription={templateData.heroDescription}
              features={templateData.features}
              aboutContent={templateData.aboutContent}
              pricing={templateData.pricing}
              contactInfo={templateData.contactInfo}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateBasedChat; 