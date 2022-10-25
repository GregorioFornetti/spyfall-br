import { Sequelize } from 'sequelize'
import mysql from 'mysql2/promise'

async function createConnection() {
    return mysql.createConnection({
        host: 'spy-fall-br.cq0ijpvqeyuk.sa-east-1.rds.amazonaws.com',
        port: '3306',
        user: 'admin',
        password: 'greglol123',
    }).then(async (connection) => {
        return connection.query('CREATE DATABASE IF NOT EXISTS spyfallbr;')
        .then(async () => {
            const sequelize = new Sequelize('spyfallbr', 'admin', 'greglol123', {
                dialect: 'mysql',
                host: 'spy-fall-br.cq0ijpvqeyuk.sa-east-1.rds.amazonaws.com',
                port: '3306',
                logging: console.log,
                maxConcurrentQueries: 100,
                ssl: 'Amazon RDS',
                pool: { maxConnections: 5, maxIdleTime: 30},
                language: 'en'
            })
            
            try {
                await sequelize.authenticate()
                return sequelize
            } catch(error) {
                console.error('deu ruim', error)
                return null
            }
        })
    })

}
    
export default await createConnection();