import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (password.length < 6) {
    setError("Password must be at least 6 characters.");
    return;
  }

  try {
    await register(name, email, password);
    // Register succeeded → send user to login with a success message
    navigate("/login", { state: { registered: true } });
  } catch (err) {
    setError(err.response?.data?.message || "Registration failed.");
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-border rounded-2xl p-8 shadow-card">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-navy mb-1">Create your account</h1>
          <p className="text-sm text-bodytext">Start screening in under a minute</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-riskHigh text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Full Name</label>
            <input
              type="text" required value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Email</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Password</label>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-teal text-white py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-bodytext mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-teal font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}