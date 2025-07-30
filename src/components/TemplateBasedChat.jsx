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
    },
    trustIndicator1: "Join 10,000+ creators",
    trustIndicator2: "4.9/5 rating"
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
        const messages = result.messages || [];
        setMessages(messages);
        
        // Only switch to editor mode if there are AI-generated messages (not just user messages)
        const hasAIMessages = messages.some(msg => msg.role === 'assistant');
        if (hasAIMessages) {
          setIsEditorMode(true);
        } else {
          setIsEditorMode(false);
        }
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
      setIsEditorMode(false);
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
    
    // Load saved template data if it exists
    if (project.template_data) {
      setTemplateData(project.template_data);
    }
    
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
                Projects
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
        <div className="flex-1 flex flex-col min-h-0">
          {!isEditorMode ? (
            // Chat Mode
            <>
                              {/* Messages */}
                <div className="h-[calc(100vh-400px)] overflow-y-auto p-6 space-y-4">
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
              <div className="p-4">
                <div className="relative bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Describe your startup idea or business..."
                        className="w-full px-4 py-3 bg-transparent border-none outline-none resize-none text-text placeholder-mutedText text-lg leading-relaxed min-h-[80px] md:min-h-[60px] max-h-[400px] md:max-h-[200px]"
                        rows={4}
                        disabled={isLoading}
                        style={{ fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>
                  
                  {/* Submit Button - Positioned in bottom right corner */}
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className={`absolute bottom-6 right-6 p-3 rounded-full transition-colors duration-200 flex-shrink-0 ${
                      inputMessage.trim() && !isLoading
                        ? 'bg-black hover:bg-gray-800' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    title="Submit message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 -960 960 960" className={`shrink-0 h-6 w-6 ${inputMessage.trim() && !isLoading ? 'text-white' : 'text-gray-500'}`} fill="currentColor">
                      <path d="M442.39-616.87 309.78-487.26q-11.82 11.83-27.78 11.33t-27.78-12.33q-11.83-11.83-11.83-27.78 0-15.96 11.83-27.79l198.43-199q11.83-11.82 28.35-11.82t28.35 11.82l198.43 199q11.83 11.83 11.83 27.79 0 15.95-11.83 27.78-11.82 11.83-27.78 11.83t-27.78-11.83L521.61-618.87v348.83q0 16.95-11.33 28.28-11.32 11.33-28.28 11.33t-28.28-11.33q-11.33-11.33-11.33-28.28z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Editor Mode
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Editor</h3>
                  <p className="text-gray-600 mb-6">
                    Your landing page has been generated! Customize the content below and see changes in real-time.
                  </p>
                </div>
                
                {/* Hero Section Editor */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Hero Section
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                      <input
                        type="text"
                        value={templateData.businessName}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, businessName: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your business name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                      <input
                        type="text"
                        value={templateData.tagline}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, tagline: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your tagline"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hero Description</label>
                      <textarea
                        value={templateData.heroDescription}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, heroDescription: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Enter your hero description"
                      />
                    </div>
                  </div>
                </div>

                {/* Features Section Editor */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Features Section
                  </h4>
                  <div className="space-y-4">
                    {templateData.features.map((feature, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Feature {index + 1}</span>
                          <button
                            onClick={() => {
                              const newFeatures = templateData.features.filter((_, i) => i !== index);
                              setTemplateData(prev => ({ ...prev, features: newFeatures }));
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Icon</label>
                            <input
                              type="text"
                              value={feature.icon}
                              onChange={(e) => {
                                const newFeatures = [...templateData.features];
                                newFeatures[index].icon = e.target.value;
                                setTemplateData(prev => ({ ...prev, features: newFeatures }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="🚀"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Title</label>
                            <input
                              type="text"
                              value={feature.title}
                              onChange={(e) => {
                                const newFeatures = [...templateData.features];
                                newFeatures[index].title = e.target.value;
                                setTemplateData(prev => ({ ...prev, features: newFeatures }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Feature title"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Description</label>
                            <textarea
                              value={feature.description}
                              onChange={(e) => {
                                const newFeatures = [...templateData.features];
                                newFeatures[index].description = e.target.value;
                                setTemplateData(prev => ({ ...prev, features: newFeatures }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={2}
                              placeholder="Feature description"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newFeature = {
                          icon: "✨",
                          title: "New Feature",
                          description: "Add your feature description here"
                        };
                        setTemplateData(prev => ({
                          ...prev,
                          features: [...prev.features, newFeature]
                        }));
                      }}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                    >
                      + Add Feature
                    </button>
                  </div>
                </div>

                {/* About Section Editor */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    About Section
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">About Content</label>
                    <textarea
                      value={templateData.aboutContent}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, aboutContent: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Enter your about section content"
                    />
                  </div>
                </div>

                {/* Pricing Section Editor */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Pricing Section
                  </h4>
                  <div className="space-y-4">
                    {templateData.pricing.map((plan, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">{plan.name} Plan</span>
                          <button
                            onClick={() => {
                              const newPricing = templateData.pricing.filter((_, i) => i !== index);
                              setTemplateData(prev => ({ ...prev, pricing: newPricing }));
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Plan Name</label>
                            <input
                              type="text"
                              value={plan.name}
                              onChange={(e) => {
                                const newPricing = [...templateData.pricing];
                                newPricing[index].name = e.target.value;
                                setTemplateData(prev => ({ ...prev, pricing: newPricing }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Price</label>
                            <input
                              type="text"
                              value={plan.price}
                              onChange={(e) => {
                                const newPricing = [...templateData.pricing];
                                newPricing[index].price = e.target.value;
                                setTemplateData(prev => ({ ...prev, pricing: newPricing }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-600 mb-1">Description</label>
                            <input
                              type="text"
                              value={plan.description}
                              onChange={(e) => {
                                const newPricing = [...templateData.pricing];
                                newPricing[index].description = e.target.value;
                                setTemplateData(prev => ({ ...prev, pricing: newPricing }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-600 mb-1">CTA Button Text</label>
                            <input
                              type="text"
                              value={plan.cta}
                              onChange={(e) => {
                                const newPricing = [...templateData.pricing];
                                newPricing[index].cta = e.target.value;
                                setTemplateData(prev => ({ ...prev, pricing: newPricing }));
                              }}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newPlan = {
                          name: "New Plan",
                          price: "$0",
                          description: "Plan description",
                          features: ["Feature 1", "Feature 2"],
                          cta: "Get Started",
                          popular: false
                        };
                        setTemplateData(prev => ({
                          ...prev,
                          pricing: [...prev.pricing, newPlan]
                        }));
                      }}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                    >
                      + Add Pricing Plan
                    </button>
                  </div>
                </div>

                {/* Contact Section Editor */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={templateData.contactInfo.email}
                        onChange={(e) => setTemplateData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, email: e.target.value }
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="hello@yourcompany.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="text"
                        value={templateData.contactInfo.phone}
                        onChange={(e) => setTemplateData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, phone: e.target.value }
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Office Location</label>
                      <input
                        type="text"
                        value={templateData.contactInfo.office}
                        onChange={(e) => setTemplateData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, office: e.target.value }
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </div>
                </div>

                {/* Trust Indicators Editor */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                    Trust Indicators
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trust Indicator 1</label>
                      <input
                        type="text"
                        value={templateData.trustIndicator1}
                        onChange={(e) => setTemplateData(prev => ({ 
                          ...prev, 
                          trustIndicator1: e.target.value
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Join 10,000+ creators"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trust Indicator 2</label>
                      <input
                        type="text"
                        value={templateData.trustIndicator2}
                        onChange={(e) => setTemplateData(prev => ({ 
                          ...prev, 
                          trustIndicator2: e.target.value
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 4.9/5 rating"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setIsEditorMode(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      Back to Chat
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          // Save template data to project
                          const response = await fetch(`/api/projects/${currentProject.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              template_data: templateData
                            })
                          });
                          
                          if (response.ok) {
                            console.log('Template data saved successfully');
                            // Show success feedback
                            alert('Changes saved successfully!');
                          } else {
                            console.error('Failed to save template data');
                            alert('Failed to save changes. Please try again.');
                          }
                        } catch (error) {
                          console.error('Error saving template data:', error);
                          alert('Error saving changes. Please try again.');
                        }
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
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
                          trustIndicator1={templateData.trustIndicator1}
                          trustIndicator2={templateData.trustIndicator2}
                        />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateBasedChat; 