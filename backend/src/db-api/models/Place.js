import { DataTypes } from "sequelize";
import sequelize from "./connection.js";
import Category from "./Category.js";
import Role from "./Role.js";

const Place = sequelize.define('Place', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imgPath: {
        type: DataTypes.STRING(512)
    }
})

Place.belongsToMany(Role, { through: 'Place_Role', foreignKey: 'placeId'})
Role.belongsToMany(Place, { through: 'Place_Role', foreignKey: 'roleId'})

await Place.sync()
console.log('Place sync')

export default Place