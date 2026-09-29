import { cx } from "@/lib/format";
import type { ProviderStatus } from "@/types/workspace";

const statusClasses: Record<ProviderStatus, string> = {
  healthy: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  degraded: "bg-amber-50 text-amber-800 ring-amber-200",
  limited: "bg-orange-50 text-orange-800 ring-orange-200",
  disabled: "bg-ink-100 text-ink-500 ring-ink-200"
};

export function StatusPill({ status }: { status: ProviderStatus }) {
  return (
    <span className={cx("inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ring-1", statusClasses[status])}>
      {status}
    </span>
  );
}
