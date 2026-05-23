import type { CustomerDocumentType } from "@/features/customer/types";

type CustomerTypeBadgeProps = {
  type: CustomerDocumentType;
};

export function CustomerTypeBadge({ type }: CustomerTypeBadgeProps) {
  if (type === "PJ") {
    return (
      <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-200">
        PJ
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-200">
      PF
    </span>
  );
}
