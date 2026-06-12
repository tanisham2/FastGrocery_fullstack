"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import CategoryPills from "@/components/CategoryPills";
import CartToast from "@/components/CartToast";

const CATEGORIES = ["All", "Dairy", "Fruits", "Snacks", "Beverages", "Bakery", "Staples"];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    console.log("Token found:", token);
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        console.log("Response status:", res.status);
        if (!res.ok) 
          throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Products received:", data);
        const list = Array.isArray(data) ? data : data.products || [];
        setProducts(list);
        setFiltered(list);
      })
      .catch((err) => console.error("Fetch failed:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

    if (search.trim()) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(list);
  }, [activeCategory, products, search]);

  // 3. Add to cart
const handleAddToCart = async (productId) => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId"); 
  if (!token) { router.push("/login"); return; }

  setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));

  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity: 1 }), 
    });
  } 
  catch (err) {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[productId] <= 1) delete updated[productId];
      else updated[productId]--;
      return updated;
    });
  }
};

  // 4. Update quantity
const handleUpdateQty = async (productId, delta) => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId"); 
  const newQty = (cart[productId] || 0) + delta;

  if (newQty <= 0) {
    setCart((prev) => { const c = { ...prev }; delete c[productId]; return c; });
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } 
  else {
    setCart((prev) => ({ ...prev, [productId]: newQty }));
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity: newQty }), // add userId here
    });
  }
};

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find((x) => x._id === id);
    return sum + (p ? p.price * qty : 0);
  }, 0);

  return (
    <div style={{ minHeight: "200vh", background: "#dec45b" }}>

      {/* Full-width blue topbar */}
      <header style={{
        background: "#21969c",
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        width: "100%",
        boxSizing: "border-box",
        margin: 0,
      }}>
        {/* Logo */}
        <div style={{ minWidth: "fit-content" }}>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            Fast<span style={{ color: "#f8d030" }}>Grocery</span>
          </div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)" }}>
            Delivery in 10 minutes
          </div>
        </div>

        {/* Search bar */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          background: "#fff",
          borderRadius: "8px",
          padding: "10px 14px",
          gap: "8px",
        }}>
          <span style={{ fontSize: "16px" }}>🔍</span>
          <input
            type="text"
            placeholder='Search "milk, bread, eggs…"'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              fontSize: "14px",
              width: "100%",
              background: "transparent",
              color: "#333",
            }}
          />
        </div>

        {/* Cart button */}
        <button
          onClick={() => router.push("/cart")}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#fff", color: "#1b1d00",
            fontWeight: 700, fontSize: "16px",
            border: "none", borderRadius: "8px",
            padding: "10px 18px", cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          🛒 My Cart
          {cartCount > 0 && (
            <span style={{
              background: "#eee603", color: "#fff",
              fontSize: "11px", fontWeight: 700,
              borderRadius: "50%", width: "20px", height: "20px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {cartCount}
            </span>
          )}
        </button>
        {/* Login / Account button */}
        <LoginButton router={router} />
      </header>

      {/* Page content */}
      <main style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>

        <CategoryPills
          categories={CATEGORIES}
          active={activeCategory}
          onChange={setActiveCategory}
        />

        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1a1a1a", marginBottom: "16px" }}>
          {activeCategory === "All" ? "All Products" : activeCategory}
          <span style={{
            marginLeft: "8px", fontSize: "11px", fontWeight: 600,
            background: "#f2f3e7", color: "#856404",
            padding: "2px 8px", borderRadius: "999px",
          }}>
            {filtered.length} items
          </span>
        </h2>

        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🛒</div>
            <p style={{ fontSize: "16px", fontWeight: 600 }}>No products found</p>
            <p style={{ fontSize: "13px", marginTop: "4px" }}>Try a different category or search term</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: "12px",
          }}>
            {filtered.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                qty={cart[product._id] || 0}
                onAdd={() => handleAddToCart(product._id)}
                onIncrease={() => handleUpdateQty(product._id, 1)}
                onDecrease={() => handleUpdateQty(product._id, -1)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Sticky cart toast */}
      {cartCount > 0 && (
        <CartToast
          count={cartCount}
          total={cartTotal}
          onClick={() => router.push("/cart")}
        />
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
      gap: "12px",
    }}>
      {Array(10).fill(0).map((_, i) => (
        <div key={i} style={{
          background: "#ebede3", borderRadius: "12px",
          border: "0.5px solid #e8e8e8", overflow: "hidden",
        }}>
          <div style={{ height: "130px", background: "#f0f0f0", animation: "pulse 1.5s infinite" }} />
          <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ height: "13px", background: "#f0f0f0", borderRadius: "4px", width: "80%" }} />
            <div style={{ height: "12px", background: "#f0f0f0", borderRadius: "4px", width: "50%" }} />
            <div style={{ height: "28px", background: "#f0f0f0", borderRadius: "6px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LoginButton({ router }) {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("userName");
    if (token) setUser({ name: name || "Account" });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    setUser(null);
    router.refresh();
  };

  if (user) {
    return (
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.4)",
            color: "#fff", borderRadius: "8px",
            padding: "10px 14px", cursor: "pointer",
            fontSize: "14px", fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          👤 {user.name} ▾
        </button>
        {showDropdown && (
          <div style={{
            position: "absolute", right: 0, top: "110%",
            background: "#fff", borderRadius: "10px",
            border: "0.5px solid #e8e8e8",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            minWidth: "160px", zIndex: 100, overflow: "hidden",
          }}>
            <button
              onClick={() => { router.push("/orders"); setShowDropdown(false); }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", 
                fontSize: "14px", color: "#1a1a1a", background: "none", border: "none", 
                borderBottom: "0.5px solid #f0f0f0", cursor: "pointer" }}
            >
               My Orders
            </button>
            <button
              onClick={handleLogout}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", 
                fontSize: "14px", color: "#e53e3e", background: "none", border: "none", cursor: "pointer" }}
            >
               Logout
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push("/login")}
      style={{
        background: "#fff", color: "#1d94da",
        fontWeight: 700, fontSize: "14px",
        border: "none", borderRadius: "8px",
        padding: "10px 18px", cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      Login
    </button>
  );
}
