type ExecContext = {
  container: any
}

export default async function ({ container }: ExecContext) {
  // many containers expose "registrations" or "cradle" / "awilix" internals
  const keys: string[] = []

  const candidates = [
    container?.registrations,
    container?._registrations,
    container?.cradle,
    container?._cradle,
  ]

  for (const c of candidates) {
    if (!c) continue
    if (typeof c === "object") {
      keys.push(...Object.keys(c))
    }
  }

  // awilix style
  if (container?.container?.registrations) {
    keys.push(...Object.keys(container.container.registrations))
  }

  // fallback: try to find something via resolveable names we suspect
  const guesses = [
    "authModuleService",
    "authService",
    "authProviderService",
    "userModuleService",
    "userService",
    "adminService",
    "identityService",
    "apiKeyModuleService",
  ]

  const resolved: Record<string, boolean> = {}
  for (const g of guesses) {
    try {
      container.resolve(g)
      resolved[g] = true
    } catch {
      resolved[g] = false
    }
  }

  const uniq = Array.from(new Set(keys)).sort()

  console.log("=== registrations keys (sample) ===")
  console.log(uniq.slice(0, 200))
  console.log("Total keys found:", uniq.length)
  console.log("=== resolve guesses ===")
  console.log(resolved)
}
