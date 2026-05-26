type PasswordRule = {
  label: string;
  test: (value: string) => boolean;
};

const PASSWORD_RULES: PasswordRule[] = [
  { label: "8 caracteres", test: (value) => value.length >= 8 },
  { label: "Maiúscula", test: (value) => /[A-Z]/.test(value) },
  { label: "Minúscula", test: (value) => /[a-z]/.test(value) },
  { label: "Número", test: (value) => /\d/.test(value) },
  { label: "Especial", test: (value) => /[@$!%*?&]/.test(value) },
];

export function PasswordStrength({ value }: { value: string }) {
  const score = PASSWORD_RULES.filter((rule) => rule.test(value)).length;
  const label = score <= 2 ? "Fraca" : score <= 4 ? "Média" : "Forte";
  const color =
    score <= 2 ? "bg-red-500" : score <= 4 ? "bg-amber-400" : "bg-emerald-500";

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="bg-muted h-2 overflow-hidden rounded-full">
        <div
          className={`${color} h-full rounded-full transition-all`}
          style={{ width: `${Math.max(score, 1) * 20}%` }}
        />
      </div>
      <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
        <span className="font-medium">Força: {label}</span>
        {PASSWORD_RULES.map((rule) => (
          <span
            key={rule.label}
            className={rule.test(value) ? "text-emerald-400" : undefined}
          >
            {rule.label}
          </span>
        ))}
      </div>
    </div>
  );
}
