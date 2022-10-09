import React from 'react';
import { io } from "socket.io-client"
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import RootContainer from './components/RootContainer';
import UserCard from './components/UserCard';

const socket = io("http://192.168.56.1:3000")

socket.on("hello", (arg) => {
  console.log(arg)
})

socket.emit('teste', 'ola')

function App() {
  return (
    <Container>
      <RootContainer title='Jogadores'>
        <UserCard username='Greg' leader={true} score={10}/>
        <UserCard username='Felean' leader={false} score={10}/>
      </RootContainer>
    </Container>
  );
}

export default App;
