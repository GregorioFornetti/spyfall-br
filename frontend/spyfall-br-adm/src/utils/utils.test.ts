import {
    getPlaceById, getRoleById, getCategoryById,
    category2CategoryOption, role2RoleOption,
    createEmptyRole, createEmptyPlace, createEmptyCategory
} from './utils'
import Place from '../interfaces/PlaceInterface'
import Role from '../interfaces/RoleInterface'
import Category from '../interfaces/CategoryInterface'

const places: Place[] = [
    { id: 1, name: { pt: 'Casa', en: 'House' }, categoriesIds: [2], rolesIds: [3, 4] },
    { id: 2, name: { pt: 'Avião', en: 'Airplane' }, categoriesIds: [1], rolesIds: [5] }
]
const roles: Role[] = [
    { id: 3, name: { pt: 'Morador', en: 'Resident' } },
    { id: 4, name: { pt: 'Faxineiro', en: 'Cleaner' } }
]
const categories: Category[] = [
    { id: 1, name: { pt: 'Transporte', en: 'Transportation' } },
    { id: 2, name: { pt: 'Moradia', en: 'Housing' } }
]

test('getById encontra o item certo e retorna undefined para id inexistente', () => {
    expect(getPlaceById(2, places).name).toEqual({ pt: 'Avião', en: 'Airplane' })
    expect(getRoleById(4, roles).name).toEqual({ pt: 'Faxineiro', en: 'Cleaner' })
    expect(getCategoryById(1, categories).name).toEqual({ pt: 'Transporte', en: 'Transportation' })
    expect(getPlaceById(999, places)).toBeUndefined()
    expect(getRoleById(999, roles)).toBeUndefined()
    expect(getCategoryById(999, categories)).toBeUndefined()
})

test('conversão para opções de select usa id como value e nome como label', () => {
    expect(category2CategoryOption(categories[0])).toEqual({ value: 1, label: 'Transporte' })
    expect(role2RoleOption(roles[1])).toEqual({ value: 4, label: 'Faxineiro' })
})

test('createEmpty* geram objetos novos com id -1 e campos vazios', () => {
    expect(createEmptyRole()).toEqual({ id: -1, name: { pt: '', en: '' } })
    expect(createEmptyCategory()).toEqual({ id: -1, name: { pt: '', en: '' } })
    expect(createEmptyPlace()).toEqual({ id: -1, name: { pt: '', en: '' }, categoriesIds: [], rolesIds: [] })
    // cada chamada gera arrays novos, sem compartilhar referência
    expect(createEmptyPlace().rolesIds).not.toBe(createEmptyPlace().rolesIds)
})
