/**
 * Regressão: campos do passo 1 do wizard de criar cliente apareciam todos
 * com ring vermelho ao avançar do passo 0, mesmo sem o usuário ter tocado
 * em nenhum deles.
 *
 * Causas conhecidas que esse suite trava:
 *   1) Bug do display de erro: `errors.X?.message` era lido direto, sem
 *      gatear por `isTouched || isSubmitted`. Resolver agora gatear via
 *      `getFieldState` + `formState.isSubmitted`.
 *   2) Enter num input do passo 0 disparava o submit implícito do <form>
 *      (handleSubmit → roda schema inteiro → marca isSubmitted=true → todos
 *      os campos do passo 1 acabavam visualmente em erro ao montar). Fix:
 *      onKeyDownCapture no form que chama `wizard.goNext()` quando Enter é
 *      pressionado fora do último passo.
 *
 * Os asserts olham pra `aria-invalid` (sinal semântico que o TextField emite
 * a partir do mesmo booleano que aplica o ring vermelho) e pra ausência das
 * mensagens de erro do schema zod (texto exato).
 */

import { it, vi, expect, describe, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/shared/api/client", () => ({ apiPost: vi.fn() }));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/shared/hooks/use-viacep-lookup", () => ({
  useViaCepLookup: () => ({
    error: null,
    lastCep: null,
    lookup: vi.fn(),
    reset: vi.fn(),
    status: "idle" as const,
  }),
}));

import { renderWithProviders } from "@/__tests__/test-utils";

import { CreateCustomerForm } from "@/features/customer/components/create-customer-form";

const VALID_CPF_MASKED = "529.982.247-25";

// Mensagens vindas do `createCustomerSchema` — se elas aparecerem na DOM
// quando não deveriam, o bug está de volta.
const STEP_1_ERROR_MESSAGES = [
  "Email é obrigatório.",
  "Informe um email válido.",
  "Telefone é obrigatório.",
  "Telefone deve ter 10 ou 11 dígitos.",
  "CEP é obrigatório.",
  "CEP deve ter 8 dígitos.",
  "Rua deve ter ao menos 3 caracteres.",
  "Número é obrigatório.",
  "Bairro deve ter ao menos 2 caracteres.",
  "Cidade deve ter ao menos 2 caracteres.",
] as const;

function getStep1Inputs() {
  return {
    cep: screen.getByLabelText(/cep/i),
    city: screen.getByLabelText(/cidade/i),
    complement: screen.getByLabelText(/complemento/i),
    email: screen.getByLabelText(/email/i),
    neighborhood: screen.getByLabelText(/bairro/i),
    number: screen.getByLabelText(/^número/i),
    phone: screen.getByLabelText(/telefone/i),
    street: screen.getByLabelText(/rua/i),
  };
}

function expectAllStep1Neutral() {
  const inputs = getStep1Inputs();
  for (const input of Object.values(inputs)) {
    expect(input).toHaveAttribute("aria-invalid", "false");
  }
  for (const message of STEP_1_ERROR_MESSAGES) {
    expect(screen.queryByText(message)).not.toBeInTheDocument();
  }
}

function fillStep0PFValid() {
  fireEvent.input(screen.getByLabelText(/nome/i), {
    target: { value: "Maria Silva" },
  });
  fireEvent.input(screen.getByLabelText(/^cpf/i), {
    target: { value: VALID_CPF_MASKED },
  });
}

describe("CreateCustomerForm — regressão do passo 1 com erros prematuros", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("avança do passo 0 válido para o passo 1 com TODOS os campos neutros", async () => {
    renderWithProviders(<CreateCustomerForm />);

    fillStep0PFValid();
    fireEvent.click(screen.getByRole("button", { name: /próximo/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    expectAllStep1Neutral();
  });

  it("Enter num input do passo 0 não submete o form (não revela erros do passo 1)", async () => {
    renderWithProviders(<CreateCustomerForm />);

    fillStep0PFValid();

    // Simula o usuário apertando Enter dentro do input do CPF (passo 0).
    // Antes do fix isso disparava o submit do <form>, marcava isSubmitted=true
    // e contaminava o passo 1 ao montar.
    fireEvent.keyDown(screen.getByLabelText(/^cpf/i), {
      key: "Enter",
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    expectAllStep1Neutral();
  });

  it("submit acidental no passo 0 não ativa erros visuais do wizard", async () => {
    const { container } = renderWithProviders(<CreateCustomerForm />);

    fireEvent.submit(container.querySelector("form") as HTMLFormElement);

    await waitFor(() => {
      expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    });

    expect(screen.getByLabelText(/nome/i)).toHaveAttribute(
      "aria-invalid",
      "false",
    );
    expect(screen.getByLabelText(/^cpf/i)).toHaveAttribute(
      "aria-invalid",
      "false",
    );
    expect(
      screen.queryByText(/nome deve ter ao menos 3 caracteres/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/documento é obrigatório/i),
    ).not.toBeInTheDocument();
  });

  it("erros só aparecem no campo individual após blur (semântica onTouched)", async () => {
    renderWithProviders(<CreateCustomerForm />);

    fillStep0PFValid();
    fireEvent.click(screen.getByRole("button", { name: /próximo/i }));
    await waitFor(() => screen.getByLabelText(/email/i));

    // Toca só no campo email (focus + blur sem digitar).
    const email = screen.getByLabelText(/email/i);
    fireEvent.focus(email);
    fireEvent.blur(email);

    // Email agora aparece como inválido; demais campos do passo 1 continuam neutros.
    await waitFor(() => {
      expect(email).toHaveAttribute("aria-invalid", "true");
    });

    const inputs = getStep1Inputs();
    const untouched = [
      inputs.phone,
      inputs.cep,
      inputs.street,
      inputs.number,
      inputs.neighborhood,
      inputs.city,
      inputs.complement,
    ];
    for (const input of untouched) {
      expect(input).toHaveAttribute("aria-invalid", "false");
    }
  });

  it("voltar para o passo 0 e avançar de novo mantém o passo 1 neutro", async () => {
    renderWithProviders(<CreateCustomerForm />);

    fillStep0PFValid();
    fireEvent.click(screen.getByRole("button", { name: /próximo/i }));
    await waitFor(() => screen.getByLabelText(/email/i));

    // Volta pro passo 0…
    fireEvent.click(screen.getByRole("button", { name: /voltar/i }));
    await waitFor(() => {
      expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    });

    // …e avança de novo.
    fireEvent.click(screen.getByRole("button", { name: /próximo/i }));
    await waitFor(() => screen.getByLabelText(/email/i));

    expectAllStep1Neutral();
  });

  it("apertar 'Salvar cliente' com passo 1 vazio revela todos os erros (UX esperada pós-submit)", async () => {
    renderWithProviders(<CreateCustomerForm />);

    fillStep0PFValid();
    fireEvent.click(screen.getByRole("button", { name: /próximo/i }));
    await waitFor(() => screen.getByLabelText(/email/i));

    fireEvent.click(screen.getByRole("button", { name: /salvar cliente/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    const inputs = getStep1Inputs();
    const required = [
      inputs.email,
      inputs.phone,
      inputs.cep,
      inputs.street,
      inputs.number,
      inputs.neighborhood,
      inputs.city,
    ];
    for (const input of required) {
      expect(input).toHaveAttribute("aria-invalid", "true");
    }
    // complement é optional — não pode virar inválido nem após submit.
    expect(inputs.complement).toHaveAttribute("aria-invalid", "false");
  });
});
