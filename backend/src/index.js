import express from 'express'
import dbRouters from './db-api/routes/index.js'
import cors from 'cors'
import { port, address } from './db-api/configs/index.js'
import redirectIfNotAuth from './db-api/middlewares/redirect.js'
import session from 'express-session'
import { createServer } from "http";
import { Server } from "socket.io";
import loadRooms from "./game/rooms.js"
import crypto from 'crypto'



const app = express()
app.use(session({
    secret: 'segredo123',
    resave: false,
    saveUninitialized: true
}))
app.use(
    express.json(),
    cors(), // AVISO: Remover isso quando for colocar em produção. É para parar de bloquear o frontend de acessar o backend no localhost
    ...dbRouters
)

app.use(redirectIfNotAuth)
app.use('/adm', express.static('src/db-api/views/adm'))



const server = createServer(app)
const io = new Server(server, {
    cookie: true,
    cors: {
        origin: "http://localhost:3001"
    }
})
const games = {}
const users = {}

const randomId = () => crypto.randomBytes(8).toString("hex");
// https://socket.io/get-started/private-messaging-part-2/
io.use((socket, next) => {
    const sessionID = socket.handshake.auth.sessionID;
    console.log(sessionID)
    if (sessionID) {
        const user = users[sessionID]
        if (user) {
            console.log('oi')
            socket.sessionID = sessionID;
            socket.userID = user.userID;
            return next();
        }
    }

    socket.sessionID = randomId()
    socket.userID = randomId()
    users[socket.sessionID] = {}
    next();
});

io.on('connection', (socket) => {
    users[socket.sessionID]['userID'] = socket.userID
    socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID,
    });

    loadRooms(io, socket, games)
})

server.listen(port, () => {
    console.log(`Servidor rodando em: http://${address}:${port}`)
})