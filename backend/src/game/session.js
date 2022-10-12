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

export function loadSession(socket, users) {
    users[socket.sessionID]['userID'] = socket.userID
    socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID,
    });
}