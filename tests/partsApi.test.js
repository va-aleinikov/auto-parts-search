import test from "node:test";
import assert from "node:assert/strict";
import { getParts } from "../src/services/partsApi.js";

const config = {
  VITE_API_URL: "http://api.favorit-parts.ru/hs/hsprice/",
  VITE_API_KEY: "test-key",
};
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status });
const request = (signal, settings = config) =>
  getParts({ number: "123" }, signal, settings);

test("запрос производителей идет напрямую в API без бренда и аналогов", async (t) => {
  t.mock.method(globalThis, "fetch", async (address, options) => {
    const url = new URL(address);
    assert.equal(url.origin, "http://api.favorit-parts.ru");
    assert.equal(url.pathname, "/hs/hsprice/");
    assert.equal(url.searchParams.get("key"), "test-key");
    assert.equal(url.searchParams.get("number"), "123");
    assert.equal(url.searchParams.has("brand"), false);
    assert.equal(url.searchParams.has("analogues"), false);
    assert.equal(options.method, "GET");
    return json({ goods: [] });
  });
  assert.deepEqual(await request(), []);
});

test("запрос аналогов сохраняет спецсимволы и передает сигнал отмены", async (t) => {
  const controller = new AbortController();
  const goods = [{ brand: "A&B", number: "12#3" }];
  t.mock.method(globalThis, "fetch", async (address, options) => {
    const url = new URL(address);
    assert.equal(url.searchParams.get("brand"), "A&B");
    assert.equal(url.searchParams.get("number"), "12#3");
    assert.equal(url.searchParams.get("analogues"), "on");
    assert.equal(options.signal, controller.signal);
    return json({ goods });
  });
  assert.deepEqual(
    await getParts({ number: "12#3", brand: "A&B" }, controller.signal, config),
    goods,
  );
});

for (const key of [undefined, "", "   "]) {
  test(`пустой ключ ${JSON.stringify(key)} отклоняется до запроса`, async (t) => {
    const fetchMock = t.mock.method(globalThis, "fetch", async () => json({ goods: [] }));
    await assert.rejects(request(undefined, { ...config, VITE_API_KEY: key }), /VITE_API_KEY/);
    assert.equal(fetchMock.mock.callCount(), 0);
  });
}

for (const [name, response, message] of [
  ["неверный ключ", () => json({ error: "Invalid access key" }), /Invalid access key/],
  ["массив ошибок API", () => json({ error: ["Empty key!", "Empty number goods!"] }), /Empty key!; Empty number goods!/],
  ["HTTP с JSON", () => json({}, 503), /HTTP 503/],
  ["HTTP с HTML", () => new Response("<html>Unavailable</html>", { status: 502 }), /HTTP 502/],
  ["HTTP с пустым телом", () => new Response(null, { status: 503 }), /HTTP 503/],
  ["описание API при HTTP-ошибке", () => json({ error: "Request quota exceeded!" }, 429), /Request quota exceeded!/],
  ["неверный JSON", () => new Response("invalid"), /невалидный JSON/],
  ["пустое тело при HTTP 200", () => new Response(""), /невалидный JSON/],
  ["пустое тело при HTTP 204", () => new Response(null, { status: 204 }), /невалидный JSON/],
  ["отсутствует goods", () => json({}), /массива goods/],
  ["goods не массив", () => json({ goods: {} }), /массива goods/],
]) {
  test(name, async (t) => {
    t.mock.method(globalThis, "fetch", async () => response());
    await assert.rejects(request(), message);
  });
}

test("сбой сети дает понятное сообщение", async (t) => {
  t.mock.method(globalThis, "fetch", async () => { throw new TypeError("Failed to fetch"); });
  await assert.rejects(request(), /Не удалось связаться с сервером/);
});

test("отмена запроса не превращается в сетевую ошибку", async (t) => {
  const controller = new AbortController();
  const error = new DOMException("Aborted", "AbortError");
  t.mock.method(globalThis, "fetch", async () => {
    controller.abort();
    throw error;
  });
  await assert.rejects(request(controller.signal), (actual) => actual === error);
});

test("отмена чтения тела не превращается в ошибку JSON", async (t) => {
  const controller = new AbortController();
  const error = new DOMException("Aborted", "AbortError");
  t.mock.method(globalThis, "fetch", async () => ({
    ok: true,
    json: async () => { controller.abort(); throw error; },
  }));
  await assert.rejects(request(controller.signal), (actual) => actual === error);
});
