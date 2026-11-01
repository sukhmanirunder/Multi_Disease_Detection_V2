import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-navy text-white px-6 py-3.5 flex items-center justify-between">
      {/* Left: Logo */}
      <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5">
        <img src="/logo-icon.png" alt="MediScan" className="h-8 w-8" />
        <span className="font-bold text-lg tracking-tight">MediScan</span>
      </Link>

      {/* Right: Nav links */}
      <div className="flex items-center gap-6 text-sm">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="hover:text-mint transition">Dashboard</Link>
            <Link to="/history"   className="hover:text-mint transition">History</Link>
            <Link to="/profile"   className="hover:text-mint transition">Profile</Link>
            <span className="text-mint text-xs">Hi, {user?.name?.split(" ")[0]}</span>
            <button
              onClick={handleLogout}
              className="bg-teal hover:opacity-90 px-3.5 py-1.5 rounded-lg font-medium transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/"        className="hover:text-mint transition">Home</Link>
            <Link to="/about"   className="hover:text-mint transition">About</Link>
            <Link to="/login"   className="hover:text-mint transition">Login</Link>
            <Link
              to="/register"
              className="bg-teal hover:opacity-90 px-3.5 py-1.5 rounded-lg font-medium transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}