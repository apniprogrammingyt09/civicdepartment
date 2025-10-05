"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { User, departments } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  selectedDepartment: string
  loading: boolean
  login: (email: string, password: string, departmentFilter?: string) => Promise<boolean>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
  setSelectedDepartment: (dept: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedDept = localStorage.getItem('civic-department-filter')
    if (savedDept) {
      setSelectedDepartment(savedDept)
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const department = departments.find(d => d.id === userData.departmentId) || departments[0]
            const newUser = {
              id: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              department,
              role: userData.role || 'officer'
            }
            setUser(newUser)
            // Set department filter to user's department only (not 'all')
            if (userData.role !== 'admin') {
              setSelectedDepartment(userData.departmentId)
              localStorage.setItem('civic-department-filter', userData.departmentId)
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          // Don't set user to null on error, keep existing user state
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string, departmentFilter = 'all'): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        // Non-admin users can only see their own department
        const finalFilter = userData.role === 'admin' ? departmentFilter : userData.departmentId
        setSelectedDepartment(finalFilter)
        localStorage.setItem('civic-department-filter', finalFilter)
      }
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setSelectedDepartment('all')
      localStorage.removeItem('civic-department-filter')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const hasPermission = (permission: string): boolean => {
    return user?.department.permissions.includes(permission) || false
  }

  const updateSelectedDepartment = (dept: string) => {
    setSelectedDepartment(dept)
    localStorage.setItem('civic-department-filter', dept)
  }

  return (
    <AuthContext.Provider value={{ user, selectedDepartment, loading, login, logout, hasPermission, setSelectedDepartment: updateSelectedDepartment }}>
      {!loading && children}
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