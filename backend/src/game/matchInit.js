import { sample, random, shuffle } from 'underscore'
import { getPlaceRoles } from '../db-api/models/getters.js'

function selectRandomElement(listOfElements) {
    return listOfElements[random(listOfElements.length - 1)]
}

function selectMatchPossiblePlaces(gamePlacesIDs, numberOfPlaces) {
    return sample(gamePlacesIDs, numberOfPlaces)
}

function selectMatchPlace(matchPossiblePlacesIDs) {
    return selectRandomElement(matchPossiblePlacesIDs)
}

function selectAskingUser(users) {
    return selectRandomElement(users)
}

function selectSpy(users) {
    return selectRandomElement(users)
}

function selectUserRoles(possibleRolesIDs, users, spyID) {
    // Retorna um JSON onde cada chave é um id de usuário e o valor é o ID do cargo sorteado (se o usuário for espião, o valor é null)
    // <key = userID> : <value = randomRoleID>

    var currentAvailableRoles
    var usersRolesJSON = {}
    for (let user of users) {
        if (user.id === spyID) {
            usersRolesJSON[user.id] = null
            continue
        }

        if (!currentAvailableRoles) {
            currentAvailableRoles = shuffle(possibleRolesIDs)
        }
        usersRolesJSON[user.id] = currentAvailableRoles[0]
        currentAvailableRoles.shift()
    }
    return usersRolesJSON
}

async function createMatchJSON(gameOptions, users) {
    const match = {}
    match['possiblePlacesIDs'] = selectMatchPossiblePlaces(gameOptions.possiblePlaces, gameOptions.possiblePlacesNumber)
    match['selectedPlaceID'] = selectMatchPlace(match.possiblePlacesIDs)
    match['spyUserID'] = selectSpy(users)
    match['askingUserID'] = selectAskingUser(users)
    match['targetUserID'] = null
    match['usersRolesIDs'] = selectUserRoles(await getPlaceRoles(match.selectedPlaceID), users)

    return match
}

export function loadMatches(io, socket, games, users) {
    socket.on('match-start', (arg) => {
        var roomCode = users[socket.sessionID]['roomCode']
        var gameOptions = games[roomCode].game.options
        var matchJSON = createMatchJSON(gameOptions, users)
        games[roomCode]['match'] = matchJSON
        
    })
}

export function createUserMatchJSON(matchJSON, userID) {
    // Cria um JSON contendo as informações específicas da partida para o jogador com id = userID (parâmetro)
    
    // Informações em comum entre espiões e não espiões
    const userMatch = {
        askingUserID: matchJSON.askingUserID,
        targetUserID: matchJSON.targetUserID,
        possiblePlacesIDs: matchJSON.possiblePlacesIDs
    }

    if (userID === matchJSON.spyUserID) {
        // O usuário atual é um espião, então NÃO deve saber qual é o lugar selecionado
        userMatch['isSpy'] = true
    } else {
        // O usuário atual não é o espião, então deve saber qual é o lugar selecionado e seu cargo
        userMatch['isSpy'] = false
        userMatch['selectedPlaceID'] = matchJSON.selectedPlaceID
        userMatch['userRoleID'] = matchJSON.usersRolesIDs[userID]
    }

    return userMatch
}