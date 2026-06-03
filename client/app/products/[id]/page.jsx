"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ProductDetailPage() {
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(0);
  const [pincode, setPincode] = useState("");
  const [pincodeMsg, setPincodeMsg] = useState(null);
  const [checkingPin, setCheckingPin] = useState(false);
  const [cart, setCart] = useState({});
  const router = useRouter();
  const { id } = useParams();
  const API = process.env.NEXT_PUBLIC_API_URL;

  // fetch product details + check if already in cart
  useEffect(() => {
    if (!id) return;

    // fetch all products, find this one + similar
    fetch(`${API}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.products || [];
        const found = list.find((p) => p._id === id);
        setProduct(found || null);
        if (found) {
          setSimilar(list.filter((p) => p._id !== id && p.category === found.category));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // fetch current cart qty for this product
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const products = data.data?.products || [];
          const item = products.find((p) => {
            const pid = p.productId?._id || p.productId;
            return pid === id;
          });
          if (item) setQty(item.quantity);
        })
        .catch(() => {});
    }
  }, [id]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const handleAdd = async () => {
    if (!token) { router.push("/login"); return; }
    const newQty = qty + 1;
    setQty(newQty);
    await fetch(`${API}/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ productId: id, quantity: newQty }),
    });
  };

  const handleQty = async (delta) => {
    const newQty = qty + delta;
    if (newQty <= 0) {
      setQty(0);
      await fetch(`${API}/api/cart/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      setQty(newQty);
      await fetch(`${API}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: id, quantity: newQty }),
      });
    }
  };

const checkPincode = async () => {
  if (!/^\d{6}$/.test(pincode)) {
    setPincodeMsg({ ok: false, text: "Enter a valid 6-digit pincode" });
    return;
  }
  setCheckingPin(true);
  try {
    const res = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`
    );
    const data = await res.json();
    const valid = data[0].Status === "Success";

    if (valid) {
      const postOffice = data[0].PostOffice[0];
      const area = postOffice.Name;
      const city = postOffice.District;
      const state = postOffice.State;

      setPincodeMsg({
        ok: true,
        text: `✓ Delivery available in ${area}, ${city}, ${state} — arrives in 10 minutes!`,
      });
    } 
    else {
      setPincodeMsg({
        ok: false,
        text: "✗ Invalid pincode",
      });
    }
  } 
  catch {
    setPincodeMsg({
      ok: false,
      text: "Unable to verify pincode",
    });
  }
  setCheckingPin(false);
};

  const handleSimilarCart = async (productId, currentQty) => {
    if (!token) { router.push("/login"); return; }
    const newQty = (currentQty || 0) + 1;
    setCart((prev) => ({ ...prev, [productId]: newQty }));
    await fetch(`${API}/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ productId, quantity: newQty }),
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#888", fontSize: "16px" }}>Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f0", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontSize: "48px" }}>😕</div>
        <p style={{ fontSize: "18px", fontWeight: 600, color: "#1a1a1a" }}>Product not found</p>
        <button onClick={() => router.push("/")} style={{ background: "#0c831f", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontWeight: 700, cursor: "pointer" }}>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0" }}>

      {/* Breadcrumb */}
      <div style={{ background: "#fff", padding: "12px 32px", borderBottom: "0.5px solid #e8e8e8", fontSize: "13px", color: "#888", display: "flex", gap: "6px", alignItems: "center" }}>
        <span onClick={() => router.push("/")} style={{ cursor: "pointer", color: "#0c831f" }}>Home</span>
        <span>/</span>
        <span onClick={() => router.push(`/?category=${product.category}`)} style={{ cursor: "pointer", color: "#0c831f" }}>{product.category}</span>
        <span>/</span>
        <span style={{ color: "#555" }}>{product.name}</span>
      </div>

      {/* Main Product Section */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start", background: "#fff", borderRadius: "16px", border: "0.5px solid #e8e8e8", padding: "32px" }}>

          {/* Left — Image */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "100%", maxWidth: "380px", aspectRatio: "1", background: "#f9f9f7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {product.imageUrl
                ? <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "16px" }} onError={(e) => { e.target.style.display = "none"; }} />
                : <span style={{ fontSize: "80px" }}>🛍️</span>
              }
            </div>
            {/* Thumbnail row */}
            {product.imageUrl && (
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ width: "60px", height: "60px", border: "2px solid #0c831f", borderRadius: "8px", overflow: "hidden", cursor: "pointer" }}>
                  <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
              </div>
            )}
          </div>

          {/* Right — Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Category badge */}
            <span style={{ background: "#e8f5e9", color: "#0c831f", fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "999px", width: "fit-content" }}>
              {product.category}
            </span>

            {/* Name */}
            <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#1a1a1a", margin: 0, lineHeight: 1.3 }}>
              {product.name}
            </h1>

            {/* Description */}
            <p style={{ fontSize: "15px", color: "#555", lineHeight: 1.6, margin: 0 }}>
              {product.description || "Fresh and high quality product delivered to your doorstep in minutes."}
            </p>

            {/* Delivery time */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0faf0", border: "1px solid #c8e6c9", borderRadius: "8px", padding: "10px 14px" }}>
              <span style={{ fontSize: "20px" }}>⚡</span>
              <div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#1a1a1a" }}>Delivery in 10 minutes</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>Shipped from nearby dark store</p>
              </div>
            </div>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "32px", fontWeight: 800, color: "#1a1a1a" }}>₹{product.price}</span>
              <span style={{ fontSize: "13px", color: "#aaa" }}>(Inclusive of all taxes)</span>
            </div>

            {/* Stock */}
            <p style={{ margin: 0, fontSize: "13px", color: product.stock > 0 ? "#0c831f" : "#e53e3e", fontWeight: 600 }}>
              {product.stock > 0 ? `✓ In stock (${product.stock} available)` : "✗ Out of stock"}
            </p>

            {/* Add to cart */}
            {product.stock > 0 && (
              qty === 0 ? (
                <button
                  onClick={handleAdd}
                  style={{ background: "#0c831f", color: "#fff", border: "none", borderRadius: "10px", padding: "14px 40px", fontSize: "16px", fontWeight: 700, cursor: "pointer", width: "fit-content" }}
                >
                  Add to cart
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "0", border: "2px solid #0c831f", borderRadius: "10px", overflow: "hidden", width: "fit-content" }}>
                  <button onClick={() => handleQty(-1)} style={{ background: "#0c831f", color: "#fff", border: "none", width: "44px", height: "44px", fontSize: "20px", fontWeight: 700, cursor: "pointer" }}>−</button>
                  <span style={{ width: "48px", textAlign: "center", fontSize: "16px", fontWeight: 700, color: "#0c831f" }}>{qty}</span>
                  <button onClick={() => handleQty(1)} style={{ background: "#0c831f", color: "#fff", border: "none", width: "44px", height: "44px", fontSize: "20px", fontWeight: 700, cursor: "pointer" }}>+</button>
                </div>
              )
            )}

            {/* Pincode checker */}
            <div style={{ borderTop: "0.5px solid #f0f0f0", paddingTop: "20px" }}>
              <p style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 600, color: "#333" }}>
                📍 Check delivery availability
              </p>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "")); setPincodeMsg(null); }}
                  placeholder="Enter pincode"
                  style={{ border: "1.5px solid #e0e0e0", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none", width: "150px" }}
                  onFocus={(e) => e.target.style.borderColor = "#0c831f"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
                <button
                  onClick={checkPincode}
                  disabled={checkingPin}
                  style={{ background: checkingPin ? "#aaa" : "#0c831f", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
                >
                  {checkingPin ? "Checking..." : "Check"}
                </button>
              </div>
              {pincodeMsg && (
                <p style={{ margin: "8px 0 0", fontSize: "13px", fontWeight: 500, color: pincodeMsg.ok ? "#0c831f" : "#e53e3e" }}>
                  {pincodeMsg.text}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similar.length > 0 && (
          <div style={{ marginTop: "40px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a", marginBottom: "20px" }}>
              Similar products
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "16px" }}>
              {similar.map((p) => {
                const simQty = cart[p._id] || 0;
                return (
                  <div
                    key={p._id}
                    style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e8e8e8", overflow: "hidden", cursor: "pointer", transition: "box-shadow 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                  >
                    {/* Image — clickable to open product */}
                    <div
                      onClick={() => router.push(`/products/${p._id}`)}
                      style={{ background: "#f9f9f7", height: "160px", display: "flex", alignItems: "center", justifyContent: "center", padding: "12px", position: "relative" }}
                    >
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} style={{ maxHeight: "130px", maxWidth: "100%", objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />
                        : <span style={{ fontSize: "48px" }}>🛍️</span>
                      }
                      <span style={{ position: "absolute", top: 8, right: 8, fontSize: "10px", fontWeight: 600, background: "#fff", border: "0.5px solid #e0e0e0", color: "#555", padding: "2px 6px", borderRadius: "4px" }}>
                        ⏱ 10 min
                      </span>
                    </div>

                    <div style={{ padding: "12px" }}>
                      <p
                        onClick={() => router.push(`/products/${p._id}`)}
                        style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a", marginBottom: "4px", cursor: "pointer" }}
                      >
                        {p.name}
                      </p>
                      <p style={{ fontSize: "12px", color: "#888", marginBottom: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.description || p.category}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a" }}>₹{p.price}</span>
                        {simQty === 0 ? (
                          <button
                            onClick={() => handleSimilarCart(p._id, simQty)}
                            style={{ background: "#fff", border: "1.5px solid #0c831f", color: "#0c831f", fontSize: "13px", fontWeight: 700, borderRadius: "6px", padding: "5px 14px", cursor: "pointer" }}
                          >
                            ADD
                          </button>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #0c831f", borderRadius: "6px", overflow: "hidden" }}>
                            <button
                              onClick={() => setCart((prev) => ({ ...prev, [p._id]: Math.max(0, (prev[p._id] || 1) - 1) }))}
                              style={{ background: "#0c831f", color: "#fff", border: "none", width: "28px", height: "28px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}
                            >−</button>
                            <span style={{ width: "28px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#0c831f" }}>{simQty}</span>
                            <button
                              onClick={() => handleSimilarCart(p._id, simQty)}
                              style={{ background: "#0c831f", color: "#fff", border: "none", width: "28px", height: "28px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}
                            >+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}