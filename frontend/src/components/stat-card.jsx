import { cn } from "@/lib/utils";

export function StatCard({
  label, value, delta, icon: Icon, tone = "default",
}) {
  const tones = {
    default: "text-foreground",
    primary: "text-primary",
    warning: "text-amber-300",
    danger: "text-red-300",
  };
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-3.5 sm:p-5 shadow-[var(--shadow-card)] transition-all hover:border-primary/30 hover:-translate-y-0.5">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition group-hover:bg-primary/10" />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className={cn("mt-1 sm:mt-2 text-lg sm:text-2xl font-semibold tracking-tight md:text-[28px] truncate", tones[tone])}>{value}</div>
          {delta && <div className="mt-1 truncate text-[10px] sm:text-xs text-muted-foreground">{delta}</div>}
        </div>
        <div className="grid h-8 w-8 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
    </div>
  );
}
