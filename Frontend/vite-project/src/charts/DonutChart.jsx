import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-violet-50/95 border border-violet-250 rounded-xl p-3 shadow-lg text-xs backdrop-blur-md">
        <p className="text-violet-850 font-bold mb-1 capitalize">{payload[0].payload.name}</p>
        <p className="text-violet-700 font-extrabold">📊 {payload[0].value.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const DonutChart = ({ data = [] }) => {
  const chartData = (Array.isArray(data) && data.length > 0)
    ? data.map(item => ({
        name: item.courseName || item.category || item.name || "Course",
        value: item.progressPercent !== undefined ? item.progressPercent : (item.value || 0)
      }))
    : [
        { name: "Web Development",    value: 40 },
        { name: "Data Structures",    value: 30 },
        { name: "Soft Skills",        value: 20 },
        { name: "DevOps",             value: 10 },
      ];

  return (
    <div className="bg-violet-50/70 backdrop-blur-md rounded-2xl border border-violet-100 shadow-sm p-6 h-[320px] flex flex-col">
      <div className="mb-3">
        <h3 className="text-violet-955 font-bold text-sm">Progress Distribution</h3>
        <p className="text-violet-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">Completion by Category</p>
      </div>

      <div className="flex-1 flex items-center gap-4 min-h-0">
        <div className="w-[140px] h-[140px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={60}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#f5f3ff" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[180px]">
          {chartData.map((item, i) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-violet-900 truncate capitalize font-semibold">{item.name}</span>
              </div>
              <span className="text-violet-950 font-bold pl-2">{item.value.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
