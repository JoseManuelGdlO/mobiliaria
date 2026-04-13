import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeMain } from "../services/sequelize";

interface EventAttributes {
  id_evento: number;
  nombre_evento: string;
  id_empresa: number;
  tipo_evento: string;
  fecha_envio_evento: string;
  hora_envio_evento: string;
  fecha_recoleccion_evento: string;
  hora_recoleccion_evento: string;
  pagado_evento: number;
  nombre_titular_evento: string;
  direccion_evento: string;
  telefono_titular_evento: string;
  descuento: number;
  iva: number;
  flete: number;
  lat: string;
  lng: string;
  url: string;
  id_creador: number;
  notificacion_envio: number;
  notificacion_recoleccion: number;
}

type EventCreationAttributes = Optional<EventAttributes, "id_evento">;

export class EventModel extends Model<EventAttributes, EventCreationAttributes> {}

EventModel.init(
  {
    id_evento: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre_evento: { type: DataTypes.STRING },
    id_empresa: { type: DataTypes.INTEGER },
    tipo_evento: { type: DataTypes.STRING },
    fecha_envio_evento: { type: DataTypes.DATEONLY },
    hora_envio_evento: { type: DataTypes.STRING },
    fecha_recoleccion_evento: { type: DataTypes.DATEONLY },
    hora_recoleccion_evento: { type: DataTypes.STRING },
    pagado_evento: { type: DataTypes.INTEGER },
    nombre_titular_evento: { type: DataTypes.STRING },
    direccion_evento: { type: DataTypes.STRING },
    telefono_titular_evento: { type: DataTypes.STRING },
    descuento: { type: DataTypes.FLOAT },
    iva: { type: DataTypes.INTEGER },
    flete: { type: DataTypes.FLOAT },
    lat: { type: DataTypes.STRING },
    lng: { type: DataTypes.STRING },
    url: { type: DataTypes.STRING },
    id_creador: { type: DataTypes.INTEGER },
    notificacion_envio: { type: DataTypes.INTEGER },
    notificacion_recoleccion: { type: DataTypes.INTEGER },
  },
  {
    sequelize: sequelizeMain,
    tableName: "evento_mob",
    timestamps: false,
  }
);
