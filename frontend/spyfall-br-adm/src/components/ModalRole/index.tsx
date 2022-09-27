
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Role from '../../interfaces/RoleInterface'
import ModalProperties from '../../interfaces/ModalProperties'

interface ModalRoleProps {
    modalRoleProperties: ModalProperties<Role>,
    setModalRoleProperties: React.Dispatch<React.SetStateAction<ModalProperties<Role>>>,
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>,
    roles: Role[]
}

export default function ModalRole({modalRoleProperties, roles, setModalRoleProperties, setRoles}: ModalRoleProps) {

    let {show, type, currentValue} = modalRoleProperties
    let role = currentValue
    const handleClose = () => setModalRoleProperties({...modalRoleProperties, show: false})

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
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {titleMap[type]}
                </Modal.Title>
            </Modal.Header>
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
                            createRole(role, roles, setRoles)
                        } else if (type === 'update') {
                            updateRole(role, roles, setRoles)
                        } else if (type === 'delete') {
                            deleteRole(role, roles, setRoles)
                        }
                        handleClose()
                    }}
                >
                    {btnLabelMap[type]}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}


function createRole(currentRole: Role, roles: Role[], setRoles: React.Dispatch<React.SetStateAction<Role[]>>) {
    // Para atualizar o frontend
    // OBS IMPORTANTE: é preciso pegar o id novo do backend depois que retornar...
    setRoles([...roles, currentRole])
}

function updateRole(currentRole: Role, roles: Role[], setRoles: React.Dispatch<React.SetStateAction<Role[]>>) {
    // Para atualizar o frontend
    let RoleIndex = roles.findIndex((roleParam) => (roleParam.id === currentRole.id))
    roles[RoleIndex] = currentRole
    setRoles([...roles])
}

function deleteRole(currentRole: Role, roles: Role[], setRoles: React.Dispatch<React.SetStateAction<Role[]>>) {
    // Para atualizar o frontend
    setRoles(roles.filter((roleParam) => currentRole !== roleParam))
}