import { localizedName } from './localizedName'

test('localizedName resolve o nome no idioma atual com fallbacks', () => {
    const name = { pt: 'Casa', en: 'House' }
    expect(localizedName(name, 'pt')).toBe('Casa')
    expect(localizedName(name, 'pt-BR')).toBe('Casa')
    expect(localizedName(name, 'en')).toBe('House')
    expect(localizedName(name, 'en-US')).toBe('House')
    expect(localizedName({ pt: 'Casa' } as any, 'en')).toBe('Casa')
    expect(localizedName('Casa', 'en')).toBe('Casa')
    expect(localizedName(undefined, 'en')).toBe('')
})
