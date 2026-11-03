// Perguntas genéricas e seguras para quem está questionando: boas para
// qualquer lugar, sem entregar o local para o espião. A lista gira conforme
// o número de perguntas já feitas, para não repetir sempre as mesmas.
export const QUESTION_HINTS: Record<'pt' | 'en', string[]> = {
    pt: [
        'Você vem aqui com frequência?',
        'O que você está vestindo combina com este lugar?',
        'Você costuma ficar quanto tempo aqui?',
        'O que você mais gosta daqui?',
        'Você veio aqui sozinho ou acompanhado?',
        'Como você chegou até aqui hoje?',
        'O que você está segurando agora?',
        'Você pagou para entrar aqui?',
        'Que barulho você está ouvindo agora?',
    ],
    en: [
        'Do you come here often?',
        'Does what you are wearing fit this place?',
        'How long do you usually stay here?',
        'What do you like most about being here?',
        'Did you come here alone or with someone?',
        'How did you get here today?',
        'What are you holding right now?',
        'Did you pay to get in here?',
        'What sound can you hear right now?',
    ],
}

export function questionHintsFor(language: string, alreadyAsked: number, count = 3): string[] {
    const hints = language?.toLowerCase().startsWith('en') ? QUESTION_HINTS.en : QUESTION_HINTS.pt
    const start = ((alreadyAsked % hints.length) + hints.length) % hints.length
    return Array.from({ length: Math.min(count, hints.length) }, (_, i) => hints[(start + i) % hints.length])
}
