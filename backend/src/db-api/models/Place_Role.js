import { DataTypes } from "sequelize";
import sequelize from "./connection.js";
import Role from "./Role.js";
import Place from "./Place.js"

const Place_Role = sequelize.define('Place_Role', 
{
    placeId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        references: {
            model: Place,
            key: 'id'
        }
    },
    roleId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        references: {
            model: Role,
            key: 'id'
        }
    }
}, 
{
    tableName: 'Place_Role'
})

Place.belongsToMany(Role, { through: Place_Role, foreignKey: 'placeId'})
Role.belongsToMany(Place, { through: Place_Role, foreignKey: 'roleId'})

await Place_Role.sync()
console.log('Place_Role sync')

export default Place_Role;
