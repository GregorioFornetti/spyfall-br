import React, { useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Socket } from "socket.io-client";

import PlaceCard from '../../PlaceCard';
import Place from '../../../interfaces/PlaceInterface'

interface GuessModalProps {
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
    socket: Socket,
    places: Place[]
}

export default function GuessModal({show, setShow, socket, places}: GuessModalProps) {

    const handleClose = () => setShow(false);

    return (
        <Modal show={show} onHide={handleClose} size='xl' centered>
            <Modal.Header closeButton>
                <Modal.Title>Adivinhar local</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <Row className='gy-4'>
                        {places
                        .map((place) => (
                            <div className='col-sm-12 col-lg-6 col-xl-4'>
                                <PlaceCard key={place.id}
                                    imgURL={place.imgPath}
                                    title={place.name}
                                    type='option'
                                    onClick={() => {
                                        socket.emit('guess-place', place.id)
                                        handleClose()
                                    }}
                                />
                            </div>
                        ))}
                    </Row>
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}