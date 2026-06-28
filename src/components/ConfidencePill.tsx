import { type MappingConfidence } from '../types'

const styles: Record<MappingConfidence, string> = {
  High: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Low: 'bg-red-100 text-red-800',
  Unknown: 'bg-gray-100 text-gray-600',
}

export function ConfidencePill({ confidence }: { confidence: MappingConfidence }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${styles[confidence]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${confidence === 'High' ? 'bg-green-500' : confidence === 'Medium' ? 'bg-yellow-500' : confidence === 'Low' ? 'bg-red-500' : 'bg-gray-400'}`} />
      {confidence}
    </span>
  )
}
