"use client";

import { UploadCloud, FileWarning, AlertTriangle, ShieldAlert, CheckCircle2, FileText } from "lucide-react";
import { useState, useRef } from "react";

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
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/lease/analyze", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze lease");
      
      setResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Upload Section */}
      <div className="mb-10 rounded-3xl bg-gradient-to-br from-pink-500/10 to-purple-800/10 p-1">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center rounded-[23px] border-2 border-dashed border-pink-400/30 bg-white/60 backdrop-blur-sm p-12 text-center transition-all hover:bg-pink-900/10 hover:border-pink-400/50 group cursor-pointer"
        >
          <input 
            type="file" 
            accept="application/pdf" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
          />
          <div className="mb-6 rounded-full bg-white/80 border-primary/10 p-5 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <UploadCloud className="h-12 w-12 text-pink-400" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-primary">
            {file ? file.name : "Drag & drop your lease PDF"}
          </h3>
          <p className="mb-8 text-primary/70">
            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "or click to browse from your computer (Max 10MB)"}
          </p>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleAnalyze();
            }}
            disabled={!file || loading}
            className="rounded-xl bg-primary px-8 py-4 text-lg font-bold text-[#c5b4e3] shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-primary/40 w-full sm:w-auto disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? "Analyzing Document..." : "Analyze My Lease"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 rounded-xl bg-red-100 border border-red-300 p-4 text-red-800 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold">Analysis Failed</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {results && (
        <div className="mt-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <FileText className="h-6 w-6 text-pink-400" />
              Analysis Results
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-sm font-medium text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              Scan Complete
            </span>
          </div>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-md p-8 text-center text-primary/70">
              <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-primary mb-2">No Red Flags Found!</h3>
              <p>This lease looks standard and does not contain any obvious unfair clauses or hidden fees.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result: any, index: number) => {
                const Icon = result.severity === "High" ? ShieldAlert : result.severity === "Medium" ? AlertTriangle : FileWarning;
                
                return (
                  <div 
                    key={result.id || index}
                    className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-md p-6 transition-all hover:border-pink-400/30 hover:bg-white/80 shadow-sm"
                  >
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-red-500 to-pink-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 rounded-xl p-3 ${severityColors[result.severity] || severityColors.Low}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-primary mb-2">{result.issue}</h3>
                          <p className="text-primary/70 text-sm leading-relaxed max-w-2xl">
                            {result.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="shrink-0 sm:self-center ml-12 sm:ml-0">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${severityColors[result.severity] || severityColors.Low}`}>
                          {result.severity} Risk
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
