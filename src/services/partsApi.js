export async function getParts(
  { number, brand },
  signal,
  config = import.meta.env ?? {},
) {
  const apiUrl = config.VITE_API_URL || "http://api.favorit-parts.ru/hs/hsprice/";
  const apiKey = config.VITE_API_KEY?.trim();
  if (!apiKey)
    throw new Error("Укажите VITE_API_KEY в .env и перезапустите npm run dev.");
  const url = new URL(apiUrl);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("number", number);
  if (brand) {
    url.searchParams.set("brand", brand);
    url.searchParams.set("analogues", "on");
  }
  let response;
  try {
    response = await fetch(url.toString(), { method: "GET", signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(
      "Не удалось связаться с сервером. Проверьте подключение и повторите поиск.",
    );
  }
  let data;
  try {
    data = await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    throw new Error("Сервер вернул невалидный JSON.");
  }
  const apiError = data?.error;
  if (!response.ok || apiError) {
    throw new Error(
      Array.isArray(apiError)
        ? apiError.join("; ")
        : apiError || `HTTP ${response.status}`,
    );
  }
  if (!Array.isArray(data?.goods))
    throw new Error("Ответ API не содержит массива goods.");
  return data.goods;
}
