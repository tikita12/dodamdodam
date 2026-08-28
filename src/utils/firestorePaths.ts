export const COLLECTIONS = {
  VOLUNTEERS: 'volunteers',
  SUBJECTS: 'subjects',
  SCHEDULES: 'schedules',
  RESPONSES: 'responses',
} as const

export const getCollectionPath = {
  volunteers: () => COLLECTIONS.VOLUNTEERS,
  volunteer: (id: string) => `${COLLECTIONS.VOLUNTEERS}/${id}`,
  subjects: () => COLLECTIONS.SUBJECTS,
  subject: (id: string) => `${COLLECTIONS.SUBJECTS}/${id}`,
  schedules: () => COLLECTIONS.SCHEDULES,
  schedule: (id: string) => `${COLLECTIONS.SCHEDULES}/${id}`,
  responses: () => COLLECTIONS.RESPONSES,
  response: (scheduleId: string, volunteerId: string) =>
    `${COLLECTIONS.RESPONSES}/${scheduleId}_${volunteerId}`,
} as const
