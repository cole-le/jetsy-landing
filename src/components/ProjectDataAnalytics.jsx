import React, { useEffect, useState } from 'react';
import { getApiBaseUrl } from '../config/environment';
import DailyActivityChart from './DailyActivityChart';
import EventsBreakdownChart from './EventsBreakdownChart';

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

  // New state for events
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const [eventsPage, setEventsPage] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  
  const [eventsSummary, setEventsSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const pageSize = 20;

  useEffect(() => {
    const loadLeads = async () => {
      setLeadsLoading(true);
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/leads?project_id=${projectId}&limit=${pageSize}&offset=${leadsPage * pageSize}`);
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

  // New useEffect for events summary
  useEffect(() => {
    const loadEventsSummary = async () => {
      setSummaryLoading(true);
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/project-tracking-summary?project_id=${projectId}`);
        const data = await res.json();
        if (res.ok) {
          setEventsSummary(data);
        } else {
          console.error('Failed to load events summary:', data?.error);
        }
      } catch (err) {
        console.error('Events summary error:', err);
      } finally {
        setSummaryLoading(false);
      }
    };
    loadEventsSummary();
  }, [projectId]);

  // New useEffect for events
  useEffect(() => {
    const loadEvents = async () => {
      setEventsLoading(true);
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/project-tracking?project_id=${projectId}&limit=${pageSize}&offset=${eventsPage * pageSize}`);
        const data = await res.json();
        if (res.ok) {
          setEvents(data.events || []);
          setEventsHasMore((data.events || []).length === pageSize);
        } else {
          setEventsError(data?.error || 'Failed to load events');
        }
      } catch (err) {
        setEventsError(err.message || 'Network error');
      } finally {
        setEventsLoading(false);
      }
    };
    loadEvents();
  }, [projectId, eventsPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6 pt-20 lg:pt-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Project {projectId} - Analytics</h1>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Back to Builder
          </button>
        </div>

        {/* Events Summary */}
        {!summaryLoading && eventsSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Page Views</p>
                  <p className="text-2xl font-semibold text-gray-900">{eventsSummary.totals.page_views}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Leads</p>
                  <p className="text-2xl font-semibold text-gray-900">{eventsSummary.totals.leads}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pricing Clicks</p>
                  <p className="text-2xl font-semibold text-gray-900">{eventsSummary.totals.pricing_clicks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Events</p>
                  <p className="text-2xl font-semibold text-gray-900">{eventsSummary.totals.total_events}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {!summaryLoading && eventsSummary && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <DailyActivityChart 
              dailyData={eventsSummary.daily_counts} 
              loading={summaryLoading} 
            />
            <EventsBreakdownChart 
              eventsData={eventsSummary.event_breakdown} 
              loading={summaryLoading}
              leadsCount={eventsSummary.totals.leads}
            />
          </div>
        )}

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

        {/* Events Table */}
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Events</h2>
        {eventsLoading && <div className="text-gray-600">Loading...</div>}
        {eventsError && <div className="text-red-600">{eventsError}</div>}

        {!eventsLoading && !eventsError && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
            <div className="grid grid-cols-5 gap-0 bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 border-b border-gray-200">
              <div>Event</div>
              <div>Category</div>
              <div>URL</div>
              <div>Data</div>
              <div>Time</div>
            </div>
            {events.length === 0 ? (
              <div className="p-4 text-gray-500">No events tracked yet.</div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="grid grid-cols-5 gap-0 px-4 py-3 border-b border-gray-100 text-sm">
                  <div className="truncate">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      event.event_name === 'page_view' ? 'bg-blue-100 text-blue-800' :
                      event.event_name === 'lead_form_submit' ? 'bg-green-100 text-green-800' :
                      event.event_name === 'pricing_plan_select' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.event_name}
                    </span>
                  </div>
                  <div className="truncate">{event.event_category || '-'}</div>
                  <div className="truncate" title={event.url}>
                    {event.url ? (
                      <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {event.url.length > 30 ? event.url.substring(0, 30) + '...' : event.url}
                      </a>
                    ) : '-'}
                  </div>
                  <div className="truncate">
                    <details className="group">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800 text-xs">
                        View Data
                      </summary>
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono overflow-x-auto">
                        <pre>{JSON.stringify(JSON.parse(event.event_data || '{}'), null, 2)}</pre>
                      </div>
                    </details>
                  </div>
                  <div>{new Date(event.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
            <div className="flex items-center justify-between px-4 py-2">
              <button disabled={eventsPage === 0} onClick={() => setEventsPage((p) => Math.max(0, p - 1))} className={`px-3 py-1 rounded ${eventsPage === 0 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}>Prev</button>
              <div className="text-sm text-gray-600">Page {eventsPage + 1}</div>
              <button disabled={!eventsHasMore} onClick={() => setEventsPage((p) => p + 1)} className={`px-3 py-1 rounded ${!eventsHasMore ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDataAnalytics;


