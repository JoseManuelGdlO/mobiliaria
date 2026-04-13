"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagModel = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../services/sequelize");
class TagModel extends sequelize_1.Model {
}
exports.TagModel = TagModel;
TagModel.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fkid_articulo: { type: sequelize_1.DataTypes.INTEGER },
    label: { type: sequelize_1.DataTypes.STRING },
}, {
    sequelize: sequelize_2.sequelizeDurangeneidad,
    tableName: "tags",
    timestamps: false,
});
