import { defineRouteConfig } from "@medusajs/admin-sdk"
import { PhotoSolid } from "@medusajs/icons"
import { Button, Container, Heading, Input, Text } from "@medusajs/ui"
import { useEffect, useMemo, useRef, useState } from "react"

type SiteAsset = {
  id: string
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

type ProductCategory = {
  id: string
  name: string
  handle?: string | null
}

const SLOT_ORDER: Record<string, number> = {
  hero: 0,
  card: 1,
}

const toTitleCase = (value: string) => {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

const SiteAssetsPage = () => {
  const [assets, setAssets] = useState<SiteAsset[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [creatingAssets, setCreatingAssets] = useState(false)
  const [categoryQuery, setCategoryQuery] = useState("")
  const [selectedCategoryHandle, setSelectedCategoryHandle] = useState<string | null>(null)

  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({})

  const loadAssets = async () => {
    const res = await fetch("/admin/site-assets", {
      credentials: "include",
    })

    const data = await res.json()
    const loadedAssets = data.site_assets || []

    setAssets(loadedAssets)

    const initialDrafts: Record<string, string> = {}
    for (const asset of loadedAssets) {
      initialDrafts[asset.key] = asset.image_url || ""
    }
    setDrafts(initialDrafts)
  }

  const loadCategories = async () => {
    const res = await fetch("/admin/product-categories?limit=1000", {
      credentials: "include",
    })

    const data = await res.json()
    setCategories(data.product_categories || [])
  }

  useEffect(() => {
    loadAssets().catch(console.error)
    loadCategories().catch(console.error)
  }, [])

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

  const categoryAssets = useMemo(() => {
    if (!selectedCategoryHandle) {
      return []
    }

    return [...assets]
      .filter((asset) => {
        return (
          asset.scope === "category" &&
          asset.entity_type === "product_category" &&
          asset.entity_handle === selectedCategoryHandle
        )
      })
      .sort((a, b) => {
        const aSlot = SLOT_ORDER[a.slot || ""] ?? 999
        const bSlot = SLOT_ORDER[b.slot || ""] ?? 999

        if (aSlot !== bSlot) {
          return aSlot - bSlot
        }

        return (a.key || "").localeCompare(b.key || "")
      })
  }, [assets, selectedCategoryHandle])

  const missingSlots = useMemo(() => {
    const existingSlots = new Set(categoryAssets.map((asset) => asset.slot))
    return ["hero", "card"].filter((slot) => !existingSlots.has(slot))
  }, [categoryAssets])

  const handleCategoryInputChange = (value: string) => {
    setCategoryQuery(value)

    const matchedCategory = categoryOptions.find(
      (category) => category.name === value
    )

    if (matchedCategory?.handle) {
      setSelectedCategoryHandle(matchedCategory.handle)
      return
    }

    setSelectedCategoryHandle(null)
  }

  const saveAssetWithImageUrl = async (asset: SiteAsset, imageUrl: string) => {
    const res = await fetch("/admin/site-assets", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: asset.key,
        scope: asset.scope,
        entity_type: asset.entity_type,
        entity_handle: asset.entity_handle,
        slot: asset.slot,
        image_url: imageUrl,
        alt_text: asset.alt_text,
        content: asset.content,
        is_active: asset.is_active,
        sort_order: asset.sort_order,
        label: asset.label,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.message || "Save failed")
    }

    setAssets((prev) =>
      prev.map((item) =>
        item.key === asset.key ? data.site_asset : item
      )
    )

    setDrafts((prev) => ({
      ...prev,
      [asset.key]: data.site_asset.image_url || "",
    }))
  }

  const handleUpload = async (asset: SiteAsset, file: File) => {
    try {
      setUploadingKey(asset.key)

      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/admin/site-assets/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      const uploadData = await uploadRes.json()

      if (!uploadRes.ok) {
        throw new Error(uploadData?.message || "Upload failed")
      }

      const imageUrl = uploadData?.image_url

      if (!imageUrl) {
        throw new Error("Missing image_url from upload response")
      }

      setDrafts((prev) => ({
        ...prev,
        [asset.key]: imageUrl,
      }))

      setSavingKey(asset.key)
      await saveAssetWithImageUrl(asset, imageUrl)
    } catch (err) {
      console.error(err)
    } finally {
      setUploadingKey(null)
      setSavingKey(null)

      const input = fileInputsRef.current[asset.key]
      if (input) {
        input.value = ""
      }
    }
  }

  const saveAsset = async (asset: SiteAsset) => {
    try {
      setSavingKey(asset.key)
      await saveAssetWithImageUrl(asset, drafts[asset.key] || "")
    } catch (err) {
      console.error(err)
    } finally {
      setSavingKey(null)
    }
  }

  const createMissingAssetsForSelectedCategory = async () => {
    if (!selectedCategoryHandle || !selectedCategory || missingSlots.length === 0) {
      return
    }

    try {
      setCreatingAssets(true)

      const displayName =
        selectedCategory.name || toTitleCase(selectedCategoryHandle)

      const payloads = missingSlots.map((slot) => ({
        key: `category-${selectedCategoryHandle}-${slot}`,
        label: `${displayName} Category ${slot === "hero" ? "Hero" : "Card"}`,
        scope: "category",
        entity_type: "product_category",
        entity_handle: selectedCategoryHandle,
        slot,
        image_url: "",
        alt_text: displayName,
        content: null,
        is_active: true,
        sort_order: slot === "hero" ? 0 : 1,
      }))

      for (const payload of payloads) {
        const res = await fetch("/admin/site-assets", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(data?.message || "Create failed")
        }
      }

      await loadAssets()
    } catch (err) {
      console.error(err)
    } finally {
      setCreatingAssets(false)
    }
  }

  return (
    <Container className="p-6">
      <Heading level="h1">Site Assets</Heading>

      <Text className="mt-2 mb-6">
        Редакция на category banners за MTVZ.
      </Text>

      <div style={{ marginBottom: 24, maxWidth: 420 }}>
        <Text className="mb-2">Категория</Text>

        <Input
          list="site-assets-category-options"
          value={categoryQuery}
          onChange={(e) => handleCategoryInputChange(e.target.value)}
          placeholder="Търси по име на категория..."
        />

        <datalist id="site-assets-category-options">
          {categoryOptions.map((category) => (
            <option key={category.id} value={category.name} />
          ))}
        </datalist>

        <Text size="small" className="mt-2">
          Избран handle: {selectedCategory?.handle || "-"}
        </Text>
      </div>

      {!selectedCategoryHandle ? (
        <Text>Избери категория от полето по-горе.</Text>
      ) : (
        <>
          {missingSlots.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <Text>Липсващи assets: {missingSlots.join(", ")}</Text>

              <Button
                size="small"
                onClick={createMissingAssetsForSelectedCategory}
                disabled={creatingAssets}
              >
                {creatingAssets ? "Създаване..." : "Създай липсващите assets"}
              </Button>
            </div>
          ) : null}

          {categoryAssets.length === 0 ? (
            <Text>Няма category assets за избраната категория.</Text>
          ) : (
            categoryAssets.map((asset) => (
              <div
                key={asset.id}
                style={{
                  marginBottom: 24,
                  paddingBottom: 24,
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Text>
                  <strong>{asset.key}</strong> ({asset.slot}) → {asset.entity_handle}
                </Text>

                <Text size="small" className="mt-1 mb-2">
                  label: {asset.label || "-"}
                </Text>

                {drafts[asset.key] ? (
                  <div style={{ marginTop: 12 }}>
                    <img
                      src={drafts[asset.key]}
                      alt={asset.label || asset.key}
                      style={{
                        width: 320,
                        maxWidth: "100%",
                        height: 160,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                  </div>
                ) : (
                  <Text size="small" className="mt-3">
                    Няма качено изображение.
                  </Text>
                )}

                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    ref={(el) => {
                      fileInputsRef.current[asset.key] = el
                    }}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      handleUpload(asset, file)
                    }}
                  />

                  <Button
                    size="small"
                    onClick={() => saveAsset(asset)}
                    disabled={savingKey === asset.key || uploadingKey === asset.key}
                  >
                    {savingKey === asset.key
                      ? "Запис..."
                      : uploadingKey === asset.key
                      ? "Качване..."
                      : "Запази"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Site Assets",
  icon: PhotoSolid,
})

export default SiteAssetsPage