import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  colorClass?: string;
  className?: string;
}

export function StatCard({ title, value, icon, trend, colorClass = "text-blue-500", className }: StatCardProps) {
  return (
    <div className={cn("glass-card p-5 flex flex-col relative overflow-hidden group", className)}>
      {/* Decorative gradient blur in background */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 filter blur-2xl group-hover:scale-150 transition-transform duration-500 bg-current ${colorClass}`} />
      
      <div className="flex justify-between items-start mb-4">
        <div className="text-var(--text-secondary) font-medium text-sm">{title}</div>
        <div className={`p-2 rounded-lg bg-var(--surface-100) dark:bg-var(--surface-800) ${colorClass}`}>
          {icon}
        </div>
      </div>
      
      <div className="text-3xl font-bold tracking-tight text-var(--text-primary) mb-1">
        {value}
      </div>
      
      {trend && (
        <div className="flex items-center gap-1.5 mt-auto pt-2">
          <span className={cn(
            "text-xs font-semibold px-1.5 py-0.5 rounded-md",
            trend.isPositive 
              ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10" 
              : "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10"
          )}>
            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-var(--text-muted)">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
