import Category from '../../interfaces/CategoryInterface'
import Place from '../../interfaces/PlaceInterface'
import ModalProperties from '../../interfaces/ModalProperties'
import { useState } from 'react'
import { dbPath } from '../../utils/configs'
import { displayName } from '../../utils/utils'
import axios from 'axios'
import Modal, { Spinner, PrimaryButton, SecondaryButton, inputClass, labelClass } from '../ui/Modal'

interface ModalCategoryProps {
    modalCategoryProperties: ModalProperties<Category>,
    setModalCategoryProperties: React.Dispatch<React.SetStateAction<ModalProperties<Category>>>,
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>,
    categories: Category[],
    setPlaces: React.Dispatch<React.SetStateAction<Place[]>>,
    places: Place[]
}

export default function ModalCategory({ modalCategoryProperties, categories, setModalCategoryProperties, setCategories, setPlaces, places }: ModalCategoryProps) {

    const [loading, setLoading] = useState(false)
    let { show, type, currentValue } = modalCategoryProperties
    let category = currentValue
    const handleClose = () => setModalCategoryProperties({ ...modalCategoryProperties, show: false })
    const handleError = (error: any) => {
        console.error(error)
        alert('Ocorreu um erro ! Olhar o console para mais informações')
        setLoading(false)
    }

    const createCategory = () => {
        axios.post(`${dbPath}/categories`, {
            name: category.name
        })
        .then((response) => {
            setCategories([...categories, {...category, id: response.data.id}])

            setLoading(false)
            handleClose()
        })
        .catch(handleError)
    }

    const updateCategory = () => {
        axios.put(`${dbPath}/categories/${category.id}`, {
            name: category.name
        })
        .then(() => {
            let categoryIndex = categories.findIndex((categoryParam) => (categoryParam.id === category.id))
            categories[categoryIndex] = category
            setCategories([...categories])

            setLoading(false)
            handleClose()
        })
        .catch(handleError)
    }

    const deleteCategory = () => {
        axios.delete(`${dbPath}/categories/${category.id}`)
        .then(() => {
            for (let place of places) {
                place.categoriesIds = place.categoriesIds.filter((categoryId) => (categoryId !== category.id))
            }
            setPlaces([...places])
            setCategories(categories.filter((categoryParam) => category !== categoryParam))

            setLoading(false)
            handleClose()
        })
        .catch(handleError)
    }

    const titleMap = {
        create: 'Criando nova categoria',
        update: 'Editando categoria',
        delete: `Deletar a categoria "${displayName(category.name)}" ?`
    }
    const btnLabelMap = {
        create: 'Criar categoria',
        update: 'Salvar categoria',
        delete: 'Deletar categoria'
    }

    const submit = () => {
        if (type === 'create') {
            createCategory()
        } else if (type === 'update') {
            updateCategory()
        } else if (type === 'delete') {
            deleteCategory()
        }
        setLoading(true)
    }

    const setName = (locale: 'pt' | 'en', value: string) => {
        category.name = { ...category.name, [locale]: value }
        setModalCategoryProperties({ ...modalCategoryProperties, currentValue: category })
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
                <>
                    {type === 'delete' &&
                        <p className="text-sm text-zinc-600">Deseja mesmo excluir &ldquo;{displayName(category.name)}&rdquo; ?</p>
                    }

                    {(type === 'create' || type === 'update') &&
                        <div className="flex flex-col gap-4">
                            <div>
                                <label htmlFor="category-name-pt" className={labelClass}>Nome (português)</label>
                                <input
                                    id="category-name-pt"
                                    className={inputClass}
                                    type="text"
                                    onChange={(event) => setName('pt', event.target.value)}
                                    value={category.name.pt}
                                />
                            </div>
                            <div>
                                <label htmlFor="category-name-en" className={labelClass}>Nome (inglês)</label>
                                <input
                                    id="category-name-en"
                                    className={inputClass}
                                    type="text"
                                    onChange={(event) => setName('en', event.target.value)}
                                    value={category.name.en}
                                />
                            </div>
                        </div>
                    }
                </>
            )}
        </Modal>
    )
}
