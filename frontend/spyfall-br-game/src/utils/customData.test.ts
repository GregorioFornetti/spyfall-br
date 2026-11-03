import {
    CUSTOM_CATEGORY_ID,
    CUSTOM_PLACES_KEY,
    CUSTOM_ROLES_KEY,
    isValidImageUrl,
    loadCustomPlaces,
    loadCustomRoles,
    mergeById,
    nextCustomId,
    saveCustomPlaces,
    saveCustomRoles
} from './customData'

beforeEach(() => {
    window.localStorage.clear()
})

test('lugares e cargos personalizados são salvos e lidos do localStorage', () => {
    const places = [{
        id: -1,
        name: { pt: 'Festa em casa', en: 'House party' },
        imgPath: 'https://example.com/festa.png',
        rolesIds: [-1, 10],
        categoriesIds: [CUSTOM_CATEGORY_ID]
    }]
    const roles = [{ id: -1, name: { pt: 'Anfitrião', en: 'Host' } }]

    saveCustomPlaces(places)
    saveCustomRoles(roles)

    expect(loadCustomPlaces()).toEqual(places)
    expect(loadCustomRoles()).toEqual(roles)
    expect(JSON.parse(window.localStorage.getItem(CUSTOM_PLACES_KEY) as string)).toEqual(places)
    expect(JSON.parse(window.localStorage.getItem(CUSTOM_ROLES_KEY) as string)).toEqual(roles)
})

test('leitura ignora itens inválidos e força a categoria personalizada', () => {
    window.localStorage.setItem(CUSTOM_PLACES_KEY, JSON.stringify([
        { id: 5, name: { pt: 'Id positivo', en: 'Positive id' }, rolesIds: [] },
        { id: -2, name: { pt: '  Casa da praia  ' }, rolesIds: [-1], categoriesIds: [99], imgPath: 'javascript:alert(1)' },
        { id: -3, name: { pt: '' }, rolesIds: [] }
    ]))
    window.localStorage.setItem(CUSTOM_ROLES_KEY, JSON.stringify([
        { id: -1, name: { pt: 'Anfitrião' } },
        { id: 2, name: { pt: 'Inválido', en: 'Invalid' } }
    ]))

    expect(loadCustomPlaces()).toEqual([{
        id: -2,
        name: { pt: 'Casa da praia', en: 'Casa da praia' },
        rolesIds: [-1],
        categoriesIds: [CUSTOM_CATEGORY_ID]
    }])
    expect(loadCustomRoles()).toEqual([{ id: -1, name: { pt: 'Anfitrião', en: 'Anfitrião' } }])
})

test('leitura com localStorage vazio ou corrompido devolve listas vazias', () => {
    expect(loadCustomPlaces()).toEqual([])
    expect(loadCustomRoles()).toEqual([])

    window.localStorage.setItem(CUSTOM_PLACES_KEY, '{não é json')
    expect(loadCustomPlaces()).toEqual([])
})

test('nextCustomId gera ids negativos sem colisão', () => {
    expect(nextCustomId([])).toBe(-1)
    expect(nextCustomId([{ id: -1 }, { id: -7 }])).toBe(-8)
    expect(nextCustomId([{ id: 10 }])).toBe(-1)
})

test('isValidImageUrl aceita apenas links http(s)', () => {
    expect(isValidImageUrl('https://example.com/img.png')).toBe(true)
    expect(isValidImageUrl('http://example.com/img.png')).toBe(true)
    expect(isValidImageUrl('')).toBe(false)
    expect(isValidImageUrl('example.com/img.png')).toBe(false)
    expect(isValidImageUrl('data:image/png;base64,AAAA')).toBe(false)
    expect(isValidImageUrl('javascript:alert(1)')).toBe(false)
})

test('mergeById junta sem duplicar e o extra vence em conflito', () => {
    const merged = mergeById(
        [{ id: 1, name: { pt: 'A', en: 'A' } }, { id: -1, name: { pt: 'B', en: 'B' } }],
        [{ id: -1, name: { pt: 'B2', en: 'B2' } }, { id: -2, name: { pt: 'C', en: 'C' } }]
    )
    expect(merged.map((item) => item.id)).toEqual([1, -1, -2])
    expect(merged[1].name.pt).toBe('B2')
})
