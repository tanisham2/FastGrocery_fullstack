"use client";
import { useRouter } from "next/navigation";

export default function ProductCard({ product, qty, onAdd, onIncrease, onDecrease }) {
  const { _id, name, price, category, stock, imageUrl, description } = product;
  const outOfStock = stock === 0;
  const router = useRouter();

  return (
    <div
      style={{
        background: "#fff", borderRadius: "12px",
        border: "0.5px solid #e8e8e8", overflow: "hidden",
        opacity: outOfStock ? 0.5 : 1,
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
    >
      {/* Clickable image */}
      <div
        onClick={() => router.push(`/products/${_id}`)}
        style={{ background: "#f9f9f7", height: "160px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "12px", cursor: "pointer" }}
      >
        {imageUrl
          ? <img src={imageUrl} alt={name} style={{ maxHeight: "130px", maxWidth: "100%", objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />
          : <span style={{ fontSize: "48px" }}>🛍️</span>
        }
        {outOfStock && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px" }}>Out of stock</span>
          </div>
        )}
        <span style={{ position: "absolute", top: 8, right: 8, fontSize: "10px", fontWeight: 600, background: "#fff", border: "0.5px solid #e0e0e0", color: "#555", padding: "2px 6px", borderRadius: "4px" }}>
          ⏱ 10 min
        </span>
      </div>

      <div style={{ padding: "10px 12px 12px" }}>
        {/* Clickable name */}
        <p
          onClick={() => router.push(`/products/${_id}`)}
          style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}
        >
          {name}
        </p>
        <p style={{ fontSize: "12px", color: "#888", marginBottom: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {description || category}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "15px", fontWeight: 700 }}>₹{price}</span>
          {qty === 0 ? (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              disabled={outOfStock}
              style={{ background: "#fff", border: "1.5px solid #0c831f", color: "#0c831f", fontSize: "13px", fontWeight: 700, borderRadius: "6px", padding: "5px 14px", cursor: "pointer" }}
            >
              ADD
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #0c831f", borderRadius: "6px", overflow: "hidden" }}>
              <button onClick={(e) => { e.stopPropagation(); onDecrease(); }} style={{ background: "#0c831f", color: "#fff", border: "none", width: "28px", height: "28px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>−</button>
              <span style={{ width: "28px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#0c831f" }}>{qty}</span>
              <button onClick={(e) => { e.stopPropagation(); onIncrease(); }} style={{ background: "#0c831f", color: "#fff", border: "none", width: "28px", height: "28px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}