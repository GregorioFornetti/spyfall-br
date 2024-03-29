import Game from '../classes/Game.js'


export default function gameEventsHandler(io, socket, games, users) {

    socket.on('create-room', async (arg) => {
        var {username} = arg
        var user = users[socket.sessionID]

        var game = await Game.build(user, username, socket)
        if (game) {
            user.game = game
            games[game.code] = game
        }
    })

    socket.on('join-room', (arg) => {
        var {roomCode, username} = arg
        var user = users[socket.sessionID]

        if (games.hasOwnProperty(roomCode)) {
            var playerAdded = games[roomCode].addNewPlayer(user, username, socket, io)
            if (playerAdded) {
                user.game = games[roomCode]
            }
        } else {
            socket.emit('error', 'Não foi possível encontrar um jogo com esse código !')
        }
    })

    socket.on('set-new-config', (arg) => {
        var user = users[socket.sessionID]
        var game = user.game

        if (game) {
            game.setNewConfig(arg, user, socket, io)
        }
    })

    socket.on('player-ready', () => {
        var user = users[socket.sessionID]
        var game = user.game

        if (game) {
            game.playerReady(user, io)
        }
    })

    socket.on('player-unready', () => {
        var user = users[socket.sessionID]
        var game = user.game

        if (game) {
            game.playerUnready(user, io)
        }
    })

    socket.on('logout', () => {
        var user = users[socket.sessionID]
        var game = user.game
        
        if (game) {
            game.removePlayer(user, socket, io)
            user.game = null
        }
    })
}