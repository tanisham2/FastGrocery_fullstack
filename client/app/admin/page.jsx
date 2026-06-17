"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;
console.log("API =", API);
const TABS = ["Dashboard", "Products", "Orders", "Users"];
const STATUS_OPTIONS = ["pending", "confirmed", "delivered", "cancelled"];
const CATEGORIES = ["Dairy", "Fruits", "Snacks", "Beverages", "Bakery", "Staples"];
const ITEMS_PER_PAGE = 10;

const STATUS_COLORS = {
  pending:   { bg: "#fff3cd", color: "#856404" },
  confirmed: { bg: "#d1ecf1", color: "#0c5460" },
  delivered: { bg: "#d4edda", color: "#155724" },
  cancelled: { bg: "#f8d7da", color: "#721c24" },
};

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
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "", realPrice: "", salePrice: "", category: "",
    shortDescription: "", description: "", stock: "", images: [],
  });
  const [newImageUrl, setNewImageUrl] = useState("");

  // Search, filter, sort, pagination state
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStock, setFilterStock] = useState("All");
  const [filterDiscount, setFilterDiscount] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();

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
      if (data.data.user.role !== "admin") { setLoginError("Access denied. Admins only."); return; }
      localStorage.setItem("adminToken", data.data.token);
      localStorage.setItem("adminRole", data.data.user.role);
      setAdminToken(data.data.token);
      setLoggedIn(true);
    } catch { setLoginError("Server error. Try again."); }
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

  // ---- FILTERED + SORTED + PAGINATED PRODUCTS ----
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p._id?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filterCategory !== "All") list = list.filter(p => p.category === filterCategory);

    // Stock filter
    if (filterStock === "instock") list = list.filter(p => p.stock > 5);
    if (filterStock === "lowstock") list = list.filter(p => p.stock > 0 && p.stock <= 5);
    if (filterStock === "outofstock") list = list.filter(p => p.stock === 0);

    // Discount filter
    if (filterDiscount === "discounted") list = list.filter(p => p.realPrice > p.salePrice);
    if (filterDiscount === "nodiscount") list = list.filter(p => p.realPrice <= p.salePrice);

    // Sort
    if (sortBy === "name_az") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "name_za") list.sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy === "price_low") list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    if (sortBy === "price_high") list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    if (sortBy === "stock_asc") list.sort((a, b) => a.stock - b.stock);
    if (sortBy === "newest") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "oldest") list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return list;
  }, [products, search, filterCategory, filterStock, filterDiscount, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [search, filterCategory, filterStock, filterDiscount, sortBy]);

  // ---- PRODUCT FORM ----
  const resetForm = () => {
    setProductForm({ 
      name: "", realPrice: "", salePrice: "", category: "", shortDescription: "", description: "", stock: "", 
      images: [], 
    });
    setNewImageUrl("");
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setProductForm(prev => ({ ...prev, images: [...prev.images, newImageUrl.trim()] }));
    setNewImageUrl("");
  };

  const handleRemoveImage = (index) => {
    setProductForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleMoveImage = (index, direction) => {
    const imgs = [...productForm.images];
    const target = index + direction;
    if (target < 0 || target >= imgs.length) return;
    [imgs[index], imgs[target]] = [imgs[target], imgs[index]];
    setProductForm(prev => ({ ...prev, images: imgs }));
  };

  const handleSaveProduct = async () => {
    if (Number(productForm.salePrice) > Number(productForm.realPrice)) {
      alert("Sale price cannot be greater than real price (MRP)");
      return;
    }
    const body = {
      name: productForm.name,
      realPrice: Number(productForm.realPrice),
      salePrice: Number(productForm.salePrice),
      category: productForm.category,
      description: productForm.description,
      shortDescription: productForm.shortDescription,
      stock: Number(productForm.stock),
      images: productForm.images,
      imageUrl: productForm.images[0] || "",
    };
    const url = editingProduct
      ? `${API}/api/admin/products/${editingProduct._id}`
      : `${API}/api/admin/products`;
    const method = editingProduct ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });
    if (res.ok) { fetchProducts(); fetchStats(); resetForm(); }
    else { const err = await res.json(); alert(err.message || "Failed to save product"); }
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
            <input type="email" placeholder="Admin email" required value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              style={{ padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", outline: "none" }} />
            <input type="password" placeholder="Password" required value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              style={{ padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", outline: "none" }} />
            {loginError && <p style={{ color: "#e53e3e", fontSize: "13px", margin: 0 }}>{loginError}</p>}
            <button type="submit" style={{ background: "#21969c", color: "#fff", border: "none", borderRadius: "8px", padding: "13px", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0" }}>
      {/* Header */}
      <header style={{ background: "#21969c", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>
          🛒 Fast<span style={{ color: "#f8d030" }}>Grocery</span>
          <span style={{ fontSize: "13px", fontWeight: 400, opacity: 0.8, marginLeft: "8px" }}>Admin</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? "#fff" : "rgba(255,255,255,0.15)",
              color: tab === t ? "#1e29ee" : "#fff",
              border: "none", borderRadius: "8px", padding: "8px 16px",
              fontSize: "13px", fontWeight: 600, cursor: "pointer",
            }}>{t}</button>
          ))}
          <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "1300px", margin: "0 auto", padding: "24px" }}>

        {/* ---- DASHBOARD ---- */}
        {tab === "Dashboard" && stats && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Overview</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
              {[
                { label: "Total Users", value: stats.totalUsers, icon: "👥" },
                { label: "Total Products", value: stats.totalProducts, icon: "📦" },
                { label: "Total Orders", value: stats.totalOrders, icon: "🛒" },
                { label: "Total Revenue", value: `₹${stats.totalRevenue}`, icon: "💰" },
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
                  {(stats.recentOrders || []).map((o) => (
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

        {/* ---- PRODUCTS ---- */}
        {tab === "Products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
                Products ({filteredProducts.length} / {products.length})
              </h2>
              <button
                onClick={() => { resetForm(); setShowProductForm(true); }}
                style={{ background: "#21969c", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}
              >
                + Add Product
              </button>
            </div>

            {/* Search + Filters + Sort */}
            <div style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e8e8e8", padding: "16px", marginBottom: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "10px", alignItems: "center" }}>
                {/* Search */}
                <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e0e0e0", borderRadius: "8px", padding: "8px 12px", gap: "8px" }}>
                  <span>🔍</span>
                  <input
                    type="text"
                    placeholder="Search by name, category, ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ border: "none", outline: "none", fontSize: "14px", width: "100%", color: "#333" }}
                  />
                  {search && <span onClick={() => setSearch("")} style={{ cursor: "pointer", color: "#aaa", fontSize: "18px" }}>×</span>}
                </div>

                {/* Category filter */}
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                  style={{ padding: "9px 10px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "13px", outline: "none", cursor: "pointer" }}>
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {/* Stock filter */}
                <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)}
                  style={{ padding: "9px 10px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "13px", outline: "none", cursor: "pointer" }}>
                  <option value="All">All Stock</option>
                  <option value="instock">In Stock</option>
                  <option value="lowstock">Low Stock (≤5)</option>
                  <option value="outofstock">Out of Stock</option>
                </select>

                {/* Discount filter */}
                <select value={filterDiscount} onChange={(e) => setFilterDiscount(e.target.value)}
                  style={{ padding: "9px 10px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "13px", outline: "none", cursor: "pointer" }}>
                  <option value="All">All Prices</option>
                  <option value="discounted">Discounted</option>
                  <option value="nodiscount">No Discount</option>
                </select>

                {/* Sort */}
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  style={{ padding: "9px 10px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "13px", outline: "none", cursor: "pointer" }}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name_az">Name A–Z</option>
                  <option value="name_za">Name Z–A</option>
                  <option value="price_low">Price: Low–High</option>
                  <option value="price_high">Price: High–Low</option>
                  <option value="stock_asc">Stock: Low–High</option>
                </select>
              </div>

              {/* Active filters display */}
              {(search || filterCategory !== "All" || filterStock !== "All" || filterDiscount !== "All") && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#888" }}>Active filters:</span>
                  {search && <FilterTag label={`"${search}"`} onRemove={() => setSearch("")} />}
                  {filterCategory !== "All" && <FilterTag label={filterCategory} onRemove={() => setFilterCategory("All")} />}
                  {filterStock !== "All" && <FilterTag label={filterStock} onRemove={() => setFilterStock("All")} />}
                  {filterDiscount !== "All" && <FilterTag label={filterDiscount} onRemove={() => setFilterDiscount("All")} />}
                  <button onClick={() => { setSearch(""); setFilterCategory("All"); setFilterStock("All"); setFilterDiscount("All"); }}
                    style={{ fontSize: "12px", color: "#e53e3e", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    Clear all
                  </button>
                </div>
              )}
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
                    { key: "realPrice", placeholder: "MRP / Real Price (₹)", type: "number" },
                    { key: "salePrice", placeholder: "Sale Price (₹)", type: "number" },
                    { key: "stock", placeholder: "Stock quantity", type: "number" },
                  ].map(({ key, placeholder, type }) => (
                    <input key={key} type={type} placeholder={placeholder}
                      value={productForm[key]}
                      onChange={(e) => setProductForm({ ...productForm, [key]: e.target.value })}
                      style={{ padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                    />
                  ))}
                  <select value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    style={{ padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", outline: "none" }}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {/* Short description */}
                <input type="text" placeholder="Short description (2-3 words)"
                value={productForm.shortDescription}
                onChange={(e) => setProductForm({ 
                  ...productForm, shortDescription: e.target.value })}
                  style={{ width: "100%", marginTop: "12px", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                  />
                  
                {/* Full description */}
                <textarea placeholder="Full description (5-6 lines:nutrients, benefits, usage)"
                value={productForm.description}
                onChange={(e) => setProductForm({ 
                  ...productForm, description: e.target.value })}
                  rows={4}
                  style={{ width: "100%", marginTop: "8px", padding: "10px 12px", border: "1.5px solid #e0e0e0", 
                    borderRadius: "8px", fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
                  />

{/* Image Gallery Manager */}
<div style={{ marginTop: "16px" }}>
  <p style={{ fontSize: "13px", fontWeight: 600, color: "#444", marginBottom: "10px" }}>
    Product Images ({productForm.images.length}) — First image is the primary display image
  </p>

  {/* Existing images */}
  {productForm.images.length > 0 && (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
      {productForm.images.map((img, idx) => (
        <div key={idx} style={{ position: "relative", border: idx === 0 ? "2px solid #370de0" : "1.5px solid #e0e0e0", 
        borderRadius: "8px", overflow: "hidden", width: "80px", height: "80px" }}>
          <img src={img} alt={`img-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} 
          onError={(e) => { 
            e.target.src = ""; 
            }} />
          {idx === 0 && (
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#094dd5", 
              color: "#fff", fontSize: "9px", fontWeight: 700, textAlign: "center", padding: "2px" }}>MAIN</div>
          )}
          <button onClick={() => handleRemoveImage(idx)}
            style={{ position: "absolute", top: 0, right: 0, background: "rgba(229,62,62,0.9)", color: "#fff", 
            border: "none", width: "18px", height: "18px", fontSize: "11px", cursor: "pointer", display: "flex", 
            alignItems: "center", justifyContent: "center" }}>×</button>
          <div style={{ position: "absolute", bottom: idx === 0 ? "16px" : "0", left: 0, display: "flex" }}>
            {idx > 0 && <button onClick={() => handleMoveImage(idx, -1)} style={{ background: "rgba(0,0,0,0.5)", 
              color: "#fff", border: "none", width: "16px", height: "16px", fontSize: "10px", 
              cursor: "pointer" }}>←</button>}
            {idx < productForm.images.length - 1 && <button onClick={() => handleMoveImage(idx, 1)} 
            style={{ background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", width: "16px", 
            height: "16px", fontSize: "10px", cursor: "pointer" }}>→</button>}
          </div>
        </div>
      ))}
    </div>
  )}

  {/* Upload from computer */}
  <div style={{ marginBottom: "10px" }}>
    <label style={{ fontSize: "12px", fontWeight: 600, color: "#555", display: "block", marginBottom: "6px" }}>
      📁 Upload from computer
    </label>
    <ImageFileUploader adminToken={adminToken} onUploaded={(url) => setProductForm(prev => ({ ...prev, 
      images: [...prev.images, url] }))} />
  </div>

  {/* OR paste URL */}
  <div>
    <label style={{ fontSize: "12px", fontWeight: 600, color: "#555", display: "block", marginBottom: "6px" }}>
      🔗 Or paste image URL
    </label>
    <div style={{ display: "flex", gap: "8px" }}>
      <input
        type="text" placeholder="https://images.unsplash.com/..."
        value={newImageUrl}
        onChange={(e) => setNewImageUrl(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddImage(); } }}
        style={{ flex: 1, padding: "9px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", 
          fontSize: "14px", outline: "none" }}
      />
      <button onClick={handleAddImage}
        style={{ background: "#113ae0", color: "#fff", border: "none", borderRadius: "8px", 
        padding: "9px 18px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
        + Add
      </button>
    </div>
  </div>
  </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button onClick={handleSaveProduct}
                    style={{ background: "#21969c", color: "#fff", border: "none", borderRadius: "8px", 
                    padding: "10px 24px", fontWeight: 700, cursor: "pointer" }}>
                    {editingProduct ? "Update Product" : "Add Product"}
                  </button>
                  <button onClick={resetForm}
                    style={{ background: "#f5f5f0", color: "#555", border: "none", borderRadius: "8px", 
                    padding: "10px 24px", fontWeight: 600, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Products Table */}
            {filteredProducts.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e8e8e8", 
              padding: "60px", textAlign: "center", color: "#888" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
                <p style={{ fontSize: "16px", fontWeight: 600 }}>No products found</p>
                <p style={{ fontSize: "13px" }}>Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e8e8e8", 
                  overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                      <tr style={{ background: "#f9f9f7" }}>
                        {["Image", "Name", "Category", "Price", "Stock", "Discount", "Actions"].map((h) => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, 
                            color: "#555", borderBottom: "0.5px solid #e8e8e8" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.map((p) => {
                        const salePrice = p.salePrice ?? p.price ?? 0;
                        const realPrice = p.realPrice ?? p.price ?? 0;
                        const hasDiscount = realPrice > salePrice;
                        const discountPct = hasDiscount ? Math.round(((realPrice - salePrice) / realPrice) * 100) : 0;
                        const primaryImage = (p.images && p.images[0]) || p.imageUrl || null;
                        return (
                          <tr key={p._id} style={{ borderBottom: "0.5px solid #f5f5f5" }}>
                            <td style={{ padding: "10px 16px" }}>
                              <div style={{ width: "50px", height: "50px", background: "#f9f9f7", 
                                borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center", 
                                justifyContent: "center" }}>
                                {primaryImage
                                  ? <img src={primaryImage} alt={p.name} style={{ width: "100%", height: "100%", 
                                    objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />
                                  : <span style={{ fontSize: "20px" }}>🛍️</span>
                                }
                              </div>
                              {p.images && p.images.length > 1 && (
                                <span style={{ fontSize: "10px", color: "#888" }}>+{p.images.length - 1} more</span>
                              )}
                            </td>
                            <td style={{ padding: "10px 16px" }}>
                              <p style={{ margin: 0, fontWeight: 600, maxWidth: "180px", overflow: "hidden", 
                              textOverflow: "ellipsis", 
                                whiteSpace: "nowrap" }}>{p.name}</p>
                              <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>ID: {p._id.slice(-6)}</p>
                            </td>
                            <td style={{ padding: "10px 16px" }}>
                              <span style={{ background: "#e8f5e9", color: "#21969c", fontSize: "12px", fontWeight: 600, 
                                padding: "3px 10px", borderRadius: "999px" }}>{p.category}</span>
                            </td>
                            <td style={{ padding: "10px 16px" }}>
                              <div style={{ fontSize: "14px", fontWeight: 700 }}>₹{salePrice}</div>
                              {hasDiscount && <div style={{ fontSize: "12px", color: "#aaa", 
                                textDecoration: "line-through" }}>₹{realPrice}</div>}
                            </td>
                            <td style={{ padding: "10px 16px" }}>
                              <span style={{ color: p.stock === 0 ? "#e53e3e" : p.stock <= 5 ? "#e67e22" : "#21969c", 
                                fontWeight: 700 }}>{p.stock}</span>
                              <div style={{ fontSize: "11px", color: "#aaa" }}>
                                {p.stock === 0 ? "Out of stock" : p.stock <= 5 ? "Low stock" : "In stock"}
                              </div>
                            </td>
                            <td style={{ padding: "10px 16px" }}>
                              {hasDiscount
                                ? <span style={{ background: "#e8f5e9", color: "#0909f3", fontSize: "12px", 
                                  fontWeight: 700, padding: "3px 8px", borderRadius: "6px" }}>{discountPct}% OFF</span>
                                : <span style={{ color: "#aaa", fontSize: "12px" }}>None</span>
                              }
                            </td>
                            <td style={{ padding: "10px 16px" }}>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setProductForm({
                                      name: p.name,
                                      realPrice: p.realPrice ?? p.price ?? "",
                                      salePrice: p.salePrice ?? p.price ?? "",
                                      category: p.category,
                                      shortDescription: p.shortDescription || "",
                                      description: p.description || "",
                                      stock: p.stock,
                                      images: p.images || (p.imageUrl ? [p.imageUrl] : []),
                                    });
                                    setShowProductForm(true);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                  style={{ background: "#e3f2fd", color: "#21969c", border: "none", 
                                  borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, 
                                  cursor: "pointer" }}>
                                  Edit
                                </button>
                                <button onClick={() => handleDeleteProduct(p._id)}
                                  style={{ background: "#fce4ec", color: "#c62828", border: "none", 
                                  borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, 
                                  cursor: "pointer" }}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", 
                  marginTop: "20px" }}>
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                      style={{ padding: "8px 14px", border: "1.5px solid #e0e0e0", borderRadius: "8px", 
                      background: "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer", 
                      opacity: currentPage === 1 ? 0.5 : 1 }}>
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button key={page} onClick={() => setCurrentPage(page)}
                        style={{ padding: "8px 14px", border: "1.5px solid #e0e0e0", borderRadius: "8px", 
                        background: currentPage === page ? "#1223dd" : "#fff", 
                        color: currentPage === page ? "#fff" : "#333", 
                        fontWeight: currentPage === page ? 700 : 400, cursor: "pointer" }}>
                        {page}
                      </button>
                    ))}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                      style={{ padding: "8px 14px", border: "1.5px solid #e0e0e0", borderRadius: "8px", background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}>
                      Next →
                    </button>
                    <span style={{ fontSize: "13px", color: "#888" }}>
                      Page {currentPage} of {totalPages} · {filteredProducts.length} products
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ---- ORDERS ---- */}
        {tab === "Orders" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Orders ({orders.length})</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {orders.map((o) => (
                <div key={o._id} style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e8e8e8", 
                overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", borderBottom: "0.5px solid #f5f5f5", display: "flex", 
                    alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>Order #{o._id.slice(-8).toUpperCase()}</p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{new Date(o.createdAt).toLocaleString("en-IN")} · {o.address}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "15px", fontWeight: 700 }}>₹{o.totalAmount}</span>
                      <select value={o.status} onChange={(e) => handleOrderStatus(o._id, e.target.value)}
                        style={{ border: "1.5px solid #e0e0e0", borderRadius: "8px", padding: "6px 10px", 
                        fontSize: "13px", fontWeight: 600, cursor: "pointer", outline: "none", 
                        background: STATUS_COLORS[o.status]?.bg, color: STATUS_COLORS[o.status]?.color }}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ padding: "12px 20px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {o.items?.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", 
                      background: "#f9f9f7", borderRadius: "8px", padding: "6px 10px" }}>
                        {item.productId?.imageUrl && <img src={item.productId.imageUrl} alt="" 
                        style={{ width: "28px", height: "28px", objectFit: "contain" }} />}
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

        {/* ---- USERS ---- */}
        {tab === "Users" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Users ({users.length})</h2>
            <div style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e8e8e8", 
              overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#f9f9f7" }}>
                    {["Name", "Email", "Role", "Joined", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, 
                        color: "#555", borderBottom: "0.5px solid #e8e8e8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: "0.5px solid #f5f5f5" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", 
                            background: "#e8f5e9", display: "flex", alignItems: "center", 
                            justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#085add" }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#555" }}>{u.email}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: u.role === "admin" ? "#fff3cd" : "#e8f5e9", 
                          color: u.role === "admin" ? "#856404" : "#0e0ae2", fontSize: "11px", 
                          fontWeight: 700, padding: "3px 10px", borderRadius: "999px" }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#888" }}>{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <button onClick={async () => {
                          const newRole = u.role === "admin" ? "user" : "admin";
                          if (!confirm(`Change ${u.name}'s role to ${newRole}?`)) return;
                          await fetch(`${API}/api/admin/users/${u._id}/role`, { method: "PATCH", 
                            headers: headers(), body: JSON.stringify({ role: newRole }) });
                          fetchUsers();
                        }}
                          style={{ background: "#f5f5f0", color: "#555", border: "none", borderRadius: "6px", 
                          padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
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

// Filter tag component
function FilterTag({ label, onRemove }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#e8f5e9", 
    color: "#2e0ff4", fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px" }}>
      {label}
      <button onClick={onRemove} style={{ background: "none", border: "none", color: "#0b4be1", 
        cursor: "pointer", padding: 0, fontSize: "14px", lineHeight: 1 }}>×</button>
    </span>
  );
}

function ImageFileUploader({ adminToken, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const API = process.env.NEXT_PUBLIC_API_URL;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // client-side validation
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Only jpg, png, webp files allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Max 5MB.");
      return;
    }

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API}/api/admin/upload-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        onUploaded(data.imageUrl);
        e.target.value = ""; // reset input
      } else {
        setError(data.message || "Upload failed");
      }
    } catch {
      setError("Upload failed. Check your connection.");
    }
    setUploading(false);
  };

  return (
    <div>
      <label style={{
        display: "inline-flex", alignItems: "center", gap: "8px",
        background: uploading ? "#f0f0f0" : "#fff",
        border: "1.5px dashed #0b3de1", borderRadius: "8px",
        padding: "10px 16px", cursor: uploading ? "not-allowed" : "pointer",
        fontSize: "13px", fontWeight: 600, color: "#0821da",
      }}>
        {uploading ? "⏳ Uploading..." : "📷 Choose Image File"}
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>
      <span style={{ fontSize: "11px", color: "#aaa", marginLeft: "10px" }}>
        jpg, png, webp — max 5MB
      </span>
      {error && <p style={{ fontSize: "12px", color: "#e53e3e", marginTop: "4px" }}>{error}</p>}
    </div>
  );
}