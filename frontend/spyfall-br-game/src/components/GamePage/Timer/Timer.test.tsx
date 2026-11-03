import { render } from '@testing-library/react'
import Timer from './index'

test('Timer formata segundos como MM:SS com zero à esquerda', () => {
    const { container, rerender } = render(<Timer time={0} />)
    expect(container.textContent).toBe('00:00')

    rerender(<Timer time={65} />)
    expect(container.textContent).toBe('01:05')

    rerender(<Timer time={600} />)
    expect(container.textContent).toBe('10:00')

    rerender(<Timer time={9} />)
    expect(container.textContent).toBe('00:09')
})

test('Timer expõe o estado visual conforme o tempo restante', () => {
    const { container, rerender } = render(<Timer time={31} />)
    expect(container.firstChild).toHaveAttribute('data-state', 'normal')
    expect(container.firstChild).toHaveClass('text-zinc-900')

    // últimos 30 segundos: aviso âmbar
    rerender(<Timer time={30} />)
    expect(container.firstChild).toHaveAttribute('data-state', 'warning')
    expect(container.firstChild).toHaveClass('text-amber-700')

    rerender(<Timer time={8} />)
    expect(container.firstChild).toHaveAttribute('data-state', 'alert')
    expect(container.firstChild).toHaveClass('text-amber-800')

    rerender(<Timer time={5} />)
    expect(container.firstChild).toHaveAttribute('data-state', 'danger')
    expect(container.firstChild).toHaveClass('text-red-700')
})
