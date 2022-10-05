
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Place from '../../interfaces/PlaceInterface'
import ModalProperties from '../../interfaces/ModalProperties'
import Category from '../../interfaces/CategoryInterface'
import Role from '../../interfaces/RoleInterface';
import Spinner from 'react-bootstrap/Spinner'
import { category2CategoryOption, getCategoryById, getRoleById, getPlaceById, role2RoleOption } from '../../utils/utils';
import { serverURL } from '../../utils/configs';
import { useState } from 'react';
import PlaceCardPreview from '../PlaceCardPreview';
import axios from 'axios'
import CreatableSelect from 'react-select/creatable';

var currentFile: File|null = null


interface ModalPlaceProps {
    modalPlaceProperties: ModalProperties<Place>,
    setModalPlaceProperties: React.Dispatch<React.SetStateAction<ModalProperties<Place>>>,
    setPlaces: React.Dispatch<React.SetStateAction<Place[]>>,
    places: Place[],
    categories: Category[],
    roles: Role[]
}

export default function ModalPlace({modalPlaceProperties, setModalPlaceProperties, setPlaces, places, categories, roles}: ModalPlaceProps) {

    var newRoles: string[] = []
    var newCategories: string[] = []

    const [loading, setLoading] = useState(false)
    const {show, type, currentValue} = modalPlaceProperties
    const place = currentValue
    const handleClose = () => setModalPlaceProperties({...modalPlaceProperties, show: false})
    const handleError = (error: any) => {
        console.error(error)
        alert('Ocorreu um erro ! Olhar o console para mais informações')
        setLoading(false)
    }

    const createPlace = () => {
        const formData = new FormData()
        formData.append('name', place.name)
        formData.append('rolesIds', JSON.stringify(place.rolesIds))
        formData.append('categoriesIds', JSON.stringify(place.categoriesIds))
        if (place.imgPath && currentFile) {
            formData.append('placeImg', currentFile)
        }

        axios.post(`${serverURL}/places`, formData)
        .then((response) => {
            setPlaces([...places, {...place, id: response.data.id}])

            setLoading(false)
            handleClose()
        })
        .catch(handleError)
    }

    const updatePlace = () => {
        const formData = new FormData()
        formData.append('name', place.name)
        formData.append('rolesIds', JSON.stringify(place.rolesIds))
        formData.append('categoriesIds', JSON.stringify(place.categoriesIds))
        if (place.imgPath && currentFile) {
            formData.append('placeImg', currentFile)
        }

        axios.put(`${serverURL}/places/${place.id}`, formData)
        .then((response) => {
            let placeIndex = places.findIndex((placeParam) => (placeParam.id === place.id))
            places[placeIndex] = place
            setPlaces([...places])

            setLoading(false)
            handleClose()
        })
        .catch(handleError)
    }

    const deletePlace = () => {
        axios.delete(`${serverURL}/places/${place.id}`)
        .then((response) => {
            setPlaces(places.filter((placeParam) => place !== placeParam))

            setLoading(false)
            handleClose()
        })
        .catch(handleError)
    }

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
            <Modal.Header closeButton={!loading}>
                <Modal.Title>
                    {titleMap[type]}
                </Modal.Title>
            </Modal.Header>
            {(!loading) ? (
            <>
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
                                        currentFile = files[0]
                                        place.imgPath = URL.createObjectURL(currentFile)
                                        setModalPlaceProperties({...modalPlaceProperties, currentValue: place})
                                    } else {
                                        currentFile = null
                                        delete place.imgPath
                                        setModalPlaceProperties({...modalPlaceProperties, currentValue: place})
                                    }
                                }}
                                accept="image/*"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Cargos</Form.Label>
                            <CreatableSelect
                                isMulti
                                options={roles.map(role2RoleOption)}
                                defaultValue={place.rolesIds.map((roleId) => role2RoleOption(getRoleById(roleId, roles)))}
                                onChange={(rolesOptions) => {
                                    newRoles = rolesOptions.filter((roleOption) => (Object.hasOwn(roleOption, '__isNew__')))
                                                           .map((roleOption) => (roleOption.label))
                                    place.rolesIds = rolesOptions.filter((roleOption) => (!Object.hasOwn(roleOption, '__isNew__')))
                                                                 .map((roleOption) => (roleOption.value))
                                }}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                placeholder=""
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Categorias</Form.Label>
                            <CreatableSelect
                                isMulti
                                options={categories.map(category2CategoryOption)}
                                defaultValue={place.categoriesIds.map((categoryId) => category2CategoryOption(getCategoryById(categoryId, categories)))}
                                onChange={(categoriesOptions) => {
                                    newCategories = categoriesOptions
                                                    .filter((categoryOption) => (Object.hasOwn(categoryOption, '__isNew__')))
                                                    .map((categoryOption) => (categoryOption.label))
                                    place.categoriesIds = categoriesOptions
                                                          .filter((categoryOption) => (!Object.hasOwn(categoryOption, '__isNew__')))
                                                          .map((categoryOption) => (categoryOption.value))
                                    
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
                                createPlace()
                            } else if (type === 'update') {
                                updatePlace()
                            } else if (type === 'delete') {
                                deletePlace()
                            }
                            setLoading(true)
                        }}
                    >
                        {btnLabelMap[type]}
                    </Button>
                </Modal.Footer>
            </>) :
            (
                <Modal.Body>
                    <div className='text-center'>
                        <Spinner
                            animation="border" 
                            variant="primary" 
                        />
                    </div>
                </Modal.Body>
            )}
        </Modal>
    )
}
