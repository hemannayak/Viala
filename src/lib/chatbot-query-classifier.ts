/**
 * Chatbot Query Classifier
 * Standalone utility to classify user queries without circular dependencies
 */

import type { QueryType } from '@/types/chatbot'

/**
 * Classify user query into specific query types
 */
export function classifyQuery(query: string): QueryType {
  const lowerQuery = query.toLowerCase()
  
  // Red Zone Detection
  if (lowerQuery.includes('red zone') || 
      (lowerQuery.includes('expire') && lowerQuery.includes('15')) ||
      lowerQuery.includes('critical')) {
    return 'RED_ZONE_ANALYSIS'
  }
  
  // Expiry Reporting
  if (lowerQuery.includes('30 days') || 
      lowerQuery.includes('30 day') || 
      lowerQuery.includes('month') ||
      lowerQuery.includes('expire')) {
    return 'EXPIRY_REPORT'
  }
  
  // Financial Analysis (Admin only)
  if (lowerQuery.includes('revenue') || 
      lowerQuery.includes('value') || 
      lowerQuery.includes('money') ||
      lowerQuery.includes('profit') ||
      lowerQuery.includes('loss')) {
    return 'FINANCIAL_ANALYSIS'
  }
  
  // FEFO/Batch Analysis
  if (lowerQuery.includes('fefo') || 
      lowerQuery.includes('batch') || 
      lowerQuery.includes('sell first') ||
      lowerQuery.includes('priority')) {
    return 'FEFO_RECOMMENDATIONS'
  }
  
  // Low Stock Analysis
  if (lowerQuery.includes('low stock') ||
      lowerQuery.includes('reorder') ||
      lowerQuery.includes('out of stock')) {
    return 'LOW_STOCK_ANALYSIS'
  }
  
  // NGO Donation (Admin only)
  if (lowerQuery.includes('donation') ||
      lowerQuery.includes('ngo') ||
      lowerQuery.includes('rescue') ||
      lowerQuery.includes('charity')) {
    return 'DONATION_ANALYSIS'
  }
  
  // Specific Medicine Query
  if (lowerQuery.includes('ors') || 
      lowerQuery.includes('paracetamol') ||
      lowerQuery.includes('amoxicillin') ||
      lowerQuery.includes('aspirin') ||
      lowerQuery.includes('ibuprofen')) {
    return 'SPECIFIC_MEDICINE'
  }
  
  // Inventory Health
  if (lowerQuery.includes('health') ||
      lowerQuery.includes('status') ||
      lowerQuery.includes('overview')) {
    return 'INVENTORY_HEALTH'
  }
  
  // Seasonal/Demand Analysis
  if (lowerQuery.includes('demand') ||
      lowerQuery.includes('forecast') ||
      lowerQuery.includes('seasonal') ||
      lowerQuery.includes('monsoon')) {
    return 'DEMAND_ANALYSIS'
  }
  
  return 'GENERAL_QUERY'
}
