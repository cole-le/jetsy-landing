import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DailyActivityChart = ({ dailyData, loading }) => {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Activity (Last 7 Days)</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Activity (Last 7 Days)</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No daily data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Activity (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dailyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value, name) => [value, name === 'page_views' ? 'Page Views' : name === 'leads' ? 'Leads' : 'Events']}
          />
          <Line type="monotone" dataKey="page_views" stroke="#3B82F6" strokeWidth={2} name="Page Views" />
          <Line type="monotone" dataKey="leads" stroke="#10B981" strokeWidth={2} name="Leads" />
          <Line type="monotone" dataKey="pricing_clicks" stroke="#8B5CF6" strokeWidth={2} name="Pricing Clicks" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyActivityChart;
