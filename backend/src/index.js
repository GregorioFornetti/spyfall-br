import express from 'express'
import dbRouters from './db-api/routes/index.js'
import cors from 'cors'
import { port, address } from './db-api/configs/index.js'
import redirectIfNotAuth from './db-api/middlewares/redirect.js'
import session from 'express-session'
import { createServer } from "http";
import { Server } from "socket.io";
import loadRooms from "./game/rooms.js"


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
    cors: {
        origin: "http://localhost:3001"
    }
})

io.on('connection', (socket) => {
    console.log('entrou')

    loadRooms(io, socket)

    socket.emit('hello', 'world')

    socket.on("teste", (arg) => {
        console.log(arg)
    })
})

server.listen(port, () => {
    console.log(`Servidor rodando em: http://${address}:${port}`)
})