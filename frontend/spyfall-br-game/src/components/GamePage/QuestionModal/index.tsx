import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import Player from '../../../interfaces/PlayerInterface'
import PlayerCard from '../../PlayerCard'

interface QuestionModalProps {
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
    players: Player[],
    currentUserID: string,
    previousAskingUserID: string|undefined
}

export default function QuestionModal({show, setShow, players, previousAskingUserID, currentUserID}: QuestionModalProps) {

    const handleClose = () => setShow(false);

    return (
        <Modal show={show} onHide={handleClose} size='xl' centered>
            <Modal.Header closeButton>
                <Modal.Title>Questionar jogador</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {players
                .filter((player) => player.id !== currentUserID && player.id !== previousAskingUserID)
                .map((player) => (
                    <div className='col-sm-12 col-lg-6 col-xl-4'>
                        <PlayerCard key={player.id}
                            username={player.username}
                            score={player.score}
                            onClick={() => console.log('clicou')}
                        />
                    </div>
                ))}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}