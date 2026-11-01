import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { Activity, Clock, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch prediction history (we'll build this endpoint next)
    api.get("/predictions/history")
      .then((res) => setRecent(res.data.data.slice(0, 3)))
      .catch(() => setRecent([]))
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-pagebg px-6 py-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-1">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-bodytext">
            Ready to check your health today?
          </p>
        </div>

        {/* Quick action cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">

          {/* Start screening — primary CTA */}
          <Link
            to="/screen"
            className="bg-teal text-white rounded-2xl p-6 hover:opacity-90 transition shadow-card md:col-span-2 flex items-center justify-between"
          >
            <div>
              <p className="text-sm opacity-90 mb-1">Start a new</p>
              <p className="text-2xl font-bold">Health Screening</p>
              <p className="text-sm opacity-90 mt-2">
                Answer a few questions to get a risk estimate
              </p>
            </div>
            <Activity size={48} className="opacity-80" />
          </Link>

          {/* History card */}
          <Link
            to="/history"
            className="bg-white border border-border rounded-2xl p-6 hover:border-teal transition shadow-card flex flex-col justify-between"
          >
            <Clock className="text-teal" size={28} />
            <div>
              <p className="text-sm text-bodytext mb-1 mt-4">View your</p>
              <p className="text-lg font-bold text-navy">Screening History</p>
            </div>
          </Link>
        </div>

        {/* Recent screenings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-navy">Recent Screenings</h2>
            {recent.length > 0 && (
              <Link to="/history" className="text-sm text-teal font-medium hover:underline">
                View all →
              </Link>
            )}
          </div>

          {loading ? (
            <div className="bg-white border border-border rounded-xl p-8 text-center text-bodytext">
              Loading...
            </div>
          ) : recent.length === 0 ? (
            <div className="bg-white border border-border rounded-xl p-10 text-center">
              <TrendingUp className="mx-auto text-teal mb-3" size={32} />
              <p className="text-navy font-medium mb-1">No screenings yet</p>
              <p className="text-sm text-bodytext mb-4">
                Start your first screening to see your health insights here.
              </p>
              <Link
                to="/screen"
                className="inline-block bg-teal text-white px-5 py-2 rounded-xl font-medium hover:opacity-90 transition"
              >
                Start Screening
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((r) => (
                <div
                  key={r._id}
                  className="bg-white border border-border rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-navy capitalize">{r.disease}</p>
                    <p className="text-xs text-bodytext">
                      {r.mode} mode · {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className="text-sm font-semibold px-3 py-1 rounded-full"
                    style={{
                      background:
                        r.riskLevel === "High" ? "#FEE2E2" :
                        r.riskLevel === "Moderate" ? "#FEF3C7" : "#E6F4EA",
                      color:
                        r.riskLevel === "High" ? "#B42332" :
                        r.riskLevel === "Moderate" ? "#946200" : "#207544",
                    }}
                  >
                    {r.riskLevel}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-bodytext text-center mt-12 leading-relaxed">
          ⚠️ MediScan provides preliminary screening only. It is not a medical diagnosis.
        </p>
      </div>
    </div>
  );
}