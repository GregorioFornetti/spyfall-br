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
import Place from '../../interfaces/PlaceInterface';
import Category from '../../interfaces/CategoryInterface';
import Config from '../../interfaces/ConfigInterface';

interface LobbyPageInterface {
    currentUserID: string,
    players: Player[],
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
    show?: boolean,
    gameCode: string,
    leaderUserID: string,
    socket: Socket,
    serverURL: string,
    places: Place[],
    categories: Category[],
    config: Config,
    setConfig: React.Dispatch<React.SetStateAction<Config>>
}

export default function LobbyPage({players, setPlayers, currentUserID, show, gameCode, leaderUserID, socket, serverURL, places, categories, config, setConfig}: LobbyPageInterface) {

    const [showConfigModal, setShowConfigModal] = useState(false)

    const currentPlayer = players.find((player) => player.id === currentUserID)
    const isCurrentPlayerReady = currentPlayer?.ready
    const isAllPlayersReady = players.every((player) => (player.ready || player.id === leaderUserID))

    let readyBtnToggler
    if (leaderUserID !== currentUserID) {
        if (!isCurrentPlayerReady) {
            readyBtnToggler = 
            <Button 
                variant='success' 
                onClick={() => {
                    socket.emit('player-ready', currentUserID)
                    if (currentPlayer) {
                        currentPlayer.ready = true
                        setPlayers([...players])
                    }
                }}
            >
                Estou pronto
            </Button>
        } else {
            readyBtnToggler = 
            <Button 
                variant='danger' 
                onClick={() => {
                    socket.emit('player-unready', currentUserID)
                    if (currentPlayer) {
                        currentPlayer.ready = false
                        setPlayers([...players])
                    }
                }}
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

                        
                    </div>
                    <div className='col col-10 col-sm-8 col-md-6 col-lg-4 d-grid mt-md-0 mt-3'>
                        <Button
                            onClick={() => setShowConfigModal(true)}
                            variant="primary"
                        >
                            Configurações
                        </Button>
                    </div>
                </Row>
            </Container>

            <ConfigModal
                show={showConfigModal}
                setShow={setShowConfigModal}
                leaderUserID={leaderUserID}

                socket={socket}
                currentUserID={currentUserID}
                places={places}
                categories={categories}

                config={config}
                setConfig={setConfig}
            />
        </div>
    )
}