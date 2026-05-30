import { it, vi, expect, describe, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/shared/api/client", () => ({
  apiPost: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// useViaCepLookup faz fetch externo — neste suite o usuário preenche endereço
// manualmente, então stubamos pra evitar disparar fetch durante o submit.
vi.mock("@/shared/hooks/use-viacep-lookup", () => ({
  useViaCepLookup: () => ({
    error: null,
    lastCep: null,
    lookup: vi.fn(),
    reset: vi.fn(),
    status: "idle" as const,
  }),
}));

import { apiPost } from "@/shared/api/client";
import { ApiError } from "@/shared/api/errors";
import { renderWithProviders } from "@/__tests__/test-utils";

import { CreateCustomerForm } from "@/features/customer/components/create-customer-form";

const apiPostMock = vi.mocked(apiPost);

const VALID_CPF_MASKED = "529.982.247-25";
const VALID_CPF_DIGITS = "52998224725";

function fillStep0PF() {
  // Tipo PF já vem selecionado por defaultValues.
  fireEvent.input(screen.getByLabelText(/nome/i), {
    target: { value: "Maria Silva" },
  });
  fireEvent.input(screen.getByLabelText(/^cpf/i), {
    target: { value: VALID_CPF_MASKED },
  });
}

function fillStep1Manually() {
  fireEvent.input(screen.getByLabelText(/email/i), {
    target: { value: "cliente@example.com" },
  });
  fireEvent.input(screen.getByLabelText(/telefone/i), {
    target: { value: "(11) 99999-8888" },
  });
  fireEvent.input(screen.getByLabelText(/cep/i), {
    target: { value: "12345-678" },
  });
  fireEvent.input(screen.getByLabelText(/rua/i), {
    target: { value: "Rua das Águas" },
  });
  fireEvent.input(screen.getByLabelText(/^número/i), {
    target: { value: "123" },
  });
  fireEvent.input(screen.getByLabelText(/bairro/i), {
    target: { value: "Centro" },
  });
  fireEvent.input(screen.getByLabelText(/cidade/i), {
    target: { value: "São Paulo" },
  });
}

function clickProximo() {
  fireEvent.click(screen.getByRole("button", { name: /próximo/i }));
}

describe("CreateCustomerForm", () => {
  beforeEach(() => {
    apiPostMock.mockReset();
  });

  describe("render inicial (passo 0)", () => {
    it("monta com Tipo, Nome e CPF (PF default), sem erros visíveis", () => {
      renderWithProviders(<CreateCustomerForm />);

      // PF está pré-selecionado, então o documento é CPF.
      expect(screen.getByLabelText(/^cpf/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();

      // Nenhum input está marcado como inválido inicialmente.
      const nameInput = screen.getByLabelText(/nome/i);
      expect(nameInput).toHaveAttribute("aria-invalid", "false");
    });

    it("alterna PF → PJ atualiza label e máscara do documento", () => {
      renderWithProviders(<CreateCustomerForm />);

      fireEvent.click(screen.getByRole("button", { name: /pessoa jurídica/i }));

      expect(screen.getByLabelText(/^cnpj/i)).toBeInTheDocument();
      // CPF não deve mais aparecer como label.
      expect(screen.queryByLabelText(/^cpf/i)).not.toBeInTheDocument();
    });
  });

  describe("navegação do wizard", () => {
    it("avança para o passo 1 quando o passo 0 está válido — sem erros prematuros", async () => {
      renderWithProviders(<CreateCustomerForm />);

      fillStep0PF();
      clickProximo();

      // Campos do passo 1 aparecem ao avançar.
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Regressão do bug das rings vermelhas: nenhum campo do passo 1
      // pode estar marcado como inválido sem o usuário ter tocado.
      const step1Inputs = [
        screen.getByLabelText(/email/i),
        screen.getByLabelText(/telefone/i),
        screen.getByLabelText(/cep/i),
        screen.getByLabelText(/rua/i),
        screen.getByLabelText(/^número/i),
        screen.getByLabelText(/bairro/i),
        screen.getByLabelText(/cidade/i),
      ];
      for (const input of step1Inputs) {
        expect(input).toHaveAttribute("aria-invalid", "false");
      }
    });

    it("bloqueia avanço quando passo 0 está vazio sem revelar erros visuais", async () => {
      renderWithProviders(<CreateCustomerForm />);

      clickProximo();

      // Continua no passo 0 (header do passo 1 não monta).
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
  });

  describe("submit final", () => {
    it("chama apiPost com /api/customers e payload digits-only", async () => {
      apiPostMock.mockResolvedValueOnce({
        data: { id: "new-id" },
        error: null,
        success: true,
        timestamp: "2026-05-23T00:00:00.000Z",
      });

      renderWithProviders(<CreateCustomerForm />);

      fillStep0PF();
      clickProximo();
      await waitFor(() => screen.getByLabelText(/email/i));

      fillStep1Manually();

      fireEvent.click(screen.getByRole("button", { name: /salvar cliente/i }));

      await waitFor(() => {
        expect(apiPostMock).toHaveBeenCalledTimes(1);
      });

      const [path, payload] = apiPostMock.mock.calls[0];
      expect(path).toBe("/api/customers");
      expect(payload).toMatchObject({
        address: {
          cep: "12345678",
          city: "São Paulo",
          complement: null,
          neighborhood: "Centro",
          number: "123",
          street: "Rua das Águas",
        },
        document: VALID_CPF_DIGITS,
        email: "cliente@example.com",
        name: "Maria Silva",
        phone: "11999998888",
      });
    });

    it("exibe erro no campo document quando backend retorna 409 com fieldErrors", async () => {
      apiPostMock.mockRejectedValueOnce(
        new ApiError({
          fieldErrors: { cpf: ["CPF já cadastrado."] },
          message: "Conflict.",
          status: 409,
        }),
      );

      renderWithProviders(<CreateCustomerForm />);

      fillStep0PF();
      clickProximo();
      await waitFor(() => screen.getByLabelText(/email/i));

      fillStep1Manually();
      fireEvent.click(screen.getByRole("button", { name: /salvar cliente/i }));

      // wizard.jumpToFieldError pula de volta pra step 0 (document é step 0).
      await waitFor(() => {
        expect(screen.getByText(/cpf já cadastrado/i)).toBeInTheDocument();
      });
    });
  });
});
