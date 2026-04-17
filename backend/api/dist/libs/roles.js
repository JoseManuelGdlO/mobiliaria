"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAllowedRole = exports.normalizeRole = void 0;
const roleAlias = {
    administrador: 'Administrador',
    administrativo: 'Administrativo',
    repartidor: 'Repartidor',
};
const normalizeRole = (role) => {
    var _a;
    if (typeof role !== 'string' || role.trim().length === 0) {
        return null;
    }
    return (_a = roleAlias[role.trim().toLowerCase()]) !== null && _a !== void 0 ? _a : null;
};
exports.normalizeRole = normalizeRole;
const isAllowedRole = (role) => (0, exports.normalizeRole)(role) !== null;
exports.isAllowedRole = isAllowedRole;
