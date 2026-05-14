# MTVZ Production Product Import Flow

## Canonical rule

Do not use Medusa Admin CSV import for production product imports.

Production product imports are done through a controlled Medusa exec script that reads:

products-import.csv

## Required CSV columns

Product Title
Product Handle
Product Status
Product Description
Product Category Handle
Variant Title
Variant SKU
Variant Price
Product Image 1 Url

## Confirmed production flow

1. Upload CSV to:

/opt/mtvz/backend/backend/myshop/products-import.csv

2. Validate CSV parsing.

3. Validate category handles from the CSV against Medusa product categories.

4. Validate active sales channel.

Current production sales channel:

sc_01KMHYS60JDX7TARN7DSWZF8SC

5. Delete old products only after dry-run confirms the exact product count.

6. Create products through createProductsWorkflow.

Important shape:

images: [{ url: imageUrl }]

Not:

images: [imageUrl]

7. Validate imported products:
- product count
- status
- category
- SKU
- thumbnail/image

8. Rebuild storefront without old Next cache:

cd /opt/mtvz/storefront
rm -rf .next
npm run build

9. Restart storefront process.

10. Verify public category pages.

## Confirmed working publishable key

pk_6c9a232ec7e393047d12304459c4b3dd19f58605eb16383f4d1bddbfd84a314b

## Known wrong/incomplete key

pk_5f132dffa6ba17d154a88c432666b3eb451b9d8c5fcc47c299695f07f76a2a64

This key exists but does not have a sales channel configured.

## Confirmed issue from 2026-05-04

After backend product changes, storefront may still show old products if Next cache is reused.

Fix:

rm -rf .next
npm run build
restart storefront

## Do not repeat

- Do not use git pull for product import.
- Do not use Medusa Admin CSV import as the production path.
- Do not run assign-product-categories.ts if products were created with categories already.
- Do not rebuild Next without removing .next when product static paths changed.
