import React, { useState, useEffect } from 'react';
import { DEFAULT_TEMPLATE_DATA } from './TemplateBasedChat';
import { getApiBaseUrl } from '../config/environment';

const ProjectSelector = ({ onProjectSelect, currentProjectId, onAllProjectsDeleted }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [error, setError] = useState('');

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Load projects from API
  const loadProjects = async () => {
    try {
      setLoading(true);
      console.log('Loading projects...');
      const response = await fetch(`${getApiBaseUrl()}/api/projects?user_id=1`);
      console.log('Projects response:', response);
      if (response.ok) {
        const result = await response.json();
        console.log('Projects result:', result);
        setProjects(result.projects || []);
        
        // If no current project is selected, select the most recent one
        if (!currentProjectId && result.projects && result.projects.length > 0) {
          const mostRecent = result.projects[0];
          onProjectSelect(mostRecent);
        }
      } else {
        console.error('Failed to load projects:', response.status, response.statusText);
        setError('Failed to load projects');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Create new project
  const createProject = async () => {
    if (!newProjectName.trim()) return;
    if (newProjectName.trim().length > 40) {
      setError('Project name must be 40 characters or less');
      return;
    }

    try {
      const projectData = {
        project_name: newProjectName.trim(),
        user_id: 1,
        files: {
          "src/App.jsx": `import React from 'react';\nimport './index.css';\nfunction App() {\n  return (\n    <div className=\"min-h-screen bg-gray-50\">\n      <div className=\"container mx-auto px-4 py-8\">\n        <h1 className=\"text-4xl font-bold text-center text-gray-900 mb-8\">Welcome to Your Landing Page</h1>\n        <p className=\"text-center text-gray-600 mb-8\">This is a placeholder. Start chatting to customize your landing page!</p>\n      </div>\n    </div>\n  );\n}\nexport default App;`,
          "src/index.css": `@tailwind base;\n@tailwind components;\n@tailwind utilities;`
        }
        // Don't include template_data for new projects - let users chat first
      };

      const response = await fetch(`${getApiBaseUrl()}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        const result = await response.json();
        const newProject = { id: result.project_id, ...projectData };
        setProjects(prev => [newProject, ...prev]);
        onProjectSelect(newProject);
        setNewProjectName('');
        setShowCreateModal(false);
      } else {
        setError('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project');
    }
  };

  // Rename project
  const renameProject = async () => {
    if (!editingProject || !newProjectName.trim()) return;
    if (newProjectName.trim().length > 40) {
      setError('Project name must be 40 characters or less');
      return;
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_name: newProjectName.trim() })
      });

      if (response.ok) {
        setProjects(prev => prev.map(p => 
          p.id === editingProject.id 
            ? { ...p, project_name: newProjectName.trim() }
            : p
        ));
        setNewProjectName('');
        setShowRenameModal(false);
        setEditingProject(null);
      } else {
        setError('Failed to rename project');
      }
    } catch (error) {
      console.error('Error renaming project:', error);
      setError('Failed to rename project');
    }
  };

  // Delete project
  const deleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        console.log('Project deleted successfully:', projectId);
        // Update the projects list
        setProjects(prev => {
          const updatedProjects = prev.filter(p => p.id !== projectId);
          console.log('Updated projects list:', updatedProjects);
          
          // If we deleted the current project, select the first available one
          if (currentProjectId === projectId) {
            if (updatedProjects.length > 0) {
              console.log('Selecting next project:', updatedProjects[0]);
              // Use setTimeout to ensure state update happens after this function
              setTimeout(() => {
                onProjectSelect(updatedProjects[0]);
              }, 0);
            } else {
              console.log('No projects left, creating new one');
              // No projects left, notify parent component
              setTimeout(() => {
                onAllProjectsDeleted && onAllProjectsDeleted();
              }, 0);
            }
          }
          
          return updatedProjects;
        });
      } else {
        console.error('Failed to delete project:', response.status);
        setError('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project');
    }
  };

  // Open rename modal
  const openRenameModal = (project) => {
    setEditingProject(project);
    setNewProjectName(project.project_name);
    setShowRenameModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading projects...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Your Projects</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + New
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          💡 Project names are automatically updated by AI to reflect your business idea. Keep them short and descriptive!
        </div>
      </div>

      {/* Project List */}
      <div className="max-h-96 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm">No projects yet</p>
            <p className="text-xs text-gray-400 mt-1">Create your first project to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`p-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                  currentProjectId === project.id 
                    ? 'bg-blue-50 border-blue-500' 
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div 
                    className="flex-1 min-w-0"
                    onClick={() => onProjectSelect(project)}
                  >
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-medium truncate ${
                        currentProjectId === project.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {project.project_name}
                      </p>
                      {currentProjectId === project.id && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Updated {new Date(project.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openRenameModal(project);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="Rename project"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(project.id);
                      }}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title="Delete project"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name..."
              maxLength={40}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && createProject()}
            />
            <div className="text-xs text-gray-500 mt-1 mb-3">
              {newProjectName.length}/40 characters - Keep it short and descriptive
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewProjectName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={!newProjectName.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Project Modal */}
      {showRenameModal && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rename Project</h3>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter new project name..."
              maxLength={40}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && renameProject()}
            />
            <div className="text-xs text-gray-500 mt-1 mb-3">
              {newProjectName.length}/40 characters - Keep it short and descriptive
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setNewProjectName('');
                  setEditingProject(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={renameProject}
                disabled={!newProjectName.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector; 