"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_COLORS = {
  pending:    { bg: "#fff3cd", color: "#856404" },
  confirmed:  { bg: "#d1ecf1", color: "#0c5460" },
  delivered:  { bg: "#d4edda", color: "#155724" },
  cancelled:  { bg: "#f8d7da", color: "#721c24" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const API = process.env.NEXT_PUBLIC_API_URL;

useEffect(() => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  console.log("token:", token, "userId:", userId); // debug

  if (!token || !userId) {
    router.push('/login');
    return;
  }

  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      console.log("Orders status:", res.status);
      return res.json();
    })
    .then((data) => {
      console.log("Orders data:", data);
      const list = Array.isArray(data) ? data : data.orders || [];
      setOrders([...list].reverse());
    })
    .catch(console.error)
    .finally(() => setLoading(false));
}, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0" }}>

      {/* Header */}
      <header style={{ background: "#000000", padding: "14px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={() => router.push("/")}
          style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
        >
          ← Back
        </button>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff" }}>📦 My Orders</div>
      </header>

      <main style={{ maxWidth: "750px", margin: "0 auto", padding: "24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#888" }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>📦</div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a", marginBottom: "8px" }}>No orders yet</h2>
            <p style={{ color: "#888", marginBottom: "24px" }}>Your order history will appear here</p>
            <button
              onClick={() => router.push("/")}
              style={{ background: "#0f6cbe", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 28px", fontWeight: 700, fontSize: "15px", cursor: "pointer" }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {orders.map((order, index) => {
              const status = order.status || "pending";
              const statusStyle = STATUS_COLORS[status] || STATUS_COLORS.pending;
              const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit"
              });

              return (
                <div key={order._id} style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e8e8e8", overflow: "hidden" }}>

                  {/* Order Header */}
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <p style={{ fontSize: "13px", color: "#888", marginBottom: "2px" }}>Order #{order._id?.slice(-8).toUpperCase()}</p>
                      <p style={{ fontSize: "12px", color: "#aaa" }}>{date}</p>
                    </div>
                    <span style={{
                      background: statusStyle.bg, color: statusStyle.color,
                      fontSize: "12px", fontWeight: 700,
                      padding: "4px 12px", borderRadius: "999px",
                      textTransform: "capitalize"
                    }}>
                      {status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {(order.items || []).map((item, i) => {
                      const name = item.productId?.name || item.name || "Product";
                      const price = item.productId?.price || item.price || 0;
                      const image = item.productId?.imageUrl || item.imageUrl || null;

                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "44px", height: "44px", background: "#f9f9f7", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {image
                              ? <img src={image} alt={name} style={{ width: "36px", height: "36px", objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />
                              : <span style={{ fontSize: "20px" }}>🛍️</span>
                            }
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>{name}</p>
                            <p style={{ fontSize: "12px", color: "#888" }}>Qty: {item.quantity} × ₹{price} =₹ {price * item.quantity}</p>
                          </div>
                          <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>₹{price * item.quantity}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Footer */}
                  <div style={{ padding: "12px 20px", background: "#fafafa", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ fontSize: "13px", color: "#666" }}>
                      📍 {order.address}
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a" }}>
                      Total: ₹{order.totalAmount}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}