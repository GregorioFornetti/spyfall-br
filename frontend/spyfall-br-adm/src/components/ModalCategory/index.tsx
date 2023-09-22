
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Category from '../../interfaces/CategoryInterface'
import Place from '../../interfaces/PlaceInterface'
import ModalProperties from '../../interfaces/ModalProperties';
import axios from 'axios'
import Spinner from 'react-bootstrap/Spinner'
import {useState} from 'react'
import {dbPath} from '../../utils/configs'

interface ModalCategoryProps {
    modalCategoryProperties: ModalProperties<Category>,
    setModalCategoryProperties: React.Dispatch<React.SetStateAction<ModalProperties<Category>>>,
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>,
    categories: Category[],
    setPlaces: React.Dispatch<React.SetStateAction<Place[]>>,
    places: Place[]
}

export default function ModalCategory({modalCategoryProperties, categories, setModalCategoryProperties, setCategories, places, setPlaces}: ModalCategoryProps) {

    const [loading, setLoading] = useState(false)
    const {show, type, currentValue} = modalCategoryProperties
    let category = currentValue
    const handleClose = () => setModalCategoryProperties({...modalCategoryProperties, show: false})
    const handleError = (error: any) => {
        console.error(error)
        alert('Ocorreu um erro ! Olhar o console para mais informações')
        setLoading(false)
    }

    const createCategory = () => {
        axios.post(`${dbPath}/categories`, {
            name: category.name
        })
        .then((response) => {
            setCategories([...categories, {...category, id: response.data.id}])

            setLoading(false)
            handleClose()
        })
        .catch(handleError)
    }

    const updateCategory = () => {
        axios.put(`${dbPath}/categories/${category.id}`, {
            name: category.name
        })
        .then((response) => {
            let categoryIndex = categories.findIndex((categoryParam) => (categoryParam.id === category.id))
            categories[categoryIndex] = category
            setCategories([...categories])

            setLoading(false)
            handleClose()
        })
        .catch(handleError)
    }

    const deleteCategory = ()  => {
        axios.delete(`${dbPath}/categories/${category.id}`)
        .then((response) => {
            for (let place of places) {
                place.categoriesIds = place.categoriesIds.filter((categoryId) => (categoryId !== category.id))
            }
            setPlaces([...places])
            setCategories(categories.filter((categoryParam) => category !== categoryParam))

            setLoading(false)
            handleClose()
        })
        .catch(handleError)
    }

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

    return (
        <Modal show={show} onHide={handleClose}>
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
                            if (type === 'create') {
                                createCategory()
                            } else if (type === 'update') {
                                updateCategory()
                            } else if (type === 'delete') {
                                deleteCategory()
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
            ) }
        </Modal>
    )
}
