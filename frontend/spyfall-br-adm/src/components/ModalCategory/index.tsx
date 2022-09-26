
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Category from '../../interfaces/CategoryInterface'
import ModalProperties from '../../interfaces/ModalProperties';

interface ModalCategoryProps {
    modalCategoryProperties: ModalProperties<Category>,
    setModalCategoryProperties: React.Dispatch<React.SetStateAction<ModalProperties<Category>>>,
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>
}

export default function ModalCategory({modalCategoryProperties, setModalCategoryProperties, setCategories}: ModalCategoryProps) {

    const {show, type, currentValue} = modalCategoryProperties
    let category = currentValue
    const handleClose = () => setModalCategoryProperties({...modalCategoryProperties, show: false});

    return (
        <Modal show={show} onHide={handleClose}>
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
                        onChange={(event) => {
                            category.name = event.target.value
                            setModalCategoryProperties({...modalCategoryProperties, currentValue: category})
                        }}
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