type ExecContext = {
  container: {
    resolve: (key: string) => any
  }
}

export default async function ({ container }: ExecContext) {
  const email = process.env.ADMIN_EMAIL || "admin@myshop.local"
  const password = process.env.ADMIN_PASSWORD || "Admin123!Admin123!"

  const userModule = container.resolve("user")

  if (!userModule) {
    throw new Error('User module "user" not found in container.')
  }

  const payload: any = { email, password }
  const payloadWithRole: any = { ...payload, role: "admin" }

  const methods: Array<{ name: string; fn: () => Promise<any> }> = []

  if (typeof userModule.createUsers === "function") {
    methods.push({ name: "createUsers([payloadWithRole])", fn: () => userModule.createUsers([payloadWithRole]) })
    methods.push({ name: "createUsers([payload])", fn: () => userModule.createUsers([payload]) })
  }

  if (typeof userModule.createUser === "function") {
    methods.push({ name: "createUser(payloadWithRole)", fn: () => userModule.createUser(payloadWithRole) })
    methods.push({ name: "createUser(payload)", fn: () => userModule.createUser(payload) })
  }

  if (typeof userModule.create === "function") {
    methods.push({ name: "create(payloadWithRole)", fn: () => userModule.create(payloadWithRole) })
    methods.push({ name: "create(payload)", fn: () => userModule.create(payload) })
  }

  if (!methods.length) {
    console.log("Налични keys в user module:", Object.keys(userModule).sort())
    throw new Error("User module няма create методи (createUsers/createUser/create).")
  }

  for (const m of methods) {
    try {
      await m.fn()
      console.log(`✅ Admin user създаден (${m.name}): ${email}`)
      return
    } catch (e: any) {
      const msg = String(e?.message || e).toLowerCase()
      if (msg.includes("already") || msg.includes("exists") || msg.includes("duplicate") || msg.includes("unique")) {
        console.log(`ℹ️ Admin вероятно вече съществува: ${email}`)
        return
      }
      // пробваме следващия метод
    }
  }

  throw new Error("Не успях да създам user с наличните методи на user module.")
}
