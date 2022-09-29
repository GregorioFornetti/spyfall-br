import express from 'express'
import dbRouters from './db-api/routes/index.js'

const app = express()
app.use(express.json(), ...dbRouters)
const port = 3000

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})