'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Leaf, TrendingUp, Recycle, Heart } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { db } from '@/lib/db'
import { useAuth } from '@/components/providers/auth-provider'

interface WasteDiversionData {
  action_type: string
  count: number
  total_co2_saved: number
  total_recovered_value: number
}

interface SustainabilityMetrics {
  totalCO2Saved: number
  totalValueRecovered: number
  wastePreventionRate: number
  sustainabilityScore: number
  wasteDiversion: WasteDiversionData[]
}

const ACTION_COLORS = {
  VENDOR_RETURN: '#3B82F6', // Blue
  FLASH_SALE: '#F59E0B',    // Orange
  NGO_DONATION: '#10B981',  // Green
  EXPIRED_WASTE: '#EF4444'  // Red
}

const ACTION_LABELS = {
  VENDOR_RETURN: 'Vendor Returns',
  FLASH_SALE: 'Flash Sales',
  NGO_DONATION: 'NGO Donations',
  EXPIRED_WASTE: 'Expired Waste'
}

export function SustainabilityScore() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<SustainabilityMetrics>({
    totalCO2Saved: 0,
    totalValueRecovered: 0,
    wastePreventionRate: 0,
    sustainabilityScore: 0,
    wasteDiversion: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSustainabilityMetrics()
    
    // Set up real-time subscription for waste_logs changes
    const channel = db
      .channel('sustainability-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'waste_logs' },
        () => {
          loadSustainabilityMetrics()
        }
      )
      .subscribe()

    return () => {
      db.removeChannel(channel)
    }
  }, [])

  const loadSustainabilityMetrics = async () => {
    try {
      // Get waste logs data
      const { data: wasteLogs, error } = await db
        .from('waste_logs')
        .select('action_type, co2_emissions_saved, recovered_value')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!wasteLogs || wasteLogs.length === 0) {
        setLoading(false)
        return
      }

      // Calculate metrics
      const totalCO2Saved = wasteLogs.reduce((sum: number, log: any) => sum + (log.co2_emissions_saved || 0), 0)
      const totalValueRecovered = wasteLogs.reduce((sum: number, log: any) => sum + (log.recovered_value || 0), 0)

      // Group by action type for waste diversion chart
      const diversionMap = new Map<string, WasteDiversionData>()
      
      wasteLogs.forEach((log: any) => {
        const existing = diversionMap.get(log.action_type) || {
          action_type: log.action_type,
          count: 0,
          total_co2_saved: 0,
          total_recovered_value: 0
        }
        
        existing.count += 1
        existing.total_co2_saved += log.co2_emissions_saved || 0
        existing.total_recovered_value += log.recovered_value || 0
        
        diversionMap.set(log.action_type, existing)
      })

      const wasteDiversion = Array.from(diversionMap.values())

      // Calculate waste prevention rate (non-expired actions / total actions)
      const preventiveActions = wasteLogs.filter((log: any) => log.action_type !== 'EXPIRED_WASTE').length
      const wastePreventionRate = wasteLogs.length > 0 ? (preventiveActions / wasteLogs.length) * 100 : 0

      // Calculate sustainability score (0-100 based on CO2 saved and prevention rate)
      const co2Score = Math.min(totalCO2Saved * 2, 50) // Max 50 points for CO2
      const preventionScore = wastePreventionRate * 0.5 // Max 50 points for prevention
      const sustainabilityScore = Math.round(co2Score + preventionScore)

      setMetrics({
        totalCO2Saved,
        totalValueRecovered,
        wastePreventionRate,
        sustainabilityScore,
        wasteDiversion
      })

    } catch (error) {
      console.error('Error loading sustainability metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSustainabilityGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'bg-green-600', textColor: 'text-green-600' }
    if (score >= 80) return { grade: 'A', color: 'bg-green-500', textColor: 'text-green-500' }
    if (score >= 70) return { grade: 'B+', color: 'bg-blue-500', textColor: 'text-blue-500' }
    if (score >= 60) return { grade: 'B', color: 'bg-blue-400', textColor: 'text-blue-400' }
    if (score >= 50) return { grade: 'C+', color: 'bg-orange-500', textColor: 'text-orange-500' }
    if (score >= 40) return { grade: 'C', color: 'bg-orange-400', textColor: 'text-orange-400' }
    return { grade: 'D', color: 'bg-red-500', textColor: 'text-red-500' }
  }

  const pieChartData = metrics.wasteDiversion.map(item => ({
    name: ACTION_LABELS[item.action_type as keyof typeof ACTION_LABELS] || item.action_type,
    value: item.count,
    co2Saved: item.total_co2_saved,
    valueRecovered: item.total_recovered_value
  }))

  const barChartData = metrics.wasteDiversion.map(item => ({
    name: ACTION_LABELS[item.action_type as keyof typeof ACTION_LABELS] || item.action_type,
    co2Saved: item.total_co2_saved,
    valueRecovered: item.total_recovered_value / 1000 // Convert to thousands for better visualization
  }))

  const sustainabilityGrade = getSustainabilityGrade(metrics.sustainabilityScore)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Sustainability Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sustainability Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Sustainability Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Main Score */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${sustainabilityGrade.color} text-white text-2xl font-bold mb-2`}>
                {sustainabilityGrade.grade}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {metrics.sustainabilityScore}
              </div>
              <div className="text-sm text-gray-600">Sustainability Score</div>
            </div>

            {/* CO2 Saved */}
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mx-auto mb-2">
                <Leaf className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metrics.totalCO2Saved.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">kg CO₂ Saved</div>
            </div>

            {/* Value Recovered */}
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mx-auto mb-2">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                ₹{(metrics.totalValueRecovered / 1000).toFixed(1)}K
              </div>
              <div className="text-sm text-gray-600">Value Recovered</div>
            </div>

            {/* Prevention Rate */}
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 mx-auto mb-2">
                <Recycle className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metrics.wastePreventionRate.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Waste Prevention</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Waste Diversion Charts */}
      {metrics.wasteDiversion.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Waste Diversion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Recycle className="h-5 w-5 text-blue-600" />
                Waste Diversion Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(((percent ?? 0) as number) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => {
                      const actionType = metrics.wasteDiversion[index]?.action_type
                      const color = ACTION_COLORS[actionType as keyof typeof ACTION_COLORS] || '#8884d8'
                      return <Cell key={`cell-${index}`} fill={color} />
                    })}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} actions`,
                      name,
                      `CO₂ Saved: ${props.payload.co2Saved.toFixed(1)} kg`,
                      `Value: ₹${props.payload.valueRecovered.toFixed(2)}`
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart - Impact Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Environmental & Financial Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'CO₂ Saved'
                        ? `${Number(value ?? 0)} kg`
                        : `₹${(Number(value ?? 0) * 1000).toFixed(0)}`,
                      name
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="co2Saved" fill="#10B981" name="CO₂ Saved (kg)" />
                  <Bar yAxisId="right" dataKey="valueRecovered" fill="#3B82F6" name="Value Recovered (₹K)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {metrics.wasteDiversion.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Sustainability Journey</h3>
            <p className="text-gray-600">Process rescue actions to see your environmental impact here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}