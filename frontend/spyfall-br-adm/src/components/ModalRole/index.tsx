
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Role from '../../interfaces/RoleInterface'
import ModalProperties from '../../interfaces/ModalProperties'
import Spinner from 'react-bootstrap/Spinner'
import {useState} from 'react'
import {serverURL} from '../../utils/configs'
import axios from 'axios'

interface ModalRoleProps {
    modalRoleProperties: ModalProperties<Role>,
    setModalRoleProperties: React.Dispatch<React.SetStateAction<ModalProperties<Role>>>,
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>,
    roles: Role[]
}

export default function ModalRole({modalRoleProperties, roles, setModalRoleProperties, setRoles}: ModalRoleProps) {

    const [loading, setLoading] = useState(false)
    let {show, type, currentValue} = modalRoleProperties
    let role = currentValue
    const handleClose = () => setModalRoleProperties({...modalRoleProperties, show: false})
    const handleError = (error: any) => {
        console.error(error)
        alert('Ocorreu um erro ! Olhar o console para mais informações')
        setLoading(false)
    }

    const createRole = () => {
        axios.post(`${serverURL}/roles`, {
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
        axios.put(`${serverURL}/roles/${role.id}`, {
            name: role.name
        })
        .then((response) => {
            let RoleIndex = roles.findIndex((roleParam) => (roleParam.id === role.id))
            roles[RoleIndex] = role
            setRoles([...roles])

            setLoading(false)
            handleClose()
        })
        .catch(handleError)
    }

    const deleteRole = () => {
        axios.delete(`${serverURL}/roles/${role.id}`)
        .then((response) => {
            setRoles(roles.filter((roleParam) => role !== roleParam))

            setLoading(false)
            handleClose()
        })
        .catch(handleError)
    }

    const titleMap = {
        create: 'Criando novo cargo',
        update: 'Editando cargo',
        delete: `Deletar o cargo "${role.name}" ?`
    }
    const btnLabelMap = {
        create: 'Criar cargo',
        update: 'Salvar cargo',
        delete: 'Deletar cargo'
    }

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton={!loading}>
                <Modal.Title>
                    {titleMap[type]}
                </Modal.Title>
            </Modal.Header>
            {(!loading) ? 
            (
                <>
                    <Modal.Body>
                        {(type === 'delete') && 
                            <p>Deseja mesmo excluir "{role.name}" ?</p>
                        }

                        {(type === 'create' || type === 'update') &&
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control 
                                    type="text"
                                    onChange={(event) => {
                                        role.name = event.target.value
                                        setModalRoleProperties({...modalRoleProperties, currentValue: role})
                                    }}
                                    value={role.name}
                                />
                            </Form.Group>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Fechar
                        </Button>
                        <Button 
                            variant={(type === 'delete') ? ('danger') : ('primary')} 
                            onClick={() => {
                                if (type === 'create') {
                                    createRole()
                                } else if (type === 'update') {
                                    updateRole()
                                } else if (type === 'delete') {
                                    deleteRole()
                                }
                                setLoading(true)
                            }}
                        >
                            {btnLabelMap[type]}
                        </Button>
                    </Modal.Footer>
                </>
            ) :
            (
                <Modal.Body>
                    <div className='text-center'>
                        <Spinner
                            animation="border" 
                            variant="primary" 
                        />
                    </div>
                </Modal.Body>
            )
            }
        </Modal>
    )
}
