import { render, screen, fireEvent } from '@testing-library/react'
import CustomPlaceModal from './index'

const roles = [
    { id: 10, name: { pt: 'Piloto', en: 'Pilot' } },
    { id: 11, name: { pt: 'Morador', en: 'Resident' } }
]

test('modal de lugar personalizado usa apenas link de imagem, sem envio de arquivo', () => {
    const { container } = render(
        <CustomPlaceModal show place={null} roles={roles} onClose={() => {}} onSave={() => {}} />
    )

    expect(container.querySelector('input[type="file"]')).toBeNull()
    const imageInput = screen.getByLabelText('Link da imagem') as HTMLInputElement
    expect(imageInput.type).toBe('url')
    expect(screen.getByText(/Não é possível enviar arquivo/)).toBeInTheDocument()
    expect(screen.getByText('Personalizados')).toBeInTheDocument()
})

test('modal exige nome e link de imagem válido antes de salvar', () => {
    const onSave = jest.fn()
    render(
        <CustomPlaceModal show place={null} roles={roles} onClose={() => {}} onSave={onSave} />
    )

    fireEvent.click(screen.getByText('Criar lugar'))
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome do lugar em português.')
    expect(onSave).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Nome (português)'), { target: { value: 'Festa em casa' } })
    fireEvent.change(screen.getByLabelText('Link da imagem'), { target: { value: 'isso-nao-e-url' } })
    fireEvent.click(screen.getByText('Criar lugar'))
    expect(screen.getByRole('alert')).toHaveTextContent('Informe um link de imagem válido')
    expect(onSave).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Link da imagem'), { target: { value: 'https://example.com/festa.png' } })
    fireEvent.click(screen.getByText('Criar lugar'))
    expect(screen.getByRole('alert')).toHaveTextContent('Selecione ou crie pelo menos um cargo.')
    expect(onSave).not.toHaveBeenCalled()
})

test('modal em edição vem preenchido e salva com os cargos existentes escolhidos', () => {
    const onSave = jest.fn()
    const place = {
        id: -3,
        name: { pt: 'Casa da praia', en: 'Beach house' },
        imgPath: 'https://example.com/praia.png',
        rolesIds: [10],
        categoriesIds: [-1]
    }
    render(
        <CustomPlaceModal show place={place} roles={roles} onClose={() => {}} onSave={onSave} />
    )

    expect(screen.getByLabelText('Nome (português)')).toHaveValue('Casa da praia')
    expect(screen.getByLabelText('Link da imagem')).toHaveValue('https://example.com/praia.png')
    expect(screen.getByText('Piloto')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Salvar lugar'))
    expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ id: -3, name: { pt: 'Casa da praia', en: 'Beach house' }, rolesIds: [10] }),
        []
    )
})
