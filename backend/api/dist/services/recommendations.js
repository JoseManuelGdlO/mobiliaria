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
const normalized = (value) => String(value !== null && value !== void 0 ? value : "").trim().toLowerCase();
function getMoodboard(idEmpresa, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const styleKey = normalizeStyle(payload === null || payload === void 0 ? void 0 : payload.style);
        const preset = STYLE_PRESETS[styleKey];
        const eventType = String((_a = payload === null || payload === void 0 ? void 0 : payload.eventType) !== null && _a !== void 0 ? _a : "social");
        const guestCount = Number((_b = payload === null || payload === void 0 ? void 0 : payload.guestCount) !== null && _b !== void 0 ? _b : 80);
        const budget = Number((_c = payload === null || payload === void 0 ? void 0 : payload.budget) !== null && _c !== void 0 ? _c : 0);
        const date = normalizeDate(payload === null || payload === void 0 ? void 0 : payload.date);
        const styleFilter = normalized((_d = payload === null || payload === void 0 ? void 0 : payload.filters) === null || _d === void 0 ? void 0 : _d.style);
        const colorFilter = normalized((_e = payload === null || payload === void 0 ? void 0 : payload.filters) === null || _e === void 0 ? void 0 : _e.color);
        const materialFilter = normalized((_f = payload === null || payload === void 0 ? void 0 : payload.filters) === null || _f === void 0 ? void 0 : _f.material);
        const spaceUsage = normalized((_g = payload === null || payload === void 0 ? void 0 : payload.filters) === null || _g === void 0 ? void 0 : _g.spaceUsage);
        const maxWeightKg = Number((_j = (_h = payload === null || payload === void 0 ? void 0 : payload.filters) === null || _h === void 0 ? void 0 : _h.maxWeightKg) !== null && _j !== void 0 ? _j : 0);
        const rows = yield db_1.db.query(`
      SELECT 
        inv.id_mob,
        inv.nombre_mob,
        inv.costo_mob,
        inv.ancho_cm,
        inv.alto_cm,
        inv.fondo_cm,
        inv.peso_kg,
        inv.uso_espacio,
        inv.estilo,
        inv.color,
        inv.material,
        inv.cantidad_mob - COALESCE(SUM(dis.ocupados), 0) AS available
      FROM inventario_mob inv
      LEFT JOIN inventario_disponibilidad_mob dis 
        ON inv.id_mob = dis.id_mob
        AND DATE(dis.fecha_evento) = ?
      WHERE inv.id_empresa = ? AND inv.eliminado = 0
      GROUP BY inv.id_mob, inv.nombre_mob, inv.costo_mob, inv.cantidad_mob, inv.ancho_cm, inv.alto_cm, inv.fondo_cm, inv.peso_kg, inv.uso_espacio, inv.estilo, inv.color, inv.material
      ORDER BY inv.nombre_mob
    `, [date, idEmpresa]);
        const packages = yield db_1.db.query(`SELECT id, nombre, descripcion, precio FROM paquetes WHERE fkid_empresa = ? AND eliminado = 0`, [idEmpresa]);
        const recommendedItems = rows
            .map((item) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            const keywordScore = scoreByKeywords(item.nombre_mob, preset.keywords);
            const itemStyle = normalized(item.estilo);
            const itemColor = normalized(item.color);
            const itemMaterial = normalized(item.material);
            const itemUsage = normalized(item.uso_espacio);
            const weightKg = Number((_a = item.peso_kg) !== null && _a !== void 0 ? _a : 0);
            const styleScore = itemStyle.length && styleFilter.length ? (itemStyle.includes(styleFilter) ? 2 : 0) : 0;
            const colorScore = itemColor.length && colorFilter.length ? (itemColor.includes(colorFilter) ? 1 : 0) : 0;
            const materialScore = itemMaterial.length && materialFilter.length ? (itemMaterial.includes(materialFilter) ? 1 : 0) : 0;
            const usageScore = itemUsage.length && spaceUsage.length ? ((itemUsage === "both" || itemUsage === spaceUsage) ? 1 : -2) : 0;
            const weightPenalty = maxWeightKg > 0 && weightKg > maxWeightKg ? -3 : 0;
            const score = keywordScore + styleScore + colorScore + materialScore + usageScore + weightPenalty;
            const quantityTarget = Math.max(1, Math.ceil((guestCount / 10) * preset.guestMultiplier));
            const quantity = Math.min(Number((_b = item.available) !== null && _b !== void 0 ? _b : 0), quantityTarget);
            return {
                id_mob: Number(item.id_mob),
                nombre_mob: item.nombre_mob,
                costo_mob: Number(item.costo_mob),
                available: Number(item.available),
                ancho_cm: Number((_c = item.ancho_cm) !== null && _c !== void 0 ? _c : 0),
                alto_cm: Number((_d = item.alto_cm) !== null && _d !== void 0 ? _d : 0),
                fondo_cm: Number((_e = item.fondo_cm) !== null && _e !== void 0 ? _e : 0),
                peso_kg: Number((_f = item.peso_kg) !== null && _f !== void 0 ? _f : 0),
                uso_espacio: (_g = item.uso_espacio) !== null && _g !== void 0 ? _g : null,
                estilo: (_h = item.estilo) !== null && _h !== void 0 ? _h : null,
                color: (_j = item.color) !== null && _j !== void 0 ? _j : null,
                material: (_k = item.material) !== null && _k !== void 0 ? _k : null,
                score,
                cantidad: quantity,
            };
        })
            .filter((item) => item.available > 0 && item.score >= 0)
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
