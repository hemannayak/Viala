// Dataset Processing & Cleaning for ZENITH'25 Competition
// Handles noisy real-world data and transforms it for Viala

export interface RawDataRecord {
  [key: string]: any // Flexible structure for noisy data
}

export interface CleanedInventoryRecord {
  medicine_name: string
  batch_no: string
  quantity: number
  unit_price: number
  expiry_date: string
  manufacturing_date?: string
  supplier_name?: string
  category: string
  shelf_location: string
  has_return_policy: boolean
}

export interface CleanedSalesRecord {
  date: string
  medicine_name: string
  quantity_sold: number
  unit_price: number
  customer_type: 'walk-in' | 'prescription'
}

export class DatasetProcessor {
  // Data Cleaning Pipeline
  static cleanMedicineName(rawName: string): string {
    if (!rawName) return 'Unknown Medicine'
    
    // Remove special characters, normalize spacing
    return rawName
      .toString()
      .trim()
      .replace(/[^\w\s\-\.]/g, '')
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  static cleanQuantity(rawQuantity: any): number {
    const num = parseFloat(String(rawQuantity).replace(/[^\d\.]/g, ''))
    return isNaN(num) || num < 0 ? 0 : Math.floor(num)
  }

  static cleanPrice(rawPrice: any): number {
    const num = parseFloat(String(rawPrice).replace(/[^\d\.]/g, ''))
    return isNaN(num) || num < 0 ? 0 : Math.round(num * 100) / 100
  }

  static cleanDate(rawDate: any): string {
    if (!rawDate) return new Date().toISOString().split('T')[0]
    
    try {
      // Handle various date formats
      const dateStr = String(rawDate).trim()
      
      // Try different date patterns
      const patterns = [
        /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
        /(\d{1,2})-(\d{1,2})-(\d{4})/, // MM-DD-YYYY
        /(\d{4})\/(\d{1,2})\/(\d{1,2})/, // YYYY/MM/DD
      ]
      
      for (const pattern of patterns) {
        const match = dateStr.match(pattern)
        if (match) {
          let year, month, day
          
          if (pattern.source.startsWith('(\\d{4})')) {
            // Year first
            [, year, month, day] = match
          } else {
            // Month/Day first
            [, month, day, year] = match
          }
          
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0]
          }
        }
      }
      
      // Fallback: try direct Date parsing
      const date = new Date(dateStr)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
      }
    } catch (error) {
      console.warn('Date parsing failed:', rawDate)
    }
    
    // Default to current date
    return new Date().toISOString().split('T')[0]
  }

  static inferCategory(medicineName: string): string {
    const name = medicineName.toLowerCase()
    
    if (name.includes('paracetamol') || name.includes('ibuprofen') || name.includes('aspirin')) {
      return 'Analgesic'
    }
    if (name.includes('amoxicillin') || name.includes('azithromycin') || name.includes('antibiotic')) {
      return 'Antibiotic'
    }
    if (name.includes('vitamin') || name.includes('calcium') || name.includes('iron')) {
      return 'Supplement'
    }
    if (name.includes('syrup') || name.includes('cough')) {
      return 'Cough/Cold'
    }
    if (name.includes('injection')) {
      return 'Injectable'
    }
    if (name.includes('ors') || name.includes('electrolyte')) {
      return 'Hydration'
    }
    
    return 'General'
  }

  static generateShelfLocation(): string {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F']
    const cols = Array.from({ length: 10 }, (_, i) => i + 1)
    
    const row = rows[Math.floor(Math.random() * rows.length)]
    const col = cols[Math.floor(Math.random() * cols.length)]
    
    return `${row}${col}`
  }

  static generateBatchNumber(medicineName: string): string {
    const prefix = medicineName.substring(0, 3).toUpperCase()
    const timestamp = Date.now().toString().slice(-6)
    return `${prefix}${timestamp}`
  }

  // Main Processing Functions
  static processInventoryData(rawData: RawDataRecord[]): CleanedInventoryRecord[] {
    return rawData
      .filter(record => record && Object.keys(record).length > 0)
      .map((record, index) => {
        // Extract fields with various possible column names
        const medicineName = this.cleanMedicineName(
          record.medicine_name || record.drug_name || record.product_name || 
          record.item_name || record.name || `Medicine ${index + 1}`
        )
        
        const quantity = this.cleanQuantity(
          record.quantity || record.stock || record.units || record.qty || 50
        )
        
        const unitPrice = this.cleanPrice(
          record.price || record.unit_price || record.cost || record.mrp || 25.00
        )
        
        const expiryDate = this.cleanDate(
          record.expiry_date || record.exp_date || record.expiry || record.expires_on
        )
        
        const manufacturingDate = record.manufacturing_date || record.mfg_date || record.manufactured_on
          ? this.cleanDate(record.manufacturing_date || record.mfg_date || record.manufactured_on)
          : undefined
        
        const supplierName = record.supplier || record.supplier_name || record.vendor || 'Unknown Supplier'
        
        const category = record.category || this.inferCategory(medicineName)
        
        const batchNo = record.batch_no || record.batch || record.lot_no || 
          this.generateBatchNumber(medicineName)
        
        const shelfLocation = record.shelf_location || record.location || 
          this.generateShelfLocation()
        
        // Determine return policy based on category
        const hasReturnPolicy = !category.toLowerCase().includes('syrup') && 
          !category.toLowerCase().includes('injection')
        
        return {
          medicine_name: medicineName,
          batch_no: batchNo,
          quantity,
          unit_price: unitPrice,
          expiry_date: expiryDate,
          manufacturing_date: manufacturingDate,
          supplier_name: supplierName,
          category,
          shelf_location: shelfLocation,
          has_return_policy: hasReturnPolicy
        }
      })
      .filter(record => record.medicine_name !== 'Unknown Medicine' && record.quantity > 0)
  }

  static processSalesData(rawData: RawDataRecord[]): CleanedSalesRecord[] {
    return rawData
      .filter(record => record && Object.keys(record).length > 0)
      .map((record, index) => {
        const date = this.cleanDate(
          record.date || record.sale_date || record.transaction_date || record.sold_on
        )
        
        const medicineName = this.cleanMedicineName(
          record.medicine_name || record.drug_name || record.product_name || 
          record.item_name || `Medicine ${index + 1}`
        )
        
        const quantitySold = this.cleanQuantity(
          record.quantity_sold || record.quantity || record.units_sold || record.qty || 1
        )
        
        const unitPrice = this.cleanPrice(
          record.unit_price || record.price || record.selling_price || record.amount || 25.00
        )
        
        // Infer customer type
        const customerType: 'walk-in' | 'prescription' = 
          record.customer_type === 'prescription' || 
          record.prescription_required === true ||
          record.requires_prescription === 'yes' ||
          medicineName.toLowerCase().includes('antibiotic')
            ? 'prescription' 
            : 'walk-in'
        
        return {
          date,
          medicine_name: medicineName,
          quantity_sold: quantitySold,
          unit_price: unitPrice,
          customer_type: customerType
        }
      })
      .filter(record => record.medicine_name && record.quantity_sold > 0)
  }

  // Excel Processing (for competition requirement)
  static async processExcelFile(file: File): Promise<{
    inventory: CleanedInventoryRecord[]
    sales: CleanedSalesRecord[]
    summary: {
      totalRecords: number
      cleanedRecords: number
      errorRecords: number
      categories: string[]
    }
  }> {
    try {
      // This would use a library like xlsx or papaparse in real implementation
      // For now, we'll simulate the process
      
      const text = await file.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      const rawData = lines.slice(1).map(line => {
        const values = line.split(',')
        const record: RawDataRecord = {}
        headers.forEach((header, index) => {
          record[header] = values[index]?.trim()
        })
        return record
      }).filter(record => Object.values(record).some(v => v))
      
      // Determine data type based on headers
      const hasInventoryFields = headers.some(h => 
        h.includes('stock') || h.includes('inventory') || h.includes('expiry')
      )
      
      const hasSalesFields = headers.some(h => 
        h.includes('sold') || h.includes('sale') || h.includes('customer')
      )
      
      let inventory: CleanedInventoryRecord[] = []
      let sales: CleanedSalesRecord[] = []
      
      if (hasInventoryFields) {
        inventory = this.processInventoryData(rawData)
      }
      
      if (hasSalesFields) {
        sales = this.processSalesData(rawData)
      }
      
      // If unclear, try to process as both and see what works better
      if (!hasInventoryFields && !hasSalesFields) {
        const inventoryAttempt = this.processInventoryData(rawData)
        const salesAttempt = this.processSalesData(rawData)
        
        if (inventoryAttempt.length > salesAttempt.length) {
          inventory = inventoryAttempt
        } else {
          sales = salesAttempt
        }
      }
      
      const categories = [...new Set([
        ...inventory.map(i => i.category),
        ...sales.map(s => this.inferCategory(s.medicine_name))
      ])]
      
      return {
        inventory,
        sales,
        summary: {
          totalRecords: rawData.length,
          cleanedRecords: inventory.length + sales.length,
          errorRecords: rawData.length - (inventory.length + sales.length),
          categories
        }
      }
    } catch (error) {
      console.error('Excel processing error:', error)
      throw new Error('Failed to process Excel file')
    }
  }

  // Data Quality Assessment
  static assessDataQuality(data: any[]): {
    completeness: number
    accuracy: number
    consistency: number
    recommendations: string[]
  } {
    if (data.length === 0) {
      return {
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        recommendations: ['No data to assess']
      }
    }
    
    const recommendations: string[] = []
    
    // Completeness check
    const totalFields = Object.keys(data[0]).length * data.length
    const filledFields = data.reduce((count, record) => {
      return count + Object.values(record).filter(v => v !== null && v !== undefined && v !== '').length
    }, 0)
    const completeness = (filledFields / totalFields) * 100
    
    if (completeness < 80) {
      recommendations.push('Consider data enrichment - many fields are missing')
    }
    
    // Accuracy check (basic validation)
    let accurateRecords = 0
    data.forEach(record => {
      let isAccurate = true
      
      // Check for reasonable values
      if (record.quantity && (record.quantity < 0 || record.quantity > 10000)) {
        isAccurate = false
      }
      
      if (record.unit_price && (record.unit_price < 0 || record.unit_price > 10000)) {
        isAccurate = false
      }
      
      if (isAccurate) accurateRecords++
    })
    
    const accuracy = (accurateRecords / data.length) * 100
    
    if (accuracy < 90) {
      recommendations.push('Data validation needed - some values appear incorrect')
    }
    
    // Consistency check
    const medicineNames = data.map(r => r.medicine_name).filter(Boolean)
    const uniqueNames = new Set(medicineNames.map(name => name.toLowerCase().trim()))
    const consistency = (uniqueNames.size / medicineNames.length) * 100
    
    if (consistency < 70) {
      recommendations.push('Medicine name standardization recommended')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Data quality looks good!')
    }
    
    return {
      completeness: Math.round(completeness),
      accuracy: Math.round(accuracy),
      consistency: Math.round(consistency),
      recommendations
    }
  }
}

// Export utility functions
export const cleanDataset = DatasetProcessor.processInventoryData
export const processSalesDataset = DatasetProcessor.processSalesData
export const processExcelUpload = DatasetProcessor.processExcelFile
export const assessDataQuality = DatasetProcessor.assessDataQuality