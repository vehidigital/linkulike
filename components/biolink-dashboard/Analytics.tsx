'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Users, MousePointer, BarChart3, Globe, Smartphone, Download } from 'lucide-react'

interface AnalyticsData {
  kpis: {
    totalClicks: number
    activeLinks: number
    profileViews: number
    clickRate: number
  }
  topLinks: Array<{
    id: string
    title: string
    url: string
    clicks: number
    isActive: boolean
  }>
  clickTrends: Array<{
    date: string
    clicks: number
  }>
  deviceStats: Array<{
    device: string
    count: number
  }>
  geoStats: Array<{
    country: string
    count: number
  }>
}

export function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('7d')

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Fehler beim Laden der Analytics: {error}</p>
            <Button onClick={fetchAnalytics} className="mt-2">
              Erneut versuchen
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Keine Daten verfügbar
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics
            </CardTitle>
            <div className="flex space-x-2">
              {['7d', '30d', '90d', '365d'].map(range => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Gesamtklicks</span>
            </div>
            <div className="text-2xl font-bold">{formatNumber(data.kpis.totalClicks)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Profilaufrufe</span>
            </div>
            <div className="text-2xl font-bold">{formatNumber(data.kpis.profileViews)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">Aktive Links</span>
            </div>
            <div className="text-2xl font-bold">{data.kpis.activeLinks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">Klickrate</span>
            </div>
            <div className="text-2xl font-bold">{data.kpis.clickRate}</div>
          </CardContent>
        </Card>
      </div>

      {/* Click Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Klick-Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-1">
            {data.clickTrends.map((trend, index) => {
              const maxClicks = Math.max(...data.clickTrends.map(t => t.clicks))
              const height = maxClicks > 0 ? (trend.clicks / maxClicks) * 100 : 0
              
              return (
                <div key={trend.date} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                    style={{ height: `${height}%` }}
                    title={`${trend.date}: ${trend.clicks} Klicks`}
                  />
                  <span className="text-xs text-gray-500 mt-1">
                    {formatDate(trend.date)}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Links */}
      <Card>
        <CardHeader>
          <CardTitle>Top Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topLinks.slice(0, 5).map((link, index) => (
              <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{link.title}</div>
                    <div className="text-sm text-gray-500 break-all max-w-xs">{link.url}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatNumber(link.clicks)}</div>
                  <div className="text-sm text-gray-500">Klicks</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Device & Geographic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Geräte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.deviceStats.slice(0, 5).map((stat, index) => (
                <div key={stat.device} className="flex items-center justify-between">
                  <span className="text-sm">{stat.device}</span>
                  <span className="font-medium">{formatNumber(stat.count)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Länder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.geoStats.slice(0, 5).map((stat, index) => (
                <div key={stat.country} className="flex items-center justify-between">
                  <span className="text-sm">{stat.country}</span>
                  <span className="font-medium">{formatNumber(stat.count)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Button */}
      <Card>
        <CardContent className="p-6">
          <Button className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Analytics als CSV exportieren
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 