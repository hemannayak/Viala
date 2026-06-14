'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { getCommonTooltipStyle, getCommonAxisStyle } from '@/lib/analytics-utils'

interface SalesTrendChartProps {
  data: Array<{
    date: string
    revenue: number
    quantity: number
    transactions: number
  }>
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Sales Trend Analysis (Last 30 Days)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Daily revenue and transaction patterns
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              {...getCommonAxisStyle()}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              {...getCommonAxisStyle()}
              label={{ value: 'Revenue (₹)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={getCommonTooltipStyle()}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: any, name?: string) => [
                name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                name === 'revenue' ? 'Revenue' : name === 'quantity' ? 'Units Sold' : 'Transactions'
              ]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#0D9488"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}