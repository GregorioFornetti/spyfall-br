import React, { useState } from 'react';
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
import AccuseModal from './AccuseModal';
import VoteModal from './VoteModal';
import GuessModal from './GuessModal';
import QuestionModal from './QuestionModal';


interface GamePageProps {
    show?: boolean,
    isSpy?: boolean,
    selectedPlace?: Place,
    playerRole?: Role,
    possiblePlaces: Place[],
    players: Player[],
    currentUserID: string,
    leaderUserID: string,
    askingUserID: string,
    targetUserID?: string
}


export default function GamePage({show, isSpy, selectedPlace, playerRole, possiblePlaces, players, currentUserID, leaderUserID, askingUserID, targetUserID}: GamePageProps) {

    const [showAccuseModal, setShowAccuseModal] = useState(false)
    const [showVoteModal, setShowVoteModal] = useState(false)
    const [showGuessModal, setShowGuessModal] = useState(false)
    const [showQuestionModal, setShowQuestionModal] = useState(false)

    return (
        <>
          <Container className={(!show) ? ('d-none') : ('')}>
            <Container fluid>
      
              <Card className='text-center m-auto' style={{width: '340px'}}>
                <Card.Header className='h4'>{(!isSpy) ? ('Lugar selecionado') : ('Você é o espião')}</Card.Header>
                <Card.Body>
                  <PlaceCard
                    title={(selectedPlace) ? (selectedPlace.name) : ('Espião')}
                    type='selected'
                    imgURL={(selectedPlace) ? (selectedPlace.imgPath) : (undefined)}
                  />
                  {playerRole &&
                    <p className='h5'>Cargo: {playerRole.name}</p>
                  }
                </Card.Body>
              </Card>
      
      
              <div className="d-grid gap-3 col-10 col-sm-9 col-md-8 col-lg-6 col-xl-4 m-auto mt-5">
                <button 
                  className="btn btn-primary" 
                  type="button"
                  onClick={() => setShowAccuseModal(true)}
                >
                  Acusar
                </button>
                <button 
                  className="btn btn-primary" 
                  type="button"
                  onClick={() => setShowQuestionModal(true)}
                >
                  Questionar
                </button>
                <button 
                  className="btn btn-primary" 
                  type="button"
                  onClick={() => setShowGuessModal(true)}
                >
                  Adivinhar lugar
                </button>
              </div>
            </Container>
      
            <UsersContainer title='Jogadores' containerClassName='mt-5'>
              {players.map((player) => (
                <div className='col' key={player.id}>
                  <PlayerCard 
                    username={player.username}
                    leader={player.id === leaderUserID}
                    score={player.score} 
                    isCurrentUser={player.id === currentUserID}
                    asking={player.id === askingUserID}
                    target={player.id === targetUserID}
                    inGame
                  />
                </div>
              ))}
            </UsersContainer>
      
            <PlacesContainer title='Lugares' containerClassName='mt-5'>
              {possiblePlaces.map((place) => (
                <div className='col' key={place.id}>
                  <PlaceCard title={place.name} imgURL={place.imgPath} type={'markable'} />
                </div>
              ))}
            </PlacesContainer>
          </Container>

          <AccuseModal
            show={showAccuseModal}
            setShow={setShowAccuseModal}

            players={players}
            currentUserID={currentUserID}
          />

          <VoteModal
            show={showVoteModal}
            setShow={setShowVoteModal}
          />

          <GuessModal
            show={showGuessModal}
            setShow={setShowGuessModal}
          />

          <QuestionModal
            show={showQuestionModal}
            setShow={setShowQuestionModal}
          />
        </>
      );
}