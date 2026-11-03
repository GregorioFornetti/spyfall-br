import { render, screen, fireEvent } from '@testing-library/react'
import MultiSelect from './index'

test('menu de categorias abre em portal fora do contêiner (não é cortado pelo modal)', () => {
    const { container } = render(
        <MultiSelect
            options={[
                { value: 1, label: 'Transporte' },
                { value: 2, label: 'Lazer' },
            ]}
            selected={[]}
            setSelected={jest.fn()}
            title="Selecionar por categorias"
        />
    )

    fireEvent.mouseDown(screen.getByText('Selecionar por categorias'))

    const option = screen.getByText('Transporte')
    expect(option).toBeInTheDocument()
    // O menu precisa viver fora da árvore do componente (portal no body),
    // senão o overflow do modal/seção corta as opções quando a lista
    // de lugares selecionados está vazia.
    expect(container.contains(option)).toBe(false)
    expect(document.body.contains(option)).toBe(true)
})
