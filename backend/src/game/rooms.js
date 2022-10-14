import crypto from 'crypto'
import { getPlaces } from '../db-api/models/getters.js'

export default function loadRooms(io, socket, games, users) {

    socket.on('create-room', async (arg) => {
        var {username} = arg
        do {
            var roomCode = crypto.randomUUID()
        } while(io.sockets.adapter.rooms.has(roomCode))

        socket.join(roomCode)
        console.log("USER ID:")
        console.log(users[socket.sessionID].userID)
        
        games[roomCode] = {
            game: {
                roomCode: roomCode,
                inGame: false,
                leaderUserID: socket.userID, 
                options: {
                    possiblePlaces: [(await getPlaces()).map((place) => (place.id))],
                    possiblePlacesNumber: 20
                }
            },
            users: [
                {
                    id: socket.userID,
                    username: username,
                    score: 0
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
                score: 0
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