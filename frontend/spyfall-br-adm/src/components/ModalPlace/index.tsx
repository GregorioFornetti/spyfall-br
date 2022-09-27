
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Place from '../../interfaces/PlaceInterface'
import Select from 'react-select'
import ModalProperties from '../../interfaces/ModalProperties'
import Category from '../../interfaces/CategoryInterface'
import Role from '../../interfaces/RoleInterface';


interface ModalPlaceProps {
    modalPlaceProperties: ModalProperties<Place>,
    setModalPlaceProperties: React.Dispatch<React.SetStateAction<ModalProperties<Place>>>,
    setPlaces: React.Dispatch<React.SetStateAction<Place[]>>,
    places: Place[],
    categories: Category[],
    roles: Role[]
}

export default function ModalPlace({modalPlaceProperties, setModalPlaceProperties, setPlaces, places, categories, roles}: ModalPlaceProps) {

    const {show, type, currentValue} = modalPlaceProperties
    const place = currentValue
    const handleClose = () => setModalPlaceProperties({...modalPlaceProperties, show: false})

    const titleMap = {
        create: 'Criando novo local',
        update: 'Editando local',
        delete: `Deletar o local "${place.name}" ?`
    }
    const btnLabelMap = {
        create: 'Criar local',
        update: 'Salvar local',
        delete: 'Deletar local'
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {titleMap[type]}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control 
                        type="text"
                        onChange={(event) => {
                            place.name = event.target.value
                            setModalPlaceProperties({...modalPlaceProperties, currentValue: place})
                        }}
                        value={place.name}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Imagem</Form.Label>
                    <Form.Control 
                        type="file"
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Cargos</Form.Label>
                    <Select
                        isMulti
                        options={roles.map((role) => ({value: role.id, label: role.name}))}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder=""
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Categorias</Form.Label>
                    <Select
                        isMulti
                        options={categories.map((category) => ({value: category.id, label: category.name}))}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder=""
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Fechar
                </Button>
                <Button 
                    variant={(type === 'delete') ? ('danger') : ('primary')}
                    onClick={handleClose}
                >
                    {btnLabelMap[type]}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}