import { Sequelize } from 'sequelize'

const sequelize = new Sequelize('spyfall', 'postgres', 'postgres', {
    dialect: 'postgres',
    host: '172.16.10.3',
    port: '5432',
    password: 'postgres'
})

try {
    await sequelize.authenticate()
    console.log('Deu bom')
} catch(error) {
    console.error('deu ruim', error)
}
    
export default sequelize