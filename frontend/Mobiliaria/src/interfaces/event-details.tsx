
export interface IEventDetail {
    event: IEvent,
    payments: IPayment[]
    items: IInventaryRent[]
}

export interface IEvent {
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
    url:string,
    telefono_titular_evento: string,
    observaciones: string,
    entregado: number,
    recolectado: number,
    descuento: number,
    iva: number,
    flete: number,
    fecha_creacion: string
}

export interface IPayment {
    id_pago: number,
    id_evento: number,
    costo_total: any,
    saldo: any,
    anticipo: any,
    fecha: Date,
    abono: any
}

export interface IInventaryRent {
    nombre_mob: string,
    costo_mob: number,
    id_mob: number,
    ocupados: number,
    id_evento: number,
    id_fecha: number,
    fecha_evento: string
    costo?: number
}