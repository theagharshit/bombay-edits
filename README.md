This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 📬 Communications & Notification Service (Email & SMS)

The project includes a central, pluggable communications engine (`src/backend/services/notification`) that dispatches luxury responsive HTML emails and carrier-compliant SMS text notifications across orders, inquiries, and newsletter subscriptions.

### Developer Studio & Live Preview

Inspect rendered email templates and live dispatch logs in your browser:
👉 **[http://localhost:3000/api/notifications/preview](http://localhost:3000/api/notifications/preview)**

---

### 1. Email Setup (Resend)

1. Create a free account at [resend.com](https://resend.com).
2. Generate an API Key in the Resend dashboard.
3. Add to `.env`:

```bash
RESEND_API_KEY="re_..."
# For instant testing without domain verification:
EMAIL_FROM="The Bombay Edit <onboarding@resend.dev>"
# For production with verified domain:
# EMAIL_FROM="The Bombay Edit <orders@thebombayedit.com>"
```

> **Note on Resend Sandbox**: When using `onboarding@resend.dev`, you can only send test emails to your registered Resend account address. Verify your domain at [resend.com/domains](https://resend.com/domains) to send to all customers.

---

### 2. SMS Setup (Twilio)

1. Create an account at [twilio.com](https://console.twilio.com).
2. On your Twilio Console homepage under **Account Info**, copy:
   - **Account SID**: Starts with `AC...` (⚠️ **Do NOT** use an API Key starting with `SK...` here)
   - **Auth Token**: Click "Show" and copy your primary 32-character Auth Token
   - **My Twilio Phone Number**: Your assigned sender number (e.g. `+1xxxxxxxxxx`)
3. Add to `.env`:

```bash
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_PHONE_NUMBER="+1xxxxxxxxxx"
```

#### Twilio Configuration & Troubleshooting

- **Twilio Code 20003 (Authenticate)**:
  - Occurs if you set an API Key (`SK...`) as the Account SID instead of your primary `AC...` SID.
  - Or if you use an API Secret with an `AC...` SID. Make sure to use your primary Auth Token.
- **Twilio Code 21408 / Geo-Permissions (India +91)**:
  - By default, Twilio blocks international messaging.
  - Fix: Go to **Twilio Console &rarr; Messaging &rarr; Settings &rarr; Geo-Permissions** &rarr; Search **India (+91)** &rarr; Check the box and Save.
- **Twilio Code 572002 (Unverified Recipient)**:
  - On a trial account, you must add recipient numbers under **Phone Numbers &rarr; Manage &rarr; Verified Caller IDs**.
- **Twilio Code 572006 (Invalid template name / Trial restrictions)**:
  - Twilio free trial accounts restrict REST API messages to pre-defined Twilio templates to prevent spam abuse.
  - **Resolution**: Click **"Upgrade Account"** in the top bar of Twilio Console and add a payment method ($15–$20 credit). This removes sandbox restrictions and allows arbitrary luxury SMS text dispatch globally.
