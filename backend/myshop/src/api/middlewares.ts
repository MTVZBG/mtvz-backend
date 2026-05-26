import { defineMiddlewares } from "@medusajs/framework/http"
import multer from "multer"

const MAX_SITE_ASSET_UPLOAD_BYTES = 5 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_SITE_ASSET_UPLOAD_BYTES,
    files: 1,
  },
})

const siteAssetUploadMiddleware = (req: any, res: any, next: any) => {
  upload.single("file")(req, res, (err: any) => {
    if (!err) {
      return next()
    }

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File is too large. Maximum size is 5 MB.",
      })
    }

    return res.status(400).json({
      message: "Invalid upload.",
    })
  })
}

export default defineMiddlewares({
  routes: [
    {
      method: ["POST"],
      matcher: "/admin/site-assets/upload",
      middlewares: [siteAssetUploadMiddleware],
    },
  ],
})
