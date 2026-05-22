import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CATEGORY_SEO_MODULE } from "../../../modules/category-seo"
import { sanitizeRichText } from "../../../lib/sanitize-rich-text"

const getFirstQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return String(value[0] || "").trim()
  }

  return String(value || "").trim()
}

const stripHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .trim()

const ensurePlainObject = (value: unknown) =>
  !!value && typeof value === "object" && !Array.isArray(value)

const serializeMediaSections = (mediaSections: unknown) => {
  if (mediaSections == null || !ensurePlainObject(mediaSections)) {
    return null
  }

  const source = mediaSections as any

  return {
    intro_image: {
      image_url: stripHtml(source.intro_image?.image_url),
      alt: stripHtml(source.intro_image?.alt),
      caption: stripHtml(source.intro_image?.caption),
    },
    video: {
      video_url: stripHtml(source.video?.video_url),
      title: stripHtml(source.video?.title),
      description: stripHtml(source.video?.description),
    },
    bottom_image: {
      image_url: stripHtml(source.bottom_image?.image_url),
      alt: stripHtml(source.bottom_image?.alt),
      title: stripHtml(source.bottom_image?.title),
      text: stripHtml(source.bottom_image?.text),
    },
  }
}

const serializeStoreCategorySeoContent = (content: any) => ({
  category_handle: content.category_handle,
  locale: content.locale,
  seo_title: content.seo_title,
  seo_description: content.seo_description,
  intro_text: sanitizeRichText(content.intro_text),
  bottom_text: sanitizeRichText(content.bottom_text),
  faq: Array.isArray(content.faq) ? content.faq : [],
  media_sections: serializeMediaSections(content.media_sections),
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
