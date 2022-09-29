import { DataTypes } from "sequelize";
import sequelize from "./connection.js";

const Category = sequelize.define('Category', {
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

await Category.sync()
console.log('Category sync')

export default Category;