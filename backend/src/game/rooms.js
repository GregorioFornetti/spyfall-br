import crypto from 'crypto'

export default function loadRooms(io, socket) {
    socket.on('create-room', (arg) => {
        var {username} = arg
        do {
            var roomCode = crypto.randomUUID()
        } while(io.sockets.adapter.rooms.has(roomCode))

        socket.join(roomCode)
        socket.emit('success-join')  // Colocar mais informações para enviar aqui ...

        console.log(io.sockets.adapter.rooms)
    })

    socket.on('join-room', (arg) => {
        var {roomCode, username} = arg
        if (io.sockets.adapter.rooms.has(roomCode)) {
            socket.join(roomCode)
            socket.emit('success-join')  // Colocar mais informações para enviar aqui ...
        } else {
            socket.emit('failed-join')
        }
        
        socket.emit('success-join')
        console.log(io.sockets.adapter.rooms)
    })
}