import { test } from 'node:test'
import assert from 'node:assert/strict'
import { useTempDataDir, fakeSocket, fakeIo, fakeUser, seed } from './helpers.js'

test('randomID, User e Player', async (t) => {
    useTempDataDir(t)
    const { default: randomID } = await import('../src/game/randomID.js')
    const { default: User } = await import('../src/game/classes/User.js')
    const { default: Player } = await import('../src/game/classes/Player.js')

    const id = randomID()
    assert.match(id, /^[0-9a-f]{16}$/)
    assert.notEqual(randomID(), randomID())

    const user = new User('socket-9')
    assert.equal(user.socketID, 'socket-9')
    assert.match(user.userID, /^[0-9a-f]{16}$/)
    assert.equal(user.game, null)
    assert.equal(user.online, true)

    const player = new Player(user, 'Ana')
    assert.equal(player.score, 0)
    assert.equal(player.ready, false)
    player.increaseScore(3)
    player.increaseScore(2)
    assert.equal(player.score, 5)
    assert.equal(player.getSocketID(), 'socket-9')
    assert.deepEqual(player.toJSON(), { id: user.userID, username: 'Ana', ready: false, score: 5 })
})

test('Config: build, validação e aplicação', async (t) => {
    useTempDataDir(t)
    const { default: Config } = await import('../src/game/classes/Config.js')

    const config = await Config.build()
    assert.deepEqual(config.selectedPlacesIds, seed.places.map((p) => p.id))
    assert.deepEqual(config.possiblePlacesIds, config.selectedPlacesIds)
    assert.notEqual(config.possiblePlacesIds, config.selectedPlacesIds) // cópia, não referência

    const valid = {
        nonSpyVictoryScore: 2, nonSpyAcusatorScore: 3, timeFinishedScore: 4,
        wrongAcusationScore: 5, correctPlaceScore: 6,
        selectedPlacesIds: [1, 2], qntSelectedPlaces: 2, roundMaxTime: 8
    }
    assert.deepEqual(config.setNewConfig(valid), [false, null])
    assert.equal(config.nonSpyVictoryScore, 2)
    assert.equal(config.roundMaxTime, 8 * 60) // minutos -> segundos
    assert.equal(config.toJSON().roundMaxTime, 8)

    const invalidCases = [
        [{ ...valid, nonSpyVictoryScore: 1.5 }, 'nonSpyVictoryScore'],
        [{ ...valid, correctPlaceScore: -1 }, 'correctPlaceScore'],
        [{ ...valid, selectedPlacesIds: 'x' }, 'selectedPlacesIds'],
        [{ ...valid, selectedPlacesIds: [1] }, 'selectedPlacesIds'],
        [{ ...valid, selectedPlacesIds: [1, 999] }, 'selectedPlacesIds'],
        [{ ...valid, qntSelectedPlaces: 0 }, 'qntSelectedPlaces'],
        [{ ...valid, roundMaxTime: 0 }, 'roundMaxTime'],
        [{ ...valid, roundMaxTime: 61 }, 'roundMaxTime']
    ]
    for (const [input, field] of invalidCases) {
        const [error, errors] = config.setNewConfig(input)
        assert.equal(error, true, `esperava erro em ${field}`)
        assert.ok(errors[field], `esperava mensagem em ${field}`)
    }
    // configuração permanece a última válida após tentativas inválidas
    assert.equal(config.correctPlaceScore, 6)
})

test('Config: lugares e cargos personalizados do líder', async (t) => {
    useTempDataDir(t)
    const { default: Config } = await import('../src/game/classes/Config.js')

    const config = await Config.build()
    const base = {
        nonSpyVictoryScore: 1, nonSpyAcusatorScore: 1, timeFinishedScore: 1,
        wrongAcusationScore: 1, correctPlaceScore: 1,
        selectedPlacesIds: [1, -100], qntSelectedPlaces: 2, roundMaxTime: 5
    }
    const customRoles = [{ id: -100, name: { pt: 'Anfitrião', en: 'Host' } }]
    const customPlaces = [{
        id: -100, name: { pt: 'Festa em casa', en: 'House party' },
        imgPath: 'https://example.com/festa.png', rolesIds: [-100, 10], categoriesIds: [-1]
    }]

    // lugar personalizado selecionado é aceito, higienizado e exposto no JSON
    assert.deepEqual(config.setNewConfig({ ...base, customPlaces, customRoles }), [false, null])
    assert.deepEqual(config.customPlaces, customPlaces)
    assert.deepEqual(config.customRoles, customRoles)
    assert.deepEqual(config.toJSON().customPlaces, customPlaces)
    assert.deepEqual(config.toJSON().customRoles, customRoles)

    const invalidCases = [
        // id positivo colidiria com os lugares do banco
        [{ ...base, customPlaces: [{ ...customPlaces[0], id: 1 }], customRoles }, 'customPlaces'],
        // cargo referenciado precisa existir (banco ou personalizados)
        [{ ...base, customPlaces: [{ ...customPlaces[0], rolesIds: [-999] }], customRoles }, 'customPlaces'],
        // imagem só pode ser link http(s)
        [{ ...base, customPlaces: [{ ...customPlaces[0], imgPath: 'javascript:alert(1)' }], customRoles }, 'customPlaces'],
        // lugar selecionado sem definição personalizada correspondente
        [{ ...base, selectedPlacesIds: [1, -101], customPlaces, customRoles }, 'selectedPlacesIds'],
    ]
    for (const [input, field] of invalidCases) {
        const [error, errors] = config.setNewConfig(input)
        assert.equal(error, true, `esperava erro em ${field}`)
        assert.ok(errors[field], `esperava mensagem em ${field}`)
    }
    // a última configuração válida permanece após as tentativas inválidas
    assert.deepEqual(config.customPlaces, customPlaces)
})

test('Game: salas, jogadores, prontidão e configuração', async (t) => {
    useTempDataDir(t)
    const { default: Game } = await import('../src/game/classes/Game.js')

    const leader = fakeUser('s-leader', 'u-leader')
    const socket = fakeSocket('s-leader')
    let game

    await t.test('build rejeita nome inválido e aceita nome válido', async () => {
        assert.equal(await Game.build(leader, '   ', socket), false)
        assert.equal(await Game.build(leader, 'a'.repeat(16), socket), false)
        assert.equal(socket.emitted.at(-1)[0], 'error')

        game = await Game.build(leader, 'Líder', socket)
        assert.ok(game)
        assert.match(game.code, /^[0-9a-f-]{36}$/)
        assert.equal(game.leader, leader)
        assert.equal(game.players.length, 1)
        assert.equal(game.inMatch, false)
        assert.deepEqual(game.config.selectedPlacesIds, seed.places.map((p) => p.id))
        assert.equal(socket.emitted.at(-1)[0], 'success-join')
    })

    await t.test('validUsername', () => {
        assert.equal(Game.validUsername('Ana'), true)
        assert.equal(Game.validUsername(''), false)
        assert.equal(Game.validUsername('   '), false)
        assert.equal(Game.validUsername('a'.repeat(15)), true)
        assert.equal(Game.validUsername('a'.repeat(16)), false)
    })

    await t.test('addNewPlayer avisa os demais e rejeita inválidos/duplicação em partida', async () => {
        const io = fakeIo()
        const p2 = fakeUser('s-2', 'u-2')
        const s2 = fakeSocket('s-2')

        assert.equal(game.addNewPlayer(p2, '', s2, io), false)
        assert.equal(game.addNewPlayer(p2, 'Beto', s2, io), true)
        assert.equal(game.players.length, 2)
        assert.deepEqual(io.sent.at(-1), ['s-leader', 'new-player-joined', game.players[1].toJSON()])
        assert.equal(s2.emitted.at(-1)[0], 'success-join')

        game.inMatch = true
        assert.equal(game.addNewPlayer(fakeUser('s-3', 'u-3'), 'Caio', fakeSocket('s-3'), io), false)
        game.inMatch = false
    })

    await t.test('ready/unready e allPlayersReady (líder é exceção)', async () => {
        const io = fakeIo()
        assert.equal(game.allPlayersReady(), false)

        game.playerReady(game.players[1].user, io)
        assert.equal(game.players[1].ready, true)
        assert.equal(game.allPlayersReady(), true)
        assert.deepEqual(io.sent.at(-1), ['s-leader', 'player-ready', 'u-2'])

        game.playerUnready(game.players[1].user, io)
        assert.equal(game.players[1].ready, false)
        assert.equal(game.allPlayersReady(), false)
        game.playerReady(game.players[1].user, io)
    })

    await t.test('setNewConfig só pelo líder, fora de partida e com config válida', async () => {
        const io = fakeIo()
        const other = game.players[1].user
        const valid = {
            nonSpyVictoryScore: 1, nonSpyAcusatorScore: 1, timeFinishedScore: 2,
            wrongAcusationScore: 4, correctPlaceScore: 4,
            selectedPlacesIds: [1, 2, 3], qntSelectedPlaces: 2, roundMaxTime: 5
        }

        const sOther = fakeSocket('s-2')
        game.setNewConfig(valid, other, sOther, io)
        assert.equal(sOther.emitted.at(-1)[0], 'config-error')

        const sLeader = fakeSocket('s-leader')
        game.setNewConfig({ ...valid, roundMaxTime: 99 }, leader, sLeader, io)
        assert.equal(sLeader.emitted.at(-1)[0], 'config-error')

        game.setNewConfig(valid, leader, sLeader, io)
        assert.equal(sLeader.emitted.at(-1)[0], 'config-success')
        assert.equal(game.config.roundMaxTime, 5 * 60)
        assert.deepEqual(io.sent.at(-1), ['s-2', 'new-config', game.config.toJSON()])

        game.inMatch = true
        const s3 = fakeSocket('s-leader')
        game.setNewConfig(valid, leader, s3, io)
        assert.equal(s3.emitted.at(-1)[0], 'config-error')
        game.inMatch = false
    })

    await t.test('removePlayer remove e avisa os restantes', async () => {
        const io = fakeIo()
        const p2 = game.players[1]
        const s2 = fakeSocket('s-2')
        game.removePlayer(p2.user, s2, io)
        assert.equal(game.players.length, 1)
        assert.equal(s2.emitted.at(-1)[0], 'logout')
        assert.deepEqual(io.sent.at(-1), ['s-leader', 'player-disconnect', 'u-2'])
    })

    await t.test('startMatch exige líder, todos prontos e 3+ jogadores', async () => {
        const io = fakeIo()
        const sLeader = fakeSocket('s-leader')

        // não-líder
        const notLeader = fakeUser('s-x', 'u-x')
        await game.startMatch(io, notLeader, sLeader)
        assert.equal(sLeader.emitted.at(-1)[0], 'error')
        assert.equal(game.inMatch, false)

        // só 1 jogador (líder conta como pronto, mas faltam jogadores)
        await game.startMatch(io, leader, sLeader)
        assert.equal(game.inMatch, false)
        assert.match(sLeader.emitted.at(-1)[1], /3 ou mais/)
    })

    await t.test('toJSON sem partida em andamento', async () => {
        const json = game.toJSON()
        assert.equal(json.code, game.code)
        assert.equal(json.inMatch, false)
        assert.equal(json.leaderUserID, 'u-leader')
        assert.equal(json.match, null)
        assert.equal(json.players.length, 1)
        assert.ok(json.config)
    })
})
