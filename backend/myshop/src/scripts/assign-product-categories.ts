import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

type Product = {
  id: string
  handle: string
  title?: string
}

type ProductCategory = {
  id: string
  handle: string
  name?: string
  category_children?: ProductCategory[]
}

const productCategoryMap: Record<string, string> = {
  "matrix-horizon-x-method-feeder-rod-36m": "feeder-rods",
  "guru-n-gauge-method-feeder-rod-30m": "feeder-rods",

  "korum-zelos-distance-6000": "feeder-reels",
  "daiwa-ninja-lt-5000-c": "feeder-reels",
  "preston-inertia-420": "feeder-reels",

  "preston-in-line-flat-method-feeder": "method-feeder-baskets",
  "guru-method-feeder-inline-24g": "method-feeder-baskets",
  "guru-method-feeder-inline-36g": "method-feeder-baskets",

  "guru-method-feeder-ready-rigs": "method-feeder-rigs",
  "preston-ready-rigs-hair-rig-4in": "method-feeder-rigs",

  "matrix-method-feeder-starter-pack": "method-feeder",
  "preston-ics-method-feeder-mould": "method-feeder-moulds",

  "matrix-bait-bands": "pva-rig-bits",
  "preston-quick-change-beads": "swivels-snaps",
  "anti-tangle-sleeves-method-feeder": "terminal-tackle",
}

const flattenCategories = (categories: ProductCategory[]) => {
  const result: ProductCategory[] = []

  const walk = (items: ProductCategory[]) => {
    for (const item of items) {
      result.push(item)

      if (item.category_children?.length) {
        walk(item.category_children)
      }
    }
  }

  walk(categories)

  return result
}

export default async function assignProductCategories({ container }: any) {
  const productService = container.resolve("product")

  console.log("Loading products...")

  const products: Product[] = await productService.listProducts(
    {},
    {
      select: ["id", "handle", "title"],
      take: 1000,
    }
  )

  console.log(`Loaded products: ${products.length}`)

  console.log("Loading product categories...")

  const rootCategories: ProductCategory[] =
    await productService.listProductCategories(
      {},
      {
        select: ["id", "handle", "name"],
        relations: ["category_children"],
        take: 1000,
      }
    )

  const categories = flattenCategories(rootCategories)

  console.log(`Loaded categories: ${categories.length}`)

  const productsByHandle = new Map(
    products.map((product) => [product.handle, product])
  )

  const categoriesByHandle = new Map(
    categories.map((category) => [category.handle, category])
  )

  for (const [productHandle, categoryHandle] of Object.entries(
    productCategoryMap
  )) {
    const product = productsByHandle.get(productHandle)
    const category = categoriesByHandle.get(categoryHandle)

    if (!product) {
      throw new Error(`Missing product with handle: ${productHandle}`)
    }

    if (!category) {
      throw new Error(`Missing category with handle: ${categoryHandle}`)
    }

    console.log(`Assigning: ${product.handle} → ${category.handle}`)

    await updateProductsWorkflow(container).run({
      input: {
        selector: {
          id: product.id,
        },
        update: {
          category_ids: [category.id],
        },
      },
    })
  }

  console.log("Done. Product categories assigned successfully.")
}