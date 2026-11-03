import { test } from 'node:test'
import assert from 'node:assert/strict'
import { useTempDataDir, fakeSocket, fakeIo, fakeUser } from './helpers.js'

test('session: criação, reconexão e loadSession', async (t) => {
    useTempDataDir(t)
    const { handleSession, loadSession } = await import('../src/game/session.js')
    const users = {}

    // usuário novo ganha sessão
    const s1 = fakeSocket('sock-1')
    let nextCalls = 0
    handleSession(s1, () => nextCalls++, users)
    assert.equal(nextCalls, 1)
    assert.ok(s1.sessionID)
    assert.ok(users[s1.sessionID])
    assert.equal(users[s1.sessionID].socketID, 'sock-1')
    assert.equal(s1.userID, users[s1.sessionID].userID)

    // reconexão com sessionID conhecido reutiliza o usuário e atualiza o socket
    const s2 = fakeSocket('sock-2')
    s2.handshake.auth.sessionID = s1.sessionID
    handleSession(s2, () => nextCalls++, users)
    assert.equal(s2.sessionID, s1.sessionID)
    assert.equal(s2.userID, s1.userID)
    assert.equal(users[s1.sessionID].socketID, 'sock-2')
    assert.equal(Object.keys(users).length, 1)

    // sessionID desconhecido cria usuário novo
    const s3 = fakeSocket('sock-3')
    s3.handshake.auth.sessionID = 'sessao-inexistente'
    handleSession(s3, () => nextCalls++, users)
    assert.notEqual(s3.sessionID, 'sessao-inexistente')
    assert.equal(Object.keys(users).length, 2)

    // loadSession sem jogo não inclui gameInfo; com jogo, inclui
    const s4 = fakeSocket('sock-4')
    s4.sessionID = s1.sessionID
    s4.userID = s1.userID
    loadSession(s4, users)
    assert.deepEqual(s4.emitted.at(-1), ['session', { sessionID: s1.sessionID, userID: s1.userID }])

    users[s1.sessionID].game = { toJSON: (userID) => ({ code: 'sala-1', userID }) }
    loadSession(s4, users)
    assert.deepEqual(s4.emitted.at(-1)[1].gameInfo, { code: 'sala-1', userID: s1.userID })
})

test('gameEventsHandler: criar sala, entrar, config, ready e sair', async (t) => {
    useTempDataDir(t)
    const { default: gameEventsHandler } = await import('../src/game/eventsHandlers/gameEventsHandler.js')
    const games = {}
    const users = {}
    const io = fakeIo()

    function connect(socketId) {
        const socket = fakeSocket(socketId)
        const user = fakeUser(socketId, `u-${socketId}`)
        const sessionID = `sess-${socketId}`
        user.sessionID = sessionID
        users[sessionID] = user
        socket.sessionID = sessionID
        gameEventsHandler(io, socket, games, users)
        return { socket, user }
    }

    const leader = connect('s1')
    await leader.socket.trigger('create-room', { username: 'Líder' })
    assert.equal(Object.keys(games).length, 1)
    const game = Object.values(games)[0]
    assert.equal(leader.user.game, game)
    assert.equal(leader.socket.emitted.at(-1)[0], 'success-join')

    // username inválido não cria sala
    const bad = connect('s-bad')
    await bad.socket.trigger('create-room', { username: '' })
    assert.equal(Object.keys(games).length, 1)
    assert.equal(bad.user.game, null)

    // entrar em sala inexistente avisa erro
    const guest = connect('s2')
    await guest.socket.trigger('join-room', { roomCode: 'nao-existe', username: 'Convidado' })
    assert.equal(guest.socket.emitted.at(-1)[0], 'error')
    assert.equal(guest.user.game, null)

    // entrar na sala certa
    await guest.socket.trigger('join-room', { roomCode: game.code, username: 'Convidado' })
    assert.equal(guest.user.game, game)
    assert.equal(game.players.length, 2)

    // config só pelo líder (via handler)
    const valid = {
        nonSpyVictoryScore: 1, nonSpyAcusatorScore: 1, timeFinishedScore: 2,
        wrongAcusationScore: 4, correctPlaceScore: 4,
        selectedPlacesIds: [1, 2, 3], qntSelectedPlaces: 2, roundMaxTime: 5
    }
    await guest.socket.trigger('set-new-config', valid)
    assert.equal(guest.socket.emitted.at(-1)[0], 'config-error')
    await leader.socket.trigger('set-new-config', valid)
    assert.equal(leader.socket.emitted.at(-1)[0], 'config-success')
    assert.equal(game.config.roundMaxTime, 300)

    // ready/unready via handler
    await guest.socket.trigger('player-ready')
    assert.equal(game.players[1].ready, true)
    await guest.socket.trigger('player-unready')
    assert.equal(game.players[1].ready, false)

    // logout remove da sala
    await guest.socket.trigger('logout')
    assert.equal(game.players.length, 1)
    assert.equal(guest.user.game, null)
})

test('matchEventsHandler: ignora sem sala/partida e delega durante a partida', async (t) => {
    useTempDataDir(t)
    const { default: matchEventsHandler } = await import('../src/game/eventsHandlers/matchEventsHandler.js')
    const users = {}
    const io = fakeIo()
    const socket = fakeSocket('s1')
    const user = fakeUser('s1', 'u-1')
    users['sess-1'] = user
    socket.sessionID = 'sess-1'
    matchEventsHandler(io, socket, users)

    // sem jogo: nada acontece e nada quebra
    await socket.trigger('match-start')
    await socket.trigger('new-questioning', 'u-2')
    await socket.trigger('guess-place', 1)

    // jogo sem partida: match-start chama startMatch (que registra erro de jogadores)
    const calls = []
    user.game = {
        inMatch: false,
        startMatch: async (...args) => calls.push(['startMatch', ...args]),
        match: {
            makeNewQuestioning: (...args) => calls.push(['question', ...args]),
            guessPlace: (...args) => calls.push(['guess', ...args])
        }
    }
    await socket.trigger('match-start')
    assert.equal(calls.at(-1)[0], 'startMatch')
    await socket.trigger('new-questioning', 'u-2')
    assert.equal(calls.length, 1) // sem partida, não delega

    user.game.inMatch = true
    await socket.trigger('new-questioning', 'u-2')
    assert.equal(calls.at(-1)[0], 'question')
    assert.equal(calls.at(-1).at(-1), 'u-2')
    await socket.trigger('guess-place', 7)
    assert.equal(calls.at(-1)[0], 'guess')
    assert.equal(calls.at(-1).at(-1), 7)

    // em partida, match-start não reinicia
    await socket.trigger('match-start')
    assert.equal(calls.filter(([name]) => name === 'startMatch').length, 1)
})
