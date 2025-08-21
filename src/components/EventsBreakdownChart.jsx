import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const EventsBreakdownChart = ({ eventsData, loading, leadsCount = 0 }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Events Breakdown</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!eventsData || eventsData.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Events Breakdown</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No events data available</p>
        </div>
      </div>
    );
  }

  // Transform the data for the pie chart and format event names
  let chartData = eventsData.map(event => {
    let displayName = event.event_name;
    
    // Format event names for better display
    switch (event.event_name) {
      case 'page_view':
        displayName = 'Page Views';
        break;
      case 'lead_form_submit':
        displayName = 'Lead Submissions';
        break;
      case 'pricing_plan_select':
        displayName = 'Pricing Clicks';
        break;
      default:
        displayName = event.event_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return {
      name: displayName,
      originalName: event.event_name,
      value: event.count
    };
  });

  // Add leads data if available
  if (leadsCount > 0) {
    chartData.push({
      name: 'Leads Signup',
      originalName: 'leads_signup',
      value: leadsCount
    });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Events Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent, value }) => `${name}\n${value} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [value, name]}/>
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => entry.payload.name}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EventsBreakdownChart;
