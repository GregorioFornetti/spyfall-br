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
        const newMatch = new this(options, users, usersIDs)

        newMatch.usersRolesIDs = selectUserRoles(await getPlaceRoles(newMatch.selectedPlaceID), usersIDs, newMatch.spyUserID)
        newMatch.emitMatchStart(io)

        return newMatch
    }

    constructor(options, users, usersIDs) {
        this.users = users
        this.possiblePlacesIDs = selectMatchPossiblePlaces(options.possiblePlaces, options.possiblePlacesNumber)
        this.selectedPlaceID = selectMatchPlace(this.possiblePlacesIDs)
        this.spyUserID = selectSpy(usersIDs)
        this.askingUserID = selectAskingUser(usersIDs)
        this.targetUserID = null
        this.usersRolesIDs = null
        this.previousAskingUserID = null
    }

    emitMatchStart(io) {
        for (let user of this.users) {
            io.to(user.socketID).emit('match-start', this.toJSON(user.userID))
        }
    }

    removeUser() {

    }

    makeNewQuestioning(io, socket, userID, targetUserID) {
        if (this.targetUserID) {
            socket.emit('error', 'Não é possível questionar outra pessoa, apenas a que você escolheu agora')
            return
        }
        if (userID !== this.askingUserID) {
            socket.emit('error', 'É preciso ser o questionador para poder questionar')
            return
        }
        if (userID === targetUserID) {
            socket.emit('error', 'Você não pode se questionar')
            return
        }
        if (targetUserID === this.previousAskingUserID) {
            socket.emit('error', 'Você não pode questionar o questionador anterior')
            return
        }
        
        this.targetUserID = targetUserID

        for (let user of this.users) {
            io.to(user.socketID).emit('new-questioning', targetUserID)
        }
    }

    endQuestioning(io, socket, userID) {
        if (userID !== this.askingUserID) {
            socket.emit('error', 'Apenas quem está questionando pode finalizar o questionamento')
            return
        }

        this.previousAskingUserID = this.askingUserID
        this.askingUserID = this.targetUserID
        this.targetUserID = null

        for (let user of this.users) {
            io.to(user.socketID).emit('end-questioning')
        }
    }

    guessPlace() {

    }

    makeAccusation() {

    }

    receiveVote() {

    }

    emitMatchResults() {

    }

    toJSON(userID) {
        // Criar um JSON especifico da partida para o usuário com userID passado no parâmetro

        // Informações em comum entre espiões e não espiões
        const userMatch = {
            askingUserID: this.askingUserID,
            targetUserID: this.targetUserID,
            possiblePlacesIDs: this.possiblePlacesIDs,
            previousAskingUserID: this.previousAskingUserID
        }
    
        if (userID === this.spyUserID) {
            // O usuário atual é um espião, então NÃO deve saber qual é o lugar selecionado
            userMatch['isSpy'] = true
        } else {
            // O usuário atual não é o espião, então deve saber qual é o lugar selecionado e seu cargo
            userMatch['isSpy'] = false
            userMatch['selectedPlaceID'] = this.selectedPlaceID
            userMatch['userRoleID'] = this.usersRolesIDs[userID]
        }

        return userMatch
    }
}