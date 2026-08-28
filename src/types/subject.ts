import type { Timestamp } from 'firebase/firestore'

export interface Subject {
  id: string
  name: string
  createdAt: Timestamp
}
