export function getBrands(goods = []) {
  return [
    ...new Set(
      goods
        .filter(
          (g) =>
            g &&
            (g.number || g.name || g.goodsID) &&
            typeof g.brand === "string",
        )
        .map((g) => g.brand.trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "ru"));
}
export function getOffers(goods = []) {
  const result = [];
  for (const g of goods) {
    if (!g || !g.brand || !(g.number || g.name)) continue;
    for (const item of [
      g,
      ...(Array.isArray(g.analogues) ? g.analogues : []),
    ]) {
      if (!item || !item.brand || !(item.number || item.name)) continue;
      const warehouses = Array.isArray(item.warehouses) ? item.warehouses : [];
      if (!warehouses.length) {
        result.push({
          brand: item.brand,
          name: item.name || "Без названия",
          number: item.number || "",
          price: null,
          stock: Number(item.count) || 0,
          warehouse: "—",
          analogue: item !== g,
        });
        continue;
      }
      for (const w of warehouses) {
        result.push({
          brand: item.brand,
          name: item.name || "Без названия",
          number: item.number || "",
          price:
            typeof w.price === "number" && Number.isFinite(w.price)
              ? w.price
              : null,
          stock: Number(w.stock) || 0,
          warehouse: w.code || w.id || "—",
          analogue: item !== g,
        });
      }
    }
  }
  return result;
}
