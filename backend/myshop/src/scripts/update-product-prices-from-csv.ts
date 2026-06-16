import fs from "fs"
import { upsertVariantPricesWorkflow } from "@medusajs/medusa/core-flows"

const CSV_PATH = "prices-import.csv"
const CURRENCY_CODE = "eur"

type ExecContext = {
  container: any
}

type CsvPriceRow = {
  sku: string
  price: number
}

type ProductWithVariants = {
  id: string
  handle: string
  title: string
  variants?: {
    id: string
    sku: string | null
    title: string
  }[]
}

type VariantMatch = {
  variantId: string
  productId: string
  sku: string
  productTitle: string
  productHandle: string
  variantTitle: string
  price: number
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"' && inQuotes && next === '"') {
      current += '"'
      i++
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

function readCsv(): CsvPriceRow[] {
  const content = fs.readFileSync(CSV_PATH, "utf8").replace(/^\uFEFF/, "")
  const lines = content.split(/\r?\n/).filter(Boolean)

  if (!lines.length) {
    throw new Error(`CSV file is empty: ${CSV_PATH}`)
  }

  const headers = parseCsvLine(lines[0])
  const expectedHeaders = ["Variant SKU", "Variant Price"]

  if (headers.join("|") !== expectedHeaders.join("|")) {
    throw new Error(
      `Invalid CSV headers.\nExpected: ${expectedHeaders.join(" | ")}\nReceived: ${headers.join(" | ")}`
    )
  }

  const seenSkus = new Set<string>()

  return lines.slice(1).map((line, index) => {
    const row = parseCsvLine(line)

    if (row.length !== expectedHeaders.length) {
      throw new Error(`Invalid column count on row ${index + 2}: expected ${expectedHeaders.length}, got ${row.length}`)
    }

    const sku = row[0]
    const rawPrice = row[1]
    const price = Number(rawPrice)

    if (!sku) {
      throw new Error(`Missing SKU on row ${index + 2}`)
    }

    if (!rawPrice) {
      throw new Error(`Missing price on row ${index + 2}`)
    }

    if (seenSkus.has(sku)) {
      throw new Error(`Duplicate SKU in CSV: ${sku}`)
    }

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error(`Invalid price on row ${index + 2}: ${row[1]}`)
    }

    seenSkus.add(sku)

    return {
      sku,
      price,
    }
  })
}

export default async function ({ container }: ExecContext) {
  const args = process.argv.slice(2)
  const shouldApply = args.includes("--apply")

  const productModule = container.resolve("product")
  const rows = readCsv()
  const rowsBySku = new Map(rows.map((row) => [row.sku, row]))

  const products = (await productModule.listProducts(
    {},
    {
      select: [
        "id",
        "handle",
        "title",
        "variants.id",
        "variants.sku",
        "variants.title",
      ],
      relations: ["variants"],
      take: 5000,
      order: { created_at: "DESC" },
    }
  )) as ProductWithVariants[]

  const variantsBySku = new Map<string, VariantMatch>()
  const duplicateExistingSkus = new Set<string>()

  for (const product of products) {
    for (const variant of product.variants || []) {
      if (!variant.sku) {
        continue
      }

      const row = rowsBySku.get(variant.sku)

      if (!row) {
        continue
      }

      if (variantsBySku.has(variant.sku)) {
        duplicateExistingSkus.add(variant.sku)
        continue
      }

      variantsBySku.set(variant.sku, {
        variantId: variant.id,
        productId: product.id,
        sku: variant.sku,
        productTitle: product.title,
        productHandle: product.handle,
        variantTitle: variant.title,
        price: row.price,
      })
    }
  }

  if (duplicateExistingSkus.size) {
    throw new Error(`Duplicate existing SKUs found in Medusa: ${Array.from(duplicateExistingSkus).join(", ")}`)
  }

  const missingSkus = rows
    .map((row) => row.sku)
    .filter((sku) => !variantsBySku.has(sku))

  console.log(`CSV rows: ${rows.length}`)
  console.log(`Matched variants: ${variantsBySku.size}`)
  console.log(`Missing SKUs: ${missingSkus.length}`)
  console.log(`Currency: ${CURRENCY_CODE}`)
  console.log(`Mode: ${shouldApply ? "APPLY" : "PREVIEW"}`)

  if (missingSkus.length) {
    console.log("Missing SKUs:")
    for (const sku of missingSkus) {
      console.log(`- ${sku}`)
    }

    throw new Error("Aborting because some SKUs from CSV do not exist in Medusa.")
  }

  const matches = Array.from(variantsBySku.values())

  for (const match of matches) {
    console.log(`${match.sku} | ${match.productHandle} | ${match.productTitle} | ${match.variantTitle} | ${match.price} ${CURRENCY_CODE}`)
  }

  if (!shouldApply) {
    console.log("PREVIEW ONLY. No prices were updated.")
    console.log("To update prices, run:")
    console.log("npx medusa exec ./src/scripts/update-product-prices-from-csv.ts --apply")
    return
  }

  const { result } = await upsertVariantPricesWorkflow(container).run({
    input: {
      variantPrices: matches.map((match) => ({
        variant_id: match.variantId,
        product_id: match.productId,
        prices: [
          {
            amount: match.price,
            currency_code: CURRENCY_CODE,
          },
        ],
      })),
      previousVariantIds: [],
    },
  })

  console.log(`Updated variant prices: ${matches.length}`)
  console.log(JSON.stringify(result, null, 2))
}
