import classNames from "classnames"
import { Button } from "react-bootstrap"
import styles from './MainPage.module.scss'
import { useState } from 'react'
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { Socket } from "socket.io-client";

interface MainPageProps {
    show?: boolean,
    socket: Socket,
    URLGameCode: string,
    setURLGameCode: React.Dispatch<React.SetStateAction<string>>
}

export default function MainPage({show, socket, URLGameCode, setURLGameCode}: MainPageProps) {
    const [showNewMatchModal, setShowNewMatchModal] = useState(false)
    const [showJoinMatchModal, setShowJoinMatchModal] = useState(false)

    const [username, setUsername] = useState("")
    const [roomCode, setRoomCode] = useState("")

    const openNewMatchModal = () => setShowNewMatchModal(true)
    const closeNewMatchModal = () => setShowNewMatchModal(false)

    const openJoinMatchModal = () => setShowJoinMatchModal(true)
    const closeJoinMatchModal = () => {
        setURLGameCode('')
        setShowJoinMatchModal(false)
    }

    const createRoom = () => {
        if (username.trim().length > 0) {
            socket.emit("create-room", {username: username})
            setShowNewMatchModal(false)
        } else {
            alert("Digite um nome !")
        }
    }

    const joinRoom = () => {
        if (username.trim().length > 0 && (roomCode.trim().length > 0 || URLGameCode.trim().length > 0)) {
            socket.emit("join-room", {roomCode: (URLGameCode) ? URLGameCode : roomCode, username: username})
            setURLGameCode('')
            setShowJoinMatchModal(false)
        } else {
            alert("Digite um nome e o código da partida !")
        }
    }

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
                    <Form.Control value={username} onChange={(event) => setUsername(event.target.value)} type="text" />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeNewMatchModal}>
                        Fechar
                    </Button>
                    <Button variant="primary" onClick={createRoom}>
                        Criar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showJoinMatchModal || URLGameCode.length !== 0}
                onHide={closeJoinMatchModal}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Entrar em uma partida</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {(!URLGameCode) &&
                        <>
                            <Form.Label>Código da partida</Form.Label>
                            <Form.Control 
                                value={roomCode} 
                                onChange={(event) => setRoomCode(event.target.value)} type="text" />
                            <br />
                        </>
                    }
                    <Form.Label>Nome</Form.Label>
                    <Form.Control value={username} onChange={(event) => setUsername(event.target.value)} type="text" />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeJoinMatchModal}>
                        Fechar
                    </Button>
                    <Button variant="primary" onClick={joinRoom}>
                        Entrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}