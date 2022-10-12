import crypto from 'crypto'

export default function loadRooms(io, socket, games, users) {

    socket.on('create-room', (arg) => {
        var {username} = arg
        do {
            var roomCode = crypto.randomUUID()
        } while(io.sockets.adapter.rooms.has(roomCode))

        socket.join(roomCode)
        
        games[roomCode] = {
            users: [
                {
                    id: socket.userID,
                    username: username,
                    score: 0,
                    leader: true
                }
            ]
        }
        socket.emit('success-join', games[roomCode])  // Colocar mais informações para enviar aqui ...

        users[socket.sessionID]['roomCode'] = roomCode
        console.log(io.sockets.adapter.rooms)
    })

    socket.on('join-room', (arg) => {
        var {roomCode, username} = arg
        if (games.hasOwnProperty(roomCode)) {
            let newPlayer = {
                id: socket.userID,
                username: username,
                score: 0,
                leader: false
            }
            games[roomCode].users.push(newPlayer)

            io.to(roomCode).emit('new-user-joined', newPlayer)  // Envia informação do novo player para os outros jogadores

            users[socket.sessionID]['roomCode'] = roomCode
            socket.join(roomCode)
            socket.emit('success-join', games[roomCode])  // Envia as informações do jogo para o novo jogador atual
        } else {
            socket.emit('failed-join')
        }
        
        console.log(io.sockets.adapter.rooms)
    })
}