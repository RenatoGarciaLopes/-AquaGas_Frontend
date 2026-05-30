"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import {
  useCancelPlan,
  useSuspendPlan,
  useUpgradePlan,
  useDowngradePlan,
  useReactivatePlan,
} from "@/features/plan/hooks/use-plan-actions";

import { Icons } from "@/shared/lib/icons";

import {
  ActionOverflowMenu,
  type OverflowMenuItem,
} from "@/shared/ui/action-overflow-menu";

import type { PlanResponse } from "@/features/plan/types";
import { CancelPlanDialog } from "@/features/plan/components/cancel-plan-dialog";
import { SuspendPlanDialog } from "@/features/plan/components/suspend-plan-dialog";
import { UpgradePlanDialog } from "@/features/plan/components/upgrade-plan-dialog";
import { DowngradePlanDialog } from "@/features/plan/components/downgrade-plan-dialog";
import { ReactivatePlanButton } from "@/features/plan/components/reactivate-plan-button";

type PlanDetailActionsProps = {
  plan: PlanResponse;
  products: { id: string; name: string; price: number }[];
};

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70";

export function PlanDetailActions({ plan, products }: PlanDetailActionsProps) {
  const router = useRouter();
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [downgradeOpen, setDowngradeOpen] = useState(false);

  const suspendMutation = useSuspendPlan(plan.id);
  const reactivateMutation = useReactivatePlan(plan.id);
  const cancelMutation = useCancelPlan(plan.id);
  const upgradeMutation = useUpgradePlan(plan.id);
  const downgradeMutation = useDowngradePlan(plan.id);

  function refreshPage() {
    router.refresh();
  }

  const isActive = plan.status === "Active";
  const isSuspended = plan.status === "Suspended";
  const canAct = isActive || isSuspended;

  if (!canAct) return null;

  const anyPending =
    suspendMutation.isPending ||
    reactivateMutation.isPending ||
    cancelMutation.isPending ||
    upgradeMutation.isPending ||
    downgradeMutation.isPending;

  const items: OverflowMenuItem[] = isActive
    ? [
        {
          id: "downgrade",
          label: "Downgrade",
          icon: Icons.arrowDown,
          disabled: anyPending,
          onSelect: () => setDowngradeOpen(true),
        },
        {
          id: "suspend",
          label: "Suspender",
          icon: Icons.alertTriangle,
          disabled: anyPending,
          onSelect: () => setSuspendOpen(true),
        },
        {
          id: "cancel",
          label: "Cancelar",
          icon: Icons.x,
          intent: "danger",
          disabled: anyPending,
          onSelect: () => setCancelOpen(true),
        },
      ]
    : [
        {
          id: "cancel",
          label: "Cancelar",
          icon: Icons.x,
          intent: "danger",
          disabled: anyPending,
          onSelect: () => setCancelOpen(true),
        },
      ];

  const primary = isActive ? (
    <button
      type="button"
      disabled={anyPending}
      onClick={() => setUpgradeOpen(true)}
      className={`${BUTTON_BASE} bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-cyan-300/50`}
    >
      <Icon icon={Icons.arrowUp} className="h-4 w-4" aria-hidden />
      Upgrade
    </button>
  ) : (
    <ReactivatePlanButton
      isPending={reactivateMutation.isPending}
      onConfirm={() => {
        reactivateMutation.mutate(undefined, { onSuccess: refreshPage });
      }}
    />
  );

  return (
    <>
      <ActionOverflowMenu
        ariaLabel="Mais ações do plano"
        disabled={anyPending}
        primary={primary}
        items={items}
        renderItem={(item) => (
          <button
            key={item.id}
            type="button"
            disabled={item.disabled}
            onClick={item.onSelect}
            className={`${BUTTON_BASE} ${itemButtonClasses(item)}`}
          >
            {item.icon ? (
              <Icon icon={item.icon} className="h-4 w-4" aria-hidden />
            ) : null}
            {item.label}
          </button>
        )}
      />

      <SuspendPlanDialog
        open={suspendOpen}
        isPending={suspendMutation.isPending}
        onConfirm={(data) => {
          suspendMutation.mutate(
            { reason: data.reason },
            {
              onSuccess: () => {
                setSuspendOpen(false);
                refreshPage();
              },
            },
          );
        }}
        onCancel={() => setSuspendOpen(false)}
      />

      <CancelPlanDialog
        open={cancelOpen}
        isPending={cancelMutation.isPending}
        onConfirm={(data) => {
          cancelMutation.mutate(
            { reason: data.reason },
            {
              onSuccess: () => {
                setCancelOpen(false);
                refreshPage();
              },
            },
          );
        }}
        onCancel={() => setCancelOpen(false)}
      />

      <UpgradePlanDialog
        open={upgradeOpen}
        isPending={upgradeMutation.isPending}
        currentCycle={plan.cycle}
        currentItems={plan.items}
        availableProducts={products}
        onConfirm={(input) => {
          upgradeMutation.mutate(input, {
            onSuccess: () => {
              setUpgradeOpen(false);
              refreshPage();
            },
          });
        }}
        onCancel={() => setUpgradeOpen(false)}
      />

      <DowngradePlanDialog
        open={downgradeOpen}
        isPending={downgradeMutation.isPending}
        currentCycle={plan.cycle}
        currentItems={plan.items}
        onConfirm={(input) => {
          downgradeMutation.mutate(input, {
            onSuccess: () => {
              setDowngradeOpen(false);
              refreshPage();
            },
          });
        }}
        onCancel={() => setDowngradeOpen(false)}
      />
    </>
  );
}

function itemButtonClasses(item: OverflowMenuItem) {
  if (item.intent === "danger") {
    return "border border-red-500/40 text-red-500 hover:bg-red-500/10 focus:ring-red-300/40";
  }
  switch (item.id) {
    case "downgrade":
      return "border border-orange-500/40 text-orange-500 hover:bg-orange-500/10 focus:ring-orange-300/40";
    case "suspend":
      return "border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 focus:ring-amber-300/40";
    default:
      return "border-border text-foreground hover:bg-muted focus:ring-cyan-300/40 border";
  }
}
