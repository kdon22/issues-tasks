// Shared Validation Primitives - Linear Clone
import { z } from 'zod';

// Common field validations
export const id = z.string().cuid();
export const name = z.string().min(1).max(100);
export const description = z.string().max(1000).optional();
export const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);

// Common enums
export const avatarType = z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE']);
export const priority = z.enum(['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const stateType = z.enum(['BACKLOG', 'UNSTARTED', 'STARTED', 'COMPLETED', 'CANCELED']);
export const workspaceRole = z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);
export const teamRole = z.enum(['LEAD', 'MEMBER', 'VIEWER']);
export const memberStatus = z.enum(['ACTIVE', 'INACTIVE', 'PENDING']);
export const projectStatus = z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELED']);

// Common identifier pattern
export const identifier = z.string().min(1).max(10).regex(/^[A-Z0-9]+$/);

// Common URL pattern
export const url = z.string().min(1).max(50).regex(/^[a-z0-9-]+$/);

// Common email validation
export const email = z.string().email();

// Common date transformations
export const dateTransform = z.string().optional().transform((val) => val ? new Date(val) : undefined);
export const requiredDate = z.string().transform((val) => new Date(val)); 