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
const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
};
const quoteLineTotal = (item) => { var _a; return toNumber(item.cantidad) * toNumber((_a = item.costo_mob) !== null && _a !== void 0 ? _a : item.costo); };
function buildLiveQuote(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const items = Array.isArray(payload === null || payload === void 0 ? void 0 : payload.items) ? payload.items : [];
        const packageItems = Array.isArray(payload === null || payload === void 0 ? void 0 : payload.packages) ? payload.packages : [];
        const logisticsFee = toNumber(payload === null || payload === void 0 ? void 0 : payload.logisticsFee);
        const discountPct = toNumber(payload === null || payload === void 0 ? void 0 : payload.discountPct);
        const applyDiscountToFreight = Boolean(payload === null || payload === void 0 ? void 0 : payload.applyDiscountToFreight);
        const applyIva = Boolean(payload === null || payload === void 0 ? void 0 : payload.applyIva);
        const itemsSubtotal = items.reduce((acc, item) => acc + quoteLineTotal(item), 0);
        const packagesSubtotal = packageItems.reduce((acc, item) => acc + quoteLineTotal(item), 0);
        const subtotal = itemsSubtotal + packagesSubtotal;
        const discountRate = Math.max(0, Math.min(discountPct, 100)) / 100;
        const discountBase = subtotal + (applyDiscountToFreight ? logisticsFee : 0);
        const discountAmount = discountBase * discountRate;
        const taxableBase = applyDiscountToFreight
            ? subtotal + logisticsFee - discountAmount
            : subtotal - discountAmount + logisticsFee;
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
                    applyDiscountToFreight,
                    discountAmount,
                    logisticsFee,
                    ivaAmount,
                    total,
                },
                suggestedUpsells,
                updatedAt: Date.now(),
            },
        };
    });
}
module.exports = {
    buildLiveQuote,
};
