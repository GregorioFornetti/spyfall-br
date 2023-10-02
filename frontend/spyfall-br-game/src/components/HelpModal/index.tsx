import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';

interface HelpModalProps {
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}

export default function HelpModal({show, setShow}: HelpModalProps) {

    const handleClose = () => setShow(false);

    return (
        <Modal onHide={handleClose} show={show} >
            <Modal.Header closeButton>
                Ajuda
            </Modal.Header>
            <Modal.Body >
                Ajuda !
            </Modal.Body>
        </Modal>
    )
}