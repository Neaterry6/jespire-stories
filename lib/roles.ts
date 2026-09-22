export const ROLE_BY_EMAIL = {
  'akewusholaabdulbakri101@gmail.com': 'owner',
  'jennypandy49@gmail.com': 'admin',
} as const

export type JespireRole = 'owner' | 'admin' | 'user'

export function getJespireRole(email?: string | null): JespireRole {
  const normalized = (email || '').trim().toLowerCase()
  return ROLE_BY_EMAIL[normalized as keyof typeof ROLE_BY_EMAIL] || 'user'
}

export function isStaffEmail(email?: string | null) {
  return getJespireRole(email) !== 'user'
}

export const STAFF_EMAILS = Object.keys(ROLE_BY_EMAIL)
