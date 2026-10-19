import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from './App'

function setup() {
    const user = userEvent.setup()
    const utils = render(<App />)

    return {
        user,
        ...utils,
        incrementButton: () => screen.getByRole("button", { name: "Increment" }),
        decrementButton: () => screen.getByRole("button", { name: "Decrement" }),
    }
}

describe("App", () => {
    it("displays zero in initial render", () => {
        setup()

        expect(screen.getByRole("status")).toHaveTextContent("0")
    })

    it("increases by one when increment button is clicked", async () => {
        const { user, incrementButton } = setup()

        await user.click(incrementButton())

        expect(screen.getByRole("status")).toHaveTextContent("1")
    })

    it("decreases by one when decrement button is clicked", async () => {
        const { user, decrementButton } = setup()

        await user.click(decrementButton())

        expect(screen.getByRole("status")).toHaveTextContent("-1")
    })

    it("descreases by two when decrement button is clicked twice", async () => {
        const { user, decrementButton } = setup()
        const button = decrementButton()

        await user.click(button)
        await user.click(button)

        expect(screen.getByRole("status")).toHaveTextContent("-2")
    })
})