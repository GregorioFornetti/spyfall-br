import React, { useEffect, useState } from 'react';
import { Card, Container, Form, Row } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Socket } from "socket.io-client";
import NumberInput from './NumberInput';
import InputsContainer from './InputsContainer';
import MultiSelect, { Option } from '../../Multiselect';
import Place from '../../../interfaces/PlaceInterface';
import Category from '../../../interfaces/CategoryInterface';
import PlaceCard from '../../PlaceCard';
import Config from '../../../interfaces/ConfigInterface';
import PlaceSelector from './PlacesSelector';


interface ConfigModalProps {
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
    socket: Socket,
    currentUserID: string,
    leaderUserID: string,
    places: Place[],
    categories: Category[],
    config: Config,
    setConfig: React.Dispatch<React.SetStateAction<Config>>
}

export default function ConfigModal({show, setShow, socket, currentUserID, leaderUserID, places, categories, config, setConfig}: ConfigModalProps) {

    const options = categories.map((category) => ({value: category.id, label: category.name}))
    const [selectedCategories, setSelectedCategories] = useState<any>([]);
    const [loading, setLoading] = useState(false);
    const handleClose = () => setShow(false);
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (config.selectedPlacesIds.length < 2) {
            alert('Selecione pelo menos 2 lugares para jogar.')
            return
        }
        socket.emit('set-new-config', config)
        console.log(config)
        setLoading(true)
    }

    useEffect(() => {
        // Essa função atualizará as categorias selecionadas de acordo com os lugares selecionados
        // É necessário fazer isso sempre que os lugares selecionados forem alterados

        const selectedCategories: any = {}  // Objeto no seguinte padrão: {<id_categoria>: boolean - true se todos os lugares dessa categoria estiverem selecionados, false caso contrário}

        // Inicialmente todas as categorias estão selecionadas
        for (let category of categories) {
            selectedCategories[category.id] = true
        }

        // Todo lugar não selecionado, desmarca as categorias dele
        for (let place of places) {
            if (!config.selectedPlacesIds.includes(place.id)) {
                for (let categoryId of place.categoriesIds) {
                    selectedCategories[categoryId] = false
                }
            }
        }

        const selectedCategoriesIds = Object.keys(selectedCategories).filter((categoryId) => selectedCategories[categoryId])
        setSelectedCategories(options.filter((option) => selectedCategoriesIds.includes(option.value.toString())))
    }, [config.selectedPlacesIds, categories])

    useEffect(() => {
        socket.on('config-success', () => {
            alert('Configurações salvas com sucesso!')
            setLoading(false)
        })

        socket.on('config-error', (error: any) => {
            alert('Ocorreu um erro ao salvar novas configurações. Verifique o console para mais detalhes.')
            console.log(error)
            setLoading(false)
        })
    }, [])

    return (
        <Modal show={show} onHide={handleClose} size='xl' centered>
            <Modal.Header closeButton={!loading}>
                <Modal.Title>Configurações</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {loading
                    ?
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                    :
                    <>
                    <InputsContainer title='Configurações de pontuação'>
                        <Row xl={3} lg={2} sm={1} className='gy-3'>
                            <NumberInput
                                name='nonSpyVictoryScore'
                                tooltipText='Pontuação recebida por todos os não espiões caso eles ganhem.'
                                labelText='Vitória não espiões'
                                config={config}
                                setConfig={setConfig}
                                min={0}
                                disabled={leaderUserID !== currentUserID}
                                disabledTooltipText='Apenas o líder pode alterar essa configuração.'
                            />
                            <NumberInput
                                name='nonSpyAcusatorScore'
                                tooltipText='Pontuação extra recebida pelo acusador caso o espião seja corretamente identificado.'
                                labelText='Acusador não espiões'
                                config={config}
                                setConfig={setConfig}
                                min={0}
                                disabled={leaderUserID !== currentUserID}
                                disabledTooltipText='Apenas o líder pode alterar essa configuração.'
                            />
                            <NumberInput
                                name='timeFinishedScore'
                                tooltipText='Pontuação que o espião recebe caso o tempo acabe.'
                                labelText='Tempo acabou'
                                config={config}
                                setConfig={setConfig}
                                min={0}
                                disabled={leaderUserID !== currentUserID}
                                disabledTooltipText='Apenas o líder pode alterar essa configuração.'
                            />
                            <NumberInput
                                name='wrongAcusationScore'
                                tooltipText='Pontuação que o espião recebe caso um não espião seja julgado incorretamente.'
                                labelText='Acusação incorreta'
                                config={config}
                                setConfig={setConfig}
                                min={0}
                                disabled={leaderUserID !== currentUserID}
                                disabledTooltipText='Apenas o líder pode alterar essa configuração.'
                            />
                            <NumberInput
                                name='correctPlaceScore'
                                tooltipText='Pontuação que o espião recebe caso ele acerte o lugar.'
                                labelText='Adivinhação correta'
                                config={config}
                                setConfig={setConfig}
                                min={0}
                                disabled={leaderUserID !== currentUserID}
                                disabledTooltipText='Apenas o líder pode alterar essa configuração.'
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
                                disabled={leaderUserID !== currentUserID}
                                disabledTooltipText='Apenas o líder pode alterar essa configuração.'
                            />
                        </Row>

                        <PlaceSelector
                            categories={categories}
                            places={places}
                            config={config}
                            setConfig={setConfig}
                            disabled={leaderUserID !== currentUserID}
                        />
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
                                max={60}
                                disabled={leaderUserID !== currentUserID}
                                disabledTooltipText='Apenas o líder pode alterar essa configuração.'
                            />
                        </Row>
                    </InputsContainer>
                    </>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button disabled={loading} variant="secondary" onClick={handleClose}>
                        Fechar
                    </Button>
                    <Button disabled={loading || currentUserID !== leaderUserID} variant="primary" type='submit'>
                        Salvar
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}