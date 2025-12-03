// Use different API bases for server-side vs client-side requests
export const API_BASE = typeof window === 'undefined' 
  ? (process.env.INTERNAL_API_BASE || 'http://nest-backend-after:3001')
  : (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001')

export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {})
  
  // Only set Content-Type to JSON if:
  // 1. It's not already set
  // 2. The body is NOT FormData (FormData needs browser to set multipart boundary)
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type','application/json')
  }
  
  const t = getToken()
  if (t) headers.set('Authorization', `Bearer ${t}`)
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers, cache:'no-store' })
  return res
}
