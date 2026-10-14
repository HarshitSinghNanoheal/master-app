import { Router } from "express"
import { prisma } from "../prisma.ts"

export const healthRouter = Router()

healthRouter.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ ok: true })
  } catch {
    res.status(503).json({ ok: false })
  }
})
