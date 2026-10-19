import nodemailer from "nodemailer"
import type { Application } from "../../generated/prisma/enums.ts"
import { applicationAddedMail } from "./mailTemplate.ts"

const SMTP_HOST = process.env.SMTP_HOST ?? "smtp-mail.outlook.com"
const SMTP_USER = process.env.SMTP_USER ?? "noreply@nanoheal.com"
const SMTP_PWD = process.env.SMTP_PWD ?? ""

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PWD,
  },
})

const APPLICATION_NAMES: Record<Application, string> = {
  RESOLV: "Resolv",
  USTOR: "Ustor",
  VAPT: "VAPT",
}

const stripHtmlToText = (html: string) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(p|div|h1|h2|h3|br)\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

export function applicationName(application: Application): string {
  return APPLICATION_NAMES[application]
}

export const sendApplicationAddedMail = async (
  email: string,
  name: string,
  application: Application,
  tenantName: string,
) => {
  const label = applicationName(application)
  try {
    const html = applicationAddedMail(name, label, tenantName)
    await transporter.sendMail({
      from: `Master <${process.env.SMTP_USER ?? "noreply@nanoheal.com"}>`,
      to: email,
      subject: `You've been added to ${label}`,
      text: stripHtmlToText(html),
      html,
    })
    console.log(`Sent application email to ${email} for ${label}`)
  } catch (error) {
    console.log(`Failed to send email to ${email}:`, error)
  }
}
