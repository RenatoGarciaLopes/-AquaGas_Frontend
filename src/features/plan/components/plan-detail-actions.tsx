"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

import { Icons } from "@/shared/lib/icons";

import type { PlanResponse, UpgradePlanInput, DowngradePlanInput } from "@/features/plan/types";
import {
  useSuspendPlan,
  useReactivatePlan,
  useCancelPlan,
  useUpgradePlan,
  useDowngradePlan,
} from "@/features/plan/hooks/use-plan-actions";
import { SuspendPlanDialog } from "@/features/plan/components/suspend-plan-dialog";
import { CancelPlanDialog } from "@/features/plan/components/cancel-plan-dialog";
import { ReactivatePlanButton } from "@/features/plan/components/reactivate-plan-button";
import { UpgradePlanDialog } from "@/features/plan/components/upgrade-plan-dialog";
import { DowngradePlanDialog } from "@/features/plan/components/downgrade-plan-dialog";

type PlanDetailActionsProps = {
  plan: PlanResponse;
};

export function PlanDetailActions({ plan }: PlanDetailActionsProps) {
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isActive ? (
        <>
          <button
            type="button"
            disabled={anyPending}
            onClick={() => setUpgradeOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Icon icon={Icons.arrowUp} className="h-4 w-4" aria-hidden />
            Upgrade
          </button>
          <button
            type="button"
            disabled={anyPending}
            onClick={() => setDowngradeOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-orange-500/40 px-4 py-2.5 text-sm font-semibold text-orange-500 transition hover:bg-orange-500/10 focus:ring-2 focus:ring-orange-300/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Icon icon={Icons.arrowDown} className="h-4 w-4" aria-hidden />
            Downgrade
          </button>
          <button
            type="button"
            disabled={anyPending}
            onClick={() => setSuspendOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 px-4 py-2.5 text-sm font-semibold text-amber-500 transition hover:bg-amber-500/10 focus:ring-2 focus:ring-amber-300/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Icon icon={Icons.alertTriangle} className="h-4 w-4" aria-hidden />
            Suspender
          </button>
          <button
            type="button"
            disabled={anyPending}
            onClick={() => setCancelOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 focus:ring-2 focus:ring-red-300/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Icon icon={Icons.x} className="h-4 w-4" aria-hidden />
            Cancelar
          </button>
        </>
      ) : null}

      {isSuspended ? (
        <>
          <ReactivatePlanButton
            isPending={reactivateMutation.isPending}
            onConfirm={() => {
              reactivateMutation.mutate(undefined, {
                onSuccess: refreshPage,
              });
            }}
          />
          <button
            type="button"
            disabled={anyPending}
            onClick={() => setCancelOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 focus:ring-2 focus:ring-red-300/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Icon icon={Icons.x} className="h-4 w-4" aria-hidden />
            Cancelar
          </button>
        </>
      ) : null}

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
    </div>
  );
}
