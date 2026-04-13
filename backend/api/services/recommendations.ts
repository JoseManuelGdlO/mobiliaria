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

async function getMoodboard(idEmpresa: number, payload: any) {
  const styleKey = normalizeStyle(payload?.style);
  const preset = STYLE_PRESETS[styleKey];
  const eventType = String(payload?.eventType ?? "social");
  const guestCount = Number(payload?.guestCount ?? 80);
  const budget = Number(payload?.budget ?? 0);
  const date = normalizeDate(payload?.date);

  const rows = await db.query(
    `
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
    `,
    [date, idEmpresa]
  );

  const packages = await db.query(
    `SELECT id, nombre, descripcion, precio FROM paquetes WHERE fkid_empresa = ? AND eliminado = 0`,
    [idEmpresa]
  );

  const recommendedItems = rows
    .map((item: any) => {
      const score = scoreByKeywords(item.nombre_mob, preset.keywords);
      const quantityTarget = Math.max(1, Math.ceil((guestCount / 10) * preset.guestMultiplier));
      const quantity = Math.min(Number(item.available ?? 0), quantityTarget);
      return {
        id_mob: Number(item.id_mob),
        nombre_mob: item.nombre_mob,
        costo_mob: Number(item.costo_mob),
        available: Number(item.available),
        score,
        cantidad: quantity,
      };
    })
    .filter((item: any) => item.available > 0)
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
