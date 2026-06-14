'use client'

import { MetricCard } from './metric-card'
import { DollarSign, Package, Users } from 'lucide-react'
import { formatCurrency, formatNumber, calculateAverage } from '@/lib/analytics-utils'
import type { SalesMetrics } from '@/types/analytics'

interface PerformanceMetricsProps {
  metrics: SalesMetrics
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        title="Revenue Analytics"
        value={formatCurrency(metrics.totalRevenue)}
        subtitle="Total Revenue"
        icon={DollarSign}
        iconColor="text-emerald-600"
        borderColor="border-emerald-200"
        bgColor="bg-emerald-50"
      >
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">
              {formatCurrency(metrics.avgPerSale)}
            </p>
            <p className="text-xs text-muted-foreground">Avg per Sale</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary">
              {formatCurrency(metrics.dailyAvgRevenue)}
            </p>
            <p className="text-xs text-muted-foreground">Daily Avg</p>
          </div>
        </div>
      </MetricCard>

      <MetricCard
        title="Volume Analytics"
        value={formatNumber(metrics.totalUnits)}
        subtitle="Units Sold"
        icon={Package}
        iconColor="text-blue-600"
        borderColor="border-blue-200"
        bgColor="bg-blue-50"
      >
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">
              {metrics.avgUnitsPerSale}
            </p>
            <p className="text-xs text-muted-foreground">Units per Sale</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary">
              {metrics.dailyAvgVolume}
            </p>
            <p className="text-xs text-muted-foreground">Daily Volume</p>
          </div>
        </div>
      </MetricCard>

      <MetricCard
        title="Customer Analytics"
        value={formatNumber(metrics.totalTransactions)}
        subtitle="Total Transactions"
        icon={Users}
        iconColor="text-purple-600"
        borderColor="border-purple-200"
        bgColor="bg-purple-50"
      >
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Walk-in Sales:</span>
            <span className="font-medium">{metrics.walkInSales}</span>
          </div>
          <div className="flex justify-between">
            <span>Prescription Sales:</span>
            <span className="font-medium">{metrics.prescriptionSales}</span>
          </div>
        </div>
      </MetricCard>
    </div>
  )
}