import React from "react";

const colorMap = {
  violet:  { bg: "bg-violet-50",  border: "border-violet-200",  icon: "bg-violet-100 text-violet-600",  val: "text-violet-700",  label: "text-violet-500"  },
  cyan:    { bg: "bg-cyan-50",    border: "border-cyan-200",    icon: "bg-cyan-100 text-cyan-600",      val: "text-cyan-700",    label: "text-cyan-500"    },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "bg-emerald-100 text-emerald-600",val: "text-emerald-700", label: "text-emerald-500" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   icon: "bg-amber-100 text-amber-600",    val: "text-amber-700",   label: "text-amber-500"   },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    icon: "bg-rose-100 text-rose-600",      val: "text-rose-700",    label: "text-rose-500"    },
};

const StatCard = ({ title, value, icon, change, color = "violet" }) => {
  const c = colorMap[color] || colorMap.violet;

  return (
    <div className={`rounded-2xl border p-5 ${c.bg} ${c.border} flex flex-col gap-4 group hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{title}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${c.icon}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className={`text-3xl font-extrabold tracking-tight ${c.val}`}>{value}</p>
        {change && (
          <p className="text-xs text-gray-400 font-medium mt-1 flex items-center gap-1">
            <span className="text-emerald-500 font-semibold">{change}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
