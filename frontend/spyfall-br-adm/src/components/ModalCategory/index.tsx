
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Category from '../../interfaces/CategoryInterface'

interface ModalCategoryProps {
    showModalCategory: boolean,
    setShowModalCategory: React.Dispatch<React.SetStateAction<boolean>>,
    type: "update"|"create",
    category: Category,
    setCategory: React.Dispatch<React.SetStateAction<Category>>
}

export default function ModalCategory({setShowModalCategory, showModalCategory, type, category, setCategory}: ModalCategoryProps) {

    const handleClose = () => setShowModalCategory(false);

    return (
        <Modal show={showModalCategory} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {(type === 'create') ?
                     ("Criando nova categoria") :
                     ("Editando categoria")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control 
                        type="text"
                        onChange={(event) => (setCategory({...category, name: event.target.value}))}
                        value={category.name}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Fechar
                </Button>
                <Button variant="primary" onClick={handleClose}>
                    {(type === 'create') ?
                     ('Criar categoria') :
                     ('Salvar atualizações')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}