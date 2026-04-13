"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleModel = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../services/sequelize");
class ArticleModel extends sequelize_1.Model {
}
exports.ArticleModel = ArticleModel;
ArticleModel.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    creador: { type: sequelize_1.DataTypes.STRING },
    creacion: { type: sequelize_1.DataTypes.STRING },
    titulo: { type: sequelize_1.DataTypes.STRING },
    body: { type: sequelize_1.DataTypes.TEXT },
    lugar: { type: sequelize_1.DataTypes.STRING },
    descripcion: { type: sequelize_1.DataTypes.TEXT },
    thumb: { type: sequelize_1.DataTypes.STRING },
    fkid_category: { type: sequelize_1.DataTypes.INTEGER },
}, {
    sequelize: sequelize_2.sequelizeDurangeneidad,
    tableName: "articulo",
    timestamps: false,
});
