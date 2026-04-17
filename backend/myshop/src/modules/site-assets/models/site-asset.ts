import { model } from "@medusajs/framework/utils"

const SiteAsset = model.define("site_asset", {
  id: model.id().primaryKey(),
  key: model.text(),
  scope: model.text(),
  entity_type: model.text(),
  entity_handle: model.text().nullable(),
  slot: model.text(),
  label: model.text(),
  image_url: model.text(),
  alt_text: model.text(),
  content: model.json().nullable(),
  is_active: model.boolean().default(true),
  sort_order: model.number().default(0),
})

export default SiteAsset