import Role from '../../interfaces/RoleInterface'
import Place from '../../interfaces/PlaceInterface'
import ModalProperties from '../../interfaces/ModalProperties'
import { useState } from 'react'
import { dbPath } from '../../utils/configs'
import { displayName } from '../../utils/utils'
import axios from 'axios'
import Modal, { Spinner, PrimaryButton, SecondaryButton, inputClass, labelClass } from '../ui/Modal'

interface ModalRoleProps {
    modalRoleProperties: ModalProperties<Role>,
    setModalRoleProperties: React.Dispatch<React.SetStateAction<ModalProperties<Role>>>,
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>,
    roles: Role[],
    setPlaces: React.Dispatch<React.SetStateAction<Place[]>>,
    places: Place[]
}

export default function ModalRole({ modalRoleProperties, roles, setModalRoleProperties, setRoles, setPlaces, places }: ModalRoleProps) {

    const [loading, setLoading] = useState(false)
    let { show, type, currentValue } = modalRoleProperties
    let role = currentValue
    const handleClose = () => setModalRoleProperties({ ...modalRoleProperties, show: false })
    const handleError = (error: any) => {
        console.error(error)
        alert('Ocorreu um erro ! Olhar o console para mais informações')
        setLoading(false)
    }

    const createRole = () => {
        axios.post(`${dbPath}/roles`, {
            name: role.name
        })
        .then((response) => {
            setRoles([...roles, {...role, id: response.data.id}])

            setLoading(false)
            handleClose()
        })
        .catch(handleError)
    }

    const updateRole = () => {
        axios.put(`${dbPath}/roles/${role.id}`, {
            name: role.name
        })
        .then(() => {
            let roleIndex = roles.findIndex((roleParam) => (roleParam.id === role.id))
            roles[roleIndex] = role
            setRoles([...roles])

            setLoading(false)
            handleClose()
        })
        .catch(handleError)
    }

    const deleteRole = () => {
        axios.delete(`${dbPath}/roles/${role.id}`)
        .then(() => {
            for (let place of places) {
                place.rolesIds = place.rolesIds.filter((roleId) => (roleId !== role.id))
            }
            setPlaces([...places])
            setRoles(roles.filter((roleParam) => role !== roleParam))

            setLoading(false)
            handleClose()
        })
        .catch(handleError)
    }

    const titleMap = {
        create: 'Criando novo cargo',
        update: 'Editando cargo',
        delete: `Deletar o cargo "${displayName(role.name)}" ?`
    }
    const btnLabelMap = {
        create: 'Criar cargo',
        update: 'Salvar cargo',
        delete: 'Deletar cargo'
    }

    const submit = () => {
        if (type === 'create') {
            createRole()
        } else if (type === 'update') {
            updateRole()
        } else if (type === 'delete') {
            deleteRole()
        }
        setLoading(true)
    }

    const setName = (locale: 'pt' | 'en', value: string) => {
        role.name = { ...role.name, [locale]: value }
        setModalRoleProperties({ ...modalRoleProperties, currentValue: role })
    }

    return (
        <Modal
            show={show}
            title={titleMap[type]}
            onClose={handleClose}
            closeable={!loading}
            footer={!loading && (
                <>
                    <SecondaryButton onClick={handleClose}>Fechar</SecondaryButton>
                    <PrimaryButton danger={type === 'delete'} onClick={submit}>
                        {btnLabelMap[type]}
                    </PrimaryButton>
                </>
            )}
        >
            {loading ? (
                <Spinner />
            ) : (
                <>
                    {type === 'delete' &&
                        <p className="text-sm text-zinc-600">Deseja mesmo excluir &ldquo;{displayName(role.name)}&rdquo; ?</p>
                    }

                    {(type === 'create' || type === 'update') &&
                        <div className="flex flex-col gap-4">
                            <div>
                                <label htmlFor="role-name-pt" className={labelClass}>Nome (português)</label>
                                <input
                                    id="role-name-pt"
                                    className={inputClass}
                                    type="text"
                                    onChange={(event) => setName('pt', event.target.value)}
                                    value={role.name.pt}
                                />
                            </div>
                            <div>
                                <label htmlFor="role-name-en" className={labelClass}>Nome (inglês)</label>
                                <input
                                    id="role-name-en"
                                    className={inputClass}
                                    type="text"
                                    onChange={(event) => setName('en', event.target.value)}
                                    value={role.name.en}
                                />
                            </div>
                        </div>
                    }
                </>
            )}
        </Modal>
    )
}
