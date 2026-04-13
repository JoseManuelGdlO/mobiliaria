import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeMain } from "../services/sequelize";

interface PaymentAttributes {
  id_pago: number;
  id_evento: number;
  costo_total: number;
  saldo: number;
  anticipo: number;
}

type PaymentCreationAttributes = Optional<PaymentAttributes, "id_pago">;

export class PaymentModel extends Model<PaymentAttributes, PaymentCreationAttributes> {}

PaymentModel.init(
  {
    id_pago: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_evento: { type: DataTypes.INTEGER },
    costo_total: { type: DataTypes.FLOAT },
    saldo: { type: DataTypes.FLOAT },
    anticipo: { type: DataTypes.FLOAT },
  },
  {
    sequelize: sequelizeMain,
    tableName: "pagos_mob",
    timestamps: false,
  }
);
