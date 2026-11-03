import express from 'express'
import cors from 'cors'
import { admPort, admPath, dbPath } from './configs/index.js'
import categoryRouter from './db-api/routes/CategoryRoutes.js'
import placeRouter from './db-api/routes/PlaceRoutes.js'
import roleRouter from './db-api/routes/RoleRoutes.js'

const frontendAdmBuildPath = '../frontend/spyfall-br-adm/build'

const app = express()

if (process.env.NODE_ENV === 'production') {
    app.use(express.json())
} else {
    app.use(express.json(), cors())
}

// Sem autenticação: este servidor só deve ser ligado quando necessário
// e desligado logo em seguida (ver README).
app.use(dbPath, categoryRouter)
app.use(dbPath, placeRouter)
app.use(dbPath, roleRouter)

app.use(admPath, express.static(frontendAdmBuildPath))

app.listen(admPort, () => {
    console.log(`Servidor de administração spyfall online na porta ${admPort}`)
})
