import { Link } from "react-router-dom";
import { ShieldCheck, Activity, HeartPulse } from "lucide-react";

export default function Landing() {
  return (
    <div className="bg-pagebg">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block text-xs font-semibold text-teal tracking-widest uppercase mb-3">
            AI-Powered Health Screening
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-navy leading-tight mb-5">
            Your Health.
            <br />
            Your Insights.
          </h1>
          <p className="text-bodytext text-lg mb-8 leading-relaxed">
            MediScan helps you understand your possible health risks through
            simple symptom-based screening. Free, private, and educational.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/register" className="bg-teal text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition">
              Start Free Screening →
            </Link>
            <Link to="/about" className="px-6 py-3 rounded-xl font-medium text-navy border border-border hover:bg-mint transition">
              Learn More
            </Link>
          </div>

          <p className="text-xs text-bodytext mt-8 max-w-md leading-relaxed">
            ⚠️ MediScan provides preliminary screening only — not a medical
            diagnosis. Always consult a qualified healthcare professional.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-72 h-72 md:w-96 md:h-96 bg-mint rounded-full flex items-center justify-center">
            <HeartPulse className="text-teal" size={120} strokeWidth={1.5} />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-navy text-center mb-10">
          How MediScan helps you
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Activity className="text-teal" size={28} />}
            title="Symptom-Based"
            description="Describe how you feel. MediScan asks smart follow-up questions to narrow down possible risks."
          />
          <FeatureCard
            icon={<ShieldCheck className="text-teal" size={28} />}
            title="Private & Secure"
            description="Your data is encrypted and only visible to you. Screening history is stored safely."
          />
          <FeatureCard
            icon={<HeartPulse className="text-teal" size={28} />}
            title="Multi-Disease"
            description="Screen for diabetes, heart disease, kidney disease and more — all in one place."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-card hover:shadow-soft transition">
      <div className="w-12 h-12 bg-mint rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-navy mb-2">{title}</h3>
      <p className="text-sm text-bodytext leading-relaxed">{description}</p>
    </div>
  );
}