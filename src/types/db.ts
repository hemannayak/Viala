export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      inventory: {
        Row: {
          id: string
          created_at: string
          med_name: string | null
          batch_no: string
          manufacturing_date: string | null
          expiry_date: string
          quantity: number
          price: number
          shelf_location: string
          category: string | null
          is_seasonal: boolean
          has_return_policy: boolean | null
          return_policy_days: number | null
          drug_name: string | null
          current_stock: number | null
          aisle_location: string | null
          avg_daily_demand: number | null
          std_daily_demand: number | null
          safety_stock: number | null
          reorder_point: number | null
          vendor_id: string | null
          is_returnable: boolean | null
          batch_cost_price: number | null
          vendor_name: string | null
          return_deadline: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          med_name?: string | null
          batch_no: string
          manufacturing_date?: string | null
          expiry_date: string
          quantity: number
          price: number
          shelf_location: string
          category?: string | null
          is_seasonal?: boolean
          has_return_policy?: boolean | null
          return_policy_days?: number | null
          drug_name?: string | null
          current_stock?: number | null
          aisle_location?: string | null
          avg_daily_demand?: number | null
          std_daily_demand?: number | null
          safety_stock?: number | null
          reorder_point?: number | null
          vendor_id?: string | null
          is_returnable?: boolean | null
          batch_cost_price?: number | null
          vendor_name?: string | null
          return_deadline?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          med_name?: string | null
          batch_no?: string
          manufacturing_date?: string | null
          expiry_date?: string
          quantity?: number
          price?: number
          shelf_location?: string
          category?: string | null
          is_seasonal?: boolean
          has_return_policy?: boolean | null
          return_policy_days?: number | null
          drug_name?: string | null
          current_stock?: number | null
          aisle_location?: string | null
          avg_daily_demand?: number | null
          std_daily_demand?: number | null
          safety_stock?: number | null
          reorder_point?: number | null
          vendor_id?: string | null
          is_returnable?: boolean | null
          batch_cost_price?: number | null
          vendor_name?: string | null
          return_deadline?: string | null
        }
        Relationships: []
      }

      waste_logs: {
        Row: {
          id: string
          pharmacy_id: string
          inventory_id: string
          action_type: string
          original_quantity: number
          processed_quantity: number
          original_value: number
          recovered_value: number
          recovery_percentage: number
          co2_emissions_saved: number
          processed_by: string
          processed_at: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pharmacy_id: string
          inventory_id: string
          action_type: string
          original_quantity: number
          processed_quantity: number
          original_value: number
          recovered_value: number
          recovery_percentage: number
          co2_emissions_saved?: number
          processed_by: string
          processed_at?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pharmacy_id?: string
          inventory_id?: string
          action_type?: string
          original_quantity?: number
          processed_quantity?: number
          original_value?: number
          recovered_value?: number
          recovery_percentage?: number
          co2_emissions_saved?: number
          processed_by?: string
          processed_at?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }

      sales_transactions: {
        Row: {
          id: string
          pharmacy_id: string
          inventory_id: string
          quantity_sold: number
          unit_price: number
          total_amount: number
          sold_by: string
          transaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          pharmacy_id: string
          inventory_id: string
          quantity_sold: number
          unit_price: number
          total_amount: number
          sold_by: string
          transaction_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          pharmacy_id?: string
          inventory_id?: string
          quantity_sold?: number
          unit_price?: number
          total_amount?: number
          sold_by?: string
          transaction_type?: string
          created_at?: string
        }
        Relationships: []
      }

      ocr_scan_sessions: {
        Row: {
          id: string
          created_at: string
          session_id: string | null
          scan_type: string | null
          scan_status: string | null
          scanned_by: string | null
          inventory_added: boolean | null
          confidence_score: number | null
          error_message: string | null
          completed_at: string | null
          original_image_url: string | null
          extracted_data: Json | null
          processed_data: Json | null
          final_data: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          session_id?: string | null
          scan_type?: string | null
          scan_status?: string | null
          scanned_by?: string | null
          inventory_added?: boolean | null
          confidence_score?: number | null
          error_message?: string | null
          completed_at?: string | null
          original_image_url?: string | null
          extracted_data?: Json | null
          processed_data?: Json | null
          final_data?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          session_id?: string | null
          scan_type?: string | null
          scan_status?: string | null
          scanned_by?: string | null
          inventory_added?: boolean | null
          confidence_score?: number | null
          error_message?: string | null
          completed_at?: string | null
          original_image_url?: string | null
          extracted_data?: Json | null
          processed_data?: Json | null
          final_data?: Json | null
        }
        Relationships: []
      }

      audit_operations: {
        Row: {
          id: string
          created_at: string
          operation_id: string | null
          operation_type: string | null
          inventory_item_id: string | null
          medicine_name: string | null
          batch_no: string | null
          quantity_before: number | null
          quantity_after: number | null
          quantity_changed: number | null
          shelf_location_from: string | null
          shelf_location_to: string | null
          performed_by: string | null
          ocr_session_id: string | null
          reason: string | null
          manufacturing_date: string | null
          expiry_date: string | null
          unit_price: number | null
          supplier_name: string | null
          supplier_batch_ref: string | null
          verified_by: string | null
          verified_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          operation_id?: string | null
          operation_type?: string | null
          inventory_item_id?: string | null
          medicine_name?: string | null
          batch_no?: string | null
          quantity_before?: number | null
          quantity_after?: number | null
          quantity_changed?: number | null
          shelf_location_from?: string | null
          shelf_location_to?: string | null
          performed_by?: string | null
          ocr_session_id?: string | null
          reason?: string | null
          manufacturing_date?: string | null
          expiry_date?: string | null
          unit_price?: number | null
          supplier_name?: string | null
          supplier_batch_ref?: string | null
          verified_by?: string | null
          verified_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          operation_id?: string | null
          operation_type?: string | null
          inventory_item_id?: string | null
          medicine_name?: string | null
          batch_no?: string | null
          quantity_before?: number | null
          quantity_after?: number | null
          quantity_changed?: number | null
          shelf_location_from?: string | null
          shelf_location_to?: string | null
          performed_by?: string | null
          ocr_session_id?: string | null
          reason?: string | null
          manufacturing_date?: string | null
          expiry_date?: string | null
          unit_price?: number | null
          supplier_name?: string | null
          supplier_batch_ref?: string | null
          verified_by?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }

      system_alerts: {
        Row: {
          id: string
          created_at: string
          alert_type: string | null
          severity: string | null
          title: string | null
          message: string | null
          related_item_id: string | null
          related_medicine: string | null
          target_roles: Json | null
          trigger_conditions: Json | null
          auto_generated: boolean | null
          is_acknowledged: boolean | null
          acknowledged_by: string | null
          acknowledged_at: string | null
          is_dismissed: boolean | null
          dismissed_at: string | null
          dismissed_by: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          alert_type?: string | null
          severity?: string | null
          title?: string | null
          message?: string | null
          related_item_id?: string | null
          related_medicine?: string | null
          target_roles?: Json | null
          trigger_conditions?: Json | null
          auto_generated?: boolean | null
          is_acknowledged?: boolean | null
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          is_dismissed?: boolean | null
          dismissed_at?: string | null
          dismissed_by?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          alert_type?: string | null
          severity?: string | null
          title?: string | null
          message?: string | null
          related_item_id?: string | null
          related_medicine?: string | null
          target_roles?: Json | null
          trigger_conditions?: Json | null
          auto_generated?: boolean | null
          is_acknowledged?: boolean | null
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          is_dismissed?: boolean | null
          dismissed_at?: string | null
          dismissed_by?: string | null
          expires_at?: string | null
        }
        Relationships: []
      }

      patients: {
        Row: {
          id: string
          created_at: string
          patient_id: string | null
          name: string | null
          phone: string | null
          email: string | null
          address: string | null
          date_of_birth: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          patient_id?: string | null
          name?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          date_of_birth?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          patient_id?: string | null
          name?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          date_of_birth?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }

      patient_medicine_patterns: {
        Row: {
          id: string
          created_at: string
          patient_id: string | null
          medicine_name: string | null
          purchase_frequency: string | null
          average_quantity: number | null
          last_purchase_date: string | null
          next_predicted_purchase: string | null
          pattern_confidence: number | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string
          patient_id?: string | null
          medicine_name?: string | null
          purchase_frequency?: string | null
          average_quantity?: number | null
          last_purchase_date?: string | null
          next_predicted_purchase?: string | null
          pattern_confidence?: number | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string
          patient_id?: string | null
          medicine_name?: string | null
          purchase_frequency?: string | null
          average_quantity?: number | null
          last_purchase_date?: string | null
          next_predicted_purchase?: string | null
          pattern_confidence?: number | null
          is_active?: boolean | null
        }
        Relationships: []
      }

      stock_notifications: {
        Row: {
          id: string
          created_at: string
          patient_id: string | null
          medicine_name: string | null
          notification_type: string | null
          message: string | null
          phone: string | null
          sent_at: string | null
          delivery_status: string | null
          stock_level_at_trigger: number | null
          threshold_triggered: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          patient_id?: string | null
          medicine_name?: string | null
          notification_type?: string | null
          message?: string | null
          phone?: string | null
          sent_at?: string | null
          delivery_status?: string | null
          stock_level_at_trigger?: number | null
          threshold_triggered?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          patient_id?: string | null
          medicine_name?: string | null
          notification_type?: string | null
          message?: string | null
          phone?: string | null
          sent_at?: string | null
          delivery_status?: string | null
          stock_level_at_trigger?: number | null
          threshold_triggered?: number | null
        }
        Relationships: []
      }

      purchase_history: {
        Row: {
          id: string
          created_at: string
          patient_id: string | null
          medicine_name: string | null
          quantity: number | null
          unit_price: number | null
          total_amount: number | null
          batch_no: string | null
          purchase_date: string | null
          expiry_date: string | null
          shelf_location: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          patient_id?: string | null
          medicine_name?: string | null
          quantity?: number | null
          unit_price?: number | null
          total_amount?: number | null
          batch_no?: string | null
          purchase_date?: string | null
          expiry_date?: string | null
          shelf_location?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          patient_id?: string | null
          medicine_name?: string | null
          quantity?: number | null
          unit_price?: number | null
          total_amount?: number | null
          batch_no?: string | null
          purchase_date?: string | null
          expiry_date?: string | null
          shelf_location?: string | null
        }
        Relationships: []
      }

      system_validation_logs: {
        Row: {
          id: string
          created_at: string
          validation_type: string | null
          component_name: string | null
          validation_status: string | null
          details: Json | null
          error_message: string | null
          execution_time_ms: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          validation_type?: string | null
          component_name?: string | null
          validation_status?: string | null
          details?: Json | null
          error_message?: string | null
          execution_time_ms?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          validation_type?: string | null
          component_name?: string | null
          validation_status?: string | null
          details?: Json | null
          error_message?: string | null
          execution_time_ms?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
