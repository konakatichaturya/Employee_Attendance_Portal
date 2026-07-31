import { z } from 'zod';

export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^\+?[0-9\s-]{7,15}$/, 'Enter a valid phone number');
