import express from 'express'
import dbRouters from './db-api/routes/index.js'
import cors from 'cors'
import { port, address } from './db-api/configs/index.js'
import redirectIfNotAuth from './db-api/middlewares/redirect.js'
import session from 'express-session'

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

app.listen(port, () => {
    console.log(`Servidor rodando em: http://${address}:${port}`)
})