export type Category = 'activity' | 'travel' | 'social' | 'wellness' | 'football'

export interface Attachment {
  name: string
  url: string
}

export interface CalendarEvent {
  id: string
  date: string
  time?: string
  title: string
  category: Category
  attachments?: Attachment[]
  photoQuery?: string
  coords?: [number, number]
}
