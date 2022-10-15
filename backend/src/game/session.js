
import User from './classes/User.js';
import randomID from './randomID.js';


export function handleSession(socket, next, users) {
    const sessionID = socket.handshake.auth.sessionID;
    if (sessionID) {
        // Sessão já existe, reconectar o usuário
        const user = users[sessionID]
        if (user) {
            socket.sessionID = sessionID;
            socket.userID = user.userID;
            user.socketID = socket.id
            return next();
        }
    }

    // Usuário novo, criar nova conexão
    var user = new User(socket.id)
    var newSessionID = randomID()
    users[newSessionID] = user

    socket.sessionID = newSessionID
    socket.userID = user.userID

    return next();
}

export function loadSession(socket, users) {
    var user = users[socket.sessionID]
    var newSession = {
        sessionID: socket.sessionID,
        userID: socket.userID,
    }
    if (user.game) {
        newSession.gameInfo = user.game.toJSON(user.userID)
    }

    socket.emit("session", newSession)
}