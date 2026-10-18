import { act, cleanup, renderHook } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { useCounterConfiguration } from './useCounterConfiguration.ts'

const INITIAL_CONFIGURATION = { minimum: 0, maximum: 10, step: 1 }

afterEach(cleanup)

function renderConfiguration() {
  return renderHook(() => useCounterConfiguration(INITIAL_CONFIGURATION), {
    wrapper: StrictMode,
  })
}

function getField(
  result: ReturnType<typeof renderConfiguration>['result'],
  label: string,
) {
  const field = result.current.fields.find((item) => item.label === label)
  if (field === undefined) {
    throw new Error(`No field labelled ${label}`)
  }
  return field
}

describe('useCounterConfiguration', () => {
  it('exposes one valid field per configuration value', () => {
    const { result } = renderConfiguration()

    expect(result.current.isValid).toBe(true)
    expect(result.current.configuration).toEqual(INITIAL_CONFIGURATION)
    expect(
      result.current.fields.map(({ id, label, value, error }) => ({
        id,
        label,
        value,
        error,
      })),
    ).toEqual([
      { id: 'counter-minimum', label: 'Minimum', value: '0', error: null },
      { id: 'counter-maximum', label: 'Maximum', value: '10', error: null },
      { id: 'counter-step', label: 'Step', value: '1', error: null },
    ])
  })

  it('applies a valid edit immediately', () => {
    const { result } = renderConfiguration()

    act(() => getField(result, 'Maximum').onChange('20'))

    expect(result.current.configuration).toEqual({
      minimum: 0,
      maximum: 20,
      step: 1,
    })
  })

  it('keeps an invalid draft editable while the last valid configuration stays applied', () => {
    const { result } = renderConfiguration()

    act(() => getField(result, 'Minimum').onChange('30'))

    expect(result.current.isValid).toBe(false)
    expect(getField(result, 'Minimum').value).toBe('30')
    expect(getField(result, 'Minimum').error).toBe(
      'Minimum must be smaller than the maximum',
    )
    expect(getField(result, 'Maximum').error).toBe(
      'Maximum must be greater than the minimum',
    )
    expect(result.current.configuration).toEqual(INITIAL_CONFIGURATION)
  })

  it('lets a field be cleared without losing the other values', () => {
    const { result } = renderConfiguration()

    act(() => getField(result, 'Step').onChange(''))

    expect(getField(result, 'Step').value).toBe('')
    expect(getField(result, 'Step').error).toBe('Step is required')
    expect(getField(result, 'Maximum').value).toBe('10')
    expect(result.current.configuration).toEqual(INITIAL_CONFIGURATION)
  })

  it('applies the draft once another field makes it valid', () => {
    const { result } = renderConfiguration()

    act(() => getField(result, 'Minimum').onChange('30'))
    act(() => getField(result, 'Maximum').onChange('40'))

    expect(result.current.isValid).toBe(true)
    expect(result.current.configuration).toEqual({
      minimum: 30,
      maximum: 40,
      step: 1,
    })
  })
})
