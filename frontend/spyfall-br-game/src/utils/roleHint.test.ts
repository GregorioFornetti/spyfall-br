import { roleHintText } from './roleHint'

const fallback = (role: string, place: string) => `${role} @ ${place}`
const place: any = { id: 1, name: { pt: 'Casa', en: 'House' }, rolesIds: [], categoriesIds: [] }

test('roleHintText usa a dica cadastrada do cargo quando ela existe', () => {
    const role: any = { id: 1, name: { pt: 'Morador', en: 'Resident' }, hint: { pt: 'Você mora aqui.', en: 'You live here.' } }
    expect(roleHintText(role, place, 'en', fallback)).toBe('You live here.')
    expect(roleHintText(role, place, 'pt', fallback)).toBe('Você mora aqui.')
})

test('roleHintText gera a dica a partir de cargo e lugar sem dica cadastrada', () => {
    const role: any = { id: 1, name: { pt: 'Morador', en: 'Resident' } }
    expect(roleHintText(role, place, 'pt', fallback)).toBe('Morador @ Casa')
})

test('roleHintText é nulo para o espião (sem cargo) ou sem lugar', () => {
    expect(roleHintText(undefined, place, 'pt', fallback)).toBeNull()
    const role: any = { id: 1, name: { pt: 'Morador', en: 'Resident' } }
    expect(roleHintText(role, undefined, 'pt', fallback)).toBeNull()
})
