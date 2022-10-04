import express from 'express'
import dbRouters from './db-api/routes/index.js'
import cors from 'cors'
import { port, address } from './db-api/configs/index.js'

const app = express()
app.use(
    express.json(),
    cors(), // AVISO: Remover isso quando for colocar em produção. É para parar de bloquear o frontend de acessar o backend no localhost
    ...dbRouters
)

app.listen(port, () => {
    console.log(`Servidor rodando em: http://${address}:${port}`)
})