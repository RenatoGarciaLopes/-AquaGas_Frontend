import { z } from "zod";

import {
  customerAddressSchema,
  customerContactSchema,
  customerIdentitySchema,
} from "@/features/customer/schemas/customer-form.schema";

export const createCustomerSchema = z
  .object({
    address: customerAddressSchema,
  })
  .and(customerContactSchema)
  .and(customerIdentitySchema);

export type CreateCustomerSchema = z.infer<typeof createCustomerSchema>;
