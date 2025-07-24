import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Overview from './components/Overview'
import FunnelAnalysis from './components/FunnelAnalysis'
import EventTracking from './components/EventTracking'
import PriorityAccessMetrics from './components/PriorityAccessMetrics'
import RealTimeMetrics from './components/RealTimeMetrics'
import DemoLeads from './components/DemoLeads'
import { config } from './config'

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30) // seconds

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'funnel', name: 'Funnel Analysis', icon: '🔄' },
    { id: 'events', name: 'Event Tracking', icon: '📈' },
    { id: 'priority', name: 'Priority Access', icon: '💰' },
    { id: 'realtime', name: 'Real-time', icon: '⚡' },
    { id: 'demo-leads', name: 'Demo Leads', icon: '📝' }
  ]

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [
        overviewRes,
        dailyRes,
        eventsBreakdownRes,
        funnelRes,
        eventsRes,
        priorityRes,
        realtimeRes
      ] = await Promise.all([
        fetch(`${config.apiBaseUrl}/api/analytics/overview`),
        fetch(`${config.apiBaseUrl}/api/analytics/daily`),
        fetch(`${config.apiBaseUrl}/api/analytics/events-breakdown`),
        fetch(`${config.apiBaseUrl}/api/analytics/funnel`),
        fetch(`${config.apiBaseUrl}/api/analytics/events`),
        fetch(`${config.apiBaseUrl}/api/analytics/priority-access`),
        fetch(`${config.apiBaseUrl}/api/analytics/realtime`)
      ])

      // Check if any request failed
      const responses = [overviewRes, dailyRes, eventsBreakdownRes, funnelRes, eventsRes, priorityRes, realtimeRes]
      const failedResponse = responses.find(res => !res.ok)
      
      if (failedResponse) {
        throw new Error(`API request failed: ${failedResponse.status}`)
      }

      // Parse all responses
      const [
        overview,
        daily,
        eventsBreakdown,
        funnel,
        events,
        priority,
        realtime
      ] = await Promise.all([
        overviewRes.json(),
        dailyRes.json(),
        eventsBreakdownRes.json(),
        funnelRes.json(),
        eventsRes.json(),
        priorityRes.json(),
        realtimeRes.json()
      ])

      setData({
        overview,
        daily,
        eventsBreakdown,
        funnel,
        events,
        priority,
        realtime
      })

      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [])

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchData()
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const handleManualRefresh = () => {
    fetchData()
  }

  const formatLastUpdated = (date) => {
    if (!date) return 'Never'
    return date.toLocaleTimeString()
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={fetchData}
                    className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Controls Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Auto-refresh Controls */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Auto-refresh</span>
              </label>
              
              {autoRefresh && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Every</span>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="rounded border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={15}>15s</option>
                    <option value={30}>30s</option>
                    <option value={60}>1m</option>
                    <option value={300}>5m</option>
                  </select>
                </div>
              )}
            </div>

            {/* Manual Refresh and Status */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </button>
              
              <div className="text-sm text-gray-500">
                Last updated: {formatLastUpdated(lastUpdated)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && !data.overview ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <Overview data={data} />}
            {activeTab === 'funnel' && <FunnelAnalysis data={data} />}
            {activeTab === 'events' && <EventTracking data={data} />}
            {activeTab === 'priority' && <PriorityAccessMetrics data={data} />}
            {activeTab === 'realtime' && <RealTimeMetrics data={data} />}
            {activeTab === 'demo-leads' && <DemoLeads />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Jetsy Analytics Dashboard • Powered by Cloudflare D1</p>
            <p className="mt-1">
              💡 <strong>Tip:</strong> Use manual refresh to save D1 query quota. 
              Auto-refresh is great for testing, but consider disabling it for production monitoring.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App 