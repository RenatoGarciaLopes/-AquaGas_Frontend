import http from "node:http";

const PORT = Number(process.env.MOCK_BACKEND_PORT ?? 45100);

function base64Url(input) {
  return Buffer.from(JSON.stringify(input)).toString("base64url");
}

function jwtForRole(role = "GERENTE", userName = "gerente") {
  const now = Math.floor(Date.now() / 1000);
  return [
    base64Url({ alg: "none", typ: "JWT" }),
    base64Url({
      exp: now + 3600,
      name: userName,
      role: role === "GERENTE" ? "Manager" : "Employee",
      unique_name: userName,
      userName,
    }),
    "signature",
  ].join(".");
}

function json(response, status, payload, headers = {}) {
  response.writeHead(status, {
    "content-type": "application/json",
    ...headers,
  });
  response.end(JSON.stringify(payload));
}

function ok(data) {
  return {
    data,
    error: null,
    success: true,
    timestamp: "2026-05-26T00:00:00.000Z",
  };
}

function fail(status, message, code = `HTTP_${status}`, details) {
  return {
    data: null,
    error: { code, details, message },
    success: false,
    timestamp: "2026-05-26T00:00:00.000Z",
  };
}

function readBody(request) {
  return new Promise((resolve) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      if (!body) return resolve(null);
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve(null);
      }
    });
  });
}

const products = [
  {
    id: "water-20l",
    name: "Água Mineral 20L",
    price: 12.5,
    quantity: 10,
    type: "Water",
  },
  {
    id: "gas-13kg",
    name: "Gás GLP 13kg",
    price: 110,
    quantity: 4,
    type: "Gas",
  },
];

const customers = [
  {
    address: {
      cep: "01001000",
      city: "São Paulo",
      complement: null,
      id: "address-1",
      neighborhood: "Sé",
      number: "100",
      street: "Praça da Sé",
    },
    createdAt: "2026-01-02T10:00:00.000Z",
    document: "52998224725",
    email: "maria@example.com",
    id: "customer-1",
    name: "Maria Silva",
    phone: "11999998888",
    typeDocument: "PF",
  },
  {
    address: {
      cep: "20040002",
      city: "Rio de Janeiro",
      complement: "Sala 1",
      id: "address-2",
      neighborhood: "Centro",
      number: "200",
      street: "Rua da Quitanda",
    },
    createdAt: "2026-01-03T10:00:00.000Z",
    document: "11222333000181",
    email: "empresa@example.com",
    id: "customer-2",
    name: "Mercado Central LTDA",
    phone: "2133334444",
    typeDocument: "PJ",
  },
];

const employees = [
  {
    employee: {
      cpf: "52998224725",
      email: "ana@example.com",
      id: "employee-1",
      name: "Ana Gerente",
      phone: "11988887777",
    },
    user: {
      id: "user-1",
      role: "Manager",
      userName: "gerente",
    },
  },
  {
    employee: {
      cpf: "39053344705",
      email: "bruno@example.com",
      id: "employee-2",
      name: "Bruno Funcionário",
      phone: "11977776666",
    },
    user: {
      id: "user-2",
      role: "Employee",
      userName: "funcionario",
    },
  },
];

const sales = [
  {
    createdAt: new Date().toISOString(),
    customer: customers[0],
    discount: 0,
    employee: { id: "employee-1", name: "Ana Gerente" },
    id: "sale-1",
    items: [
      { product: products[0], quantity: 2, subtotal: 25, unitPrice: 12.5 },
    ],
    status: "Finished",
    subtotal: 25,
    total: 25,
  },
];

const plans = [
  {
    billingDay: 10,
    billings: [
      {
        amount: 120,
        dueDate: "2026-06-10T00:00:00.000Z",
        id: "billing-1",
        paidAt: null,
        receivedBy: null,
        status: "Pending",
      },
    ],
    cycle: "Monthly",
    customerId: "customer-1",
    customerName: "Maria Silva",
    deliveries: [
      {
        deliveryDate: null,
        dueDate: "2026-06-05T00:00:00.000Z",
        id: "delivery-1",
        period: 1,
        status: "Pending",
      },
    ],
    deliveryDay: 5,
    discount: null,
    document: "52998224725",
    employeeId: "employee-1",
    employeeName: "Ana Gerente",
    endDate: "2026-12-31T00:00:00.000Z",
    id: "plan-1",
    items: [
      {
        productId: "water-20l",
        productName: "Água Mineral 20L",
        quantity: 2,
      },
    ],
    penalties: [
      {
        calculatedAmount: 30,
        cancelReason: null,
        canceledAt: null,
        canceledBy: null,
        dueDate: "2026-06-15T00:00:00.000Z",
        id: "penalty-1",
        notes: null,
        originalValue: 120,
        paidBy: null,
        paidDate: null,
        planId: "plan-1",
        remainingValue: 30,
        status: "PendingPayment",
        timestamp: "2026-05-20T12:00:00.000Z",
        type: "Downgrade",
        waiveReason: null,
        waivedAt: null,
        waivedBy: null,
      },
    ],
    startDate: "2026-01-01T00:00:00.000Z",
    status: "Active",
    total: 120,
    warning: null,
  },
];

const salesReport = {
  items: [
    {
      customer: { id: "customer-1", name: "Maria Silva" },
      date: "2026-05-20T12:00:00.000Z",
      employee: { id: "employee-1", name: "Ana Gerente" },
      id: "sale-1",
      items: [
        {
          productId: "water-20l",
          productName: "Água Mineral 20L",
          quantity: 2,
          subtotal: 25,
          unitPrice: 12.5,
        },
      ],
      itemsCount: 1,
      status: "FINISHED",
      total: 25,
      type: "SALE",
    },
    {
      customer: { id: "customer-1", name: "Maria Silva" },
      date: "2026-05-21T12:00:00.000Z",
      employee: { id: "employee-1", name: "Ana Gerente" },
      id: "plan-sale-1",
      items: [],
      itemsCount: 0,
      status: "CANCELLED",
      total: 120,
      type: "PLAN",
    },
  ],
  summary: {
    averageTicket: 25,
    cancelledSales: 1,
    period: {
      end: "2026-05-31T23:59:59.999Z",
      start: "2026-05-01T00:00:00.000Z",
    },
    totalContractSales: 120,
    totalRevenue: 25,
    totalSales: 1,
    totalSpotSales: 25,
  },
};

const stockMovementReport = {
  items: [
    {
      customer: null,
      date: "2026-05-20T12:00:00.000Z",
      employee: { id: "employee-1", name: "Ana Gerente" },
      id: "stock-entry-1",
      product: { id: "water-20l", name: "Água Mineral 20L" },
      quantity: 4,
      reason: "Reposição",
      reference: null,
      type: "Entry",
    },
    {
      customer: { id: "customer-1", name: "Maria Silva" },
      date: "2026-05-21T12:00:00.000Z",
      employee: { id: "employee-1", name: "Ana Gerente" },
      id: "stock-exit-1",
      product: { id: "water-20l", name: "Água Mineral 20L" },
      quantity: 2,
      reason: "Venda",
      reference: { id: "sale-1", type: "SALE" },
      type: "Exit",
    },
  ],
};

const penaltyReport = {
  items: [
    {
      audit: {
        canBeCanceled: true,
        canBePaid: true,
        canBeWaived: true,
      },
      createdBy: { id: "employee-1", name: "Ana Gerente" },
      customer: { id: "customer-1", name: "Maria Silva" },
      date: "2026-05-20T12:00:00.000Z",
      dueDate: "2026-06-15T00:00:00.000Z",
      financial: {
        calculatedValue: 30,
        originalValue: 120,
        remainingValue: 30,
      },
      id: "penalty-1",
      notes: null,
      origin: { id: "plan-1", type: "PLAN_DOWNGRADE" },
      paidAt: null,
      plan: { cycle: "MONTHLY", id: "plan-1", status: "ACTIVE" },
      resolvedBy: null,
      status: "PENDING_PAYMENT",
      type: "DOWNGRADE",
    },
  ],
  summary: {
    overdueAmount: 0,
    paidAmount: 0,
    pendingAmount: 30,
    totalPenalties: 1,
    waivedAmount: 0,
  },
};

function roleFromRequest(request) {
  const auth = request.headers.authorization ?? "";
  const token = auth.replace("Bearer ", "");
  const payload = token.split(".")[1];
  if (!payload) return "GERENTE";
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    return String(decoded.role).toLowerCase().includes("employee")
      ? "FUNCIONARIO"
      : "GERENTE";
  } catch {
    return "GERENTE";
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${PORT}`);

  if (request.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await readBody(request);
    if (body?.password === "wrong") {
      return json(response, 401, fail(401, "Usuário ou senha incorretos."));
    }
    const role = body?.userName === "funcionario" ? "FUNCIONARIO" : "GERENTE";
    const accessToken = jwtForRole(role, body?.userName ?? "gerente");
    return json(
      response,
      200,
      ok({
        accessToken,
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
        user: {
          role: role === "GERENTE" ? "Manager" : "Employee",
          userId: role === "GERENTE" ? "user-1" : "user-2",
          userName: body?.userName ?? "gerente",
        },
      }),
      {
        "set-cookie": `refreshToken=mock-refresh-${role}; Path=/; HttpOnly; SameSite=Lax; Expires=${new Date(Date.now() + 86400000).toUTCString()}`,
      },
    );
  }

  if (request.method === "POST" && url.pathname === "/api/auth/refresh") {
    const cookie = request.headers.cookie ?? "";
    if (!cookie.includes("refreshToken=")) {
      return json(response, 401, fail(401, "Sessão expirada."));
    }
    const role = cookie.includes("FUNCIONARIO") ? "FUNCIONARIO" : "GERENTE";
    return json(
      response,
      200,
      ok({
        accessToken: jwtForRole(
          role,
          role === "GERENTE" ? "gerente" : "funcionario",
        ),
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
      }),
      {
        "set-cookie": `refreshToken=mock-refresh-${role}; Path=/; HttpOnly; SameSite=Lax; Expires=${new Date(Date.now() + 86400000).toUTCString()}`,
      },
    );
  }

  if (request.method === "GET" && url.pathname === "/api/products") {
    if (url.searchParams.get("state") === "empty")
      return json(response, 200, ok([]));
    if (url.searchParams.get("state") === "error")
      return json(response, 500, fail(500, "Erro interno."));
    return json(response, 200, ok(products));
  }

  if (request.method === "POST" && url.pathname === "/api/products/register") {
    const body = await readBody(request);
    if (body?.name === "Duplicado") {
      return json(
        response,
        409,
        fail(409, "Produto já cadastrado.", "CONFLICT", [
          { field: "name", message: ["Produto já cadastrado."] },
        ]),
      );
    }
    if (roleFromRequest(request) !== "GERENTE") {
      return json(response, 403, fail(403, "Sem permissão."));
    }
    return json(
      response,
      200,
      ok({ ...products[0], id: "new-product", ...body }),
    );
  }

  if (request.method === "GET" && url.pathname === "/api/customers") {
    if (url.searchParams.get("state") === "empty")
      return json(response, 200, ok([]));
    return json(response, 200, ok(customers));
  }

  if (request.method === "POST" && url.pathname === "/api/customers/register") {
    const body = await readBody(request);
    if (body?.document === "52998224725") {
      return json(
        response,
        409,
        fail(409, "CPF já cadastrado.", "CONFLICT", [
          { field: "document", message: ["CPF já cadastrado."] },
        ]),
      );
    }
    return json(
      response,
      200,
      ok({ ...customers[0], id: "new-customer", ...body }),
    );
  }

  if (request.method === "GET" && url.pathname === "/api/employees") {
    return json(response, 200, ok(employees));
  }

  if (request.method === "GET" && url.pathname === "/api/sales") {
    return json(response, 200, ok(sales));
  }

  if (request.method === "GET" && url.pathname.startsWith("/api/sales/")) {
    const id = url.pathname.split("/").at(-1);
    const sale = sales.find((item) => item.id === id);
    if (!sale) return json(response, 404, fail(404, "Venda não encontrada."));
    return json(response, 200, ok(sale));
  }

  if (request.method === "POST" && url.pathname === "/api/sales/register") {
    const body = await readBody(request);
    const hasExcessQuantity = body?.saleItems?.some(
      (item) => item.quantity > 10,
    );
    if (hasExcessQuantity) {
      return json(
        response,
        409,
        fail(409, "Estoque insuficiente.", "INSUFFICIENT_STOCK"),
      );
    }
    if ((body?.discount ?? 0) > 0 && roleFromRequest(request) !== "GERENTE") {
      return json(
        response,
        403,
        fail(403, "Apenas gerentes podem aplicar desconto."),
      );
    }
    return json(response, 200, ok({ id: "sale-created" }));
  }

  if (
    request.method === "POST" &&
    url.pathname.match(/^\/api\/sales\/[^/]+\/cancel$/)
  ) {
    const body = await readBody(request);
    if (!body?.reason) {
      return json(
        response,
        400,
        fail(400, "Informe o motivo do cancelamento.", "VALIDATION_ERROR", [
          { field: "reason", message: ["Informe o motivo do cancelamento."] },
        ]),
      );
    }
    return json(response, 200, ok({ id: "sale-1", status: "Canceled" }));
  }

  if (request.method === "GET" && url.pathname === "/api/plans") {
    return json(response, 200, ok(plans));
  }

  if (request.method === "GET" && url.pathname.match(/^\/api\/plans\/[^/]+$/)) {
    const id = url.pathname.split("/").at(-1);
    const plan =
      plans.find((item) => item.id === id) ??
      (id === "plan-created" ? { ...plans[0], id } : null);
    if (!plan) return json(response, 404, fail(404, "Plano não encontrado."));
    return json(response, 200, ok(plan));
  }

  if (
    request.method === "POST" &&
    (url.pathname === "/api/plans" || url.pathname === "/api/plans/register")
  ) {
    const body = await readBody(request);
    const hasExcessQuantity = body?.items?.some((item) => item.quantity > 10);
    if (hasExcessQuantity) {
      return json(
        response,
        409,
        fail(409, "Estoque insuficiente.", "INSUFFICIENT_STOCK", [
          { field: "items", message: ["Estoque insuficiente."] },
        ]),
      );
    }
    return json(response, 200, ok({ ...plans[0], id: "plan-created" }));
  }

  if (
    request.method === "PATCH" &&
    url.pathname.match(/^\/api\/plans\/[^/]+\/upgrade$/)
  ) {
    return json(response, 200, ok({ plan: { ...plans[0], total: 145 } }));
  }

  if (
    request.method === "PATCH" &&
    url.pathname.match(/^\/api\/plans\/[^/]+\/downgrade$/)
  ) {
    const body = await readBody(request);
    if (!body?.reason) {
      return json(
        response,
        400,
        fail(400, "Informe o motivo do downgrade.", "VALIDATION_ERROR", [
          { field: "reason", message: ["Informe o motivo do downgrade."] },
        ]),
      );
    }
    return json(
      response,
      200,
      ok({ penalty: plans[0].penalties[0], plan: { ...plans[0], total: 95 } }),
    );
  }

  if (
    request.method === "PATCH" &&
    url.pathname.match(/^\/api\/plans\/[^/]+\/suspend$/)
  ) {
    return json(
      response,
      200,
      ok({ plan: { ...plans[0], status: "Suspended" } }),
    );
  }

  if (
    request.method === "PATCH" &&
    url.pathname.match(/^\/api\/plans\/[^/]+\/reactivate$/)
  ) {
    return json(response, 200, ok({ plan: { ...plans[0], status: "Active" } }));
  }

  if (
    request.method === "PATCH" &&
    url.pathname.match(/^\/api\/plans\/[^/]+\/cancel$/)
  ) {
    return json(
      response,
      200,
      ok({ plan: { ...plans[0], status: "Canceled" } }),
    );
  }

  if (
    request.method === "PATCH" &&
    url.pathname === "/api/plans/confirm-delivery"
  ) {
    return json(response, 200, ok({ deliveryId: "delivery-1" }));
  }

  if (
    request.method === "PATCH" &&
    url.pathname === "/api/plans/cancel-delivery"
  ) {
    return json(response, 200, ok({ deliveryId: "delivery-1" }));
  }

  if (
    request.method === "PATCH" &&
    url.pathname === "/api/plans/reschedule-delivery"
  ) {
    return json(response, 200, ok({ deliveryId: "delivery-1" }));
  }

  if (
    request.method === "PATCH" &&
    url.pathname === "/api/plans/confirm-billing-payment"
  ) {
    return json(response, 200, ok({ billingId: "billing-1" }));
  }

  if (
    request.method === "PATCH" &&
    url.pathname.match(/^\/api\/penalties\/[^/]+\/confirm-payment$/)
  ) {
    return json(response, 200, ok({ penaltyId: "penalty-1" }));
  }

  if (
    request.method === "PATCH" &&
    url.pathname.match(/^\/api\/penalties\/[^/]+\/waive$/)
  ) {
    return json(response, 200, ok({ penaltyId: "penalty-1" }));
  }

  if (
    request.method === "PATCH" &&
    url.pathname.match(/^\/api\/penalties\/[^/]+\/cancel$/)
  ) {
    return json(response, 200, ok({ penaltyId: "penalty-1" }));
  }

  if (request.method === "GET" && url.pathname === "/api/reports/sales") {
    return json(response, 200, ok(salesReport));
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/reports/stock-movements"
  ) {
    return json(response, 200, ok(stockMovementReport));
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/reports/contract-penalties"
  ) {
    return json(response, 200, ok(penaltyReport));
  }

  return json(
    response,
    404,
    fail(404, `Mock sem rota para ${request.method} ${url.pathname}`),
  );
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Mock backend listening on http://127.0.0.1:${PORT}`);
});
