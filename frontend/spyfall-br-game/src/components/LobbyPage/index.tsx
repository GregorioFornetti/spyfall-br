import PlayerCard from "../PlayerCard";
import PlayersContainer from "../PlayersContainer";
import Player from '../../interfaces/PlayerInterface'
import classNames from "classnames";
import { Button, Form, InputGroup } from "react-bootstrap";
import { FaRegCopy } from 'react-icons/fa'

interface LobbyPageInterface {
    currentUserID: string,
    players: Player[],
    show?: boolean,
    gameCode: string,
    leaderUserID: string
}

export default function LobbyPage({players, currentUserID, show, gameCode, leaderUserID}: LobbyPageInterface) {
    return (
        <>
            <div style={{maxWidth: "350px", margin: "auto"}} className={(show) ? ('') : ('d-none')}>
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

            <PlayersContainer title='Jogadores' containerClassName={classNames('mt-5', {'d-none': !show})}>
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
        </>
    )
}