import { model } from "@medusajs/framework/utils"

const CategorySeoContent = model.define("category_seo_content", {
  id: model.id().primaryKey(),
  category_handle: model.text(),
  locale: model.text().default("bg"),
  seo_title: model.text(),
  seo_description: model.text(),
  intro_text: model.text(),
  bottom_text: model.text(),
  faq: model.json().nullable(),
  is_active: model.boolean().default(true),
})

export default CategorySeoContent
