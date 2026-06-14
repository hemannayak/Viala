/**
 * Secure Inventory API Routes
 * Handles inventory operations with proper authentication and validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await AuthService.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const expiry_status = searchParams.get('expiry_status')
    const search_term = searchParams.get('search_term')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build query
    let query = db
      .from('inventory')
      .select('*', { count: 'exact' })
      .order('expiry_date', { ascending: true })

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (search_term) {
      query = query.ilike('med_name', `%${search_term}%`)
    }

    if (expiry_status) {
      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

      switch (expiry_status) {
        case 'expired':
          query = query.lt('expiry_date', now.toISOString())
          break
        case 'critical':
          query = query.gte('expiry_date', now.toISOString())
                       .lt('expiry_date', thirtyDaysFromNow.toISOString())
          break
        case 'warning':
          query = query.gte('expiry_date', thirtyDaysFromNow.toISOString())
                       .lt('expiry_date', ninetyDaysFromNow.toISOString())
          break
        case 'healthy':
          query = query.gte('expiry_date', ninetyDaysFromNow.toISOString())
          break
      }
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch inventory data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        items: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      },
      message: 'Inventory data retrieved successfully'
    })

  } catch (error) {
    console.error('Inventory GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await AuthService.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['med_name', 'batch_no', 'expiry_date', 'quantity', 'price', 'shelf_location']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: 'Validation error', message: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Insert new inventory item
    const { data, error } = await db
      .from('inventory')
      .insert({
        med_name: body.med_name,
        batch_no: body.batch_no,
        expiry_date: body.expiry_date,
        manufacturing_date: body.manufacturing_date,
        quantity: body.quantity,
        current_stock: body.quantity, // Initialize current_stock with quantity
        price: body.price,
        batch_cost_price: body.batch_cost_price,
        shelf_location: body.shelf_location,
        category: body.category,
        is_seasonal: body.is_seasonal || false,
        is_returnable: body.is_returnable || false,
        vendor_name: body.vendor_name,
        return_deadline: body.return_deadline
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to create inventory item' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Inventory item created successfully'
    })

  } catch (error) {
    console.error('Inventory POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const user = await AuthService.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Missing inventory item ID' },
        { status: 400 }
      )
    }

    // Update inventory item
    const { data, error } = await db
      .from('inventory')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to update inventory item' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Inventory item updated successfully'
    })

  } catch (error) {
    console.error('Inventory PUT API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const user = await AuthService.getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Missing inventory item ID' },
        { status: 400 }
      )
    }

    // Delete inventory item
    const { error } = await db
      .from('inventory')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to delete inventory item' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory item deleted successfully'
    })

  } catch (error) {
    console.error('Inventory DELETE API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}