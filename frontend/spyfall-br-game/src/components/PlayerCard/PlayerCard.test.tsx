import { render, screen, fireEvent } from '@testing-library/react'
import PlayerCard from './index'

test('PlayerCard mostra nome, pontuação e destaca o usuário atual', () => {
    const { container } = render(<PlayerCard username="Ana" score={7} isCurrentUser />)
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('Pontuação: 7')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-zinc-200')
})

test('PlayerCard em jogo permite marcar suspeito e seguro', () => {
    const { container } = render(<PlayerCard username="Beto" score={0} inGame />)
    expect(container.firstChild).toHaveClass('bg-zinc-50')

    fireEvent.click(screen.getByLabelText('suspeito'))
    expect(container.firstChild).toHaveClass('bg-red-100')

    fireEvent.click(screen.getByLabelText('safe'))
    expect(container.firstChild).toHaveClass('bg-emerald-100')
})

test('PlayerCard clicável dispara onClick', () => {
    const onClick = jest.fn()
    render(<PlayerCard username="Caio" score={1} onClick={onClick} />)
    fireEvent.click(screen.getByText('Caio'))
    expect(onClick).toHaveBeenCalledTimes(1)
})
