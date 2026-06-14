import { NextResponse } from 'next/server'
import { db as dbAdmin } from '@/lib/db'

interface User {
  id: string
  email: string
  role: string
  lastSignIn: string
  name?: string
}

interface InventoryItem {
  id: string
  name: string
  quantity: number
  threshold: number
  location?: string
}

export async function GET() {
  try {
    // Get all users
    const { data: usersData, error: usersError } = await dbAdmin.auth.admin.listUsers()
    
    if (usersError) throw usersError

    // Format users data
    const users: User[] = (usersData?.users || []).map((user: any) => ({
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'user',
      lastSignIn: user.last_sign_in_at || new Date().toISOString(),
      name: user.user_metadata?.name
    }))

    // Get inventory stats
    const { count: inventoryCount } = await dbAdmin
      .from('inventory')
      .select('*', { count: 'exact', head: true })

    // Get low stock items
    const { data: lowStockItemsData, error: inventoryError } = await dbAdmin
      .from('inventory')
      .select('*')
      .lte('quantity', 20) // Items with quantity <= 20
      .order('quantity', { ascending: true })
      .limit(10)

    if (inventoryError) throw inventoryError

    // Format inventory items
    const lowStockItems: InventoryItem[] = (lowStockItemsData || []).map((item: any) => ({
      id: item.id,
      name: item.med_name || item.name || 'Unnamed Item',
      quantity: item.quantity || 0,
      threshold: item.threshold || 10,
      location: item.shelf_location || item.location
    }))

    return NextResponse.json({
      users,
      inventoryCount: inventoryCount || 0,
      lowStockItems: lowStockItems || []
    })

  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
