import crypto from 'crypto'
import Config from './Config.js'
import Player from './Player.js'
import Match from './Match.js'

function isValidUsername(username) {
    return username.trim().length > 0 && username.trim().length <= 15
}

export default class Game {
    static async build(user, username, socket) {
        if (!isValidUsername(username)) {
            socket.emit('error', 'Nome inválido (precisa ter algum caractere e ser menor que 16 caracteres')
            return false
        }

        const newGame = new this(user, username)
        newGame.config = await Config.build()

        socket.emit('success-join', newGame.toJSON())

        return newGame
    }

    constructor(user, username) {
        this.code = crypto.randomUUID()
        this.inMatch = false
        this.leader = user
        this.players = [new Player(user, username)]
        this.config = null
        this.match = null
    }

    addNewPlayer(user, username, socket, io) {
        if (!isValidUsername(username)) {
            socket.emit('error', 'Nome inválido (precisa ter algum caractere e ser menor que 16 caracteres')
            return false
        }
        if (this.inMatch) {
            socket.emit('error', 'A jogo está em andamento. Espere acabar para poder entrar')
            return false
        }

        var newPlayer = new Player(user, username)
        for (let player of this.players) {
            io.to(player.getSocketID()).emit('new-player-joined', newPlayer.toJSON())
        }

        this.players.push(new Player(user, username))
        socket.emit('success-join', this.toJSON())
        return true
    }

    removePlayer(user, socket, io) {
        this.players = this.players.filter((player) => player.getSocketID() !== user.socketID)

        for (let player of this.players) {
            io.to(player.getSocketID()).emit('player-disconnect', user.userID)
        }

        socket.emit('logout')
    }

    setNewConfig(newConfig, user, socket, io) {
        if (user !== this.leader) {
            socket.emit('config-error', 'Apenas o lider da sala pode alterar as configurações')
            return
        }
        if (this.inMatch) {
            socket.emit('config-error', 'Não é possível alterar as configurações enquanto uma partida está em andamento')
            return
        }

        const [error, errors] = this.config.setNewConfig(newConfig)
        if (error) {
            socket.emit('config-error', errors)
            return
        }

        socket.emit('config-success')

        for (let player of this.players) {
            if (player.user !== user) {
                io.to(player.getSocketID()).emit('new-config', this.config.toJSON())
            }
        }
    }

    playerReady(user, io) {
        const currentPlayer = this.players.find((player) => player.user === user)
        currentPlayer.ready = true

        for (let player of this.players) {
            if (player.user === user) 
                continue
            io.to(player.getSocketID()).emit('player-ready', user.userID)
        }
    }

    playerUnready(user, io) {
        const currentPlayer = this.players.find((player) => player.user === user)
        currentPlayer.ready = false
        
        for (let player of this.players) {
            if (player.user === user) 
                continue
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


        this.match = await Match.build(this.config, this.players, io)
        this.match.on('match-end', () => this.endMatch())
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
            config: this.config.toJSON(),
            match: null
        }

        if (this.inMatch) {
            gameJSON.match = this.match.toJSON(userID)
        }

        return gameJSON
    }

    static validUsername(username) {
        return username.trim().length > 0 && username.trim().length <= 15
    }
}