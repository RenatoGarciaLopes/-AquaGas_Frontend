import { http, HttpResponse } from "msw";

import {
  plan,
  product,
  customer,
  apiSuccess,
  sessionUser,
  salesReport,
  penaltyReport,
  stockMovementReport,
} from "@/__tests__/mocks/builders";

export const handlers = [
  http.get("/api/auth/session", () =>
    HttpResponse.json({ expiresAt: null, user: sessionUser() }),
  ),
  http.post("/api/auth/login", () => HttpResponse.json(apiSuccess(null))),
  http.post("/api/auth/logout", () => HttpResponse.json({ success: true })),
  http.post("/api/auth/refresh", () => HttpResponse.json({ success: true })),
  http.get("/api/products", () => HttpResponse.json(apiSuccess([product()]))),
  http.get("/api/products/:id", () => HttpResponse.json(apiSuccess(product()))),
  http.post("/api/products", async () =>
    HttpResponse.json(apiSuccess(product({ id: "new-product" }))),
  ),
  http.post("/api/products/register", async () =>
    HttpResponse.json(apiSuccess(product({ id: "new-product" }))),
  ),
  http.patch("/api/products/:id", async () =>
    HttpResponse.json(apiSuccess(product())),
  ),
  http.patch("/api/products/:id/stock", async () =>
    HttpResponse.json(apiSuccess(product({ quantity: 12 }))),
  ),
  http.get("/api/customers", () => HttpResponse.json(apiSuccess([customer()]))),
  http.get("/api/customers/:id", () =>
    HttpResponse.json(apiSuccess(customer())),
  ),
  http.post("/api/customers", async () =>
    HttpResponse.json(apiSuccess(customer({ id: "new-customer" }))),
  ),
  http.post("/api/customers/register", async () =>
    HttpResponse.json(apiSuccess(customer({ id: "new-customer" }))),
  ),
  http.post("/api/sales/register", () =>
    HttpResponse.json(
      apiSuccess({
        id: "sale-id",
      }),
    ),
  ),
  http.post("/api/sales/:id/cancel", () =>
    HttpResponse.json(
      apiSuccess({
        id: "sale-id",
        status: "Canceled",
      }),
    ),
  ),
  http.get("/api/plans", () => HttpResponse.json(apiSuccess([plan()]))),
  http.get("/api/plans/:id", ({ params }) =>
    HttpResponse.json(apiSuccess(plan({ id: String(params.id) }))),
  ),
  http.post("/api/plans", async () =>
    HttpResponse.json(apiSuccess(plan({ id: "new-plan" }))),
  ),
  http.patch("/api/plans/:id/upgrade", ({ params }) =>
    HttpResponse.json(
      apiSuccess({
        plan: plan({ id: String(params.id), total: 145 }),
      }),
    ),
  ),
  http.patch("/api/plans/:id/downgrade", ({ params }) =>
    HttpResponse.json(
      apiSuccess({
        penalty: plan().penalties[0],
        plan: plan({ id: String(params.id), total: 95 }),
      }),
    ),
  ),
  http.patch("/api/plans/:id/suspend", ({ params }) =>
    HttpResponse.json(
      apiSuccess({
        plan: plan({ id: String(params.id), status: "Suspended" }),
      }),
    ),
  ),
  http.patch("/api/plans/:id/reactivate", ({ params }) =>
    HttpResponse.json(
      apiSuccess({
        plan: plan({ id: String(params.id), status: "Active" }),
      }),
    ),
  ),
  http.patch("/api/plans/:id/cancel", ({ params }) =>
    HttpResponse.json(
      apiSuccess({
        plan: plan({ id: String(params.id), status: "Canceled" }),
      }),
    ),
  ),
  http.patch("/api/plans/confirm-delivery", () =>
    HttpResponse.json(
      apiSuccess({
        deliveryId: "delivery-id",
      }),
    ),
  ),
  http.patch("/api/plans/cancel-delivery", () =>
    HttpResponse.json(
      apiSuccess({
        deliveryId: "delivery-id",
      }),
    ),
  ),
  http.patch("/api/plans/reschedule-delivery", () =>
    HttpResponse.json(
      apiSuccess({
        deliveryId: "delivery-id",
      }),
    ),
  ),
  http.patch("/api/plans/confirm-billing-payment", () =>
    HttpResponse.json(
      apiSuccess({
        billingId: "billing-id",
      }),
    ),
  ),
  http.patch("/api/penalties/:id/confirm-payment", ({ params }) =>
    HttpResponse.json(
      apiSuccess({
        penaltyId: String(params.id),
      }),
    ),
  ),
  http.patch("/api/penalties/:id/waive", ({ params }) =>
    HttpResponse.json(
      apiSuccess({
        penaltyId: String(params.id),
      }),
    ),
  ),
  http.patch("/api/penalties/:id/cancel", ({ params }) =>
    HttpResponse.json(
      apiSuccess({
        penaltyId: String(params.id),
      }),
    ),
  ),
  http.get("/api/reports/sales", () =>
    HttpResponse.json(apiSuccess(salesReport())),
  ),
  http.get("/api/reports/stock-movements", () =>
    HttpResponse.json(apiSuccess(stockMovementReport())),
  ),
  http.get("/api/reports/contract-penalties", () =>
    HttpResponse.json(apiSuccess(penaltyReport())),
  ),
];
