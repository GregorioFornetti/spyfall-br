import React, { useState } from 'react';
import { Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Socket } from "socket.io-client";
import TooltipIcon from '../../TooltipIcon';
import { BsQuestionCircle } from 'react-icons/bs'
import NumberInput from './NumberInput';


interface ConfigModalProps {
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
    socket: Socket,
    currentUserID: string
}

export default function ConfigModal({show, setShow, socket, currentUserID}: ConfigModalProps) {

    const handleClose = () => setShow(false);
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        console.log(formData.get('nonSpyVictoryScore'))
    }


    return (
        <Modal show={show} onHide={handleClose} size='xl' centered>
            <Modal.Header closeButton>
                <Modal.Title>Configurações</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Container className="border p-2">
                        <Row lg={3} md={2} sm={1}>
                            <NumberInput
                                name='nonSpyVictoryScore'
                                tooltipText='Pontuação necessária para que os não espiões ganhem'
                                labelText='Pontuação para vitória dos não espiões'
                                min={1}
                            />
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Fechar
                    </Button>
                    <Button variant="primary" type='submit'>
                        Salvar
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}