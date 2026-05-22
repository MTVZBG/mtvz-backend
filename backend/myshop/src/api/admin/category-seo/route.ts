import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CATEGORY_SEO_MODULE } from "../../../modules/category-seo"
import { sanitizeRichText } from "../../../lib/sanitize-rich-text"

type FaqItem = {
  question?: string | null
  answer?: string | null
}

type CategorySeoMediaSections = {
  intro_image: {
    image_url: string
    alt: string
    caption: string
  }
  video: {
    video_url: string
    title: string
    description: string
  }
  bottom_image: {
    image_url: string
    alt: string
    title: string
    text: string
  }
}

type SaveCategorySeoBody = {
  category_handle?: string | null
  locale?: string | null
  seo_title?: string | null
  seo_description?: string | null
  intro_text?: string | null
  bottom_text?: string | null
  faq?: FaqItem[] | null
  media_sections?: Partial<CategorySeoMediaSections> | null
  is_active?: boolean
}

const MEDIA_SECTION_FIELDS = {
  intro_image: ["image_url", "alt", "caption"],
  video: ["video_url", "title", "description"],
  bottom_image: ["image_url", "alt", "title", "text"],
} as const

const createEmptyMediaSections = (): CategorySeoMediaSections => ({
  intro_image: {
    image_url: "",
    alt: "",
    caption: "",
  },
  video: {
    video_url: "",
    title: "",
    description: "",
  },
  bottom_image: {
    image_url: "",
    alt: "",
    title: "",
    text: "",
  },
})

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

const stripHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .trim()

const ensurePlainObject = (value: unknown) =>
  !!value && typeof value === "object" && !Array.isArray(value)

const normalizeMediaSections = (
  mediaSections: SaveCategorySeoBody["media_sections"]
) => {
  if (mediaSections == null) {
    return null
  }

  if (!ensurePlainObject(mediaSections)) {
    throw new Error("Field 'media_sections' must be an object.")
  }

  const allowedSections = Object.keys(MEDIA_SECTION_FIELDS)
  const sectionKeys = Object.keys(mediaSections)
  const unknownSection = sectionKeys.find(
    (key) => !allowedSections.includes(key)
  )

  if (unknownSection) {
    throw new Error(`Unknown media_sections key '${unknownSection}'.`)
  }

  const normalized = createEmptyMediaSections()

  for (const section of allowedSections) {
    const sectionValue = mediaSections[section as keyof CategorySeoMediaSections]

    if (sectionValue == null) {
      continue
    }

    if (!ensurePlainObject(sectionValue)) {
      throw new Error(`Field 'media_sections.${section}' must be an object.`)
    }

    const allowedFields = MEDIA_SECTION_FIELDS[
      section as keyof typeof MEDIA_SECTION_FIELDS
    ]
    const fieldKeys = Object.keys(sectionValue)
    const unknownField = fieldKeys.find(
      (key) => !allowedFields.includes(key as never)
    )

    if (unknownField) {
      throw new Error(
        `Unknown media_sections.${section} key '${unknownField}'.`
      )
    }

    for (const field of allowedFields) {
      normalized[section as keyof CategorySeoMediaSections][field] = stripHtml(
        sectionValue[field]
      )
    }
  }

  return normalized
}

const serializeMediaSections = (mediaSections: unknown) => {
  if (mediaSections == null || !ensurePlainObject(mediaSections)) {
    return null
  }

  const source = mediaSections as Partial<CategorySeoMediaSections>

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

const serializeCategorySeoContent = (content: any) => ({
  id: content.id,
  category_handle: content.category_handle,
  locale: content.locale,
  seo_title: content.seo_title,
  seo_description: content.seo_description,
  intro_text: sanitizeRichText(content.intro_text),
  bottom_text: sanitizeRichText(content.bottom_text),
  faq: Array.isArray(content.faq) ? content.faq : [],
  media_sections: serializeMediaSections(content.media_sections),
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

  let mediaSections: CategorySeoMediaSections | null

  try {
    mediaSections = normalizeMediaSections(body.media_sections)
  } catch (err) {
    return res.status(400).json({
      message:
        err instanceof Error ? err.message : "Invalid media_sections payload.",
    })
  }

  const payload = {
    category_handle: categoryHandle,
    locale,
    seo_title: body.seo_title ?? "",
    seo_description: body.seo_description ?? "",
    intro_text: sanitizeRichText(body.intro_text),
    bottom_text: sanitizeRichText(body.bottom_text),
    faq: normalizeFaq(body.faq),
    media_sections: mediaSections,
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
