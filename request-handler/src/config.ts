import 'dotenv/config'
import { z } from 'zod';

const envSchema = z.object({
    PORT: z.coerce.number().default(4003),
    AWS_REGION: z.string().min(1),
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    S3_BUCKET_NAME: z.string().min(1)
})

export const env = envSchema.parse(process.env);