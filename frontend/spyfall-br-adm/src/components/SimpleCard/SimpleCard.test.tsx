import { render, screen, fireEvent } from '@testing-library/react'
import SimpleCard from './index'

test('SimpleCard mostra o nome e dispara atualizar/deletar', () => {
    const onUpdate = jest.fn()
    const onDelete = jest.fn()
    render(<SimpleCard name="Casa" updateFunction={onUpdate} deleteFunction={onDelete} />)

    expect(screen.getByText('Casa')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Atualizar' }))
    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onDelete).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Deletar' }))
    expect(onDelete).toHaveBeenCalledTimes(1)
})
