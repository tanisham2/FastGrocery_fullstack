"use client";
import { useRouter } from "next/navigation";

export default function ProductCard({ product, qty, onAdd, onIncrease, onDecrease }) {
  const { _id, name, price, realPrice, salePrice, category, stock, imageUrl, description } = product;
  const primaryImage =
  (product.images && product.images[0]) ||
  product.imageUrl ||
  null;
  
  const router = useRouter();

  const displaySalePrice = salePrice ?? price ?? 0;
  const displayRealPrice = realPrice ?? price ?? 0;
  const hasDiscount = displayRealPrice > displaySalePrice;
  const discountPct = hasDiscount ? Math.round(((displayRealPrice - displaySalePrice) / displayRealPrice) * 100) : 0;
  const outOfStock = stock === 0;
  const lowStock = stock > 0 && stock <= 5;

  return (
    <div
      style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e8e8e8", overflow: "hidden", opacity: outOfStock ? 0.6 : 1, transition: "box-shadow 0.15s" }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
    >
      {/* Image */}
      <div
        onClick={() => router.push(`/products/${_id}`)}
        style={{ background: "#f9f9f7", height: "160px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "12px", cursor: "pointer" }}
      >
        {primaryImage
          ? <img src={primaryImage} alt={name} style={{ 
            maxHeight: "130px", maxWidth: "100%", objectFit: "contain" }} 
            onError={(e) => { 
              e.target.style.display = "none"; }} 
              />
          : <span style={{ fontSize: "48px" }}>🛍️</span>
        }

        {/* Discount badge */}
        {hasDiscount && (
          <div style={{ position: "absolute", top: 8, left: 8, background: "#0c58c2", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 7px", borderRadius: "6px" }}>
            {discountPct}% OFF
          </div>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px" }}>Out of Stock</span>
          </div>
        )}

        <span style={{ position: "absolute", top: 8, right: 8, fontSize: "10px", fontWeight: 600, background: "#fff", border: "0.5px solid #e0e0e0", color: "#555", padding: "2px 6px", borderRadius: "4px" }}>
          ⏱ 10 min
        </span>
      </div>

      <div style={{ padding: "10px 12px 12px" }}>
        <p onClick={() => router.push(`/products/${_id}`)} style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}>
          {name}
        </p>
        <p style={{ fontSize: "12px", color: "#888", marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {product.shortDescription || product.description || product.category}
        </p>

        {/* Stock status */}
        {lowStock && (
          <p style={{ fontSize: "11px", color: "#e67e22", fontWeight: 600, marginBottom: "6px" }}>
            ⚠ Only {stock} left
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a" }}>₹{displaySalePrice}</span>
            {hasDiscount && (
              <span style={{ fontSize: "12px", color: "#aaa", textDecoration: "line-through", marginLeft: "5px" }}>₹{displayRealPrice}</span>
            )}
          </div>
          {qty === 0 ? (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              disabled={outOfStock}
              style={{ background: "#fff", border: "1.5px solid #22b4d8", color: "#096ee1", fontSize: "13px", fontWeight: 700, borderRadius: "6px", padding: "5px 14px", cursor: outOfStock ? "not-allowed" : "pointer", opacity: outOfStock ? 0.5 : 1 }}
            >
              ADD
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #0c4883", borderRadius: "6px", overflow: "hidden" }}>
              <button onClick={(e) => { e.stopPropagation(); onDecrease(); }} style={{ background: "#1a7ed5", color: "#fff", border: "none", width: "28px", height: "28px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>−</button>
              <span style={{ width: "28px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#0860d4" }}>{qty}</span>
              <button
                onClick={(e) => { e.stopPropagation(); if (qty < stock) onIncrease(); }}
                style={{ background: qty >= stock ? "#aaa" : "#11c4e8", color: "#fff", border: "none", width: "28px", height: "28px", fontSize: "16px", fontWeight: 700, cursor: qty >= stock ? "not-allowed" : "pointer" }}
              >+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}