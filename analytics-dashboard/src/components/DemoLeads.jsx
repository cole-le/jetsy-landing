import React, { useEffect, useState } from 'react'
import { config } from '../config'

const DemoLeads = () => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${config.apiBaseUrl}/api/demo-leads`)
        const data = await res.json()
        if (data.success) {
          setLeads(data.leads)
        } else {
          setError('Failed to fetch demo leads')
        }
      } catch (err) {
        setError('Failed to fetch demo leads')
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Demo Leads</h3>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <>
            <div className="mb-4 text-gray-700 font-semibold">Total Demo Leads: {leads.length}</div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.first_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.last_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.company}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(lead.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DemoLeads 