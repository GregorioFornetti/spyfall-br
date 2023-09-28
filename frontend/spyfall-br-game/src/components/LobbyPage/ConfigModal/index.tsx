import React, { useState } from 'react';
import { Card, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Socket } from "socket.io-client";
import NumberInput from './NumberInput';
import InputsContainer from './InputsContainer';
import PlacesContainer from '../../PlacesContainer';
import MultiSelect from '../../Multiselect';
import Place from '../../../interfaces/PlaceInterface';
import Category from '../../../interfaces/CategoryInterface';
import PlaceCard from '../../PlaceCard';
import Config from '../../../interfaces/ConfigInterface';


interface ConfigModalProps {
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
    socket: Socket,
    currentUserID: string,
    places: Place[],
    categories: Category[],
    config: Config,
    setConfig: React.Dispatch<React.SetStateAction<Config>>
}

export default function ConfigModal({show, setShow, socket, currentUserID, places, categories, config, setConfig}: ConfigModalProps) {

    const [selectedPlaces, setSelectedPlaces] = useState([]);
    const handleClose = () => setShow(false);
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        console.log(formData.get('nonSpyVictoryScore'))
    }


    return (
        <Modal show={show} onHide={handleClose} size='xl' centered>
            <Modal.Header closeButton>
                <Modal.Title>Configurações</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <InputsContainer title='Configurações de pontuação'>
                        <Row xl={3} lg={2} sm={1} className='gy-3'>
                            <NumberInput
                                name='nonSpyVictoryScore'
                                tooltipText='Pontuação recebida por todos os não espiões caso eles ganhem.'
                                labelText='Vitória não espiões'
                                config={config}
                                setConfig={setConfig}
                                min={0}
                            />
                            <NumberInput
                                name='nonSpyAcusatorScore'
                                tooltipText='Pontuação extra recebida pelo acusador caso o espião seja corretamente identificado.'
                                labelText='Acusador não espiões'
                                config={config}
                                setConfig={setConfig}
                                min={0}
                            />
                            <NumberInput
                                name='timeFinishedScore'
                                tooltipText='Pontuação que o espião recebe caso o tempo acabe.'
                                labelText='Tempo acabou'
                                config={config}
                                setConfig={setConfig}
                                min={0}
                            />
                            <NumberInput
                                name='wrongAcusationScore'
                                tooltipText='Pontuação que o espião recebe caso um não espião seja julgado incorretamente.'
                                labelText='Acusação incorreta'
                                config={config}
                                setConfig={setConfig}
                                min={0}
                            />
                            <NumberInput
                                name='correctPlaceScore'
                                tooltipText='Pontuação que o espião recebe caso ele acerte o lugar.'
                                labelText='Adivinhação correta'
                                config={config}
                                setConfig={setConfig}
                                min={0}
                            />
                        </Row>
                    </InputsContainer>

                    <InputsContainer title='Configurações de lugares'>
                        <Row xl={3} lg={2} sm={1} className='gy-3'>
                            <NumberInput
                                name='qntSelectedPlaces'
                                tooltipText='Quantidade de lugares que serão selecionados aleatoriamente (dentro dos lugares selecionados) para a partida.'
                                labelText='Quantidade de lugares'
                                config={config}
                                setConfig={setConfig}
                                min={1}
                            />
                        </Row>

                        <Container className='mt-4'>
                            <Card>
                                <Card.Header className={'text-center'}>
                                    <h3 className="h5">Lugares selecionados</h3>
                                    <MultiSelect
                                        options={[
                                            {value: '1', label: '1'},
                                            {value: '2', label: '2'},
                                            {value: '3', label: '3'}
                                        ]}
                                        selected={selectedPlaces}
                                        setSelected={setSelectedPlaces}
                                        title='Selecionar por categorias'
                                    />
                                </Card.Header>
                                <Card.Body style={{height: '470px', overflowY: 'scroll'}}>
                                    <Container>
                                        <Row xl={3} lg={2} sm={1} className="gy-4">
                                            {places
                                            .filter((place) => config.selectedPlacesIds.includes(place.id))
                                            .map((place) => (
                                                <PlaceCard
                                                    type='option'
                                                    title={place.name}
                                                    key={place.id}
                                                    imgURL={place.imgPath}
                                                    onClick={() => {
                                                        config.selectedPlacesIds = config.selectedPlacesIds.filter((id) => id !== place.id);
                                                        setConfig({...config}); 
                                                    }}
                                                />
                                            ))}
                                        </Row>
                                    </Container>
                                </Card.Body>
                            </Card>
                        </Container>


                        <Container className='mt-4'>
                            <Card>
                                <Card.Header className={'text-center'}>
                                    <h3 className="h5">Lugares não selecionados</h3>
                                </Card.Header>
                                <Card.Body style={{height: '470px', overflowY: 'scroll'}}>
                                    <Container>
                                        <Row xl={3} lg={2} sm={1} className="gy-4">
                                            {places
                                            .filter((place) => !config.selectedPlacesIds.includes(place.id))
                                            .map((place) => (
                                                <PlaceCard
                                                    type='option'
                                                    title={place.name}
                                                    key={place.id}
                                                    imgURL={place.imgPath}
                                                    onClick={() => {
                                                        config.selectedPlacesIds.push(place.id);
                                                        setConfig({...config}); 
                                                    }}
                                                />
                                            ))}
                                        </Row>
                                    </Container>
                                </Card.Body>
                            </Card>
                        </Container>
                    </InputsContainer>

                    <InputsContainer title='Configurações de tempo'>
                        <Row xl={3} lg={2} sm={1} className='gy-3'>
                            <NumberInput
                                name='roundMaxTime'
                                tooltipText='Tempo máximo de rodada em minutos. Acabou esse tempo é vitória do espião.'
                                labelText='Tempo máximo de rodada'
                                config={config}
                                setConfig={setConfig}
                                min={1}
                            />
                        </Row>
                    </InputsContainer>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Fechar
                    </Button>
                    <Button variant="primary" type='submit'>
                        Salvar
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}