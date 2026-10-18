import { useState } from 'react'
import { readStoredState } from './counter/storage.ts'
import type { CounterOperation, CounterStatus } from './counter/types.ts'
import { useCounter } from './hooks/useCounter.ts'
import { useCounterConfiguration } from './hooks/useCounterConfiguration.ts'

const VISIBLE_HISTORY_LIMIT = 10

const STATUS_LABELS: Record<CounterStatus, string> = {
  minimum: 'At minimum',
  normal: 'Normal',
  'near-limit': 'Near limit',
  maximum: 'At maximum',
}

const OPERATION_LABELS: Record<CounterOperation, string> = {
  increment: 'Increment',
  decrement: 'Decrement',
  reset: 'Reset',
  undo: 'Undo',
  'configuration-adjustment': 'Config adjustment',
}

function Counter() {
  const [storedState] = useState(readStoredState)

  const {
    configuration,
    isValid: isConfigurationValid,
    fields,
  } = useCounterConfiguration(storedState.configuration)

  const {
    count,
    status,
    progress,
    remainingIncrements,
    history,
    statistics,
    actions,
    availability,
  } = useCounter(storedState, configuration, isConfigurationValid)

  const { minimum, maximum, step } = configuration
  const visibleHistory = history.slice(0, VISIBLE_HISTORY_LIMIT)

  return (
    <div className="counter-layout">
      <section className="panel counter" data-status={status}>
        <h1 className="panel-title">Counter</h1>

        <p className="counter-value">{count}</p>

        <p className="counter-status">{STATUS_LABELS[status]}</p>

        <div className="counter-progress">
          <div
            className="counter-progress-track"
            role="progressbar"
            aria-label="Progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="counter-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="counter-progress-label">
            {Math.round(progress)}%
          </span>
        </div>

        <p className="counter-remaining">
          {remainingIncrements}{' '}
          {remainingIncrements === 1 ? 'increment' : 'increments'} remaining
        </p>

        <div className="counter-notice" aria-live="polite">
          {!isConfigurationValid && (
            <p className="counter-locked">
              Locked until the configuration is valid
            </p>
          )}
          {isConfigurationValid && status === 'minimum' && (
            <p>Minimum of {minimum} reached</p>
          )}
          {isConfigurationValid && status === 'maximum' && (
            <p>Maximum of {maximum} reached</p>
          )}
        </div>

        <div className="counter-buttons">
          <button
            type="button"
            onClick={actions.decrement}
            disabled={!availability.canDecrement}
            aria-label="Decrement"
          >
            −
          </button>
          <button
            type="button"
            onClick={actions.increment}
            disabled={!availability.canIncrement}
            aria-label="Increment"
          >
            +
          </button>
        </div>

        <div className="counter-actions">
          <button
            type="button"
            className="counter-secondary-button"
            onClick={actions.undo}
            disabled={!availability.canUndo}
          >
            Undo
          </button>
          <button
            type="button"
            className="counter-secondary-button"
            onClick={actions.reset}
            disabled={!availability.canReset}
          >
            Reset
          </button>
        </div>
      </section>

      <section className="panel configuration">
        <h2 className="panel-title">Configuration</h2>

        <div className="configuration-fields">
          {fields.map((field) => (
            <div key={field.id} className="field">
              <label htmlFor={field.id}>{field.label}</label>
              <input
                id={field.id}
                type="number"
                inputMode="numeric"
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                aria-invalid={field.error !== null}
                aria-describedby={
                  field.error !== null ? `${field.id}-error` : undefined
                }
              />
              {field.error !== null && (
                <p id={`${field.id}-error`} className="field-error">
                  {field.error}
                </p>
              )}
            </div>
          ))}
        </div>

        {!isConfigurationValid && (
          <p className="configuration-warning" role="status">
            Invalid configuration. The counter keeps using minimum {minimum},
            maximum {maximum}, and step {step} until it's fixed.
          </p>
        )}
      </section>

      <section className="panel statistics">
        <h2 className="panel-title">Statistics</h2>

        <dl className="statistics-list">
          <div className="statistic">
            <dt>Increments</dt>
            <dd>{statistics.increments}</dd>
          </div>
          <div className="statistic">
            <dt>Decrements</dt>
            <dd>{statistics.decrements}</dd>
          </div>
          <div className="statistic">
            <dt>Total changes</dt>
            <dd>{statistics.totalChanges}</dd>
          </div>
        </dl>
      </section>

      <section className="panel history">
        <div className="history-header">
          <h2 className="panel-title">History</h2>
          {history.length > VISIBLE_HISTORY_LIMIT && (
            <p className="history-summary">
              Latest {VISIBLE_HISTORY_LIMIT} of {history.length}
            </p>
          )}
        </div>

        {visibleHistory.length === 0 ? (
          <p className="history-empty">No operations yet</p>
        ) : (
          <ol className="history-list">
            {visibleHistory.map((entry) => (
              <li
                key={entry.id}
                className="history-entry"
                data-operation={entry.operation}
              >
                <span className="history-operation">
                  {OPERATION_LABELS[entry.operation]}
                </span>
                <span className="history-values">
                  {entry.previousValue} → {entry.newValue}
                </span>
                <time
                  className="history-time"
                  dateTime={new Date(entry.timestamp).toISOString()}
                >
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </time>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

export default Counter
