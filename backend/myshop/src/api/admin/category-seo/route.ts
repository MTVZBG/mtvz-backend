import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CATEGORY_SEO_MODULE } from "../../../modules/category-seo"

type FaqItem = {
  question?: string | null
  answer?: string | null
}

type SaveCategorySeoBody = {
  category_handle?: string | null
  locale?: string | null
  seo_title?: string | null
  seo_description?: string | null
  intro_text?: string | null
  bottom_text?: string | null
  faq?: FaqItem[] | null
  is_active?: boolean
}

const getFirstQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return String(value[0] || "").trim()
  }

  return String(value || "").trim()
}

const normalizeFaq = (faq: SaveCategorySeoBody["faq"]) => {
  if (!Array.isArray(faq)) {
    return []
  }

  return faq
    .map((item) => ({
      question: String(item?.question || "").trim(),
      answer: String(item?.answer || "").trim(),
    }))
    .filter((item) => item.question || item.answer)
}

const serializeCategorySeoContent = (content: any) => ({
  id: content.id,
  category_handle: content.category_handle,
  locale: content.locale,
  seo_title: content.seo_title,
  seo_description: content.seo_description,
  intro_text: content.intro_text,
  bottom_text: content.bottom_text,
  faq: Array.isArray(content.faq) ? content.faq : [],
  is_active: content.is_active,
  created_at: content.created_at,
  updated_at: content.updated_at,
  deleted_at: content.deleted_at,
})

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const categoryHandle = getFirstQueryValue(req.query.category_handle)
  const locale = getFirstQueryValue(req.query.locale) || "bg"

  if (!categoryHandle) {
    return res.status(400).json({
      message: "Query parameter 'category_handle' is required.",
    })
  }

  const categorySeoService: any = req.scope.resolve(CATEGORY_SEO_MODULE)

  const contents = await categorySeoService.listCategorySeoContents({
    category_handle: categoryHandle,
    locale,
  })

  const content = contents?.[0] || null

  return res.json({
    category_seo_content: content ? serializeCategorySeoContent(content) : null,
  })
}

export const POST = async (
  req: MedusaRequest<SaveCategorySeoBody>,
  res: MedusaResponse
) => {
  const body = req.body
  const categoryHandle = String(body?.category_handle || "").trim()
  const locale = String(body?.locale || "bg").trim() || "bg"

  if (!categoryHandle) {
    return res.status(400).json({
      message: "Field 'category_handle' is required.",
    })
  }

  const payload = {
    category_handle: categoryHandle,
    locale,
    seo_title: body.seo_title ?? "",
    seo_description: body.seo_description ?? "",
    intro_text: body.intro_text ?? "",
    bottom_text: body.bottom_text ?? "",
    faq: normalizeFaq(body.faq),
    is_active: body.is_active ?? true,
  }

  const categorySeoService: any = req.scope.resolve(CATEGORY_SEO_MODULE)

  const existing = await categorySeoService.listCategorySeoContents({
    category_handle: categoryHandle,
    locale,
  })

  if (existing?.length > 0) {
    const current = existing[0]

    const updated = await categorySeoService.updateCategorySeoContents({
      id: current.id,
      ...payload,
    })

    const content = Array.isArray(updated) ? updated[0] : updated

    return res.status(200).json({
      category_seo_content: serializeCategorySeoContent(content),
    })
  }

  const created = await categorySeoService.createCategorySeoContents(payload)
  const content = Array.isArray(created) ? created[0] : created

  return res.status(200).json({
    category_seo_content: serializeCategorySeoContent(content),
  })
}
