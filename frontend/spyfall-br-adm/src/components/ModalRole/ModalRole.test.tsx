import { render, screen, fireEvent } from '@testing-library/react'
import ModalRole from './index'
import ModalProperties from '../../interfaces/ModalProperties'
import Role from '../../interfaces/RoleInterface'

const properties: ModalProperties<Role> = {
    show: true,
    type: 'create',
    currentValue: { id: -1, name: { pt: '', en: '' } }
}

test('ModalRole renderiza o modal customizado e fecha pelo botão Fechar', () => {
    const setProperties = jest.fn()
    render(
        <ModalRole
            modalRoleProperties={properties}
            setModalRoleProperties={setProperties}
            setRoles={jest.fn()}
            roles={[]}
            setPlaces={jest.fn()}
            places={[]}
        />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Criando novo cargo')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome (português)')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome (inglês)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Criar cargo' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(setProperties).toHaveBeenCalledWith({ ...properties, show: false })
})

test('ModalRole não renderiza nada quando show é false', () => {
    const { container } = render(
        <ModalRole
            modalRoleProperties={{ ...properties, show: false }}
            setModalRoleProperties={jest.fn()}
            setRoles={jest.fn()}
            roles={[]}
            setPlaces={jest.fn()}
            places={[]}
        />
    )
    expect(container).toBeEmptyDOMElement()
})
