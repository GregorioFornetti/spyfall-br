import React from 'react';
import { io } from "socket.io-client"
import { Card, Container, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import PlayerCard from '../PlayerCard';
import UsersContainer from '../PlayersContainer'
import PlacesContainer from '../PlacesContainer';
import PlaceCard from '../PlaceCard';

import Place from '../../interfaces/PlaceInterface'
import Player from '../../interfaces/PlayerInterface'
import Role from '../../interfaces/RoleInterface'


interface GamePageProps {
    isSpy?: boolean,
    selectedPlace?: Place,
    playerRole: Role,
    possiblePlaces: Place[],
    players: Player[]
}


export default function GamePage() {
    const inGame = true

    return (
        <Container className={'d-none'}>
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
              <PlayerCard 
                username='AAAAAAAAAAAAAAA' 
                leader
                score={10} 
                isCurrentUser
                inGame={inGame}
                asking
              />
            </div>
            <div className='col'>
              <PlayerCard 
                username='AAAAAAAAAAAAAAA'  
                score={10} 
                inGame={inGame}
                target
              />
            </div>
            <div className='col'>
              <PlayerCard 
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
              <PlayerCard 
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