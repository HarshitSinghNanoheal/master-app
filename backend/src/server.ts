import "dotenv/config"
import { createApp } from "./app.ts"
import { prisma } from "./prisma.ts"

const app = createApp()
const port = process.env.PORT || 3000

await prisma.$connect()

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})
