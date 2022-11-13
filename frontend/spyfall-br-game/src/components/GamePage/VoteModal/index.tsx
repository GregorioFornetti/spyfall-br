import React, { useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Socket } from "socket.io-client";

import Player from '../../../interfaces/PlayerInterface'
import PlayerCard from '../../PlayerCard'
import Timer from '../Timer';

interface VoteModalProps {
    show: boolean,
    socket: Socket,
    currentUserID: string,
    votationTime: number,
    players: Player[],
    accusedUserID?: string,
    accuserUserID?: string,
    agreedUsersIds: string[],
    desagreedUsersIds: string[]
}

export default function VoteModal({show, socket, currentUserID, players, accusedUserID, accuserUserID, agreedUsersIds, desagreedUsersIds, votationTime}: VoteModalProps) {

    var accusedUsername = ''
    if (accusedUserID) {
        accusedUsername = (players.find((player) => player.id == accusedUserID) as Player).username
    }
    var accuserUsername = ''
    if (accuserUserID) {
        accuserUsername = (players.find((player) => player.id == accuserUserID) as Player).username
    }

    const disabled = (currentUserID === accusedUserID || 
                      currentUserID === accuserUserID || 
                      agreedUsersIds.includes(currentUserID) ||
                      desagreedUsersIds.includes(currentUserID))


    return (
        <Modal show={show} size='xl' centered>
            <Modal.Header className='d-block text-center'>
                <Modal.Title>Votação</Modal.Title>
                <span>
                    <strong>{accuserUsername}</strong> está acusando <strong>{accusedUsername}</strong>
                </span>
                <div className='d-flex justify-content-center mt-3'>
                    <Timer time={votationTime} />
                </div>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <Row className='gy-4'>
                        {players.map((player) => (
                            <div className='col-sm-12 col-lg-6 col-xl-4' key={player.id}>
                                <PlayerCard
                                    username={player.username}
                                    score={player.score}

                                    agreed={agreedUsersIds.includes(player.id) || player.id === accuserUserID}
                                    desagreed={desagreedUsersIds.includes(player.id)}
                                    accused={player.id === accusedUserID}
                                />
                            </div>
                        ))}
                    </Row>
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Container>
                    <Row className='justify-content-between'>
                        <div className='d-grid col-5 col-lg-4 col-xl-3 m-auto'>
                            <Button 
                                variant="success"
                                onClick={() => socket.emit('vote', true)}
                                disabled={disabled}
                            >
                                Concordar
                            </Button>
                        </div>
                        <div className='d-grid col-5 col-lg-4 col-xl-3 m-auto'>
                            <Button 
                                variant="danger"
                                onClick={() => socket.emit('vote', false)}
                                disabled={disabled}
                            >
                                Discordar
                            </Button>
                        </div>
                    </Row>
                </Container>
            </Modal.Footer>
        </Modal>
    );
}