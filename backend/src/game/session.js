import crypto from 'crypto'

// https://socket.io/get-started/private-messaging-part-2/


function randomId() {
    return crypto.randomBytes(8).toString("hex")
}

export function handleSession(socket, next, users) {
    const sessionID = socket.handshake.auth.sessionID;
    if (sessionID) {
        // Sessão já existe, reconectar o usuário
        const user = users[sessionID]
        if (user) {
            socket.sessionID = sessionID;
            socket.userID = user.userID;
            return next();
        }
    }

    // Usuário novo, criar nova conexão
    socket.sessionID = randomId()
    socket.userID = randomId()
    users[socket.sessionID] = {}

    next();
}

export function loadSession(socket, users, games) {
    users[socket.sessionID]['userID'] = socket.userID
    users[socket.sessionID]['socketID'] = socket.id

    var newSession = {
        sessionID: socket.sessionID,
        userID: socket.userID,
    }

    var roomCode = users[socket.sessionID]['roomCode']
    if (roomCode) {
        newSession['gameInfo'] = games[roomCode]
        socket.join(roomCode)
    }

    socket.emit("session", newSession)
}