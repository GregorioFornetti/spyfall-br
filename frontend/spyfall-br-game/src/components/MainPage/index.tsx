import classNames from "classnames"
import { Button } from "react-bootstrap"
import styles from './MainPage.module.scss'
import { useState } from 'react'
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

interface MainPageProps {
    show?: boolean
}

export default function MainPage({show}: MainPageProps) {
    const [showNewMatchModal, setShowNewMatchModal] = useState(false)
    const [showJoinMatchModal, setShowJoinMatchModal] = useState(false)

    const openNewMatchModal = () => setShowNewMatchModal(true)
    const closeNewMatchModal = () => setShowNewMatchModal(false)

    const openJoinMatchModal = () => setShowJoinMatchModal(true)
    const closeJoinMatchModal = () => setShowJoinMatchModal(false)

    return (
        <>
            <div className={classNames('pt-5', {'d-none': !show})}>
                <div className={classNames('m-auto mb-3 d-grid', styles['btn-div'])}>
                    <Button variant="primary" onClick={openNewMatchModal}>
                        Criar nova partida
                    </Button>
                </div>
                <div className={classNames('m-auto mb-3 d-grid', styles['btn-div'])}>
                    <Button variant="primary" onClick={openJoinMatchModal}>
                        Entrar em uma partida
                    </Button>
                </div>
            </div>

            <Modal
                show={showNewMatchModal}
                onHide={closeNewMatchModal}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Criar nova partida</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Label>Nome</Form.Label>
                    <Form.Control type="text" />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeNewMatchModal}>
                        Fechar
                    </Button>
                    <Button variant="primary">
                        Criar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showJoinMatchModal}
                onHide={closeJoinMatchModal}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Entrar em uma partida</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Label>Código da partida</Form.Label>
                    <Form.Control type="text" />
                    <br />
                    <Form.Label>Nome</Form.Label>
                    <Form.Control type="text" />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeJoinMatchModal}>
                        Fechar
                    </Button>
                    <Button variant="primary">
                        Entrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}