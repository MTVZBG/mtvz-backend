import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import crypto from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

const ALLOWED_IMAGE_EXTENSIONS: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
}

type UploadedFile = {
  originalname?: string
  mimetype?: string
  size?: number
  buffer?: Buffer
}

const isJpeg = (buffer: Buffer) =>
  buffer.length >= 3 &&
  buffer[0] === 0xff &&
  buffer[1] === 0xd8 &&
  buffer[2] === 0xff

const isPng = (buffer: Buffer) => {
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

  return (
    buffer.length >= pngSignature.length &&
    pngSignature.every((byte, index) => buffer[index] === byte)
  )
}

const isWebp = (buffer: Buffer) =>
  buffer.length >= 12 &&
  buffer.toString("ascii", 0, 4) === "RIFF" &&
  buffer.toString("ascii", 8, 12) === "WEBP"

const hasValidImageSignature = (mimeType: string, buffer: Buffer) => {
  if (mimeType === "image/jpeg") {
    return isJpeg(buffer)
  }

  if (mimeType === "image/png") {
    return isPng(buffer)
  }

  if (mimeType === "image/webp") {
    return isWebp(buffer)
  }

  return false
}

const createSafeFileName = (originalName: string, extension: string) => {
  const rawBaseName = path.basename(originalName, path.extname(originalName))
  const safeBaseName =
    rawBaseName
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "image"

  return `${Date.now()}-${crypto.randomUUID()}-${safeBaseName}${extension}`
}

const resolveProjectStaticDir = () => {
  const cwd = path.resolve(process.cwd())
  const medusaServerMarker = `${path.sep}.medusa${path.sep}server`
  const markerIndex = cwd.lastIndexOf(medusaServerMarker)

  if (markerIndex >= 0) {
    return path.join(cwd.slice(0, markerIndex), "static")
  }

  return path.join(cwd, "static")
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const file = (req as any).file as UploadedFile | undefined

  if (!file) {
    return res.status(400).json({
      message: "File is required.",
    })
  }

  if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
    return res.status(400).json({
      message: "Invalid image signature.",
    })
  }

  if ((file.size || file.buffer.length) > MAX_UPLOAD_BYTES) {
    return res.status(400).json({
      message: "File is too large. Maximum size is 5 MB.",
    })
  }

  const mimeType = String(file.mimetype || "").toLowerCase()
  const allowedExtensions = ALLOWED_IMAGE_EXTENSIONS[mimeType]

  if (!allowedExtensions) {
    return res.status(400).json({
      message: "Unsupported MIME type. Only JPEG, PNG, and WebP images are allowed.",
    })
  }

  const originalName = file.originalname || "upload.bin"
  const extension = path.extname(originalName).toLowerCase()

  if (!allowedExtensions.includes(extension)) {
    return res.status(400).json({
      message: "Unsupported file extension. Only .jpg, .jpeg, .png, and .webp are allowed.",
    })
  }

  if (!hasValidImageSignature(mimeType, file.buffer)) {
    return res.status(400).json({
      message: "Invalid image signature.",
    })
  }

  const fileName = createSafeFileName(originalName, extension)

  const staticDir = resolveProjectStaticDir()
  const filePath = path.join(staticDir, fileName)

  await fs.mkdir(staticDir, { recursive: true })
  await fs.writeFile(filePath, file.buffer)

  return res.status(200).json({
    image_url: `/static/${fileName}`,
  })
}
