export interface IClients {
    id_cliente: number,
    id_empresa: number,
    nombre_cliente: string,
    telefono_cliente: string,
    correo_cliente: string
}

export interface ClientsQueryParams {
    page?: number
    pageSize?: number
    search?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    items: T[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
    code: number
}