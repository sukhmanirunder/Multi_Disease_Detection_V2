import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Clock, ArrowLeft } from "lucide-react";

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api
      .get("/predictions/history")
      .then((res) => setItems(res.data.data || []))
      .catch((err) => {
        console.error(err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const riskStyles = (level) =>
    ({
      Low:      { bg: "#E6F4EA", text: "#207544" },
      Moderate: { bg: "#FEF3C7", text: "#946200" },
      High:     { bg: "#FEE2E2", text: "#B42332" },
    }[level] || { bg: "#F5FAF9", text: "#334155" });

  const filtered =
    filter === "all"
      ? items
      : items.filter((i) => i.disease?.toLowerCase() === filter);

  return (
    <div className="min-h-screen bg-pagebg px-6 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/dashboard"
            className="text-bodytext hover:text-navy transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-navy">Screening History</h1>
            <p className="text-sm text-bodytext">
              All your previous health screenings
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: "all", label: "All" },
            { key: "diabetes", label: "Diabetes" },
            { key: "heart_disease", label: "Heart" },
            { key: "kidney_disease", label: "Kidney" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                filter === f.key
                  ? "bg-navy text-white"
                  : "bg-white border border-border text-bodytext hover:border-teal"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white border border-border rounded-xl p-10 text-center text-bodytext">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-border rounded-xl p-10 text-center">
            <Clock className="mx-auto text-teal mb-3" size={32} />
            <p className="text-navy font-medium mb-1">No screenings yet</p>
            <p className="text-sm text-bodytext mb-4">
              Start a screening to build your history.
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
            {filtered.map((item) => {
              const style = riskStyles(item.riskLevel);
              return (
                <div
                  key={item._id}
                  className="bg-white border border-border rounded-xl p-5 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-navy capitalize mb-1">
                      {item.disease?.replace("_", " ")}
                    </p>
                    <p className="text-xs text-bodytext mb-2">
                      {item.mode || "basic"} mode ·{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                    {item.symptoms?.[0] && (
                      <p className="text-sm text-bodytext italic">
                        "{item.symptoms[0]}"
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className="inline-block text-sm font-semibold px-3 py-1 rounded-full"
                      style={{ background: style.bg, color: style.text }}
                    >
                      {item.riskLevel}
                    </span>
                    <p className="text-xs text-bodytext mt-2">
                      {item.probability != null
                        ? `${(item.probability * 100).toFixed(1)}%`
                        : "—"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-bodytext text-center mt-10 leading-relaxed">
          ⚠️ All results are screening estimates, not medical diagnoses.
        </p>
      </div>
    </div>
  );
}