export type UserRole = 'pharmacist' | 'admin' | 'manager'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  name: string
  pharmacy_id: string
  created_at: string
  last_login: string
  is_active: boolean
}

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  pharmacyId: string
  iat: number
  exp: number
}
