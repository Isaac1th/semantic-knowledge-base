import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  content: z.string().min(1, "content is required"),
  category: z.string().trim().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export const updateDocumentSchema = createDocumentSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "at least one field must be provided" },
);

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
