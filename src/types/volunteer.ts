import type { Timestamp } from 'firebase/firestore'

export type VolunteerStatus = 'pending' | 'approved' | 'rejected'

export interface Volunteer {
  id: string
  name: string
  passwordHash?: string // 단방향 해시된 비밀번호
  status?: VolunteerStatus
  createdAt: Timestamp
  approvedAt?: Timestamp
  rejectedAt?: Timestamp
}
