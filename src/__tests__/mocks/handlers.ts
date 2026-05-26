import { http, HttpResponse } from "msw";

import {
  apiSuccess,
  customer,
  product,
  sessionUser,
} from "@/__tests__/mocks/builders";

export const handlers = [
  http.get("/api/auth/session", () =>
    HttpResponse.json({ expiresAt: null, user: sessionUser() }),
  ),
  http.post("/api/auth/login", () => HttpResponse.json(apiSuccess(null))),
  http.post("/api/auth/logout", () => HttpResponse.json({ success: true })),
  http.post("/api/auth/refresh", () => HttpResponse.json({ success: true })),
  http.get("/api/products", () => HttpResponse.json(apiSuccess([product()]))),
  http.post("/api/products", async () =>
    HttpResponse.json(apiSuccess(product({ id: "new-product" }))),
  ),
  http.get("/api/customers", () => HttpResponse.json(apiSuccess([customer()]))),
  http.post("/api/customers", async () =>
    HttpResponse.json(apiSuccess(customer({ id: "new-customer" }))),
  ),
  http.post("/api/sales/register", () =>
    HttpResponse.json(
      apiSuccess({
        id: "sale-id",
      }),
    ),
  ),
];
