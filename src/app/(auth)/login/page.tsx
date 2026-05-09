import { LoginForm } from "@/features/auth/components/login-form";
import { LoginBranding } from "@/features/auth/components/login-branding";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : {};
  const sessionExpired = params.expired === "1";

  return (
    <main className="grid min-h-screen bg-[var(--background)] lg:grid-cols-[1.35fr_1fr]">
      <LoginBranding />
      <LoginForm sessionExpired={sessionExpired} />
    </main>
  );
}
