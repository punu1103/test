
import React, { useMemo } from "react";
import { User as UserIcon, CheckCircle2, AlertTriangle, AlertCircle, Clock } from "lucide-react";

const OPEN_STATUSES = new Set(["Pending", "Overdue", "Non-Compliant"]);

function computeStatsForUser(items) {
  const total = items.length;
  const open = items.filter((r) => OPEN_STATUSES.has(r.status)).length;
  const closed = items.filter((r) => r.status === "Compliant").length;
  const now = new Date();
  const in30Days = new Date(now);
  in30Days.setDate(now.getDate() + 30);
  const upcoming = items.filter((r) => {
    if (!r.nextReview) return false;
    const d = new Date(r.nextReview);
    return !isNaN(d.getTime()) && d >= now && d <= in30Days;
  }).length;
  return { total, open, closed, complianceRate: total ? Math.round((closed / total) * 100) : 0, upcoming };
}

export default function Dashboard({ userRecords }) {
  // Exclude 'business' from org metrics/cards
  const filteredRecords = useMemo(() => {
    return Object.fromEntries(Object.entries(userRecords || {}).filter(([user]) => user !== 'business'));
  }, [userRecords]);

  const data = useMemo(() => {
    return Object.entries(filteredRecords).map(([user, items]) => ({ user, items, stats: computeStatsForUser(items) }));
  }, [filteredRecords]);

  const grandTotals = useMemo(() => {
    return computeStatsForUser(Object.values(filteredRecords).flat());
  }, [filteredRecords]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Organization Dashboard</h2>
          <p className="text-slate-500 text-sm">Open vs Closed compliance status across all users (excluding business)</p>
        </div>
        <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
          <CheckCircle2 className="w-5 h-5 text-indigo-600" />
          <div className="text-sm font-bold text-indigo-700">Compliance Rate: {grandTotals.complianceRate}%</div>
          <span className="text-xs font-mono text-indigo-700">Total: {grandTotals.total}</span>
          <span className="text-xs font-mono text-amber-700">Open: {grandTotals.open}</span>
          <span className="text-xs font-mono text-emerald-700">Closed: {grandTotals.closed}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.map(({ user, stats }) => (
          <div key={user} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-slate-500" />
              <span className="text-slate-800 font-bold">{user}</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100">
                  <Clock className="w-4 h-4" />
                  <div className="text-xs font-bold">Open</div>
                  <div className="text-sm font-mono">{stats.open}</div>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" />
                  <div className="text-xs font-bold">Closed</div>
                  <div className="text-sm font-mono">{stats.closed}</div>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
                  <div className="text-xs font-bold">Total</div>
                  <div className="text-sm font-mono">{stats.total}</div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Compliance Rate</span>
                  <span className="font-bold text-slate-700">{stats.complianceRate}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-2 bg-emerald-500" style={{ width: `${stats.complianceRate}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Non-Compliant tracked via status</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Upcoming Reviews (≤30 days): {stats.upcoming}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 text-xs font-bold text-slate-600 uppercase">User</th>
                <th className="px-4 py-2 text-xs font-bold text-slate-600 uppercase">Open</th>
                <th className="px-4 py-2 text-xs font-bold text-slate-600 uppercase">Closed</th>
                <th className="px-4 py-2 text-xs font-bold text-slate-600 uppercase">Total</th>
                <th className="px-4 py-2 text-xs font-bold text-slate-600 uppercase">Compliance Rate</th>
                <th className="px-4 py-2 text-xs font-bold text-slate-600 uppercase">Upcoming (≤30d)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-400 italic" colSpan={6}>No users found.</td>
                </tr>
              ) : (
                data.map(({ user, stats }) => (
                  <tr key={`summary-${user}`} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-bold text-slate-800">{user}</td>
                    <td className="px-4 py-2 font-mono text-amber-700">{stats.open}</td>
                    <td className="px-4 py-2 font-mono text-emerald-700">{stats.closed}</td>
                    <td className="px-4 py-2 font-mono text-slate-700">{stats.total}</td>
                    <td className="px-4 py-2 font-mono text-slate-700">{stats.complianceRate}%</td>
                    <td className="px-4 py-2 font-mono text-amber-700">{stats.upcoming}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
