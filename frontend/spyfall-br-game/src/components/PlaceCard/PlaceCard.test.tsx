import { render, screen, fireEvent } from '@testing-library/react'
import PlaceCard from './index'

test('PlaceCard mostra o título e alterna a marcação quando clicável (markable)', () => {
    render(<PlaceCard title="Casa" type="markable" />)
    const title = screen.getByText('Casa')
    expect(title).toBeInTheDocument()
    expect(title).not.toHaveClass('line-through')
    expect(screen.queryByText('riscado')).not.toBeInTheDocument()

    fireEvent.click(title)
    expect(screen.getByText('Casa')).toHaveClass('line-through')
    expect(screen.getByText('riscado')).toBeInTheDocument()

    fireEvent.click(title)
    expect(screen.getByText('Casa')).not.toHaveClass('line-through')
})

test('PlaceCard do tipo selected não alterna marcação e usa onClick próprio', () => {
    const onClick = jest.fn()
    render(<PlaceCard title="Avião" type="selected" onClick={onClick} />)
    fireEvent.click(screen.getByText('Avião'))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Avião')).not.toHaveClass('line-through')
})

test('PlaceCard sem imgURL usa imagem placeholder e com imgURL usa a informada', () => {
    const { container, rerender } = render(<PlaceCard title="X" type="option" />)
    const img = container.querySelector('img') as HTMLImageElement
    expect(img.src).toContain('placeholder')

    rerender(<PlaceCard title="X" type="option" imgURL="http://exemplo/img.png" />)
    expect((container.querySelector('img') as HTMLImageElement).src).toBe('http://exemplo/img.png')
})
