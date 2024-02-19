import { IInventary } from "./inventary";

export interface IPackage {
    id: number,
    nombre: string,
    descripcion: string,
    precio: number,
    products: IInventary[]
}