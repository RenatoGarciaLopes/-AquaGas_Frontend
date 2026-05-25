type EmployeeStatusBadgeProps = {
  isActive?: boolean;
};

export function EmployeeStatusBadge({ isActive }: EmployeeStatusBadgeProps) {
  const active = isActive !== false;

  if (active) {
    return (
      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
        Ativo
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-500">
      Inativo
    </span>
  );
}
