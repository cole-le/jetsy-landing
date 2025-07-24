import React, { useState, useEffect } from 'react'
import { trackEvent } from '../utils/analytics'

const AnalyticsDashboard = ({ websiteId = null }) => {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState('7d') // 7d, 30d, 90d
  const [selectedMetric, setSelectedMetric] = useState('page_views')

  useEffect(() => {
    trackEvent('analytics_dashboard_view', { website_id: websiteId })
    fetchAnalyticsData()
  }, [websiteId, dateRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const endDate = new Date().toISOString().slice(0, 10)
      const startDate = new Date(Date.now() - getDateRangeMs(dateRange)).toISOString().slice(0, 10)
      
      let url = `/api/analytics?start_date=${startDate}&end_date=${endDate}`
      if (websiteId) {
        url += `&website_id=${websiteId}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const data = await response.json()
      setAnalyticsData(data.analytics)
      trackEvent('analytics_data_loaded', { 
        website_id: websiteId,
        data_points: data.analytics.length 
      })
    } catch (err) {
      setError(err.message)
      trackEvent('analytics_error', { 
        error: err.message,
        website_id: websiteId 
      })
    } finally {
      setLoading(false)
    }
  }

  const getDateRangeMs = (range) => {
    switch (range) {
      case '7d': return 7 * 24 * 60 * 60 * 1000
      case '30d': return 30 * 24 * 60 * 60 * 1000
      case '90d': return 90 * 24 * 60 * 60 * 1000
      default: return 7 * 24 * 60 * 60 * 1000
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const calculateTotal = (metric) => {
    if (!analyticsData) return 0
    return analyticsData.reduce((sum, day) => sum + (day[metric] || 0), 0)
  }

  const calculateGrowth = (metric) => {
    if (!analyticsData || analyticsData.length < 2) return 0
    const recent = analyticsData.slice(-7).reduce((sum, day) => sum + (day[metric] || 0), 0)
    const previous = analyticsData.slice(-14, -7).reduce((sum, day) => sum + (day[metric] || 0), 0)
    if (previous === 0) return recent > 0 ? 100 : 0
    return Math.round(((recent - previous) / previous) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchAnalyticsData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {websiteId ? `Analytics for ${websiteId}` : 'Jetsy Analytics Dashboard'}
          </h1>
          <p className="text-gray-600">
            Track user behavior, conversions, and performance metrics
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metric
              </label>
              <select 
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="page_views">Page Views</option>
                <option value="funnel_completions">Funnel Completions</option>
                <option value="conversions">Conversions</option>
                <option value="performance_metrics">Performance Metrics</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Page Views"
            value={formatNumber(calculateTotal('page_views'))}
            growth={calculateGrowth('page_views')}
            icon="👁️"
          />
          <MetricCard
            title="Funnel Completions"
            value={formatNumber(calculateTotal('funnel_completions'))}
            growth={calculateGrowth('funnel_completions')}
            icon="🎯"
          />
          <MetricCard
            title="Conversions"
            value={formatNumber(calculateTotal('conversions'))}
            growth={calculateGrowth('conversions')}
            icon="💰"
          />
          <MetricCard
            title="Performance Metrics"
            value={formatNumber(calculateTotal('performance_metrics'))}
            growth={calculateGrowth('performance_metrics')}
            icon="⚡"
          />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedMetric.replace('_', ' ').toUpperCase()} Over Time
          </h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {analyticsData?.map((day, index) => (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ 
                    height: `${Math.max(10, (day[selectedMetric] || 0) / Math.max(...analyticsData.map(d => d[selectedMetric] || 0)) * 200)}px`
                  }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Data</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funnel Completions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance Metrics
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData?.map((day) => (
                  <tr key={day.date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(day.page_views || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(day.funnel_completions || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(day.conversions || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(day.performance_metrics || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const MetricCard = ({ title, value, growth, icon }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="text-2xl">{icon}</div>
    </div>
    <div className="mt-4">
      <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {growth >= 0 ? '+' : ''}{growth}%
      </span>
      <span className="text-sm text-gray-500 ml-1">vs last period</span>
    </div>
  </div>
)

export default AnalyticsDashboard 