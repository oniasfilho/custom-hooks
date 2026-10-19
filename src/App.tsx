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
        <div className="counter-session">
          {counter}
        </div>
        <div className="counter-actions-session">
          <button
            className="counter-action-btn"
            onClick={() => handleCounterAction("subtract")}
          >
            -
          </button>
          <button
            className="counter-action-btn"
            onClick={() => handleCounterAction("add")}
            name="add"
          >
            +
          </button>
        </div>
      </section>
    </>
  )
}

export default App
