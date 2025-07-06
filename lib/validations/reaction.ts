import { z } from 'zod';

export const reactionCreateSchema = z.object({
  emoji: z.string().min(1, 'Emoji is required').max(10, 'Emoji too long'),
});

export const reactionUpdateSchema = z.object({
  emoji: z.string().min(1, 'Emoji is required').max(10, 'Emoji too long').optional(),
});

export type ReactionCreateInput = z.infer<typeof reactionCreateSchema>;
export type ReactionUpdateInput = z.infer<typeof reactionUpdateSchema>; 