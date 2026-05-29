const FALLBACK = "Não foi possível concluir a operação. Tente novamente.";

// ── Status-level fallbacks ───────────────────────────────────────────────────

type ErrorContext =
  | "product"
  | "customer"
  | "employee"
  | "sale"
  | "plan"
  | "generic";

export function defaultMessageForStatus(
  status: number,
  context: ErrorContext = "generic",
): string {
  if (status === 403) return "Você não tem permissão para esta operação.";
  if (status >= 500) return "Erro interno do servidor. Tente novamente.";

  if (status === 404) {
    const labels: Record<ErrorContext, string> = {
      product: "Produto não encontrado.",
      customer: "Cliente não encontrado.",
      employee: "Funcionário não encontrado.",
      sale: "Venda não encontrada.",
      plan: "Plano não encontrado.",
      generic: "Recurso não encontrado.",
    };
    return labels[context];
  }

  if (status === 409) {
    const labels: Record<ErrorContext, string> = {
      product: "Já existe um produto ativo com esse nome.",
      customer: "Já existe um cliente com esse documento.",
      employee: "Conflito de dados do funcionário.",
      sale: "Estoque insuficiente para um ou mais produtos.",
      plan: "Operação não permitida no estado atual do plano.",
      generic: "Conflito de dados.",
    };
    return labels[context];
  }

  return FALLBACK;
}

// ── Field-level validation message translation ───────────────────────────────

const FIELD_MESSAGE_MAP: Record<string, string> = {
  // Auth / Employee
  "username cannot be empty": "Nome de usuário não pode ser vazio.",
  "username must be between 3 and 50 characters and contain only letters and numbers":
    "Nome de usuário deve ter entre 3 e 50 caracteres, apenas letras e números.",
  "username must be between 3 and 50 characters":
    "Nome de usuário deve ter entre 3 e 50 caracteres.",
  "password cannot be empty": "Senha não pode ser vazia.",
  "password is too weak. it must have at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character":
    "Senha muito fraca. Use pelo menos 8 caracteres, uma maiúscula, uma minúscula, um número e um caractere especial (!@#$%^&*).",
  "role is invalid. allowed: manager, employee":
    "Perfil inválido. Permitidos: Gerente, Funcionário.",
  "name is required": "Nome é obrigatório.",
  "name cannot be empty": "Nome não pode ser vazio.",
  "cpf cannot be empty": "CPF não pode ser vazio.",
  "invalid cpf": "CPF inválido.",
  "invalid phone": "Telefone inválido.",
  "phone cannot be empty": "Telefone não pode ser vazio.",
  "invalid email": "E-mail inválido.",
  "email cannot be empty": "E-mail não pode ser vazio.",

  // Product
  "product name is required": "Nome do produto é obrigatório.",
  "product name must have at least 3 characters":
    "Nome do produto deve ter pelo menos 3 caracteres.",
  "typeproduct is required": "Tipo de produto é obrigatório.",
  "type of product is invalid. allowed: water, gas":
    "Tipo de produto inválido. Permitidos: Água, Gás.",
  "price must be greater than zero": "Preço deve ser maior que zero.",
  "stock quantity cannot be negative":
    "Quantidade em estoque não pode ser negativa.",
  "increase amount must be greater than zero":
    "Quantidade de entrada deve ser maior que zero.",
  "decrease amount must be greater than zero":
    "Quantidade de saída deve ser maior que zero.",
  "at least one field must be provided": "Informe pelo menos um campo.",

  // Customer
  "cpf already registered": "CPF já cadastrado.",
  "cnpj cannot be empty": "CNPJ não pode ser vazio.",
  "invalid cnpj": "CNPJ inválido.",
  "document is required": "Documento é obrigatório.",
  "invalid document": "Documento inválido.",
  "type of document is invalid. allowed: pf, pj":
    "Tipo de documento inválido. Permitidos: PF, PJ.",
  "address is required": "Endereço é obrigatório.",
  "addressid is required and must be valid": "ID do endereço inválido.",
  "cep cannot be empty": "CEP não pode ser vazio.",
  "invalid cep": "CEP inválido.",
  "number cannot be empty": "Número não pode ser vazio.",
  "number too long": "Número do endereço é muito longo.",
  "complement too long": "Complemento é muito longo.",

  // Sale / Plan
  "discount cannot be greater than 100":
    "Desconto não pode ser maior que 100%.",
  "discount must be greater than 0": "Desconto deve ser maior que 0%.",
  "duration in months is required for a custom cycle":
    "Duração em meses é obrigatória para ciclo personalizado.",
  "number of billings must be greater than zero":
    "Número de cobranças deve ser maior que zero.",
  "at least one change must be informed": "Informe pelo menos uma alteração.",

  // Penalty
  "the waiver period for this penalty has expired":
    "O período para dispensa desta multa expirou.",
  "this penalty can no longer be paid because it exceeds the allowed payment period":
    "Esta multa não pode mais ser paga — período de pagamento encerrado.",
  "this penalty is too old to be canceled":
    "Esta multa é antiga demais para ser cancelada.",
  "cannot confirm payment for a zero amount penalty":
    "Não é possível confirmar pagamento de uma multa com valor zero.",
};

export function translateFieldMessage(backendMessage: string): string {
  return FIELD_MESSAGE_MAP[backendMessage.toLowerCase()] ?? backendMessage;
}

// ── Conflict message translation ─────────────────────────────────────────────

const CONFLICT_MESSAGE_MAP: Record<string, string> = {
  // Product
  "product with this name already exists":
    "Já existe um produto com esse nome.",
  "product still in stock": "Produto ainda possui estoque.",
  "cannot change product type while stock exists":
    "Não é possível alterar o tipo enquanto houver estoque.",

  // Employee / User
  "user name already registered": "Nome de usuário já cadastrado.",
  "username already registered": "Nome de usuário já cadastrado.",
  "email already registered": "E-mail já cadastrado.",
  "you cannot deactivate your own account":
    "Você não pode desativar sua própria conta.",

  // Delivery
  "delivery already completed": "Entrega já concluída.",
  "delivery is already canceled": "Entrega já cancelada.",
  "only canceled deliveries can be rescheduled":
    "Apenas entregas canceladas podem ser reagendadas.",
  "cannot cancel a delivery that has already been delivered":
    "Não é possível cancelar uma entrega já realizada.",
  "cannot confirm a canceled delivery":
    "Não é possível confirmar uma entrega cancelada.",
  "cannot cancel past deliveries": "Não é possível cancelar entregas passadas.",

  // Billing
  "billing already paid": "Cobrança já paga.",

  // Penalty
  "penalty is already paid": "Multa já paga.",
  "penalty is already waived": "Multa já dispensada.",
  "penalty is already canceled": "Multa já cancelada.",
  "penalty is already paid and cannot be canceled":
    "Multa paga não pode ser cancelada.",
  "penalty is already paid and cannot be waived":
    "Multa paga não pode ser dispensada.",
  "penalty is already waived and cannot be canceled":
    "Multa dispensada não pode ser cancelada.",
  "penalty is waived and cannot be paid": "Multa dispensada não pode ser paga.",
  "cancelled penalties cannot be paid":
    "Multas canceladas não podem ser pagas.",
  "cancelled penalties cannot be waived":
    "Multas canceladas não podem ser dispensadas.",

  // Plan — cancel
  "cannot cancel a finished plan":
    "Não é possível cancelar um plano finalizado.",
  "cannot cancel a canceled plan": "O plano já está cancelado.",
  "cannot cancel plan while there is an open penalty. please pay or waive the penalty first":
    "Cancele ou quite a multa em aberto antes de cancelar o plano.",
  "cannot cancel a plan awaiting closure. resolve pending financial or operational items first":
    "Não é possível cancelar: resolva os itens financeiros ou operacionais pendentes primeiro.",

  // Plan — upgrade
  "cannot upgrade a canceled plan":
    "Não é possível fazer upgrade de um plano cancelado.",
  "cannot upgrade a finished plan":
    "Não é possível fazer upgrade de um plano finalizado.",
  "cannot upgrade a suspended plan. reactivate it first":
    "Reative o plano suspenso antes de fazer upgrade.",
  "cannot upgrade a plan awaiting closure. resolve pending financial or operational items first":
    "Não é possível fazer upgrade: resolva os itens pendentes primeiro.",
  "cannot upgrade plan with a pending delivery scheduled for today":
    "Upgrade bloqueado: há entrega pendente agendada para hoje.",
  "cannot upgrade plan with billings overdue for more than 15 days":
    "Upgrade bloqueado: cobranças vencidas há mais de 15 dias.",
  "cannot upgrade plan with pending or overdue penalties":
    "Upgrade bloqueado: existem multas pendentes ou vencidas.",
  "cannot upgrade plan: all billings are already paid":
    "Upgrade bloqueado: todas as cobranças já foram pagas.",
  "new total must be greater than the current total for an upgrade":
    "O novo valor total deve ser maior que o atual para um upgrade.",

  // Plan — downgrade
  "cannot downgrade a canceled plan":
    "Não é possível fazer downgrade de um plano cancelado.",
  "cannot downgrade a finished plan":
    "Não é possível fazer downgrade de um plano finalizado.",
  "cannot downgrade a suspended plan. reactivate it first":
    "Reative o plano suspenso antes de fazer downgrade.",
  "cannot downgrade a plan awaiting closure. resolve pending financial or operational items first":
    "Não é possível fazer downgrade: resolva os itens pendentes primeiro.",
  "cannot downgrade plan with a pending delivery scheduled for today":
    "Downgrade bloqueado: há entrega pendente agendada para hoje.",
  "cannot downgrade plan with billings overdue for more than 15 days":
    "Downgrade bloqueado: cobranças vencidas há mais de 15 dias.",
  "cannot downgrade plan with pending or overdue penalties":
    "Downgrade bloqueado: existem multas pendentes ou vencidas.",
  "cannot downgrade plan: all billings are already paid":
    "Downgrade bloqueado: todas as cobranças já foram pagas.",
  "cannot downgrade plan: there are no future unpaid billings left to recalculate":
    "Downgrade bloqueado: não há cobranças futuras não pagas para recalcular.",
  "the new cycle or duration must reduce the contract duration for a downgrade":
    "O novo ciclo deve reduzir a duração do contrato para um downgrade.",
  "cannot reduce plan duration below periods that are already billed or overdue":
    "Não é possível reduzir abaixo dos períodos já cobrados ou vencidos.",
  "cannot reduce plan duration below periods that are already paid or delivered":
    "Não é possível reduzir abaixo dos períodos já pagos ou entregues.",
  "cannot reduce plan duration below periods that are already scheduled in the current timeline":
    "Não é possível reduzir abaixo dos períodos já agendados no cronograma.",
  "cannot downgrade plan because future billing and delivery periods are inconsistent":
    "Downgrade bloqueado: períodos de cobrança e entrega futuros estão inconsistentes.",
  "cannot downgrade plan because the generated penalty amount would be zero or negative":
    "Downgrade bloqueado: o valor da multa gerada seria zero ou negativo.",
  "cannot downgrade plan because there is no real reduction in contract value":
    "Downgrade bloqueado: não há redução real no valor do contrato.",
  "cannot downgrade plan by removing all items. cancel the plan instead":
    "Não é possível remover todos os itens em um downgrade. Cancele o plano.",

  // Plan — item restrictions
  "downgrade of quantity for product is not allowed in this endpoint":
    "Redução de quantidade não é permitida neste endpoint de downgrade.",

  // Plan — reactivation
  "cannot reactivate plan while there are overdue billings. please pay them first":
    "Pague as cobranças vencidas antes de reativar o plano.",
  "cannot reactivate plan while there is an open penalty. please pay or waive the penalty first":
    "Quite ou dispense a multa em aberto antes de reativar o plano.",
};

export function translateConflictMessage(backendMessage: string): string {
  // Dynamic: "Cannot cancel a plan in {status} status"
  const cancelStatusMatch = backendMessage
    .toLowerCase()
    .match(/^cannot cancel a plan in (.+) status$/);
  if (cancelStatusMatch) {
    return `Não é possível cancelar um plano no status "${cancelStatusMatch[1]}".`;
  }

  // Dynamic: "Customer has {n} overdue payments. Do you want to proceed anyway?"
  const overdueMatch = backendMessage
    .toLowerCase()
    .match(/^customer has (\d+) overdue payments/);
  if (overdueMatch) {
    return `Cliente possui ${overdueMatch[1]} pagamento(s) em atraso. Deseja prosseguir mesmo assim?`;
  }

  // Dynamic: "Cannot include new product {id} in downgrade endpoint"
  if (backendMessage.toLowerCase().startsWith("cannot include new product")) {
    return "Não é possível incluir novos produtos em um downgrade.";
  }

  // Dynamic: "Cannot increase quantity for product {id} in downgrade endpoint"
  if (
    backendMessage
      .toLowerCase()
      .startsWith("cannot increase quantity for product")
  ) {
    return "Não é possível aumentar a quantidade de um produto em um downgrade.";
  }

  // Dynamic: "Product {name} is not active"
  const inactiveProductMatch = backendMessage
    .toLowerCase()
    .match(/^product (.+) is not active$/);
  if (inactiveProductMatch) {
    return `O produto "${inactiveProductMatch[1]}" está inativo.`;
  }

  // Dynamic: "Insufficient stock for product '{name}'..."
  if (
    backendMessage.toLowerCase().startsWith("insufficient stock for product")
  ) {
    return backendMessage;
  }

  return CONFLICT_MESSAGE_MAP[backendMessage.toLowerCase()] ?? backendMessage;
}
