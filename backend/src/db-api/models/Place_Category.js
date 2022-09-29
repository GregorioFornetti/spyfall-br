import { DataTypes } from "sequelize";
import sequelize from "./connection.js";
import Category from "./Category.js";
import Place from "./Place.js"

const Place_Category = sequelize.define('Place_Category', 
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
    categoryId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        references: {
            model: Category,
            key: 'id'
        }
    }
}, 
{
    tableName: 'Place_Category'
})

Place.belongsToMany(Category, { through: Place_Category, foreignKey: 'placeId'})
Category.belongsToMany(Place, { through: Place_Category, foreignKey: 'categoryId'})

await Place_Category.sync()
console.log('Place_Category sync')

export default Place_Category;
