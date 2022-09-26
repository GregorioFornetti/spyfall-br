
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Role from '../../interfaces/RoleInterface'
import ModalProperties from '../../interfaces/ModalProperties'

interface ModalRoleProps {
    modalRoleProperties: ModalProperties<Role>,
    setModalRoleProperties: React.Dispatch<React.SetStateAction<ModalProperties<Role>>>,
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>
}

export default function ModalRole({modalRoleProperties, setModalRoleProperties, setRoles}: ModalRoleProps) {

    let {show, type, currentValue} = modalRoleProperties
    let role = currentValue
    const handleClose = () => setModalRoleProperties({...modalRoleProperties, show: false});

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {(type === 'create') ?
                     ("Criando novo cargo") :
                     ("Editando cargo")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Fechar
                </Button>
                <Button variant="primary" onClick={handleClose}>
                    {(type === 'create') ?
                     ('Criar cargo') :
                     ('Salvar atualizações')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}