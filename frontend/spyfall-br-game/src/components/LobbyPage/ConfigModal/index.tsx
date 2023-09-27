import React, { useState } from 'react';
import { Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Socket } from "socket.io-client";


interface ConfigModalProps {
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
    socket: Socket,
    currentUserID: string
}

export default function ConfigModal({show, setShow, socket, currentUserID}: ConfigModalProps) {

    const handleClose = () => setShow(false);

    return (
        <Modal show={show} onHide={handleClose} size='xl' centered>
            <Modal.Header closeButton>
                <Modal.Title>Configurações</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Container>
                        <Row lg={3} md={2} sm={1}>
                            <Form.Group controlId="nonSpyVictoryScore">
                                <Form.Label>Pontos vitória não espião</Form.Label>
                                <Form.Control type="email" value={1} />
                            </Form.Group>
                        </Row>
                    </Container>
                </Form>
        </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Fechar
                </Button>
                <Button variant="primary" onClick={handleClose}>
                    Salvar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}