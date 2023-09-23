import { Sequelize } from 'sequelize'
import { dbHost, dbName, dbPassword, dbPort, dbUser } from '../../configs/index.js'

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    dialect: 'postgres',
    host: dbHost,
    port: dbPort,
    password: dbPassword
})

try {
    await sequelize.authenticate()
    console.log('Deu bom')
} catch(error) {
    console.error('deu ruim', error)
}
    
export default sequelize