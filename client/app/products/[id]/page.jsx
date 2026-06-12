"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ProductDetailPage() {
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);
  const [similarStart, setSimilarStart] = useState(0);
  const [pincode, setPincode] = useState("");
  const [pincodeMsg, setPincodeMsg] = useState(null);
  const [checkingPin, setCheckingPin] = useState(false);
  const [simCart, setSimCart] = useState({});
  const router = useRouter();
  const { id } = useParams();
  const API = process.env.NEXT_PUBLIC_API_URL;

  const THUMBS_VISIBLE = 5;
  const SIM_VISIBLE = 4;

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/api/products`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.products || [];
        const found = list.find(p => p._id === id);
        setProduct(found || null);
        if (found) setSimilar(list.filter(p => p._id !== id && p.category === found.category));
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API}/api/cart`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          const prods = data.data?.products || [];
          const item = prods.find(p => (p.productId?._id || p.productId) === id);
          if (item) setQty(item.quantity);
        })
        .catch(() => {});
    }
  }, [id]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const handleAdd = async () => {
    if (!token) { router.push("/login"); return; }
    if (qty >= product.stock) return;
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
    } else if (newQty <= product.stock) {
      setQty(newQty);
      await fetch(`${API}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: id, quantity: newQty }),
      });
    }
  };

  const handleSimCart = async (productId, currentQty) => {
    if (!token) { router.push("/login"); return; }
    const newQty = (currentQty || 0) + 1;
    setSimCart(prev => ({ ...prev, [productId]: newQty })); // ✅ fixed: was setCart
    await fetch(`${API}/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ productId, quantity: newQty }),
    });
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


  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fffde7", display: "flex", alignItems: "center", 
    justifyContent: "center" }}>
      <p style={{ color: "#888", fontSize: "16px" }}>Loading...</p>
    </div>
  );

  if (!product) return (
    <div style={{ minHeight: "100vh", background: "#fffde7", display: "flex", alignItems: "center", 
    justifyContent: "center", flexDirection: "column", gap: "16px" }}>
      <div style={{ fontSize: "48px" }}>😕</div>
      <p style={{ fontSize: "18px", fontWeight: 600 }}>Product not found</p>
      <button onClick={() => router.push("/")} style={{ background: "#0c86f1", color: "#fff", border: "none", 
        borderRadius: "8px", padding: "10px 24px", fontWeight: 700, cursor: "pointer" }}>
        Go Home
      </button>
    </div>
  );

  const imgs = product.images?.length > 0 ? product.images : product.imageUrl ? [product.imageUrl] : [];
  const displaySalePrice = product.salePrice ?? product.price ?? 0;
  const displayRealPrice = product.realPrice ?? product.price ?? 0;
  const hasDiscount = displayRealPrice > displaySalePrice;
  const discountPct = hasDiscount ? Math.round(((displayRealPrice - displaySalePrice) / displayRealPrice) * 100) : 0;
  const visibleThumbs = imgs.slice(thumbStart, thumbStart + THUMBS_VISIBLE);
  const visibleSimilar = similar.slice(similarStart, similarStart + SIM_VISIBLE);

  return (
    <div style={{ minHeight: "100vh", background: "#dec45b" }}>

      {/* Breadcrumb */}
      <div style={{ background: "#f9f8f8", padding: "12px 32px", borderBottom: "0.5px solid #e8e8e8", 
        fontSize: "13px", color: "#888", display: "flex", gap: "6px", alignItems: "center" }}>
        <span onClick={() => router.push("/")} style={{ cursor: "pointer", color: "#0c70f2" }}>Home</span>
        <span>/</span>
        <span style={{ cursor: "pointer", color: "#0c70f2" }}>{product.category}</span>
        <span>/</span>
        <span style={{ color: "#555" }}>{product.name}</span>
      </div>

      <div style={{ maxWidth: "1100px", margin: "24px auto", padding: "0 24px" }}>

        {/* Main product card */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", background: "#fff", 
          borderRadius: "16px", border: "0.5px solid #e8e8e8", overflow: "hidden" }}>

          {/* LEFT — Image gallery */}
          <div style={{ padding: "32px", borderRight: "0.5px solid #f0f0f0", display: "flex", 
            flexDirection: "column", gap: "16px", alignItems: "center" }}>
            {/* Main image */}
            <div style={{ width: "100%", maxWidth: "360px", aspectRatio: "1", background: "#f9f9f7", 
              borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>

              {imgs.length > 0
                ? <img src={imgs[activeImage]} alt={product.name}
                    style={{ width: "100%", height: "100%", objectFit: "contain", padding: "16px", 
                      transition: "opacity 0.2s" }}
                    onError={(e) => { e.target.style.display = "none"; }} />
                : <span style={{ fontSize: "80px" }}>🛍️</span>
              }
            </div>

            {/* Thumbnail row with arrows */}
            {imgs.length > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", maxWidth: "360px" }}>
                <button
                  onClick={() => setThumbStart(Math.max(0, thumbStart - 1))}
                  disabled={thumbStart === 0}
                  style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1.5px solid #e0e0e0", 
                    background: thumbStart === 0 ? "#f5f5f5" : "#fff", 
                    cursor: thumbStart === 0 ? "not-allowed" : "pointer", 
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", 
                    flexShrink: 0, opacity: thumbStart === 0 ? 0.4 : 1 }}
                >←</button>

                <div style={{ display: "flex", gap: "8px", flex: 1, justifyContent: "center" }}>
                  {visibleThumbs.map((img, idx) => {
                    const realIdx = thumbStart + idx;
                    return (
                      <div key={realIdx} onClick={() => setActiveImage(realIdx)}
                        style={{ width: "54px", height: "54px", 
                          border: activeImage === realIdx ? "2px solid #0418cb" : "1.5px solid #e0e0e0", 
                          borderRadius: "8px", overflow: "hidden", 
                          cursor: "pointer", background: "#f9f9f7", padding: "4px", 
                          flexShrink: 0, opacity: activeImage === realIdx ? 1 : 0.65, transition: "all 0.15s" }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                        onMouseLeave={(e) => { if (activeImage !== realIdx) e.currentTarget.style.opacity = "0.65"; }}
                      >
                        <img src={img} alt={`thumb-${realIdx}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setThumbStart(Math.min(imgs.length - THUMBS_VISIBLE, thumbStart + 1))}
                  disabled={thumbStart + THUMBS_VISIBLE >= imgs.length}

                  style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1.5px solid #e0e0e0", 
                    background: thumbStart + THUMBS_VISIBLE >= imgs.length ? "#f5f5f5" : "#fff", 
                    cursor: thumbStart + THUMBS_VISIBLE >= imgs.length ? "not-allowed" : "pointer", 
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0, 
                    opacity: thumbStart + THUMBS_VISIBLE >= imgs.length ? 0.4 : 1 }}
                >→</button>
              </div>
            )}

            {imgs.length > 1 && (
              <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>{activeImage + 1} / {imgs.length} photos</p>
            )}
          </div>

          {/* RIGHT — Product details */}
          <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <span style={{ background: "#e8f5e9", color: "#0e0ec1", fontSize: "12px", fontWeight: 600, 
              padding: "4px 12px", borderRadius: "999px", width: "fit-content" }}>
              {product.category}
            </span>

            <div>
              <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 6px" }}>{product.name}</h1>
              {product.shortDescription && (
                <p style={{ fontSize: "15px", color: "#666", margin: 0, fontStyle: "italic" }}>{product.shortDescription}</p>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0faf0", 
              border: "1px solid #c8e6c9", borderRadius: "8px", padding: "10px 14px" }}>
              <span style={{ fontSize: "20px" }}>⚡</span>
              <div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#1a1a1a" }}>Delivery in 10 minutes</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>Shipped from nearby dark store</p>
              </div>
            </div>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              {hasDiscount && (
                <span style={{ background: "#1073e6", color: "#fff", fontSize: "13px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px" }}>
                  {discountPct}% OFF
                </span>
              )}
              <span style={{ fontSize: "32px", fontWeight: 800, color: "#1a1a1a" }}>₹{displaySalePrice}</span>
              {hasDiscount && <span style={{ fontSize: "18px", color: "#aaa", textDecoration: "line-through" }}>₹{displayRealPrice}</span>}
              <span style={{ fontSize: "13px", color: "#aaa" }}>(Inclusive of all taxes)</span>
            </div>

            {/* Stock */}
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, 
              color: product.stock === 0 ? "#e53e3e" : product.stock <= 5 ? "#e67e22" : "#0a27df" }}>
              {product.stock === 0 ? "✗ Out of stock" : product.stock <= 5 ? `⚠ Only ${product.stock} left!` : `✓ In stock (${product.stock} available)`}
            </p>

            {/* Add to cart */}
            {product.stock > 0 && (
              qty === 0 ? (
                <button onClick={handleAdd} style={{ background: "#113adc", color: "#fff", 
                border: "none", borderRadius: "10px", padding: "14px 40px", fontSize: "16px", fontWeight: 700, 
                cursor: "pointer", width: "fit-content" }}>
                  Add to cart
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", border: "2px solid #0a0ad0", 
                borderRadius: "10px", overflow: "hidden", width: "fit-content" }}>
                  <button onClick={() => handleQty(-1)} style={{ background: "#251fd5", color: "#fff", 
                    border: "none", width: "44px", height: "44px", fontSize: "20px", fontWeight: 700, cursor: "pointer" }}>−</button>
                  <span style={{ width: "48px", textAlign: "center", fontSize: "16px", fontWeight: 700, 
                    color: "#0210d5" }}>{qty}</span>
                  <button onClick={() => handleQty(1)} style={{ background: qty >= product.stock ? "#aaa" : "#0d14f0", 
                    color: "#fff", border: "none", width: "44px", height: "44px", fontSize: "20px", fontWeight: 700, 
                    cursor: qty >= product.stock ? "not-allowed" : "pointer" }}>+</button>
                </div>
              )
            )}

            {/* Pincode */}
            <div style={{ borderTop: "0.5px solid #f0f0f0", paddingTop: "18px" }}>
              <p style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 600, color: "#333" }}>📍 Check delivery availability</p>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input type="text" maxLength={6} value={pincode}
                  onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "")); setPincodeMsg(null); }}
                  placeholder="Enter pincode"
                  style={{ border: "1.5px solid #e0e0e0", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", 
                    outline: "none", width: "150px" }}
                  onFocus={(e) => e.target.style.borderColor = "#1631fa"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />

                <button onClick={checkPincode} disabled={checkingPin}
                  style={{ background: checkingPin ? "#aaa" : "#065dea", color: "#fff", border: "none", 
                  borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: 600, 
                  cursor: checkingPin ? "not-allowed" : "pointer" }}>
                  {checkingPin ? "Checking..." : "Check"}
                </button>
              </div>
              {pincodeMsg && (
                <p style={{ margin: "8px 0 0", fontSize: "13px", fontWeight: 500, 
                  color: pincodeMsg.ok ? "#1204d2" : "#e53e3e" }}>{pincodeMsg.text}</p>
              )}
            </div>
          </div>
          </div>

            {/* About this product */}
            {product.description && (
              <div style={{ borderTop: "0.5px solid #f0f0f0", paddingTop: "18px" }}>
                <p style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: 700, color: "#1a1a1a" }}>About this product</p>
                <div style={{ background: "#f9fdf9", border: "1px solid #e8f5e9", 
                  borderRadius: "10px", padding: "14px 16px" }}>
                  {product.description.split('\n').filter(l => l.trim()).map((line, i, arr) => (
                    <div key={i} style={{ 
                      display: "flex", alignItems: "flex-start", gap: "8px", 
                      marginBottom: i < arr.length - 1 ? "8px" : 0 
                      }}>
                      <span style={{ color: "#071cd7", fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>•</span>
                      <p style={{ margin: 0, fontSize: "13px", color: "#444", lineHeight: 1.6 }}>{line.trim()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}


        {/* Similar Products with arrows */}
        {similar.length > 0 && (
          <div style={{ marginTop: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Similar products</h2>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setSimilarStart(Math.max(0, similarStart - 1))}
                  disabled={similarStart === 0}
                  style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid #e0e0e0", 
                    background: similarStart === 0 ? "#f5f5f5" : "#fff", 
                    cursor: similarStart === 0 ? "not-allowed" : "pointer", 
                    fontSize: "16px", display: "flex", alignItems: "center", 
                    justifyContent: "center", opacity: similarStart === 0 ? 0.4 : 1 }}
                >←</button>

                <button
                  onClick={() => setSimilarStart(Math.min(similar.length - SIM_VISIBLE, similarStart + 1))}
                  disabled={similarStart + SIM_VISIBLE >= similar.length}
                  style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid #e0e0e0", 
                    background: similarStart + SIM_VISIBLE >= similar.length ? "#f5f5f5" : "#fff", 
                    cursor: similarStart + SIM_VISIBLE >= similar.length ? "not-allowed" : "pointer", 
                    fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", 
                    opacity: similarStart + SIM_VISIBLE >= similar.length ? 0.4 : 1 }}
                >→</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: 
              `repeat(${Math.min(SIM_VISIBLE, visibleSimilar.length)}, 1fr)`,gap: "16px" }}>
              {visibleSimilar.map((p) => {
                const simQty = simCart[p._id] || 0;
                const simSalePrice = p.salePrice ?? p.price ?? 0;
                const simRealPrice = p.realPrice ?? p.price ?? 0;
                const simHasDiscount = simRealPrice > simSalePrice;
                const simDiscountPct = simHasDiscount ? Math.round(((simRealPrice - simSalePrice) / simRealPrice) * 100) : 0;
                const simImg = (p.images && p.images[0]) || p.imageUrl || null;

                return (
                  <div key={p._id}
                    style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e8e8e8", 
                      overflow: "hidden", transition: "box-shadow 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                  >
                    <div
                      onClick={() => { 
                        router.push(`/products/${p._id}`); 
                        setThumbStart(0); 
                        setActiveImage(0); 
                        setSimilarStart(0); }}
                      style={{ background: "#f9f9f7", height: "160px", display: "flex", alignItems: "center", 
                        justifyContent: "center", padding: "12px", position: "relative", cursor: "pointer" }}
                    >
                      {simImg
                        ? <img src={simImg} alt={p.name} style={{ maxHeight: "130px", maxWidth: "100%", 
                          objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />
                        : <span style={{ fontSize: "48px" }}>🛍️</span>
                      }
                      {simHasDiscount && (
                        <div style={{ position: "absolute", top: 8, left: 8, background: "#1635ce", color: "#fff", 
                        fontSize: "10px", fontWeight: 700, padding: "3px 7px", borderRadius: "6px" }}>
                          {simDiscountPct}% OFF
                        </div>
                      )}
                      <span style={{ position: "absolute", top: 8, right: 8, fontSize: "10px", fontWeight: 600, 
                        background: "#fff", border: "0.5px solid #e0e0e0", color: "#555", padding: "2px 6px", 
                        borderRadius: "4px" }}>⏱ 10 min</span>
                    </div>

                    <div style={{ padding: "12px" }}>
                      <p
                        onClick={() => { router.push(`/products/${p._id}`); setThumbStart(0); setActiveImage(0); }}
                        style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a", marginBottom: "2px", 
                          cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >{p.name}</p>
                      <p style={{ fontSize: "12px", color: "#888", marginBottom: "10px", overflow: "hidden", 
                        textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.shortDescription || p.description || p.category}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <span style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a" }}>₹{simSalePrice}</span>
                          {simHasDiscount && <span style={{ fontSize: "12px", color: "#aaa", 
                            textDecoration: "line-through", marginLeft: "5px" }}>₹{simRealPrice}</span>}
                        </div>
                        {simQty === 0 ? (
                          <button onClick={() => handleSimCart(p._id, 0)}
                            style={{ background: "#fff", border: "1.5px solid #107ad7", color: "#0a34ed", 
                            fontSize: "13px", fontWeight: 700, borderRadius: "6px", padding: "5px 14px", cursor: "pointer" }}>
                            ADD
                          </button>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #1045d7", 
                          borderRadius: "6px", overflow: "hidden" }}>
                            <button
                              onClick={() => setSimCart(prev => ({ ...prev, [p._id]: Math.max(0, (prev[p._id] || 1) - 1) }))}
                              style={{ background: "#0c1ee6", color: "#fff", border: "none", 
                              width: "28px", height: "28px", fontSize: "16px", fontWeight: 700, 
                              cursor: "pointer" }}>−</button>
                            <span style={{ width: "28px", textAlign: "center", fontSize: "13px", fontWeight: 700, 
                              color: "#2553dc" }}>{simQty}</span>
                            <button
                              onClick={() => handleSimCart(p._id, simQty)}
                              style={{ background: "#0c1ee6", color: "#fff", border: "none", width: "28px", 
                              height: "28px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {similar.length > SIM_VISIBLE && (
              <p style={{ textAlign: "center", fontSize: "13px", color: "#888", marginTop: "12px" }}>
                Showing {similarStart + 1}–{Math.min(similarStart + SIM_VISIBLE, similar.length)} of {similar.length} similar products
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}