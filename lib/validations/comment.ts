import { z } from 'zod';

export const commentCreateSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
  parentId: z.string().optional(), // For replies
});

export const commentUpdateSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
});

export type CommentCreateRequest = z.infer<typeof commentCreateSchema>;
export type CommentUpdateRequest = z.infer<typeof commentUpdateSchema>; 