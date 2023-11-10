export interface IInventary {
    id_mob?: number,
    id_empresa?: number,
    cantidad_mob: number,
    nombre_mob: string,
    costo_mob: number,
    extra_mob?: string,
    extra_mob_costo?: number,
    ruta_imagen?: string
    eliminado?: number
}