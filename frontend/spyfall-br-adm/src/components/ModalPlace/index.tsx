
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Place from '../../interfaces/PlaceInterface'
import Select from 'react-select'

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
]

interface ModalPlaceProps {
    showModalPlace: boolean,
    setShowModalPlace: React.Dispatch<React.SetStateAction<boolean>>,
    type: "update"|"create",
    place: Place,
    setPlace: React.Dispatch<React.SetStateAction<Place>>
}

export default function ModalPlace({setShowModalPlace, showModalPlace, type, place, setPlace}: ModalPlaceProps) {

    const handleClose = () => setShowModalPlace(false);

    return (
        <Modal show={showModalPlace} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {(type === 'create') ?
                     ("Criando novo local") :
                     ("Editando local")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control 
                        type="text"
                        onChange={(event) => (setPlace({...place, name: event.target.value}))}
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
                        options={[
                            {value: "sla", label: "teste"},
                            {value: "sla1", label: "teste2"},
                            {value: "sla2", label: "teste3"}
                        ]}
                        className="basic-multi-select"
                        classNamePrefix="select"
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Categorias</Form.Label>
                    <Select
                        isMulti
                        options={[
                            {value: "sla", label: "teste"},
                            {value: "sla1", label: "teste2"},
                            {value: "sla2", label: "teste3"}
                        ]}
                        className="basic-multi-select"
                        classNamePrefix="select"
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Fechar
                </Button>
                <Button variant="primary" onClick={handleClose}>
                    {(type === 'create') ?
                     ('Criar local') :
                     ('Salvar atualizações')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}