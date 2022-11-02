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

        this.inVotation = false
        this.agreedUsersIds = []
        this.desagreedUsersIds = []
        this.accuserUserID = null
        this.accusedUserID = null
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

    guessPlace(io, socket, userID, placeID) {
        // Retorna true se a partida acabou ou false se ainda não acabou
        
        if (userID !== this.spyUserID) {
            socket.emit('error', 'Apenas o espião pode advinhar um lugar')
            return false
        }

        let matchResult = {
            spyUserID: this.spyUserID,
            selectedPlaceID: this.selectedPlaceID
        }
        if (placeID === this.selectedPlaceID) {
            // Espião ganhou
            this.endMatch(io, 'spy', 'O espião adivinhou corretamente o local')
        } else {
            // Espião perdeu (agentes ganharam)
            this.endMatch(io, 'agents', 'O espião errou o local')
        }

        return true
    }

    makeAccusation(io, socket, accuserUserID, accusedUserID) {
        if (accuserUserID === accusedUserID) {
            socket.emit('error', 'Não é possível se acusar')
            return
        }

        this.inVotation = true
        this.accuserUserID = accuserUserID
        this.accusedUserID = accusedUserID
        this.agreedUsersIds = []
        this.desagreedUsersIds = []
        
        for (let user of this.users) {
            io.to(user.socketID).emit('votation-start', [accuserUserID, accusedUserID])
        }
    }

    async receiveVote(io, socket, userID, agree) {
        if (!this.inVotation) {
            socket.emit('error', 'Não há uma votação em andamento para votar')
            return false
        }
        if (userID === this.accusedUserID || userID === this.accuserUserID) {
            socket.emit('error', 'Não é possível votar se você é o acusador ou o acusado')
            return false
        }
        if (this.agreedUsersIds.includes(userID) || this.desagreedUsersIds.includes(userID)) {
            socket.emit('error', 'Não é possível votar novamente')
            return false
        }

        if (agree) {
            // Usuário votou a favor da votação
            this.agreedUsersIds.push(userID)

            for (let user of this.users) {
                io.to(user.socketID).emit('agreed-vote', userID)
            }

            if (this.agreedUsersIds.length === this.users.length - 2) {
                // Todos que podem votar votaram a favor, então a partida deve ser finalizada
                let secsToEnd = 5
                let interval = setInterval(() => {
                    secsToEnd--
                    if (secsToEnd === 0) {
                        clearInterval(interval)

                        if (this.accusedUserID === this.spyUserID) {
                            console.log(this.endMatch)
                            this.endMatch(io, 'agents', 'O espião foi descoberto')
                        } else {
                            this.endMatch(io, 'spy', 'Um agente foi julgado incorretamente')
                        }
                    }
                }, 1000)
                await new Promise(resolve => setTimeout(resolve, 1000 * secsToEnd));
                return true
            }
        } else {
            // Usuário votou contra a votação
            if (this.desagreedUsersIds.length === 0) {
                // A primeira pessoa discordou, iniciar timer para fim de votação
                let secsToEnd = 5
                let interval = setInterval(() => {
                    secsToEnd--
                    if (secsToEnd === 0) {
                        clearInterval(interval)

                        this.inVotation = false
                        this.accusedUserID = null
                        this.accuserUserID = null
                        this.agreedUsersIds = []
                        this.desagreedUsersIds = []

                        for (let user of this.users) {
                            io.to(user.socketID).emit('vote-failed')
                        }
                    }
                }, 1000)
                
            }

            this.desagreedUsersIds.push(userID)

            for (let user of this.users) {
                io.to(user.socketID).emit('desagreed-vote', userID)
            }
        }
        return false
    }

    endMatch(io, winner, winDescription) {
        let matchResult = {
            spyUserID: this.spyUserID,
            selectedPlaceID: this.selectedPlaceID,
            winner: winner,
            winDescription: winDescription
        }

        for (let user of this.users) {
            io.to(user.socketID).emit('match-end', matchResult)
        }
    }

    toJSON(userID) {
        // Criar um JSON especifico da partida para o usuário com userID passado no parâmetro

        // Informações em comum entre espiões e não espiões
        const userMatch = {
            askingUserID: this.askingUserID,
            targetUserID: this.targetUserID,
            possiblePlacesIDs: this.possiblePlacesIDs,
            previousAskingUserID: this.previousAskingUserID,
            inVotation: this.inVotation,
            accusedUserID: this.accusedUserID,
            accuserUserID: this.accuserUserID,
            agreedUsersIds: this.agreedUsersIds,
            desagreedUsersIds: this.desagreedUsersIds
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