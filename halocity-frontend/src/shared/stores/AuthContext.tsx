import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { User, AuthResponse } from '@/shared/types'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: AuthResponse }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESTORE_SESSION'; payload: { user: User; token: string } }

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone: string
  role?: 'CITIZEN' | 'MAYOR'
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'halocity_auth'

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { user: action.payload.user, token: action.payload.token, loading: false }
    case 'LOGOUT':
      return { user: null, token: null, loading: false }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'RESTORE_SESSION':
      return { user: action.payload.user, token: action.payload.token, loading: false }
    default:
      return state
  }
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const { user, token } = JSON.parse(stored)
        if (user && token) {
          dispatch({ type: 'RESTORE_SESSION', payload: { user, token } })
          return
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
    dispatch({ type: 'SET_LOADING', payload: false })
  }, [])

  const persistSession = (user: User, token: string) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }))
  }

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY)
  }

  const login = async (email: string, password: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Login failed')
    const data = json.data || json
    persistSession(data.user, data.token)
    dispatch({ type: 'LOGIN_SUCCESS', payload: data })
  }

  const register = async (data: RegisterData) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (res.status === 409) throw new Error('Email or phone already registered')
    if (!res.ok) throw new Error(json.message || 'Registration failed')
    const result = json.data || json
    persistSession(result.user, result.token)
    dispatch({ type: 'LOGIN_SUCCESS', payload: result })
  }

  const logout = () => {
    clearSession()
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
