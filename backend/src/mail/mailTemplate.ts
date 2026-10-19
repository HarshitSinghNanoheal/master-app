const YEAR = new Date().getFullYear()

const esc = (value: string) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

/** Same email-safe layout Resolv uses for invitation and notification mail. */
const EMAIL_CSS = `
  body { margin: 0; padding: 0; background: #F5F6FA; }
  .wrap { padding: 32px 16px; }
  .card {
    background: #ffffff;
    max-width: 560px;
    margin: 0 auto;
    padding: 28px 32px;
    border-radius: 16px;
    border: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.04);
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    color: #475569;
  }
  .brand { font-size: 13px; font-weight: 700; letter-spacing: -0.02em; color: #0f172a; }
  .eyebrow {
    margin-top: 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #94a3b8;
  }
  .title {
    margin: 6px 0 20px;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: #0f172a;
    line-height: 1.25;
  }
  .body p { font-size: 15px; line-height: 1.6; margin: 0 0 12px; color: #475569; }
  .body a { color: #2563eb; text-decoration: none; }
  .footer {
    margin-top: 28px;
    padding-top: 16px;
    border-top: 1px solid rgba(226, 232, 240, 0.8);
    font-size: 12px;
    color: #94a3b8;
    text-align: center;
  }
`

const renderEmail = (eyebrow: string, title: string, body: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <style>${EMAIL_CSS}</style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="brand">Master</div>
      <div class="eyebrow">${esc(eyebrow)}</div>
      <h1 class="title">${esc(title)}</h1>
      <div class="body">${body}</div>
      <div class="footer">&copy; ${YEAR} Master. All rights reserved.</div>
    </div>
  </div>
</body>
</html>`

export const applicationAddedMail = (
  name: string,
  applicationName: string,
  tenantName: string,
) =>
  renderEmail(
    "Access",
    `You've been added to ${applicationName}`,
    `<p>Hello ${esc(name)},</p>
     <p>You have been added to <strong>${esc(applicationName)}</strong> for <strong>${esc(tenantName)}</strong>.</p>
     <p>Sign in with this email address to open it.</p>
     <p>Thank you,<br/>Master</p>`,
  )
