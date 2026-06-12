"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [pinMsg, setPinMsg] = useState(null);
  const [checkingPin, setCheckingPin] = useState(false);
  const [shipping, setShipping] = useState({
    recipientName: "",
    mobile: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token) { router.push("/login"); return; }

    const cachedUser = {
      name: localStorage.getItem("userName") || "",
      email: localStorage.getItem("userEmail") || "",
      phone: localStorage.getItem("userPhone") || "",
      address: localStorage.getItem("userAddress") || "",
    };
    setUser(cachedUser);

    setShipping(prev => ({
      ...prev,
      recipientName: cachedUser.name,
      mobile: cachedUser.phone,
      line1: cachedUser.address,
    }));

    // Fetch cart
    fetch(`${API}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        const items = data.data?.products || [];
        setCartItems(items);
        if (items.length === 0) router.push("/cart");
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    if (userId) {
      fetch(`${API}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          const u = data.data || data.user || data;
          if (u && u.name) {
            setUser(u);
            localStorage.setItem("userName", u.name || "");
            localStorage.setItem("userEmail", u.email || "");
            localStorage.setItem("userPhone", u.phone || "");
            localStorage.setItem("userAddress", u.address || "");
            // update shipping if same as billing
            setSameAsBilling(prev => {
              if (prev) {
                setShipping(s => ({
                  ...s,
                  recipientName: u.name,
                  mobile: u.phone || "",
                  line1: u.address || "",
                }));
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  // When sameAsBilling toggles, sync shipping fields
  useEffect(() => {
    if (sameAsBilling && user) {
      setShipping({
        recipientName: user.name || "",
        mobile: user.phone || "",
        line1: user.address || "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
      });
      setPinMsg(null);
      setErrors({});
    }
  }, [sameAsBilling]);

  const validatePincode = async (pin) => {
    if (!/^\d{6}$/.test(pin)) {
      setPinMsg({ ok: false, text: "Enter a valid 6-digit PIN code" });
      return false;
    }
    setCheckingPin(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0].Status === "Success") {
        const po = data[0].PostOffice[0];
        setShipping(prev => ({
          ...prev,
          city: prev.city || po.District,
          state: prev.state || po.State,
        }));
        setPinMsg({ ok: true, text: `✓ ${po.Name}, ${po.District}, ${po.State}` });
        setCheckingPin(false);
        return true;
      } 
      else {
        setPinMsg({ ok: false, text: "✗ Invalid PIN code" });
        setCheckingPin(false);
        return false;
      }
    } 
    catch {
      setPinMsg({ ok: false, text: "Unable to verify PIN code" });
      setCheckingPin(false);
      return false;
    }
  };

  const handlePincodeBlur = () => {
    if (shipping.pincode.length === 6) validatePincode(shipping.pincode);
  };

  const validateForm = () => {
    const e = {};
    if (!shipping.recipientName.trim()) e.recipientName = "Required";
    if (!/^[6-9]\d{9}$/.test(shipping.mobile)) e.mobile = "Enter valid 10-digit mobile";
    if (!shipping.line1.trim()) e.line1 = "Required";
    if (!shipping.city.trim()) e.city = "Required";
    if (!shipping.state.trim()) e.state = "Required";
    if (!/^\d{6}$/.test(shipping.pincode)) e.pincode = "Enter valid 6-digit PIN code";
    if (pinMsg && !pinMsg.ok) e.pincode = "Invalid PIN code";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    setPlacingOrder(true);
    const token = localStorage.getItem("token");

    const items = cartItems.map(item => ({
      productId: item.productId?._id || item.productId,
      quantity: item.quantity,
      price: item.productId?.salePrice ?? item.productId?.price ?? item.price ?? 0,
    }));

    const totalAmount = cartItems.reduce((sum, item) => {
      const price = item.productId?.salePrice ?? item.productId?.price ?? item.price ?? 0;
      return sum + price * item.quantity;
    }, 0);

    const fullAddress = `${shipping.recipientName}, ${shipping.mobile},  ${shipping.line1}${shipping.line2 ? ", " + shipping.line2 : ""}, ${shipping.city}, ${shipping.state} - ${shipping.pincode}`;

    try {
      const res = await fetch(`${API}/api/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items, totalAmount, address: fullAddress, paymentMethod }),
      });

      if (res.ok) {
        const data = await res.json();
        await fetch(`${API}/api/cart/clear`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.setItem("lastOrder", JSON.stringify({
          orderId: data.order?._id,
          total: totalAmount,
          address: fullAddress,
          paymentMethod,
          date: new Date().toISOString(),
          items: cartItems.map(item => ({
            name: item.productId?.name || "Product",
            qty: item.quantity,
            price: item.productId?.salePrice ?? item.productId?.price ?? 0,
          })),
        }));
        router.push("/order-success");
      } else {
        const err = await res.json();
        alert(err.message || "Order placement failed");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }
    setPlacingOrder(false);
  };

  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => {
    const price = item.productId?.salePrice ?? item.productId?.price ?? item.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const ShippingField = ({ label, name, type = "text", placeholder, required }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontSize: "13px", fontWeight: 600, color: "#444" }}>
        {label} {required && <span style={{ color: "#e53e3e" }}>*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={shipping[name]}
        disabled={sameAsBilling && (name === "recipientName" || name === "mobile" || name === "line1")}
        onChange={(e) => {
          setShipping(prev => ({ ...prev, [name]: e.target.value }));
          if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
          if (name === "pincode") setPinMsg(null);
        }}
        onBlur={name === "pincode" ? handlePincodeBlur : undefined}
        style={{
          padding: "10px 12px",
          border: `1.5px solid ${errors[name] ? "#e53e3e" : "#e0e0e0"}`,
          borderRadius: "8px", fontSize: "14px", outline: "none",
          color: "#333", background: sameAsBilling && (name === "recipientName" || name === "mobile" || name === "line1") ? "#f5f5f5" : "#fff",
          cursor: sameAsBilling && (name === "recipientName" || name === "mobile" || name === "line1") ? "not-allowed" : "text",
        }}
        onFocus={(e) => { if (!sameAsBilling) e.target.style.borderColor = "#1a6fe8"; }}
        onBlurCapture={(e) => { if (name !== "pincode") e.target.style.borderColor = 
          errors[name] ? "#e53e3e" : "#e0e0e0"; }}
      />
      {errors[name] && <span style={{ fontSize: "12px", color: "#e53e3e" }}>{errors[name]}</span>}
      {name === "pincode" && pinMsg && (
        <span style={{ fontSize: "12px", color: pinMsg.ok ? "#360ff7" : "#e53e3e", fontWeight: 500 }}>
          {checkingPin ? "Verifying..." : pinMsg.text}
        </span>
      )}
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fffde7", display: "flex", alignItems: "center", 
    justifyContent: "center" }}>
      <p style={{ color: "#888" }}>Loading checkout...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#dec45b" }}>

      {/* Header */}
      <header style={{ background: "#00050c", padding: "14px 32px", display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={() => router.push("/cart")}
          style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "8px", 
          padding: "8px 14px", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
          ← Back to Cart
        </button>
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#fff" }}>Checkout</h1>
        {/* Steps */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
          {["Cart", "Checkout", "Order Placed"].map((step, i) => (
            <div key={step} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: i === 1 ? "#f8d030" : i < 1 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
                color: i === 1 ? "#1a1a1a" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 700,
              }}>{i < 1 ? "✓" : i + 1}</div>
              <span style={{ fontSize: "13px", color: i === 1 ? "#f8d030" : "rgba(255,255,255,0.75)", fontWeight: i === 1 ? 700 : 400 }}>{step}</span>
              {i < 2 && <span style={{ color: "rgba(255,255,255,0.4)" }}>›</span>}
            </div>
          ))}
        </div>
      </header>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", alignItems: "start" }}>

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* 1. Billing Info */}
          <div style={{ background: "#fff", borderRadius: "14px", border: "0.5px solid #e8e8e8", overflow: "hidden" }}>
            <div style={{ background: "#1a6fe8", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#fff" }}>1. Billing Information</h2>
              <button onClick={() => router.push("/profile")}
                style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "6px", padding: "6px 14px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}>
                Edit Profile
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                {[
                  { label: "Full Name", value: user?.name || "—", icon: "👤" },
                  { label: "Email", value: user?.email || "—", icon: "📧" },
                  { label: "Mobile", value: user?.phone || "Not set", icon: "📱" },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ background: "#f9fbff", borderRadius: "10px", padding: "14px", border: "0.5px solid #e0eaff" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#888", fontWeight: 600 }}>{icon} {label}</p>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1a1a1a", wordBreak: "break-all" }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Billing address display */}
              <div style={{ background: "#f9fbff", borderRadius: "10px", padding: "14px", border: "0.5px solid #e0eaff" }}>
                <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#888", fontWeight: 600 }}>📍 SAVED ADDRESS</p>
                <p style={{ margin: 0, fontSize: "14px", color: user?.address ? "#1a1a1a" : "#aaa", fontWeight: user?.address ? 500 : 400 }}>
                  {user?.address || "No saved address — please add one below"}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Shipping Address */}
          <div style={{ background: "#fff", borderRadius: "14px", border: "0.5px solid #e8e8e8", overflow: "hidden" }}>
            <div style={{ background: "#1a6fe8", padding: "14px 20px" }}>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#fff" }}>2. Shipping Address</h2>
            </div>
            <div style={{ padding: "20px" }}>

              {/* Same as billing toggle */}
              <div
                onClick={() => setSameAsBilling(!sameAsBilling)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  background: sameAsBilling ? "#f0f6ff" : "#fff",
                  border: `1.5px solid ${sameAsBilling ? "#1a6fe8" : "#e0e0e0"}`,
                  borderRadius: "10px", padding: "14px 16px",
                  cursor: "pointer", marginBottom: "20px",
                  transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  border: `2px solid ${sameAsBilling ? "#1a6fe8" : "#ccc"}`,
                  background: sameAsBilling ? "#1a6fe8" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {sameAsBilling && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fff" }} />}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, 
                    color: sameAsBilling ? "#1a6fe8" : "#1a1a1a" }}>
                    Same as Billing Address
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
                    {sameAsBilling ? "Using your saved profile address" : "Enter a different delivery address below"}
                  </p>
                </div>
              </div>

              {/* Show saved address summary when same as billing */}
              {sameAsBilling ? (
                <div style={{ background: "#f0f6ff", borderRadius: "10px", padding: "16px", 
                border: "1px solid #d0e4ff" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 700, 
                    color: "#1a6fe8" }}>📦 Delivering to:</p>
                  <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 600, 
                    color: "#1a1a1a" }}>{user?.name}</p>
                  <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#555" }}> {user?.phone || "Mobile not set"}</p>
                  <p style={{ margin: 0, fontSize: "13px", color: "#555" }}> {user?.address || "Address not set (please toggle to enter one)"} </p>
                  {(!user?.address || !user?.phone) && (
                    <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#f80606", fontWeight: 600 }}>
                      ⚠ Some info is missing. Toggle off to enter manually, or update your profile.
                    </p>
                  )}
                  {/* PIN code required even for same as billing */}
                  <div style={{ marginTop: "14px", borderTop: "0.5px solid #c0d8ff", paddingTop: "14px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#444", display: "block", marginBottom: "6px" }}>
                      PIN Code <span style={{ color: "#e53e3e" }}>*</span> (required for delivery verification)
                    </label>
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <input
                          type="text" maxLength={6} placeholder="6-digit PIN"
                          value={shipping.pincode}
                          onChange={(e) => { setShipping(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, "") })); setPinMsg(null); if (errors.pincode) setErrors(prev => ({ ...prev, pincode: "" })); }}
                          onBlur={handlePincodeBlur}
                          style={{ padding: "10px 12px", border: `1.5px solid ${errors.pincode ? "#e53e3e" : "#e0e0e0"}`, borderRadius: "8px", fontSize: "14px", outline: "none", width: "140px" }}
                          onFocus={(e) => e.target.style.borderColor = "#1a6fe8"}
                        />
                        {errors.pincode && <span style={{ fontSize: "12px", color: "#e53e3e" }}>{errors.pincode}</span>}
                        {pinMsg && <span style={{ fontSize: "12px", color: pinMsg.ok ? "#0c831f" : "#e53e3e", fontWeight: 500 }}>{checkingPin ? "Verifying..." : pinMsg.text}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Different shipping address form */
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <ShippingField label="Recipient Name" name="recipientName" placeholder="Full name" required />
                    <ShippingField label="Mobile Number" name="mobile" type="tel" placeholder="10-digit number" required />
                  </div>
                  <ShippingField label="Address Line 1" name="line1" placeholder="House no, Building, Street" required />
                  <ShippingField label="Address Line 2 (Optional)" name="line2" placeholder="Area, Landmark" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 600, color: "#444" }}>
                        PIN Code <span style={{ color: "#e53e3e" }}>*</span>
                      </label>
                      <input
                        type="text" maxLength={6} placeholder="6-digit PIN"
                        value={shipping.pincode}
                        onChange={(e) => { setShipping(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, "") })); setPinMsg(null); if (errors.pincode) setErrors(prev => ({ ...prev, pincode: "" })); }}
                        onBlur={handlePincodeBlur}
                        style={{ padding: "10px 12px", border: `1.5px solid ${errors.pincode ? "#e53e3e" : "#e0e0e0"}`, borderRadius: "8px", fontSize: "14px", outline: "none" }}
                        onFocus={(e) => e.target.style.borderColor = "#1a6fe8"}
                      />
                      {errors.pincode && <span style={{ fontSize: "12px", color: "#e53e3e" }}>{errors.pincode}</span>}
                      {pinMsg && <span style={{ fontSize: "12px", color: pinMsg.ok ? "#0328f5" : "#e53e3e", fontWeight: 500 }}>{checkingPin ? "Verifying..." : pinMsg.text}</span>}
                    </div>
                    <ShippingField label="City" name="city" placeholder="City" required />
                    <ShippingField label="State" name="state" placeholder="State" required />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Payment Method */}
          <div style={{ background: "#fff", borderRadius: "14px", border: "0.5px solid #e8e8e8", overflow: "hidden" }}>
            <div style={{ background: "#1a6fe8", padding: "14px 20px" }}>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#fff" }}>3. Payment Method</h2>
            </div>
            <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {[
                { id: "COD", label: "Cash on Delivery", icon: "💵", desc: "Pay when your order arrives" },
                { id: "Paytm", label: "Paytm", icon: "📱", desc: "Pay via Paytm wallet or UPI" },
              ].map(({ id, label, icon, desc }) => (
                <div key={id} onClick={() => setPaymentMethod(id)}
                  style={{
                    border: paymentMethod === id ? "2px solid #1a6fe8" : "1.5px solid #e0e0e0",
                    borderRadius: "12px", padding: "16px", cursor: "pointer",
                    background: paymentMethod === id ? "#f0f6ff" : "#fff",
                    display: "flex", alignItems: "center", gap: "14px",
                    transition: "all 0.15s",
                  }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: 
                    paymentMethod === id ? "#1a6fe8" : "#f0f0f0", display: "flex", alignItems: "center", 
                    justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 3px", fontSize: "15px", fontWeight: 700, 
                      color: paymentMethod === id ? "#1a6fe8" : "#1a1a1a" }}>{label}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{desc}</p>
                  </div>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `2px solid ${paymentMethod === id ? "#1a6fe8" : "#ccc"}`, background: paymentMethod === id ? "#1a6fe8" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {paymentMethod === id && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fff" }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Order Summary */}
        <div style={{ position: "sticky", top: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "14px", border: "0.5px solid #e8e8e8", overflow: "hidden" }}>
            <div style={{ background: "#f8d030", padding: "14px 20px" }}>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1a1a1a" }}>
                Order Summary ({totalItems} items)
              </h2>
            </div>

            {/* Items */}
            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              {cartItems.length === 0 ? (
                <p style={{ padding: "20px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>Loading items</p>
              ) : cartItems.map((item, i) => {
                const product = item.productId || {};
                const name = product.name || "Product";
                const price = product.salePrice ?? product.price ?? item.price ?? 0;
                const image = (product.images && product.images[0]) || product.imageUrl || null;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", 
                  borderBottom: "0.5px solid #f5f5f5" }}>
                    <div style={{ width: "50px", height: "50px", background: "#f9f9f7", borderRadius: "8px", 
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                      {image
                        ? <img src={image} alt={name} style={{ width: "46px", height: "46px", objectFit: "contain" }} 
                        onError={(e) => { e.target.style.display = "none"; }} />
                        : <span style={{ fontSize: "24px" }}>🛍️</span>
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 600, color: "#1a1a1a" }}>{name}</p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>Qty: {item.quantity} × ₹{price}</p>
                    </div>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>₹{price * item.quantity}</p>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div style={{ padding: "16px", borderTop: "0.5px solid #f0f0f0" }}>
              {[
                { label: `Items (${totalItems})`, value: `₹${totalAmount}` },
                { label: "Delivery", value: "FREE", green: true },
                { label: "Payment", value: paymentMethod },
              ].map(({ label, value, green }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", 
                color: "#555", marginBottom: "8px" }}>
                  <span>{label}</span>
                  <span style={{ color: green ? "#0323f1" : "#555", fontWeight: green ? 600 : 400 }}>{value}</span>
                </div>
              ))}
              <div style={{ borderTop: "1.5px solid #e8e8e8", paddingTop: "12px", marginTop: "4px", 
                display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 800, color: "#1a1a1a" }}>
                <span>Total Payable</span>
                <span style={{ color: "#1a6fe8" }}>₹{totalAmount}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder || (pinMsg && !pinMsg.ok)}
            style={{
              width: "100%", background: placingOrder ? "#aaa" : "#1a6fe8",
              color: "#fff", border: "none", borderRadius: "12px",
              padding: "16px", fontSize: "17px", fontWeight: 800,
              cursor: placingOrder ? "not-allowed" : "pointer",
              boxShadow: "0 4px 16px rgba(26,111,232,0.3)",
            }}
          >
            {placingOrder ? "Placing Order..." : `Place Order • ₹${totalAmount}`}
          </button>

          <p style={{ textAlign: "center", fontSize: "12px", color: "#888", margin: 0 }}>
            🔒 Safe & secure checkout
          </p>
        </div>
      </div>
    </div>
  );
}