export interface AdminProfile {
  id: number
  username: string
  email: string
  isRoot: 0 | 1
  status: 0 | 1
  lastLoginTime: string | null
  lastLoginIp: string | null
  createdAt: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  expiresAt: string
  profile: AdminProfile
}
