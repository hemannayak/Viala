'use client'

import { useEffect, useState, useCallback } from 'react'
import { db, EcoMetrics, calculateEcoMetrics, type InventoryItem } from '@/lib/db'

export function useDashboardMetrics(role: string | null) {
  const [ecoMetrics, setEcoMetrics] = useState<EcoMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEcoMetrics = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await db
        .from('inventory')
        .select('id, med_name, batch_no, expiry_date, quantity, price, shelf_location, category, is_seasonal, created_at')

      if (error) throw error

      const inventoryData: InventoryItem[] = (data || []).map((item: any) => ({
        ...item,
        med_name: item.med_name ?? 'Unknown',
        category: item.category ?? 'General',
        is_seasonal: item.is_seasonal ?? false,
        created_at: item.created_at ?? new Date().toISOString(),
      }))

      const metrics = calculateEcoMetrics(inventoryData)
      setEcoMetrics(metrics)
    } catch (err) {
      console.error('Error fetching eco metrics:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
      setEcoMetrics(null)
    } finally {
      setLoading(false)
    }
  }, []) // Empty dependency array to prevent recreation

  useEffect(() => {
    if (role === 'admin') {
      fetchEcoMetrics()

      // Subscribe to realtime changes
      const channel = db
        .channel('dashboard-eco-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'inventory'
          },
          () => {
            fetchEcoMetrics()
          }
        )
        .subscribe()

      return () => {
        db.removeChannel(channel)
      }
    }
  }, [role, fetchEcoMetrics]) // Include fetchEcoMetrics in dependencies

  return { ecoMetrics, loading, error }
}