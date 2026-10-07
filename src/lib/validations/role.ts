import { z } from "zod";

export const updateRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters").max(60),
  permissions: z.array(z.string()),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
