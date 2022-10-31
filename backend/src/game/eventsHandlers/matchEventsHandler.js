

export default function matchEventsHandler(io, socket, users) {
    socket.on('match-start', async (arg) => {
        var user = users[socket.sessionID]
        var game = user.game
        
        if (!game || game.inMatch) {
            return
        }

        await game.startMatch(io)
    })

    socket.on('new-questioning', (arg) => {
        var targetUserID = arg
        var user = users[socket.sessionID]
        var game = user.game

        if (!game || !game.inMatch) {
            return
        }

        game.match.makeNewQuestioning(io, socket, user.userID, targetUserID)
    })

    socket.on('end-questioning', (arg) => {
        var user = users[socket.sessionID]
        var game = user.game

        if (!game || !game.inMatch) {
            return
        }

        game.match.endQuestioning(io, socket, user.userID)
    })

    socket.on('guess-place', (arg) => {
        var placeID = arg
        var user = users[socket.sessionID]
        var game = user.game

        if (!game || !game.inMatch) {
            return
        }

        if (game.match.guessPlace(io, socket, user.userID, placeID)) {
            game.endMatch()
        }
    })

    socket.on('accuse', (arg) => {
        var accusedUserID = arg
        var user = users[socket.sessionID]
        var game = user.game

        if (!game || !game.inMatch) {
            return
        }

        game.match.makeAccusation(io, socket, user.userID, accusedUserID)
    })
}