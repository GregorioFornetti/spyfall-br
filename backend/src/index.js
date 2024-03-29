import express from 'express'
import cors from 'cors'
import { port, gamePath, admPath, dbPath } from './configs/index.js'
import redirectIfNotAuth from './db-api/middlewares/redirect.js'
import session from 'express-session'
import { createServer } from "http";
import { Server } from "socket.io";
import gameEventsHandler from "./game/eventsHandlers/gameEventsHandler.js"
import { handleSession, loadSession } from './game/session.js'
import matchEventsHandler from './game/eventsHandlers/matchEventsHandler.js'
import authenticationRouter from './db-api/routes/AuthenticationRoutes.js'
import categoryRouter from './db-api/routes/CategoryRoutes.js'
import placeRouter from './db-api/routes/PlaceRoutes.js'
import roleRouter from './db-api/routes/RoleRoutes.js'


const frontendPath = '../frontend'
const frontendAdmBuildPath = `${frontendPath}/spyfall-br-adm/build`
const frontendGameBuildPath = `${frontendPath}/spyfall-br-game/build`

const app = express()

app.use(session({
    secret: 'segredo123',
    resave: false,
    saveUninitialized: true
}))

if (process.env.NODE_ENV === 'production') {
    app.use(
        express.json()
    )
} else {
    app.use(
        express.json(),
        cors() // AVISO: Remover isso quando for colocar em produção. É para parar de bloquear o frontend de acessar o backend no localhost
    )
}
app.use(admPath, authenticationRouter)
app.use(dbPath, categoryRouter)
app.use(dbPath, placeRouter)
app.use(dbPath, roleRouter)

app.use(redirectIfNotAuth)
app.use(admPath, express.static(frontendAdmBuildPath))

app.use(gamePath, express.static(frontendGameBuildPath))
app.use(`${gamePath}/:URLGameCode`, express.static(frontendGameBuildPath))


const server = createServer(app)

let corsOptions

if (process.env.NODE_ENV === 'development') {
    corsOptions = {
        origin: "http://localhost:3001"
    }
}

const io = new Server(server, {
    cookie: true,
    cors: corsOptions,
    path: `${gamePath}/multiplayer/socket.io/`
})
const games = {}
const users = {}

io.use((socket, next) => handleSession(socket, next, users));

io.on('connection', (socket) => {

    users[socket.sessionID].online = true
    
    loadSession(socket, users)

    gameEventsHandler(io, socket, games, users)

    matchEventsHandler(io, socket, users)

    socket.on('disconnect', () => {
        users[socket.sessionID].online = false
    })
})


server.listen(port, () => {
    console.log(`Servidor spyfall online na porta ${port}`)
})

setInterval(() => {
    // cleanup - irá buscar por jogadores inativos por um bom tempo e salas vazias por muito tempo e limpará eles

    // Limpando jogos inativos
    for (const gameCode in games) {
        if (games[gameCode].players.length === 0 || games[gameCode].players.every((player) => !player.user.online)) {
            delete games[gameCode]
        }
    }

    // Limpando usuários inativos
    for (const sessionID in users) {
        if (!users[sessionID].online) {
            delete users[sessionID]
        }
    }
}, 1000 * 60 * 10)  // A cada 10 minutos irá fazer a limpeza