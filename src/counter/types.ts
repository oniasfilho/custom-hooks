export const COUNTER_OPERATIONS = [
  'increment',
  'decrement',
  'reset',
  'undo',
  'configuration-adjustment',
] as const

export type CounterOperation = (typeof COUNTER_OPERATIONS)[number]

export type ReversibleOperation = 'increment' | 'decrement' | 'reset'

export type CounterStatus = 'minimum' | 'normal' | 'near-limit' | 'maximum'

export interface CounterConfiguration {
  minimum: number
  maximum: number
  step: number
}

export interface ConfigurationDraft {
  minimum: string
  maximum: string
  step: string
}

export interface ConfigurationValidation {
  minimumError: string | null
  maximumError: string | null
  stepError: string | null
  configuration: CounterConfiguration | null
}

export interface HistoryEntry {
  id: string
  operation: CounterOperation
  previousValue: number
  newValue: number
  timestamp: number
}

export interface StoredCounterState {
  count: number
  configuration: CounterConfiguration
  history: HistoryEntry[]
}
