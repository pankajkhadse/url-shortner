import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../config';
import Swal from 'sweetalert2';

export default function AuthPages({ apiBase = "" }) {
  const [tab, setTab] = useState("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-xl w-full bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Welcome</h2>
            <div className="bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setTab("login")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  tab === "login" ? "bg-white shadow" : "text-gray-600"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setTab("register")}
                className={`ml-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                  tab === "register" ? "bg-white shadow" : "text-gray-600"
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {tab === "login" ? (
            <LoginForm apiBase={apiBase} />
          ) : (
            <RegisterForm apiBase={apiBase} onSuccess={() => setTab("login")} />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------
// RegisterForm
// ---------------------
function RegisterForm({ apiBase = "", onSuccess = () => {} }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function validate() {
    if (!name.trim()) return "Name is required.";
    if (!/^[\w-.]+@[\w-]+\.[a-z]{2,}$/i.test(email)) return "Enter a valid email.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  }

  async function handleSubmit(e) {
  e.preventDefault();
  setError("");
  setSuccess("");
  const v = validate();
  if (v) return setError(v);

  setLoading(true);
  try {
    const res = await fetch(`${API_BASE_URL}/user/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    
    const body = await res.json();
    
    // ✅ SOLUTION: Check res.ok for success instead of body.success
    if (res.ok) {
      // Show SweetAlert success message
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: body.message || 'You can now log in with your credentials',
        confirmButtonText: 'Go to Login',
      }).then((result) => {
        // This logic correctly toggles the form to the login tab
        onSuccess(body); 
      });

      // Clear form fields
      setName("");
      setEmail("");
      setPassword("");

    } else {
      // All other non-ok responses will be treated as errors
      // The body.message will come from your backend's error responses
      throw new Error(body.message || "An unknown error occurred");
    }

  } catch (err) {
    // This catches network errors or the error thrown above
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Your full name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <div className="relative">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPass ? "text" : "password"}
            className="w-full px-4 py-2 border rounded-md pr-28 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Choose a strong password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm px-3 py-1 rounded-md bg-gray-100"
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters.</p>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="text-green-600 text-sm bg-green-50 p-2 rounded-md">
          {success}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium disabled:opacity-60 hover:bg-indigo-700 transition-colors"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </div>
    </form>
  );
}

// ---------------------
// LoginForm
// ---------------------
function LoginForm({ apiBase = "" }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Please enter email and password.");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const body = await res.json();
      console.log("Login response:", body);
      
      if (!res.ok) throw new Error(body?.message || "Login failed");

      if (body.success && body.token) {
        localStorage.setItem("uid", body.token);
        localStorage.setItem("userName", body.user?.name || "");
        
        console.log("Token stored, redirecting to dashboard...");
        
        // ✅ FIX: Use multiple methods to ensure redirect works
        
        // Method 1: Use navigate with replace
        navigate("/dashboard", { replace: true });
        
        // Method 2: Force React to re-render by triggering state change
        window.dispatchEvent(new Event('storage'));
        
        // Method 3: Fallback - reload the page to ensure clean state
        setTimeout(() => {
          // Check if we're still on the login page
          if (window.location.pathname === "/" || window.location.pathname === "/login") {
            console.log("Fallback: forcing page reload");
            window.location.href = "/dashboard";
          }
        }, 100);
        
      } else {
        setError(body.message || "Login failed - unexpected response");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <div className="relative">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPass ? "text" : "password"}
            className="w-full px-4 py-2 border rounded-md pr-24 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm px-3 py-1 rounded-md bg-gray-100"
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <button
          type="button"
          onClick={() => alert("Password reset flow not implemented.")}
          className="text-sm underline"
        >
          Forgot?
        </button>
      </div>
    </form>
  );
}
