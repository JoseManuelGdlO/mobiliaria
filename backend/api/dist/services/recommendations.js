"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const STYLE_PRESETS = {
    boho: {
        label: "Boho",
        keywords: ["madera", "rattan", "beige", "natural", "vintage"],
        packageKeywords: ["boho", "rustico", "natural"],
        guestMultiplier: 1,
    },
    minimal: {
        label: "Minimal",
        keywords: ["blanco", "negro", "linea", "metal", "clean"],
        packageKeywords: ["minimal", "moderno", "clean"],
        guestMultiplier: 0.9,
    },
    corporativo: {
        label: "Corporativo elegante",
        keywords: ["coctel", "executive", "negro", "gris", "premium"],
        packageKeywords: ["corporativo", "empresarial", "executive"],
        guestMultiplier: 0.85,
    },
    clasico: {
        label: "Clasico",
        keywords: ["dorado", "blanco", "clasico", "elegante", "fiesta"],
        packageKeywords: ["clasico", "elegante", "fiesta"],
        guestMultiplier: 1,
    },
};
const normalizeStyle = (style) => {
    const value = String(style !== null && style !== void 0 ? style : "").trim().toLowerCase();
    if (value.includes("boho"))
        return "boho";
    if (value.includes("mini"))
        return "minimal";
    if (value.includes("corp"))
        return "corporativo";
    return "clasico";
};
const normalizeDate = (incoming) => {
    if (!incoming)
        return new Date().toISOString().split("T")[0];
    const chunks = incoming.split("-");
    if (chunks.length !== 3)
        return incoming;
    if (chunks[0].length === 2)
        return `${chunks[2]}-${chunks[1]}-${chunks[0]}`;
    return incoming;
};
const scoreByKeywords = (name, keywords) => {
    const base = name.toLowerCase();
    return keywords.reduce((sum, keyword) => sum + (base.includes(keyword) ? 1 : 0), 0);
};
function getMoodboard(idEmpresa, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const styleKey = normalizeStyle(payload === null || payload === void 0 ? void 0 : payload.style);
        const preset = STYLE_PRESETS[styleKey];
        const eventType = String((_a = payload === null || payload === void 0 ? void 0 : payload.eventType) !== null && _a !== void 0 ? _a : "social");
        const guestCount = Number((_b = payload === null || payload === void 0 ? void 0 : payload.guestCount) !== null && _b !== void 0 ? _b : 80);
        const budget = Number((_c = payload === null || payload === void 0 ? void 0 : payload.budget) !== null && _c !== void 0 ? _c : 0);
        const date = normalizeDate(payload === null || payload === void 0 ? void 0 : payload.date);
        const rows = yield db_1.db.query(`
      SELECT 
        inv.id_mob,
        inv.nombre_mob,
        inv.costo_mob,
        inv.cantidad_mob - COALESCE(SUM(dis.ocupados), 0) AS available
      FROM inventario_mob inv
      LEFT JOIN inventario_disponibilidad_mob dis 
        ON inv.id_mob = dis.id_mob
        AND DATE(dis.fecha_evento) = ?
      WHERE inv.id_empresa = ? AND inv.eliminado = 0
      GROUP BY inv.id_mob, inv.nombre_mob, inv.costo_mob, inv.cantidad_mob
      ORDER BY inv.nombre_mob
    `, [date, idEmpresa]);
        const packages = yield db_1.db.query(`SELECT id, nombre, descripcion, precio FROM paquetes WHERE fkid_empresa = ? AND eliminado = 0`, [idEmpresa]);
        const recommendedItems = rows
            .map((item) => {
            var _a;
            const score = scoreByKeywords(item.nombre_mob, preset.keywords);
            const quantityTarget = Math.max(1, Math.ceil((guestCount / 10) * preset.guestMultiplier));
            const quantity = Math.min(Number((_a = item.available) !== null && _a !== void 0 ? _a : 0), quantityTarget);
            return {
                id_mob: Number(item.id_mob),
                nombre_mob: item.nombre_mob,
                costo_mob: Number(item.costo_mob),
                available: Number(item.available),
                score,
                cantidad: quantity,
            };
        })
            .filter((item) => item.available > 0)
            .sort((a, b) => b.score - a.score || a.costo_mob - b.costo_mob)
            .slice(0, 8);
        const suggestedPackages = packages
            .map((pkt) => (Object.assign(Object.assign({}, pkt), { score: scoreByKeywords(pkt.nombre, preset.packageKeywords) })))
            .sort((a, b) => b.score - a.score || Number(a.precio) - Number(b.precio))
            .slice(0, 3)
            .map((pkt) => ({
            id: Number(pkt.id),
            nombre: pkt.nombre,
            descripcion: pkt.descripcion,
            precio: Number(pkt.precio),
        }));
        const estimatedSubtotal = recommendedItems.reduce((acc, item) => acc + item.costo_mob * item.cantidad, 0);
        return {
            code: 200,
            data: {
                style: {
                    key: styleKey,
                    label: preset.label,
                },
                eventType,
                guestCount,
                budget,
                date,
                recommendedItems,
                suggestedPackages,
                moodboardNotes: [
                    `Priorizar tonos y mobiliario acorde al estilo ${preset.label}.`,
                    "Mantener un flujo visual de entrada, convivencia y foto principal.",
                    "Validar iluminación y accesorios para elevar percepción premium.",
                ],
                quotePreview: {
                    estimatedSubtotal,
                    isWithinBudget: budget <= 0 ? true : estimatedSubtotal <= budget,
                },
            },
        };
    });
}
module.exports = {
    getMoodboard,
};
