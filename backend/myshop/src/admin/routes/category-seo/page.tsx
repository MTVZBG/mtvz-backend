import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Input, Switch, Text, Textarea } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"

type ProductCategory = {
  id: string
  name: string
  handle?: string | null
}

type FaqItem = {
  question: string
  answer: string
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

type CategorySeoDraft = {
  category_handle: string
  locale: string
  seo_title: string
  seo_description: string
  intro_text: string
  bottom_text: string
  faq: FaqItem[]
  media_sections: CategorySeoMediaSections
  is_active: boolean
}

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

const createEmptyDraft = (categoryHandle = ""): CategorySeoDraft => ({
  category_handle: categoryHandle,
  locale: "bg",
  seo_title: "",
  seo_description: "",
  intro_text: "",
  bottom_text: "",
  faq: [],
  media_sections: createEmptyMediaSections(),
  is_active: true,
})

const normalizeFaq = (faq: unknown): FaqItem[] => {
  if (!Array.isArray(faq)) {
    return []
  }

  return faq.map((item) => ({
    question: String(item?.question || ""),
    answer: String(item?.answer || ""),
  }))
}

const normalizeMediaSections = (mediaSections: unknown): CategorySeoMediaSections => {
  const emptyMediaSections = createEmptyMediaSections()

  if (!mediaSections || typeof mediaSections !== "object" || Array.isArray(mediaSections)) {
    return emptyMediaSections
  }

  const source = mediaSections as Partial<CategorySeoMediaSections>

  return {
    intro_image: {
      image_url: String(source.intro_image?.image_url || ""),
      alt: String(source.intro_image?.alt || ""),
      caption: String(source.intro_image?.caption || ""),
    },
    video: {
      video_url: String(source.video?.video_url || ""),
      title: String(source.video?.title || ""),
      description: String(source.video?.description || ""),
    },
    bottom_image: {
      image_url: String(source.bottom_image?.image_url || ""),
      alt: String(source.bottom_image?.alt || ""),
      title: String(source.bottom_image?.title || ""),
      text: String(source.bottom_image?.text || ""),
    },
  }
}

const CategorySeoPage = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [categoryQuery, setCategoryQuery] = useState("")
  const [selectedCategoryHandle, setSelectedCategoryHandle] = useState<string | null>(null)
  const [draft, setDraft] = useState<CategorySeoDraft>(createEmptyDraft())
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingContent, setLoadingContent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadCategories = async () => {
    setLoadingCategories(true)

    try {
      const res = await fetch("/admin/product-categories?limit=1000", {
        credentials: "include",
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Could not load categories.")
      }

      setCategories(data.product_categories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load categories.")
    } finally {
      setLoadingCategories(false)
    }
  }

  const loadContent = async (categoryHandle: string) => {
    setLoadingContent(true)
    setMessage(null)
    setError(null)

    try {
      const params = new URLSearchParams({
        category_handle: categoryHandle,
        locale: "bg",
      })
      const res = await fetch(`/admin/category-seo?${params.toString()}`, {
        credentials: "include",
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Could not load SEO content.")
      }

      const content = data.category_seo_content

      setDraft(
        content
          ? {
              category_handle: content.category_handle,
              locale: content.locale || "bg",
              seo_title: content.seo_title || "",
              seo_description: content.seo_description || "",
              intro_text: content.intro_text || "",
              bottom_text: content.bottom_text || "",
              faq: normalizeFaq(content.faq),
              media_sections: normalizeMediaSections(content.media_sections),
              is_active: content.is_active ?? true,
            }
          : createEmptyDraft(categoryHandle)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load SEO content.")
      setDraft(createEmptyDraft(categoryHandle))
    } finally {
      setLoadingContent(false)
    }
  }

  useEffect(() => {
    loadCategories().catch(console.error)
  }, [])

  useEffect(() => {
    if (!selectedCategoryHandle) {
      setDraft(createEmptyDraft())
      return
    }

    loadContent(selectedCategoryHandle).catch(console.error)
  }, [selectedCategoryHandle])

  const categoryOptions = useMemo(() => {
    return [...categories]
      .filter((category) => !!category.handle)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [categories])

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryHandle) {
      return null
    }

    return (
      categoryOptions.find(
        (category) => category.handle === selectedCategoryHandle
      ) || null
    )
  }, [categoryOptions, selectedCategoryHandle])

  const handleCategoryInputChange = (value: string) => {
    setCategoryQuery(value)
    setMessage(null)
    setError(null)

    const matchedCategory = categoryOptions.find(
      (category) => category.name === value
    )

    setSelectedCategoryHandle(matchedCategory?.handle || null)
  }

  const updateDraft = (field: keyof CategorySeoDraft, value: string | boolean | FaqItem[]) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const updateMediaSection = <
    TSection extends keyof CategorySeoMediaSections,
    TField extends keyof CategorySeoMediaSections[TSection]
  >(
    section: TSection,
    field: TField,
    value: string
  ) => {
    setDraft((current) => ({
      ...current,
      media_sections: {
        ...current.media_sections,
        [section]: {
          ...current.media_sections[section],
          [field]: value,
        },
      },
    }))
  }

  const updateFaqItem = (index: number, field: keyof FaqItem, value: string) => {
    setDraft((current) => ({
      ...current,
      faq: current.faq.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  const addFaqItem = () => {
    setDraft((current) => ({
      ...current,
      faq: [...current.faq, { question: "", answer: "" }],
    }))
  }

  const removeFaqItem = (index: number) => {
    setDraft((current) => ({
      ...current,
      faq: current.faq.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const saveContent = async () => {
    if (!selectedCategoryHandle) {
      return
    }

    setSaving(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch("/admin/category-seo", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...draft,
          category_handle: selectedCategoryHandle,
          locale: draft.locale || "bg",
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Could not save SEO content.")
      }

      const content = data.category_seo_content

      setDraft({
        category_handle: content.category_handle,
        locale: content.locale || "bg",
        seo_title: content.seo_title || "",
        seo_description: content.seo_description || "",
        intro_text: content.intro_text || "",
        bottom_text: content.bottom_text || "",
        faq: normalizeFaq(content.faq),
        media_sections: normalizeMediaSections(content.media_sections),
        is_active: content.is_active ?? true,
      })
      setMessage("Saved.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save SEO content.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="p-6">
      <Heading level="h1">Category SEO</Heading>

      <Text className="mt-2 mb-6 text-ui-fg-subtle">
        Edit category SEO content by product category handle.
      </Text>

      <div style={{ marginBottom: 24, maxWidth: 520 }}>
        <Text className="mb-2">Category</Text>

        <Input
          list="category-seo-category-options"
          value={categoryQuery}
          onChange={(event) => handleCategoryInputChange(event.target.value)}
          placeholder={loadingCategories ? "Loading categories..." : "Search by category name..."}
          disabled={loadingCategories}
        />

        <datalist id="category-seo-category-options">
          {categoryOptions.map((category) => (
            <option key={category.id} value={category.name} />
          ))}
        </datalist>

        <Text size="small" className="mt-2 text-ui-fg-subtle">
          Selected handle: {selectedCategory?.handle || "-"}
        </Text>
      </div>

      {error ? (
        <Text className="mb-4 text-ui-fg-error">{error}</Text>
      ) : null}

      {message ? (
        <Text className="mb-4 text-ui-fg-subtle">{message}</Text>
      ) : null}

      {!selectedCategoryHandle ? (
        <Text>Select a category to edit SEO content.</Text>
      ) : (
        <div style={{ display: "grid", gap: 20, maxWidth: 860 }}>
          {loadingContent ? (
            <Text>Loading SEO content...</Text>
          ) : null}

          <label style={{ display: "grid", gap: 8 }}>
            <Text>SEO title</Text>
            <Input
              value={draft.seo_title}
              onChange={(event) => updateDraft("seo_title", event.target.value)}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <Text>Meta description</Text>
            <Textarea
              rows={3}
              value={draft.seo_description}
              onChange={(event) => updateDraft("seo_description", event.target.value)}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <Text>Intro text</Text>
            <Textarea
              rows={6}
              value={draft.intro_text}
              onChange={(event) => updateDraft("intro_text", event.target.value)}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <Text>Bottom SEO text</Text>
            <Textarea
              rows={8}
              value={draft.bottom_text}
              onChange={(event) => updateDraft("bottom_text", event.target.value)}
            />
          </label>

          <div style={{ display: "grid", gap: 16 }}>
            <Heading level="h2">SEO Media Sections</Heading>

            <div style={{ display: "grid", gap: 12 }}>
              <Text>Intro image</Text>
              <label style={{ display: "grid", gap: 8 }}>
                <Text size="small">Image URL</Text>
                <Input
                  type="url"
                  value={draft.media_sections.intro_image.image_url}
                  onChange={(event) =>
                    updateMediaSection("intro_image", "image_url", event.target.value)
                  }
                />
              </label>
              <label style={{ display: "grid", gap: 8 }}>
                <Text size="small">Alt text</Text>
                <Input
                  value={draft.media_sections.intro_image.alt}
                  onChange={(event) =>
                    updateMediaSection("intro_image", "alt", event.target.value)
                  }
                />
              </label>
              <label style={{ display: "grid", gap: 8 }}>
                <Text size="small">Caption</Text>
                <Input
                  value={draft.media_sections.intro_image.caption}
                  onChange={(event) =>
                    updateMediaSection("intro_image", "caption", event.target.value)
                  }
                />
              </label>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <Text>Video</Text>
              <label style={{ display: "grid", gap: 8 }}>
                <Text size="small">Video URL</Text>
                <Input
                  type="url"
                  value={draft.media_sections.video.video_url}
                  onChange={(event) =>
                    updateMediaSection("video", "video_url", event.target.value)
                  }
                />
              </label>
              <label style={{ display: "grid", gap: 8 }}>
                <Text size="small">Video title</Text>
                <Input
                  value={draft.media_sections.video.title}
                  onChange={(event) =>
                    updateMediaSection("video", "title", event.target.value)
                  }
                />
              </label>
              <label style={{ display: "grid", gap: 8 }}>
                <Text size="small">Video description</Text>
                <Textarea
                  rows={3}
                  value={draft.media_sections.video.description}
                  onChange={(event) =>
                    updateMediaSection("video", "description", event.target.value)
                  }
                />
              </label>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <Text>Bottom image/content</Text>
              <label style={{ display: "grid", gap: 8 }}>
                <Text size="small">Image URL</Text>
                <Input
                  type="url"
                  value={draft.media_sections.bottom_image.image_url}
                  onChange={(event) =>
                    updateMediaSection("bottom_image", "image_url", event.target.value)
                  }
                />
              </label>
              <label style={{ display: "grid", gap: 8 }}>
                <Text size="small">Alt text</Text>
                <Input
                  value={draft.media_sections.bottom_image.alt}
                  onChange={(event) =>
                    updateMediaSection("bottom_image", "alt", event.target.value)
                  }
                />
              </label>
              <label style={{ display: "grid", gap: 8 }}>
                <Text size="small">Title</Text>
                <Input
                  value={draft.media_sections.bottom_image.title}
                  onChange={(event) =>
                    updateMediaSection("bottom_image", "title", event.target.value)
                  }
                />
              </label>
              <label style={{ display: "grid", gap: 8 }}>
                <Text size="small">Text</Text>
                <Textarea
                  rows={4}
                  value={draft.media_sections.bottom_image.text}
                  onChange={(event) =>
                    updateMediaSection("bottom_image", "text", event.target.value)
                  }
                />
              </label>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <Heading level="h2">FAQ</Heading>
              <Button size="small" onClick={addFaqItem}>
                Add FAQ
              </Button>
            </div>

            {draft.faq.length === 0 ? (
              <Text className="text-ui-fg-subtle">No FAQ items.</Text>
            ) : null}

            {draft.faq.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gap: 8,
                  padding: 16,
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                }}
              >
                <Input
                  value={item.question}
                  onChange={(event) =>
                    updateFaqItem(index, "question", event.target.value)
                  }
                  placeholder="Question"
                />
                <Textarea
                  rows={3}
                  value={item.answer}
                  onChange={(event) =>
                    updateFaqItem(index, "answer", event.target.value)
                  }
                  placeholder="Answer"
                />
                <div>
                  <Button size="small" onClick={() => removeFaqItem(index)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Switch
              checked={draft.is_active}
              onCheckedChange={(checked) => updateDraft("is_active", checked)}
            />
            <Text>{draft.is_active ? "Active" : "Inactive"}</Text>
          </div>

          <div>
            <Button
              onClick={saveContent}
              disabled={saving || loadingContent}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Category SEO",
})

export default CategorySeoPage
