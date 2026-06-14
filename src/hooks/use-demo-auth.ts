'use client'

// Demo auth hook for hackathon presentation
export function useDemoAuth() {
  return {
    user: {
      id: '1',
      email: 'admin@viala.com',
      role: 'admin' as const
    },
    role: 'admin' as const,
    loading: false,
    signIn: async (email: string, password: string) => ({ error: undefined }),
    signOut: async () => {}
  }
}

// Export as useAuth for compatibility
export const useAuth = useDemoAuth