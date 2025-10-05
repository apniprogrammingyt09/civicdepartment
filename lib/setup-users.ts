import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { storeDepartmentsInFirebase } from './store-departments'

const departmentUsers = [
  {
    email: 'pwd@civic.gov',
    password: 'password123',
    name: 'Public Works Department',
    username: 'pwd_dept',
    departmentId: 'pwd',
    role: 'manager'
  },
  {
    email: 'water@civic.gov',
    password: 'password123',
    name: 'Water Supply & Sewage',
    username: 'water_dept',
    departmentId: 'water',
    role: 'officer'
  },
  {
    email: 'swm@civic.gov',
    password: 'password123',
    name: 'Solid Waste Management',
    username: 'swm_dept',
    departmentId: 'swm',
    role: 'officer'
  },
  {
    email: 'traffic@civic.gov',
    password: 'password123',
    name: 'Traffic Police / Transport Department',
    username: 'traffic_dept',
    departmentId: 'traffic',
    role: 'officer'
  },
  {
    email: 'health@civic.gov',
    password: 'password123',
    name: 'Health & Sanitation Department',
    username: 'health_dept',
    departmentId: 'health',
    role: 'manager'
  },
  {
    email: 'environment@civic.gov',
    password: 'password123',
    name: 'Environment & Parks Department',
    username: 'environment_dept',
    departmentId: 'environment',
    role: 'officer'
  },
  {
    email: 'electricity@civic.gov',
    password: 'password123',
    name: 'Electricity Department',
    username: 'electricity_dept',
    departmentId: 'electricity',
    role: 'officer'
  },
  {
    email: 'disaster@civic.gov',
    password: 'password123',
    name: 'Disaster Management / Emergency Response',
    username: 'disaster_dept',
    departmentId: 'disaster',
    role: 'manager'
  },
  {
    email: 'admin@civic.gov',
    password: 'password123',
    name: 'Administration',
    username: 'admin_dept',
    departmentId: 'admin',
    role: 'admin'
  }
]

export async function setupDepartmentUsers() {
  // Store departments first
  await storeDepartmentsInFirebase()
  
  for (const userData of departmentUsers) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password)
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        departmentId: userData.departmentId,
        role: userData.role,
        userRole: 'Department',
        profileImage: '',
        verified: true,
        postCount: 0,
        followersCount: 0,
        followingCount: 0,
        following: [],
        createdAt: new Date().toISOString()
      })
      console.log(`Created user: ${userData.email}`)
    } catch (error) {
      console.log(`User ${userData.email} may already exist`)
    }
  }
}