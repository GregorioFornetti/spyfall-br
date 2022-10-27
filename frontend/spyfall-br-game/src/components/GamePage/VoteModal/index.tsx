import React, { useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import Player from '../../../interfaces/PlayerInterface'
import PlayerCard from '../../PlayerCard'

interface VoteModalProps {
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
    players: Player[],
    accusedUserID?: string,
    accuserUserID?: string,
    agreedUsersIds: string[],
    desagreedUsersIds: string[]
}

export default function VoteModal({show, setShow, players, accusedUserID, accuserUserID, agreedUsersIds, desagreedUsersIds}: VoteModalProps) {

    const handleClose = () => setShow(false);

    var accusedUsername = ''
    if (accusedUserID) {
        accusedUsername = (players.find((player) => player.id == accusedUserID) as Player).username
    }
    var accuserUsername = ''
    if (accuserUserID) {
        accuserUsername = (players.find((player) => player.id == accuserUserID) as Player).username
    }


    return (
        <Modal show={show} onHide={handleClose} size='xl' centered>
            <Modal.Header className='d-block text-center'>
                <Modal.Title>Votação</Modal.Title>
                <span>
                    <strong>{accuserUsername}</strong> está acusando <strong>{accusedUsername}</strong>
                </span>
            </Modal.Header>
            <Modal.Body>
                {players.map((player) => (
                    <div className='col-sm-12 col-lg-6 col-xl-4' key={player.id}>
                        <PlayerCard
                            username={player.username}
                            score={player.score}
                            onClick={() => console.log('clicou')}

                            agreed={agreedUsersIds.includes(player.id) || player.id === accuserUserID}
                            desagreed={desagreedUsersIds.includes(player.id)}
                            accused={player.id === accusedUserID}
                        />
                    </div>
                ))}
            </Modal.Body>
            <Modal.Footer>
                <Container>
                    <Row className='justify-content-between'>
                        <div className='d-grid col-5 col-lg-4 col-xl-3 m-auto'>
                            <Button variant="success">Concordar</Button>
                        </div>
                        <div className='d-grid col-5 col-lg-4 col-xl-3 m-auto'>
                            <Button variant="danger">Discordar</Button>
                        </div>
                    </Row>
                </Container>
            </Modal.Footer>
        </Modal>
    );
}