import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // NextAuth.js
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  
  // File Upload
  UPLOAD_DIR: z.string().default('./public/uploads'),
  MAX_FILE_SIZE: z.string().transform(Number).default('5242880'), // 5MB
  
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
