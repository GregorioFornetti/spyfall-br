import React from 'react';
import { io } from "socket.io-client"
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


import UserCard from './components/UserCard';
import UsersContainer from './components/UsersContainer'
import PlacesContainer from './components/PlacesContainer';
import PlaceCard from './components/PlaceCard';

const socket = io("http://192.168.56.1:3000")

socket.on("hello", (arg) => {
  console.log(arg)
})

socket.emit('teste', 'ola')

function App() {
  const inGame = true
  return (
    <Container>
      <UsersContainer title='Jogadores'>
        <div className='col'>
          <UserCard username='AAAAAAAAAAAAAAA' leader={true} score={10} isCurrentUser={true} inGame={inGame}/>
        </div>
        <div className='col'>
          <UserCard username='AAAAAAAAAAAAAAA' leader={false} score={10} isCurrentUser={false} inGame={inGame}/>
        </div>
        <div className='col'>
          <UserCard username='AAAAAAAAAAAAAAA' leader={false} score={10} isCurrentUser={false} inGame={inGame}/>
        </div>
        <div className='col'>
          <UserCard username='AAAAAAAAAAAAAAA' leader={false} score={10} isCurrentUser={false} inGame={inGame}/>
        </div>
      </UsersContainer>

      <PlacesContainer title='Lugares' containerClassName='mt-5'>
        <div className='col'>
          <PlaceCard title='lugar' inGame={inGame} />
        </div>
        <div className='col'>
          <PlaceCard title='lugar' inGame={inGame} />
        </div>
        <div className='col'>
          <PlaceCard title='lugar' inGame={inGame} />
        </div>
        <div className='col'>
          <PlaceCard title='lugar' inGame={inGame} />
        </div>
      </PlacesContainer>
    </Container>
  );
}

export default App;
