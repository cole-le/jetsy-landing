import React, { useEffect, useState } from 'react';
import { getApiBaseUrl } from '../config/environment';

const ProjectDataAnalytics = ({ projectId, onBack }) => {
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState(null);
  const [leadsPage, setLeadsPage] = useState(0);
  const [leadsHasMore, setLeadsHasMore] = useState(false);

  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsError, setContactsError] = useState(null);
  const [contactsPage, setContactsPage] = useState(0);
  const [contactsHasMore, setContactsHasMore] = useState(false);

  const pageSize = 20;

  useEffect(() => {
    const loadLeads = async () => {
      setLeadsLoading(true);
      try {
        const res = await fetch(`/api/leads?project_id=${projectId}&limit=${pageSize}&offset=${leadsPage * pageSize}`);
        const data = await res.json();
        if (res.ok) {
          setLeads(data.leads || []);
          setLeadsHasMore((data.leads || []).length === pageSize);
        } else {
          setLeadsError(data?.error || 'Failed to load leads');
        }
      } catch (err) {
        setLeadsError(err.message || 'Network error');
      } finally {
        setLeadsLoading(false);
      }
    };
    loadLeads();
  }, [projectId, leadsPage]);

  useEffect(() => {
    const loadContacts = async () => {
      setContactsLoading(true);
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/contact?project_id=${projectId}&limit=${pageSize}&offset=${contactsPage * pageSize}`);
        const data = await res.json();
        if (res.ok) {
          setContacts(data.submissions || []);
          setContactsHasMore((data.submissions || []).length === pageSize);
        } else {
          setContactsError(data?.error || 'Failed to load contact submissions');
        }
      } catch (err) {
        setContactsError(err.message || 'Network error');
      } finally {
        setContactsLoading(false);
      }
    };
    loadContacts();
  }, [projectId, contactsPage]);

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

        {/* Leads table */}
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Leads</h2>
        {leadsLoading && <div className="text-gray-600">Loading...</div>}
        {leadsError && <div className="text-red-600">{leadsError}</div>}

        {!leadsLoading && !leadsError && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
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
            <div className="flex items-center justify-between px-4 py-2">
              <button disabled={leadsPage === 0} onClick={() => setLeadsPage((p) => Math.max(0, p - 1))} className={`px-3 py-1 rounded ${leadsPage === 0 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}>Prev</button>
              <div className="text-sm text-gray-600">Page {leadsPage + 1}</div>
              <button disabled={!leadsHasMore} onClick={() => setLeadsPage((p) => p + 1)} className={`px-3 py-1 rounded ${!leadsHasMore ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}>Next</button>
            </div>
          </div>
        )}

        {/* Contact submissions table */}
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact Submissions</h2>
        {contactsLoading && <div className="text-gray-600">Loading...</div>}
        {contactsError && <div className="text-red-600">{contactsError}</div>}

        {!contactsLoading && !contactsError && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-5 gap-0 bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 border-b border-gray-200">
              <div>Name</div>
              <div>Email</div>
              <div>Company</div>
              <div>Message</div>
              <div>Submitted</div>
            </div>
            {contacts.length === 0 ? (
              <div className="p-4 text-gray-500">No contact submissions yet.</div>
            ) : (
              contacts.map((c) => (
                <div key={c.id} className="grid grid-cols-5 gap-0 px-4 py-3 border-b border-gray-100 text-sm">
                  <div className="truncate">{c.name || '-'}</div>
                  <div className="truncate">{c.email}</div>
                  <div className="truncate">{c.company || '-'}</div>
                  <div className="truncate" title={c.message}>{c.message}</div>
                  <div>{c.submitted_at || c.created_at}</div>
                </div>
              ))
            )}
            <div className="flex items-center justify-between px-4 py-2">
              <button disabled={contactsPage === 0} onClick={() => setContactsPage((p) => Math.max(0, p - 1))} className={`px-3 py-1 rounded ${contactsPage === 0 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}>Prev</button>
              <div className="text-sm text-gray-600">Page {contactsPage + 1}</div>
              <button disabled={!contactsHasMore} onClick={() => setContactsPage((p) => p + 1)} className={`px-3 py-1 rounded ${!contactsHasMore ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDataAnalytics;


