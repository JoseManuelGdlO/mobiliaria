export type UserRole = 'Administrador' | 'Administrativo' | 'Repartidor' | string

export interface IUser {
    id_usuario: number,
    id_empresa: number,
    nombre_comp: string,
    contrasena: string,
    usuario: string,
    rol_usuario: UserRole,
    fecha_creacion: string,
    correo: string,
    admin: number
}