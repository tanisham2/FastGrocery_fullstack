"use client";

export default function CartToast({ count, total, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "fixed", bottom: "1rem",
        left: "50%", transform: "translateX(-50%)",
        background: "#0c831f", color: "#fff",
        borderRadius: "12px", padding: "12px 24px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "3rem",
        cursor: "pointer", zIndex: 100,
        minWidth: "280px",
        boxShadow: "0 4px 20px rgba(12,131,31,0.4)"
      }}
    >
      <div>
        <p style={{ fontSize: "12px", opacity: 0.8, margin: 0 }}>{count} item{count !== 1 ? "s" : ""} in cart</p>
        <p style={{ fontWeight: 700, fontSize: "16px", margin: 0 }}>₹{total}</p>
      </div>
      <span style={{ fontWeight: 700 }}>View Cart →</span>
    </div>
  );
}