import crypto from 'crypto'
import Options from './Options.js'
import Player from './Player.js'
import Match from './Match.js'

export default class Game {
    static async build(user, username, socket) {
        const newGame = new this(user, username)
        newGame.options = await Options.build()

        socket.emit('success-join', newGame.toJSON())

        return newGame
    }

    constructor(user, username) {
        this.code = crypto.randomUUID()
        this.inMatch = false
        this.leader = user
        this.players = [new Player(user, username)]
        this.options = null
        this.match = null
    }

    addNewPlayer(user, username, socket, io) {
        if (!this.inMatch) {
            var newPlayer = new Player(user, username)
            for (let player of this.players) {
                io.to(player.getSocketID()).emit('new-player-joined', newPlayer.toJSON())
            }

            this.players.push(new Player(user, username))
            socket.emit('success-join', this.toJSON())
        } else {
            socket.emit('failed-join', 'A jogo está em andamento. Espere acabar para poder entrar')
        }
    }

    async startMatch(io) {
        this.match = await Match.build(this.options, this.players.map((player) => (player.user)), io)
        this.inMatch = true
    }

    toJSON(userID) {
        var gameJSON = {
            code: this.code,
            inMatch: this.inMatch,
            leaderUserID: this.leader.userID,
            players: this.players.map((player) => (player.toJSON())),
            options: this.options.toJSON(),
            match: null
        }

        if (this.inMatch) {
            gameJSON.match = this.match.toJSON(userID)
        }

        return gameJSON
    }
}