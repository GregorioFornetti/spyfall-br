import { Sequelize } from 'sequelize'

const sequelize = new Sequelize('spyfall-br', 'postgres', 'secreto123', {
    dialect: 'postgres',
    host: 'localhost',
    port: '5432',
    password: 'secreto123'
})

try {
    await sequelize.authenticate()
    console.log('Deu bom')
} catch(error) {
    console.error('deu ruim', error)
}