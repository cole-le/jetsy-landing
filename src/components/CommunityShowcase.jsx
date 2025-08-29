import React, { useEffect, useState } from 'react';
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

function formatRemixCount(count) {
  if (count == null) return '0 Remixes';
  const n = Number(count) || 0;
  if (n >= 1000) return `${Math.floor(n / 1000)}k Remixes`;
  return `${n} Remixes`;
}

const Avatar = ({ name }) => {
  const initials = (name || 'User')
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-xs font-semibold shadow-sm" title={name}>
      {initials}
    </div>
  );
};

const ProjectCard = ({ project, onRemixClick }) => {
  const title = extractProjectTitle(project);
  const preview = project.preview_image_url || extractPreviewImage(project);
  const remixCount = project.remix_count ?? project.remixCount;

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
              onClick={() => {}}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              View Website
            </button>
            <button
              onClick={() => {}}
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              View Idea
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Avatar name={project.owner_name || 'Community'} />
          <div className="truncate">
            <div className="text-sm font-semibold text-gray-900 truncate">{title}</div>
            <div className="text-xs text-gray-500">{formatRemixCount(remixCount)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommunityShowcase = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${getApiBaseUrl()}/api/projects/public?limit=24`);
        if (!res.ok) throw new Error('Failed to load public projects');
        const data = await res.json();
        if (mounted) setProjects(data.projects || []);
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRemixClick = (project) => {
    try {
      localStorage.setItem('jetsy_pending_remix_project_id', String(project.id));
    } catch {}
    // Redirect to signup. App will detect the query and show signup, then perform remix post-auth.
    const url = new URL(window.location.href);
    url.searchParams.set('signup', '1');
    window.location.href = url.pathname + url.search;
  };

  return (
    <section className="py-8 md:py-12 bg-white rounded-3xl shadow-lg border border-gray-100 mx-0 md:mx-8">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">From the Community</h2>
          {/* Placeholder for filters or View All */}
          <a href="#" className="text-sm text-black hover:underline font-medium">View All</a>
        </div>
        {loading && (
          <div className="text-gray-500 text-sm text-center py-8">Loading public projects…</div>
        )}
        {error && (
          <div className="text-red-600 text-sm mb-3 text-center">{error}</div>
        )}
        {!loading && projects.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-8">No public projects yet.</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onRemixClick={handleRemixClick} />)
          )}
        </div>
      </div>
    </section>
  );
};

export default CommunityShowcase;
