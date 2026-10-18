import { useEffect, useState } from 'react'
import {
  clampToRange,
  INITIAL_VALUE,
  isSameConfiguration,
} from '../counter/configuration.ts'
import { writeStoredState } from '../counter/storage.ts'
import type {
  CounterConfiguration,
  CounterOperation,
  CounterStatus,
  HistoryEntry,
  ReversibleOperation,
} from '../counter/types.ts'

const NEAR_LIMIT_PROGRESS = 80

interface InitialCounterState {
  count: number
  history: HistoryEntry[]
}

function createHistoryEntry(
  operation: CounterOperation,
  previousValue: number,
  newValue: number,
): HistoryEntry {
  const timestamp = Date.now()
  return {
    id: `${timestamp}-${Math.random().toString(36).slice(2, 10)}`,
    operation,
    previousValue,
    newValue,
    timestamp,
  }
}

export function useCounter(
  initialState: InitialCounterState,
  configuration: CounterConfiguration,
  isConfigurationValid: boolean,
) {
  const [count, setCount] = useState(initialState.count)
  const [history, setHistory] = useState(initialState.history)
  const [undoStack, setUndoStack] = useState<number[]>([])
  const [previousConfiguration, setPreviousConfiguration] =
    useState(configuration)

  if (!isSameConfiguration(configuration, previousConfiguration)) {
    const adjustedCount = clampToRange(count, configuration)
    setPreviousConfiguration(configuration)
    setUndoStack([])
    if (adjustedCount !== count) {
      setCount(adjustedCount)
      setHistory([
        createHistoryEntry('configuration-adjustment', count, adjustedCount),
        ...history,
      ])
    }
  }

  useEffect(() => {
    writeStoredState({ count, configuration, history })
  }, [count, configuration, history])

  const { minimum, maximum, step } = configuration
  const resetValue = clampToRange(INITIAL_VALUE, configuration)
  const undoValue = undoStack.at(-1)

  const canIncrement = isConfigurationValid && count + step <= maximum
  const canDecrement = isConfigurationValid && count - step >= minimum
  const canReset = isConfigurationValid && count !== resetValue
  const canUndo =
    isConfigurationValid &&
    undoValue !== undefined &&
    undoValue >= minimum &&
    undoValue <= maximum

  const remainingIncrements = Math.floor((maximum - count) / step)
  const progress = ((count - minimum) / (maximum - minimum)) * 100

  let status: CounterStatus
  if (count === minimum) {
    status = 'minimum'
  } else if (count === maximum) {
    status = 'maximum'
  } else if (progress >= NEAR_LIMIT_PROGRESS) {
    status = 'near-limit'
  } else {
    status = 'normal'
  }

  const increments = history.filter(
    (entry) => entry.operation === 'increment',
  ).length
  const decrements = history.filter(
    (entry) => entry.operation === 'decrement',
  ).length
  const resets = history.filter((entry) => entry.operation === 'reset').length

  function recordCounterChange(
    operation: ReversibleOperation,
    nextCount: number,
  ) {
    if (nextCount === count) {
      return
    }
    const entry = createHistoryEntry(operation, count, nextCount)
    setCount(nextCount)
    setHistory((previousHistory) => [entry, ...previousHistory])
    setUndoStack((previousUndoStack) => [...previousUndoStack, count])
  }

  function increment() {
    if (!canIncrement) {
      return
    }
    recordCounterChange('increment', count + step)
  }

  function decrement() {
    if (!canDecrement) {
      return
    }
    recordCounterChange('decrement', count - step)
  }

  function reset() {
    if (!canReset) {
      return
    }
    recordCounterChange('reset', resetValue)
  }

  function undo() {
    if (!canUndo) {
      return
    }
    const entry = createHistoryEntry('undo', count, undoValue)
    setCount(undoValue)
    setHistory((previousHistory) => [entry, ...previousHistory])
    setUndoStack((previousUndoStack) => previousUndoStack.slice(0, -1))
  }

  return {
    count,
    status,
    progress,
    remainingIncrements,
    history,
    statistics: {
      increments,
      decrements,
      totalChanges: increments + decrements + resets,
    },
    actions: { increment, decrement, reset, undo },
    availability: { canIncrement, canDecrement, canReset, canUndo },
  }
}
