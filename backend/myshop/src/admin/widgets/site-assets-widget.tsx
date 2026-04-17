import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Input, Text } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"

const SiteAssetsWidget = (props: any) => {
  const [assets, setAssets] = useState<any[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const product =
    props?.data?.product ??
    props?.product ??
    props?.data

  useEffect(() => {
    fetch("/admin/site-assets", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const loadedAssets = data.site_assets || []
        setAssets(loadedAssets)

        const initialDrafts: Record<string, string> = {}
        for (const asset of loadedAssets) {
          initialDrafts[asset.key] = asset.image_url || ""
        }
        setDrafts(initialDrafts)
      })
  }, [])

  const filteredAssets = useMemo(() => {
    return assets.filter((asset: any) => {
      return (
        asset?.scope === "category" &&
        asset?.entity_type === "product_category"
      )
    })
  }, [assets])

  const updateDraft = (key: string, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const saveAsset = async (asset: any) => {
    try {
      setSavingKey(asset.key)

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
          image_url: drafts[asset.key] || "",
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
    } catch (err) {
      console.error(err)
      alert("Грешка при запис.")
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <Container className="p-4">
      <Heading level="h2">Site Assets (MTVZ)</Heading>

      <Text className="mb-4">
        Продуктова категория: {product?.categories?.[0]?.handle ?? "-"}
      </Text>

      {filteredAssets.length === 0 ? (
        <Text>Няма category assets.</Text>
      ) : (
        filteredAssets.map((asset: any) => (
          <div key={asset.id} style={{ marginBottom: 16 }}>
            <Text>
              {asset.key} ({asset.slot}) → {asset.entity_handle}
            </Text>

            <Input
              value={drafts[asset.key] || ""}
              onChange={(e) => updateDraft(asset.key, e.target.value)}
            />

            <div style={{ marginTop: 8 }}>
              <Button
                size="small"
                onClick={() => saveAsset(asset)}
                disabled={savingKey === asset.key}
              >
                {savingKey === asset.key ? "Запис..." : "Запази"}
              </Button>
            </div>
          </div>
        ))
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.before",
})

export default SiteAssetsWidget