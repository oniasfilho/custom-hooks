import { useState } from 'react'
import {
  isSameConfiguration,
  toConfigurationDraft,
  validateConfiguration,
} from '../counter/configuration.ts'
import type {
  ConfigurationDraft,
  CounterConfiguration,
} from '../counter/types.ts'

export interface ConfigurationField {
  id: string
  label: string
  value: string
  error: string | null
  onChange: (value: string) => void
}

export function useCounterConfiguration(
  initialConfiguration: CounterConfiguration,
) {
  const [configuration, setConfiguration] = useState(initialConfiguration)
  const [draft, setDraft] = useState(() =>
    toConfigurationDraft(initialConfiguration),
  )

  const validation = validateConfiguration(draft)

  function changeField(name: keyof ConfigurationDraft, value: string) {
    const nextDraft: ConfigurationDraft = { ...draft, [name]: value }
    setDraft(nextDraft)

    const nextConfiguration = validateConfiguration(nextDraft).configuration
    if (
      nextConfiguration !== null &&
      !isSameConfiguration(nextConfiguration, configuration)
    ) {
      setConfiguration(nextConfiguration)
    }
  }

  const fields: ConfigurationField[] = [
    {
      id: 'counter-minimum',
      label: 'Minimum',
      value: draft.minimum,
      error: validation.minimumError,
      onChange: (value) => changeField('minimum', value),
    },
    {
      id: 'counter-maximum',
      label: 'Maximum',
      value: draft.maximum,
      error: validation.maximumError,
      onChange: (value) => changeField('maximum', value),
    },
    {
      id: 'counter-step',
      label: 'Step',
      value: draft.step,
      error: validation.stepError,
      onChange: (value) => changeField('step', value),
    },
  ]

  return {
    configuration,
    isValid: validation.configuration !== null,
    fields,
  }
}
