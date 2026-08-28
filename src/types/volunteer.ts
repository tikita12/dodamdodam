import type { Timestamp } from 'firebase/firestore'

export interface Volunteer {
  id: string
  name: string
  createdAt: Timestamp
}
