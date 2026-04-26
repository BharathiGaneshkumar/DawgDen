"use client";

import { useState, useRef } from "react";
import {
  UploadCloud, FileWarning, AlertTriangle, ShieldAlert, CheckCircle2,
  FileText, Loader2, X,
} from "lucide-react";

const severityColors: Record<string, string> = {
  High: "bg-red-500/10 border border-red-500/30 text-red-400",
  Medium: "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400",
  Low: "bg-blue-500/10 border border-blue-500/30 text-blue-400",
};

const severityIcons: Record<string, any> = {
  High: ShieldAlert,
  Medium: AlertTriangle,
  Low: FileWarning,
};

export default function LeaseCheckerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [issues, setIssues] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) { setFile(dropped); setText(""); }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (picked) { setFile(picked); setText(""); }
  }

  async function analyze() {
    if (!file && !text.trim()) return;
    setLoading(true);
    setError("");
    setIssues(null);

    const fd = new FormData();
    if (file) fd.append("file", file);
    else fd.append("text", text);

    try {
      const res = await fetch("/api/lease", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setIssues(data.issues);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const canAnalyze = (!!file || text.trim().length > 50) && !loading;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 min-h-screen">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4">
          AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-500">Lease Checker</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Don't get trapped in a bad lease. Upload your PDF or paste your lease text and our AI will scan it for red flags, hidden fees, and unfair clauses.
        </p>
      </div>

      {/* Upload / Paste tabs */}
      <div className="mb-6 space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !file && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
            dragOver
              ? "border-violet-500 bg-violet-500/10"
              : "border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/5"
          }`}
        >
          <input ref={inputRef} type="file" accept=".pdf,.txt" className="hidden" onChange={handleFileChange} />
          {file ? (
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-violet-400" />
              <div className="text-left">
                <p className="font-semibold text-white">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="ml-3 rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <UploadCloud className="h-10 w-10 text-violet-400 mb-3" />
              <p className="font-semibold text-white mb-1">Drop your lease PDF here</p>
              <p className="text-sm text-gray-500">or click to browse (.pdf, .txt · max 10MB)</p>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-gray-500 text-sm">
          <div className="flex-1 h-px bg-white/10" />
          <span>or paste lease text</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); if (e.target.value) setFile(null); }}
          placeholder="Paste your lease agreement text here (at least a few paragraphs for best results)…"
          rows={6}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none transition"
        />

        <button
          onClick={analyze}
          disabled={!canAnalyze}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-base font-bold text-white shadow-xl shadow-violet-500/20 transition-all hover:-translate-y-0.5 hover:shadow-violet-500/40 disabled:opacity-40 disabled:translate-y-0 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Analyzing your lease…
            </>
          ) : (
            "🔍 Analyze My Lease"
          )}
        </button>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {issues && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-violet-400" />
              Analysis Results
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-sm font-medium text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              {issues.length} issue{issues.length !== 1 ? "s" : ""} found
            </span>
          </div>

          <div className="space-y-4">
            {issues.map((result, i) => {
              const sev = result.severity as string;
              const Icon = severityIcons[sev] || FileWarning;
              return (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-violet-500/30 hover:bg-white/10"
                >
                  <div className={`absolute left-0 top-0 h-full w-1 ${sev === "High" ? "bg-gradient-to-b from-red-500 to-pink-500" : sev === "Medium" ? "bg-gradient-to-b from-yellow-500 to-orange-400" : "bg-gradient-to-b from-blue-500 to-indigo-500"}`} />

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`mt-0.5 rounded-xl p-2.5 ${severityColors[sev] || severityColors.Low}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white mb-2">{result.issue}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">{result.description}</p>
                      </div>
                    </div>
                    <div className="shrink-0 sm:self-start ml-12 sm:ml-0">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${severityColors[sev] || severityColors.Low}`}>
                        {sev} Risk
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-center text-xs text-gray-600">
            AI analysis is for informational purposes only. Consult a legal professional for advice specific to your situation.
          </p>
        </div>
      )}
    </div>
  );
}
