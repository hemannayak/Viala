// Demo Alert Simulation for Viala
// Simulates real-time inventory changes to trigger alerts

import { db } from './db'
import { toast } from 'sonner'

export interface DemoScenario {
  id: string
  name: string
  description: string
  steps: DemoStep[]
}

export interface DemoStep {
  delay: number // milliseconds
  action: 'UPDATE_STOCK' | 'UPDATE_EXPIRY' | 'TOAST_INFO'
  medName?: string
  newQuantity?: number
  newExpiryDate?: string
  message?: string
}

// Demo scenarios for showcasing alerts
export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'low-stock-demo',
    name: 'Low Stock Alert Demo',
    description: 'Simulates stock depletion to trigger low stock alerts',
    steps: [
      {
        delay: 1000,
        action: 'TOAST_INFO',
        message: 'Starting low stock simulation...'
      },
      {
        delay: 2000,
        action: 'UPDATE_STOCK',
        medName: 'Paracetamol 500mg',
        newQuantity: 15 // Below safety stock of 20
      },
      {
        delay: 3000,
        action: 'UPDATE_STOCK',
        medName: 'Ibuprofen 400mg',
        newQuantity: 8 // Very low stock
      },
      {
        delay: 4000,
        action: 'UPDATE_STOCK',
        medName: 'Amoxicillin 250mg',
        newQuantity: 0 // Stockout
      }
    ]
  },
  {
    id: 'expiry-alert-demo',
    name: 'Critical Expiry Demo',
    description: 'Updates expiry dates to trigger critical expiry alerts',
    steps: [
      {
        delay: 1000,
        action: 'TOAST_INFO',
        message: 'Starting expiry alert simulation...'
      },
      {
        delay: 2000,
        action: 'UPDATE_EXPIRY',
        medName: 'Cough Syrup 100ml',
        newExpiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 5 days from now
      },
      {
        delay: 3000,
        action: 'UPDATE_EXPIRY',
        medName: 'ORS Sachets',
        newExpiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 days from now
      }
    ]
  },
  {
    id: 'recovery-demo',
    name: 'Stock Recovery Demo',
    description: 'Simulates stock replenishment to show alert resolution',
    steps: [
      {
        delay: 1000,
        action: 'TOAST_INFO',
        message: 'Simulating stock replenishment...'
      },
      {
        delay: 2000,
        action: 'UPDATE_STOCK',
        medName: 'Paracetamol 500mg',
        newQuantity: 150 // Replenished stock
      },
      {
        delay: 3000,
        action: 'UPDATE_STOCK',
        medName: 'Ibuprofen 400mg',
        newQuantity: 85 // Replenished stock
      },
      {
        delay: 4000,
        action: 'UPDATE_STOCK',
        medName: 'Amoxicillin 250mg',
        newQuantity: 75 // Restocked
      }
    ]
  }
]

// Execute a demo scenario
export async function runDemoScenario(scenarioId: string): Promise<void> {
  const scenario = DEMO_SCENARIOS.find(s => s.id === scenarioId)
  if (!scenario) {
    toast.error('Demo scenario not found')
    return
  }

  toast.info(`Starting: ${scenario.name}`, {
    description: scenario.description,
    duration: 3000
  })

  for (const step of scenario.steps) {
    await new Promise(resolve => setTimeout(resolve, step.delay))
    
    try {
      switch (step.action) {
        case 'UPDATE_STOCK':
          if (step.medName && step.newQuantity !== undefined) {
            await updateMedicineStock(step.medName, step.newQuantity)
          }
          break
          
        case 'UPDATE_EXPIRY':
          if (step.medName && step.newExpiryDate) {
            await updateMedicineExpiry(step.medName, step.newExpiryDate)
          }
          break
          
        case 'TOAST_INFO':
          if (step.message) {
            toast.info(step.message, { duration: 2000 })
          }
          break
      }
    } catch (error) {
      console.error('Error executing demo step:', error)
      toast.error('Demo step failed', {
        description: 'Check console for details'
      })
    }
  }

  toast.success(`Demo completed: ${scenario.name}`, {
    duration: 3000
  })
}

// Update medicine stock quantity
async function updateMedicineStock(medName: string, newQuantity: number): Promise<void> {
  const { error } = await db
    .from('inventory')
    .update({ quantity: newQuantity })
    .eq('med_name', medName)

  if (error) {
    throw new Error(`Failed to update stock for ${medName}: ${error.message}`)
  }

  console.log(`Updated ${medName} stock to ${newQuantity}`)
}

// Update medicine expiry date
async function updateMedicineExpiry(medName: string, newExpiryDate: string): Promise<void> {
  const { error } = await db
    .from('inventory')
    .update({ expiry_date: newExpiryDate })
    .eq('med_name', medName)

  if (error) {
    throw new Error(`Failed to update expiry for ${medName}: ${error.message}`)
  }

  console.log(`Updated ${medName} expiry to ${newExpiryDate}`)
}

// Quick demo functions for easy testing
export const quickDemos = {
  triggerLowStock: () => runDemoScenario('low-stock-demo'),
  triggerExpiryAlerts: () => runDemoScenario('expiry-alert-demo'),
  simulateRecovery: () => runDemoScenario('recovery-demo'),
  
  // Individual quick actions
  async makeStockCritical(medName: string = 'Paracetamol 500mg') {
    await updateMedicineStock(medName, 5)
    toast.info(`Made ${medName} critically low`, { duration: 2000 })
  },
  
  async makeStockout(medName: string = 'Ibuprofen 400mg') {
    await updateMedicineStock(medName, 0)
    toast.warning(`${medName} is now out of stock`, { duration: 3000 })
  },
  
  async makeExpiringSoon(medName: string = 'Cough Syrup 100ml') {
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]
    await updateMedicineExpiry(medName, threeDaysFromNow)
    toast.warning(`${medName} now expires in 3 days`, { duration: 3000 })
  },
  
  async replenishStock(medName: string = 'Paracetamol 500mg') {
    await updateMedicineStock(medName, 120)
    toast.success(`${medName} stock replenished`, { duration: 2000 })
  }
}

// Make quick demos available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).vialaDemos = quickDemos
  console.log('Viala Demo Functions Available:')
  console.log('- vialaDemos.triggerLowStock()')
  console.log('- vialaDemos.triggerExpiryAlerts()')
  console.log('- vialaDemos.simulateRecovery()')
  console.log('- vialaDemos.makeStockCritical()')
  console.log('- vialaDemos.makeStockout()')
  console.log('- vialaDemos.makeExpiringSoon()')
  console.log('- vialaDemos.replenishStock()')
}