import React from 'react';
import { io } from "socket.io-client"
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


import UserCard from './components/UserCard';
import UsersContainer from './components/UsersContainer';

const socket = io("http://192.168.56.1:3000")

socket.on("hello", (arg) => {
  console.log(arg)
})

socket.emit('teste', 'ola')

function App() {
  return (
    <Container>
      <UsersContainer title='Jogadores'>
        <div className='col'>
          <UserCard username='AAAAAAAAAAAAAAA' leader={true} score={10} isCurrentUser={true}/>
        </div>
        <div className='col'>
          <UserCard username='AAAAAAAAAAAAAAA' leader={false} score={10} isCurrentUser={false}/>
        </div>
        <div className='col'>
          <UserCard username='AAAAAAAAAAAAAAA' leader={false} score={10} isCurrentUser={false}/>
        </div>
        <div className='col'>
          <UserCard username='AAAAAAAAAAAAAAA' leader={false} score={10} isCurrentUser={false}/>
        </div>
      </UsersContainer>
    </Container>
  );
}

export default App;
