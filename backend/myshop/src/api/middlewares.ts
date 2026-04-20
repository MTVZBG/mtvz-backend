import { defineMiddlewares } from "@medusajs/framework/http"
import multer from "multer"

const upload = multer({ storage: multer.memoryStorage() })

export default defineMiddlewares({
  routes: [
    {
      method: ["POST"],
      matcher: "/admin/site-assets/upload",
      middlewares: [
        // @ts-ignore
        upload.single("file"),
      ],
    },
  ],
})