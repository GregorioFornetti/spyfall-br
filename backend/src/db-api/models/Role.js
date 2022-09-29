import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const Role = sequelize.define('Role', {
    id: {
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

await Role.sync()
console.log('Role sync')

export default Role;