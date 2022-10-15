
export function emitEventForAllPlayers(players, eventName, eventMessage, io) {
    for (let player of players) {
        let socketID = player.getSocketID()
        io.to(socketID).emit(eventName, eventMessage)
    }
}