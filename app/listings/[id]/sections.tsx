"use client";
import { Car, PersonStanding, Bus, ExternalLink } from "lucide-react";

interface BusRoute { route: string; name: string; frequency: string; firstBus: string; lastBus: string; }
interface Commute {
  driving: { time: string; distance: string; trafficTime: string };
  walking: { time: string; distance: string };
  transit: { time: string; route: string; stops: number };
}
interface ISP { name: string; type: string; speed: string; price: number; rating: number; available: boolean; recommended?: boolean; }

export function CommuteSection({ commute, busRoutes, address, uwbAddress }: {
  commute: Commute; busRoutes: BusRoute[]; address: string; uwbAddress: string;
}) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(address)}&destination=${encodeURIComponent(uwbAddress)}`;
  const modes = [
    { label: "Driving", icon: Car, time: commute.driving.time, sub: commute.driving.trafficTime, dist: commute.driving.distance, color: "violet" },
    { label: "Walking", icon: PersonStanding, time: commute.walking.time, sub: commute.walking.distance, dist: "", color: "emerald" },
    { label: "Transit", icon: Bus, time: commute.transit.time, sub: commute.transit.route, dist: `${commute.transit.stops} stops`, color: "blue" },
  ];
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-white">📍 Commute to UWB</h2>
        <a href={mapsUrl} target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 hover:bg-violet-500/20 transition">
          <ExternalLink size={12} /> Open in Google Maps
        </a>
      </div>

      {/* Map iframe */}
      <div className="overflow-hidden rounded-xl border border-white/10 h-56">
        <iframe title="location-map" width="100%" height="100%" loading="lazy"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`}
          className="grayscale brightness-75" />
      </div>

      {/* Commute cards */}
      <div className="grid grid-cols-3 gap-3">
        {modes.map(({ label, icon: Icon, time, sub, dist, color }) => (
          <div key={label} className={`rounded-xl border bg-white/3 p-3 text-center space-y-1 border-${color}-500/20`}>
            <Icon size={18} className={`mx-auto text-${color}-400`} />
            <p className="text-lg font-bold text-white">{time}</p>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-[10px] text-gray-500">{sub}</p>
            {dist && <p className="text-[10px] text-gray-600">{dist}</p>}
          </div>
        ))}
      </div>

      {/* Bus routes */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3">🚌 Bus Routes (King County Metro)</h3>
        <div className="space-y-2">
          {busRoutes.map((r) => (
            <div key={r.route} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/20 text-yellow-400 font-bold text-sm shrink-0">{r.route}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{r.name}</p>
                <p className="text-xs text-gray-500">{r.frequency} · {r.firstBus} – {r.lastBus}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-gray-600">Schedules based on King County Metro published timetables. Check metro.kingcounty.gov for real-time tracking.</p>
      </div>
    </div>
  );
}

export function UtilitiesSection({ utilityCosts, included, isps }: {
  utilityCosts: { electricity: number; water: number; sewage: number; gas: number; trash: number; total: number };
  included: { electricity: boolean; water: boolean; internet: boolean; gas: boolean };
  isps: ISP[];
}) {
  const items = [
    { label: "Electricity", key: "electricity" as const, emoji: "⚡" },
    { label: "Water", key: "water" as const, emoji: "💧" },
    { label: "Sewage", key: "sewage" as const, emoji: "🚰" },
    { label: "Gas", key: "gas" as const, emoji: "🔥" },
    { label: "Trash", key: "trash" as const, emoji: "🗑️" },
  ];
  const includedKeys: Record<string, boolean> = {
    electricity: included.electricity, water: included.water, gas: included.gas,
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-6">
      <h2 className="text-lg font-semibold text-white">💡 Estimated Utility Costs</h2>

      {/* Utility breakdown */}
      <div className="space-y-2">
        {items.map(({ label, key, emoji }) => (
          <div key={key} className="flex items-center gap-3 text-sm">
            <span className="text-base w-5">{emoji}</span>
            <span className="flex-1 text-gray-300">{label}</span>
            {includedKeys[key] ? (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Included</span>
            ) : (
              <span className="font-semibold text-white">
                {utilityCosts[key] === 0 ? "N/A" : `~$${utilityCosts[key]}/mo`}
              </span>
            )}
          </div>
        ))}
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="font-semibold text-white">Total Utilities</span>
          <span className="text-lg font-bold text-violet-400">~${utilityCosts.total}/mo</span>
        </div>
        <p className="text-[11px] text-gray-600">Estimates based on Puget Sound Energy & Seattle Public Utilities average rates for this area.</p>
      </div>

      {/* ISP section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-200 mb-3">📶 Available Internet Providers</h3>
        <div className="space-y-2">
          {isps.map((isp) => (
            <div key={isp.name} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${isp.available ? "border-white/10 bg-white/3" : "border-white/5 bg-white/1 opacity-50"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{isp.name}</span>
                  {isp.recommended && isp.available && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">Best Pick</span>
                  )}
                  {!isp.available && (
                    <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-400">Not Available</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{isp.type} · {isp.speed}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-white">${isp.price}<span className="text-xs font-normal text-gray-500">/mo</span></p>
                <div className="flex items-center gap-0.5 justify-end mt-0.5">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className={`text-[10px] ${i <= Math.round(isp.rating) ? "text-yellow-400" : "text-gray-700"}`}>★</span>
                  ))}
                  <span className="text-[10px] text-gray-500 ml-1">{isp.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
