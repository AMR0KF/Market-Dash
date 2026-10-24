export function formatQuantityDisplay(quantity: number, unit?: string): string {
  if (!unit) return quantity.toString();
  const u = unit.trim();

  // Standard weight symbols: "g", "kg", "lb", "oz"
  if (/^g$/i.test(u)) {
    const totalGrams = quantity;
    if (totalGrams >= 1000) {
      const kg = Number((totalGrams / 1000).toFixed(2));
      return `${kg}kg`;
    }
    return `${totalGrams}g`;
  }

  if (/^kg$/i.test(u)) {
    const kg = Number(quantity.toFixed(2));
    return `${kg}kg`;
  }

  if (/^(lb|oz)$/i.test(u)) {
    const symbol = u.toLowerCase();
    return Number.isInteger(quantity) ? `${quantity}${symbol}` : `${quantity} ${symbol}`;
  }

  // Composite weights: e.g. "250g", "500g", "0.5kg"
  const weightMatch = u.match(/^(\d+(?:\.\d+)?)\s*(g|kg|lb|oz)$/i);
  if (weightMatch) {
    const baseVal = parseFloat(weightMatch[1]);
    const origSymbol = weightMatch[2].toLowerCase();

    if (origSymbol === 'g') {
      const totalGrams = quantity * baseVal;
      if (totalGrams >= 1000) {
        const kg = Number((totalGrams / 1000).toFixed(2));
        return `${kg}kg`;
      }
      const g = Number(totalGrams.toFixed(2));
      return `${g}g`;
    }

    if (origSymbol === 'kg') {
      const totalKg = Number((quantity * baseVal).toFixed(2));
      return `${totalKg}kg`;
    }

    const totalWeight = Number((quantity * baseVal).toFixed(2));
    return `${totalWeight}${origSymbol}`;
  }

  // Discrete items (piece, pc, dozen, pack, box, etc.)
  return Number.isInteger(quantity) ? quantity.toString() : quantity.toString();
}
