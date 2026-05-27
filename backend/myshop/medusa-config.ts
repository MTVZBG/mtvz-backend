import { SITE_ASSETS_MODULE } from "./src/modules/site-assets"
import { CATEGORY_SEO_MODULE } from "./src/modules/category-seo"
import { loadEnv, defineConfig } from "@medusajs/framework/utils"

const nodeEnv = process.env.NODE_ENV || "development"

loadEnv(nodeEnv, process.cwd())

const UNSAFE_SECRET_VALUES = new Set([
  "supersecret",
  "change-me",
  "changeme",
  "replace-with-secure-random-value",
  "secret",
  "password",
  "jwt_secret",
  "cookie_secret",
])

const resolveHttpSecret = (envName: "JWT_SECRET" | "COOKIE_SECRET") => {
  const value = process.env[envName]?.trim()

  if (nodeEnv === "production") {
    if (!value) {
      throw new Error(`${envName} must be set in production.`)
    }

    if (UNSAFE_SECRET_VALUES.has(value.toLowerCase())) {
      throw new Error(
        `${envName} must be a secure random value in production, not a common unsafe default.`
      )
    }

    return value
  }

  return value || `development-${envName.toLowerCase().replace("_", "-")}`
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    workerMode: process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server",

    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: resolveHttpSecret("JWT_SECRET"),
      cookieSecret: resolveHttpSecret("COOKIE_SECRET"),
    },
  },

  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },

  modules: {
    eventBus: {
      resolve: "@medusajs/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    [SITE_ASSETS_MODULE]: {
      resolve: "./src/modules/site-assets",
    },
    [CATEGORY_SEO_MODULE]: {
      resolve: "./src/modules/category-seo",
    },
  },
})
