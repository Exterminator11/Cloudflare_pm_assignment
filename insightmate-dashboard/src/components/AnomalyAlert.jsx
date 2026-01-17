import React from 'react'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'

export default function AnomalyAlert({ anomalies }) {
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <Info className="w-6 h-6 text-green-500 mr-3" />
          <h3 className="text-lg font-semibold text-white">No Anomalies Detected</h3>
        </div>
        <p className="text-gray-300 text-center py-8">
          All platforms are operating within normal parameters. Continue monitoring for any unusual patterns.
        </p>
      </div>
    )
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'red'
      case 'medium': return 'yellow'
      case 'low': return 'green'
      default: return 'gray'
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'volume_spike': return <AlertTriangle className="w-5 h-5" />
      case 'silent_failure': return <AlertCircle className="w-5 h-5" />
      case 'priority_escalation': return <AlertTriangle className="w-5 h-5" />
      default: return <AlertCircle className="w-5 h-5" />
    }
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
        <h3 className="text-lg font-semibold text-white">Anomalies Detected</h3>
        <span className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg px-3 py-1 text-red-400 text-sm font-medium">
          {anomalies.length} Active
        </span>
      </div>

      <div className="space-y-4">
        {anomalies.map((anomaly, index) => (
          <div 
            key={index}
            className={`bg-${getSeverityColor(anomaly.severity)}-900 bg-opacity-20 border border-${getSeverityColor(anomaly.severity)}-500 rounded-lg p-4`}
          >
            <div className="flex items-start">
              <div className={`text-${getSeverityColor(anomaly.severity)}-500 mr-3 mt-1`}>
                {getIcon(anomaly.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold capitalize">
                    {anomaly.type.replace('_', ' ')}
                  </h4>
                  <span className={`bg-${getSeverityColor(anomaly.severity)}-500 rounded-full px-2 py-1 text-xs text-white font-medium`}>
                    {anomaly.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-2">
                  <strong>Platform:</strong> {anomaly.platform}<br />
                  <strong>Deviation:</strong> {anomaly.deviation}<br />
                  <strong>Description:</strong> {anomaly.description}
                </p>
                <div className="bg-white bg-opacity-10 rounded p-3">
                  <p className="text-white text-sm">
                    <strong>Recommendation:</strong> {anomaly.recommendation}
                  </p>
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  <strong>Detected:</strong> {new Date(anomaly.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}