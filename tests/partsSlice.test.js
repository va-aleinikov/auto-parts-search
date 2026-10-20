import test from "node:test";
import assert from "node:assert/strict";
import reducer, {
  searchBrands,
  searchOffers,
  selectBrand,
  setNumber,
} from "../src/features/parts/partsSlice.js";

const offer = { brand: "MEYLE", number: "123", price: 10, stock: 0 };
const selection = { number: "123", brand: "MEYLE" };
function withOffers() {
  let state = reducer(undefined, setNumber("123"));
  state = reducer(state, searchBrands.pending("brands", "123"));
  state = reducer(state, searchBrands.fulfilled(["MEYLE"], "brands", "123"));
  state = reducer(state, selectBrand("MEYLE"));
  state = reducer(state, searchOffers.pending("offers", selection));
  return reducer(state, searchOffers.fulfilled([offer], "offers", selection));
}

test("повторный поиск очищает бренд и предложения до получения ответа", () => {
  let state = reducer(withOffers(), searchBrands.pending("repeat", "123"));
  assert.deepEqual(state.brands, []);
  assert.equal(state.selectedBrand, "");
  assert.deepEqual(state.offers, []);
  assert.equal(state.offersStatus, "idle");
  assert.equal(state.offersError, "");
  assert.equal(state.offersRequestId, null);
  assert.equal(state.brandsStatus, "loading");
  state = reducer(state, searchBrands.fulfilled([], "repeat", "123"));
  assert.equal(state.brandsStatus, "succeeded");
  assert.equal(state.selectedBrand, "");
});

test("запоздалые предложения не возвращаются после повторного поиска", () => {
  let state = reducer(withOffers(), searchBrands.pending("repeat", "123"));
  state = reducer(state, searchOffers.fulfilled([offer], "offers", selection));
  assert.deepEqual(state.offers, []);
  assert.equal(state.offersStatus, "idle");
});

test("смена артикула сбрасывает результаты и игнорирует старый ответ", () => {
  let state = reducer(withOffers(), searchBrands.pending("old", "123"));
  state = reducer(state, setNumber("456"));
  state = reducer(state, searchBrands.fulfilled(["OLD"], "old", "123"));
  assert.equal(state.number, "456");
  assert.equal(state.selectedBrand, "");
  assert.deepEqual(state.offers, []);
  assert.deepEqual(state.brands, []);
  assert.equal(state.brandsStatus, "idle");
});

test("поздний ответ предыдущего бренда игнорируется", () => {
  let state = reducer(withOffers(), selectBrand("OTHER"));
  state = reducer(state, searchOffers.pending("new", { number: "123", brand: "OTHER" }));
  state = reducer(state, searchOffers.fulfilled([offer], "offers", selection));
  assert.deepEqual(state.offers, []);
  assert.equal(state.selectedBrand, "OTHER");
  assert.equal(state.offersStatus, "loading");
});

test("при обратном порядке ответов остается результат последнего запроса", () => {
  let state = reducer(undefined, searchBrands.pending("old", "123"));
  state = reducer(state, searchBrands.pending("new", "456"));
  state = reducer(state, searchBrands.fulfilled(["NEW"], "new", "456"));
  state = reducer(state, searchBrands.fulfilled(["OLD"], "old", "123"));
  state = reducer(state, searchBrands.rejected(new Error("Old error"), "old", "123"));
  assert.deepEqual(state.brands, ["NEW"]);
  assert.equal(state.brandsStatus, "succeeded");
  assert.equal(state.brandsError, "");
});

for (const [name, action, status, error] of [
  ["ошибка предложений", new Error("HTTP 503"), "failed", "HTTP 503"],
  ["отмена предложений", { name: "AbortError", message: "Aborted" }, "idle", "Aborted"],
]) {
  test(name, () => {
    let state = reducer(undefined, searchOffers.pending("current", selection));
    state = reducer(state, searchOffers.rejected(action, "current", selection));
    assert.equal(state.offersStatus, status);
    assert.equal(state.offersError, error);
  });
}

test("новый поиск очищает ошибку предложений", () => {
  let state = reducer(undefined, searchOffers.pending("offers", selection));
  state = reducer(state, searchOffers.rejected(new Error("HTTP 503"), "offers", selection));
  state = reducer(state, searchBrands.pending("brands", "123"));
  assert.equal(state.offersError, "");
  assert.equal(state.offersStatus, "idle");
});
