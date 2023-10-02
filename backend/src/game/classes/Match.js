import { sample, random, shuffle } from 'underscore'
import { getPlaceRoles } from '../../db-api/models/getters.js'
import { EventEmitter } from 'node:events';

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


export default class Match extends EventEmitter {
    static async build(config, players, io) {

        const usersIDs = players.map((player) => (player.user.userID))
        const newMatch = new this(config, players, usersIDs, io)

        newMatch.usersRolesIDs = selectUserRoles(await getPlaceRoles(newMatch.selectedPlaceID), usersIDs, newMatch.spyUserID)
        newMatch.emitMatchStart(io)

        return newMatch
    }

    constructor(config, players, usersIDs, io) {
        super()
        this.config = config
        this.players = players
        this.users = players.map((player) => (player.user))
        this.possiblePlacesIDs = selectMatchPossiblePlaces(config.selectedPlacesIds, config.qntSelectedPlaces)
        this.selectedPlaceID = selectMatchPlace(this.possiblePlacesIDs)
        this.spyUserID = selectSpy(usersIDs)
        this.askingUserID = selectAskingUser(usersIDs)
        this.targetUserID = null
        this.usersRolesIDs = null
        this.previousAskingUserID = null
        this.matchTimeLeft = config.roundMaxTime
        this.matchInterval = setInterval(() => {
            if (this.matchTimeLeft <= 0) {
                this.matchTimeLeft = 0
                for (let player of this.players) {
                    if (player.user.userID === this.spyUserID) {
                        player.score += this.config.timeFinishedScore
                        break
                    }
                }
                clearInterval(this.matchInterval)
                this.endMatch(io, 'spy', 'O tempo acabou')
                return
            }
            this.matchTimeLeft--
        }, 1000)

        this.inVotation = false
        this.agreedUsersIds = []
        this.desagreedUsersIds = []
        this.accuserUserID = null
        this.accusedUserID = null
        this.votationTime = config.votationTime
        this.votationTimeLeft = null
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
            return
        }

        if (placeID === this.selectedPlaceID) {
            // Espião ganhou
            for (let player of this.players) {
                if (player.user.userID === this.spyUserID) {
                    player.score += this.config.correctPlaceScore
                    break
                }
            }
            this.endMatch(io, 'spy', 'O espião adivinhou corretamente o local')
        } else {
            // Espião perdeu (agentes ganharam)
            for (let player of this.players) {
                if (player.user.userID !== this.spyUserID) {
                    player.score += this.config.nonSpyVictoryScore
                }
            }
            this.endMatch(io, 'agents', 'O espião errou o local')
        }
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
        this.votationTimeLeft = this.votationTime

        this.votationInterval = setInterval(() => {
            if (this.votationTimeLeft <= 0) {
                this.endVotation(io)
                return
            }
            this.votationTimeLeft--
        }, 1000)
        
        for (let user of this.users) {
            io.to(user.socketID).emit('votation-start', [accuserUserID, accusedUserID, this.votationTimeLeft])
        }
    }

    endVotation(io) {
        clearInterval(this.votationInterval)

        if (this.agreedUsersIds.length === this.users.length - 2) {
            if (this.accusedUserID === this.spyUserID) {
                for (let player of this.players) {
                    if (player.user.userID === this.accuserUserID) {
                        player.score += this.config.nonSpyAcusatorScore + this.config.nonSpyVictoryScore
                    } else if (player.user.userID !== this.spyUserID) {
                        player.score += this.config.nonSpyVictoryScore
                    }
                }
                this.endMatch(io, 'agents', 'O espião foi descoberto')
            } else {
                for (let player of this.players) {
                    if (player.user.userID === this.spyUserID) {
                        player.score += this.config.wrongAcusationScore
                        break
                    }
                }
                this.endMatch(io, 'spy', 'Um agente foi julgado incorretamente')
            }
        } else {
            for (let user of this.users) {
                io.to(user.socketID).emit('vote-failed')
            }
        }

        this.inVotation = false
        this.accusedUserID = null
        this.accuserUserID = null
        this.agreedUsersIds = []
        this.desagreedUsersIds = []
        this.votationTimeLeft = null
        this.votationInterval = null
    }

    receiveVote(io, socket, userID, agree) {
        if (!this.inVotation) {
            socket.emit('error', 'Não há uma votação em andamento para votar')
            return
        }
        if (userID === this.accusedUserID || userID === this.accuserUserID) {
            socket.emit('error', 'Não é possível votar se você é o acusador ou o acusado')
            return
        }
        if (this.agreedUsersIds.includes(userID) || this.desagreedUsersIds.includes(userID)) {
            socket.emit('error', 'Não é possível votar novamente')
            return
        }

        if (agree) {
            // Usuário votou a favor da votação
            this.agreedUsersIds.push(userID)

            for (let user of this.users) {
                io.to(user.socketID).emit('agreed-vote', userID)
            }

            if (this.agreedUsersIds.length === this.users.length - 2) {
                // Todos que podem votar votaram a favor, então a partida deve ser finalizada
                if (this.votationTimeLeft > 5) {
                    this.votationTimeLeft = 5
                }
            }
        } else {
            // Usuário votou contra a votação
            if (this.desagreedUsersIds.length === 0) {
                // A primeira pessoa discordou, iniciar timer para fim de votação
                if (this.votationTimeLeft > 5) {
                    this.votationTimeLeft = 5
                }
            }

            this.desagreedUsersIds.push(userID)

            for (let user of this.users) {
                io.to(user.socketID).emit('desagreed-vote', userID)
            }
        }
    }

    endMatch(io, winner, winDescription) {
        console.log(this.spyUserID)
        let matchResult = {
            spyUserID: this.spyUserID,
            selectedPlaceID: this.selectedPlaceID,
            winner: winner,
            winDescription: winDescription,
            players: this.players.map((player) => (player.toJSON()))
        }

        for (let user of this.users) {
            io.to(user.socketID).emit('match-end', matchResult)
        }
        clearInterval(this.matchInterval)
        this.emit('match-end')
    }

    toJSON(userID) {
        // Criar um JSON especifico da partida para o usuário com userID passado no parâmetro

        // Informações em comum entre espiões e não espiões
        const userMatch = {
            askingUserID: this.askingUserID,
            targetUserID: this.targetUserID,
            possiblePlacesIDs: this.possiblePlacesIDs,
            previousAskingUserID: this.previousAskingUserID,
            matchTimeLeft: this.matchTimeLeft,

            inVotation: this.inVotation,
            accusedUserID: this.accusedUserID,
            accuserUserID: this.accuserUserID,
            agreedUsersIds: this.agreedUsersIds,
            desagreedUsersIds: this.desagreedUsersIds,
            votationTimeLeft: this.votationTimeLeft
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