import PlayerCard from "../PlayerCard";
import PlayersContainer from "../PlayersContainer";
import Player from '../../interfaces/PlayerInterface'
import classNames from "classnames";
import { Button, Container, Form, InputGroup, Row } from "react-bootstrap";
import { FaRegCopy } from 'react-icons/fa'
import { Socket } from "socket.io-client";

interface LobbyPageInterface {
    currentUserID: string,
    players: Player[],
    show?: boolean,
    gameCode: string,
    leaderUserID: string,
    socket: Socket
}

export default function LobbyPage({players, currentUserID, show, gameCode, leaderUserID, socket}: LobbyPageInterface) {

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
            <div style={{maxWidth: "350px", margin: "auto"}}>
                <Form.Group>
                    <Form.Label as='h6'>Código da partida</Form.Label>
                    <InputGroup className="mb-3">
                        <Form.Control
                            readOnly={true}
                            value={gameCode}
                        />
                        <Button variant="outline-secondary" onClick={() => {navigator.clipboard.writeText(gameCode)}}>
                            <FaRegCopy />
                        </Button>
                    </InputGroup>
                </Form.Group>
            </div>

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
                </Row>
            </Container>
        </div>
    )
}