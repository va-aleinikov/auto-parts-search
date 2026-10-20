import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  searchBrands,
  searchOffers,
  selectBrand,
  setNumber,
} from "./features/parts/partsSlice.js";
import Brands from "./components/Brands.jsx";
import OffersTable from "./components/OffersTable.jsx";
import Loading from "./components/Loading.jsx";
export default function App() {
  const dispatch = useDispatch();
  const {
    number,
    brands,
    selectedBrand,
    offers,
    brandsStatus,
    offersStatus,
    brandsError,
    offersError,
  } = useSelector((s) => s.parts);
  const brandTask = useRef(null),
    offerTask = useRef(null),
    timer = useRef(null);
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      brandTask.current?.abort();
      offerTask.current?.abort();
    },
    [],
  );
  const runBrands = (value) => {
    clearTimeout(timer.current);
    brandTask.current?.abort();
    offerTask.current?.abort();
    if (value.trim()) brandTask.current = dispatch(searchBrands(value.trim()));
  };
  const onInput = (value) => {
    clearTimeout(timer.current);
    brandTask.current?.abort();
    offerTask.current?.abort();
    dispatch(setNumber(value));
    if (value.trim()) timer.current = setTimeout(() => runBrands(value), 550);
  };
  const onBrand = (brand) => {
    offerTask.current?.abort();
    dispatch(selectBrand(brand));
    offerTask.current = dispatch(
      searchOffers({ number: number.trim(), brand }),
    );
  };
  return (
    <>
      <header className="app-header py-4 mb-4">
        <div className="container">
          <div className="small text-uppercase opacity-75 mb-1">
            Каталог автозапчастей
          </div>
          <h1 className="h3 mb-0">Поиск деталей и аналогов</h1>
        </div>
      </header>
      <main className="container pb-5">
        <section className="card shadow-sm mb-4">
          <div className="card-body p-4">
            <h2 className="h5 mb-3">
              <span className="step">1</span> Поиск производителей
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runBrands(number);
              }}
            >
              <label htmlFor="article" className="form-label">
                Артикул автозапчасти
              </label>
              <div className="input-group">
                <input
                  id="article"
                  className="form-control form-control-lg"
                  placeholder="Например, 7160500039S"
                  value={number}
                  onChange={(e) => onInput(e.target.value)}
                  autoComplete="off"
                />
                <button
                  className="btn btn-primary px-4"
                  disabled={!number.trim() || brandsStatus === "loading"}
                  type="submit"
                >
                  Найти
                </button>
              </div>
              <div className="form-text">
                Поиск начнется автоматически после ввода артикула.
              </div>
            </form>
            {brandsStatus === "loading" && (
              <Loading label="Ищем производителей..." />
            )}
            {brandsStatus === "failed" && (
              <div className="alert alert-danger mt-3" role="alert">
                {brandsError}
              </div>
            )}
            {brandsStatus === "succeeded" &&
              (brands.length ? (
                <div className="mt-4">
                  <p className="text-secondary mb-2">
                    Найдено производителей: {brands.length}. Выберите один:
                  </p>
                  <Brands
                    brands={brands}
                    selected={selectedBrand}
                    onSelect={onBrand}
                  />
                </div>
              ) : (
                <div className="alert alert-warning mt-3">
                  По этому артикулу производители не найдены.
                </div>
              ))}
          </div>
        </section>
        <section className="card shadow-sm">
          <div className="card-body p-4">
            <h2 className="h5 mb-3">
              <span className="step">2</span> Аналоги и складские предложения
            </h2>
            {!selectedBrand && (
              <p className="text-secondary mb-0">
                Сначала найдите артикул и выберите производителя.
              </p>
            )}
            {selectedBrand && (
              <>
                <p className="text-secondary">
                  Артикул: <strong>{number}</strong> · Производитель:{" "}
                  <strong>{selectedBrand}</strong>
                </p>
                {offersStatus === "loading" && (
                  <Loading label="Получаем аналоги и остатки..." />
                )}
                {offersStatus === "failed" && (
                  <div className="alert alert-danger" role="alert">
                    {offersError}{" "}
                    <button
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => onBrand(selectedBrand)}
                    >
                      Повторить
                    </button>
                  </div>
                )}
                {offersStatus === "succeeded" &&
                  (offers.length ? (
                    <>
                      <p className="text-secondary">
                        Найдено предложений: {offers.length}
                      </p>
                      <OffersTable offers={offers} />
                      <p className="small text-muted mb-0">
                        Цены и остатки указаны для конкретных складов.
                      </p>
                    </>
                  ) : (
                    <div className="alert alert-warning">
                      Нет доступных предложений или аналогов.
                    </div>
                  ))}
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
