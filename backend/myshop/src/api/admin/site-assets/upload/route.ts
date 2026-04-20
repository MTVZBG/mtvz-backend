import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "node:fs/promises"
import path from "node:path"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const file = (req as any).file

  if (!file) {
    return res.status(400).json({
      message: "File is required.",
    })
  }

  const originalName = file.originalname || "upload.bin"
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "-")
  const fileName = `${Date.now()}-${safeName}`

  const staticDir = path.join(process.cwd(), "static")
  const filePath = path.join(staticDir, fileName)

  await fs.mkdir(staticDir, { recursive: true })
  await fs.writeFile(filePath, file.buffer)

  return res.status(200).json({
    image_url: `/static/${fileName}`,
  })
}