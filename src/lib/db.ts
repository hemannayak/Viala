import type { Database } from '../types/db'

// Helper types
export type InventoryItem = Database['public']['Tables']['inventory']['Row']
export type UserRole = 'pharmacist' | 'admin'
export interface AuthUser {
  id: string
  email: string
  role: UserRole
  pharmacy_id?: string
}
export type FefoStatus = 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'MODERATE' | 'HEALTHY' | 'FRESH'
export type ReturnStatus = 'ELIGIBLE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NOT_RETURNABLE'
export type PredictiveInsight = {
  type: 'shortage_risk' | 'reorder_suggestion' | 'demand_spike'
  priority: 'high' | 'medium' | 'low'
  message: string
  affectedItems: string[]
}

// Default Seed Data
const DEFAULT_INVENTORY = [
  {
    id: "inv-1",
    med_name: 'Paracetamol 500mg',
    batch_no: 'BATCH001',
    manufacturing_date: '2024-01-15',
    expiry_date: '2025-06-30',
    quantity: 50,
    price: 25.00,
    shelf_location: 'A1',
    category: 'Pain Relief',
    is_seasonal: false,
    has_return_policy: true,
    return_policy_days: 60,
    current_stock: 50,
    created_at: new Date().toISOString()
  },
  {
    id: "inv-2",
    med_name: 'Amoxicillin 250mg',
    batch_no: 'BATCH002', 
    manufacturing_date: '2024-02-01',
    expiry_date: '2025-12-15',
    quantity: 30,
    price: 45.00,
    shelf_location: 'A2',
    category: 'Antibiotics',
    is_seasonal: false,
    has_return_policy: true,
    return_policy_days: 90,
    current_stock: 30,
    created_at: new Date().toISOString()
  },
  {
    id: "inv-3",
    med_name: 'Insulin Pens',
    batch_no: 'BATCH003',
    manufacturing_date: '2024-03-01',
    expiry_date: '2025-08-20',
    quantity: 20,
    price: 150.00,
    shelf_location: 'B1',
    category: 'Diabetes',
    is_seasonal: false,
    has_return_policy: true,
    return_policy_days: 60,
    current_stock: 20,
    created_at: new Date().toISOString()
  },
  {
    id: "inv-4",
    med_name: 'Vitamin C',
    batch_no: 'BATCH004',
    manufacturing_date: '2024-04-01',
    expiry_date: '2025-09-30',
    quantity: 75,
    price: 15.00,
    shelf_location: 'C1',
    category: 'Vitamins',
    is_seasonal: false,
    has_return_policy: true,
    return_policy_days: 30,
    current_stock: 75,
    created_at: new Date().toISOString()
  }
];

const DEFAULT_PATIENTS = [
  { id: "pat-1", patient_id: "P1001", name: "John Doe", phone: "+15550199", email: "john@example.com", created_at: new Date().toISOString() },
  { id: "pat-2", patient_id: "P1002", name: "Jane Smith", phone: "+15550200", email: "jane@example.com", created_at: new Date().toISOString() }
];

const DEFAULT_USER_PROFILES = [
  {
    id: "1",
    email: "pharmacist@viala.com",
    name: "Pharmacist User",
    role: "pharmacist",
    pharmacy_id: "pharm-1",
    is_active: true,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: "2",
    email: "admin@viala.com",
    name: "Admin User",
    role: "admin",
    pharmacy_id: "pharm-1",
    is_active: true,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: "3",
    email: "admin@viala.ai",
    name: "Admin AI User",
    role: "admin",
    pharmacy_id: "pharm-1",
    is_active: true,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: "4",
    email: "pharmacist@viala.ai",
    name: "Pharmacist AI User",
    role: "pharmacist",
    pharmacy_id: "pharm-1",
    is_active: true,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  }
];

// In-memory global store for Node.js (Server components and API routes)
// LocalStorage store for client components
function getDb(): any {
  if (typeof window === 'undefined') {
    const g = global as any;
    if (!g._viala_mock_db) {
      g._viala_mock_db = {
        inventory: [...DEFAULT_INVENTORY],
        patients: [...DEFAULT_PATIENTS],
        user_profiles: [...DEFAULT_USER_PROFILES],
        waste_logs: [],
        system_alerts: [],
        initialized: true
      };
    }
    return g._viala_mock_db;
  }

  const stored = localStorage.getItem('viala_mock_db');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse localStorage db', e);
    }
  }

  const initialDb = {
    inventory: [...DEFAULT_INVENTORY],
    patients: [...DEFAULT_PATIENTS],
    user_profiles: [...DEFAULT_USER_PROFILES],
    waste_logs: [],
    system_alerts: [],
    initialized: true
  };
  localStorage.setItem('viala_mock_db', JSON.stringify(initialDb));
  return initialDb;
}

function saveDb(dbData: any) {
  if (typeof window === 'undefined') {
    const g = global as any;
    g._viala_mock_db = dbData;
    return;
  }
  localStorage.setItem('viala_mock_db', JSON.stringify(dbData));
}

// Real-time communication registry
const realtimeListeners = new Set<{
  tableName: string;
  callback: (payload: any) => void;
}>();

function triggerRealtimeEvent(tableName: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE', newRecord: any, oldRecord?: any) {
  realtimeListeners.forEach(listener => {
    if (listener.tableName === tableName) {
      listener.callback({
        eventType,
        new: newRecord,
        old: oldRecord
      });
    }
  });
}

function evaluateOperator(itemVal: any, op: string, filterVal: string): boolean {
  if (itemVal === undefined || itemVal === null) return false;
  if (op === 'ilike') {
    const pattern = filterVal.replace(/%/g, '.*');
    const regex = new RegExp(`^${pattern}$`, 'i');
    return regex.test(String(itemVal));
  }
  if (op === 'lt') {
    return Number(itemVal) < Number(filterVal);
  }
  if (op === 'lte') {
    return Number(itemVal) <= Number(filterVal);
  }
  if (op === 'gt') {
    return Number(itemVal) > Number(filterVal);
  }
  if (op === 'gte') {
    return Number(itemVal) >= Number(filterVal);
  }
  if (op === 'eq') {
    return String(itemVal) === filterVal;
  }
  return false;
}

// Chainable mock builder
class MockQueryBuilder {
  private tableName: string;
  private filters: ((item: any) => boolean)[] = [];
  private orderColumn: string | null = null;
  private orderAscending = true;
  private limitCount: number | null = null;
  private rangeFrom: number | null = null;
  private rangeTo: number | null = null;
  private isSingle = false;
  private operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private insertData: any = null;
  private updateData: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns?: string, options?: { count?: 'exact' | 'planned' | 'estimated', head?: boolean }) {
    this.operation = 'select';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => item[column] === value);
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((item) => item[column] !== value);
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push((item) => {
      if (!item[column]) return false;
      return new Date(item[column]) < new Date(value);
    });
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push((item) => {
      if (!item[column]) return false;
      return new Date(item[column]) <= new Date(value);
    });
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push((item) => {
      if (!item[column]) return false;
      return new Date(item[column]) > new Date(value);
    });
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push((item) => {
      if (!item[column]) return false;
      return new Date(item[column]) >= new Date(value);
    });
    return this;
  }

  ilike(column: string, pattern: string) {
    const regexPattern = pattern.replace(/%/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    this.filters.push((item) => {
      const val = item[column];
      if (typeof val !== 'string') return false;
      return regex.test(val);
    });
    return this;
  }

  or(filters: string) {
    const parts = filters.split(',');
    this.filters.push((item) => {
      return parts.some(part => {
        // e.g. "batch_no.ilike.%term%" or "pattern_confidence.lt.0"
        const dotParts = part.split('.');
        if (dotParts.length >= 3) {
          const col = dotParts[0];
          const op = dotParts[1];
          const val = dotParts.slice(2).join('.');
          return evaluateOperator(item[col], op, val);
        }
        return false;
      });
    });
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push((item) => {
      const val = item[column];
      return values.includes(val);
    });
    return this;
  }

  not(column: string, operator: string, value: any) {
    if (operator === 'is' && value === null) {
      this.filters.push((item) => item[column] !== null && item[column] !== undefined);
    } else {
      this.filters.push((item) => item[column] !== value);
    }
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderColumn = column;
    this.orderAscending = options?.ascending !== false;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number) {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(values: any) {
    this.operation = 'insert';
    this.insertData = values;
    return this;
  }

  update(values: any) {
    this.operation = 'update';
    this.updateData = values;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const result = await this.execute();
      if (onfulfilled) {
        return onfulfilled(result);
      }
      return result;
    } catch (error) {
      if (onrejected) {
        return onrejected(error);
      }
      throw error;
    }
  }

  private async execute() {
    const dbData = getDb();
    let table: any[] = (dbData as any)[this.tableName] || [];

    if (this.operation === 'select') {
      let filtered = [...table];
      for (const filter of this.filters) {
        filtered = filtered.filter(filter);
      }

      if (this.orderColumn) {
        filtered.sort((a, b) => {
          const valA = a[this.orderColumn!];
          const valB = b[this.orderColumn!];
          if (valA === valB) return 0;
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;
          const cmp = valA < valB ? -1 : 1;
          return this.orderAscending ? cmp : -cmp;
        });
      }

      const count = filtered.length;

      if (this.rangeFrom !== null && this.rangeTo !== null) {
        filtered = filtered.slice(this.rangeFrom, this.rangeTo + 1);
      } else if (this.limitCount !== null) {
        filtered = filtered.slice(0, this.limitCount);
      }

      if (this.isSingle) {
        return { data: filtered[0] || null, error: null, count };
      }
      return { data: filtered, error: null, count };
    }

    if (this.operation === 'insert') {
      const dataToInsert = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
      const inserted = [];

      for (const item of dataToInsert) {
        const docId = item.id || `doc-${Math.random().toString(36).substr(2, 9)}`;
        const newRecord = {
          id: docId,
          created_at: new Date().toISOString(),
          ...item,
        };
        table.push(newRecord);
        inserted.push(newRecord);
        triggerRealtimeEvent(this.tableName, 'INSERT', newRecord);
      }

      (dbData as any)[this.tableName] = table;
      saveDb(dbData);

      if (this.isSingle || !Array.isArray(this.insertData)) {
        return { data: inserted[0], error: null };
      }
      return { data: inserted, error: null };
    }

    if (this.operation === 'update') {
      let filtered = [...table];
      for (const filter of this.filters) {
        filtered = filtered.filter(filter);
      }

      const updatedItems: any[] = [];
      for (const item of filtered) {
        const idx = table.findIndex((r) => r.id === item.id);
        const newItem = { ...item, ...this.updateData };
        if (idx !== -1) table[idx] = newItem;
        updatedItems.push(newItem);
        triggerRealtimeEvent(this.tableName, 'UPDATE', newItem, item);
      }

      (dbData as any)[this.tableName] = table;
      saveDb(dbData);

      if (this.isSingle) {
        return { data: updatedItems[0] || null, error: null };
      }
      return { data: updatedItems, error: null };
    }

    if (this.operation === 'delete') {
      let filtered = [...table];
      for (const filter of this.filters) {
        filtered = filtered.filter(filter);
      }

      const filteredIds = new Set(filtered.map((r) => r.id));
      (dbData as any)[this.tableName] = table.filter((r) => !filteredIds.has(r.id));
      saveDb(dbData);

      for (const item of filtered) {
        triggerRealtimeEvent(this.tableName, 'DELETE', null, item);
      }

      return { data: filtered, error: null };
    }

    return { data: null, error: new Error('Unsupported operation') };
  }
}


class MockChannel {
  private channelName: string;
  private tableName = '';
  private eventCallback: ((payload: any) => void) | null = null;

  constructor(channelName: string) {
    this.channelName = channelName;
  }

  on(event: string, filter: { schema?: string; table: string; event?: string }, callback: (payload: any) => void) {
    this.tableName = filter.table;
    this.eventCallback = callback;
    return this;
  }

  subscribe(statusCallback?: (status: string) => void) {
    if (this.eventCallback && this.tableName) {
      const listener = {
        tableName: this.tableName,
        callback: this.eventCallback
      };
      (this as any)._listener = listener;
      realtimeListeners.add(listener);
    }
    
    if (statusCallback) {
      setTimeout(() => statusCallback('SUBSCRIBED'), 10);
    }
    return this;
  }
}

// Exported client (Rebranded standard mock DB client)
export const db = {
  from: (tableName: string) => new MockQueryBuilder(tableName),
  channel: (channelName: string) => new MockChannel(channelName),
  removeChannel: (channel: any) => {
    if (channel && channel._listener) {
      realtimeListeners.delete(channel._listener);
    }
  },
  realtime: {
    isConnected: () => true
  },
  auth: {
    admin: {
      listUsers: async () => {
        const dbData = getDb();
        const users = dbData.user_profiles.map((u: any) => ({
          id: u.id,
          email: u.email,
          user_metadata: { role: u.role, name: u.name },
          last_sign_in_at: u.last_login || new Date().toISOString()
        }));
        return { data: { users }, error: null };
      }
    },
    signInWithPassword: async ({ email, password }: any) => {
      const dbData = getDb();
      const user = dbData.user_profiles.find((u: any) => u.email === email);
      if (user && password === 'demo123') {
        const session = {
          user: {
            id: user.id,
            email: user.email,
            user_metadata: { role: user.role }
          },
          expires_at: Math.floor(Date.now() / 1000) + 3600
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('viala_session', JSON.stringify(session));
        }
        return { data: { user: session.user, session }, error: null };
      }
      return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
    },
    signUp: async ({ email, password, options }: any) => {
      const dbData = getDb();
      const existing = dbData.user_profiles.find((u: any) => u.email === email);
      if (existing) {
        return { data: { user: null, session: null }, error: { message: 'User already exists' } };
      }
      const newUser = {
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        email,
        name: options?.data?.name || email.split('@')[0],
        role: options?.data?.role || 'pharmacist',
        pharmacy_id: options?.data?.pharmacy_id || 'pharm-1',
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
      dbData.user_profiles.push(newUser);
      saveDb(dbData);
      
      const session = {
        user: {
          id: newUser.id,
          email: newUser.email,
          user_metadata: { role: newUser.role }
        },
        expires_at: Math.floor(Date.now() / 1000) + 3600
      };
      return { data: { user: session.user, session }, error: null };
    },
    signOut: async () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('viala_session');
      }
      return { error: null };
    },
    getSession: async () => {
      if (typeof window !== 'undefined') {
        const sessionStr = localStorage.getItem('viala_session');
        if (sessionStr) {
          return { data: { session: JSON.parse(sessionStr) }, error: null };
        }
      }
      return { data: { session: null }, error: null };
    },
    onAuthStateChange: (callback: any) => {
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  }
};

export const dbML = db;

// Inventory helper functions
export async function getInventoryData(): Promise<InventoryItem[]> {
  const { data, error } = await db
    .from('inventory')
    .select('*')
    .order('expiry_date', { ascending: true })

  if (error) {
    console.error('Error fetching inventory:', error)
    throw error
  }

  return data || []
}

export function calculateFefoStatus(expiryDate: string): string {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'EXPIRED'
  if (diffDays <= 30) return 'CRITICAL'
  if (diffDays <= 90) return 'WARNING'
  if (diffDays <= 180) return 'MODERATE'
  if (diffDays <= 365) return 'HEALTHY'
  return 'FRESH'
}

export function calculateDaysToExpiry(expiryDate: string): number {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function calculateReturnPolicyStatus(item: InventoryItem): {
  canReturn: boolean
  daysLeft: number
  status: 'ELIGIBLE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NOT_RETURNABLE'
} {
  if (!item.has_return_policy || !item.return_policy_days) {
    return {
      canReturn: false,
      daysLeft: 0,
      status: 'NOT_RETURNABLE'
    }
  }

  const today = new Date()
  const expiry = new Date(item.expiry_date)
  const returnDeadline = new Date(expiry.getTime() - (item.return_policy_days * 24 * 60 * 60 * 1000))
  const daysLeft = Math.ceil((returnDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) {
    return { canReturn: false, daysLeft: 0, status: 'EXPIRED' }
  } else if (daysLeft <= 7) {
    return { canReturn: true, daysLeft, status: 'EXPIRING_SOON' }
  } else {
    return { canReturn: true, daysLeft, status: 'ELIGIBLE' }
  }
}

export function calculateEcoMetrics(inventory: InventoryItem[]) {
  const totalItems = inventory.length
  const expiredItems = inventory.filter(item => calculateFefoStatus(item.expiry_date) === 'EXPIRED').length
  const criticalItems = inventory.filter(item => calculateFefoStatus(item.expiry_date) === 'CRITICAL').length
  
  const wasteReductionScore = totalItems > 0 ? ((totalItems - expiredItems) / totalItems) * 100 : 100
  const urgentActionNeeded = criticalItems
  
  return {
    wasteReductionScore: Math.round(wasteReductionScore),
    urgentActionNeeded,
    totalItems,
    expiredItems
  }
}

export type EcoMetrics = ReturnType<typeof calculateEcoMetrics>

export function generatePredictiveInsights(
  inventory: InventoryItem[],
  scenario: string
): PredictiveInsight[] {
  const items = (inventory || []).map(item => item.med_name ?? 'Unknown')
  const uniqueItems = Array.from(new Set(items)).filter(Boolean)

  if (!scenario || scenario === 'normal') {
    return []
  }

  const lowStock = inventory
    .filter(item => (item.quantity ?? 0) <= 10)
    .slice(0, 5)
    .map(item => item.med_name ?? 'Unknown')

  const seasonal = inventory
    .filter(item => Boolean(item.is_seasonal))
    .slice(0, 5)
    .map(item => item.med_name ?? 'Unknown')

  const insights: PredictiveInsight[] = []

  if (lowStock.length > 0) {
    insights.push({
      type: 'shortage_risk',
      priority: 'high',
      message: `Scenario "${scenario}" may cause stockouts for low-stock items.`,
      affectedItems: lowStock
    })
  }

  if (uniqueItems.length > 0) {
    insights.push({
      type: 'reorder_suggestion',
      priority: lowStock.length > 0 ? 'medium' : 'low',
      message: 'Consider reordering fast-moving items to maintain safety stock.',
      affectedItems: uniqueItems.slice(0, 3)
    })
  }

  if (seasonal.length > 0) {
    insights.push({
      type: 'demand_spike',
      priority: 'medium',
      message: 'Seasonal items may see increased demand under the current scenario.',
      affectedItems: seasonal
    })
  }

  return insights
}

export function getExpiryActionLabel(
  expiryDate: string,
  isReturnable: boolean = false,
  returnDeadline?: string,
  vendorName?: string
): string {
  const daysToExpiry = calculateDaysToExpiry(expiryDate)
  
  if (daysToExpiry <= 0) {
    return isReturnable ? `Return to ${vendorName || 'Vendor'}` : 'Destroy - Expired'
  }
  
  if (isReturnable && returnDeadline) {
    const today = new Date()
    const deadline = new Date(returnDeadline)
    if (today <= deadline) {
      return `Return to ${vendorName || 'Vendor'}`
    }
  }
  
  if (daysToExpiry <= 30) {
    return 'Discount/Donate'
  }
  
  return 'Monitor'
}
