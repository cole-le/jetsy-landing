import React, { useEffect, useState } from 'react';

const ProjectDataAnalytics = ({ projectId, onBack }) => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/leads?project_id=${projectId}`);
        const data = await res.json();
        if (res.ok) {
          setLeads(data.leads || []);
        } else {
          setError(data?.error || 'Failed to load leads');
        }
      } catch (err) {
        setError(err.message || 'Network error');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [projectId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Project {projectId} - Leads</h1>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Back to Builder
          </button>
        </div>

        {isLoading && <div className="text-gray-600">Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!isLoading && !error && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-4 gap-0 bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 border-b border-gray-200">
              <div>Email</div>
              <div>Phone</div>
              <div>Submitted</div>
              <div>ID</div>
            </div>
            {leads.length === 0 ? (
              <div className="p-4 text-gray-500">No leads yet.</div>
            ) : (
              leads.map((lead) => (
                <div key={lead.id} className="grid grid-cols-4 gap-0 px-4 py-3 border-b border-gray-100 text-sm">
                  <div className="truncate">{lead.email}</div>
                  <div className="truncate">{lead.phone || '-'}</div>
                  <div>{lead.submitted_at || lead.created_at}</div>
                  <div>#{lead.id}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDataAnalytics;


