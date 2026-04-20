export function ProgressRing({ 
  progress, 
  size = 40, 
  strokeWidth = 4, 
  color = "var(--color-primary-500)",
  trackColor = "var(--border)",
  className = ""
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safeProgress = Math.min(100, Math.max(0, progress));
  const offset = circumference - (safeProgress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          stroke={trackColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-1000 ease-in-out"
        />
      </svg>
      <div className="absolute flex items-center justify-center text-xs font-semibold">
        {Math.round(safeProgress)}%
      </div>
    </div>
  );
}
