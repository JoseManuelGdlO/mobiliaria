import { db } from "./db";

type StylePreset = {
  label: string;
  keywords: string[];
  packageKeywords: string[];
  guestMultiplier: number;
};

const STYLE_PRESETS: Record<string, StylePreset> = {
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

const normalizeStyle = (style?: string) => {
  const value = String(style ?? "").trim().toLowerCase();
  if (value.includes("boho")) return "boho";
  if (value.includes("mini")) return "minimal";
  if (value.includes("corp")) return "corporativo";
  return "clasico";
};

const normalizeDate = (incoming?: string): string => {
  if (!incoming) return new Date().toISOString().split("T")[0];
  const chunks = incoming.split("-");
  if (chunks.length !== 3) return incoming;
  if (chunks[0].length === 2) return `${chunks[2]}-${chunks[1]}-${chunks[0]}`;
  return incoming;
};

const scoreByKeywords = (name: string, keywords: string[]) => {
  const base = name.toLowerCase();
  return keywords.reduce((sum, keyword) => sum + (base.includes(keyword) ? 1 : 0), 0);
};

const normalized = (value: any) => String(value ?? "").trim().toLowerCase();

async function getMoodboard(idEmpresa: number, payload: any) {
  const styleKey = normalizeStyle(payload?.style);
  const preset = STYLE_PRESETS[styleKey];
  const eventType = String(payload?.eventType ?? "social");
  const guestCount = Number(payload?.guestCount ?? 80);
  const budget = Number(payload?.budget ?? 0);
  const date = normalizeDate(payload?.date);
  const styleFilter = normalized(payload?.filters?.style);
  const colorFilter = normalized(payload?.filters?.color);
  const materialFilter = normalized(payload?.filters?.material);
  const spaceUsage = normalized(payload?.filters?.spaceUsage);
  const maxWeightKg = Number(payload?.filters?.maxWeightKg ?? 0);

  const rows = await db.query(
    `
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
    `,
    [date, idEmpresa]
  );

  const packages = await db.query(
    `SELECT id, nombre, descripcion, precio FROM paquetes WHERE fkid_empresa = ? AND eliminado = 0`,
    [idEmpresa]
  );

  const recommendedItems = rows
    .map((item: any) => {
      const keywordScore = scoreByKeywords(item.nombre_mob, preset.keywords);
      const itemStyle = normalized(item.estilo);
      const itemColor = normalized(item.color);
      const itemMaterial = normalized(item.material);
      const itemUsage = normalized(item.uso_espacio);
      const weightKg = Number(item.peso_kg ?? 0);

      const styleScore = itemStyle.length && styleFilter.length ? (itemStyle.includes(styleFilter) ? 2 : 0) : 0;
      const colorScore = itemColor.length && colorFilter.length ? (itemColor.includes(colorFilter) ? 1 : 0) : 0;
      const materialScore = itemMaterial.length && materialFilter.length ? (itemMaterial.includes(materialFilter) ? 1 : 0) : 0;
      const usageScore = itemUsage.length && spaceUsage.length ? ((itemUsage === "both" || itemUsage === spaceUsage) ? 1 : -2) : 0;
      const weightPenalty = maxWeightKg > 0 && weightKg > maxWeightKg ? -3 : 0;
      const score = keywordScore + styleScore + colorScore + materialScore + usageScore + weightPenalty;
      const quantityTarget = Math.max(1, Math.ceil((guestCount / 10) * preset.guestMultiplier));
      const quantity = Math.min(Number(item.available ?? 0), quantityTarget);
      return {
        id_mob: Number(item.id_mob),
        nombre_mob: item.nombre_mob,
        costo_mob: Number(item.costo_mob),
        available: Number(item.available),
        ancho_cm: Number(item.ancho_cm ?? 0),
        alto_cm: Number(item.alto_cm ?? 0),
        fondo_cm: Number(item.fondo_cm ?? 0),
        peso_kg: Number(item.peso_kg ?? 0),
        uso_espacio: item.uso_espacio ?? null,
        estilo: item.estilo ?? null,
        color: item.color ?? null,
        material: item.material ?? null,
        score,
        cantidad: quantity,
      };
    })
    .filter((item: any) => item.available > 0 && item.score >= 0)
    .sort((a: any, b: any) => b.score - a.score || a.costo_mob - b.costo_mob)
    .slice(0, 8);

  const suggestedPackages = packages
    .map((pkt: any) => ({
      ...pkt,
      score: scoreByKeywords(pkt.nombre, preset.packageKeywords),
    }))
    .sort((a: any, b: any) => b.score - a.score || Number(a.precio) - Number(b.precio))
    .slice(0, 3)
    .map((pkt: any) => ({
      id: Number(pkt.id),
      nombre: pkt.nombre,
      descripcion: pkt.descripcion,
      precio: Number(pkt.precio),
    }));

  const estimatedSubtotal = recommendedItems.reduce(
    (acc: number, item: any) => acc + item.costo_mob * item.cantidad,
    0
  );

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
}

module.exports = {
  getMoodboard,
};
