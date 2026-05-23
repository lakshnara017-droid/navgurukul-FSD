import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-violet-50/95 border border-violet-250 rounded-xl p-3 shadow-lg text-xs backdrop-blur-md">
        <p className="text-violet-850 font-bold mb-1">{payload[0].payload.title || "Course"}</p>
        <p className="text-violet-700 font-extrabold">📈 {payload[0].value.toFixed(1)}% Avg Progress</p>
        {payload[0].payload.activeStudents !== undefined && (
          <p className="text-cyan-700 font-extrabold">👥 {payload[0].payload.activeStudents} Students</p>
        )}
      </div>
    );
  }
  return null;
};

const DistributionBar = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { title: "React Basics",       completionRate: 75, activeStudents: 12 },
    { title: "Node.js API",        completionRate: 60, activeStudents: 18 },
    { title: "MongoDB Agg.",       completionRate: 45, activeStudents: 9  },
    { title: "DSA",                completionRate: 30, activeStudents: 22 },
  ];

  return (
    <div className="bg-violet-50/70 backdrop-blur-md rounded-2xl border border-violet-100 shadow-sm p-6 h-[320px] flex flex-col">
      <div className="mb-4">
        <h3 className="text-violet-955 font-bold text-sm">Course Progress Overview</h3>
        <p className="text-violet-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">Average completion per course</p>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }} barSize={20}>
            <XAxis
              dataKey="title"
              stroke="#ddd6fe"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#7c3aed", fontSize: 9, fontWeight: "semibold" }}
              tickFormatter={(t) => (t.length > 12 ? `${t.slice(0, 10)}…` : t)}
            />
            <YAxis
              stroke="#ddd6fe"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#7c3aed", fontSize: 10, fontWeight: "semibold" }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.04)" }} />
            <Bar dataKey="completionRate" radius={[6, 6, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DistributionBar;
