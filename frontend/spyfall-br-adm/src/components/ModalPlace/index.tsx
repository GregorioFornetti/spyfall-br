
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Place from '../../interfaces/PlaceInterface'
import Select from 'react-select'
import ModalProperties from '../../interfaces/ModalProperties'
import Category from '../../interfaces/CategoryInterface'
import Role from '../../interfaces/RoleInterface';
import { category2CategoryOption, getCategoryById, getRoleById, getPlaceById, role2RoleOption } from '../../utils/utils';
import { useState } from 'react';
import PlaceCardPreview from '../PlaceCardPreview';


interface ModalPlaceProps {
    modalPlaceProperties: ModalProperties<Place>,
    setModalPlaceProperties: React.Dispatch<React.SetStateAction<ModalProperties<Place>>>,
    setPlaces: React.Dispatch<React.SetStateAction<Place[]>>,
    places: Place[],
    categories: Category[],
    roles: Role[]
}

export default function ModalPlace({modalPlaceProperties, setModalPlaceProperties, setPlaces, places, categories, roles}: ModalPlaceProps) {

    const {show, type, currentValue} = modalPlaceProperties
    const place = currentValue
    const handleClose = () => setModalPlaceProperties({...modalPlaceProperties, show: false})

    const titleMap = {
        create: 'Criando novo local',
        update: 'Editando local',
        delete: `Deletar o local "${place.name}" ?`
    }
    const btnLabelMap = {
        create: 'Criar local',
        update: 'Salvar local',
        delete: 'Deletar local'
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {titleMap[type]}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {type === 'delete' &&
                    <p>Deseja mesmo excluir "{place.name}" ?</p>
                }

                {(type === 'create' || type === 'update') && 
                <>
                    <Form.Group className="mb-3">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control 
                            type="text"
                            onChange={(event) => {
                                place.name = event.target.value
                                setModalPlaceProperties({...modalPlaceProperties, currentValue: place})
                            }}
                            value={place.name}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Imagem</Form.Label>
                        <Form.Control 
                            type="file"
                            onChange={(event) => {
                                const files = (event.target as HTMLInputElement).files
                                if (files && files.length !== 0) {
                                    const currentFile = files[0]
                                    place.imgPath = URL.createObjectURL(currentFile)
                                    setModalPlaceProperties({...modalPlaceProperties, currentValue: place})
                                } else {
                                    delete place.imgPath
                                    setModalPlaceProperties({...modalPlaceProperties, currentValue: place})
                                }
                            }}
                            accept="image/*"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Cargos</Form.Label>
                        <Select
                            isMulti
                            options={roles.map(role2RoleOption)}
                            defaultValue={place.rolesIds.map((roleId) => role2RoleOption(getRoleById(roleId, roles)))}
                            onChange={(rolesOptions) => {
                                place.rolesIds = rolesOptions.map((roleOption) => (roleOption.value))
                            }}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder=""
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Categorias</Form.Label>
                        <Select
                            isMulti
                            options={categories.map(category2CategoryOption)}
                            defaultValue={place.categoriesIds.map((categoryId) => category2CategoryOption(getCategoryById(categoryId, categories)))}
                            onChange={(categoriesOptions) => {
                                place.categoriesIds = categoriesOptions.map((categoryOption) => (categoryOption.value))
                            }}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder=""
                        />
                    </Form.Group>

                </>
                }

                <hr/>

                <PlaceCardPreview
                    imgURL={place.imgPath}
                    title={place.name}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Fechar
                </Button>
                <Button 
                    variant={(type === 'delete') ? ('danger') : ('primary')}
                    onClick={() => {
                        if (type === 'create') {
                            createPlace(place, places, setPlaces)
                        } else if (type === 'update') {
                            updatePlace(place, places, setPlaces)
                        } else if (type === 'delete') {
                            deletePlace(place, places, setPlaces)
                        }
                        handleClose()
                    }}
                >
                    {btnLabelMap[type]}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}


function createPlace(currentPlace: Place, places: Place[], setPlaces: React.Dispatch<React.SetStateAction<Place[]>>) {
    // Para atualizar o frontend
    // OBS IMPORTANTE: é preciso pegar o id novo do backend depois que retornar...
    setPlaces([...places, currentPlace])
}

function updatePlace(currentPlace: Place, places: Place[], setPlaces: React.Dispatch<React.SetStateAction<Place[]>>) {
    // Para atualizar o frontend
    let placeIndex = places.findIndex((placeParam) => (placeParam.id === currentPlace.id))
    places[placeIndex] = currentPlace
    setPlaces([...places])
}

function deletePlace(currentPlace: Place, places: Place[], setPlaces: React.Dispatch<React.SetStateAction<Place[]>>) {
    // Para atualizar o frontend
    setPlaces(places.filter((placeParam) => currentPlace !== placeParam))
}