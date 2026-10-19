import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from './App'

function setup() {
    const user = userEvent.setup()
    const utils = render(<App />)

    return {
        user,
        ...utils,
        incrementButton: () => screen.getByRole("button", { name: "+" }),
        decrementButton: () => screen.getByRole("button", { name: "-" })
    }
}

describe("App", () => {
    it("displays zero in initial render", () => {
        setup()

        expect(screen.getByText("0")).toBeInTheDocument();
    })

    it("increases by one when increment button is clicked", async () => {
        const { user, incrementButton } = setup()

        await user.click(incrementButton())

        expect(screen.getByText("1")).toBeInTheDocument()
    })

    it("decreases by one when decrement button is clicked", async () => {
        const { user, decrementButton } = setup()

        await user.click(decrementButton())

        expect(screen.getByText("-1")).toBeInTheDocument();
    })

    it("descreases by two when decrement button is clicked twice", async () => {
        const {user, decrementButton} = setup()
        const button = decrementButton()

        await user.click(button)
        await user.click(button)

        expect(screen.getByText("-2")).toBeInTheDocument();
    })
})