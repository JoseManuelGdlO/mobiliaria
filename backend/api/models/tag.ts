import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeDurangeneidad } from "../services/sequelize";

interface TagAttributes {
  id: number;
  fkid_articulo: number;
  label: string;
}

type TagCreationAttributes = Optional<TagAttributes, "id">;

export class TagModel extends Model<TagAttributes, TagCreationAttributes> {}

TagModel.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fkid_articulo: { type: DataTypes.INTEGER },
    label: { type: DataTypes.STRING },
  },
  {
    sequelize: sequelizeDurangeneidad,
    tableName: "tags",
    timestamps: false,
  }
);
