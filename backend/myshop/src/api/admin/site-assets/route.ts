import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SITE_ASSETS_MODULE } from "../../../modules/site-assets"

type CreateSiteAssetBody = {
  key: string
  label?: string | null
  scope?: string | null
  entity_type?: string | null
  entity_handle?: string | null
  slot?: string | null
  image_url?: string | null
  alt_text?: string | null
  content?: Record<string, any> | null
  is_active?: boolean
  sort_order?: number | null
}

type SiteAssetWritePayload = {
  key: string
  label: string | null | undefined
  scope: string | null | undefined
  entity_type: string | null | undefined
  entity_handle?: string | null
  slot: string | null | undefined
  image_url: string | null | undefined
  alt_text: string | null | undefined
  content?: Record<string, any> | null
  is_active?: boolean
  sort_order?: number | null
}

const REQUIRED_NON_EMPTY_STRING_FIELDS = [
  "key",
  "scope",
  "entity_type",
  "slot",
  "label",
  "image_url",
] as const

const validateSiteAssetPayload = (payload: SiteAssetWritePayload) => {
  for (const field of REQUIRED_NON_EMPTY_STRING_FIELDS) {
    const value = payload[field]

    if (typeof value !== "string" || !value.trim()) {
      return `Field '${field}' must be a non-empty string.`
    }
  }

  if (typeof payload.alt_text !== "string") {
    return "Field 'alt_text' must be a string."
  }

  return null
}

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const siteAssetsService: any = req.scope.resolve(SITE_ASSETS_MODULE)

  const assets = await siteAssetsService.listSiteAssets({})

  return res.json({
    site_assets: assets.map((asset: any) => ({
      id: asset.id,
      key: asset.key,
      label: asset.label,
      scope: asset.scope,
      entity_type: asset.entity_type,
      entity_handle: asset.entity_handle,
      slot: asset.slot,
      image_url: asset.image_url,
      alt_text: asset.alt_text,
      content: asset.content ?? null,
      is_active: asset.is_active,
      sort_order: asset.sort_order,
      created_at: asset.created_at,
      updated_at: asset.updated_at,
    })),
  })
}

export const POST = async (
  req: MedusaRequest<CreateSiteAssetBody>,
  res: MedusaResponse
) => {
  const body = req.body

  if (!body?.key?.trim()) {
    return res.status(400).json({
      message: "Field 'key' is required.",
    })
  }

  const siteAssetsService: any = req.scope.resolve(SITE_ASSETS_MODULE)
  const key = body.key.trim()

  const existing = await siteAssetsService.listSiteAssets({
    key: [key],
  })

  if (existing?.length > 0) {
    const current = existing[0]
    const payload: SiteAssetWritePayload = {
      key,
      label: body.label ?? current.label,
      scope: body.scope ?? current.scope,
      entity_type: body.entity_type ?? current.entity_type,
      entity_handle: body.entity_handle ?? current.entity_handle,
      slot: body.slot ?? current.slot,
      image_url: body.image_url ?? current.image_url,
      alt_text: body.alt_text ?? current.alt_text,
      content: body.content ?? current.content,
      is_active: body.is_active ?? current.is_active,
      sort_order: body.sort_order ?? current.sort_order,
    }
    const validationError = validateSiteAssetPayload(payload)

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      })
    }

    const updated = await siteAssetsService.updateSiteAssets({
      id: current.id,
      ...payload,
    })

    const asset = Array.isArray(updated) ? updated[0] : updated

    return res.status(200).json({
      site_asset: {
        id: asset.id,
        key: asset.key,
        label: asset.label,
        scope: asset.scope,
        entity_type: asset.entity_type,
        entity_handle: asset.entity_handle,
        slot: asset.slot,
        image_url: asset.image_url,
        alt_text: asset.alt_text,
        content: asset.content ?? null,
        is_active: asset.is_active,
        sort_order: asset.sort_order,
        created_at: asset.created_at,
        updated_at: asset.updated_at,
      },
    })
  }

  const payload: SiteAssetWritePayload = {
    key,
    label: body.label,
    scope: body.scope,
    entity_type: body.entity_type,
    entity_handle: body.entity_handle ?? null,
    slot: body.slot,
    image_url: body.image_url,
    alt_text: body.alt_text,
    content: body.content ?? null,
    is_active: body.is_active ?? true,
    sort_order: body.sort_order ?? 0,
  }
  const validationError = validateSiteAssetPayload(payload)

  if (validationError) {
    return res.status(400).json({
      message: validationError,
    })
  }

  const created = await siteAssetsService.createSiteAssets(payload)

  const asset = Array.isArray(created) ? created[0] : created

  return res.status(200).json({
    site_asset: {
      id: asset.id,
      key: asset.key,
      label: asset.label,
      scope: asset.scope,
      entity_type: asset.entity_type,
      entity_handle: asset.entity_handle,
      slot: asset.slot,
      image_url: asset.image_url,
      alt_text: asset.alt_text,
      content: asset.content ?? null,
      is_active: asset.is_active,
      sort_order: asset.sort_order,
      created_at: asset.created_at,
      updated_at: asset.updated_at,
    },
  })
}
