import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SITE_ASSETS_MODULE } from "../../../modules/site-assets"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const keysQuery = req.query.keys as string | string[] | undefined
  const scope = req.query.scope as string | undefined
  const entityType = req.query.entity_type as string | undefined
  const entityHandle = req.query.entity_handle as string | undefined
  const slot = req.query.slot as string | undefined

  let keys: string[] = []

  if (typeof keysQuery === "string") {
    keys = keysQuery.split(",").map((k) => k.trim()).filter(Boolean)
  } else if (Array.isArray(keysQuery)) {
    keys = keysQuery.map((k) => String(k).trim()).filter(Boolean)
  }

  const filters: Record<string, any> = {
    is_active: true,
  }

  if (keys.length > 0) {
    filters.key = keys
  }

  if (scope) {
    filters.scope = scope
  }

  if (entityType) {
    filters.entity_type = entityType
  }

  if (entityHandle) {
    filters.entity_handle = entityHandle
  }

  if (slot) {
    filters.slot = slot
  }

  const hasLookupFilter =
    keys.length > 0 || !!scope || !!entityType || !!entityHandle || !!slot

  if (!hasLookupFilter) {
    return res.json({ site_assets: [] })
  }

  const siteAssetsService: any = req.scope.resolve(SITE_ASSETS_MODULE)

  const assets = await siteAssetsService.listSiteAssets(filters)

  return res.json({
    site_assets: assets.map((asset: any) => ({
      key: asset.key,
      scope: asset.scope,
      entity_type: asset.entity_type,
      entity_handle: asset.entity_handle,
      slot: asset.slot,
      label: asset.label,
      image_url: asset.image_url,
      alt_text: asset.alt_text,
      content: asset.content ?? null,
      is_active: asset.is_active,
      sort_order: asset.sort_order,
    })),
  })
}