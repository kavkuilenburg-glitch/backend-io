# Backend.io — Complete Setup Guide
## From Zero to Running App (Step by Step)

---

## What You're Building

Backend.io is a web app that connects to your Shopify store and gives you:

- **Auto address validation** — detects wrong addresses, emails customers automatically
- **Order management** — dynamic sheet tracking all unfulfilled orders
- **Auto email flows** — customers get updates at every shipping stage
- **Profit sheet** — auto-calculated P&L from your Shopify data
- **Stock management** — toggle products in/out of stock, restock forecaster
- **Tracking page** — customizable page (like Track123) customers visit to track orders
- **Post office notifications** — auto-emails when packages are at pickup points

---

## Prerequisites (What You Need)

Before starting, make sure you have these installed on your computer:

### 1. Node.js (the engine that runs the app)
- Go to **https://nodejs.org**
- Download the **LTS version** (the green button)
- Install it (just click Next through everything)
- To verify, open Terminal (Mac) or Command Prompt (Windows) and type:
```
node --version
```
You should see something like `v20.x.x`

### 2. Git (for version control)
- Go to **https://git-scm.com/downloads**
- Download and install for your OS
- Verify: `git --version`

### 3. A Code Editor
- Download **VS Code**: https://code.visualstudio.com
- This is where you'll view and edit files

### 4. A Shopify Store
- You need a Shopify store (even a free trial works)
- You'll connect it via API

---

## Step 1: Set Up the Project on Your Computer

Open your Terminal (Mac) or Command Prompt (Windows):

```bash
# 1. Navigate to where you want the project (e.g., Desktop)
cd ~/Desktop

# 2. Create the project folder
mkdir backend-io
cd backend-io

# 3. Initialize the project (creates package.json)
npm init -y
```

Now copy ALL the project files I created into this folder. The structure should look like:

```
backend-io/
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── .gitignore
├── prisma/
│   ├── schema.prisma
│   └── seed.js
└── src/
    ├── lib/
    │   ├── db.js
    │   ├── shopify.js
    │   ├── email.js
    │   ├── address.js
    │   ├── profit.js
    │   └── forecast.js
    ├── pages/
    │   ├── _app.js
    │   ├── api/
    │   │   ├── store/connect.js
    │   │   ├── sync/index.js
    │   │   ├── orders/index.js
    │   │   ├── products/index.js
    │   │   ├── emails/index.js
    │   │   ├── profit/index.js
    │   │   └── tracking/
    │   │       ├── config.js
    │   │       └── [trackingNumber].js
    │   └── track/
    │       ├── index.jsx
    │       └── [trackingNumber].jsx
    └── styles/
        └── globals.css
```

---

## Step 2: Install Dependencies

In your terminal, inside the `backend-io` folder:

```bash
# Install all packages (this takes 1-2 minutes)
npm install next react react-dom @prisma/client shopify-api-node nodemailer cron jsonwebtoken bcryptjs zustand

# Install dev dependencies
npm install -D prisma tailwindcss postcss autoprefixer

# Initialize Prisma
npx prisma init
```

**What just happened?** You installed:
- **Next.js** — the framework that runs your app (like the engine of a car)
- **Prisma** — talks to your database (like a translator)
- **Shopify API** — connects to your Shopify store
- **Nodemailer** — sends emails
- **Tailwind CSS** — makes things look nice

---

## Step 3: Set Up a Free Database

You need a database to store orders, products, emails, etc. We'll use **Neon** (free):

1. Go to **https://neon.tech** and sign up (free)
2. Click **"New Project"**
3. Name it `backendio`
4. Choose the region closest to you (e.g., `eu-west` for Europe)
5. Click **Create**
6. You'll see a connection string like:
   ```
   postgresql://username:password@ep-xxxx.eu-west-2.aws.neon.tech/neondb?sslmode=require
   ```
7. **Copy this string** — you'll need it in the next step

---

## Step 4: Configure Environment Variables

1. In your project folder, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Open `.env` in VS Code and fill in your values:

```env
# Paste your Neon database URL here
DATABASE_URL="postgresql://username:password@ep-xxxx.neon.tech/neondb?sslmode=require"

# Leave these empty for now (we'll set up Shopify next)
SHOPIFY_STORE_URL="yourstore.myshopify.com"
SHOPIFY_ACCESS_TOKEN=""

# Email — we'll use Resend (free) — set up in Step 6
SMTP_HOST="smtp.resend.com"
SMTP_PORT="465"
SMTP_USER="resend"
SMTP_PASS=""
EMAIL_FROM="tracking@yourdomain.com"

# Generate a random secret (paste any random long text)
APP_SECRET="paste-a-random-string-here-make-it-long"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_TRACKING_URL="http://localhost:3000/track"
```

---

## Step 5: Create the Database Tables

```bash
# This reads your schema.prisma file and creates all the tables
npx prisma db push
```

You should see: `Your database is now in sync with your Prisma schema`

To add sample data for testing:
```bash
npm run db:seed
```

You should see:
```
🌱 Seeding database...
  ✅ Store created: Demo Store
  ✅ 8 products created
  ✅ 6 orders created
  ✅ Tracking config created
  ✅ Profit entries created
🎉 Seed complete!
```

---

## Step 6: Set Up Shopify API Access

This connects your real Shopify store to Backend.io:

1. Log into your **Shopify Admin** (yourstore.myshopify.com/admin)
2. Go to **Settings** → **Apps and sales channels**
3. Click **"Develop apps"** (top right)
4. Click **"Allow custom app development"** if prompted
5. Click **"Create an app"**
6. Name it: `Backend.io`
7. Click **"Configure Admin API scopes"**
8. Check these boxes:
   - ✅ `read_orders`
   - ✅ `write_orders`
   - ✅ `read_products`
   - ✅ `write_products`
   - ✅ `read_customers`
   - ✅ `read_fulfillments`
   - ✅ `write_fulfillments`
   - ✅ `read_inventory`
   - ✅ `write_inventory`
9. Click **Save**
10. Click **"Install app"**
11. Under **Admin API access token**, click **"Reveal token once"**
12. **COPY THIS TOKEN** — you can only see it once!
13. Paste it in your `.env` file:
```env
SHOPIFY_STORE_URL="yourstore.myshopify.com"
SHOPIFY_ACCESS_TOKEN="shpat_your_token_here"
```

---

## Step 7: Set Up Email Sending (Free)

We'll use **Resend** which gives you 3,000 free emails/month:

1. Go to **https://resend.com** and sign up
2. Go to **API Keys** → **Create API Key**
3. Copy the key (starts with `re_`)
4. Paste in your `.env`:
```env
SMTP_HOST="smtp.resend.com"
SMTP_PORT="465"
SMTP_USER="resend"
SMTP_PASS="re_your_api_key_here"
```

### To send from your own domain (recommended):
1. In Resend, go to **Domains** → **Add Domain**
2. Enter your domain (e.g., `yourdomain.com`)
3. Resend will give you DNS records to add
4. Go to your domain registrar (Cloudflare, Namecheap, etc.)
5. Add the DNS records Resend gives you
6. Wait for verification (usually 5-30 minutes)
7. Update your `.env`:
```env
EMAIL_FROM="tracking@yourdomain.com"
```

---

## Step 8: Run the App Locally

```bash
# Start the development server
npm run dev
```

You should see:
```
▲ Next.js 14.x
- Local: http://localhost:3000
```

Open **http://localhost:3000** in your browser — your app is running!

### Test the tracking page:
Open **http://localhost:3000/track/NL4829104821** — this shows the customer tracking page with sample data.

---

## Step 9: Deploy to the Internet (Free)

We'll use **Vercel** — it's free and made by the same people who made Next.js:

### First, push your code to GitHub:
```bash
# In your project folder:
git init
git add .
git commit -m "Initial commit - Backend.io"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/backend-io.git
git branch -M main
git push -u origin main
```

### Then deploy on Vercel:
1. Go to **https://vercel.com** and sign up with GitHub
2. Click **"New Project"**
3. Import your `backend-io` repository
4. **IMPORTANT:** Add your environment variables:
   - Click **"Environment Variables"**
   - Add each variable from your `.env` file
   - Make sure to update `NEXT_PUBLIC_APP_URL` to your Vercel URL
5. Click **Deploy**

After ~1 minute, your app is live at `https://backend-io.vercel.app` (or similar).

### Update your tracking URL:
Go back to Vercel → Settings → Environment Variables and update:
```
NEXT_PUBLIC_TRACKING_URL=https://your-app.vercel.app/track
```

---

## Step 10: Custom Domain (Optional)

To use `track.yourdomain.com` instead of `backend-io.vercel.app`:

1. In Vercel, go to **Settings** → **Domains**
2. Add `track.yourdomain.com`
3. Vercel will show you a CNAME record to add
4. Go to your DNS provider and add:
   - Type: `CNAME`
   - Name: `track`
   - Value: `cname.vercel-dns.com`
5. Wait for DNS to propagate (5-30 minutes)

Now your tracking page lives at: `https://track.yourdomain.com/NL4829104821`

---

## How Everything Connects

Here's the flow of how the app works:

```
┌─────────────────┐
│  Your Shopify   │ ←── Orders, products, fulfillments
│     Store       │
└────────┬────────┘
         │ Shopify API (syncs automatically)
         ▼
┌─────────────────┐
│   Backend.io    │ ←── YOUR DASHBOARD
│    Dashboard    │     - Manage orders
│   (Admin app)   │     - Track stock
│                 │     - View profits
│                 │     - Customize tracking page
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│ Email  │ │ Tracking Page│ ←── CUSTOMER-FACING
│ System │ │ (Public URL) │     https://track.yourdomain.com/NL123
│        │ │              │
│ Sends: │ │ Shows:       │
│ • Wrong│ │ • Status     │
│   addr │ │ • Timeline   │
│ • Ship │ │ • Map        │
│   notif│ │ • Products   │
│ • Post │ │ • Support    │
│   office│ │ • Custom     │
│ • Deliv│ │   sections   │
└────────┘ └──────────────┘
```

---

## What Each File Does

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Defines your database tables (like a blueprint) |
| `prisma/seed.js` | Creates sample data for testing |
| `src/lib/db.js` | Connects to the database |
| `src/lib/shopify.js` | Talks to Shopify's API — syncs orders & products |
| `src/lib/email.js` | Sends emails (address alerts, shipping updates) |
| `src/lib/address.js` | Validates addresses, auto-sends fix-it emails |
| `src/lib/profit.js` | Calculates monthly revenue/costs/profit |
| `src/lib/forecast.js` | Predicts when products will go out of stock |
| `src/pages/api/*` | API endpoints the dashboard calls |
| `src/pages/track/` | The customer-facing tracking page |
| `.env` | Your secret keys (never share this!) |

---

## Troubleshooting

### "Cannot find module" error
```bash
rm -rf node_modules
npm install
```

### Database connection error
- Check your `DATABASE_URL` in `.env`
- Make sure there are no spaces or extra characters
- Try: `npx prisma db push` again

### Shopify API error
- Double-check your access token (it's long, starts with `shpat_`)
- Make sure all API scopes are checked
- Verify your store URL is correct (include `.myshopify.com`)

### Emails not sending
- Check your Resend API key
- Make sure your domain is verified (check Resend dashboard)
- Look at the server console for error messages

### Tracking page shows "not found"
- Make sure you seeded the database: `npm run db:seed`
- The demo tracking number is: `NL4829104821`

---

## Next Steps

Once everything is running:

1. **Connect your real Shopify store** via the Settings page
2. **Customize your tracking page** in the Tracking Page tab
3. **Set up email flows** in the Email Flow tab
4. **Add your product costs** in the Stock tab (for accurate profit calculations)
5. **Set up your custom domain** for a professional tracking URL

---

*Built with Backend.io — Questions? Open an issue on GitHub.*
