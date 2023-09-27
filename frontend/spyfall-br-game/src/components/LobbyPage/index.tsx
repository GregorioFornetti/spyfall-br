import React, { useState } from 'react';

import PlayerCard from "../PlayerCard";
import PlayersContainer from "../PlayersContainer";
import Player from '../../interfaces/PlayerInterface'
import classNames from "classnames";
import { Button, Container, Form, InputGroup, Row } from "react-bootstrap";
import { FaRegCopy } from 'react-icons/fa'
import { Socket } from "socket.io-client";
import ConfigModal from './ConfigModal';

import CopyCodeForm from './CopyCodeForm'

interface LobbyPageInterface {
    currentUserID: string,
    players: Player[],
    show?: boolean,
    gameCode: string,
    leaderUserID: string,
    socket: Socket,
    serverURL: string
}

export default function LobbyPage({players, currentUserID, show, gameCode, leaderUserID, socket, serverURL}: LobbyPageInterface) {

    const [showConfigModal, setShowConfigModal] = useState(false)

    const isCurrentPlayerReady = players.find((player) => player.id === currentUserID)?.ready
    const isAllPlayersReady = players.every((player) => (player.ready || player.id === leaderUserID))

    let readyBtnToggler
    if (leaderUserID !== currentUserID) {
        if (!isCurrentPlayerReady) {
            readyBtnToggler = 
            <Button 
                variant='success' 
                onClick={() => socket.emit('player-ready', currentUserID)}
            >
                Estou pronto
            </Button>
        } else {
            readyBtnToggler = 
            <Button 
                variant='danger' 
                onClick={() => socket.emit('player-unready', currentUserID)}
            >
                Não estou pronto
            </Button>
        }
    }

    return (
        <div className={(show) ? ('') : ('d-none')}>
            <CopyCodeForm title='Código da partida' copyValue={gameCode} />

            <CopyCodeForm title='Link da partida' copyValue={`${serverURL}${process.env.PUBLIC_URL}/${gameCode}`} />

            <PlayersContainer title='Jogadores' containerClassName={'mt-5'}>
                {players.map((player) => (
                    <div className='col' key={player.id}>
                        <PlayerCard 
                            username={player.username}
                            leader={leaderUserID === player.id}
                            score={player.score}
                            ready={player.ready}
                            isCurrentUser={currentUserID === player.id}
                        />
                    </div>
                ))}
            </PlayersContainer>
            
            <Container className='justify-content-center mt-5'>
                <Row className='justify-content-center'>
                    <div className='col col-10 col-sm-8 col-md-6 col-lg-4 d-grid'>
                        {leaderUserID === currentUserID && 
                                <Button 
                                    onClick={() => (socket.emit('match-start'))} 
                                    variant="success"
                                    disabled={!isAllPlayersReady}
                                >
                                    Começar partida
                                </Button>
                        }
                        {readyBtnToggler}

                        <Button
                            onClick={() => setShowConfigModal(true)}
                            variant="info"
                        >
                            Configurações
                        </Button>
                    </div>
                </Row>
            </Container>

            <ConfigModal
                show={showConfigModal}
                setShow={setShowConfigModal}
                
                socket={socket}
                currentUserID={currentUserID}
            />
        </div>
    )
}