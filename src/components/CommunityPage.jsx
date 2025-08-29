import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../config/environment';

// Utility: attempt to extract a preview image URL from a project's template_data
function extractPreviewImage(project) {
  try {
    const td = project.template_data ? JSON.parse(project.template_data) : null;
    const candidates = [
      td?.previewImage,
      td?.preview_image,
      td?.preview,
      td?.screenshotUrl,
      td?.screenshot_url,
      td?.heroImage,
      td?.images?.[0],
    ].filter(Boolean);
    if (candidates.length) return candidates[0];
  } catch {}
  return null;
}

function extractProjectTitle(project) {
  try {
    const td = project.template_data ? JSON.parse(project.template_data) : null;
    return td?.businessName || project.project_name || 'Untitled Project';
  } catch {
    return project.project_name || 'Untitled Project';
  }
}

// Generate consistent random view count based on project ID
function generateViewCount(projectId) {
  // Use project ID as seed for consistent random numbers
  const seed = projectId || 1;
  const random = ((seed * 9301 + 49297) % 233280) / 233280;
  const result = Math.floor(random * 6001) + 1000; // Random between 1000-7000
  return result;
}

function formatViewCount(count) {
  if (count == null) return '0 Views';
  const n = Number(count) || 0;
  return `${n} Views`;
}

const Avatar = ({ name, projectId }) => {
  // Generate consistent random avatar based on project ID for credibility
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${projectId || 'default'}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  
  return (
    <img 
      src={avatarUrl} 
      alt={`${name || 'User'} avatar`}
      className="w-7 h-7 rounded-full shadow-sm"
      title={name || 'User'}
    />
  );
};

const ProjectCard = ({ project, onViewIdea }) => {
  const title = extractProjectTitle(project);
  const preview = project.preview_image_url || extractPreviewImage(project);
  // Generate consistent view count - always use generated count for now
  const viewCount = generateViewCount(project.id);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all group">
      <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
        {preview ? (
          <img
            src={preview}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:brightness-75"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Preview</div>
        )}
        {/* Overlay with buttons that slides up on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end justify-center pb-4">
          <div className="flex gap-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => {
                // Open project website in new tab
                const projectUrl = `${window.location.origin}/${project.id}`;
                window.open(projectUrl, '_blank');
              }}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              View Website
            </button>
            <button
              onClick={() => onViewIdea && onViewIdea(project)}
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              View Idea
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Avatar name={project.owner_name || 'Community'} projectId={project.id} />
          <div className="truncate">
            <div className="text-sm font-semibold text-gray-900 truncate">{title}</div>
            <div className="text-xs text-gray-500">{formatViewCount(viewCount)}</div>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          Created {new Date(project.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

const CommunityPage = ({ onShowIdea }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const res = await fetch(`${getApiBaseUrl()}/api/projects/public?limit=${limit}&offset=${isLoadMore ? offset : 0}`);
      if (!res.ok) throw new Error('Failed to load public projects');
      const data = await res.json();
      
      if (isLoadMore) {
        setProjects(prev => [...prev, ...(data.projects || [])]);
        setOffset(prev => prev + limit);
      } else {
        setProjects(data.projects || []);
        setOffset(limit);
      }
      
      // Check if we have more projects to load
      setHasMore((data.projects || []).length === limit);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    loadProjects(true);
  };

  const handleViewIdea = async (project) => {
    try {
      // Call parent function to show idea modal
      onShowIdea && onShowIdea(project);
    } catch (error) {
      console.error('Error showing idea modal:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-xl md:text-2xl font-semibold text-black">From the community</h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover amazing businesses created by the Jetsy community. Get inspired and see what's possible with Jetsy.
            </p>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-600">Loading community projects...</div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={() => loadProjects()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Public Projects Yet</h3>
            <p className="text-gray-600">Be the first to make your project public and inspire others!</p>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} onViewIdea={handleViewIdea} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loadingMore ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    'Show More'
                  )}
                </button>
              </div>
            )}

            {!hasMore && projects.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">You've reached the end! All public projects have been loaded.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
