'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  History, 
  Camera, 
  Upload, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Package,
  Calendar,
  Hash,
  User,
  FileText
} from 'lucide-react'
import { db } from '@/lib/db'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface OCRScanSession {
  id: string
  session_id: string
  scan_type: 'camera' | 'upload' | 'manual'
  scan_status: 'processing' | 'completed' | 'failed'
  scanned_by: string
  inventory_added?: boolean
  confidence_score?: number
  error_message?: string
  created_at: string
  completed_at?: string
  final_data?: any
}

interface AuditOperation {
  id: string
  operation_id: string
  operation_type: string
  medicine_name: string
  batch_no: string
  quantity_changed: number
  shelf_location_to: string
  performed_by: string
  ocr_session_id?: string
  reason?: string
  created_at: string
}

interface OCRAuditHistoryProps {
  className?: string
}

export function OCRAuditHistory({ className }: OCRAuditHistoryProps) {
  const [sessions, setSessions] = useState<OCRScanSession[]>([])
  const [auditOps, setAuditOps] = useState<AuditOperation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<OCRScanSession | null>(null)

  const fetchAuditData = async () => {
    try {
      setLoading(true)

      // Fetch recent OCR sessions
      const { data: sessionsData, error: sessionsError } = await db
        .from('ocr_scan_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (sessionsError && !sessionsError.message.includes('does not exist')) {
        throw sessionsError
      }

      // Fetch recent audit operations
      const { data: auditData, error: auditError } = await db
        .from('audit_operations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (auditError && !auditError.message.includes('does not exist')) {
        throw auditError
      }

      const normalizedSessions: OCRScanSession[] = (sessionsData || []).map((s: any) => ({
        ...s,
        session_id: s.session_id ?? s.id,
        scan_type: (s.scan_type ?? 'upload') as OCRScanSession['scan_type'],
        scan_status: (s.scan_status ?? 'completed') as OCRScanSession['scan_status'],
        scanned_by: s.scanned_by ?? 'system',
        created_at: s.created_at ?? new Date().toISOString(),
        final_data: s.final_data ?? undefined,
      }))

      const normalizedAuditOps: AuditOperation[] = (auditData || []).map((op: any) => ({
        ...op,
        operation_id: op.operation_id ?? op.id,
        operation_type: op.operation_type ?? 'unknown',
        medicine_name: op.medicine_name ?? 'Unknown',
        batch_no: op.batch_no ?? '-',
        shelf_location_to: op.shelf_location_to ?? '-',
        performed_by: op.performed_by ?? 'system',
        created_at: op.created_at ?? new Date().toISOString(),
      }))

      setSessions(normalizedSessions)
      setAuditOps(normalizedAuditOps)
    } catch (error) {
      console.warn('Could not fetch audit data (tables may not exist):', error)
      // Continue without audit data if tables don't exist
      setSessions([])
      setAuditOps([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditData()
  }, [])

  const getScanTypeIcon = (scanType: string) => {
    switch (scanType) {
      case 'camera':
        return <Camera className="h-4 w-4" />
      case 'upload':
        return <Upload className="h-4 w-4" />
      case 'manual':
        return <Zap className="h-4 w-4" />
      default:
        return <History className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string, inventoryAdded?: boolean) => {
    if (status === 'completed' && inventoryAdded) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    } else if (status === 'failed') {
      return <XCircle className="h-4 w-4 text-red-600" />
    } else if (status === 'processing') {
      return <Clock className="h-4 w-4 text-yellow-600" />
    } else {
      return <CheckCircle2 className="h-4 w-4 text-blue-600" />
    }
  }

  const getStatusBadge = (status: string, inventoryAdded?: boolean) => {
    if (status === 'completed' && inventoryAdded) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Added to Inventory</Badge>
    } else if (status === 'failed') {
      return <Badge variant="destructive">Failed</Badge>
    } else if (status === 'processing') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Processing</Badge>
    } else {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>
    }
  }

  if (loading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>OCR Audit History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span>OCR Audit History</span>
          <Badge variant="outline" className="ml-auto">
            {sessions.length} Sessions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Camera className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No OCR sessions yet</p>
            <p className="text-xs">Start scanning to see audit history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const relatedAudit = auditOps.find(op => op.ocr_session_id === session.session_id)
              
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getScanTypeIcon(session.scan_type)}
                      {getStatusIcon(session.scan_status, session.inventory_added)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium truncate">
                          {session.scan_type.charAt(0).toUpperCase() + session.scan_type.slice(1)} Scan
                        </p>
                        {getStatusBadge(session.scan_status, session.inventory_added)}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{session.scanned_by.split('@')[0]}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(session.created_at).toLocaleString()}</span>
                        </span>
                        {session.confidence_score && (
                          <span className="flex items-center space-x-1">
                            <span>{Math.round(session.confidence_score * 100)}% confidence</span>
                          </span>
                        )}
                      </div>
                      
                      {relatedAudit && (
                        <div className="mt-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                          Added: {relatedAudit.medicine_name} ({relatedAudit.quantity_changed} units) → {relatedAudit.shelf_location_to}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSession(session)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          {getScanTypeIcon(session.scan_type)}
                          <span>OCR Session Details</span>
                        </DialogTitle>
                        <DialogDescription>
                          Session {session.session_id}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-muted-foreground">Scan Type</p>
                            <p className="capitalize">{session.scan_type}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Status</p>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(session.scan_status, session.inventory_added)}
                              <span className="capitalize">{session.scan_status}</span>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Scanned By</p>
                            <p>{session.scanned_by}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Created</p>
                            <p>{new Date(session.created_at).toLocaleString()}</p>
                          </div>
                          {session.completed_at && (
                            <div>
                              <p className="font-medium text-muted-foreground">Completed</p>
                              <p>{new Date(session.completed_at).toLocaleString()}</p>
                            </div>
                          )}
                          {session.confidence_score && (
                            <div>
                              <p className="font-medium text-muted-foreground">Confidence</p>
                              <p>{Math.round(session.confidence_score * 100)}%</p>
                            </div>
                          )}
                        </div>
                        
                        {session.final_data && (
                          <div>
                            <p className="font-medium text-muted-foreground mb-2">Extracted Data</p>
                            <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4" />
                                <span>{session.final_data.medName}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Hash className="h-4 w-4" />
                                <span>Batch: {session.final_data.batchNo}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Expires: {session.final_data.expiryDate}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4" />
                                <span>{session.final_data.quantity} units @ ₹{session.final_data.mrp}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {relatedAudit && (
                          <div>
                            <p className="font-medium text-muted-foreground mb-2">Audit Operation</p>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                              <p><strong>Operation ID:</strong> {relatedAudit.operation_id}</p>
                              <p><strong>Medicine:</strong> {relatedAudit.medicine_name}</p>
                              <p><strong>Quantity:</strong> {relatedAudit.quantity_changed} units</p>
                              <p><strong>Shelf:</strong> {relatedAudit.shelf_location_to}</p>
                              <p><strong>Reason:</strong> {relatedAudit.reason}</p>
                            </div>
                          </div>
                        )}
                        
                        {session.error_message && (
                          <div>
                            <p className="font-medium text-muted-foreground mb-2">Error Details</p>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                              {session.error_message}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}