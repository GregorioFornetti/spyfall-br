import UserCard from "../UserCard";
import UsersContainer from "../UsersContainer";
import User from '../../interfaces/UserInterface'
import classNames from "classnames";
import { Button, Form, InputGroup } from "react-bootstrap";
import { FaRegCopy } from 'react-icons/fa'

interface LobbyPageInterface {
    currentUserID: string,
    users: User[],
    show?: boolean,
    roomCode: string
}

export default function LobbyPage({users, currentUserID, show, roomCode}: LobbyPageInterface) {
    return (
        <>
            <div style={{maxWidth: "350px", margin: "auto"}}>
                <Form.Group>
                    <Form.Label as='h6'>Código da partida</Form.Label>
                    <InputGroup className="mb-3">
                        <Form.Control
                            readOnly={true}
                            value={roomCode}
                        />
                        <Button variant="outline-secondary" onClick={() => {navigator.clipboard.writeText(roomCode)}}>
                            <FaRegCopy />
                        </Button>
                    </InputGroup>
                </Form.Group>
            </div>

            <UsersContainer title='Jogadores' containerClassName={classNames('mt-5', {'d-none': !show})}>
                {users.map((user) => (
                    <div className='col' key={user.id}>
                        <UserCard 
                            username={user.username}
                            leader={user.leader}
                            score={user.score} 
                            isCurrentUser={currentUserID === user.id}
                        />
                    </div>
                ))}
            </UsersContainer>
        </>
    )
}