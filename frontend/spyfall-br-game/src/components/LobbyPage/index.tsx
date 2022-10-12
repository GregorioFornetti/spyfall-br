import UserCard from "../UserCard";
import UsersContainer from "../UsersContainer";
import User from '../../interfaces/UserInterface'

interface LobbyPageInterface {
    currentUserID: string,
    users: User[]
}

export default function LobbyPage({users, currentUserID}: LobbyPageInterface) {
    return (
        <UsersContainer title='Jogadores' containerClassName='mt-5'>
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
    )
}