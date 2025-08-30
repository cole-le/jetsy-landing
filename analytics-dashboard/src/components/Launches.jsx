import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO, subDays } from 'date-fns'
import { config } from '../config'

const Launches = ({ data }) => {
  const [launchesData, setLaunchesData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLaunchesData()
  }, [])

  const fetchLaunchesData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics/launches')
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response not ok:', response.status, errorText)
        throw new Error(`Failed to fetch launches data: ${response.status}`)
      }
      const data = await response.json()
      console.log('Launches data received:', data)
      setLaunchesData(data)
    } catch (err) {
      console.error('Error fetching launches data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A'
    return num.toLocaleString()
  }

  const getPlanBadgeColor = (plan) => {
    switch (plan?.toLowerCase()) {
      case 'free':
        return 'bg-gray-100 text-gray-800'
      case 'pro':
        return 'bg-blue-100 text-blue-800'
      case 'enterprise':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Launches Data</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchLaunchesData}
                className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!launchesData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No launches data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 Launches Dashboard</h1>
        <p className="text-gray-600">Track user growth and project launches on Jetsy</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(launchesData.totalUsers)}
              </p>
              <p className="text-xs text-gray-400">Excluding test accounts</p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Projects</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(launchesData.totalProjects)}
              </p>
              <p className="text-xs text-gray-400">Excluding test projects</p>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Deployments</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(launchesData.totalDeployments)}
              </p>
              <p className="text-xs text-gray-400">Live websites</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">User Growth Over Time</h3>
          <p className="text-sm text-gray-500">Daily user signups from August 20, 2025 onwards</p>
        </div>
        <div className="p-6">
          {launchesData.userGrowth && launchesData.userGrowth.length > 0 ? (
            <div>
              <div className="mb-4 text-sm text-gray-500">
                Debug: {launchesData.userGrowth.length} days of data, from {launchesData.userGrowth[0]?.date} to {launchesData.userGrowth[launchesData.userGrowth.length - 1]?.date}
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={launchesData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => format(parseISO(date), 'MMM dd, yyyy')}
                  formatter={(value) => [value, 'Users']}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                              </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No user growth data available</p>
            </div>
          )}
        </div>
      </div>

      {/* User Details Table */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">User Details</h3>
          <p className="text-sm text-gray-500">Comprehensive breakdown of all users and their activities</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deployments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ads Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Signup Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {launchesData.users && launchesData.users.length > 0 ? (
                launchesData.users.map((user, index) => (
                  <tr key={user.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || user.email || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(user.projectsCount || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(user.deploymentsCount || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(user.adsCount || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(user.credits || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanBadgeColor(user.plan)}`}>
                        {user.plan || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.signupDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.subscriptionStatus)}`}>
                          {user.subscriptionStatus || 'N/A'}
                        </span>
                        {user.canceledAt && (
                          <span className="text-xs text-gray-500 mt-1">
                            Canceled: {formatDate(user.canceledAt)}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No user data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Launches
