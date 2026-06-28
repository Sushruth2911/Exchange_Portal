export type MappingConfidence = 'High' | 'Medium' | 'Low' | 'Unknown'

export interface CourseMapping {
  id: string
  homeCode: string
  homeName: string
  hostCode: string
  hostName: string
  units: number
  semester: string
}

export interface University {
  id: string
  name: string
  country: string
  city: string
  faculty: string[]
  seats: { s1: number; s2: number }
  applicationDeadline: string
  nominationDeadline: string
  languages: string[]
  tuitionFee: 'Home Tuition' | 'Host Tuition' | 'None'
  estimatedMonthlyCost: number
  currency: string
  studentDemand: 'High' | 'Medium' | 'Low'
  mappings: CourseMapping[]
  ranking: number | null
  scholarships: boolean
  housingAvailable: boolean
  website: string
  brochureUrl: string | null
  logoPlaceholder: string
  tags: string[]
}
