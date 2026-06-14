/**
 * Rescue Actions API Route
 * Handles processing of rescue actions and waste log creation
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createWasteLogEntry, type ProcessRescueActionParams } from '@/lib/rescue-matrix'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      inventoryId,
      action,
      quantity,
      originalValue,
      recoveryPercentage,
      co2Saved,
      userId,
      pharmacyId,
      notes
    }: ProcessRescueActionParams = body

    // Validate required fields
    if (!inventoryId || !action || !quantity || !userId || !pharmacyId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create waste log entry
    const wasteLogData = createWasteLogEntry({
      inventoryId,
      action,
      quantity,
      originalValue,
      recoveryPercentage,
      co2Saved,
      userId,
      pharmacyId,
      notes
    })

    // Insert waste log
    const { error: wasteLogError } = await db
      .from('waste_logs')
      .insert(wasteLogData)

    if (wasteLogError) {
      console.error('Waste log creation error:', wasteLogError)
      return NextResponse.json(
        { error: 'Failed to create waste log' },
        { status: 500 }
      )
    }

    // Update inventory stock to 0
    const { error: inventoryError } = await db
      .from('inventory')
      .update({ current_stock: 0 })
      .eq('id', inventoryId)

    if (inventoryError) {
      console.error('Inventory update error:', inventoryError)
      return NextResponse.json(
        { error: 'Failed to update inventory' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Rescue action processed successfully',
      recoveredValue: wasteLogData.recovered_value,
      co2Saved: wasteLogData.co2_emissions_saved
    })

  } catch (error) {
    console.error('Rescue action API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pharmacyId = searchParams.get('pharmacy_id')

    if (!pharmacyId) {
      return NextResponse.json(
        { error: 'Pharmacy ID required' },
        { status: 400 }
      )
    }

    // Get waste logs for analytics
    const { data: wasteLogs, error } = await db
      .from('waste_logs')
      .select('*')
      .eq('pharmacy_id', pharmacyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Waste logs fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch waste logs' },
        { status: 500 }
      )
    }

    // Calculate summary metrics
    const totalCO2Saved = wasteLogs?.reduce((sum: number, log: any) => sum + (log.co2_emissions_saved || 0), 0) || 0
    const totalValueRecovered = wasteLogs?.reduce((sum: number, log: any) => sum + (log.recovered_value || 0), 0) || 0
    const preventiveActions = wasteLogs?.filter((log: any) => log.action_type !== 'EXPIRED_WASTE').length || 0
    const wastePreventionRate = wasteLogs?.length ? (preventiveActions / wasteLogs.length) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        wasteLogs: wasteLogs || [],
        summary: {
          totalCO2Saved,
          totalValueRecovered,
          wastePreventionRate,
          totalActions: wasteLogs?.length || 0
        }
      }
    })

  } catch (error) {
    console.error('Rescue actions GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}