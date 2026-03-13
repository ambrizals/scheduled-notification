import z from 'zod';

export const firebaseSchema = z.object({
  FIREBASE_PRIVATE_KEY: z.string().optional(),
});
