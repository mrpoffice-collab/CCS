import { neon, NeonQueryFunction } from '@neondatabase/serverless'
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http'
import * as schema from './schema'

let _db: NeonHttpDatabase<typeof schema> | null = null

export function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set')
    }
    const sql = neon(process.env.DATABASE_URL)
    // @ts-expect-error - Type mismatch between neon versions
    _db = drizzle(sql, { schema })
  }
  return _db
}

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(target, prop) {
    return getDb()[prop as keyof NeonHttpDatabase<typeof schema>]
  }
})

export * from './schema'
