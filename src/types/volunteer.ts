import type { Timestamp } from 'firebase/firestore'

export type VolunteerStatus = 'pending' | 'approved' | 'rejected'

export interface Volunteer {
  id: string
  name: string
  password?: string
  status?: VolunteerStatus
  createdAt: Timestamp
  approvedAt?: Timestamp
  rejectedAt?: Timestamp
}
