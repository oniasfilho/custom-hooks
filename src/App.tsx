import { useState } from 'react'
import './App.css'

type CounterAction = "add" | "subtract"

function App() {
  const [counter, setCounter] = useState(0);

  const add = () => {
    setCounter(value => value + 1)
  }

  const subtract = () => {
    setCounter(value => value - 1)
  }

  const handleCounterAction = (action: CounterAction) => {
    switch (action) {
      case "add":
        add()
        break
      case "subtract":
        subtract()
        break
    }
  }

  return (
    <>
      <section className="counter-wrapper">
        <output
          className="counter-session"
          aria-live="polite"
          aria-label="Counter value">
          {counter}
        </output>
        <div className="counter-actions-session">
          <button
            type="button"
            className="counter-action-btn"
            onClick={() => handleCounterAction("subtract")}
            aria-label="Decrement"
          >
            -
          </button>
          <button
            type="button"
            className="counter-action-btn"
            onClick={() => handleCounterAction("add")}
            name="add"
            aria-label="Increment"
          >
            +
          </button>
        </div>
      </section>
    </>
  )
}

export default App
