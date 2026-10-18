import { describe, expect, it } from 'vitest'
import { clampToRange, validateConfiguration } from './configuration.ts'

describe('validateConfiguration', () => {
  it('accepts a valid configuration', () => {
    expect(
      validateConfiguration({ minimum: '-5', maximum: '10', step: '3' }),
    ).toEqual({
      minimumError: null,
      maximumError: null,
      stepError: null,
      configuration: { minimum: -5, maximum: 10, step: 3 },
    })
  })

  it('requires every field', () => {
    const validation = validateConfiguration({
      minimum: '',
      maximum: '  ',
      step: '',
    })

    expect(validation.minimumError).toBe('Minimum is required')
    expect(validation.maximumError).toBe('Maximum is required')
    expect(validation.stepError).toBe('Step is required')
    expect(validation.configuration).toBeNull()
  })

  it('rejects values that are not whole numbers', () => {
    const validation = validateConfiguration({
      minimum: '1.5',
      maximum: 'ten',
      step: '0.5',
    })

    expect(validation.minimumError).toBe('Minimum must be a whole number')
    expect(validation.maximumError).toBe('Maximum must be a whole number')
    expect(validation.stepError).toBe('Step must be a positive whole number')
  })

  it('flags both bounds when the minimum is not below the maximum', () => {
    const validation = validateConfiguration({
      minimum: '10',
      maximum: '10',
      step: '1',
    })

    expect(validation.minimumError).toBe(
      'Minimum must be smaller than the maximum',
    )
    expect(validation.maximumError).toBe(
      'Maximum must be greater than the minimum',
    )
    expect(validation.configuration).toBeNull()
  })

  it.each(['0', '-2'])('rejects a step of %s', (step) => {
    expect(
      validateConfiguration({ minimum: '0', maximum: '10', step }).stepError,
    ).toBe('Step must be a positive whole number')
  })

  it('rejects a step larger than the range', () => {
    expect(
      validateConfiguration({ minimum: '20', maximum: '30', step: '11' })
        .stepError,
    ).toBe("Step can't exceed the range of 10")
  })

  it('does not compare the step against a range that is itself invalid', () => {
    expect(
      validateConfiguration({ minimum: '30', maximum: '20', step: '50' })
        .stepError,
    ).toBeNull()
  })
})

describe('clampToRange', () => {
  const range = { minimum: 5, maximum: 15, step: 1 }

  it.each([
    [0, 5],
    [10, 10],
    [99, 15],
  ])('clamps %i to %i', (value, expected) => {
    expect(clampToRange(value, range)).toBe(expected)
  })
})
