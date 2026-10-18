import type {
  ConfigurationDraft,
  ConfigurationValidation,
  CounterConfiguration,
} from './types.ts'

export const INITIAL_VALUE = 0

export const DEFAULT_CONFIGURATION: CounterConfiguration = {
  minimum: 0,
  maximum: 10,
  step: 1,
}

function parseWholeNumber(text: string): number | null {
  if (text.trim() === '') {
    return null
  }
  const value = Number(text)
  return Number.isSafeInteger(value) ? value : null
}

export function validateConfiguration(
  draft: ConfigurationDraft,
): ConfigurationValidation {
  const parsedMinimum = parseWholeNumber(draft.minimum)
  const parsedMaximum = parseWholeNumber(draft.maximum)
  const parsedStep = parseWholeNumber(draft.step)
  const parsedRange =
    parsedMinimum !== null &&
    parsedMaximum !== null &&
    parsedMinimum < parsedMaximum
      ? parsedMaximum - parsedMinimum
      : null

  let minimumError: string | null = null
  if (draft.minimum.trim() === '') {
    minimumError = 'Minimum is required'
  } else if (parsedMinimum === null) {
    minimumError = 'Minimum must be a whole number'
  } else if (parsedMaximum !== null && parsedMinimum >= parsedMaximum) {
    minimumError = 'Minimum must be smaller than the maximum'
  }

  let maximumError: string | null = null
  if (draft.maximum.trim() === '') {
    maximumError = 'Maximum is required'
  } else if (parsedMaximum === null) {
    maximumError = 'Maximum must be a whole number'
  } else if (parsedMinimum !== null && parsedMaximum <= parsedMinimum) {
    maximumError = 'Maximum must be greater than the minimum'
  }

  let stepError: string | null = null
  if (draft.step.trim() === '') {
    stepError = 'Step is required'
  } else if (parsedStep === null || parsedStep <= 0) {
    stepError = 'Step must be a positive whole number'
  } else if (parsedRange !== null && parsedStep > parsedRange) {
    stepError = `Step can't exceed the range of ${parsedRange}`
  }

  const hasErrors =
    minimumError !== null || maximumError !== null || stepError !== null
  if (
    hasErrors ||
    parsedMinimum === null ||
    parsedMaximum === null ||
    parsedStep === null
  ) {
    return { minimumError, maximumError, stepError, configuration: null }
  }

  return {
    minimumError,
    maximumError,
    stepError,
    configuration: {
      minimum: parsedMinimum,
      maximum: parsedMaximum,
      step: parsedStep,
    },
  }
}

export function toConfigurationDraft(
  configuration: CounterConfiguration,
): ConfigurationDraft {
  return {
    minimum: String(configuration.minimum),
    maximum: String(configuration.maximum),
    step: String(configuration.step),
  }
}

export function isSameConfiguration(
  first: CounterConfiguration,
  second: CounterConfiguration,
) {
  return (
    first.minimum === second.minimum &&
    first.maximum === second.maximum &&
    first.step === second.step
  )
}

export function clampToRange(value: number, range: CounterConfiguration) {
  return Math.min(Math.max(value, range.minimum), range.maximum)
}
