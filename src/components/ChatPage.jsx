import React, { useState, useEffect, useRef } from 'react';
import DeploymentButton from './DeploymentButton';
import ProjectSelector from './ProjectSelector';
import { DEFAULT_TEMPLATE_DATA } from './TemplateBasedChat';
import { getApiBaseUrl, getVercelApiBaseUrl } from '../config/environment';
import { useAuth } from './auth/AuthProvider';
import VisibilityToggle from './VisibilityToggle';

const ChatPage = ({ onBackToHome }) => {
  const { user, session, isAuthenticated, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [showProjectPanel, setShowProjectPanel] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [mobileView, setMobileView] = useState('chat'); // 'chat' or 'preview'
  const iframeRef = useRef(null);
  const [showPublishPanel, setShowPublishPanel] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // Load existing chat history when component mounts and session is available
  useEffect(() => {
    if (session && !authLoading) {
      console.log('🚀 Session available, loading/restoring project...');
      loadOrRestoreProject();
    }
  }, [session, authLoading]);

  // Dispatch project name update event when currentProject changes
  useEffect(() => {
    if (currentProject?.project_name) {
      window.dispatchEvent(new CustomEvent('project-name-update', { 
        detail: { projectName: currentProject.project_name } 
      }));
    }
  }, [currentProject?.project_name]);

  // Clear stored project ID when user changes
  useEffect(() => {
    if (user?.id) {
      console.log('👤 User changed, clearing stored project ID to ensure fresh start');
      clearStoredProjectId();
    }
  }, [user?.id]);

  // Detect mobile screen and set default view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        setMobileView('chat'); // Default to chat view on mobile
      }
    };

  // Update current project visibility when toggled in header
  const handleProjectVisibilityChange = (projectId, newVisibility) => {
    if (currentProject?.id === projectId) {
      setCurrentProject(prev => ({ ...prev, visibility: newVisibility }));
    }
  };

    // Set initial view
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Session-based project tracking
  const getStoredProjectId = () => {
    return localStorage.getItem('jetsy_current_project_id');
  };

  const setStoredProjectId = (projectId) => {
    localStorage.setItem('jetsy_current_project_id', projectId);
  };

  const clearStoredProjectId = () => {
    localStorage.removeItem('jetsy_current_project_id');
    // Also clear the non-scoped cached project name to avoid showing stale names
    try { localStorage.removeItem('jetsy_current_project_name'); } catch (_) {}
    console.log('🗑️ Cleared stored project ID and cached name from localStorage');
  };

  // Cache project name in both global and per-project scoped keys for Navbar/UI hydration
  const setCachedProjectName = (name, projectId) => {
    try {
      if (typeof name === 'string' && name.length) {
        localStorage.setItem('jetsy_current_project_name', name);
        if (projectId) {
          localStorage.setItem(`jetsy_project_name_${projectId}`, name);
        }
      }
    } catch (_) {
      // ignore storage failures
    }
  };

  const loadOrRestoreProject = async () => {
    try {
      console.log('🔍 loadOrRestoreProject called');
      console.log('👤 Current user:', user);
      console.log('🔑 Current session:', session);
      console.log('🎫 Access token available:', !!session?.access_token);
      
      // Ensure we have a valid session before proceeding
      if (!session?.access_token) {
        console.log('⚠️ No valid session available, cannot load projects');
        // Clear any stored project ID since we can't verify ownership
        clearStoredProjectId();
        return;
      }
      
      // First, try to restore from session storage
      const storedProjectId = getStoredProjectId();
      console.log('💾 Stored project ID:', storedProjectId);
      
      if (storedProjectId) {
        // Try to load the stored project with auth headers to verify ownership
        console.log('📁 Loading stored project:', storedProjectId);
        const headers = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        const response = await fetch(`${getApiBaseUrl()}/api/projects/${storedProjectId}`, {
          headers
        });
        
        if (response.ok) {
          const result = await response.json();
          const project = result.project;
          console.log('✅ Stored project loaded:', project);
          
          // Verify this project belongs to the current user by checking if it has template_data
          // If it's a valid project for this user, it should have been loaded with proper auth
          if (project && project.project_name) {
            setCurrentProject({
              id: project.id,
              project_name: project.project_name,
              files: JSON.parse(project.files),
              visibility: project.visibility
            });
            // Cache the project name for Navbar hydration
            setCachedProjectName(project.project_name, project.id);
          
          // Dispatch project name update event
          window.dispatchEvent(new CustomEvent('project-name-update', { 
            detail: { projectName: project.project_name } 
          }));
          
          await loadChatMessages(project.id);
            
            // On mobile, switch back to chat view when loading a project
            if (window.innerWidth < 1024) {
              setMobileView('chat');
            }
            return;
          } else {
            console.log('⚠️ Stored project is invalid or belongs to another user, clearing storage');
            // Clear the invalid stored project ID
            clearStoredProjectId();
          }
        } else {
          console.log('⚠️ Failed to load stored project, clearing storage');
          // Clear the invalid stored project ID
          clearStoredProjectId();
        }
      }

      // If no stored project or it doesn't exist, load the most recent project
      console.log('🔄 No stored project, loading most recent project...');
      
      // Ensure user is authenticated
      if (!user?.id) {
        console.log('⚠️ No authenticated user, cannot load projects');
        return;
      }
      
      console.log('👤 User authenticated, preparing auth headers');
      const projectsResponse = await fetch(`${getApiBaseUrl()}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      console.log('📡 Projects API response status:', projectsResponse.status);
        if (projectsResponse.ok) {
          const result = await projectsResponse.json();
          console.log('📋 Projects API result:', result);
          if (result.projects && result.projects.length > 0) {
            const mostRecent = result.projects[0];
            console.log('🎯 Most recent project:', mostRecent);
            setCurrentProject({
              id: mostRecent.id,
              project_name: mostRecent.project_name,
              files: JSON.parse(mostRecent.files),
              visibility: mostRecent.visibility
            });
            setStoredProjectId(mostRecent.id);
            setCachedProjectName(mostRecent.project_name, mostRecent.id);
            
            // Dispatch project name update event
            window.dispatchEvent(new CustomEvent('project-name-update', { 
              detail: { projectName: mostRecent.project_name } 
            }));
            
            await loadChatMessages(mostRecent.id);
            
            // On mobile, switch back to chat view when loading the most recent project
            if (window.innerWidth < 1024) {
              setMobileView('chat');
            }
            return;
          }
        } else {
          console.error('❌ Failed to load projects:', projectsResponse.status, projectsResponse.statusText);
        }
      

      // If no projects exist, create a default one
      try {
        await createDefaultProject();
      } catch (error) {
        console.error('Error creating default project:', error);
      }
    } catch (error) {
      console.error('Error loading/restoring project:', error);
      // Fallback to creating a default project
      await createDefaultProject();
      
      // On mobile, switch back to chat view when there's an error
      if (window.innerWidth < 1024) {
        setMobileView('chat');
      }
    }
  };

  const createDefaultProject = async () => {
    try {
      console.log('🏗️ createDefaultProject called');
      console.log('👤 Current user:', user);
      console.log('🔑 Current session:', session);
      console.log('🎫 Access token available:', !!session?.access_token);
      
      const projectData = {
        project_name: "New business",
        files: {
          "src/App.jsx": `import React from 'react';\nimport './index.css';\nfunction App() {\n  return (\n    <div className=\"min-h-screen bg-gray-50\">\n      <div className=\"container mx-auto px-8\">\n        <h1 className=\"text-4xl font-bold text-center text-gray-900 mb-8\">Welcome to Your Landing Page</h1>\n        <p className=\"text-center text-gray-600 mb-8\">This is a placeholder. Start chatting to customize your landing page!</p>\n      </div>\n    </div>\n  );\n}\nexport default App;`,
          "src/index.css": `@tailwind base;\n@tailwind components;\n@tailwind utilities;`
        },
        // Don't include template_data for new projects - let users chat first
      };

      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        console.log('🔐 Auth header added to request');
      } else {
        console.log('⚠️ No auth token available');
      }

      console.log('📡 Creating project with headers:', headers);
      const response = await fetch(`${getApiBaseUrl()}/api/projects`, {
        method: 'POST',
        headers,
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        const result = await response.json();
        const newProject = { id: result.project_id, visibility: 'private', ...projectData };
        setCurrentProject(newProject);
        setStoredProjectId(result.project_id);
        setCachedProjectName(newProject.project_name, result.project_id);
        
        // Dispatch project name update event
        window.dispatchEvent(new CustomEvent('project-name-update', { 
          detail: { projectName: newProject.project_name } 
        }));
        
        await loadChatMessages(result.project_id);
        
        // On mobile, switch back to chat view when creating a default project
        if (window.innerWidth < 1024) {
          setMobileView('chat');
        }
      }
    } catch (error) {
      console.error('Error creating default project:', error);
      
      // On mobile, switch back to chat view when there's an error creating a default project
      if (window.innerWidth < 1024) {
        setMobileView('chat');
      }
    }
  };

  const handleProjectSelect = async (project) => {
    setCurrentProject({
      id: project.id,
      project_name: project.project_name,
      files: typeof project.files === 'string' ? JSON.parse(project.files) : project.files,
      visibility: project.visibility
    });
    setStoredProjectId(project.id);
    setCachedProjectName(project.project_name, project.id);
    
    // Dispatch project name update event
    window.dispatchEvent(new CustomEvent('project-name-update', { 
      detail: { projectName: project.project_name } 
    }));
    
    await loadChatMessages(project.id);
    setShowProjectPanel(false);
    
    // On mobile, switch back to chat view when selecting a project
    if (window.innerWidth < 1024) {
      setMobileView('chat');
    }
  };

  const handleAllProjectsDeleted = async () => {
    setCurrentProject(null);
    setMessages([]);
    clearStoredProjectId();
    // Create a new default project
    await createDefaultProject();
    
    // On mobile, switch back to chat view when all projects are deleted
    if (window.innerWidth < 1024) {
      setMobileView('chat');
    }
  };

  const loadChatMessages = async (projectId) => {
    try {
      const headers = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(`${getApiBaseUrl()}/api/chat_messages?project_id=${projectId}`, {
        headers
      });
      if (response.ok) {
        const result = await response.json();
        setMessages(result.messages || []);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
      
      // On mobile, switch back to chat view when there's an error loading chat messages
      if (window.innerWidth < 1024) {
        setMobileView('chat');
      }
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
    setPreviewLoading(true);
    setPreviewError(null);

    try {
      // 1. Add user message to chat history
      // Check if this is the first message for this project
      const isInitialMessage = messages.length === 0;
      
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      await fetch(`${getApiBaseUrl()}/api/chat_messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          project_id: currentProject.id,
          role: 'user',
          message: inputMessage,
          is_initial_message: isInitialMessage
        })
      });

      // 2. Call appropriate LLM orchestration endpoint based on whether this is initial generation
      let llmResponse;
      if (isInitialMessage) {
        // For initial messages, use template-based orchestration to generate exceptional template
        console.log('🎨 Using template-based orchestration for initial message');
        llmResponse = await fetch(`${getApiBaseUrl()}/api/llm-orchestrate-template`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            project_id: currentProject.id,
            user_message: inputMessage,
            current_files: currentProject.files,
            is_initial_generation: true
          })
        });
      } else {
        // For subsequent messages, use regular LLM orchestration
        console.log('🤖 Using regular LLM orchestration for follow-up message');
        llmResponse = await fetch(`${getApiBaseUrl()}/api/llm-orchestrate`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            project_id: currentProject.id,
            user_message: inputMessage,
            current_files: currentProject.files
          })
        });
      }

      if (llmResponse.ok) {
        const result = await llmResponse.json();
        
        // Check if we need clarification (only for regular LLM orchestration)
        if (!isInitialMessage && result.needs_clarification) {
          // Handle clarification response
          const clarificationMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            message: result.message,
            timestamp: new Date().toISOString(),
            clarification_questions: result.clarification_questions,
            current_question: result.current_question,
            current_question_index: result.current_question_index,
            clarification_answers: result.clarification_answers,
            needs_clarification: true
          };
          
          // Store clarification state for tracking the conversation
          const clarificationState = {
            clarificationQuestions: result.clarification_questions,
            currentQuestionIndex: result.current_question_index,
            clarificationAnswers: result.clarification_answers || {}
          };
          
          await fetch(`${getApiBaseUrl()}/api/chat_messages`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              project_id: currentProject.id,
              role: 'assistant',
              message: result.message,
              clarification_state: JSON.stringify(clarificationState),
              is_initial_message: false
            })
          });
          
          setMessages(prev => [...prev, clarificationMessage]);
          return; // Don't proceed with file updates for clarification
        }
        
        // 3. Update project files if LLM made changes
        if (result.updated_files) {
          await fetch(`${getApiBaseUrl()}/api/projects/${currentProject.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files: result.updated_files })
          });
          setCurrentProject(prev => ({
            ...prev,
            files: result.updated_files
          }));
        }
        // 4. Add assistant response to chat with backup information
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          message: result.assistant_message || result.message,
          timestamp: new Date().toISOString(),
          backup_id: result.backup_id,
          can_restore: result.can_restore
        };
        await fetch(`${getApiBaseUrl()}/api/chat_messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: currentProject.id,
            role: 'assistant',
            message: result.assistant_message || result.message,
            backup_id: result.backup_id,
            is_initial_message: false
          })
        });
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Fallback response if LLM endpoint fails
        const fallbackMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          message: 'I understand you want to create a landing page. I\'ll help you build one step by step. What kind of startup or product are you working on?',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, fallbackMessage]);
        
        // On mobile, switch back to chat view when there's a fallback response
        if (window.innerWidth < 1024) {
          setMobileView('chat');
        }
      }
    } catch (error) {
      console.error('Error in LLM orchestration:', error);
      // Fallback response on error
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // On mobile, switch back to chat view when there's an error in LLM orchestration
      if (window.innerWidth < 1024) {
        setMobileView('chat');
      }
    } finally {
      setIsLoading(false);
      setPreviewLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRestoreWeb = async (backupId) => {
    if (!currentProject?.id) {
      console.error('No current project to restore');
      return;
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/restore-web`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: currentProject.id,
          backup_id: backupId
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update current project with restored files
        setCurrentProject(prev => ({
          ...prev,
          files: result.files
        }));

        // Refresh the preview
        setPreviewLoading(true);
        
        // Show success message
        alert('Website restored successfully!');
        
        // On mobile, switch back to chat view when restoring a project
        if (window.innerWidth < 1024) {
          setMobileView('chat');
        }
      } else {
        const error = await response.json();
        alert(`Failed to restore website: ${error.error}`);
      }
    } catch (error) {
      console.error('Error restoring website:', error);
      alert('Failed to restore website. Please try again.');
      
      // On mobile, switch back to chat view when there's an error restoring website
      if (window.innerWidth < 1024) {
        setMobileView('chat');
      }
    }
  };

  // --- Live Preview Logic ---
  useEffect(() => {
    // Whenever files change, reload the preview
    if (!currentProject || !currentProject.files) return;
    
    console.log('🔄 Updating preview with new files:', Object.keys(currentProject.files));
    setPreviewLoading(true);
    setPreviewError(null);
    
    // Debounce to avoid flicker
    const timeout = setTimeout(() => {
      if (iframeRef.current) {
        const html = generatePreviewHTML();
        console.log('📄 Setting iframe content, length:', html.length);
        iframeRef.current.srcdoc = html;
      } else {
        console.warn('⚠️ iframeRef.current is null');
      }
      setPreviewLoading(false);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [currentProject?.files]);

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'preview-error') {
        setPreviewError(event.data.error);
        setPreviewLoading(false);
      } else if (event.data && event.data.type === 'preview-success') {
        setPreviewError(null);
        setPreviewLoading(false);
        console.log('Preview loaded successfully');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Handle iframe load events
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const handleLoad = () => {
        console.log('Iframe loaded');
        setIsIframeLoaded(true);
      };
      
      iframe.addEventListener('load', handleLoad);
      return () => iframe.removeEventListener('load', handleLoad);
    }
  }, []);

  // Close project selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProjectSelector && !event.target.closest('.project-selector-container')) {
        setShowProjectSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProjectSelector]);

  const generatePreviewHTML = () => {
    if (!currentProject || !currentProject.files) {
      return '<html><body><p>No preview available</p></body></html>';
    }
    // Get the main App component
    let appCode = currentProject.files['src/App.jsx'] || currentProject.files['App.jsx'];
    const cssCode = currentProject.files['src/index.css'] || currentProject.files['index.css'] || '';
    if (!appCode) {
      return '<html><body><p>No App component found</p></body></html>';
    }
    
    // Debug: Log the original code
    console.log('Original App.jsx code:', appCode.substring(0, 500) + '...');
    
    // Process the code to work in the iframe
    let processedCode = appCode
      // Remove all import/export statements
      .replace(/^import .*;?$/gm, '')
      .replace(/^export .*;?$/gm, '')
      .replace(/export (function|class) /g, '$1 ')
      // Fix common JSX issues
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=');
    
    // Debug: Log the processed code
    console.log('Processed App.jsx code:', processedCode.substring(0, 500) + '...');
    
    // The injected script will catch errors and post them to the parent
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Landing Page Preview</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script>
      // Make React hooks available globally
      window.React = React;
      
      // Make hooks available as global functions
      if (React.useState) {
        window.useState = React.useState;
        window.useEffect = React.useEffect;
        window.useRef = React.useRef;
        window.useCallback = React.useCallback;
        window.useMemo = React.useMemo;
        window.useContext = React.useContext;
      }
      
      // Also try alternative access patterns
      if (!window.useState && React['useState']) {
        window.useState = React['useState'];
        window.useEffect = React['useEffect'];
        window.useRef = React['useRef'];
        window.useCallback = React['useCallback'];
        window.useMemo = React['useMemo'];
        window.useContext = React['useContext'];
      }
      
      console.log('React loaded successfully:', typeof React);
      console.log('React hooks available:', {
        useState: typeof React.useState,
        useEffect: typeof React.useEffect,
        useRef: typeof React.useRef
      });
      console.log('Window hooks available:', {
        useState: typeof window.useState,
        useEffect: typeof window.useEffect,
        useRef: typeof window.useRef
      });
    </script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      // Configure Tailwind for production warning suppression
      tailwind.config = {
        theme: {
          extend: {}
        }
      }
    </script>
    <style>
      ${cssCode}
    </style>
    <style>
      body { 
        margin: 0; 
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        text-size-adjust: 100%;
      }
      /* Mobile-specific improvements */
      @media (max-width: 768px) {
        * {
          -webkit-tap-highlight-color: transparent;
        }
      }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
      try {
        console.log('Starting preview rendering...');
        
        // Make sure React hooks are available in this scope
        const { useState, useEffect, useRef, useCallback, useMemo, useContext } = React;
        
        // Also make them available as global variables for compatibility
        window.useState = useState;
        window.useEffect = useEffect;
        window.useRef = useRef;
        window.useCallback = useCallback;
        window.useMemo = useMemo;
        window.useContext = useContext;
        
        console.log('Hooks available in Babel scope:', {
          useState: typeof useState,
          useEffect: typeof useEffect,
          useRef: typeof useRef
        });
        
        // Process the app code
        console.log('Processing app code...');
        ${processedCode}
        
        // Check if App component was created successfully
        if (typeof App === 'undefined') {
          throw new Error('App component was not defined after processing');
        }
        
        console.log('App component created successfully, rendering...');
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(App));
        console.log('Rendering complete');
        
        // Send success message to parent
        window.parent.postMessage({ type: 'preview-success' }, '*');
      } catch (err) {
        console.error('Preview error:', err);
        window.parent.postMessage({ type: 'preview-error', error: err.message }, '*');
        document.body.innerHTML = '<div style="color:red;padding:1rem;font-family:monospace;font-size:14px;word-break:break-word;">Error: '+err.message+'<br><br>Stack: '+err.stack+'</div>';
      }
    </script>
</body>
</html>`;
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access the chat.</p>
          <button
            onClick={() => window.location.href = '/#login'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Project Management Panel */}
      {showProjectPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" onClick={() => setShowProjectPanel(false)}>
          <div className="fixed left-0 top-0 h-full w-full lg:w-80 bg-white shadow-xl z-50 overflow-y-auto max-h-screen lg:max-h-none rounded-r-lg lg:rounded-r-none border-r border-gray-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 bg-gray-50 lg:bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-base lg:text-lg font-semibold text-gray-900">Project Management</h2>
                <button
                  onClick={() => setShowProjectPanel(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 lg:p-1 touch-manipulation rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-3 lg:p-4 overflow-y-auto bg-white">
              <ProjectSelector 
                onProjectSelect={handleProjectSelect}
                currentProjectId={currentProject?.id}
                onAllProjectsDeleted={handleAllProjectsDeleted}
              />
            </div>
          </div>
        </div>
      )}

      {/* Two-pane layout - Chat on left, Preview on right */}
      <div className="flex flex-col lg:flex-row h-screen pt-16 pb-24 lg:pb-0">
        {/* Left pane - Chat interface */}
        <div className={`${mobileView === 'chat' ? 'flex' : 'hidden'} lg:flex lg:w-2/5 bg-white border-r border-gray-200 flex-col transition-all duration-300 ease-in-out`}>
          {/* Project Info Bar */}
          {currentProject && (
            <div className="px-4 lg:px-6 py-3 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-900 truncate">{currentProject.project_name}</span>
                  {/* Mobile view indicator */}
                  <span className="lg:hidden text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {mobileView === 'chat' ? 'Chat' : 'Preview'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {currentProject && (
                    <VisibilityToggle
                      project={currentProject}
                      onVisibilityChange={handleProjectVisibilityChange}
                      className="hidden lg:inline-flex"
                    />
                  )}
                  <button
                    onClick={() => setShowProjectPanel(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline flex-shrink-0"
                  >
                    Projects
                  </button>
                  {/* Profile Icon */}
                  <button
                    onClick={() => window.location.href = '/profile'}
                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors flex-shrink-0"
                    title="View Profile"
                  >
                    {/* Note: This uses window.location.href since ChatPage is not currently integrated with the main App routing */}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3 lg:space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8 px-2">
                <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-base lg:text-lg font-medium mb-2">Start building your landing page</h3>
                <p className="text-xs lg:text-sm">Describe your startup idea and I'll help you create a professional landing page.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] lg:max-w-md px-3 lg:px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm break-words">{message.message}</p>
                    
                    {/* Display current clarification question if present */}
                    {message.needs_clarification && message.current_question && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-600 bg-blue-50 p-2 lg:p-3 rounded border-l-4 border-blue-400">
                          <div className="font-medium text-blue-700 mb-1">
                            Question {message.current_question_index + 1} of {message.clarification_questions?.length || '?'}
                          </div>
                          <div className="break-words">{message.current_question.question}</div>
                        </div>
                      </div>
                    )}
                    
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </p>
                  </div>
                  
                  {/* Restore Web Button for Assistant Messages */}
                  {message.role === 'assistant' && message.backup_id && (
                    <div className="mt-2">
                      <button
                        onClick={() => handleRestoreWeb(message.backup_id)}
                        className="inline-flex items-center px-2 lg:px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-800 transition-colors"
                        title="Restore website to this version"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        <span className="hidden sm:inline">Restore Web</span>
                        <span className="sm:hidden">Restore</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-3 lg:px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="border-t border-gray-200 p-3 lg:p-4">
            <div className="flex space-x-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your startup idea or ask me to modify the landing page..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm lg:text-base min-h-[60px] lg:min-h-[80px]"
                rows={2}
                disabled={isLoading}
                style={{ minHeight: '60px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right pane - Live preview */}
        <div className={`${mobileView === 'chat' ? 'hidden' : 'flex'} lg:flex lg:w-3/5 bg-white flex-col relative transition-all duration-300 ease-in-out`}>
          
          {/* Preview Header */}
          <div className="px-4 lg:px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">Live Preview</span>
              </div>
              <div className="hidden lg:block text-xs text-gray-500">
                Real-time updates as you chat
              </div>
            </div>
          </div>

          {/* Preview iframe */}
          <div className="flex-1 relative">
            {previewLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-blue-600 font-medium text-sm lg:text-base">Updating preview...</span>
                </div>
              </div>
            )}
            {previewError && (
              <div className="absolute inset-0 bg-red-50 bg-opacity-90 flex items-center justify-center z-20">
                <div className="text-red-700 font-mono text-xs lg:text-sm p-3 lg:p-4 border border-red-300 rounded-lg bg-white shadow mx-4">
                  <strong>Preview Error:</strong><br />
                  <span className="break-words">{previewError}</span>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              key={`preview-${currentProject?.id}-${currentProject?.files ? JSON.stringify(currentProject.files).length : 0}`}
              title="Landing Page Preview"
              className="w-full h-full"
              sandbox="allow-scripts allow-same-origin allow-forms"
              style={{ background: 'white' }}
              srcDoc={generatePreviewHTML()}
              onLoad={() => {
                console.log('Iframe loaded successfully');
                setPreviewLoading(false);
              }}
              // Mobile-specific attributes
              scrolling="auto"
              frameBorder="0"
            />
          </div>
        </div>
      </div>
      {/* Load published state when panel opens */}
      {showPublishPanel && currentProject?.id && (
        <PublishStateLoaderInternal projectId={currentProject.id} onChange={setIsPublished} />
      )}

      {/* Mobile Toggle Bar - Only visible on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-transparent z-30">
        <div className="flex items-center justify-between px-3 py-2 max-w-sm md:max-w-md mx-auto">
          {/* Spacer to balance the right globe button and keep center group truly centered */}
          <div className="w-11" />

          {/* Centered compact toggle buttons */}
          <div className="flex items-center gap-2 mx-auto">
            <button
              onClick={() => setMobileView('chat')}
              className={`w-28 h-11 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 touch-manipulation ${
                mobileView === 'chat'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span>Chat</span>
            </button>

            <button
              onClick={() => setMobileView('preview')}
              className={`w-28 h-11 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 touch-manipulation ${
                mobileView === 'preview'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span>Preview</span>
            </button>
          </div>

          {/* Globe secondary action button */}
          <button
            onClick={() => setShowPublishPanel(true)}
            aria-label="Globe"
            className="ml-auto w-11 h-11 flex items-center justify-center rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M2 12h20"></path>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </button>
        </div>
      </div>
      {/* Publish Panel (mobile bottom sheet) */}
      {showPublishPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60]">
          <div className="publish-panel-container fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Publish</h3>
              <button
                onClick={() => setShowPublishPanel(false)}
                className="text-gray-400 hover:text-gray-600 p-2"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {!isPublished && (
                <button
                  onClick={() => { /* placeholder, desktop mirrors via Navbar modal */ }}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-semibold"
                >
                  Publish 🚀
                </button>
              )}

              <div className="border border-gray-200 rounded-lg">
                <div className="p-4">
                  <DeploymentButton projectId={currentProject?.id || undefined} showAsModal={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;