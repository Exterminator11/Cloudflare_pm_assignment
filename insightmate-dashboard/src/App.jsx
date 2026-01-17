import React, { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts'
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react'
import DashboardLayout from './components/DashboardLayout'
import MetricCard from './components/MetricCard'
import InsightsSummary from './components/InsightsSummary'
import PlatformActivity from './components/PlatformActivity'
import AnomalyAlert from './components/AnomalyAlert'
import Predictions from './components/Predictions'
import ReportGenerator from './components/ReportGenerator'

function App() {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const API_BASE = 'https://insightmate-api.rachit1031.workers.dev'

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_BASE}/api/insights?timeRange=7d&insightTypes=all&reportFormat=json`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setInsights(data.result)
        setLastRefresh(new Date())
      } else {
        throw new Error(data.error || 'Failed to fetch insights')
      }
    } catch (err) {
      console.error('Error fetching insights:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchInsights()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <span className="ml-4 text-white text-lg">Loading AI insights...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-6 text-center max-w-md">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-500 mb-2">Error Loading Insights</h3>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!insights) return null

  const { summary, anomalies, predictions, metadata } = insights

  return (
    <DashboardLayout onRefresh={handleRefresh} lastRefresh={lastRefresh}>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">AI-Powered Insights</h1>
            <p className="text-gray-300">
              Real-time analysis powered by Cloudflare Workers AI • Updated {new Date(metadata.generatedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg px-4 py-2">
              <span className="text-green-400 text-sm font-medium">AI Active</span>
            </div>
            <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg px-4 py-2">
              <span className="text-blue-400 text-sm font-medium">{metadata.confidence * 100}% Confidence</span>
            </div>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Items"
            value={summary?.keyMetrics?.totalItems || 0}
            icon={<BarChart3 />}
            color="insight-blue"
            change="+12%"
          />
          <MetricCard
            title="New Items"
            value={summary?.keyMetrics?.newItems || 0}
            icon={<Zap />}
            color="insight-green"
            change="+23%"
          />
          <MetricCard
            title="Active Issues"
            value={summary?.keyMetrics?.activeIssues || 0}
            icon={<AlertTriangle />}
            color="insight-yellow"
            change="-5%"
          />
          <MetricCard
            title="Resolution Rate"
            value={`${(summary?.keyMetrics?.resolutionRate * 100 || 0).toFixed(1)}%`}
            icon={<CheckCircle />}
            color="insight-purple"
            change="+8%"
          />
        </div>
      </div>

      {/* AI Executive Summary */}
      <InsightsSummary summary={summary} />

      {/* Platform Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <PlatformActivity title="Platform Distribution" data={summary?.platformBreakdown || {}} />
        <PlatformActivity title="Priority Breakdown" data={summary?.priorityBreakdown || {}} />
      </div>

      {/* Anomalies and Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <AnomalyAlert anomalies={anomalies || []} />
        <Predictions predictions={predictions || []} />
      </div>

      {/* Report Generator */}
      <ReportGenerator 
        onGenerateReport={async (format) => {
          try {
            const response = await fetch(`${API_BASE}/api/insights?timeRange=7d&insightTypes=all&reportFormat=${format}`)
            
            if (format === 'pdf') {
              const blob = await response.blob()
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `insightmate-report-${new Date().toISOString().split('T')[0]}.pdf`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              window.URL.revokeObjectURL(url)
            } else {
              const data = await response.json()
              const csvContent = data.result.csvData
              const blob = new Blob([csvContent], { type: 'text/csv' })
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `insightmate-data-${new Date().toISOString().split('T')[0]}.csv`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              window.URL.revokeObjectURL(url)
            }
          } catch (err) {
            console.error('Error generating report:', err)
            alert('Failed to generate report. Please try again.')
          }
        }}
      />

    </DashboardLayout>
  )
}

export default App