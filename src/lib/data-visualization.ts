import type { VisualizationData, DataItem } from '@/hooks/use-data-analytics'

// Constants for better maintainability
const FEFO_THRESHOLDS = {
  EXPIRED: 0,
  CRITICAL: 30,
  WARNING: 90,
  MODERATE: 180
} as const

const SALES_THRESHOLDS = {
  HIGH_REVENUE: 10000,
  LOW_REVENUE: 5000,
  DIVERSE_PRODUCTS: 50
} as const

const RISK_THRESHOLDS = {
  HIGH_RISK_DAYS: 30,
  MEDIUM_RISK_DAYS: 60,
  LOW_VELOCITY: 1,
  MEDIUM_VELOCITY: 2
} as const

// Helper functions
export const calculateDaysToExpiry = (expiryDate: string): number => {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const calculateFefoStatus = (expiryDate: string): string => {
  const days = calculateDaysToExpiry(expiryDate)
  if (days <= FEFO_THRESHOLDS.EXPIRED) return 'EXPIRED'
  if (days <= FEFO_THRESHOLDS.CRITICAL) return 'CRITICAL'
  if (days <= FEFO_THRESHOLDS.WARNING) return 'WARNING'
  if (days <= FEFO_THRESHOLDS.MODERATE) return 'MODERATE'
  return 'HEALTHY'
}

export const calculateSalesVelocity = (item: DataItem, sales: DataItem[]): number => {
  const medicineName = item.medicine_name || item.med_name
  const recentSales = sales.filter(sale => 
    (sale.medicine_name || sale.product_name) === medicineName
  )
  
  if (recentSales.length === 0) return 0
  
  const totalQuantity = recentSales.reduce((sum, sale) => 
    sum + (sale.quantity_sold || sale.qty || 0), 0)
  
  return totalQuantity / 30 // Average daily sales
}

// Data processing functions
export const processSalesData = (sales: DataItem[]) => {
  return sales.map(item => ({
    date: item.date || item.sale_date,
    revenue: item.total_amount || item.revenue || 0,
    quantity: item.quantity_sold || item.qty || 0,
    product: item.medicine_name || item.product_name
  }))
}

export const processTopProducts = (sales: DataItem[]) => {
  const productSales = sales.reduce((acc, item) => {
    const product = item.medicine_name || item.product_name || 'Unknown'
    const revenue = item.total_amount || item.revenue || 0
    acc[product] = (acc[product] || 0) + revenue
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(productSales)
    .map(([product, revenue]) => ({ product, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
}

export const processInventoryHealth = (inventory: DataItem[]) => {
  return inventory.map(item => ({
    medicine: item.medicine_name || item.med_name || 'Unknown',
    daysToExpiry: calculateDaysToExpiry(item.expiry_date),
    quantity: item.quantity || item.current_stock || 0,
    category: item.category || 'Uncategorized',
    status: calculateFefoStatus(item.expiry_date)
  }))
}

export const processStockLevels = (inventory: DataItem[]) => {
  const statusCounts = inventory.reduce((acc, item) => {
    const status = calculateFefoStatus(item.expiry_date)
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: Math.round((count / inventory.length) * 100)
  }))
}

export const processWasteData = (inventory: DataItem[], sales: DataItem[]) => {
  return inventory.map(item => {
    const daysToExpiry = calculateDaysToExpiry(item.expiry_date)
    const salesVelocity = calculateSalesVelocity(item, sales)
    
    let riskLevel: 'high' | 'medium' | 'low' = 'low'
    if (daysToExpiry < RISK_THRESHOLDS.HIGH_RISK_DAYS && salesVelocity < RISK_THRESHOLDS.LOW_VELOCITY) {
      riskLevel = 'high'
    } else if (daysToExpiry < RISK_THRESHOLDS.MEDIUM_RISK_DAYS && salesVelocity < RISK_THRESHOLDS.MEDIUM_VELOCITY) {
      riskLevel = 'medium'
    }
    
    return {
      medicine: item.medicine_name || item.med_name || 'Unknown',
      daysToExpiry,
      salesVelocity,
      quantity: item.quantity || item.current_stock || 0,
      riskLevel
    }
  })
}

// Insight generation functions
export const generateSalesInsights = (sales: DataItem[]): string[] => {
  const insights: string[] = []
  const totalRevenue = sales.reduce((sum, item) => sum + (item.total_amount || item.revenue || 0), 0)
  const avgDailyRevenue = totalRevenue / 30
  
  insights.push(`Total revenue: ₹${totalRevenue.toLocaleString()}`)
  insights.push(`Average daily revenue: ₹${avgDailyRevenue.toFixed(0)}`)
  
  if (avgDailyRevenue > SALES_THRESHOLDS.HIGH_REVENUE) {
    insights.push('Strong sales performance - consider expanding inventory')
  } else if (avgDailyRevenue < SALES_THRESHOLDS.LOW_REVENUE) {
    insights.push('Sales below target - review pricing and promotions')
  }
  
  return insights
}

export const generateProductInsights = (sales: DataItem[]): string[] => {
  const insights: string[] = []
  const uniqueProducts = new Set(sales.map(item => item.medicine_name || item.product_name)).size
  
  insights.push(`${uniqueProducts} unique products sold`)
  
  if (uniqueProducts > SALES_THRESHOLDS.DIVERSE_PRODUCTS) {
    insights.push('Diverse product portfolio - good market coverage')
  } else {
    insights.push('Limited product range - opportunity to expand')
  }
  
  return insights
}

export const generateInventoryInsights = (inventory: DataItem[]): string[] => {
  const insights: string[] = []
  const criticalItems = inventory.filter(item => 
    calculateDaysToExpiry(item.expiry_date) <= FEFO_THRESHOLDS.CRITICAL
  ).length
  const totalItems = inventory.length
  
  insights.push(`${criticalItems} items expiring within 30 days`)
  insights.push(`${Math.round((criticalItems / totalItems) * 100)}% of inventory needs immediate attention`)
  
  if (criticalItems > totalItems * 0.2) {
    insights.push('High expiry risk - implement FEFO urgently')
  }
  
  return insights
}

export const generateStockInsights = (inventory: DataItem[]): string[] => {
  const insights: string[] = []
  const totalValue = inventory.reduce((sum, item) => 
    sum + ((item.quantity || item.current_stock || 0) * (item.price || 0)), 0)
  
  insights.push(`Total inventory value: ₹${totalValue.toLocaleString()}`)
  
  return insights
}

export const generateWasteInsights = (inventory: DataItem[], sales: DataItem[]): string[] => {
  const insights: string[] = []
  const highRiskItems = inventory.filter(item => {
    const daysToExpiry = calculateDaysToExpiry(item.expiry_date)
    const salesVelocity = calculateSalesVelocity(item, sales)
    return daysToExpiry < RISK_THRESHOLDS.HIGH_RISK_DAYS && salesVelocity < RISK_THRESHOLDS.LOW_VELOCITY
  }).length
  
  insights.push(`${highRiskItems} items at high risk of wastage`)
  
  if (highRiskItems > 0) {
    insights.push('Implement discount strategies for at-risk items')
    insights.push('Consider NGO donations for slow-moving medicines')
  }
  
  return insights
}

// Main visualization generation function
export const generateVisualizationsFromData = async (data: any): Promise<VisualizationData[]> => {
  const visualizations: VisualizationData[] = []
  
  // Sales Analytics
  if (data.sales?.length > 0) {
    visualizations.push(
      {
        id: 'sales-trends',
        title: 'Sales Trends Analysis',
        type: 'line-chart',
        description: 'Daily/monthly sales patterns from your dataset',
        data: processSalesData(data.sales),
        insights: generateSalesInsights(data.sales)
      },
      {
        id: 'top-products',
        title: 'Top Selling Products',
        type: 'bar-chart',
        description: 'Best performing medicines by revenue',
        data: processTopProducts(data.sales),
        insights: generateProductInsights(data.sales)
      }
    )
  }
  
  // Inventory Analytics
  if (data.inventory?.length > 0) {
    visualizations.push(
      {
        id: 'inventory-health',
        title: 'Inventory Health Dashboard',
        type: 'heatmap',
        description: 'FEFO status and expiry analysis',
        data: processInventoryHealth(data.inventory),
        insights: generateInventoryInsights(data.inventory)
      },
      {
        id: 'stock-levels',
        title: 'Stock Level Distribution',
        type: 'pie-chart',
        description: 'Current stock status across categories',
        data: processStockLevels(data.inventory),
        insights: generateStockInsights(data.inventory)
      }
    )
  }
  
  // Waste Analytics
  if (data.inventory?.length > 0 && data.sales?.length > 0) {
    visualizations.push({
      id: 'waste-prevention',
      title: 'Waste Prevention Opportunities',
      type: 'scatter-plot',
      description: 'Identify medicines at risk of expiry',
      data: processWasteData(data.inventory, data.sales),
      insights: generateWasteInsights(data.inventory, data.sales)
    })
  }
  
  return visualizations
}