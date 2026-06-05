"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null); 
  const router = useRouter();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!token) { 
      router.push("/login"); 
      return; 
    }
    fetch(`${API}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Cart data:", data);
        const items = data.data?.products || [];
        setCartItems(items);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    setCartItems((prev) => prev.filter((item) => {
      const id = item.productId?._id || item.productId;
      return id !== productId;
    }));
    await fetch(`${API}/api/cart/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleQty = async (productId, delta, currentQty) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) { handleRemove(productId); return; }
    setCartItems((prev) => prev.map((item) => {
      const id = item.productId?._id || item.productId;
      return id === productId ? { ...item, quantity: newQty } : item;
    }));
    await fetch(`${API}/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ productId, quantity: newQty }),
    });
  };

  const handleClear = async () => {
    setCartItems([]);
    await fetch(`${API}/api/cart/clear`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleCheckout = async () => {
    if (!address.trim()) { alert("Please enter a delivery address"); return; }
    setPlacing(true);

    const items = cartItems.map((item) => ({
      productId: item.productId?._id || item.productId,
      quantity: item.quantity,
      price:
      item.productId?.salePrice ??
      item.productId?.price ??
      item.price ??
      0,
    }));

    const finalTotal = cartItems.reduce((sum, item) => {            //recalculate total to ensure accuracy
      const price = 
      item.productId?.salePrice ??
      item.productId?.price ??
      item.price ??
      0;
      return sum + price * item.quantity;
    }, 0);

    const finalAddress = address;

    try {
      const res = await fetch(`${API}/api/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items, totalAmount: finalTotal, address: finalAddress }),
      });

      if (res.ok) {
        await handleClear();
        setOrderSuccess({ total: finalTotal, address: finalAddress });
      } 
      else {
        const err = await res.json();
        alert(err.message || "Checkout failed");
      }
    } 
    catch (err) {
      alert("Something went wrong");
    } finally {
      setPlacing(false);
    }
  };

const totalAmount = cartItems.reduce((sum, item) => {
  const product = item.productId || {};
  const price = product.salePrice ?? product.price ?? item.price ?? 0;
  return sum + price * item.quantity;
}, 0);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  if (orderSuccess) {
    return (
      <div style={{ minHeight: "100vh", background: "rgb(228, 228, 49)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "rgb(243, 243, 240)", borderRadius: "16px", padding: "48px 40px", textAlign: "center", maxWidth: "400px", border: "0.5px solid #e8e8e8" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a1a", marginBottom: "8px" }}>Order Placed!</h2>
          <p style={{ color: "#888", fontSize: "14px", marginBottom: "8px" }}>
            Your order of ₹{orderSuccess.total} is confirmed.
          </p>
          <p style={{ color: "#888", fontSize: "13px", marginBottom: "32px" }}>
            Delivering to: {orderSuccess.address}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={() => router.push("/")}
              style={{ background: "#1778b4", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 24px", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
            >
              Continue Shopping
            </button>
            <button
              onClick={() => router.push("/orders")}
              style={{ background: "#fff", color: "#1bafc3", border: "1.5px solid #226bd0", borderRadius: "8px", padding: "12px 24px", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0" }}>
      <header style={{ background: "#17c5e3", padding: "14px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={() => router.push("/")}
          style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
        >
          ← Back
        </button>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff" }}>
          🛒 My Cart {totalItems > 0 && <span style={{ fontSize: "14px", fontWeight: 500, opacity: 0.8 }}>({totalItems} items)</span>}
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={handleClear}
            style={{ marginLeft: "auto", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "13px" }}
          >
            Clear All
          </button>
        )}
      </header>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#888" }}>Loading cart...</div>
        ) : cartItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🛒</div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a", marginBottom: "8px" }}>Your cart is empty</h2>
            <p style={{ color: "#888", marginBottom: "24px" }}>Add some products to get started</p>
            <button
              onClick={() => router.push("/")}
              style={{ background: "#179dd6", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 28px", fontWeight: 700, fontSize: "15px", cursor: "pointer" }}
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {cartItems.map((item) => {
                const product = item.productId || {};
                const productId = product._id || item.productId;
                const name = product.name || item.name || "Product";
                const price = product.price || item.price || 0;
                const image = product.imageUrl || item.imageUrl || null;

                return (
                  <div key={productId} style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e8e8e8", padding: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "70px", height: "70px", background: "#f9f9f7", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {image
                        ? <img src={image} alt={name} style={{ width: "60px", height: "60px", objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />
                        : <span style={{ fontSize: "28px" }}>🛍️</span>
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a", marginBottom: "4px" }}>{name}</p>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#0ea4ac" }}>₹{price}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #31cbd9", borderRadius: "8px", overflow: "hidden" }}>
                      <button onClick={() => handleQty(productId, -1, item.quantity)} style={{ background: "#176de7", color: "#fff", border: "none", width: "32px", height: "32px", fontSize: "18px", fontWeight: 700, cursor: "pointer" }}>−</button>
                      <span style={{ width: "36px", textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#155bbc" }}>{item.quantity}</span>
                      <button onClick={() => handleQty(productId, 1, item.quantity)} style={{ background: "#23b4c7", color: "#fff", border: "none", width: "32px", height: "32px", fontSize: "18px", fontWeight: 700, cursor: "pointer" }}>+</button>
                    </div>
                    <div style={{ minWidth: "70px", textAlign: "right" }}>
                      <p style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a" }}>₹{price * item.quantity}</p>
                    </div>
                    <button
                      onClick={() => handleRemove(productId)}
                      style={{ background: "#fff5f5", border: "none", color: "#e53e3e", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e8e8e8", padding: "20px", position: "sticky", top: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a", marginBottom: "16px" }}>Order Summary</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#555" }}>
                  <span>Items ({totalItems})</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#555" }}>
                  <span>Delivery</span>
                  <span style={{ color: "#29bef0", fontWeight: 600 }}>FREE</span>
                </div>
                <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: 700, color: "#1a1a1a" }}>
                  <span>Total</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#555", display: "block", marginBottom: "6px" }}>
                  📍 Delivery Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full delivery address..."
                  rows={3}
                  style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "13px", resize: "none", outline: "none", fontFamily: "inherit", color: "#333", boxSizing: "border-box" }}
                  onFocus={(e) => e.target.style.borderColor = "#000000"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>
              <button
                onClick={handleCheckout}
                disabled={placing}
                style={{ width: "100%", background: placing ? "#aaa" : "#2675dc", color: "#fff", border: "none", borderRadius: "8px", padding: "14px", fontWeight: 700, fontSize: "15px", cursor: placing ? "not-allowed" : "pointer" }}
              >
                {placing ? "Placing Order..." : `Place Order • ₹${totalAmount}`}
              </button>
              <p style={{ fontSize: "11px", color: "#aaa", textAlign: "center", marginTop: "10px" }}>
                🔒 Safe & secure checkout
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}