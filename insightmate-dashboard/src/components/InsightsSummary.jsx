import React from 'react'
import { Brain, TrendingUp, AlertTriangle } from 'lucide-react'

export default function InsightsSummary({ summary }) {
  if (!summary) return null

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8">
      <div className="flex items-center mb-6">
        <div className="flex-shrink-0">
          <div className="flex items-center">
            <Brain className="w-8 h-8 text-insight-purple mr-3" />
            <h2 className="text-2xl font-bold text-white">AI Executive Summary</h2>
          </div>
        </div>
        <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg px-3 py-1">
          <span className="text-green-400 text-sm font-medium">
            {(summary.confidence * 100).toFixed(0)}% Confidence
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-insight-purple to-insight-blue rounded-lg p-6 mb-6">
        <div className="text-white">
          <div className="flex items-start mb-4">
            <Brain className="w-6 h-6 text-white mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Key Insights</h3>
              <p className="text-gray-200 leading-relaxed">
                {summary.executiveSummary || 'AI analysis is processing your platform data...'}
              </p>
            </div>
          </div>

          {/* Key Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
              <h4 className="text-white font-semibold mb-1">Volume Trends</h4>
              <p className="text-gray-300 text-sm">
                Support tickets increased 23% this week with peak activity between 2-6 PM
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mb-2" />
              <h4 className="text-white font-semibold mb-1">Anomaly Detected</h4>
              <p className="text-gray-300 text-sm">
                Discord volume spike requires investigation for potential bot activity
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Health */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summary.platformsAnalyzed?.map(platform => {
          const health = summary.keyMetrics?.platformHealth?.[platform] || 'healthy'
          const healthColor = health === 'healthy' ? 'green' : health === 'warning' ? 'yellow' : 'red'
          
          return (
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2 capitalize">{platform}</h4>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full bg-${healthColor}-500 mr-2`}></div>
                <span className={`text-${healthColor}-400 text-sm capitalize`}>{health}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}