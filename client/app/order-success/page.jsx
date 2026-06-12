"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderSuccessPage() {
  const [order, setOrder] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("lastOrder");
    if (!stored) { router.push("/"); return; }
    setOrder(JSON.parse(stored));
  }, []);

  if (!order) return null;

  const date = new Date(order.date).toLocaleString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#dec45b", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#fff", borderRadius: "20px", border: "0.5px solid #e8e8e8", maxWidth: "580px", width: "100%", overflow: "hidden" }}>

        {/* Success header */}
        <div style={{ background: "linear-gradient(135deg, #1a6fe8, #b9b0e7)", padding: "40px 32px", textAlign: "center" }}>
          <div style={{ fontSize: "72px", marginBottom: "12px", animation: "bounce 0.6s ease" }}>🎉</div>
          <h1 style={{ margin: "0 0 6px", fontSize: "26px", fontWeight: 800, color: "#fff" }}>Order Placed Successfully!</h1>
          <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>Thank you for shopping with FastGrocery</p>
        </div>

        {/* Order details */}
        <div style={{ padding: "28px 32px" }}>

          {/* Order ID + Date */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <div style={{ background: "#f0f6ff", borderRadius: "10px", padding: "14px", border: "0.5px solid #d0e4ff" }}>
              <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#888", fontWeight: 600 }}>ORDER ID</p>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#1a6fe8" }}>
                #{order.orderId?.slice(-10).toUpperCase() || "XXXXXXXXXX"}
              </p>
            </div>
            <div style={{ background: "#f0f6ff", borderRadius: "10px", padding: "14px", border: "0.5px solid #d0e4ff" }}>
              <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#888", fontWeight: 600 }}>ORDER DATE</p>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#1a1a1a" }}>{date}</p>
            </div>
          </div>

          {/* Payment + Total */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <div style={{ background: "#f0fff4", borderRadius: "10px", padding: "14px", border: "0.5px solid #c3e6cb" }}>
              <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#888", fontWeight: 600 }}>PAYMENT METHOD</p>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0c831f" }}>
                {order.paymentMethod === "COD" ? "💵 Cash on Delivery" : "📱 Paytm"}
              </p>
            </div>
            <div style={{ background: "#fffde7", borderRadius: "10px", padding: "14px", border: "0.5px solid #ffe082" }}>
              <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#888", fontWeight: 600 }}>ORDER TOTAL</p>
              <p style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#1a6fe8" }}>₹{order.total}</p>
            </div>
          </div>

          {/* Delivery address */}
          <div style={{ background: "#f9f9f7", borderRadius: "10px", padding: "14px", marginBottom: "20px", border: "0.5px solid #e8e8e8" }}>
            <p style={{ margin: "0 0 6px", fontSize: "11px", color: "#888", fontWeight: 600 }}>📍 DELIVERING TO</p>
            <p style={{ margin: 0, fontSize: "14px", color: "#333", lineHeight: 1.6 }}>{order.address}</p>
          </div>

          {/* Items summary */}
          {order.items && order.items.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: 700, color: "#555" }}>ITEMS ORDERED</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#555", padding: "6px 10px", background: "#f9f9f7", borderRadius: "6px" }}>
                    <span>{item.name} × {item.qty}</span>
                    <span style={{ fontWeight: 600 }}>₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery estimate */}
          <div style={{ background: "#e8f5e9", borderRadius: "10px", padding: "12px 16px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "24px" }}>⚡</span>
            <div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0a59f7" }}>Delivery in 10 minutes</p>
              <p style={{ margin: 0, fontSize: "12px", color: "#555" }}>Your order is being prepared</p>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => router.push("/orders")}
              style={{ flex: 1, background: "#1a6fe8", color: "#fff", border: "none", borderRadius: "10px", padding: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}
            >
              📦 View My Orders
            </button>
            <button
              onClick={() => router.push("/")}
              style={{ flex: 1, background: "#fff", color: "#1a6fe8", border: "2px solid #1a6fe8", borderRadius: "10px", padding: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}
            >
              🛒 Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}