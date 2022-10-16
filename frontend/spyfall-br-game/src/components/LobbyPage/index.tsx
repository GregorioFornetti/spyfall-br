import PlayerCard from "../PlayerCard";
import PlayersContainer from "../PlayersContainer";
import Player from '../../interfaces/PlayerInterface'
import classNames from "classnames";
import { Button, Form, InputGroup } from "react-bootstrap";
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
                {players.map((user) => (
                    <div className='col' key={user.id}>
                        <PlayerCard 
                            username={user.username}
                            leader={leaderUserID === user.id}
                            score={user.score} 
                            isCurrentUser={currentUserID === user.id}
                        />
                    </div>
                ))}
            </PlayersContainer>

            <Button 
                onClick={() => (socket.emit('match-start'))} 
                variant="success"
                className='m-auto'
            >
                Começar partida
            </Button>
        </div>
    )
}