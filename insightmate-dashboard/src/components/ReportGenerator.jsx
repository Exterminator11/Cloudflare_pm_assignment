import React, { useState } from 'react'
import { Download, FileText, Table } from 'lucide-react'

export default function ReportGenerator({ onGenerateReport }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState('pdf')

  const handleGenerate = async (format) => {
    setIsGenerating(true)
    try {
      await onGenerateReport(format)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <Download className="w-6 h-6 text-insight-green mr-3" />
        <h3 className="text-lg font-semibold text-white">AI Report Generator</h3>
        <span className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg px-3 py-1 text-green-400 text-sm font-medium">
          Export Reports
        </span>
      </div>

      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="text-white text-sm font-medium mb-3 block">Report Format</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['pdf', 'csv', 'json'].map(format => (
              <button
                key={format}
                onClick={() => setSelectedFormat(format)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedFormat === format
                    ? 'border-insight-green bg-insight-green bg-opacity-20 text-white'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
                }`}
              >
                <div className="flex flex-col items-center">
                  {format === 'pdf' && <FileText className="w-6 h-6 mb-2" />}
                  {format === 'csv' && <Table className="w-6 h-6 mb-2" />}
                  {format === 'json' && <FileText className="w-6 h-6 mb-2" />}
                  <span className="text-sm font-medium capitalize">{format.toUpperCase()}</span>
                  <span className="text-xs text-gray-400 mt-1">
                    {format === 'pdf' && 'Professional formatted report'}
                    {format === 'csv' && 'Excel-compatible data'}
                    {format === 'json' && 'Raw API response'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Report Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Data Range</h4>
            <select className="w-full bg-gray-600 text-white rounded-lg px-3 py-2 border border-gray-500 focus:border-insight-green focus:outline-none">
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Insight Types</h4>
            <div className="space-y-2">
              <label className="flex items-center text-gray-300">
                <input type="checkbox" defaultChecked className="mr-2 rounded" />
                <span className="text-sm">Executive Summary</span>
              </label>
              <label className="flex items-center text-gray-300">
                <input type="checkbox" defaultChecked className="mr-2 rounded" />
                <span className="text-sm">Anomalies Detection</span>
              </label>
              <label className="flex items-center text-gray-300">
                <input type="checkbox" defaultChecked className="mr-2 rounded" />
                <span className="text-sm">Predictive Analytics</span>
              </label>
              <label className="flex items-center text-gray-300">
                <input type="checkbox" defaultChecked className="mr-2 rounded" />
                <span className="text-sm">Platform Breakdown</span>
              </label>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={() => handleGenerate(selectedFormat)}
          disabled={isGenerating}
          className="w-full bg-insight-green hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              <span>Generating {selectedFormat.toUpperCase()} Report...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-3" />
              <span>Generate {selectedFormat.toUpperCase()} Report</span>
            </>
          )}
        </button>

        {/* Last Generated */}
        <div className="text-center text-gray-400 text-sm">
          Last report generated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}