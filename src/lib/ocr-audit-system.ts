// OCR-Based Inventory Addition and Audit System
// Production-grade OCR workflow with clean session management and audit trail

import { db } from './db'
import Tesseract from 'tesseract.js'

export interface OCRScanSession {
  id: string
  session_id: string
  scan_type: 'camera' | 'upload' | 'manual'
  original_image_url?: string
  extracted_data?: any
  processed_data?: any
  confidence_score?: number
  scan_status: 'processing' | 'completed' | 'failed'
  scanned_by: string
  created_at: string
  completed_at?: string
}

export interface ExtractedMedicineData {
  medicine_name?: string
  batch_no?: string
  manufacturing_date?: string
  expiry_date?: string
  quantity?: number
  unit_price?: number
  supplier_name?: string
  confidence_scores: {
    medicine_name: number
    batch_no: number
    expiry_date: number
    overall: number
  }
}

export interface AuditOperation {
  id: string
  operation_type: 'check_in' | 'check_out' | 'transfer' | 'adjustment'
  operation_id: string
  inventory_item_id?: string
  medicine_name: string
  batch_no: string
  quantity_before?: number
  quantity_after?: number
  quantity_changed: number
  shelf_location_from?: string
  shelf_location_to?: string
  manufacturing_date?: string
  expiry_date: string
  unit_price?: number
  supplier_name?: string
  supplier_batch_ref?: string
  reason?: string
  performed_by: string
  verified_by?: string
  ocr_session_id?: string
  created_at: string
  verified_at?: string
}

export class OCRAuditSystem {
  private static instance: OCRAuditSystem
  private currentSession: OCRScanSession | null = null
  private isProcessing = false

  private normalizeSession(row: any): OCRScanSession {
    return {
      id: row.id,
      session_id: row.session_id ?? row.id,
      scan_type: (row.scan_type ?? 'upload') as OCRScanSession['scan_type'],
      original_image_url: row.original_image_url ?? undefined,
      extracted_data: row.extracted_data ?? undefined,
      processed_data: row.processed_data ?? undefined,
      confidence_score: row.confidence_score ?? undefined,
      scan_status: (row.scan_status ?? 'processing') as OCRScanSession['scan_status'],
      scanned_by: row.scanned_by ?? 'system',
      created_at: row.created_at ?? new Date().toISOString(),
      completed_at: row.completed_at ?? undefined,
    }
  }

  private normalizeAuditOperation(row: any, fallback: Partial<AuditOperation>): AuditOperation {
    return {
      id: row?.id ?? fallback.id ?? `audit_${Date.now()}`,
      operation_type: (row?.operation_type ?? fallback.operation_type ?? 'check_in') as AuditOperation['operation_type'],
      operation_id: row?.operation_id ?? fallback.operation_id ?? `OP_${Date.now()}`,
      inventory_item_id: row?.inventory_item_id ?? fallback.inventory_item_id,
      medicine_name: row?.medicine_name ?? fallback.medicine_name ?? 'Unknown Medicine',
      batch_no: row?.batch_no ?? fallback.batch_no ?? 'UNKNOWN',
      quantity_before: row?.quantity_before ?? fallback.quantity_before,
      quantity_after: row?.quantity_after ?? fallback.quantity_after,
      quantity_changed: row?.quantity_changed ?? fallback.quantity_changed ?? 0,
      shelf_location_from: row?.shelf_location_from ?? fallback.shelf_location_from,
      shelf_location_to: row?.shelf_location_to ?? fallback.shelf_location_to,
      manufacturing_date: row?.manufacturing_date ?? fallback.manufacturing_date,
      expiry_date:
        row?.expiry_date ??
        fallback.expiry_date ??
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      unit_price: row?.unit_price ?? fallback.unit_price,
      supplier_name: row?.supplier_name ?? fallback.supplier_name,
      supplier_batch_ref: row?.supplier_batch_ref ?? fallback.supplier_batch_ref,
      reason: row?.reason ?? fallback.reason,
      performed_by: row?.performed_by ?? fallback.performed_by ?? 'system',
      verified_by: row?.verified_by ?? fallback.verified_by,
      verified_at: row?.verified_at ?? fallback.verified_at,
      ocr_session_id: row?.ocr_session_id ?? fallback.ocr_session_id,
      created_at: row?.created_at ?? fallback.created_at ?? new Date().toISOString(),
    }
  }

  static getInstance(): OCRAuditSystem {
    if (!OCRAuditSystem.instance) {
      OCRAuditSystem.instance = new OCRAuditSystem()
    }
    return OCRAuditSystem.instance
  }

  /**
   * Start a new OCR scan session
   */
  async startScanSession(
    scanType: 'camera' | 'upload' | 'manual',
    scannedBy: string
  ): Promise<OCRScanSession> {
    try {
      // Clean up any existing session
      await this.cleanupSession()

      const sessionId = `OCR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const { data, error } = await db
        .from('ocr_scan_sessions')
        .insert({
          session_id: sessionId,
          scan_type: scanType,
          scan_status: 'processing',
          scanned_by: scannedBy
        })
        .select()
        .single()

      if (error) throw error

      const normalized = this.normalizeSession(data)
      this.currentSession = normalized
      console.log(`📷 OCR scan session started: ${sessionId}`)
      return normalized
    } catch (error) {
      console.error('Error starting OCR scan session:', error)
      throw error
    }
  }

  /**
   * Process image with OCR
   */
  async processImage(
    imageFile: File | string,
    sessionId?: string
  ): Promise<ExtractedMedicineData> {
    try {
      if (this.isProcessing) {
        throw new Error('OCR processing already in progress')
      }

      this.isProcessing = true

      // Use current session or find by sessionId
      let session = this.currentSession
      if (sessionId && !session) {
        const { data } = await db
          .from('ocr_scan_sessions')
          .select('*')
          .eq('session_id', sessionId)
          .single()
        session = data ? this.normalizeSession(data) : null
      }

      if (!session) {
        throw new Error('No active OCR session found')
      }

      console.log('🔍 Starting OCR processing...')

      // Perform OCR extraction
      const ocrResult = await Tesseract.recognize(imageFile, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
          }
        }
      })

      const extractedText = ocrResult.data.text
      console.log('📝 Raw OCR text extracted:', extractedText)

      // Process and extract medicine data
      const extractedData = this.extractMedicineData(extractedText)
      
      // Update session with results
      await db
        .from('ocr_scan_sessions')
        .update({
          extracted_data: { raw_text: extractedText, confidence: ocrResult.data.confidence },
          processed_data: JSON.parse(JSON.stringify(extractedData)),
          confidence_score: extractedData.confidence_scores.overall,
          scan_status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', session.id)

      console.log('✅ OCR processing completed')
      return extractedData

    } catch (error) {
      console.error('Error processing OCR image:', error)
      
      // Update session status to failed
      if (this.currentSession) {
        await db
          .from('ocr_scan_sessions')
          .update({
            scan_status: 'failed',
            completed_at: new Date().toISOString()
          })
          .eq('id', this.currentSession.id)
      }
      
      throw error
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Extract structured medicine data from OCR text
   */
  private extractMedicineData(text: string): ExtractedMedicineData {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    const result: ExtractedMedicineData = {
      confidence_scores: {
        medicine_name: 0,
        batch_no: 0,
        expiry_date: 0,
        overall: 0
      }
    }

    // Medicine name extraction (usually first significant line)
    const medicinePatterns = [
      /^([A-Z][a-zA-Z\s]+(?:Tablet|Capsule|Syrup|Injection|Cream|Ointment))/i,
      /^([A-Z][a-zA-Z\s]{3,30})/
    ]

    for (const line of lines) {
      for (const pattern of medicinePatterns) {
        const match = line.match(pattern)
        if (match && !result.medicine_name) {
          result.medicine_name = match[1].trim()
          result.confidence_scores.medicine_name = 0.8
          break
        }
      }
    }

    // Batch number extraction
    const batchPatterns = [
      /(?:batch|lot|b\.?no?\.?|lot\s*no\.?)\s*:?\s*([A-Z0-9]{3,15})/i,
      /\b([A-Z]{2,3}\d{3,8})\b/,
      /\b(\d{6,8}[A-Z]{1,3})\b/
    ]

    for (const line of lines) {
      for (const pattern of batchPatterns) {
        const match = line.match(pattern)
        if (match && !result.batch_no) {
          result.batch_no = match[1].trim()
          result.confidence_scores.batch_no = 0.7
          break
        }
      }
    }

    // Expiry date extraction
    const expiryPatterns = [
      /(?:exp|expiry|expires?)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /(?:exp|expiry|expires?)\s*:?\s*(\d{2,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/i,
      /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/,
      /\b(\d{2,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/
    ]

    for (const line of lines) {
      for (const pattern of expiryPatterns) {
        const match = line.match(pattern)
        if (match && !result.expiry_date) {
          const dateStr = match[1]
          const parsedDate = this.parseDate(dateStr)
          if (parsedDate && parsedDate > new Date()) {
            result.expiry_date = parsedDate.toISOString().split('T')[0]
            result.confidence_scores.expiry_date = 0.8
            break
          }
        }
      }
    }

    // Manufacturing date extraction
    const mfgPatterns = [
      /(?:mfg|manufactured?|mfd)\s*:?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /(?:mfg|manufactured?|mfd)\s*:?\s*(\d{2,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/i
    ]

    for (const line of lines) {
      for (const pattern of mfgPatterns) {
        const match = line.match(pattern)
        if (match && !result.manufacturing_date) {
          const dateStr = match[1]
          const parsedDate = this.parseDate(dateStr)
          if (parsedDate && parsedDate < new Date()) {
            result.manufacturing_date = parsedDate.toISOString().split('T')[0]
            break
          }
        }
      }
    }

    // Quantity extraction
    const quantityPatterns = [
      /(?:qty|quantity|count)\s*:?\s*(\d+)/i,
      /\b(\d+)\s*(?:tablets?|capsules?|units?|pcs?)\b/i
    ]

    for (const line of lines) {
      for (const pattern of quantityPatterns) {
        const match = line.match(pattern)
        if (match && !result.quantity) {
          result.quantity = parseInt(match[1])
          break
        }
      }
    }

    // Price extraction
    const pricePatterns = [
      /(?:price|cost|rate)\s*:?\s*₹?\s*(\d+(?:\.\d{2})?)/i,
      /₹\s*(\d+(?:\.\d{2})?)/,
      /\b(\d+\.\d{2})\s*(?:per|each|unit)/i
    ]

    for (const line of lines) {
      for (const pattern of pricePatterns) {
        const match = line.match(pattern)
        if (match && !result.unit_price) {
          result.unit_price = parseFloat(match[1])
          break
        }
      }
    }

    // Supplier extraction
    const supplierPatterns = [
      /(?:mfg|manufactured?\s*by|supplier)\s*:?\s*([A-Z][a-zA-Z\s&\.]{3,30})/i
    ]

    for (const line of lines) {
      for (const pattern of supplierPatterns) {
        const match = line.match(pattern)
        if (match && !result.supplier_name) {
          result.supplier_name = match[1].trim()
          break
        }
      }
    }

    // Calculate overall confidence
    const scores = result.confidence_scores
    const validFields = [
      scores.medicine_name,
      scores.batch_no,
      scores.expiry_date
    ].filter(score => score > 0)

    scores.overall = validFields.length > 0 
      ? validFields.reduce((sum, score) => sum + score, 0) / validFields.length 
      : 0

    return result
  }

  /**
   * Parse date string into Date object
   */
  private parseDate(dateStr: string): Date | null {
    try {
      // Try different date formats
      const formats = [
        /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/, // DD/MM/YYYY or DD-MM-YYYY
        /^(\d{2,4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/, // YYYY/MM/DD or YYYY-MM-DD
      ]

      for (const format of formats) {
        const match = dateStr.match(format)
        if (match) {
          let [, part1, part2, part3] = match
          
          // Handle 2-digit years
          if (part3.length === 2) {
            const year = parseInt(part3)
            part3 = (year > 50 ? '19' : '20') + part3
          }
          
          // Try DD/MM/YYYY format first
          let date = new Date(parseInt(part3), parseInt(part2) - 1, parseInt(part1))
          if (date.getFullYear() == parseInt(part3)) {
            return date
          }
          
          // Try YYYY/MM/DD format
          date = new Date(parseInt(part1), parseInt(part2) - 1, parseInt(part3))
          if (date.getFullYear() == parseInt(part1)) {
            return date
          }
        }
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * Create audit operation for check-in
   */
  async createCheckInOperation(
    medicineData: ExtractedMedicineData,
    quantity: number,
    shelfLocation: string,
    performedBy: string,
    reason?: string
  ): Promise<AuditOperation> {
    try {
      const operationId = `CHK-IN-${Date.now()}`

      // Check if medicine already exists in inventory
      const medName = medicineData.medicine_name
      const batchNo = medicineData.batch_no
      const existingItem = medName && batchNo
        ? (
            await db
              .from('inventory')
              .select('*')
              .eq('med_name', medName)
              .eq('batch_no', batchNo)
              .single()
          ).data
        : null

      let inventoryItemId: string | undefined
      let quantityBefore = 0
      let quantityAfter = quantity

      if (existingItem) {
        // Update existing inventory
        quantityBefore = existingItem.quantity
        quantityAfter = quantityBefore + quantity
        inventoryItemId = existingItem.id

        await db
          .from('inventory')
          .update({
            quantity: quantityAfter,
            shelf_location: shelfLocation,
            price: medicineData.unit_price ?? existingItem.price
          })
          .eq('id', existingItem.id)
      } else {
        // Create new inventory item
        const { data: newItem, error } = await db
          .from('inventory')
          .insert({
            med_name: medicineData.medicine_name || 'Unknown Medicine',
            batch_no: medicineData.batch_no || 'UNKNOWN',
            quantity: quantity,
            expiry_date: medicineData.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            shelf_location: shelfLocation,
            price: medicineData.unit_price || 0
          })
          .select()
          .single()

        if (error) throw error
        inventoryItemId = newItem.id
      }

      // Create audit operation record
      const { data: auditOp, error: auditError } = await db
        .from('audit_operations')
        .insert({
          operation_type: 'check_in',
          operation_id: operationId,
          inventory_item_id: inventoryItemId,
          medicine_name: medicineData.medicine_name || 'Unknown Medicine',
          batch_no: medicineData.batch_no || 'UNKNOWN',
          quantity_before: quantityBefore,
          quantity_after: quantityAfter,
          quantity_changed: quantity,
          shelf_location_to: shelfLocation,
          manufacturing_date: medicineData.manufacturing_date,
          expiry_date: medicineData.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          unit_price: medicineData.unit_price,
          supplier_name: medicineData.supplier_name,
          reason: reason,
          performed_by: performedBy,
          ocr_session_id: this.currentSession?.id
        } as any)
        .select()
        .single()

      if (auditError) throw auditError

      console.log(`✅ Check-in operation completed: ${operationId}`)

      const normalizedAuditOp: AuditOperation = {
        id: (auditOp as any)?.id ?? `audit_${Date.now()}`,
        operation_type: 'check_in',
        operation_id: operationId,
        inventory_item_id: inventoryItemId,
        medicine_name: medicineData.medicine_name || 'Unknown Medicine',
        batch_no: medicineData.batch_no || 'UNKNOWN',
        quantity_before: quantityBefore,
        quantity_after: quantityAfter,
        quantity_changed: quantity,
        shelf_location_to: shelfLocation,
        manufacturing_date: medicineData.manufacturing_date,
        expiry_date:
          medicineData.expiry_date ||
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        unit_price: medicineData.unit_price,
        supplier_name: medicineData.supplier_name,
        reason,
        performed_by: performedBy,
        ocr_session_id: this.currentSession?.id,
        created_at: (auditOp as any)?.created_at ?? new Date().toISOString(),
        verified_by: (auditOp as any)?.verified_by ?? undefined,
        verified_at: (auditOp as any)?.verified_at ?? undefined,
        supplier_batch_ref: (auditOp as any)?.supplier_batch_ref ?? undefined,
        shelf_location_from: (auditOp as any)?.shelf_location_from ?? undefined,
      }

      return normalizedAuditOp
    } catch (error) {
      console.error('Error creating check-in operation:', error)
      throw error
    }
  }

  /**
   * Create audit operation for check-out
   */
  async createCheckOutOperation(
    inventoryItemId: string,
    quantity: number,
    performedBy: string,
    reason?: string
  ): Promise<AuditOperation> {
    try {
      const operationId = `CHK-OUT-${Date.now()}`

      // Get current inventory item
      const { data: item, error: fetchError } = await db
        .from('inventory')
        .select('*')
        .eq('id', inventoryItemId)
        .single()

      if (fetchError || !item) {
        throw new Error('Inventory item not found')
      }

      if (item.quantity < quantity) {
        throw new Error(`Insufficient stock. Available: ${item.quantity}, Requested: ${quantity}`)
      }

      const quantityBefore = item.quantity
      const quantityAfter = quantityBefore - quantity

      // Update inventory
      await db
        .from('inventory')
        .update({ quantity: quantityAfter })
        .eq('id', inventoryItemId)

      // Create audit operation record
      const { data: auditOp, error: auditError } = await db
        .from('audit_operations')
        .insert({
          operation_type: 'check_out',
          operation_id: operationId,
          inventory_item_id: inventoryItemId,
          medicine_name: item.med_name,
          batch_no: item.batch_no,
          quantity_before: quantityBefore,
          quantity_after: quantityAfter,
          quantity_changed: -quantity,
          shelf_location_from: item.shelf_location,
          expiry_date: item.expiry_date,
          unit_price: item.price,
          reason: reason,
          performed_by: performedBy,
          ocr_session_id: this.currentSession?.id
        })
        .select()
        .single()

      if (auditError) throw auditError

      console.log(`✅ Check-out operation completed: ${operationId}`)
      return this.normalizeAuditOperation(auditOp, {
        operation_type: 'check_out',
        operation_id: operationId,
        inventory_item_id: inventoryItemId,
        medicine_name: item.med_name ?? 'Unknown Medicine',
        batch_no: item.batch_no,
        quantity_before: quantityBefore,
        quantity_after: quantityAfter,
        quantity_changed: -quantity,
        shelf_location_from: item.shelf_location,
        expiry_date: item.expiry_date,
        unit_price: item.price,
        reason,
        performed_by: performedBy,
        ocr_session_id: this.currentSession?.id,
      })
    } catch (error) {
      console.error('Error creating check-out operation:', error)
      throw error
    }
  }

  /**
   * Get audit operations history
   */
  async getAuditHistory(limit = 50): Promise<AuditOperation[]> {
    try {
      const { data, error } = await db
        .from('audit_operations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []).map((row: any) =>
        this.normalizeAuditOperation(row, {
          operation_type: (row?.operation_type ?? 'check_in') as any,
          operation_id: row?.operation_id ?? `OP_${Date.now()}`,
          medicine_name: row?.medicine_name ?? 'Unknown Medicine',
          batch_no: row?.batch_no ?? 'UNKNOWN',
          quantity_changed: row?.quantity_changed ?? 0,
          expiry_date: row?.expiry_date ?? new Date().toISOString().split('T')[0],
          performed_by: row?.performed_by ?? 'system',
          created_at: row?.created_at ?? new Date().toISOString(),
        })
      )
    } catch (error) {
      console.error('Error fetching audit history:', error)
      return []
    }
  }

  /**
   * Get OCR scan sessions
   */
  async getScanSessions(limit = 20): Promise<OCRScanSession[]> {
    try {
      const { data, error } = await db
        .from('ocr_scan_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []).map((row: any) => this.normalizeSession(row))
    } catch (error) {
      console.error('Error fetching scan sessions:', error)
      return []
    }
  }

  /**
   * Clean up current session
   */
  async cleanupSession(): Promise<void> {
    try {
      if (this.currentSession) {
        // Mark session as completed if still processing
        if (this.currentSession.scan_status === 'processing') {
          await db
            .from('ocr_scan_sessions')
            .update({
              scan_status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', this.currentSession.id)
        }
      }

      this.currentSession = null
      this.isProcessing = false
      console.log('🧹 OCR session cleaned up')
    } catch (error) {
      console.error('Error cleaning up OCR session:', error)
    }
  }

  /**
   * Get current session
   */
  getCurrentSession(): OCRScanSession | null {
    return this.currentSession
  }

  /**
   * Verify audit operation
   */
  async verifyAuditOperation(
    operationId: string,
    verifiedBy: string
  ): Promise<void> {
    try {
      const { error } = await db
        .from('audit_operations')
        .update({
          verified_by: verifiedBy,
          verified_at: new Date().toISOString()
        })
        .eq('operation_id', operationId)

      if (error) throw error
      console.log(`✅ Audit operation verified: ${operationId}`)
    } catch (error) {
      console.error('Error verifying audit operation:', error)
      throw error
    }
  }
}

// Export singleton instance
export const ocrAuditSystem = OCRAuditSystem.getInstance()