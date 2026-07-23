import fs from "fs"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

const CSV_PATH = "products-import.csv"
const SALES_CHANNEL_ID = "sc_01KMHYS60JDX7TARN7DSWZF8SC"
const CURRENCY_CODE = "eur"

type ExecContext = {
  container: any
}

type CsvProductRow = {
  title: string
  handle: string
  status: "published" | "draft" | "proposed" | "rejected"
  description: string
  categoryHandle: string
  variantTitle: string
  sku: string
  price: number
  imageUrl: string
}

type CategoryRow = {
  id: string
  handle: string
  name?: string
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

function readCsv(): CsvProductRow[] {
  const content = fs.readFileSync(CSV_PATH, "utf8").replace(/^\uFEFF/, "")
  const lines = content.split(/\r?\n/).filter(Boolean)

  const headers = parseCsvLine(lines[0])
  const expectedHeaders = [
    "Product Title",
    "Product Handle",
    "Product Status",
    "Product Description",
    "Product Category Handle",
    "Variant Title",
    "Variant SKU",
    "Variant Price",
    "Product Image 1 Url",
  ]

  if (headers.join("|") !== expectedHeaders.join("|")) {
    throw new Error(
      `Invalid CSV headers.\nExpected: ${expectedHeaders.join(" | ")}\nReceived: ${headers.join(" | ")}`
    )
  }

  return lines.slice(1).map((line, index) => {
    const row = parseCsvLine(line)

    if (row.length !== expectedHeaders.length) {
      throw new Error(`Invalid column count on row ${index + 2}: expected ${expectedHeaders.length}, got ${row.length}`)
    }

    const price = Number(row[7])

    if (!Number.isFinite(price)) {
      throw new Error(`Invalid price on row ${index + 2}: ${row[7]}`)
    }

    if (!row[1]) {
      throw new Error(`Missing product handle on row ${index + 2}`)
    }

    if (!row[4]) {
      throw new Error(`Missing category handle on row ${index + 2}`)
    }

    if (!row[6]) {
      throw new Error(`Missing SKU on row ${index + 2}`)
    }

    if (!row[8]) {
      throw new Error(`Missing image URL on row ${index + 2}`)
    }

    return {
      title: row[0],
      handle: row[1],
      status: row[2] as CsvProductRow["status"],
      description: row[3],
      categoryHandle: row[4],
      variantTitle: row[5],
      sku: row[6],
      price,
      imageUrl: row[8],
    }
  })
}

export default async function ({ container }: ExecContext) {
  const args = process.argv.slice(2)
  const shouldReplace = args.includes("--replace")

  const productModule = container.resolve("product")

  const rows = readCsv()

  const categories = (await productModule.listProductCategories(
    {},
    {
      select: ["id", "handle", "name"],
      take: 500,
    }
  )) as CategoryRow[]

  const categoryByHandle = new Map(categories.map((category) => [category.handle, category]))

  const existingProducts = await productModule.listProducts(
    {},
    {
      select: ["id", "handle", "title"],
      take: 1000,
      order: { created_at: "DESC" },
    }
  )

  console.log(`CSV rows: ${rows.length}`)
  console.log(`Existing products: ${existingProducts.length}`)
  console.log(`Mode: ${shouldReplace ? "REPLACE" : "PREVIEW"}`)

  const products = rows.map((row) => {
    const category = categoryByHandle.get(row.categoryHandle)

    if (!category) {
      throw new Error(`Missing category: ${row.categoryHandle} for product ${row.handle}`)
    }

    console.log(`${row.handle} | ${row.title} | ${row.categoryHandle} -> ${category.id} | ${row.sku} | ${row.price} ${CURRENCY_CODE}`)

    return {
      title: row.title,
      handle: row.handle,
      status: row.status,
      description: row.description,
      discountable: true,
      images: [{ url: row.imageUrl }],
      thumbnail: row.imageUrl,
      categories: [{ id: category.id }],
      sales_channels: [{ id: SALES_CHANNEL_ID }],
      options: [
        {
          title: "Default option",
          values: [row.variantTitle],
        },
      ],
      variants: [
        {
          title: row.variantTitle,
          sku: row.sku,
          manage_inventory: false,
          allow_backorder: false,
          options: {
            "Default option": row.variantTitle,
          },
          prices: [
            {
              currency_code: CURRENCY_CODE,
              amount: row.price,
            },
          ],
        },
      ],
    }
  })

  if (!shouldReplace) {
    console.log("PREVIEW ONLY. No products were deleted or created.")
    console.log("To replace the production catalog, run:")
    console.log("npx medusa exec ./src/scripts/import-products-from-csv.ts --replace")
    return
  }

  console.log(`Deleting existing products: ${existingProducts.length}`)

  for (const product of existingProducts) {
    console.log(`Deleting: ${product.id} | ${product.handle} | ${product.title}`)
    await productModule.deleteProducts([product.id])
  }

  console.log(`Creating products: ${products.length}`)

  const { result } = await createProductsWorkflow(container).run({
    input: {
      products,
    },
  })

  console.log(`Created products: ${result.length}`)

  const importedProducts = await productModule.listProducts(
    {},
    {
      select: [
        "id",
        "handle",
        "title",
        "status",
        "thumbnail",
        "categories.handle",
        "variants.sku",
      ],
      relations: ["categories", "variants"],
      take: 1000,
      order: { created_at: "DESC" },
    }
  )

  console.log(`Validation products: ${importedProducts.length}`)

  for (const product of importedProducts) {
    const categoryHandles = product.categories?.map((category) => category.handle).join(", ") || "NO_CATEGORY"
    const skus = product.variants?.map((variant) => variant.sku).join(", ") || "NO_VARIANT"
    const imageStatus = product.thumbnail ? "HAS_IMAGE" : "NO_IMAGE"

    console.log(`${product.handle} | ${product.status} | ${categoryHandles} | ${skus} | ${imageStatus}`)
  }
}
