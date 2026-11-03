import { QUESTION_HINTS, questionHintsFor } from './questionHints'

test('questionHintsFor devolve 3 perguntas no idioma pedido', () => {
    expect(questionHintsFor('pt', 0)).toEqual(QUESTION_HINTS.pt.slice(0, 3))
    expect(questionHintsFor('en', 0)).toEqual(QUESTION_HINTS.en.slice(0, 3))
    expect(questionHintsFor('en-US', 0)).toEqual(QUESTION_HINTS.en.slice(0, 3))
})

test('questionHintsFor gira a lista conforme perguntas já feitas, sem sair dela', () => {
    expect(questionHintsFor('pt', 1)).toEqual(QUESTION_HINTS.pt.slice(1, 4))

    const wrapped = questionHintsFor('pt', QUESTION_HINTS.pt.length - 1)
    expect(wrapped[0]).toBe(QUESTION_HINTS.pt.at(-1))
    expect(wrapped).toHaveLength(3)
    for (const hint of wrapped) {
        expect(QUESTION_HINTS.pt).toContain(hint)
    }

    expect(questionHintsFor('pt', QUESTION_HINTS.pt.length)).toEqual(questionHintsFor('pt', 0))
})
