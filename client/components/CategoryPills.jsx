"use client";

const ICONS = {
  All: "🛒", Dairy: "🥛", Fruits: "🍎", Snacks: "🍪",
  Beverages: "🥤", Bakery: "🍞", Staples: "🌾"
};

export default function CategoryPills({ categories, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px", marginBottom: "1.5rem" }}>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: active === cat ? "#e8f5e9" : "#fff",
            border: active === cat ? "1.5px solid #0c831f" : "1.5px solid #e0e0e0",
            color: active === cat ? "#0c831f" : "#333",
            borderRadius: "999px", padding: "6px 14px",
            fontSize: "13px", fontWeight: 500,
            cursor: "pointer", whiteSpace: "nowrap"
          }}
        >
          {ICONS[cat]} {cat}
        </button>
      ))}
    </div>
  );
}