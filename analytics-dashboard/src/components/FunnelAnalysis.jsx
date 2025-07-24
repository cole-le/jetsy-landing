import React from 'react'

const FunnelAnalysis = ({ data }) => {
  const { funnel } = data

  if (!funnel) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading funnel data...</p>
      </div>
    )
  }

  console.log('Funnel data received:', funnel)

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const calculateConversionRate = (current, previous) => {
    if (previous === 0) return 0
    return Math.round((current / previous) * 100)
  }

  // Calculate conversion rates
  const funnelWithRates = funnel.map((step, index) => {
    const previousStep = index > 0 ? funnel[index - 1].count : step.count
    const conversionRate = calculateConversionRate(step.count, previousStep)
    return {
      ...step,
      conversionRate,
      previousStep
    }
  })

  return (
    <div className="space-y-8">
      {/* Funnel Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Conversion Funnel</h3>
        
        <div className="space-y-4">
          {funnelWithRates.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Funnel Step */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{step.step}</h4>
                    <p className="text-sm text-gray-500">
                      {formatNumber(step.count)} users
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatNumber(step.count)}
                  </div>
                  {index > 0 && (
                    <div className="text-sm text-gray-500">
                      {step.conversionRate}% from previous step
                    </div>
                  )}
                </div>
              </div>

              {/* Drop-off Indicator */}
              {index < funnelWithRates.length - 1 && (
                <div className="flex justify-center mt-2">
                  <div className="w-px h-6 bg-gray-300"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Funnel Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Funnel Visualization</h3>
        
        {funnel && funnel.length > 0 ? (
          <div className="space-y-4">
            {funnel.map((step, index) => {
              const maxCount = Math.max(...funnel.map(s => s.count))
              const percentage = maxCount > 0 ? (step.count / maxCount) * 100 : 0
              const width = Math.max(percentage, 10) // Minimum 10% width for visibility
              
              return (
                <div key={step.step} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 min-w-[140px]">
                      {step.step}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatNumber(step.count)} users
                    </span>
                  </div>
                  <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-500 ease-out"
                      style={{ width: `${width}%` }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {formatNumber(step.count)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {index < funnel.length - 1 && (
                    <div className="flex justify-center mt-2">
                      <div className="w-px h-4 bg-gray-300"></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No funnel data available</p>
          </div>
        )}
      </div>

      {/* Conversion Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h4>
          <div className="space-y-3">
            {funnelWithRates.slice(1).map((step, index) => (
              <div key={step.step} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-700">
                  {step.step}
                </span>
                <span className={`text-sm font-semibold ${
                  step.conversionRate >= 50 ? 'text-green-600' :
                  step.conversionRate >= 25 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {step.conversionRate}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Drop-off Analysis</h4>
          <div className="space-y-3">
            {funnelWithRates.slice(1).map((step, index) => {
              const dropOff = step.previousStep - step.count
              const dropOffRate = step.previousStep > 0 ? Math.round((dropOff / step.previousStep) * 100) : 0
              
              return (
                <div key={step.step} className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {funnelWithRates[index].step} → {step.step}
                    </span>
                    <span className="text-sm font-semibold text-red-600">
                      -{dropOffRate}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatNumber(dropOff)} users dropped off
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FunnelAnalysis 