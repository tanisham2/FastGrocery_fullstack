"use client";

export default function ProductCard({ product, qty, onAdd, onIncrease, onDecrease }) {
  const { name, price, category, stock, imageUrl, description } = product;
  const outOfStock = stock === 0;

  return (
    <div style={{
      background: "#fff", borderRadius: "12px",
      border: "0.5px solid #e8e8e8", overflow: "hidden",
      opacity: outOfStock ? 0.5 : 1,
      transition: "transform 0.15s, box-shadow 0.15s",
    }}>
      <div style={{
        background: "#f9f9f7", height: "130px",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", padding: "12px"
      }}>
        <img
          src={imageUrl || "/placeholder.png"}
          alt={name}
          style={{ maxHeight: "120px", maxWidth: "100%", objectFit: "contain" }}
          onError={(e) => { 
            e.target.style.display = "none";
            e.target.parentElement.innerHTML += '<div style="font-size:40px;display:flex;align-items:center;justify-content:center;height:100%">🛍️</div>';
          }}
        />
        {outOfStock && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{
              background: "rgba(0,0,0,0.6)", color: "#fff",
              fontSize: "11px", fontWeight: 700,
              padding: "4px 10px", borderRadius: "6px"
            }}>Out of stock</span>
          </div>
        )}
        <span style={{
          position: "absolute", top: 8, right: 8,
          fontSize: "10px", fontWeight: 600,
          background: "#fff", border: "0.5px solid #e0e0e0",
          color: "#555", padding: "2px 6px", borderRadius: "4px"
        }}>⏱ 9 min</span>
      </div>

      <div style={{ padding: "10px 12px 12px" }}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
        <p style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>{description || category}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "14px", fontWeight: 700 }}>₹{price}</span>
          {qty === 0 ? (
            <button
              onClick={onAdd}
              disabled={outOfStock}
              style={{
                background: "#fff", border: "1.5px solid #6fc0e8",
                color: "#2189d9", fontSize: "13px", fontWeight: 700,
                borderRadius: "6px", padding: "5px 14px", cursor: "pointer"
              }}
            >ADD</button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #1641a4", borderRadius: "6px", overflow: "hidden" }}>
              <button onClick={onDecrease} style={{ background: "#132e76", color: "#fff", border: "none", width: "28px", height: "28px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>−</button>
              <span style={{ width: "28px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#2f3b77" }}>{qty}</span>
              <button onClick={onIncrease} style={{ background: "#1b5f93", color: "#fff", border: "none", width: "28px", height: "28px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}