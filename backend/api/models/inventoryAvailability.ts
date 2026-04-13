import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeMain } from "../services/sequelize";

interface InventoryAvailabilityAttributes {
  id_fecha: number;
  fecha_evento: string;
  hora_evento: string;
  id_mob: number;
  ocupados: number;
  id_evento: number;
  hora_recoleccion: string;
  costo: number;
  package?: number | null;
}

type InventoryAvailabilityCreationAttributes = Optional<
  InventoryAvailabilityAttributes,
  "id_fecha" | "package"
>;

export class InventoryAvailabilityModel extends Model<
  InventoryAvailabilityAttributes,
  InventoryAvailabilityCreationAttributes
> {}

InventoryAvailabilityModel.init(
  {
    id_fecha: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fecha_evento: { type: DataTypes.DATEONLY },
    hora_evento: { type: DataTypes.STRING },
    id_mob: { type: DataTypes.INTEGER },
    ocupados: { type: DataTypes.INTEGER },
    id_evento: { type: DataTypes.INTEGER },
    hora_recoleccion: { type: DataTypes.STRING },
    costo: { type: DataTypes.FLOAT },
    package: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize: sequelizeMain,
    tableName: "inventario_disponibilidad_mob",
    timestamps: false,
  }
);
