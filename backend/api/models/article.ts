import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeDurangeneidad } from "../services/sequelize";

interface ArticleAttributes {
  id: number;
  creador: string;
  creacion: string;
  titulo: string;
  body: string;
  lugar: string;
  descripcion: string;
  thumb: string;
  fkid_category: number;
}

type ArticleCreationAttributes = Optional<ArticleAttributes, "id">;

export class ArticleModel extends Model<ArticleAttributes, ArticleCreationAttributes> {}

ArticleModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    creador: { type: DataTypes.STRING },
    creacion: { type: DataTypes.STRING },
    titulo: { type: DataTypes.STRING },
    body: { type: DataTypes.TEXT },
    lugar: { type: DataTypes.STRING },
    descripcion: { type: DataTypes.TEXT },
    thumb: { type: DataTypes.STRING },
    fkid_category: { type: DataTypes.INTEGER },
  },
  {
    sequelize: sequelizeDurangeneidad,
    tableName: "articulo",
    timestamps: false,
  }
);
