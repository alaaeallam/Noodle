// apps/admin/lib/config/index.ts
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5050';

export const GRAPHQL_URL = `${SERVER_URL}/graphql`;

// a single place to control where the JWT lives
export const TOKEN_STORAGE_KEY = 'admin.jwt';

// re-export icon config (keeps your existing import sites working)
export * from './icons';