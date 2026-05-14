import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CATEGORY_SEO_MODULE } from "../../../modules/category-seo"

const getFirstQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return String(value[0] || "").trim()
  }

  return String(value || "").trim()
}

const serializeStoreCategorySeoContent = (content: any) => ({
  category_handle: content.category_handle,
  locale: content.locale,
  seo_title: content.seo_title,
  seo_description: content.seo_description,
  intro_text: content.intro_text,
  bottom_text: content.bottom_text,
  faq: Array.isArray(content.faq) ? content.faq : [],
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
    is_active: true,
  })

  const content = contents?.[0] || null

  return res.json({
    category_seo_content: content
      ? serializeStoreCategorySeoContent(content)
      : null,
  })
}
