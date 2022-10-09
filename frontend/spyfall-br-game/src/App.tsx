import React from 'react';
import { io } from "socket.io-client"
import { Card, Container, Row } from 'react-bootstrap';
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
      <Container fluid>

        <Card className='text-center m-auto' style={{width: '340px'}}>
          <Card.Header className='h4'>Lugar selecionado</Card.Header>
          <Card.Body>
            <PlaceCard
              title='lugar'
              type='selected'
            />
            <p className='h5'>Cargo: cozinheiro</p>
          </Card.Body>
        </Card>


        <div className="d-grid gap-3 col-10 col-sm-9 col-md-8 col-lg-6 col-xl-4 m-auto mt-5">
          <button className="btn btn-primary" type="button">Acusar</button>
          <button className="btn btn-primary" type="button">Questionar</button>
          <button className="btn btn-primary" type="button">Adivinhar lugar</button>
        </div>
      </Container>

      <UsersContainer title='Jogadores' containerClassName='mt-5'>
        <div className='col'>
          <UserCard 
            username='AAAAAAAAAAAAAAA' 
            leader
            score={10} 
            isCurrentUser
            inGame={inGame}
            asking
          />
        </div>
        <div className='col'>
          <UserCard 
            username='AAAAAAAAAAAAAAA'  
            score={10} 
            inGame={inGame}
            target
          />
        </div>
        <div className='col'>
          <UserCard 
            username='AAAAAAAAAAAAAAA' 
            leader={false} 
            score={10} 
            isCurrentUser={false} 
            inGame={inGame}
            asking={false}
            target={false}
          />
        </div>
        <div className='col'>
          <UserCard 
            username='AAAAAAAAAAAAAAA' 
            leader={false} 
            score={10} 
            isCurrentUser={false} 
            inGame={inGame}
            asking={false}
            target={false}
          />
        </div>
      </UsersContainer>

      <PlacesContainer title='Lugares' containerClassName='mt-5'>
        <div className='col'>
          <PlaceCard title='lugar' type={'markable'} />
        </div>
        <div className='col'>
          <PlaceCard title='lugar' type={'markable'} />
        </div>
        <div className='col'>
          <PlaceCard title='lugar' type={'markable'} />
        </div>
        <div className='col'>
          <PlaceCard title='lugar' type={'markable'} />
        </div>
      </PlacesContainer>
    </Container>
  );
}

export default App;
