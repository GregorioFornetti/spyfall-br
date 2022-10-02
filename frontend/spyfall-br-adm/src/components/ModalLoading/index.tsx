import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import styles from './ModalLoading.module.scss'

interface ModalLoadingProps {
    show: boolean
}

export default function ModalLoading({show}: ModalLoadingProps) {
    return (
        <Modal show={show} className={"modal-dialog modal-dialog-centered"}>
            <Modal.Body className={styles.modalBody}>
                <Spinner 
                    animation="border"
                    variant="primary"
                    className={styles.spinner}
                />
            </Modal.Body>
        </Modal>
    )
}