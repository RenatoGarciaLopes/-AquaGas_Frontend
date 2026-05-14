import { Icon } from "@iconify/react";

import { Icons } from "@/shared/lib/icons";

export function LoginBranding() {
  return (
    <section className="relative hidden overflow-hidden bg-[#071a35] px-14 py-16 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -left-24 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute top-24 right-8 h-28 w-28 rounded-full border border-cyan-300/20" />
        <div className="absolute bottom-6 left-20 h-56 w-56 rounded-full border border-white/10" />
        <div className="absolute right-12 bottom-10 h-44 w-44 rounded-full border border-cyan-400/10" />
      </div>

      <div className="relative z-10 mt-12">
        <div className="flex items-center gap-3">
          <Icon
            icon={Icons.droplets}
            className="h-12 w-12 text-cyan-400"
            style={{ color: "rgb(34 211 238)" }}
          />
          <div>
            <h1 className="text-5xl font-semibold tracking-tight">AquaGás</h1>
            <p className="mt-2 text-base text-slate-300">
              Distribuidora · Gestão Integrada
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mb-16 flex gap-10">
        <div className="space-y-1">
          <Icon icon={Icons.droplets} className="h-7 w-7 text-cyan-400" />
          <p className="text-2xl font-semibold">Água</p>
          <p className="text-sm text-slate-300">Distribuição</p>
        </div>
        <div className="space-y-1">
          <Icon icon={Icons.flame} className="h-7 w-7 text-orange-400" />
          <p className="text-2xl font-semibold">Gás</p>
          <p className="text-sm text-slate-300">Fornecimento</p>
        </div>
      </div>
    </section>
  );
}
