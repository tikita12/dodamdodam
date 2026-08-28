import type { Timestamp } from 'firebase/firestore'

export interface VolunteerResponse {
  id: string              // document id: {scheduleId}_{volunteerId}
  scheduleId: string
  volunteerId: string
  volunteerName: string   // 스냅샷
  createdAt: Timestamp
}
