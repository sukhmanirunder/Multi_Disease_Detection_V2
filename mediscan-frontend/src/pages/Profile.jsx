import { useAuth } from "../context/AuthContext";
import { LogOut, User as UserIcon, Mail, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-pagebg px-6 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Header card */}
        <div className="bg-white border border-border rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-mint flex items-center justify-center">
              <span className="text-teal font-bold text-xl">
                {initials || "?"}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy">
                {user?.name || "User"}
              </h1>
              <p className="text-sm text-bodytext">{user?.email}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <InfoRow
              icon={<UserIcon size={16} />}
              label="Full name"
              value={user?.name || "—"}
            />
            <InfoRow
              icon={<Mail size={16} />}
              label="Email"
              value={user?.email || "—"}
            />
            <InfoRow
              icon={<Calendar size={16} />}
              label="Account ID"
              value={user?.id?.slice(-8) || "—"}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-navy mb-4">Account</h2>
          <p className="text-sm text-bodytext mb-6 leading-relaxed">
            Need to edit your account? Password reset and profile editing are
            coming in a future update.
          </p>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-riskHigh text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        <p className="text-xs text-bodytext text-center mt-8">
          ⚠️ MediScan is a preliminary screening tool, not a medical diagnosis.
        </p>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <span className="text-bodytext">{icon}</span>
      <span className="text-sm text-bodytext w-24">{label}</span>
      <span className="text-sm text-navy font-medium flex-1">{value}</span>
    </div>
  );
}