type QuoteItem = {
  id_mob?: number;
  nombre?: string;
  cantidad?: number;
  costo_mob?: number;
  costo?: number;
};

const toNumber = (value: any) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const quoteLineTotal = (item: QuoteItem) =>
  toNumber(item.cantidad) * toNumber(item.costo_mob ?? item.costo);

async function buildLiveQuote(payload: any) {
  const items: QuoteItem[] = Array.isArray(payload?.items) ? payload.items : [];
  const packageItems: QuoteItem[] = Array.isArray(payload?.packages) ? payload.packages : [];
  const logisticsFee = toNumber(payload?.logisticsFee);
  const discountPct = toNumber(payload?.discountPct);
  const applyIva = Boolean(payload?.applyIva);

  const itemsSubtotal = items.reduce((acc, item) => acc + quoteLineTotal(item), 0);
  const packagesSubtotal = packageItems.reduce((acc, item) => acc + quoteLineTotal(item), 0);
  const subtotal = itemsSubtotal + packagesSubtotal;
  const discountAmount = subtotal * (Math.max(0, Math.min(discountPct, 100)) / 100);
  const taxableBase = subtotal - discountAmount + logisticsFee;
  const ivaAmount = applyIva ? taxableBase * 0.16 : 0;
  const total = taxableBase + ivaAmount;
  const suggestedUpsells = [
    {
      label: "Kit de iluminacion ambiental",
      estimatedPrice: Math.round(Math.max(350, total * 0.08)),
    },
    {
      label: "Setup premium de recepcion",
      estimatedPrice: Math.round(Math.max(550, total * 0.12)),
    },
  ];

  return {
    code: 200,
    data: {
      breakdown: {
        itemsSubtotal,
        packagesSubtotal,
        subtotal,
        discountPct,
        discountAmount,
        logisticsFee,
        ivaAmount,
        total,
      },
      suggestedUpsells,
      updatedAt: Date.now(),
    },
  };
}

module.exports = {
  buildLiveQuote,
};
