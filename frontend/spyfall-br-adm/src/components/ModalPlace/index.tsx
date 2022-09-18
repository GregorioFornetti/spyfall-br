
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Place from '../../interfaces/PlaceInterface'

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
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control 
                        type="text"
                        onChange={(event) => (setPlace({...place, name: event.target.value}))}
                        value={place.name}
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