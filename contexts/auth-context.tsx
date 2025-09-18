"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, authenticateUser } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  selectedDepartment: string
  login: (email: string, password: string, departmentFilter?: string) => boolean
  logout: () => void
  hasPermission: (permission: string) => boolean
  setSelectedDepartment: (dept: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState('all')

  useEffect(() => {
    const savedUser = localStorage.getItem('civic-user')
    const savedDept = localStorage.getItem('civic-department-filter')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    if (savedDept) {
      setSelectedDepartment(savedDept)
    }
  }, [])

  const login = (email: string, password: string, departmentFilter = 'all'): boolean => {
    const authenticatedUser = authenticateUser(email, password)
    if (authenticatedUser) {
      setUser(authenticatedUser)
      setSelectedDepartment(departmentFilter)
      localStorage.setItem('civic-user', JSON.stringify(authenticatedUser))
      localStorage.setItem('civic-department-filter', departmentFilter)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setSelectedDepartment('all')
    localStorage.removeItem('civic-user')
    localStorage.removeItem('civic-department-filter')
  }

  const hasPermission = (permission: string): boolean => {
    return user?.department.permissions.includes(permission) || false
  }

  const updateSelectedDepartment = (dept: string) => {
    setSelectedDepartment(dept)
    localStorage.setItem('civic-department-filter', dept)
  }

  return (
    <AuthContext.Provider value={{ user, selectedDepartment, login, logout, hasPermission, setSelectedDepartment: updateSelectedDepartment }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}