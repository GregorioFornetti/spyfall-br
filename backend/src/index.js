import express from 'express'
import dbRouters from './db-api/routes/index.js'
import cors from 'cors'
import { port, address } from './db-api/configs/index.js'
import redirectIfNotAuth from './db-api/middlewares/redirect.js'
import session from 'express-session'
import { createServer } from "http";
import { Server } from "socket.io";
import gameEventsHandler from "./game/eventsHandlers/gameEventsHandler.js"
import { handleSession, loadSession } from './game/session.js'
import matchEventsHandler from './game/eventsHandlers/matchEventsHandler.js'



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

app.use('', express.static('src/views/game'))
app.use(redirectIfNotAuth)
app.use('/adm', express.static('src/views/adm'))



const server = createServer(app)
const io = new Server(server, {
    cookie: true,
    cors: {
        origin: "http://localhost:3001"
    }
})
const games = {}
const users = {}

io.use((socket, next) => handleSession(socket, next, users));

io.on('connection', (socket) => {
    loadSession(socket, users)

    gameEventsHandler(io, socket, games, users)

    matchEventsHandler(io, socket, users)
})

server.listen(port, () => {
    console.log(`Servidor rodando em: http://${address}:${port}`)
})