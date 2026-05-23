import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-violet-50/95 border border-violet-250 rounded-xl p-3 shadow-lg text-xs backdrop-blur-md">
        <p className="text-violet-850 font-bold mb-1">{payload[0]?.payload?.date || "Date"}</p>
        <p className="text-violet-700 font-extrabold flex items-center gap-1">
          🕒 {payload[0]?.payload?.minutes ?? 0} mins
        </p>
        {payload[1] && (
          <p className="text-cyan-700 font-extrabold flex items-center gap-1">
            ✅ {payload[1]?.payload?.lessonsCompleted ?? 0} lessons
          </p>
        )}
      </div>
    );
  }
  return null;
};

const TrendChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];
  const chartData = [...safeData].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="bg-violet-50/70 backdrop-blur-md rounded-2xl border border-violet-100 shadow-sm p-6 h-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-violet-950 font-bold text-sm">Study Trend</h3>
          <p className="text-violet-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">Minutes & Lessons (last 7 days)</p>
        </div>
        <div className="flex gap-4 text-[10px] font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-violet-550 opacity-70" />
            <span className="text-violet-700">Time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-450 opacity-70" />
            <span className="text-violet-700">Lessons</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <span className="text-3xl block mb-2">📊</span>
              <p className="text-violet-400 text-xs font-semibold">No learning data for this period.</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="gTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gLessons" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#ddd6fe"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#7c3aed", fontSize: 10, fontWeight: "semibold" }}
                tickFormatter={(tick) => {
                  try { return new Date(tick).toLocaleDateString(undefined, { weekday: "short" }); }
                  catch { return tick; }
                }}
              />
              <YAxis
                stroke="#ddd6fe"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#7c3aed", fontSize: 10, fontWeight: "semibold" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="minutes" stroke="#7c3aed" strokeWidth={2} fill="url(#gTime)" />
              <Area type="monotone" dataKey="lessonsCompleted" stroke="#06b6d4" strokeWidth={2} fill="url(#gLessons)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default TrendChart;
