export default function Brands({ brands, selected, onSelect }) {
  return (
    <div className="d-flex flex-wrap gap-2">
      {brands.map((brand) => (
        <button
          type="button"
          key={brand}
          className={`btn ${selected === brand ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={() => onSelect(brand)}
        >
          {brand}
        </button>
      ))}
    </div>
  );
}
