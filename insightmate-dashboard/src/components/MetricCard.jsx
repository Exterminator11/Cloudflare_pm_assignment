import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function MetricCard({ title, value, icon, color, change, subtitle }) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-700 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div 
            className="p-3 rounded-lg mr-4" 
            style={{ backgroundColor: `var(--${color})20`, color: `var(--${color})` }}
          >
            {React.cloneElement(icon, { className: "w-6 h-6" })}
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {subtitle && (
              <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        {change && (
          <div className="flex items-center">
            {isPositive && <TrendingUp className="w-4 h-4 text-green-500 mr-1" />}
            {isNegative && <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
            {!isPositive && !isNegative && <Minus className="w-4 h-4 text-gray-500 mr-1" />}
            <span className={`text-sm font-medium ml-1 ${
              isPositive ? 'text-green-500' : 
              isNegative ? 'text-red-500' : 'text-gray-500'
            }`}>
              {change}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}