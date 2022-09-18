
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Role from '../../interfaces/RoleInterface'

interface ModalRoleProps {
    showModalRole: boolean,
    setShowModalRole: React.Dispatch<React.SetStateAction<boolean>>,
    type: "update"|"create",
    role: Role,
    setRole: React.Dispatch<React.SetStateAction<Role>>
}

export default function ModalRole({setShowModalRole, showModalRole, type, role, setRole}: ModalRoleProps) {

    const handleClose = () => setShowModalRole(false);

    return (
        <Modal show={showModalRole} onHide={handleClose}>
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
                        onChange={(event) => (setRole({...role, name: event.target.value}))}
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