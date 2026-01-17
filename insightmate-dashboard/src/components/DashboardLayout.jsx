import React from 'react'
import MetricCard from './MetricCard'
import PlatformChart from './PlatformChart'
import StatusIndicator from './StatusIndicator'

export default function DashboardLayout({ children, onRefresh, lastRefresh }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <Brain className="w-8 h-8 text-insight-blue mr-3" />
                  <span className="text-xl font-bold text-white">InsightMate</span>
                </div>
              </div>
              <nav className="hidden md:flex space-x-8 ml-10">
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Dashboard
                </a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Analytics
                </a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Reports
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <StatusIndicator status="online" />
              <button
                onClick={onRefresh}
                className="bg-insight-blue hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="text-gray-400 text-sm">
                Last update: {lastRefresh?.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}