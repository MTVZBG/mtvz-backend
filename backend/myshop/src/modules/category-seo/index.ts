import { Module } from "@medusajs/framework/utils"
import CategorySeoService from "./services/category-seo"

export const CATEGORY_SEO_MODULE = "category_seo"

export default Module(CATEGORY_SEO_MODULE, { service: CategorySeoService })
