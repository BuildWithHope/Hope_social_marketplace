import { cn } from "@/lib/utils";

const styles = {
  Completed: "bg-primary/15 text-primary ring-1 ring-inset ring-primary/25",
  Pending: "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/25",
  Failed: "bg-destructive/15 text-red-300 ring-1 ring-inset ring-destructive/25",
  "In Progress": "bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-500/25",
};

export function StatusBadge({ status }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", styles[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
