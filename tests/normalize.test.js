import test from "node:test";
import assert from "node:assert/strict";
import { getBrands, getOffers } from "../src/utils/normalize.js";
const warehouse = (price, stock, code = "A") => ({ price, stock, code });
const part = (brand = "A", warehouses = [warehouse(10, 2)]) => ({
  brand,
  number: "123",
  name: "Деталь",
  count: 9,
  price: 999,
  warehouses,
});
test("unique brands", () =>
  assert.deepEqual(getBrands([part("B"), part("A"), part("B")]), ["A", "B"]));
test("empty brands", () =>
  assert.deepEqual(getBrands([{ brand: "", name: "", number: "" }]), []));
test("uses warehouse price, never legacy goods.price", () =>
  assert.equal(getOffers([part()])[0].price, 10));
test("uses warehouse stock", () =>
  assert.equal(getOffers([part()])[0].stock, 2));
test("multiple warehouses produce multiple rows", () =>
  assert.equal(
    getOffers([part("A", [warehouse(10, 1), warehouse(20, 3, "B")])]).length,
    2,
  ));
test("analogues included", () =>
  assert.equal(
    getOffers([{ ...part(), analogues: [part("B")] }]).filter((o) => o.analogue)
      .length,
    1,
  ));
test("empty API record ignored", () =>
  assert.deepEqual(
    getOffers([{ brand: "", number: "", name: "", warehouses: [] }]),
    [],
  ));
test("missing warehouse price shown as unknown", () =>
  assert.equal(getOffers([part("A", [{ stock: 0 }])])[0].price, null));

test("no analogues keeps the requested part", () => {
  const offers = getOffers([{ ...part(), analogues: [] }]);
  assert.equal(offers.length, 1);
  assert.equal(offers[0].analogue, false);
});

test("zero price and stock are preserved", () => {
  const [offer] = getOffers([part("A", [warehouse(0, 0)])]);
  assert.equal(offer.price, 0);
  assert.equal(offer.stock, 0);
});
