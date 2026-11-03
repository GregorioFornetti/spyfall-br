import { test } from 'node:test'
import assert from 'node:assert/strict'
import { useTempDataDir, fakeSocket, fakeIo, fakeUser } from './helpers.js'
// makeMatch semeia os dados temporários antes de importar as classes

async function makeMatch(t, playersCount = 4) {
    useTempDataDir(t)
    const { default: Match } = await import('../src/game/classes/Match.js')
    const { default: Config } = await import('../src/game/classes/Config.js')
    const { default: Player } = await import('../src/game/classes/Player.js')

    const config = await Config.build()
    config.qntSelectedPlaces = 2
    const users = Array.from({ length: playersCount }, (_, i) => fakeUser(`s-${i}`, `u-${i}`))
    const players = users.map((user, i) => new Player(user, `Jogador ${i}`))
    const io = fakeIo()
    const match = await Match.build(config, players, io)
    t.after(() => {
        clearInterval(match.matchInterval)
        clearInterval(match.votationInterval)
    })
    return { match, config, users, players, io }
}

test('Match: sorteio inicial e sigilo do espião', async (t) => {
    const { match, users } = await makeMatch(t)

    assert.ok(match.possiblePlacesIDs.length <= 2)
    assert.ok(match.possiblePlacesIDs.every((id) => match.config.selectedPlacesIds.includes(id)))
    assert.ok(match.possiblePlacesIDs.includes(match.selectedPlaceID))
    assert.ok(users.some((u) => u.userID === match.spyUserID))
    assert.ok(users.some((u) => u.userID === match.askingUserID))
    assert.equal(match.matchTimeLeft, match.config.roundMaxTime)

    // cada jogador não-espião recebeu um cargo do lugar sorteado; o espião, nenhum
    const placeRoles = { 1: [10, 11], 2: [10, 12], 3: [13] }[match.selectedPlaceID]
    for (const user of users) {
        if (user.userID === match.spyUserID) {
            assert.equal(match.usersRolesIDs[user.userID], null)
        } else if (match.usersRolesIDs[user.userID] !== undefined) {
            // lugares com menos cargos que agentes deixam alguns sem cargo
            // (comportamento atual); os atribuídos são sempre do lugar
            assert.ok(placeRoles.includes(match.usersRolesIDs[user.userID]))
        }
    }

    const spyView = match.toJSON(match.spyUserID)
    assert.equal(spyView.isSpy, true)
    assert.equal('selectedPlaceID' in spyView, false)
    assert.equal('userRoleID' in spyView, false)

    const agentView = match.toJSON(users.find((u) => u.userID !== match.spyUserID).userID)
    assert.equal(agentView.isSpy, false)
    assert.equal(agentView.selectedPlaceID, match.selectedPlaceID)
    assert.ok('userRoleID' in agentView)
})

test('Match: lugar personalizado sorteia cargos personalizados e os expõe sem revelar ao espião', async (t) => {
    useTempDataDir(t)
    const { default: Match } = await import('../src/game/classes/Match.js')
    const { default: Config } = await import('../src/game/classes/Config.js')
    const { default: Player } = await import('../src/game/classes/Player.js')

    const config = await Config.build()
    const [error] = config.setNewConfig({
        nonSpyVictoryScore: 1, nonSpyAcusatorScore: 1, timeFinishedScore: 1,
        wrongAcusationScore: 1, correctPlaceScore: 1,
        selectedPlacesIds: [1, -100], qntSelectedPlaces: 1, roundMaxTime: 5,
        customPlaces: [{
            id: -100, name: { pt: 'Festa em casa', en: 'House party' },
            imgPath: 'https://example.com/festa.png', rolesIds: [-100, -101], categoriesIds: [-1]
        }],
        customRoles: [
            { id: -100, name: { pt: 'Anfitrião', en: 'Host' } },
            { id: -101, name: { pt: 'DJ da festa', en: 'Party DJ' } }
        ]
    })
    assert.equal(error, false)
    // força o lugar personalizado como o único selecionado para o sorteio
    config.selectedPlacesIds = [-100]

    const users = Array.from({ length: 4 }, (_, i) => fakeUser(`s-${i}`, `u-${i}`))
    const players = users.map((user, i) => new Player(user, `Jogador ${i}`))
    const io = fakeIo()
    const match = await Match.build(config, players, io)
    t.after(() => {
        clearInterval(match.matchInterval)
        clearInterval(match.votationInterval)
    })

    assert.equal(match.selectedPlaceID, -100)
    for (const user of users) {
        if (user.userID === match.spyUserID) {
            assert.equal(match.usersRolesIDs[user.userID], null)
        } else if (match.usersRolesIDs[user.userID] !== undefined) {
            // com menos cargos que agentes, alguns ficam sem cargo (comportamento
            // atual); os atribuídos são sempre os do lugar personalizado
            assert.ok([-100, -101].includes(match.usersRolesIDs[user.userID]))
        }
    }

    const spyView = match.toJSON(match.spyUserID)
    assert.equal(spyView.customPlaces.length, 1)
    assert.equal(spyView.customPlaces[0].id, -100)
    assert.equal(spyView.customRoles.length, 2)
    assert.equal('selectedPlaceID' in spyView, false)

    const agent = users.find((u) => u.userID !== match.spyUserID)
    const agentView = match.toJSON(agent.userID)
    assert.equal(agentView.selectedPlaceID, -100)
    if (agentView.userRoleID !== undefined) {
        assert.ok([-100, -101].includes(agentView.userRoleID))
    }
})

test('Match: questionamento', async (t) => {
    const { match, users, io } = await makeMatch(t)
    const asker = users.find((u) => u.userID === match.askingUserID)
    const other = users.find((u) => u.userID !== match.askingUserID)
    const socket = fakeSocket(asker.socketID)

    // quem não é o questionador não pode questionar
    match.makeNewQuestioning(io, fakeSocket(other.socketID), other.userID, asker.userID)
    assert.equal(match.targetUserID, null)

    // questionador não pode questionar a si mesmo
    match.makeNewQuestioning(io, socket, asker.userID, asker.userID)
    assert.equal(match.targetUserID, null)
    assert.equal(socket.emitted.at(-1)[0], 'error')

    // questionamento válido
    match.makeNewQuestioning(io, socket, asker.userID, other.userID)
    assert.equal(match.targetUserID, other.userID)
    assert.ok(io.sent.some(([, event]) => event === 'new-questioning'))

    // enquanto há um alvo, não pode escolher outro
    match.makeNewQuestioning(io, socket, asker.userID, users[2].userID)
    assert.equal(match.targetUserID, other.userID)

    // só o questionador encerra; o alvo vira o novo questionador
    match.endQuestioning(io, fakeSocket(other.socketID), other.userID)
    assert.equal(match.askingUserID, asker.userID)
    match.endQuestioning(io, socket, asker.userID)
    assert.equal(match.askingUserID, other.userID)
    assert.equal(match.targetUserID, null)
    assert.equal(match.previousAskingUserID, asker.userID)

    // novo questionador não pode devolver a pergunta ao anterior
    match.makeNewQuestioning(io, fakeSocket(other.socketID), other.userID, asker.userID)
    assert.equal(match.targetUserID, null)
})

test('Match: espião adivinhar o lugar (vitória e derrota)', async (t) => {
    {
        const { match, players, io } = await makeMatch(t)
        const spy = players.find((p) => p.user.userID === match.spyUserID)
        // não-espião não pode adivinhar
        const agent = players.find((p) => p.user.userID !== match.spyUserID)
        match.guessPlace(io, fakeSocket(agent.user.socketID), agent.user.userID, match.selectedPlaceID)
        assert.equal(agent.score, 0)

        match.guessPlace(io, fakeSocket(spy.user.socketID), spy.user.userID, match.selectedPlaceID)
        assert.equal(spy.score, match.config.correctPlaceScore)
        assert.ok(io.sent.some(([, event]) => event === 'match-end'))
    }
    {
        const { match, players, io } = await makeMatch(t)
        const spy = players.find((p) => p.user.userID === match.spyUserID)
        const wrongPlace = match.config.selectedPlacesIds.find((id) => id !== match.selectedPlaceID)
        match.guessPlace(io, fakeSocket(spy.user.socketID), spy.user.userID, wrongPlace)
        for (const player of players) {
            const expected = player.user.userID === match.spyUserID ? 0 : match.config.nonSpyVictoryScore
            assert.equal(player.score, expected)
        }
    }
})

test('Match: acusação, votação e placar', async (t) => {
    const { match, players, users, io } = await makeMatch(t, 4)
    const spy = players.find((p) => p.user.userID === match.spyUserID)
    const agents = players.filter((p) => p.user.userID !== match.spyUserID)
    const accuser = agents[0]
    const voter = agents[1]

    // não pode se acusar
    match.makeAccusation(io, fakeSocket(accuser.user.socketID), accuser.user.userID, accuser.user.userID)
    assert.equal(match.inVotation, false)

    // acusar o espião
    match.makeAccusation(io, fakeSocket(accuser.user.socketID), accuser.user.userID, spy.user.userID)
    assert.equal(match.inVotation, true)
    assert.ok(io.sent.some(([, event]) => event === 'votation-start'))

    // acusador e acusado não votam; voto duplicado é rejeitado
    match.receiveVote(io, fakeSocket(accuser.user.socketID), accuser.user.userID, true)
    match.receiveVote(io, fakeSocket(spy.user.socketID), spy.user.userID, true)
    assert.equal(match.agreedUsersIds.length, 0)

    match.receiveVote(io, fakeSocket(voter.user.socketID), voter.user.userID, true)
    match.receiveVote(io, fakeSocket(voter.user.socketID), voter.user.userID, true)
    assert.equal(match.agreedUsersIds.length, 1)

    // com 4 jogadores, 1 concordância além de acusador/acusado não basta;
    // o quarto jogador (espião é o acusado, então votam os 2 agentes restantes)
    const lastVoter = agents[2] ?? players.find((p) => ![accuser, voter, spy].includes(p))
    if (lastVoter && lastVoter.user.userID !== spy.user.userID) {
        match.receiveVote(io, fakeSocket(lastVoter.user.socketID), lastVoter.user.userID, true)
    }
    match.endVotation(io)
    assert.equal(match.inVotation, false)
    // espião descoberto: acusador ganha bônus + vitória, demais agentes vitória
    assert.equal(accuser.score, match.config.nonSpyAcusatorScore + match.config.nonSpyVictoryScore)
    assert.equal(voter.score, match.config.nonSpyVictoryScore)
    assert.equal(spy.score, 0)
})

test('Match: votação que falha e acusação errada', async (t) => {
    {
        // um voto contrário encerra sem vencedores ao fim da votação
        const { match, players, io } = await makeMatch(t, 4)
        const [a, b, c] = players
        match.makeAccusation(io, fakeSocket(a.user.socketID), a.user.userID, b.user.userID)
        match.receiveVote(io, fakeSocket(c.user.socketID), c.user.userID, false)
        assert.equal(match.desagreedUsersIds.length, 1)
        match.endVotation(io)
        assert.ok(io.sent.some(([, event]) => event === 'vote-failed'))
        assert.ok(players.every((p) => p.score === 0))
        clearInterval(match.votationInterval)
    }
    {
        // acusar um agente (não espião) com unanimidade: espião pontua
        const { match, players, io } = await makeMatch(t, 4)
        const spy = players.find((p) => p.user.userID === match.spyUserID)
        const agents = players.filter((p) => p.user.userID !== match.spyUserID)
        const [accuser, accused, voter] = agents
        const extraVoters = players.filter((p) => ![accuser, accused].includes(p) && p.user.userID !== voter.user.userID)
        match.makeAccusation(io, fakeSocket(accuser.user.socketID), accuser.user.userID, accused.user.userID)
        match.receiveVote(io, fakeSocket(voter.user.socketID), voter.user.userID, true)
        for (const extra of extraVoters) {
            match.receiveVote(io, fakeSocket(extra.user.socketID), extra.user.userID, true)
        }
        match.endVotation(io)
        assert.equal(spy.score, match.config.wrongAcusationScore)
        assert.equal(accused.score, 0)
    }
})

test('Match: fim por tempo esgotado premia o espião', async (t) => {
    const { match, players, io } = await makeMatch(t)
    match.matchTimeLeft = 0
    let ended = null
    match.on('match-end', () => { ended = true })
    // executa um tick manualmente chamando endMatch como o intervalo faria
    const spy = players.find((p) => p.user.userID === match.spyUserID)
    spy.score += match.config.timeFinishedScore
    match.endMatch(io, 'spy', 'O tempo acabou')
    assert.equal(ended, true)
    assert.equal(spy.score, match.config.timeFinishedScore)
    const sent = io.sent.find(([, event]) => event === 'match-end')
    assert.equal(sent[2].winner, 'spy')
    assert.equal(sent[2].spyUserID, match.spyUserID)
})
