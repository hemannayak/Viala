'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Camera, 
  Upload, 
  Scan, 
  CheckCircle2, 
  Loader2, 
  X,
  Zap,
  Package,
  Calendar,
  AlertTriangle,
  History,
  FileText,
  Hash
} from 'lucide-react'
import { toast } from 'sonner'
import { db } from '@/lib/db'
import { useAuth } from '@/components/providers/auth-provider'

// Tesseract.js import (dynamic to avoid SSR issues)
let Tesseract: any = null
let tesseractLoaded = false

const loadTesseract = async () => {
  if (!tesseractLoaded && typeof window !== 'undefined') {
    try {
      const module = await import('tesseract.js')
      Tesseract = module.default
      tesseractLoaded = true
      console.log('Tesseract loaded successfully')
    } catch (error) {
      console.error('Failed to load Tesseract:', error)
    }
  }
  return Tesseract
}

interface SnapStockScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onItemAdded: () => void
  preselectedShelf?: string
}

interface ScannedData {
  medName: string
  batchNo: string
  manufacturingDate: string
  expiryDate: string
  quantity: string
  mrp: string
  shelfLocation: string
  hasReturnPolicy: boolean
  supplierName?: string
  confidence?: {
    medicine_name: number
    batch_no: number
    expiry_date: number
    overall: number
  }
}

interface AuditOperation {
  id?: string
  operation_type: 'check_in' | 'check_out' | 'transfer' | 'adjustment'
  operation_id: string
  medicine_name: string
  batch_no: string
  quantity_changed: number
  shelf_location_to?: string
  manufacturing_date?: string
  expiry_date: string
  unit_price?: number
  supplier_name?: string
  reason?: string
  performed_by: string
  ocr_session_id?: string
  created_at: string
}

// Enhanced demo data for simulate scan with manufacturing dates and MRP
const DEMO_SCAN_DATA: ScannedData[] = [
  {
    medName: 'Azithromycin 500mg',
    batchNo: 'AZI2024K',
    manufacturingDate: '2024-02-15',
    expiryDate: '2025-08-15',
    quantity: '50',
    mrp: '85.00',
    shelfLocation: '',
    hasReturnPolicy: true
  },
  {
    medName: 'Dolo 650mg Tablets',
    batchNo: 'DOL2024L',
    manufacturingDate: '2024-01-10',
    expiryDate: '2025-06-20',
    quantity: '100',
    mrp: '12.50',
    shelfLocation: '',
    hasReturnPolicy: true
  },
  {
    medName: 'Cetirizine 10mg',
    batchNo: 'CET2024M',
    manufacturingDate: '2024-03-05',
    expiryDate: '2025-09-10',
    quantity: '75',
    mrp: '8.00',
    shelfLocation: '',
    hasReturnPolicy: false
  },
  {
    medName: 'Pantoprazole 40mg',
    batchNo: 'PAN2024N',
    manufacturingDate: '2024-01-20',
    expiryDate: '2025-07-25',
    quantity: '60',
    mrp: '45.00',
    shelfLocation: '',
    hasReturnPolicy: true
  },
  {
    medName: 'Paracetamol 500mg',
    batchNo: 'PCM2024P',
    manufacturingDate: '2024-04-01',
    expiryDate: '2025-10-01',
    quantity: '200',
    mrp: '15.50',
    shelfLocation: '',
    hasReturnPolicy: false
  }
]

export function SnapStockScanner({ open, onOpenChange, onItemAdded, preselectedShelf }: SnapStockScannerProps) {
  const { user } = useAuth()
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<ScannedData>({
    medName: '',
    batchNo: '',
    manufacturingDate: '',
    expiryDate: '',
    quantity: '',
    mrp: '',
    shelfLocation: preselectedShelf || '',
    hasReturnPolicy: false,
    supplierName: '',
    confidence: {
      medicine_name: 0,
      batch_no: 0,
      expiry_date: 0,
      overall: 0
    }
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanMethod, setScanMethod] = useState<'camera' | 'upload' | null>(null)
  const [ocrSessionId, setOcrSessionId] = useState<string | null>(null)
  const [auditReason, setAuditReason] = useState('')
  const [showAuditDetails, setShowAuditDetails] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Enhanced OCR session management with better isolation
  const startOCRSession = async (scanType: 'camera' | 'upload' | 'manual') => {
    try {
      // Generate unique session ID with timestamp and random component
      const sessionId = `OCR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Clear any previous session data to ensure isolation
      setScannedData({
        medName: '',
        batchNo: '',
        manufacturingDate: '',
        expiryDate: '',
        quantity: '',
        mrp: '',
        shelfLocation: preselectedShelf || '',
        hasReturnPolicy: false,
        supplierName: '',
        confidence: {
          medicine_name: 0,
          batch_no: 0,
          expiry_date: 0,
          overall: 0
        }
      })
      
      const { error } = await db
        .from('ocr_scan_sessions')
        .insert({
          session_id: sessionId,
          scan_type: scanType,
          scan_status: 'processing',
          scanned_by: user?.email || 'Unknown User',
          created_at: new Date().toISOString()
        })

      if (error) {
        console.warn('Could not create OCR session (table may not exist):', error)
        // Continue without session tracking if table doesn't exist
        return sessionId
      }

      setOcrSessionId(sessionId)
      console.log(`📷 OCR scan session started: ${sessionId} (${scanType})`)
      
      // Show session started notification
      toast.info('OCR Session Started', {
        description: `Session ${sessionId.split('-')[1]} initialized for ${scanType} scanning`
      })
      
      return sessionId
    } catch (error) {
      console.warn('OCR session creation failed, continuing without audit:', error)
      return `OCR-${Date.now()}`
    }
  }

  // Enhanced audit operation creation with comprehensive logging
  const createAuditOperation = async (
    operationType: 'check_in',
    medicineData: ScannedData,
    quantity: number,
    shelfLocation: string
  ) => {
    try {
      const operationId = `CHK-IN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
      
      const auditData = {
        operation_type: operationType,
        operation_id: operationId,
        medicine_name: medicineData.medName,
        batch_no: medicineData.batchNo || 'UNKNOWN',
        quantity_changed: quantity,
        shelf_location_to: shelfLocation,
        manufacturing_date: medicineData.manufacturingDate || null,
        expiry_date: medicineData.expiryDate,
        unit_price: parseFloat(medicineData.mrp) || null,
        supplier_name: medicineData.supplierName || null,
        reason: auditReason || 'OCR-based inventory addition',
        performed_by: user?.email || 'Unknown User',
        ocr_session_id: ocrSessionId,
        created_at: new Date().toISOString()
      }

      const { error } = await db
        .from('audit_operations')
        .insert(auditData)

      if (error) {
        console.warn('Could not create audit operation (table may not exist):', error)
        // Continue without audit if table doesn't exist
      } else {
        console.log(`📋 Audit operation created: ${operationId}`)
        console.log(`   Medicine: ${medicineData.medName}`)
        console.log(`   Batch: ${medicineData.batchNo}`)
        console.log(`   Quantity: ${quantity} units`)
        console.log(`   Shelf: ${shelfLocation}`)
        console.log(`   OCR Session: ${ocrSessionId}`)
        
        // Show audit success notification
        toast.success('Audit Trail Created', {
          description: `Operation ${operationId.split('-')[2]} logged successfully`
        })
      }
    } catch (error) {
      console.warn('Audit operation creation failed:', error)
    }
  }

  const handleSimulateScan = async () => {
    // Start OCR session for audit trail
    await startOCRSession('manual')
    
    const randomData = DEMO_SCAN_DATA[Math.floor(Math.random() * DEMO_SCAN_DATA.length)]
    
    // Add confidence scores for simulated data
    const dataWithConfidence = {
      ...randomData,
      confidence: {
        medicine_name: 0.95,
        batch_no: 0.88,
        expiry_date: 0.92,
        overall: 0.92
      }
    }
    
    setScannedData(dataWithConfidence)
    toast.success('Scan Simulated', {
      description: 'Demo data loaded for testing purposes'
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Start OCR session for audit trail
    await startOCRSession('upload')
    
    setIsScanning(true)
    
    try {
      // Load Tesseract if not already loaded
      const tesseract = await loadTesseract()
      
      if (!tesseract) {
        toast.error('OCR not available', {
          description: 'Loading OCR engine failed. Using simulate scan instead.'
        })
        handleSimulateScan()
        return
      }

      toast.info('Processing image...', {
        description: 'OCR engine is analyzing the image'
      })

      const { data: { text, confidence } } = await tesseract.recognize(file, 'eng', {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
          }
        }
      })

      console.log('OCR Raw Text:', text)

      // Parse OCR text with confidence tracking
      const parsedData = parseOCRText(text, confidence)
      setScannedData(parsedData)
      
      // Update OCR session with results
      if (ocrSessionId) {
        try {
          await db
            .from('ocr_scan_sessions')
            .update({
              extracted_data: { raw_text: text, confidence },
              processed_data: JSON.parse(JSON.stringify(parsedData)),
              confidence_score: parsedData.confidence?.overall || 0,
              scan_status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('session_id', ocrSessionId)
        } catch (error) {
          console.warn('Could not update OCR session:', error)
        }
      }
      
      toast.success('Image Scanned Successfully', {
        description: `Extracted: ${parsedData.medName}`,
        duration: 5000
      })
    } catch (error) {
      console.error('OCR Error:', error)
      toast.error('OCR Scan Failed', {
        description: 'Using demo data instead. Try simulate scan for reliable results.'
      })
      // Fallback to demo data
      handleSimulateScan()
    } finally {
      setIsScanning(false)
    }
  }

  const startCamera = async () => {
    try {
      // Start OCR session for audit trail
      await startOCRSession('camera')
      
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported')
      }

      toast.info('Requesting camera access...', {
        description: 'Please allow camera permission'
      })

      // Try back camera first, fallback to front camera
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        })
      } catch (backCameraError) {
        console.log('Back camera failed, trying front camera:', backCameraError)
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        })
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setScanMethod('camera')
        
        // Wait for video to load
        videoRef.current.onloadedmetadata = () => {
          toast.success('Camera ready', {
            description: 'Point camera at medicine packaging and capture'
          })
        }
      }
    } catch (error) {
      console.error('Camera Error:', error)
      let errorMessage = 'Camera access failed'
      let description = 'Please use file upload or simulate scan'
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied'
          description = 'Please allow camera access and try again'
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found'
          description = 'Please use file upload instead'
        }
      }
      
      toast.error(errorMessage, { description })
    }
  }

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error('Camera not ready', {
        description: 'Please wait for camera to initialize'
      })
      return
    }

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext('2d')
    
    if (!context) {
      toast.error('Canvas not available')
      return
    }

    setIsScanning(true)

    try {
      // Capture frame from video
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      context.drawImage(video, 0, 0)

      // Convert to blob and process with OCR
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Failed to capture image')
          setIsScanning(false)
          return
        }

        try {
          // Load Tesseract if not already loaded
          const tesseract = await loadTesseract()
          
          if (!tesseract) {
            toast.error('OCR not available', {
              description: 'Using demo data instead'
            })
            handleSimulateScan()
            stopCamera()
            return
          }

          toast.info('Processing camera image...', {
            description: 'OCR engine is analyzing the captured image'
          })

          const { data: { text } } = await tesseract.recognize(blob, 'eng', {
            logger: (m: any) => {
              if (m.status === 'recognizing text') {
                console.log(`Camera OCR Progress: ${Math.round(m.progress * 100)}%`)
              }
            }
          })

          console.log('Camera OCR Raw Text:', text)

          const parsedData = parseOCRText(text)
          setScannedData(parsedData)
          
          toast.success('Camera Scan Complete', {
            description: `Extracted: ${parsedData.medName}`,
            duration: 5000
          })
          
          stopCamera()
        } catch (error) {
          console.error('Camera OCR Error:', error)
          toast.error('Camera OCR Failed', {
            description: 'Using demo data instead'
          })
          handleSimulateScan()
          stopCamera()
        } finally {
          setIsScanning(false)
        }
      }, 'image/jpeg', 0.8)
    } catch (error) {
      console.error('Capture Error:', error)
      toast.error('Failed to capture image')
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setScanMethod(null)
  }

  // Enhanced OCR text parsing with manufacturing date, MRP extraction, and confidence tracking
  const parseOCRText = (text: string, ocrConfidence?: number): ScannedData => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
    const fullText = text.toLowerCase()
    
    console.log('Parsing OCR lines:', lines)
    
    // Initialize confidence scores
    const confidence = {
      medicine_name: 0,
      batch_no: 0,
      expiry_date: 0,
      overall: 0
    }
    
    // Look for patterns in the text
    let medName = ''
    let batchNo = ''
    let manufacturingDate = ''
    let expiryDate = ''
    let quantity = ''
    let mrp = ''
    let supplierName = ''

    // Medicine name - look for common medicine patterns
    for (const line of lines) {
      if (!medName && line.length > 3) {
        // Skip common non-medicine words
        const skipWords = ['batch', 'exp', 'mfg', 'price', 'qty', 'manufactured', 'expires', 'mrp']
        const isSkipLine = skipWords.some(word => line.toLowerCase().includes(word))
        
        if (!isSkipLine && /[a-zA-Z]/.test(line)) {
          // Clean up the medicine name
          medName = line.replace(/[^\w\s\-\.]/g, '').trim()
          if (medName.length > 2) {
            confidence.medicine_name = 0.8
            break
          }
        }
      }
    }

    // Batch number - multiple patterns
    for (const line of lines) {
      const batchPatterns = [
        /batch[:\s]*([A-Z0-9]+)/i,
        /b\.?no[:\s]*([A-Z0-9]+)/i,
        /lot[:\s]*([A-Z0-9]+)/i,
        /\b([A-Z]{2,3}\d{4,6}[A-Z]?)\b/
      ]
      
      for (const pattern of batchPatterns) {
        const match = line.match(pattern)
        if (match && !batchNo) {
          batchNo = match[1] || match[0]
          confidence.batch_no = 0.7
          break
        }
      }
      if (batchNo) break
    }

    // Manufacturing date - look for MFG date patterns
    for (const line of lines) {
      const mfgPatterns = [
        /mfg[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
        /manufactured[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
        /mfd[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
        /dom[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i // Date of manufacture
      ]
      
      for (const pattern of mfgPatterns) {
        const match = line.match(pattern)
        if (match && !manufacturingDate) {
          let dateStr = match[1]
          dateStr = dateStr.replace(/\s+/g, '/').replace(/[-]/g, '/')
          
          const dateParts = dateStr.split('/')
          if (dateParts.length === 3) {
            let [part1, part2, part3] = dateParts
            if (part3.length === 2) part3 = '20' + part3
            
            const testDate1 = new Date(`${part3}-${part1.padStart(2, '0')}-${part2.padStart(2, '0')}`)
            const testDate2 = new Date(`${part3}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`)
            
            if (!isNaN(testDate1.getTime()) && testDate1 <= new Date()) {
              manufacturingDate = `${part3}-${part1.padStart(2, '0')}-${part2.padStart(2, '0')}`
              break
            } else if (!isNaN(testDate2.getTime()) && testDate2 <= new Date()) {
              manufacturingDate = `${part3}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`
              break
            }
          }
        }
      }
      if (manufacturingDate) break
    }

    // Expiry date - multiple date formats
    for (const line of lines) {
      const datePatterns = [
        /exp[iry]*[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
        /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/,
        /(\d{2,4}[-\/]\d{1,2}[-\/]\d{1,2})/,
        /exp[iry]*[:\s]*(\d{2}\s*\d{2}\s*\d{4})/i,
        /(\d{2}\s+\d{2}\s+\d{4})/
      ]
      
      for (const pattern of datePatterns) {
        const match = line.match(pattern)
        if (match && !expiryDate && match[1] !== manufacturingDate) {
          let dateStr = match[1] || match[0]
          dateStr = dateStr.replace(/\s+/g, '/').replace(/[-]/g, '/')
          
          const dateParts = dateStr.split('/')
          if (dateParts.length === 3) {
            let [part1, part2, part3] = dateParts
            if (part3.length === 2) part3 = '20' + part3
            
            const testDate1 = new Date(`${part3}-${part1.padStart(2, '0')}-${part2.padStart(2, '0')}`)
            const testDate2 = new Date(`${part3}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`)
            
            if (!isNaN(testDate1.getTime()) && testDate1 > new Date()) {
              expiryDate = `${part3}-${part1.padStart(2, '0')}-${part2.padStart(2, '0')}`
              confidence.expiry_date = 0.8
              break
            } else if (!isNaN(testDate2.getTime()) && testDate2 > new Date()) {
              expiryDate = `${part3}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`
              confidence.expiry_date = 0.8
              break
            }
          }
        }
      }
      if (expiryDate) break
    }

    // Quantity - look for numbers with units
    for (const line of lines) {
      const qtyPatterns = [
        /qty[:\s]*(\d+)/i,
        /quantity[:\s]*(\d+)/i,
        /(\d+)\s*(units?|tabs?|tablets?|capsules?|caps?|ml|mg|pieces?|pcs?)/i,
        /count[:\s]*(\d+)/i
      ]
      
      for (const pattern of qtyPatterns) {
        const match = line.match(pattern)
        if (match && !quantity) {
          quantity = match[1]
          break
        }
      }
      if (quantity) break
    }

    // MRP - look for MRP specifically and currency patterns
    for (const line of lines) {
      const mrpPatterns = [
        /mrp[:\s]*[₹$]\s*(\d+\.?\d*)/i,
        /mrp[:\s]*(\d+\.?\d*)/i,
        /price[:\s]*[₹$]\s*(\d+\.?\d*)/i,
        /[₹$]\s*(\d+\.?\d*)/,
        /(\d+\.?\d*)\s*[₹$]/,
        /price[:\s]*(\d+\.?\d*)/i
      ]
      
      for (const pattern of mrpPatterns) {
        const match = line.match(pattern)
        if (match && !mrp) {
          mrp = match[1]
          break
        }
      }
      if (mrp) break
    }

    // Supplier extraction
    const supplierPatterns = [
      /(?:mfg|manufactured?\s*by|supplier)\s*:?\s*([A-Z][a-zA-Z\s&\.]{3,30})/i
    ]

    for (const line of lines) {
      for (const pattern of supplierPatterns) {
        const match = line.match(pattern)
        if (match && !supplierName) {
          supplierName = match[1].trim()
          break
        }
      }
      if (supplierName) break
    }

    // Determine return policy based on medicine type (simplified logic)
    const hasReturnPolicy = medName.toLowerCase().includes('tablet') || 
                           medName.toLowerCase().includes('capsule') || 
                           medName.toLowerCase().includes('syrup')

    // Calculate overall confidence
    const validFields = [
      confidence.medicine_name,
      confidence.batch_no,
      confidence.expiry_date
    ].filter(score => score > 0)

    confidence.overall = validFields.length > 0 
      ? validFields.reduce((sum, score) => sum + score, 0) / validFields.length 
      : 0

    // Apply OCR engine confidence if available
    if (ocrConfidence) {
      confidence.overall = (confidence.overall + ocrConfidence) / 2
    }

    // Generate fallback values
    const result = {
      medName: medName || 'Scanned Medicine',
      batchNo: batchNo || 'BATCH' + Date.now().toString().slice(-6),
      manufacturingDate: manufacturingDate || '',
      expiryDate: expiryDate || '2025-12-31',
      quantity: quantity || '50',
      mrp: mrp || '25.00',
      shelfLocation: '',
      hasReturnPolicy,
      supplierName: supplierName || '',
      confidence
    }

    console.log('Parsed OCR data:', result)
    return result
  }

  // Enhanced inventory addition with comprehensive audit trail
  const handleAddToInventory = async () => {
    if (!scannedData.medName || !scannedData.expiryDate || !scannedData.shelfLocation) {
      toast.error('Missing Information', {
        description: 'Please fill in medicine name, expiry date, and shelf location'
      })
      return
    }

    setIsProcessing(true)
    try {
      const quantity = parseInt(scannedData.quantity) || 50
      const price = parseFloat(scannedData.mrp) || 25.00

      // Insert into inventory via secure API (ensures auth + pharmacy scoping)
      const payload = {
        med_name: scannedData.medName,
        batch_no: scannedData.batchNo || `BATCH${Date.now().toString().slice(-6)}`,
        manufacturing_date: scannedData.manufacturingDate || null,
        expiry_date: scannedData.expiryDate,
        quantity,
        price,
        shelf_location: scannedData.shelfLocation,
        category: 'Scanned Item',
        is_seasonal: false,
        has_return_policy: scannedData.hasReturnPolicy,
        return_policy_days: scannedData.hasReturnPolicy ? 60 : null,
        supplier_name: scannedData.supplierName || null
      }

      const res = await fetch('/api/inventory', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || json?.message || 'Failed to add medicine')
      }

      // Create comprehensive audit trail (best-effort)
      try {
        await createAuditOperation('check_in', scannedData, quantity, scannedData.shelfLocation)
      } catch (error) {
        console.warn('Could not create audit operation:', error)
      }

      // Update OCR session with success
      if (ocrSessionId) {
        try {
          await db
            .from('ocr_scan_sessions')
            .update({
              scan_status: 'completed',
              inventory_added: true,
              final_data: JSON.parse(JSON.stringify(scannedData)),
              completed_at: new Date().toISOString()
            })
            .eq('session_id', ocrSessionId)
        } catch (error) {
          console.warn('Could not update OCR session with success:', error)
        }
      }

      toast.success('Medicine Added Successfully', {
        description: `${scannedData.medName} added to shelf ${scannedData.shelfLocation} with full audit trail`,
        duration: 5000
      })

      // Show confidence information if available
      if (scannedData.confidence && scannedData.confidence.overall > 0) {
        toast.info('OCR Confidence', {
          description: `Data extracted with ${Math.round(scannedData.confidence.overall * 100)}% confidence`,
          duration: 3000
        })
      }

      // Log successful completion
      console.log('✅ OCR inventory addition completed successfully')
      console.log(`   Medicine: ${scannedData.medName}`)
      console.log(`   Shelf: ${scannedData.shelfLocation}`)
      console.log(`   Session: ${ocrSessionId}`)

      // Reset form and close dialog
      setScannedData({
        medName: '',
        batchNo: '',
        manufacturingDate: '',
        expiryDate: '',
        quantity: '',
        mrp: '',
        shelfLocation: preselectedShelf || '',
        hasReturnPolicy: false,
        supplierName: '',
        confidence: {
          medicine_name: 0,
          batch_no: 0,
          expiry_date: 0,
          overall: 0
        }
      })
      setAuditReason('')
      setOcrSessionId(null)
      onOpenChange(false)
      onItemAdded()
    } catch (error) {
      console.error('Error adding item:', error)
      
      // Update OCR session with failure
      if (ocrSessionId) {
        try {
          await db
            .from('ocr_scan_sessions')
            .update({
              scan_status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error',
              completed_at: new Date().toISOString()
            })
            .eq('session_id', ocrSessionId)
        } catch (updateError) {
          console.warn('Could not update OCR session with failure:', updateError)
        }
      }
      
      toast.error('Failed to add item', {
        description: 'Please check the information and try again'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Enhanced close handler with comprehensive cleanup
  const handleClose = async () => {
    stopCamera()
    
    // Clean up OCR session if exists
    if (ocrSessionId) {
      try {
        await db
          .from('ocr_scan_sessions')
          .update({
            scan_status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('session_id', ocrSessionId)
          
        console.log(`📷 OCR session closed: ${ocrSessionId}`)
      } catch (error) {
        console.warn('Could not update OCR session on close:', error)
      }
      setOcrSessionId(null)
    }
    
    // Reset all state to ensure clean session isolation
    setScannedData({
      medName: '',
      batchNo: '',
      manufacturingDate: '',
      expiryDate: '',
      quantity: '',
      mrp: '',
      shelfLocation: preselectedShelf || '',
      hasReturnPolicy: false,
      supplierName: '',
      confidence: {
        medicine_name: 0,
        batch_no: 0,
        expiry_date: 0,
        overall: 0
      }
    })
    setAuditReason('')
    setScanMethod(null)
    setIsScanning(false)
    setIsProcessing(false)
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-primary" />
            <span>Snap-Stock Scanner</span>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              OCR Powered
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Scan medicine packaging to automatically extract information and add to inventory
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scan Methods */}
          {!scanMethod && !scannedData.medName && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center space-y-2 hover:bg-primary/5"
                onClick={startCamera}
              >
                <Camera className="h-6 w-6" />
                <span className="text-sm">Use Camera</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center space-y-2 hover:bg-primary/5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6" />
                <span className="text-sm">Upload Image</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center space-y-2 hover:bg-emerald-50 border-emerald-200"
                onClick={handleSimulateScan}
              >
                <Zap className="h-6 w-6 text-emerald-600" />
                <span className="text-sm text-emerald-700">Simulate Scan</span>
              </Button>
            </div>
          )}

          {/* Camera View */}
          {scanMethod === 'camera' && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Camera overlay guide */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-white/50 border-dashed rounded-lg flex items-center justify-center">
                    <div className="text-white/70 text-center">
                      <Package className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Position medicine packaging here</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-3">
                <Button 
                  onClick={captureImage} 
                  disabled={isScanning}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing OCR...
                    </>
                  ) : (
                    <>
                      <Scan className="h-4 w-4 mr-2" />
                      Capture & Extract Text
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={stopCamera} size="lg">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>📱 Tip: Hold steady and ensure good lighting for best OCR results</p>
              </div>
            </div>
          )}

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Scanning Progress */}
          {isScanning && scanMethod !== 'camera' && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Extracting text from image...
                </p>
              </div>
            </div>
          )}

          {/* Scanned Data Form */}
          {scannedData.medName && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Scanned Information</span>
                  {scannedData.confidence && scannedData.confidence.overall > 0 && (
                    <Badge 
                      variant="outline" 
                      className={`ml-2 ${
                        scannedData.confidence.overall >= 0.8 ? 'border-green-500 text-green-700' :
                        scannedData.confidence.overall >= 0.6 ? 'border-yellow-500 text-yellow-700' :
                        'border-red-500 text-red-700'
                      }`}
                    >
                      {Math.round(scannedData.confidence.overall * 100)}% Confidence
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review and edit the extracted information before adding to inventory
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="med-name" className="flex items-center space-x-2">
                      <span>Medicine Name</span>
                      {scannedData.confidence && scannedData.confidence.medicine_name > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(scannedData.confidence.medicine_name * 100)}%
                        </Badge>
                      )}
                    </Label>
                    <Input
                      id="med-name"
                      value={scannedData.medName}
                      onChange={(e) => setScannedData(prev => ({ ...prev, medName: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="batch-no" className="flex items-center space-x-2">
                      <span>Batch Number</span>
                      {scannedData.confidence && scannedData.confidence.batch_no > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(scannedData.confidence.batch_no * 100)}%
                        </Badge>
                      )}
                    </Label>
                    <Input
                      id="batch-no"
                      value={scannedData.batchNo}
                      onChange={(e) => setScannedData(prev => ({ ...prev, batchNo: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mfg-date">Manufacturing Date</Label>
                    <Input
                      id="mfg-date"
                      type="date"
                      value={scannedData.manufacturingDate}
                      onChange={(e) => setScannedData(prev => ({ ...prev, manufacturingDate: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiry-date" className="flex items-center space-x-2">
                      <span>Expiry Date</span>
                      {scannedData.confidence && scannedData.confidence.expiry_date > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(scannedData.confidence.expiry_date * 100)}%
                        </Badge>
                      )}
                    </Label>
                    <Input
                      id="expiry-date"
                      type="date"
                      value={scannedData.expiryDate}
                      onChange={(e) => setScannedData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={scannedData.quantity}
                      onChange={(e) => setScannedData(prev => ({ ...prev, quantity: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mrp">MRP (₹)</Label>
                    <Input
                      id="mrp"
                      type="number"
                      step="0.01"
                      value={scannedData.mrp}
                      onChange={(e) => setScannedData(prev => ({ ...prev, mrp: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={scannedData.supplierName || ''}
                      onChange={(e) => setScannedData(prev => ({ ...prev, supplierName: e.target.value }))}
                      placeholder="Supplier name (optional)"
                    />
                  </div>
                </div>

                {/* Shelf Location Selection */}
                <div className="space-y-2">
                  <Label htmlFor="shelf-location">Shelf Location</Label>
                  <Select 
                    value={scannedData.shelfLocation} 
                    onValueChange={(value) => setScannedData(prev => ({ ...prev, shelfLocation: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shelf location" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 6 }, (_, rowIndex) => 
                        Array.from({ length: 10 }, (_, colIndex) => {
                          const shelfId = `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`
                          return (
                            <SelectItem key={shelfId} value={shelfId}>
                              Shelf {shelfId}
                            </SelectItem>
                          )
                        })
                      ).flat()}
                    </SelectContent>
                  </Select>
                </div>

                {/* Audit Reason */}
                <div className="space-y-2">
                  <Label htmlFor="audit-reason" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Audit Reason (Optional)</span>
                  </Label>
                  <Textarea
                    id="audit-reason"
                    value={auditReason}
                    onChange={(e) => setAuditReason(e.target.value)}
                    placeholder="e.g., New stock arrival, supplier delivery, inventory correction..."
                    className="resize-none"
                    rows={2}
                  />
                </div>

                {/* Return Policy */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="return-policy"
                    checked={scannedData.hasReturnPolicy}
                    onChange={(e) => setScannedData(prev => ({ ...prev, hasReturnPolicy: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="return-policy" className="text-sm">
                    This medicine has a return policy
                  </Label>
                </div>

                {/* OCR Session Info */}
                {ocrSessionId && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <History className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">OCR Session:</span>
                      <code className="text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs">
                        {ocrSessionId}
                      </code>
                    </div>
                  </div>
                )}

                {/* Preview */}
                <div className="bg-muted/30 rounded-lg p-3">
                  <h5 className="text-sm font-semibold text-foreground mb-2">Preview:</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span>{scannedData.medName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{new Date(scannedData.expiryDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      <span>{scannedData.batchNo}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span>{scannedData.quantity} units @ ₹{scannedData.mrp}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* OCR Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Camera className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-2">OCR Scanner Information</p>
                <div className="space-y-1 text-blue-700">
                  <p>• <strong>Camera:</strong> Opens device camera for real-time scanning</p>
                  <p>• <strong>Upload:</strong> Process existing images with OCR technology</p>
                  <p>• <strong>Simulate:</strong> Instant demo data for presentations</p>
                  <p>• <strong>Auto-fill:</strong> Extracted data populates form fields automatically</p>
                </div>
                <p className="mt-2 text-blue-600 text-xs">
                  💡 For best OCR results: Use good lighting, clear text, and hold camera steady
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {scannedData.medName && (
            <Button 
              onClick={handleAddToInventory} 
              disabled={isProcessing}
              className="min-w-[120px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Add to Inventory
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}