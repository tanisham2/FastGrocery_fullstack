"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;
const TABS = ["Dashboard", "Products", "Orders", "Users"];
const STATUS_OPTIONS = ["pending", "confirmed", "delivered", "cancelled"];

export default function AdminPage() {
  const [tab, setTab] = useState("Dashboard");
  const [adminToken, setAdminToken] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [productForm, setProductForm] = useState({ name: "", price: "", category: "", description: "", stock: "", imageUrl: "" });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const router = useRouter();

  const CATEGORIES = ["Dairy", "Fruits", "Snacks", "Beverages", "Bakery", "Staples"];

  useEffect(() => {
    const t = localStorage.getItem("adminToken");
    const role = localStorage.getItem("adminRole");
    if (t && role === "admin") { setAdminToken(t); setLoggedIn(true); }
  }, []);

  useEffect(() => {
    if (!loggedIn || !adminToken) return;
    fetchStats(); fetchProducts(); fetchOrders(); fetchUsers();
  }, [loggedIn]);

  const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) { setLoginError(data.message || "Login failed"); return; }
      if (data.data.user.role !== "admin") {
        setLoginError("Access denied. Admins only.");
        return;
      }
      localStorage.setItem("adminToken", data.data.token);
      localStorage.setItem("adminRole", data.data.user.role);
      setAdminToken(data.data.token);
      setLoggedIn(true);
    } catch {
      setLoginError("Server error. Try again.");
    }
  };

  const fetchStats = async () => {
    const res = await fetch(`${API}/api/admin/stats`, { headers: headers() });
    const data = await res.json();
    if (data.success) setStats(data.data);
  };

  const fetchProducts = async () => {
    const res = await fetch(`${API}/api/admin/products`, { headers: headers() });
    const data = await res.json();
    if (data.success) setProducts(data.data);
  };

  const fetchOrders = async () => {
    const res = await fetch(`${API}/api/admin/orders`, { headers: headers() });
    const data = await res.json();
    if (data.success) setOrders(data.data);
  };

  const fetchUsers = async () => {
    const res = await fetch(`${API}/api/admin/users`, { headers: headers() });
    const data = await res.json();
    if (data.success) setUsers(data.data);
  };

  const handleSaveProduct = async () => {
    const body = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
    };
    const url = editingProduct ? `${API}/api/admin/products/${editingProduct._id}` : `${API}/api/admin/products`;
    const method = editingProduct ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });
    if (res.ok) {
      fetchProducts(); fetchStats();
      setShowProductForm(false); setEditingProduct(null);
      setProductForm({ name: "", price: "", category: "", description: "", stock: "", imageUrl: "" });
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`${API}/api/admin/products/${id}`, { method: "DELETE", headers: headers() });
    fetchProducts(); fetchStats();
  };

  const handleOrderStatus = async (orderId, status) => {
    await fetch(`${API}/api/admin/orders/${orderId}/status`, {
      method: "PATCH", headers: headers(), body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    setLoggedIn(false); setAdminToken(null);
  };

  // ---- LOGIN SCREEN ----
  if (!loggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: "16px", padding: "40px", width: "380px", border: "0.5px solid #e8e8e8" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔐</div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Admin Login</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>Restricted access — admins only</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <input
              type="email" placeholder="Admin email" required
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              style={{ padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", outline: "none" }}
            />
            <input
              type="password" placeholder="Password" required
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              style={{ padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", outline: "none" }}
            />
            {loginError && <p style={{ color: "#e53e3e", fontSize: "13px", margin: 0 }}>{loginError}</p>}
            <button type="submit" style={{ background: "rgb(32, 71, 226)", color: "#fff", border: "none", borderRadius: "8px", padding: "13px", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const STATUS_COLORS = {
    pending: { bg: "#fff3cd", color: "#856404" },
    confirmed: { bg: "#d1ecf1", color: "#0c5460" },
    delivered: { bg: "#d4edda", color: "#155724" },
    cancelled: { bg: "#f8d7da", color: "#721c24" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0" }}>
      {/* Admin Header */}
      <header style={{ background: "#1f61cb", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>
          🛒 Fast<span style={{ color: "#f8d030" }}>Grocery</span> <span style={{ fontSize: "13px", fontWeight: 400, opacity: 0.8 }}>Admin</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? "#fff" : "rgba(255,255,255,0.15)",
              color: tab === t ? "#19acd1" : "#fff",
              border: "none", borderRadius: "8px", padding: "8px 16px",
              fontSize: "13px", fontWeight: 600, cursor: "pointer",
            }}>{t}</button>
          ))}
          <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>

        {/* ---- DASHBOARD TAB ---- */}
        {tab === "Dashboard" && stats && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Overview</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
              {[
                { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "#e8f5e9" },
                { label: "Total Products", value: stats.totalProducts, icon: "📦", color: "#e3f2fd" },
                { label: "Total Orders", value: stats.totalOrders, icon: "🛒", color: "#fff3e0" },
                { label: "Total Revenue", value: `₹${stats.totalRevenue}`, icon: "💰", color: "#fce4ec" },
              ].map((s) => (
                <div key={s.label} style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e8e8e8", padding: "20px" }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>{s.icon}</div>
                  <div style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a" }}>{s.value}</div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Recent Orders</h3>
            <div style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e8e8e8", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#f9f9f7" }}>
                    {["Order ID", "Items", "Total", "Status", "Date"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#555", borderBottom: "0.5px solid #e8e8e8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((o) => (
                    <tr key={o._id} style={{ borderBottom: "0.5px solid #f5f5f5" }}>
                      <td style={{ padding: "12px 16px", color: "#888" }}>#{o._id.slice(-6).toUpperCase()}</td>
                      <td style={{ padding: "12px 16px" }}>{o.items?.length} items</td>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>₹{o.totalAmount}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: STATUS_COLORS[o.status]?.bg, color: STATUS_COLORS[o.status]?.color, fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px" }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#888" }}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---- PRODUCTS TAB ---- */}
        {tab === "Products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>Products ({products.length})</h2>
              <button
                onClick={() => { setShowProductForm(true); setEditingProduct(null); setProductForm({ name: "", price: "", category: "", description: "", stock: "", imageUrl: "" }); }}
                style={{ background: "#d3d31a", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}
              >
                + Add Product
              </button>
            </div>

            {/* Product Form */}
            {showProductForm && (
              <div style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e8e8e8", padding: "24px", marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700 }}>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {[
                    { key: "name", placeholder: "Product name", type: "text" },
                    { key: "price", placeholder: "Price (₹)", type: "number" },
                    { key: "stock", placeholder: "Stock quantity", type: "number" },
                    { key: "imageUrl", placeholder: "Image URL", type: "text" },
                  ].map(({ key, placeholder, type }) => (
                    <input key={key} type={type} placeholder={placeholder}
                      value={productForm[key]}
                      onChange={(e) => setProductForm({ ...productForm, [key]: e.target.value })}
                      style={{ padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                    />
                  ))}
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    style={{ padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="text" placeholder="Description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    style={{ padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button onClick={handleSaveProduct} style={{ background: "#1580be", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontWeight: 700, cursor: "pointer" }}>
                    {editingProduct ? "Update" : "Add Product"}
                  </button>
                  <button onClick={() => { setShowProductForm(false); setEditingProduct(null); }} style={{ background: "#f5f5f0", color: "#555", border: "none", borderRadius: "8px", padding: "10px 24px", fontWeight: 600, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Products Table */}
            <div style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e8e8e8", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#f9f9f7" }}>
                    {["Image", "Name", "Category", "Price", "Stock", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#555", borderBottom: "0.5px solid #e8e8e8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id} style={{ borderBottom: "0.5px solid #f5f5f5" }}>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ width: "44px", height: "44px", background: "#f9f9f7", borderRadius: "8px", overflow: "hidden" }}>
                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>🛍️</span>}
                        </div>
                      </td>
                      <td style={{ padding: "10px 16px", fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ background: "#e8f5e9", color: "#1c417b", fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px" }}>{p.category}</span>
                      </td>
                      <td style={{ padding: "10px 16px", fontWeight: 600 }}>₹{p.price}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ color: p.stock > 0 ? "#1a2ee7" : "#e53e3e", fontWeight: 600 }}>{p.stock}</span>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => { setEditingProduct(p); setProductForm({ name: p.name, price: p.price, category: p.category, description: p.description || "", stock: p.stock, imageUrl: p.imageUrl || "" }); setShowProductForm(true); }}
                            style={{ background: "#e3f2fd", color: "#1565c0", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            style={{ background: "#fce4ec", color: "#c62828", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---- ORDERS TAB ---- */}
        {tab === "Orders" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Orders ({orders.length})</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {orders.map((o) => (
                <div key={o._id} style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e8e8e8", overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", borderBottom: "0.5px solid #f5f5f5", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>Order #{o._id.slice(-8).toUpperCase()}</p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{new Date(o.createdAt).toLocaleString("en-IN")} · {o.address}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "15px", fontWeight: 700 }}>₹{o.totalAmount}</span>
                      <select
                        value={o.status}
                        onChange={(e) => handleOrderStatus(o._id, e.target.value)}
                        style={{ border: "1.5px solid #e0e0e0", borderRadius: "8px", padding: "6px 10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", outline: "none", background: STATUS_COLORS[o.status]?.bg, color: STATUS_COLORS[o.status]?.color }}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ padding: "12px 20px", display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    {o.items?.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f9f9f7", borderRadius: "8px", padding: "6px 10px" }}>
                        {item.productId?.imageUrl && <img src={item.productId.imageUrl} alt="" style={{ width: "28px", height: "28px", objectFit: "contain" }} />}
                        <span style={{ fontSize: "13px", fontWeight: 500 }}>{item.productId?.name || "Product"}</span>
                        <span style={{ fontSize: "12px", color: "#888" }}>×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- USERS TAB ---- */}
        {tab === "Users" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Users ({users.length})</h2>
            <div style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e8e8e8", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#f9f9f7" }}>
                    {["Name", "Email", "Role", "Joined", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#555", borderBottom: "0.5px solid #e8e8e8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: "0.5px solid #f5f5f5" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#0c831f" }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#555" }}>{u.email}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: u.role === "admin" ? "#fff3cd" : "#e8f5e9", color: u.role === "admin" ? "#856404" : "#0c831f", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px" }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#888" }}>{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <button
                          onClick={async () => {
                            const newRole = u.role === "admin" ? "user" : "admin";
                            if (!confirm(`Change ${u.name}'s role to ${newRole}?`)) return;
                            await fetch(`${API}/api/admin/users/${u._id}/role`, {
                              method: "PATCH", headers: headers(), body: JSON.stringify({ role: newRole }),
                            });
                            fetchUsers();
                          }}
                          style={{ background: "#f5f5f0", color: "#555", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                        >
                          Toggle Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}