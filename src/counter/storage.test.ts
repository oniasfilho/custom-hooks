import { beforeEach, describe, expect, it } from 'vitest'
import { readStoredState, writeStoredState } from './storage.ts'

const STORAGE_KEY = 'react-hooks-counter'

const DEFAULT_STATE = {
  count: 0,
  configuration: { minimum: 0, maximum: 10, step: 1 },
  history: [],
}

const SAVED_ENTRY = {
  id: '1700000000000-abc',
  operation: 'increment',
  previousValue: 2,
  newValue: 4,
  timestamp: 1700000000000,
}

beforeEach(() => {
  localStorage.clear()
})

describe('readStoredState', () => {
  it('uses the defaults when nothing is stored', () => {
    expect(readStoredState()).toEqual(DEFAULT_STATE)
  })

  it('uses the defaults when the stored data is not valid JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')

    expect(readStoredState()).toEqual(DEFAULT_STATE)
  })

  it('restores data saved under the existing storage key', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        count: 4,
        configuration: { minimum: 0, maximum: 10, step: 2 },
        history: [SAVED_ENTRY],
      }),
    )

    expect(readStoredState()).toEqual({
      count: 4,
      configuration: { minimum: 0, maximum: 10, step: 2 },
      history: [SAVED_ENTRY],
    })
  })

  it('replaces each invalid part independently', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        count: 'seven',
        configuration: { minimum: 5, maximum: 2, step: 1 },
        history: [
          SAVED_ENTRY,
          { ...SAVED_ENTRY, id: 'unknown', operation: 'toString' },
          { ...SAVED_ENTRY, id: 'bad-date', timestamp: 1e20 },
          null,
          42,
        ],
      }),
    )

    expect(readStoredState()).toEqual({
      ...DEFAULT_STATE,
      history: [SAVED_ENTRY],
    })
  })

  it('clamps the restored count to the restored configuration', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        count: 99,
        configuration: { minimum: -5, maximum: 15, step: 5 },
        history: 'not a list',
      }),
    )

    expect(readStoredState()).toEqual({
      count: 15,
      configuration: { minimum: -5, maximum: 15, step: 5 },
      history: [],
    })
  })
})

describe('writeStoredState', () => {
  it('writes a state that readStoredState restores', () => {
    const state = {
      count: 6,
      configuration: { minimum: 0, maximum: 20, step: 3 },
      history: [{ ...SAVED_ENTRY, operation: 'reset' as const }],
    }

    writeStoredState(state)

    expect(readStoredState()).toEqual(state)
  })
})
