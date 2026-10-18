import {
  clampToRange,
  DEFAULT_CONFIGURATION,
  INITIAL_VALUE,
  toConfigurationDraft,
  validateConfiguration,
} from './configuration.ts'
import { COUNTER_OPERATIONS } from './types.ts'
import type {
  CounterConfiguration,
  HistoryEntry,
  StoredCounterState,
} from './types.ts'

const STORAGE_KEY = 'react-hooks-counter'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readStoredConfiguration(value: unknown): CounterConfiguration | null {
  if (
    !isRecord(value) ||
    typeof value.minimum !== 'number' ||
    typeof value.maximum !== 'number' ||
    typeof value.step !== 'number'
  ) {
    return null
  }
  const draft = toConfigurationDraft({
    minimum: value.minimum,
    maximum: value.maximum,
    step: value.step,
  })
  return validateConfiguration(draft).configuration
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    COUNTER_OPERATIONS.some((operation) => operation === value.operation) &&
    Number.isSafeInteger(value.previousValue) &&
    Number.isSafeInteger(value.newValue) &&
    typeof value.timestamp === 'number' &&
    !Number.isNaN(new Date(value.timestamp).getTime())
  )
}

export function readStoredState(): StoredCounterState {
  let storedValue: unknown
  try {
    storedValue = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch {
    storedValue = null
  }

  const storedState: Record<string, unknown> = isRecord(storedValue)
    ? storedValue
    : {}
  const restoredConfiguration =
    readStoredConfiguration(storedState.configuration) ?? DEFAULT_CONFIGURATION
  const restoredCount =
    typeof storedState.count === 'number' &&
    Number.isSafeInteger(storedState.count)
      ? storedState.count
      : INITIAL_VALUE
  const restoredHistory = Array.isArray(storedState.history)
    ? storedState.history.filter(isHistoryEntry)
    : []

  return {
    count: clampToRange(restoredCount, restoredConfiguration),
    configuration: restoredConfiguration,
    history: restoredHistory,
  }
}

export function writeStoredState(state: StoredCounterState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('Could not save the counter state', error)
  }
}
