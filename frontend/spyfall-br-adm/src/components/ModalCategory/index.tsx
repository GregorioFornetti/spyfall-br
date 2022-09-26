
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
    const handleClose = () => setModalCategoryProperties({...modalCategoryProperties, show: false})
    const titleMap = {
        create: 'Criando nova categoria',
        update: 'Editando categoria',
        delete: `Deletar a categoria "${category.name}" ?`
    }
    const btnLabelMap = {
        create: 'Criar categoria',
        update: 'Salvar categoria',
        delete: 'Deletar categoria'
    }
    const functionMap = {
        create: createCategory,
        update: updateCategory,
        delete: deleteCategory
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
                    <p>Deseja mesmo excluir "{category.name}" ?</p>
                }

                {(type === 'create' || type === 'update') &&
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
                }
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Fechar
                </Button>
                <Button 
                    variant={(type === 'delete') ? ('danger') : ('primary')}
                    onClick={() => {
                        functionMap[type](category, setCategories)
                        handleClose()
                    }}
                >
                    {btnLabelMap[type]}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

function createCategory(category: Category, setCategories: React.Dispatch<React.SetStateAction<Category[]>>) {
    // Para atualizar o frontend
    
}

function updateCategory(category: Category, setCategories: React.Dispatch<React.SetStateAction<Category[]>>) {
    // Para atualizar o frontend
}

function deleteCategory(category: Category, setCategories: React.Dispatch<React.SetStateAction<Category[]>>) {

    // Para atualizar o frontend
}