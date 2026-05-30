import { z } from "zod";

import {
  customerAddressSchema,
  customerContactSchema,
  customerIdentitySchema,
} from "@/features/customer/schemas/customer-form.schema";

export const editCustomerIdentitySchema = customerIdentitySchema;

export const editCustomerContactAddressSchema = customerContactSchema.and(
  z.object({
    address: customerAddressSchema.optional(),
  }),
);

export type EditCustomerIdentitySchema = z.infer<
  typeof editCustomerIdentitySchema
>;

export type EditCustomerContactAddressSchema = z.infer<
  typeof editCustomerContactAddressSchema
>;
