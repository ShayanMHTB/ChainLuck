import { z } from 'zod'

const envSchema = z.object({
  VITE_WALLETCONNECT_PROJECT_ID: z.string().default(''),
  VITE_RPC_URL_SEPOLIA: z.string().optional(),
  VITE_RPC_URL_POLYGON_AMOY: z.string().optional(),
  VITE_CONTRACT_ADDRESS: z.string().optional(),
  VITE_SUPABASE_URL: z.string().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().optional(),
})

export const env = envSchema.parse(import.meta.env)
