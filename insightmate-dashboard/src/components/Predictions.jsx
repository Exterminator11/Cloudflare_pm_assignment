import React from 'react'
import { TrendingUp, Target, Zap } from 'lucide-react'

export default function Predictions({ predictions }) {
  if (!predictions || predictions.length === 0) {
    return (
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <Target className="w-6 h-6 text-blue-500 mr-3" />
          <h3 className="text-lg font-semibold text-white">No Predictions Available</h3>
        </div>
        <p className="text-gray-300 text-center py-8">
          Insufficient historical data for accurate predictions. Continue monitoring to build predictive models.
        </p>
      </div>
    )
  }

  const getPredictionColor = (type) => {
    switch (type) {
      case 'capacity_planning': return 'purple'
      case 'issue_forecast': return 'blue'
      case 'risk_assessment': return 'red'
      case 'optimization_opportunity': return 'green'
      default: return 'gray'
    }
  }

  const getPredictionIcon = (type) => {
    switch (type) {
      case 'capacity_planning': return <Target className="w-5 h-5" />
      case 'issue_forecast': return <TrendingUp className="w-5 h-5" />
      case 'risk_assessment': return <Zap className="w-5 h-5" />
      case 'optimization_opportunity': return <Zap className="w-5 h-5" />
      default: return <Target className="w-5 h-5" />
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'green'
    if (confidence >= 0.6) return 'yellow'
    return 'red'
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <TrendingUp className="w-6 h-6 text-insight-blue mr-3" />
        <h3 className="text-lg font-semibold text-white">Predictive Analytics</h3>
        <span className="bg-insight-blue bg-opacity-20 border border-insight-blue rounded-lg px-3 py-1 text-insight-blue text-sm font-medium">
          {predictions.length} Predictions
        </span>
      </div>

      <div className="space-y-4">
        {predictions.map((prediction, index) => (
          <div 
            key={index}
            className="bg-gray-700 rounded-lg p-4 border-l-4"
            style={{ borderLeftColor: `var(--insight-${getPredictionColor(prediction.type)})` }}
          >
            <div className="flex items-start">
              <div className={`text-${getPredictionColor(prediction.type)}-500 mr-3 mt-1`}>
                {getPredictionIcon(prediction.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold capitalize">
                    {prediction.type.replace('_', ' ')}
                  </h4>
                  <span className={`bg-${getConfidenceColor(prediction.confidence)}-500 rounded-full px-2 py-1 text-xs text-white font-medium`}>
                    {(prediction.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="bg-white bg-opacity-10 rounded p-3">
                    <p className="text-white text-sm">
                      <strong>Platform:</strong> {prediction.platform}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded p-3">
                    <p className="text-white text-sm">
                      <strong>Timeframe:</strong> {prediction.timeFrame}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded p-4 mb-3">
                  <p className="text-white text-sm font-medium mb-2">
                    <strong>Forecast:</strong> {prediction.forecast}
                  </p>
                  <p className="text-gray-300 text-sm">
                    <strong>Impact:</strong> {prediction.impact}
                  </p>
                </div>

                <div className="bg-white bg-opacity-10 rounded p-3">
                  <p className="text-white text-sm">
                    <strong>Preparation:</strong> {prediction.preparation}
                  </p>
                </div>

                <p className="text-gray-400 text-xs mt-2">
                  <strong>Generated:</strong> {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}