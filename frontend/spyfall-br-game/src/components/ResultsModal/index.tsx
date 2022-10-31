import React, { useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import Place from '../../interfaces/PlaceInterface'
import Player from '../../interfaces/PlayerInterface'
import PlaceCard from '../PlaceCard';
import PlayerCard from '../PlayerCard'


interface ResultsModalInterface {
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
    winner?: "spy"|"agents",
    winDescripton?: string,
    selectedPlace?: Place,
    spy?: Player
}

export default function ResultsModal({show, setShow, winner, winDescripton, selectedPlace, spy}: ResultsModalInterface) {
    const handleClose = () => setShow(false);

    let winText = ''
    if (winner) {
        winText = (winner === 'spy') ? ('O espião ganhou') : ('Os agentes ganharam') 
    }

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Resultado da partida</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='mb-5'>
                    <h2 className='text-center'>
                        {winText}
                    </h2>
                    <p className='text-center h5'>
                        {winDescripton}
                    </p>
                </div>
                <div className='mb-5'>
                    <h3 className='text-center'>O local selecionado era:</h3>
                    {(selectedPlace) &&
                        <PlaceCard
                            title={selectedPlace.name}
                            imgURL={selectedPlace.imgPath}
                            type='selected'
                        />
                    }
                </div>
                <div className='mb-3'>
                    <h3 className='text-center'>O espião era:</h3>
                    {(spy) &&
                        <PlayerCard
                            username={spy.username}
                            score={spy.score}
                        />
                    }
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}