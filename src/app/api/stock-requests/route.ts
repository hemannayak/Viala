/**
 * Secure Stock Requests API Routes
 * Handles stock request operations with proper validation and notifications
 */

import { NextRequest } from 'next/server'
import { ApiSecurity, withAuth } from '@/lib/api-security'
import { BusinessSchemas, validateData } from '@/lib/data-validation'
import { db } from '@/lib/auth'

export const GET = withAuth(
  async (req, user) => {
      try {
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        // Build query
        let query = db
          .from('stock_requests')
          .select(`
            *,
            requested_by_profile:user_profiles!requested_by(name, email),
            approved_by_profile:user_profiles!approved_by(name, email)
          `, { count: 'exact' })
          .eq('pharmacy_id', user.pharmacy_id)
          .order('created_at', { ascending: false })

        // Apply status filter
        if (status && ['PENDING', 'APPROVED', 'REJECTED', 'FULFILLED'].includes(status)) {
          query = query.eq('status', status)
        }

        // Apply pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)

        const { data, error, count } = await query

        if (error) {
          console.error('Database error:', error)
          return ApiSecurity.createResponse(
            false,
            null,
            'Database error',
            'Failed to fetch stock requests',
            500
          )
        }

        return ApiSecurity.createResponse(
          true,
          {
            requests: data || [],
            pagination: {
              page,
              limit,
              total: count || 0,
              pages: Math.ceil((count || 0) / limit)
            }
          },
          undefined,
          'Stock requests retrieved successfully'
        )

      } catch (error) {
        console.error('Stock requests GET API error:', error)
        return ApiSecurity.createResponse(
          false,
          null,
          'Internal server error',
          'An unexpected error occurred',
          500
        )
      }
  },
  { requiredRoles: ['pharmacist', 'admin', 'manager'] }
)

export const POST = withAuth(
  async (req, user) => {
      try {
        const body = await req.json()
        
        // Validate input
        const validation = validateData(BusinessSchemas.stockRequest, {
          ...body,
          pharmacy_id: user.pharmacy_id
        })

        if (!validation.success) {
          return ApiSecurity.createResponse(
            false,
            null,
            'Validation error',
            validation.errors?.join(', '),
            400
          )
        }

        const requestData = validation.data!

        // Determine urgency level based on current stock
        let urgencyLevel = 'LOW'
        if (requestData.current_stock === 0) urgencyLevel = 'CRITICAL'
        else if (requestData.current_stock <= 5) urgencyLevel = 'HIGH'
        else if (requestData.current_stock <= 20) urgencyLevel = 'MEDIUM'

        // Create stock request
        const { data, error } = await db
          .from('stock_requests')
          .insert({
            pharmacy_id: user.pharmacy_id,
            requested_by: user.id,
            medicine_name: requestData.medicine_name,
            current_stock: requestData.current_stock,
            requested_quantity: requestData.requested_quantity,
            urgency_level: urgencyLevel,
            justification: requestData.justification,
            status: 'PENDING'
          })
          .select(`
            *,
            requested_by_profile:user_profiles!requested_by(name, email)
          `)
          .single()

        if (error) {
          console.error('Database error:', error)
          return ApiSecurity.createResponse(
            false,
            null,
            'Database error',
            'Failed to create stock request',
            500
          )
        }

        // Send notification to managers (in production, this would be email/SMS)
        await sendManagerNotification(data, user)

        return ApiSecurity.createResponse(
          true,
          data,
          undefined,
          'Stock request submitted successfully. Manager has been notified.',
          201
        )

      } catch (error) {
        console.error('Stock requests POST API error:', error)
        return ApiSecurity.createResponse(
          false,
          null,
          'Internal server error',
          'An unexpected error occurred',
          500
        )
      }
  },
  { requiredRoles: ['pharmacist', 'admin', 'manager'] }
)

export const PUT = withAuth(
  async (req, user) => {
      try {
        const body = await req.json()
        const { id, status, approval_notes } = body

        if (!id || !status) {
          return ApiSecurity.createResponse(
            false,
            null,
            'Missing parameters',
            'Request ID and status are required',
            400
          )
        }

        if (!['APPROVED', 'REJECTED', 'FULFILLED'].includes(status)) {
          return ApiSecurity.createResponse(
            false,
            null,
            'Invalid status',
            'Status must be APPROVED, REJECTED, or FULFILLED',
            400
          )
        }

        // Only admins and managers can approve/reject requests
        if (!['admin', 'manager'].includes(user.role)) {
          return ApiSecurity.createResponse(
            false,
            null,
            'Insufficient permissions',
            'Only admins and managers can update stock requests',
            403
          )
        }

        // Check if request exists and belongs to user's pharmacy
        const { data: existingRequest, error: fetchError } = await db
          .from('stock_requests')
          .select('*')
          .eq('id', id)
          .eq('pharmacy_id', user.pharmacy_id)
          .single()

        if (fetchError || !existingRequest) {
          return ApiSecurity.createResponse(
            false,
            null,
            'Request not found',
            'Stock request not found or access denied',
            404
          )
        }

        if (existingRequest.status !== 'PENDING') {
          return ApiSecurity.createResponse(
            false,
            null,
            'Invalid operation',
            'Only pending requests can be updated',
            400
          )
        }

        // Update the request
        const { data, error } = await db
          .from('stock_requests')
          .update({
            status,
            approved_by: user.id,
            approved_at: new Date().toISOString(),
            approval_notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('pharmacy_id', user.pharmacy_id)
          .select(`
            *,
            requested_by_profile:user_profiles!requested_by(name, email),
            approved_by_profile:user_profiles!approved_by(name, email)
          `)
          .single()

        if (error) {
          console.error('Database error:', error)
          return ApiSecurity.createResponse(
            false,
            null,
            'Database error',
            'Failed to update stock request',
            500
          )
        }

        // Notify the requester (in production, this would be email/SMS)
        await sendRequesterNotification(data, status)

        return ApiSecurity.createResponse(
          true,
          data,
          undefined,
          `Stock request ${status.toLowerCase()} successfully`
        )

      } catch (error) {
        console.error('Stock requests PUT API error:', error)
        return ApiSecurity.createResponse(
          false,
          null,
          'Internal server error',
          'An unexpected error occurred',
          500
        )
      }
  },
  { requiredRoles: ['admin', 'manager'] }
)

// Helper functions for notifications
async function sendManagerNotification(request: any, requester: any) {
  try {
    // Get all managers for this pharmacy
    const { data: managers } = await db
      .from('user_profiles')
      .select('email, name')
      .eq('pharmacy_id', requester.pharmacy_id)
      .eq('role', 'manager')
      .eq('is_active', true)

    // In production, send actual emails/SMS
    console.log('Manager notification:', {
      recipients: managers,
      subject: `${request.urgency_level} Stock Request: ${request.medicine_name}`,
      message: `${requester.name} has requested ${request.requested_quantity} units of ${request.medicine_name}. Current stock: ${request.current_stock}`,
      urgency: request.urgency_level,
      requestId: request.id
    })

    // Log notification in audit trail
    await db
      .from('audit_logs')
      .insert({
        user_id: requester.id,
        pharmacy_id: requester.pharmacy_id,
        action: 'NOTIFICATION_SENT',
        table_name: 'stock_requests',
        record_id: request.id,
        new_values: {
          type: 'manager_notification',
          recipients: managers?.length || 0,
          urgency: request.urgency_level
        }
      })

  } catch (error) {
    console.error('Failed to send manager notification:', error)
  }
}

async function sendRequesterNotification(request: any, status: string) {
  try {
    // In production, send actual email/SMS to requester
    console.log('Requester notification:', {
      recipient: request.requested_by_profile?.email,
      subject: `Stock Request ${status}: ${request.medicine_name}`,
      message: `Your stock request for ${request.medicine_name} has been ${status.toLowerCase()}.`,
      requestId: request.id,
      approvalNotes: request.approval_notes
    })

  } catch (error) {
    console.error('Failed to send requester notification:', error)
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}