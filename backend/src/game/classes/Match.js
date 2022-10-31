import { sample, random, shuffle } from 'underscore'
import { getPlaceRoles } from '../../db-api/models/getters.js'

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

function selectUserRoles(possibleRolesIDs, usersIDs, spyID) {
    // Retorna um JSON onde cada chave é um id de usuário e o valor é o ID do cargo sorteado (se o usuário for espião, o valor é null)
    // <key = userID> : <value = randomRoleID>
    var currentAvailableRoles
    var usersRolesJSON = {}
    
    for (let userID of usersIDs) {
        if (userID === spyID) {
            usersRolesJSON[userID] = null
            continue
        }

        if (!currentAvailableRoles) {
            currentAvailableRoles = shuffle(possibleRolesIDs)
        }
        usersRolesJSON[userID] = currentAvailableRoles[0]
        currentAvailableRoles.shift()
    }
    return usersRolesJSON
}


export default class Match {
    static async build(options, users, io) {
        const usersIDs = users.map((user) => (user.userID))
        const newMatch = new this(options, usersIDs)

        newMatch.usersRolesIDs = selectUserRoles(await getPlaceRoles(newMatch.selectedPlaceID), usersIDs, newMatch.spyUserID)
        console.log(newMatch.usersRolesIDs)
        newMatch.emitMatchStart(users, io)

        return newMatch
    }

    constructor(options, usersIDs) {
        this.possiblePlacesIDs = selectMatchPossiblePlaces(options.possiblePlaces, options.possiblePlacesNumber)
        this.selectedPlaceID = selectMatchPlace(this.possiblePlacesIDs)
        this.spyUserID = selectSpy(usersIDs)
        this.askingUserID = selectAskingUser(usersIDs)
        this.targetUserID = null
        this.usersRolesIDs = null
    }

    emitMatchStart(users, io) {
        for (let user of users) {
            io.to(user.socketID).emit('match-start', this.toJSON(user.userID))
        }
    }

    toJSON(userID) {
        console.log('oi')
        // Criar um JSON especifico da partida para o usuário com userID passado no parâmetro

        // Informações em comum entre espiões e não espiões
        const userMatch = {
            askingUserID: this.askingUserID,
            targetUserID: this.targetUserID,
            possiblePlacesIDs: this.possiblePlacesIDs
        }
    
        if (userID === this.spyUserID) {
            // O usuário atual é um espião, então NÃO deve saber qual é o lugar selecionado
            userMatch['isSpy'] = true
        } else {
            // O usuário atual não é o espião, então deve saber qual é o lugar selecionado e seu cargo
            userMatch['isSpy'] = false
            userMatch['selectedPlaceID'] = this.selectedPlaceID
            console.log('morri AQUI')
            userMatch['userRoleID'] = this.usersRolesIDs[userID]
        }
        console.log('AQUI:')
        console.log(userMatch['userRoleID'])

        return userMatch
    }
}