// Demo authentication service for testing
// This simulates Database auth without requiring actual Database setup

export interface DemoUser {
  id: string
  email: string
  user_metadata: {
    role: 'pharmacist' | 'admin'
  }
}

const demoUsers: Record<string, { password: string; user: DemoUser }> = {
  'pharmacist@viala.com': {
    password: 'demo123',
    user: {
      id: '1',
      email: 'pharmacist@viala.com',
      user_metadata: { role: 'pharmacist' }
    }
  },
  'admin@viala.com': {
    password: 'demo123',
    user: {
      id: '2',
      email: 'admin@viala.com',
      user_metadata: { role: 'admin' }
    }
  },
  // Add support for confirmed Database Auth users
  'admin@viala.ai': {
    password: 'demo123',
    user: {
      id: '3',
      email: 'admin@viala.ai',
      user_metadata: { role: 'admin' }
    }
  },
  'pharmacist@viala.ai': {
    password: 'demo123',
    user: {
      id: '4',
      email: 'pharmacist@viala.ai',
      user_metadata: { role: 'pharmacist' }
    }
  }
}

export class DemoAuthService {
  private currentUser: DemoUser | null = null
  private listeners: ((user: DemoUser | null) => void)[] = []

  constructor() {
    // Check for stored session
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('demo-auth-user')
      if (stored) {
        this.currentUser = JSON.parse(stored)
      }
    }
  }

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const userRecord = demoUsers[email]
    
    if (!userRecord || userRecord.password !== password) {
      return { error: { message: 'Invalid login credentials' } }
    }

    this.currentUser = userRecord.user
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo-auth-user', JSON.stringify(this.currentUser))
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(this.currentUser))

    return { error: null }
  }

  async signOut() {
    this.currentUser = null
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo-auth-user')
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(null))

    return { error: null }
  }

  getSession() {
    return Promise.resolve({
      data: {
        session: this.currentUser ? {
          user: this.currentUser
        } : null
      }
    })
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const listener = (user: DemoUser | null) => {
      callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user } : null)
    }
    
    this.listeners.push(listener)

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf(listener)
            if (index > -1) {
              this.listeners.splice(index, 1)
            }
          }
        }
      }
    }
  }

  createDemoClient() {
    return {
      auth: {
        signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
          if (email === 'admin@viala.com' && password === 'demo123') {
            return {
              data: {
                user: { id: '1', email: 'admin@viala.com', user_metadata: { role: 'admin' } },
                session: { expires_at: Math.floor(Date.now() / 1000) + 3600 } // 1 hour from now
              },
              error: null
            }
          }
          return { data: { user: null, session: null }, error: { message: 'Invalid credentials' } }
        },
        signOut: async () => {
          return { error: null }
        },
        getSession: async () => {
          return { data: { session: null }, error: null }
        },
        onAuthStateChange: () => {
          return { data: { subscription: { unsubscribe: () => {} } } }
        }
      },
      from: () => ({
        select: () => ({
          data: [],
          error: null
        })
      })
    }
  }
}

export const demoAuth = new DemoAuthService()

