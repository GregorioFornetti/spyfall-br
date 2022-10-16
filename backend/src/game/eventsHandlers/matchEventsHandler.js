

export default function matchEventsHandler(io, socket, users) {
    socket.on('match-start', async (arg) => {
        var user = users[socket.sessionID]
        var game = user.game
        
        if (!game || game.inMatch) {
            return
        }

        await game.startMatch(io)
    })
}