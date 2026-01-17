import React from 'react'

export default function StatusIndicator({ status }) {
  const statusConfig = {
    online: { color: 'bg-green-500', text: 'Online', pulse: true },
    offline: { color: 'bg-red-500', text: 'Offline', pulse: false },
    warning: { color: 'bg-yellow-500', text: 'Warning', pulse: false }
  }

  const config = statusConfig[status] || statusConfig.offline

  return (
    <div className="flex items-center">
      <div className="relative">
        <div className={`w-3 h-3 rounded-full ${config.color} ${
          config.pulse ? 'animate-pulse' : ''
        }`}></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 animate-ping"></div>
      </div>
      <span className="ml-2 text-sm font-medium text-gray-400">{config.text}</span>
    </div>
  )
}