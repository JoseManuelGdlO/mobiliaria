import { IInventary } from "./inventary";

export interface IPackage {
    id: number,
    nombre: string,
    descripcion: string,
    precio: number,
    availiable?: number,
    products: IInventary[]
    cantidad?: number
    package?: number
    fecha_evento?: string,
    hora_evento?: string,
    hora_recoleccion?: string,
}