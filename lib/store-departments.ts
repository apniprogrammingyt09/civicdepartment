import { collection, doc, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { departments } from './auth'

export async function storeDepartmentsInFirebase() {
  try {
    for (const dept of departments) {
      await setDoc(doc(db, 'departments', dept.id), {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        permissions: dept.permissions,
        createdAt: new Date().toISOString()
      })
      console.log(`Stored department: ${dept.name}`)
    }
    console.log('All departments stored successfully')
  } catch (error) {
    console.error('Error storing departments:', error)
  }
}