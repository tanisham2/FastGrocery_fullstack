"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function InputField({ label, name, type = "text", placeholder, value, onChange, error, disabled }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontSize: "13px", fontWeight: 600, color: "#444" }}>{label}</label>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={onChange} disabled={disabled}
        style={{
          padding: "11px 14px", fontSize: "14px", outline: "none", color: "#333",
          border: `1.5px solid ${error ? "#e53e3e" : "#e0e0e0"}`,
          borderRadius: "8px", background: disabled ? "#f5f5f5" : "#fff",
          cursor: disabled ? "not-allowed" : "text", width: "100%", boxSizing: "border-box",
        }}
        onFocus={(e) => { if (!disabled) e.target.style.borderColor = "#1a6fe8"; }}
        onBlur={(e) => e.target.style.borderColor = error ? "#e53e3e" : "#e0e0e0"}
      />
      {error && <span style={{ fontSize: "12px", color: "#e53e3e" }}>{error}</span>}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token) { router.push("/login"); return; }

    // Load from localStorage instantly
    setForm({
      name: localStorage.getItem("userName") || "",
      email: localStorage.getItem("userEmail") || "",
      phone: localStorage.getItem("userPhone") || "",
      address: localStorage.getItem("userAddress") || "",
    });

    // Fetch fresh from API
    fetch(`${API}/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        const u = data.data || data.user || data;
        if (u?.name) {
          setForm({
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            address: u.address || "",
          });
        }
      })
      .catch(console.error);
  }, []);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!/^[a-zA-Z\s]{2,50}$/.test(form.name.trim())) e.name = "Name must be 2–50 letters only";
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter valid 10-digit Indian mobile";
    if (form.address && form.address.trim().length < 10) e.address = "Address too short (min 10 characters)";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSaving(true);
    setSuccess(false);
    setServerError("");

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    try {
      const res = await fetch(`${API}/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: form.name.trim(), phone: form.phone, address: form.address.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        const u = data.data || data.user;
        localStorage.setItem("userName", u.name || form.name);
        localStorage.setItem("userPhone", u.phone || form.phone);
        localStorage.setItem("userAddress", u.address || form.address);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setServerError(data.message || "Update failed");
      }
    } catch {
      setServerError("Something went wrong");
    }
    setSaving(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ede048" }}>

      {/* Header */}
      <header style={{ background: "#010811", padding: "14px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={() => router.back()}
          style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
          ← Back
        </button>
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#fff" }}>👤 My Profile</h1>
      </header>

      <main style={{ maxWidth: "600px", margin: "32px auto", padding: "0 24px" }}>
        <div style={{ background: "#fff", borderRadius: "16px", border: "0.5px solid #e8e8e8", overflow: "hidden" }}>

          {/* Card header */}
          <div style={{ background: "#1a6fe8", padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#f8d030", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 800, color: "#1a1a1a" }}>
                {form.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#fff" }}>{form.name || "Your Name"}</p>
                <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>{form.email}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>

            {success && (
              <div style={{ background: "#f0fff4", border: "1px solid #c3e6cb", borderRadius: "8px", padding: "12px 16px", fontSize: "14px", color: "#0c831f", fontWeight: 600 }}>
                ✓ Profile updated successfully!
              </div>
            )}
            {serverError && (
              <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "8px", padding: "12px 16px", fontSize: "14px", color: "#e53e3e" }}>
                {serverError}
              </div>
            )}

            <InputField label="Full Name" name="name" placeholder="Your full name"
              value={form.name} onChange={set("name")} error={errors.name} />

            <InputField label="Email Address" name="email" type="email"
              placeholder="your@email.com" value={form.email}
              onChange={() => {}} disabled={true} />
            <p style={{ margin: "-10px 0 0", fontSize: "11px", color: "#aaa" }}>
              Email cannot be changed
            </p>

            <InputField label="Mobile Number" name="phone" type="tel"
              placeholder="10-digit Indian number"
              value={form.phone} onChange={set("phone")} error={errors.phone} />

            {/* Address textarea */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#444" }}>Delivery Address</label>
              <textarea
                rows={3} placeholder="Flat No, Street, City, State, Pincode"
                value={form.address}
                onChange={set("address")}
                style={{
                  padding: "11px 14px", fontSize: "14px", outline: "none", color: "#333",
                  border: `1.5px solid ${errors.address ? "#e53e3e" : "#e0e0e0"}`,
                  borderRadius: "8px", resize: "vertical", fontFamily: "inherit",
                  width: "100%", boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "#1a6fe8"}
                onBlur={(e) => e.target.style.borderColor = errors.address ? "#e53e3e" : "#e0e0e0"}
              />
              {errors.address && <span style={{ fontSize: "12px", color: "#e53e3e" }}>{errors.address}</span>}
            </div>

            <button onClick={handleSave} disabled={saving} style={{
              background: saving ? "#aaa" : "#1a6fe8", color: "#fff", border: "none",
              borderRadius: "10px", padding: "14px", fontSize: "15px", fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer", marginTop: "8px",
            }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button onClick={() => router.back()} style={{
              background: "#f5f5f0", color: "#555", border: "none",
              borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 600,
              cursor: "pointer",
            }}>
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}