// User Validation Schemas - Linear Clone
import { z } from 'zod';
import { name, email } from './shared';

// User Schema
export const userSchema = z.object({
  name,
  email,
  avatarUrl: z.string().url().optional(),
  displayName: z.string().max(100).optional(),
});

// User Create Schema
export const userCreateSchema = z.object({
  name,
  email,
  avatarUrl: z.string().url().optional(),
  displayName: z.string().max(100).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

// User Update Schema
export const userUpdateSchema = z.object({
  name: name.optional(),
  email: email.optional(),
  avatarUrl: z.string().url().optional(),
  displayName: z.string().max(100).optional(),
});

// Type exports
export type UserInput = z.infer<typeof userSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>; 