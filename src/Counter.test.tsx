import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Counter from './Counter.tsx'

beforeEach(() => {
  localStorage.clear()
})

afterEach(cleanup)

function renderCounter() {
  return render(<Counter />, { wrapper: StrictMode })
}

function displayedCount() {
  return document.querySelector('.counter-value')?.textContent
}

function historyRows() {
  return screen.queryAllByRole('listitem').map((row) => {
    const operation = row.querySelector('.history-operation')?.textContent
    const values = row.querySelector('.history-values')?.textContent
    return `${operation} ${values}`
  })
}

function button(name: string) {
  return screen.getByRole<HTMLButtonElement>('button', { name })
}

function input(label: string) {
  return screen.getByLabelText<HTMLInputElement>(label)
}

function type(label: string, value: string) {
  fireEvent.change(input(label), { target: { value } })
}

describe('Counter', () => {
  it('clamps the counter and logs an adjustment when the range shrinks', () => {
    renderCounter()

    fireEvent.click(button('Increment'))
    fireEvent.click(button('Increment'))
    fireEvent.click(button('Increment'))
    type('Maximum', '2')

    expect(displayedCount()).toBe('2')
    expect(historyRows()).toEqual([
      'Config adjustment 3 → 2',
      'Increment 2 → 3',
      'Increment 1 → 2',
      'Increment 0 → 1',
    ])
    expect(button('Undo').disabled).toBe(true)
  })

  it('locks the counter while the configuration is invalid', () => {
    renderCounter()

    fireEvent.click(button('Increment'))
    type('Minimum', '20')

    for (const name of ['Increment', 'Decrement', 'Undo', 'Reset']) {
      expect(button(name).disabled).toBe(true)
    }
    expect(input('Minimum').value).toBe('20')
    expect(input('Minimum').getAttribute('aria-invalid')).toBe('true')
    expect(
      screen.queryByText('Minimum must be smaller than the maximum'),
    ).not.toBeNull()
    expect(screen.getByRole('status').textContent).toContain(
      'The counter keeps using minimum 0, maximum 10, and step 1',
    )
    expect(displayedCount()).toBe('1')
  })

  it('restores the counter after a reload without restoring undo', () => {
    const { unmount } = renderCounter()

    type('Step', '2')
    fireEvent.click(button('Increment'))
    fireEvent.click(button('Increment'))
    unmount()
    renderCounter()

    expect(displayedCount()).toBe('4')
    expect(input('Step').value).toBe('2')
    expect(historyRows()).toEqual(['Increment 2 → 4', 'Increment 0 → 2'])
    expect(button('Undo').disabled).toBe(true)
  })
})
