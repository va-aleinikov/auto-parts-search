import { useState } from "react";

const PAGE_SIZE = 50;
const fmt = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export default function OffersTable({ offers }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(offers.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const visibleOffers = offers.slice(start, start + PAGE_SIZE);
  return (
    <>
      {pageCount > 1 && (
        <nav
          className="d-flex flex-wrap align-items-center gap-2 mb-3"
          aria-label="Страницы предложений"
        >
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Назад
          </button>
          <span className="small text-secondary" aria-live="polite">
            Страница {page} из {pageCount}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={page === pageCount}
            onClick={() => setPage(page + 1)}
          >
            Далее
          </button>
        </nav>
      )}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Наименование</th>
              <th>Производитель</th>
              <th>Артикул</th>
              <th>Тип</th>
              <th>Склад</th>
              <th className="text-end">Цена</th>
              <th className="text-end">Остаток</th>
            </tr>
          </thead>
          <tbody>
            {visibleOffers.map((o, i) => (
              <tr key={`${o.brand}-${o.number}-${o.warehouse}-${i}`}>
                <td>{o.name}</td>
                <td className="fw-semibold">{o.brand}</td>
                <td className="font-monospace">{o.number}</td>
                <td>
                  {o.analogue ? (
                    <span className="badge text-bg-info">Аналог</span>
                  ) : (
                    <span className="badge text-bg-secondary">
                      Искомая деталь
                    </span>
                  )}
                </td>
                <td>{o.warehouse}</td>
                <td className="text-end text-nowrap">
                  {o.price === null ? "Не указана" : fmt.format(o.price)}
                </td>
                <td className="text-end">{o.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
