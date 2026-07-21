type ProgressBarProps = {
  value: number;
  className?: string;
  barClassName?: string;
};

const ProgressBar = ({ value, className = "", barClassName = "bg-emerald-500" }: ProgressBarProps) => {
  const width = Math.min(Math.max(value, 0), 100);

  return (
    <div className={`h-2 overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${width}%` }} />
    </div>
  );
};

export default ProgressBar;
