import { render, screen, fireEvent } from '@testing-library/react'
import i18n, { translateServerMessage } from './i18n'
import pt from './locales/pt'
import en from './locales/en'
import PlayerCard from './components/PlayerCard'
import PlaceCard from './components/PlaceCard'

function leafKeys(obj: unknown, prefix = ''): string[] {
    if (typeof obj !== 'object' || obj === null) {
        return [prefix]
    }
    return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) =>
        leafKeys(value, prefix ? `${prefix}.${key}` : key)
    )
}

afterEach(async () => {
    await i18n.changeLanguage('pt')
})

test('locales pt e en têm exatamente as mesmas chaves', () => {
    expect(leafKeys(en).sort()).toEqual(leafKeys(pt).sort())
})

test('inglês traduz a interface e mensagens do servidor', async () => {
    await i18n.changeLanguage('en')
    expect(i18n.t('main.createTitle')).toBe('Create new match')
    expect(i18n.t('lobby.players', { count: 2 })).toBe('Players (2/8)')
    expect(i18n.t('game.turnOf', { name: 'Ana' })).toBe("Ana's turn to question.")
    expect(translateServerMessage('O espião foi descoberto')).toBe('The spy was found out')
    expect(translateServerMessage('Você não pode se questionar')).toBe('You cannot question yourself')
    expect(translateServerMessage('mensagem desconhecida')).toBe('mensagem desconhecida')
})

test('componentes renderizam em inglês após trocar o idioma', async () => {
    await i18n.changeLanguage('en')
    render(<PlayerCard username="Ana" score={7} />)
    expect(screen.getByText('Score: 7')).toBeInTheDocument()

    render(<PlaceCard title="Casa" type="markable" />)
    fireEvent.click(screen.getByText('Casa'))
    expect(screen.getByText('crossed out')).toBeInTheDocument()
})
