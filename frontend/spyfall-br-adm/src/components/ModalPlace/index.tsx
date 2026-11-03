import Place from '../../interfaces/PlaceInterface'
import ModalProperties from '../../interfaces/ModalProperties'
import Category from '../../interfaces/CategoryInterface'
import Role from '../../interfaces/RoleInterface';
import { category2CategoryOption, getCategoryById, getRoleById, role2RoleOption, createEmptyPlace, displayName } from '../../utils/utils';
import { dbPath } from '../../utils/configs';
import { useState } from 'react';
import PlaceCardPreview from '../PlaceCardPreview';
import axios from 'axios'
import CreatableSelect from 'react-select/creatable';
import Modal, { Spinner, PrimaryButton, SecondaryButton, inputClass, labelClass } from '../ui/Modal'

var currentFile: File | null = null
var newRoles: string[] = []
var newCategories: string[] = []
var deleteImage: boolean = false

interface ModalPlaceProps {
    modalPlaceProperties: ModalProperties<Place>,
    setModalPlaceProperties: React.Dispatch<React.SetStateAction<ModalProperties<Place>>>,
    setPlaces: React.Dispatch<React.SetStateAction<Place[]>>,
    places: Place[],
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>,
    categories: Category[],
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>,
    roles: Role[]
}

export default function ModalPlace({ modalPlaceProperties, setModalPlaceProperties, setPlaces, places, categories, roles, setRoles, setCategories }: ModalPlaceProps) {

    const [loading, setLoading] = useState(false)
    const { show, type, currentValue } = modalPlaceProperties
    const place = currentValue
    const handleClose = () => {
        setModalPlaceProperties({ type: 'create', currentValue: createEmptyPlace(), show: false })
        newRoles = []
        newCategories = []
        deleteImage = false
    }
    const handleError = (error: any) => {
        console.error(error)
        alert('Ocorreu um erro ! Olhar o console para mais informações')
        setLoading(false)
    }

    const createNewRoles = async () => {
        return Promise.all(
            newRoles.map((newRole) => (axios.post(`${dbPath}/roles`, { name: { pt: newRole, en: newRole } })))
        )
        .then((responses) => {
            place.rolesIds = place.rolesIds.concat(
                responses.map((response) => (response.data.id))
            )
            setRoles([...roles, ...responses.map((response) => (response.data as Role))])
        })
    }

    const createNewCategories = async () => {
        return Promise.all(
            newCategories.map((newCategory) => (axios.post(`${dbPath}/categories`, { name: { pt: newCategory, en: newCategory } })))
        )
        .then((responses) => {
            place.categoriesIds = place.categoriesIds.concat(
                responses.map((response) => (response.data.id))
            )
            setCategories([...categories, ...responses.map((response) => (response.data as Category))])
        })
    }

    const createPlace = () => {
        Promise.all([createNewCategories(), createNewRoles()])
        .then(() => {
            const formData = new FormData()
            formData.append('name', JSON.stringify(place.name))
            formData.append('rolesIds', JSON.stringify(place.rolesIds))
            formData.append('categoriesIds', JSON.stringify(place.categoriesIds))
            if (place.imgPath && currentFile) {
                formData.append('placeImg', currentFile)
            }

            axios.post(`${dbPath}/places`, formData)
            .then((response) => {
                setPlaces([...places, {...place, id: response.data.id}])

                setLoading(false)
                handleClose()
            })
            .catch(handleError)
        })
        .catch(handleError)
    }

    const updatePlace = () => {
        Promise.all([createNewCategories(), createNewRoles()])
        .then(() => {
            const formData = new FormData()
            formData.append('name', JSON.stringify(place.name))
            formData.append('rolesIds', JSON.stringify(place.rolesIds))
            formData.append('categoriesIds', JSON.stringify(place.categoriesIds))
            if (deleteImage) {
                formData.append('deleteImg', '')
            }
            if (place.imgPath && currentFile) {
                formData.append('placeImg', currentFile)
            }

            axios.put(`${dbPath}/places/${place.id}`, formData)
            .then(() => {
                let placeIndex = places.findIndex((placeParam) => (placeParam.id === place.id))
                places[placeIndex] = place
                setPlaces([...places])

                setLoading(false)
                handleClose()
            })
            .catch(handleError)
        })
        .catch(handleError)
    }

    const deletePlace = () => {
        axios.delete(`${dbPath}/places/${place.id}`)
        .then(() => {
            setPlaces(places.filter((placeParam) => place !== placeParam))

            setLoading(false)
            handleClose()
        })
        .catch(handleError)
    }

    const titleMap = {
        create: 'Criando novo local',
        update: 'Editando local',
        delete: `Deletar o local "${displayName(place.name)}" ?`
    }
    const btnLabelMap = {
        create: 'Criar local',
        update: 'Salvar local',
        delete: 'Deletar local'
    }

    const submit = () => {
        if (type === 'create') {
            createPlace()
        } else if (type === 'update') {
            updatePlace()
        } else if (type === 'delete') {
            deletePlace()
        }
        setLoading(true)
    }

    return (
        <Modal
            show={show}
            title={titleMap[type]}
            onClose={handleClose}
            closeable={!loading}
            footer={!loading && (
                <>
                    <SecondaryButton onClick={handleClose}>Fechar</SecondaryButton>
                    <PrimaryButton danger={type === 'delete'} onClick={submit}>
                        {btnLabelMap[type]}
                    </PrimaryButton>
                </>
            )}
        >
            {loading ? (
                <Spinner />
            ) : (
                <div className="flex flex-col gap-4">
                    {type === 'delete' &&
                        <p className="text-sm text-zinc-600">Deseja mesmo excluir &ldquo;{displayName(place.name)}&rdquo; ?</p>
                    }

                    {(type === 'create' || type === 'update') &&
                    <>
                        <div>
                            <label htmlFor="place-name-pt" className={labelClass}>Nome (português)</label>
                            <input
                                id="place-name-pt"
                                className={inputClass}
                                type="text"
                                onChange={(event) => {
                                    place.name = { ...place.name, pt: event.target.value }
                                    setModalPlaceProperties({ ...modalPlaceProperties, currentValue: place })
                                }}
                                value={place.name.pt}
                            />
                        </div>

                        <div>
                            <label htmlFor="place-name-en" className={labelClass}>Nome (inglês)</label>
                            <input
                                id="place-name-en"
                                className={inputClass}
                                type="text"
                                onChange={(event) => {
                                    place.name = { ...place.name, en: event.target.value }
                                    setModalPlaceProperties({ ...modalPlaceProperties, currentValue: place })
                                }}
                                value={place.name.en}
                            />
                        </div>

                        <div>
                            <label htmlFor="place-image" className={labelClass}>Imagem</label>
                            <input
                                id="place-image"
                                className="block w-full cursor-pointer rounded-lg border border-zinc-300 bg-white text-sm text-zinc-600 file:mr-3 file:cursor-pointer file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-700"
                                type="file"
                                onChange={(event) => {
                                    const files = (event.target as HTMLInputElement).files
                                    if (files && files.length !== 0) {
                                        deleteImage = false
                                        currentFile = files[0]
                                        place.imgPath = URL.createObjectURL(currentFile)
                                        setModalPlaceProperties({ ...modalPlaceProperties, currentValue: place })
                                    } else {
                                        deleteImage = true
                                        currentFile = null
                                        delete place.imgPath
                                        setModalPlaceProperties({ ...modalPlaceProperties, currentValue: place })
                                    }
                                }}
                                accept="image/*"
                            />

                            {place.imgPath &&
                                <button
                                    type="button"
                                    className="mt-1.5 text-sm font-medium text-red-700 hover:text-red-900 hover:underline"
                                    onClick={() => {
                                        deleteImage = true
                                        delete place.imgPath
                                        setModalPlaceProperties({ ...modalPlaceProperties, currentValue: place })
                                    }}
                                >
                                    Apagar imagem atual
                                </button>
                            }
                        </div>

                        <div>
                            <label htmlFor="place-roles" className={labelClass}>Cargos</label>
                            <CreatableSelect
                                inputId="place-roles"
                                isMulti
                                options={roles.map(role2RoleOption)}
                                defaultValue={place.rolesIds.map((roleId) => role2RoleOption(getRoleById(roleId, roles)))}
                                onChange={(rolesOptions) => {
                                    newRoles = rolesOptions.filter((roleOption) => (Object.hasOwn(roleOption, '__isNew__')))
                                                           .map((roleOption) => (roleOption.label))
                                    place.rolesIds = rolesOptions.filter((roleOption) => (!Object.hasOwn(roleOption, '__isNew__')))
                                                                 .map((roleOption) => (roleOption.value))
                                }}
                                placeholder=""
                            />
                        </div>

                        <div>
                            <label htmlFor="place-categories" className={labelClass}>Categorias</label>
                            <CreatableSelect
                                inputId="place-categories"
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
                                placeholder=""
                            />
                        </div>

                    </>
                    }

                    <hr className="border-zinc-200" />

                    <PlaceCardPreview
                        imgURL={place.imgPath}
                        title={displayName(place.name)}
                    />
                </div>
            )}
        </Modal>
    )
}
