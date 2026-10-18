import { act, cleanup, renderHook } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { CounterConfiguration } from '../counter/types.ts'
import { useCounter } from './useCounter.ts'

const DEFAULT_CONFIGURATION = { minimum: 0, maximum: 10, step: 1 }

beforeEach(() => {
  localStorage.clear()
})

afterEach(cleanup)

function renderCounter(
  count = 0,
  configuration: CounterConfiguration = DEFAULT_CONFIGURATION,
) {
  return renderHook(
    (props) =>
      useCounter(
        { count, history: [] },
        props.configuration,
        props.isConfigurationValid,
      ),
    {
      initialProps: { configuration, isConfigurationValid: true },
      wrapper: StrictMode,
    },
  )
}

function operationsOf(result: ReturnType<typeof renderCounter>['result']) {
  return result.current.history.map(
    (entry) => `${entry.operation} ${entry.previousValue}→${entry.newValue}`,
  )
}

describe('useCounter', () => {
  it('increments and decrements by the configured step', () => {
    const { result } = renderCounter(0, { minimum: 0, maximum: 10, step: 3 })

    act(() => result.current.actions.increment())
    act(() => result.current.actions.increment())
    act(() => result.current.actions.decrement())

    expect(result.current.count).toBe(3)
    expect(operationsOf(result)).toEqual([
      'decrement 6→3',
      'increment 3→6',
      'increment 0→3',
    ])
  })

  it('blocks a step that would pass a boundary instead of applying part of it', () => {
    const { result } = renderCounter(9, { minimum: 0, maximum: 10, step: 3 })

    expect(result.current.availability.canIncrement).toBe(false)
    expect(result.current.remainingIncrements).toBe(0)

    act(() => result.current.actions.increment())

    expect(result.current.count).toBe(9)
    expect(result.current.history).toEqual([])
  })

  it.each([
    [20, 'minimum', 0],
    [24, 'normal', 40],
    [28, 'near-limit', 80],
    [30, 'maximum', 100],
  ])(
    'reports a count of %i as %s at %i%% progress',
    (count, status, progress) => {
      const { result } = renderCounter(count, {
        minimum: 20,
        maximum: 30,
        step: 2,
      })

      expect(result.current.status).toBe(status)
      expect(result.current.progress).toBe(progress)
    },
  )

  it('disables decrement at the minimum and increment at the maximum', () => {
    const atMinimum = renderCounter(0)
    const atMaximum = renderCounter(10)

    expect(atMinimum.result.current.availability.canDecrement).toBe(false)
    expect(atMaximum.result.current.availability.canIncrement).toBe(false)
  })

  it('resets to the initial value clamped to the range', () => {
    const { result } = renderCounter(12, { minimum: 5, maximum: 15, step: 1 })

    act(() => result.current.actions.reset())

    expect(result.current.count).toBe(5)
    expect(result.current.availability.canReset).toBe(false)
  })

  it('undoes operations in reverse order and logs undo without counting it', () => {
    const { result } = renderCounter()

    act(() => result.current.actions.increment())
    act(() => result.current.actions.increment())
    act(() => result.current.actions.reset())
    act(() => result.current.actions.undo())

    expect(result.current.count).toBe(2)
    expect(operationsOf(result)[0]).toBe('undo 0→2')
    expect(result.current.statistics).toEqual({
      increments: 2,
      decrements: 0,
      totalChanges: 3,
    })

    act(() => result.current.actions.undo())
    act(() => result.current.actions.undo())

    expect(result.current.count).toBe(0)
    expect(result.current.availability.canUndo).toBe(false)
  })

  it('locks every action while the configuration draft is invalid', () => {
    const { result, rerender } = renderCounter(5)

    rerender({
      configuration: DEFAULT_CONFIGURATION,
      isConfigurationValid: false,
    })
    act(() => result.current.actions.increment())

    expect(result.current.availability).toEqual({
      canIncrement: false,
      canDecrement: false,
      canReset: false,
      canUndo: false,
    })
    expect(result.current.count).toBe(5)
  })

  it('clamps the count once when the configuration excludes it', () => {
    const { result, rerender } = renderCounter(7)

    act(() => result.current.actions.increment())
    rerender({
      configuration: { minimum: 0, maximum: 5, step: 1 },
      isConfigurationValid: true,
    })

    expect(result.current.count).toBe(5)
    expect(operationsOf(result)).toEqual([
      'configuration-adjustment 8→5',
      'increment 7→8',
    ])
    expect(result.current.availability.canUndo).toBe(false)
    expect(result.current.statistics.totalChanges).toBe(1)
  })

  it('clears undo without logging anything when the count still fits', () => {
    const { result, rerender } = renderCounter(2)

    act(() => result.current.actions.increment())
    rerender({
      configuration: { minimum: 0, maximum: 10, step: 2 },
      isConfigurationValid: true,
    })

    expect(result.current.count).toBe(3)
    expect(operationsOf(result)).toEqual(['increment 2→3'])
    expect(result.current.availability.canUndo).toBe(false)
  })

  it('persists the count, configuration, and history', () => {
    const { result } = renderCounter()

    act(() => result.current.actions.increment())

    expect(
      JSON.parse(localStorage.getItem('react-hooks-counter') ?? 'null'),
    ).toEqual({
      count: 1,
      configuration: DEFAULT_CONFIGURATION,
      history: result.current.history,
    })
  })
})
