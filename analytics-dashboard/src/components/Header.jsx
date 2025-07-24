import React from 'react'

const Header = () => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🚀 Jetsy Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track your startup validation funnel and user behavior
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {new Date().toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-medium">J</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 