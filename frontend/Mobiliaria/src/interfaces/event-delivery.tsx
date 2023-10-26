export interface IEventDelivery {
    id_evento: number,
    id_empresa: number,
    nombre_evento: string,
    tipo_evento: string,
    fecha_envio_evento: string,
    hora_envio_evento: string,
    fecha_recoleccion_evento: string,
    hora_recoleccion_evento: string,
    pagado_evento: number,
    nombre_titular_evento: string,
    direccion_evento: string,
    telefono_titular_evento: string,
    observaciones: null,
    entregado: number,
    recolectado: number,
    descuento: number,
    iva: number,
    flete: number,
    fecha_creacion: string,
    inventario: IInvDelivery[]
}

export interface IInvDelivery {
    id_mob: number,
    ocupados: number,
    nombre_mob: string
}
