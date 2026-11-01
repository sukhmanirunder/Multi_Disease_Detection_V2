import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Screen() {
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm MediScan, your AI health assistant. How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || busy || done) return;

    const newHistory = [...messages, { role: "user", text: trimmed }];
    setMessages(newHistory);
    setInput("");
    setBusy(true);

    try {
      const { data } = await api.post("/chat", {
        message: trimmed,
        history: messages,
      });

      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);

      if (data.status === "complete") {
        setDone(true);
        setMessages((prev) => [
          ...prev,
          { 
            role: "result", 
            result: data.result, 
            disease: data.result.disease, 
            mode: data.result.mode 
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "bot", text: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-pagebg flex justify-center py-6 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-border shadow-card flex flex-col h-[85vh]">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 bg-mint rounded-xl flex items-center justify-center">
            <span className="text-teal font-bold">AI</span>
          </div>
          <div>
            <h2 className="font-bold text-navy leading-tight">MediScan Assistant</h2>
            <p className="text-xs text-bodytext">Powered by Llama 3</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {messages.map((m, i) => (
            <Message key={i} msg={m} onNavigate={navigate} />
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="bg-mint text-navy px-4 py-2.5 rounded-2xl rounded-bl-sm">
                <span className="text-xs text-bodytext italic">MediScan is thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {!done && (
          <div className="border-t border-border p-4 flex gap-2">
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type how you feel..."
              disabled={busy}
              className="flex-1 px-4 py-2.5 border border-border rounded-xl text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
            <button
              onClick={send}
              disabled={busy || !input.trim()}
              className="bg-teal text-white px-4 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Message({ msg, onNavigate }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-teal text-white px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[80%] text-sm">
          {msg.text}
        </div>
      </div>
    );
  }
  
  if (msg.role === "result") {
    return <ResultCard result={msg.result} disease={msg.disease} onNavigate={onNavigate} />;
  }

  // Markdown rendering for bot messages
  return (
    <div className="flex justify-start w-full">
      <div className="bg-mint text-navy px-5 py-4 rounded-2xl rounded-bl-sm max-w-[90%] text-sm leading-relaxed shadow-sm">
        <ReactMarkdown 
          components={{
            strong: ({node, ...props}) => <span className="font-bold text-teal block mt-3 mb-1" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 mt-1" {...props} />,
            li: ({node, ...props}) => <li className="text-bodytext" {...props} />,
            p: ({node, ...props}) => <p className="mb-2" {...props} />
          }}
        >
          {msg.text}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function ResultCard({ result, disease, onNavigate }) {
  const colors = { Low: "text-riskLow bg-green-50", Moderate: "text-riskMod bg-amber-50", High: "text-riskHigh bg-red-50" };
  const style = colors[result.riskLevel] || colors.Low;

  return (
    <div className="w-full bg-white border-2 border-border rounded-2xl p-5 mt-4 shadow-sm">
      <p className="text-xs uppercase text-bodytext tracking-wider mb-2">
        {disease} Result
      </p>
      
      <div className={`rounded-xl p-4 mb-4 ${style}`}>
        <p className="text-sm mb-1">Risk Level</p>
        <p className="text-2xl font-bold">{result.riskLevel}</p>
        <p className="text-sm mt-1">Probability: {(result.probability * 100).toFixed(1)}%</p>
      </div>

      {/* 👇 THE DEMOGRAPHIC IMPUTATION BADGE 👇 */}
      {disease === "Heart Disease" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex gap-2 items-start">
          <span className="text-blue-600 mt-0.5">ℹ️</span>
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>Demographic Imputation Active:</strong> Missing lab values (like Cholesterol or ECG) were estimated using medical averages for your age and gender to allow the Complete model to run.
          </p>
        </div>
      )}

      <p className="text-xs text-bodytext italic mb-4">
        Model: {result.modelName} ({result.mode})
      </p>
      <button 
        onClick={() => onNavigate("/history")}
        className="w-full bg-navy text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
      >
        View in History
      </button>
    </div>
  );
}