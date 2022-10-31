import React, { useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Socket } from "socket.io-client";

import Player from '../../../interfaces/PlayerInterface'
import PlayerCard from '../../PlayerCard';


interface AccuseModalProps {
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
    socket: Socket,
    players: Player[],
    currentUserID: string
}

export default function AccuseModal({show, setShow, socket, players, currentUserID}: AccuseModalProps) {

    const handleClose = () => setShow(false);

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>Acusar jogador</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <Row className='gy-4'>
                        {players
                        .filter((player) => player.id !== currentUserID)
                        .map((player) => (
                            <div className='col-sm-12 col-lg-6 col-xl-4' key={player.id}>
                                <PlayerCard
                                    username={player.username}
                                    score={player.score}
                                    onClick={() => console.log('clicou')}
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