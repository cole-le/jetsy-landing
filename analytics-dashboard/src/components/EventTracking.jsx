import React, { useState } from 'react'

const EventTracking = ({ data }) => {
  const { events } = data
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  if (!events) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading events data...</p>
      </div>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const formatEventData = (eventData) => {
    if (!eventData) return 'No data'
    try {
      const parsed = typeof eventData === 'string' ? JSON.parse(eventData) : eventData
      return JSON.stringify(parsed, null, 2)
    } catch {
      return eventData
    }
  }

  const truncateText = (text, maxLength = 50) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const getEventTypeColor = (eventName) => {
    const colors = {
      'page_view': 'bg-blue-100 text-blue-800',
      'idea_submit': 'bg-green-100 text-green-800',
      'plan_select': 'bg-purple-100 text-purple-800',
      'lead_capture': 'bg-yellow-100 text-yellow-800',
      'priority_access_click': 'bg-red-100 text-red-800',
      'priority_access_attempt': 'bg-red-100 text-red-800',
      'queue_view': 'bg-orange-100 text-orange-800',
      'floating_chat_expand': 'bg-indigo-100 text-indigo-800',
      'floating_chat_submit': 'bg-indigo-100 text-indigo-800'
    }
    return colors[eventName] || 'bg-gray-100 text-gray-800'
  }

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.event_name === filter
    const matchesSearch = event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.event_category && event.event_category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (event.url && event.url.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  // Get unique event types for filter
  const eventTypes = [...new Set(events.map(e => e.event_name))]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Events
            </label>
            <input
              type="text"
              placeholder="Search by event name, category, or URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Events</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredEvents.length} of {events.length} events
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Event Logs</h3>
        </div>
        
        {filteredEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.event_name)}`}>
                        {event.event_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.event_category || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={event.url}>
                        {event.url ? (
                          <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            {truncateText(event.url, 40)}
                          </a>
                        ) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(event.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <details className="group">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View Data
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono overflow-x-auto">
                          <pre>{formatEventData(event.event_data)}</pre>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No events found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Event Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Event Types</h4>
          <div className="space-y-2">
            {eventTypes.slice(0, 5).map(type => {
              const count = events.filter(e => e.event_name === type).length
              return (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{type}</span>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              )
            })}
            {eventTypes.length > 5 && (
              <div className="text-sm text-gray-500">
                +{eventTypes.length - 5} more types
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h4>
          <div className="space-y-2">
            {events.slice(0, 5).map((event, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getEventTypeColor(event.event_name).replace('bg-', '').replace(' text-', ' bg-')}`}></div>
                <span className="text-sm text-gray-600">{event.event_name}</span>
                <span className="text-xs text-gray-400">
                  {new Date(event.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Top URLs</h4>
          <div className="space-y-2">
            {Object.entries(
              events.reduce((acc, event) => {
                if (event.url) {
                  acc[event.url] = (acc[event.url] || 0) + 1
                }
                return acc
              }, {})
            )
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([url, count]) => (
              <div key={url} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 truncate" title={url}>
                  {truncateText(url, 25)}
                </span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventTracking 