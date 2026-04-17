import { Module } from "@medusajs/framework/utils"
import SiteAssetsService from "./services/site-assets"

export const SITE_ASSETS_MODULE = "site_assets"

export default Module(SITE_ASSETS_MODULE, { service: SiteAssetsService })
