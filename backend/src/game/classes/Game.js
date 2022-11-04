import crypto from 'crypto'
import Options from './Options.js'
import Player from './Player.js'
import Match from './Match.js'
import { all } from 'underscore'

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

    removePlayer(user, socket, io) {
        this.players = this.players.filter((player) => player.getSocketID() !== user.socketID)

        for (let player of this.players) {
            io.to(player.getSocketID()).emit('player-disconnect', user.userID)
        }

        socket.emit('logout')
    }

    playerReady(user, io) {
        this.players.find((player) => player.user === user).ready = true

        for (let player of this.players) {
            io.to(player.getSocketID()).emit('player-ready', user.userID)
        }
    }

    playerUnready(user, io) {
        this.players.find((player) => player.user === user).ready = false
        
        for (let player of this.players) {
            io.to(player.getSocketID()).emit('player-unready', user.userID)
        }
    }

    allPlayersReady() {
        return this.players.every((player) => player.ready || player.user === this.leader)
    }

    async startMatch(io, user, socket) {
        if (user !== this.leader) {
            socket.emit('error', 'Apenas o lider da sala pode começar a partida')
            return
        }
        if (!this.allPlayersReady()) {
            socket.emit('error', 'Só é possível começar a partida se todos estiverem prontos')
            return
        }
        if (this.players.length < 3) {
            socket.emit('error', 'Só é possível começar uma partida com 3 ou mais jogadores')
            return
        }


        this.match = await Match.build(this.options, this.players.map((player) => (player.user)), io)
        for (let player of this.players) {
            player.ready = false
        }
        this.inMatch = true
    }

    endMatch() {
        this.match = null
        this.inMatch = false
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