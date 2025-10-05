export interface Department {
  id: string
  name: string
  code: string
  permissions: string[]
}

export interface User {
  id: string
  name: string
  email: string
  department: Department
  role: 'admin' | 'manager' | 'officer'
}

export const departments: Department[] = [
  {
    id: 'pwd',
    name: 'Public Works Department',
    code: 'PWD',
    permissions: ['monitoring', 'tasks', 'reports']
  },
  {
    id: 'water',
    name: 'Water Supply & Sewage',
    code: 'WSS',
    permissions: ['monitoring', 'tasks', 'reports']
  },
  {
    id: 'swm',
    name: 'Solid Waste Management',
    code: 'SWM',
    permissions: ['monitoring', 'tasks', 'escalation', 'reports']
  },
  {
    id: 'traffic',
    name: 'Traffic Police / Transport Department',
    code: 'TRF',
    permissions: ['monitoring', 'tasks', 'reports']
  },
  {
    id: 'health',
    name: 'Health & Sanitation Department',
    code: 'HSN',
    permissions: ['monitoring', 'tasks', 'escalation', 'reports']
  },
  {
    id: 'environment',
    name: 'Environment & Parks Department',
    code: 'ENV',
    permissions: ['monitoring', 'tasks', 'reports']
  },
  {
    id: 'electricity',
    name: 'Electricity Department',
    code: 'ELC',
    permissions: ['monitoring', 'tasks', 'reports']
  },
  {
    id: 'disaster',
    name: 'Disaster Management / Emergency Response',
    code: 'DMG',
    permissions: ['monitoring', 'tasks', 'escalation', 'reports', 'gamification']
  },
  {
    id: 'admin',
    name: 'Administration',
    code: 'ADM',
    permissions: ['monitoring', 'tasks', 'escalation', 'reports', 'gamification', 'admin']
  }
]

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@water.gov',
    department: departments[0],
    role: 'manager'
  },
  {
    id: '2', 
    name: 'Jane Smith',
    email: 'jane@sanitation.gov',
    department: departments[1],
    role: 'officer'
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@civic.gov',
    department: departments[4],
    role: 'admin'
  }
]

export function authenticateUser(email: string, password: string): User | null {
  // Mock authentication - in real app, validate against backend
  const user = mockUsers.find(u => u.email === email)
  return password === 'password' ? user || null : null
}