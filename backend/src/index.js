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
app.use(
    express.json(),
    cors() // AVISO: Remover isso quando for colocar em produção. É para parar de bloquear o frontend de acessar o backend no localhost
)
app.use(admPath, authenticationRouter)
app.use(dbPath, categoryRouter)
app.use(dbPath, placeRouter)
app.use(dbPath, roleRouter)

app.use(redirectIfNotAuth)
app.use(admPath, express.static(frontendAdmBuildPath))

app.use(gamePath, express.static(frontendGameBuildPath))
app.use(`${gamePath}/:URLGameCode`, express.static(frontendGameBuildPath))


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
    console.log(`Servidor spyfall online na porta ${port}`)
})