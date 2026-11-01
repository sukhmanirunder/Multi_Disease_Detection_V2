import { ShieldCheck, Activity, HeartPulse, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-pagebg px-6 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-navy mb-4">
            About MediScan
          </h1>
          <p className="text-lg text-bodytext max-w-xl mx-auto leading-relaxed">
            An AI-powered platform for preliminary multi-disease health-risk
            screening — designed for awareness, not diagnosis.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white border border-border rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-navy mb-4">Our Mission</h2>
          <p className="text-bodytext leading-relaxed mb-4">
            Many people lack easy access to healthcare professionals, lab
            tests, or complete medical information. MediScan aims to bridge
            that gap by providing a simple, accessible way to understand
            possible health risks using only the information you have.
          </p>
          <p className="text-bodytext leading-relaxed">
            We believe digital health tools should support — not replace —
            professional healthcare. Our goal is to encourage early awareness
            and prompt timely consultation with qualified doctors.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white border border-border rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-navy mb-6">How It Works</h2>
          <div className="space-y-4">
            <Step
              num="1"
              title="Describe your symptoms"
              desc="Tell MediScan how you're feeling in plain language."
            />
            <Step
              num="2"
              title="Answer adaptive questions"
              desc="The system asks only what's relevant to narrow down possible risks."
            />
            <Step
              num="3"
              title="Get your screening result"
              desc="See a risk estimate with probability, model used, and next steps."
            />
            <Step
              num="4"
              title="Review your history"
              desc="Access all past screenings anytime from your personal dashboard."
            />
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Feature
            icon={<Activity className="text-teal" size={24} />}
            title="Multi-Disease"
            desc="Screen for diabetes, heart, and kidney conditions."
          />
          <Feature
            icon={<ShieldCheck className="text-teal" size={24} />}
            title="Private"
            desc="Your data is encrypted and visible only to you."
          />
          <Feature
            icon={<HeartPulse className="text-teal" size={24} />}
            title="Adaptive"
            desc="Smart questions based on what you tell us."
          />
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 flex gap-3">
          <AlertTriangle size={20} className="text-riskMod shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-navy mb-1">Important Disclaimer</h3>
            <p className="text-sm text-bodytext leading-relaxed">
              MediScan provides preliminary risk screening only. It is not a
              medical diagnosis and should never replace professional medical
              advice, examination, or testing. Always consult a qualified
              healthcare professional for medical concerns.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/register"
            className="inline-block bg-teal text-white px-8 py-3 rounded-xl font-medium hover:opacity-90 transition"
          >
            Start Your First Screening →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Step({ num, title, desc }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-9 h-9 rounded-full bg-mint text-teal font-bold flex items-center justify-center shrink-0">
        {num}
      </div>
      <div>
        <p className="font-semibold text-navy">{title}</p>
        <p className="text-sm text-bodytext leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      <div className="w-11 h-11 bg-mint rounded-xl flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="font-bold text-navy mb-1">{title}</p>
      <p className="text-sm text-bodytext leading-relaxed">{desc}</p>
    </div>
  );
}