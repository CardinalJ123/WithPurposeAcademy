# With Purpose Academy — Setup Guide

A poker-education platform: Google/email sign-up, an admin-approval gate, a
course catalogue, Stripe checkout, and a private library where buyers read
or download their purchased PDFs.

Stack: Next.js (App Router) · Firebase (Auth, Firestore, Storage) · Stripe ·
Tailwind v4 · Motion · Lenis.

## 1. Create the Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com) → **Add project**.
2. **Build → Authentication → Sign-in method**: enable **Google** and
   **Email/Password**.
3. **Build → Firestore Database**: create a database (production mode is
   fine — the security rules in `firestore.rules` lock it down).
4. **Build → Storage**: create the default bucket (this is where course PDFs
   live).
5. **Project settings → General → Your apps → Web app**: register a web app
   and copy the config values — these fill the `NEXT_PUBLIC_FIREBASE_*`
   variables in `.env.local`.
6. **Project settings → Service accounts → Generate new private key**:
   downloads a JSON file. Paste its *entire contents* as one line into
   `FIREBASE_SERVICE_ACCOUNT` in `.env.local` (or base64-encode it first —
   the app accepts either form). **Never commit this file.**

### Deploy the security rules

With the [Firebase CLI](https://firebase.google.com/docs/cli) installed and
logged in:

```bash
firebase deploy --only firestore:rules,storage:rules --project your-project-id
```

These rules deny all direct client writes (every write goes through the
server API routes with the Admin SDK) and deny all direct Storage reads
(PDFs are only ever served through signed URLs from `/api/download`, after
an ownership check).

## 2. Set up Stripe

You mentioned Stripe is already configured on your account — you just need:

1. **Developers → API keys**: copy the **Secret key** into
   `STRIPE_SECRET_KEY`.
2. **Developers → Webhooks → Add endpoint**:
   - URL: `https://your-domain.com/api/webhook`
   - Event: `checkout.session.completed`
   - Copy the **Signing secret** into `STRIPE_WEBHOOK_SECRET`.
3. For local testing, use the [Stripe CLI](https://stripe.com/docs/stripe-cli)
   instead of a live webhook:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
   It prints a `whsec_...` value for local `.env.local` use.

All prices are charged in **USD**, one-time per course (no subscriptions).

## 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in every value described in `.env.example`. `ADMIN_EMAILS` is a
comma-separated list — any account that signs up (or already exists) with a
matching email is automatically made an admin with `status: approved` the
moment they complete their profile.

## 4. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## 5. Create your admin account

1. Add your email to `ADMIN_EMAILS` in `.env.local` before signing up.
2. Sign up on the site (Google or email).
3. You'll be auto-approved as an admin and see an **Admin** link in the nav.
4. Visit `/admin` to manage users and courses.

## 6. Add sample course PDFs

Three ready-made sample poker PDFs (Beginner/Intermediate/Advanced, ~4 pages
each, styled to match the brand) can be generated locally:

```bash
npm run samples
```

This writes three files into `./samples/` (gitignored). Upload each one from
**Admin → Courses → New course**, filling in a title, summary, description,
level, and your price — the PDF itself is what gets uploaded through the
form.

## 7. How the approval + purchase flow works

1. A visitor signs up with Google or email. Either way, a Firestore profile
   is provisioned automatically from their account name — no extra step.
2. Their account is created with `status: "pending"`.
3. An admin reviews and **Approves** them from `/admin` → Users tab.
4. Only `approved` accounts can start a Stripe Checkout session
   (`/api/checkout` enforces this server-side — it's not just a UI gate).
5. On successful payment, Stripe calls `/api/webhook`, which records the
   purchase in Firestore. The course instantly appears in the buyer's
   `/library`.
6. `/api/download` issues a 15-minute signed URL for the PDF, only after
   re-verifying the requester owns that course (or is an admin).

## 8. Deploying

This app uses Next.js API routes (for Stripe checkout/webhooks and signed
Firebase Admin calls), so it needs a Node server — **not** a static export.
[Vercel](https://vercel.com) is the simplest option:

1. Push this repo to GitHub (see below).
2. Import it in Vercel, set the **Root Directory** to `withpurpose`.
3. Add all the same environment variables from `.env.local` in the Vercel
   project settings.
4. After the first deploy, update the Stripe webhook endpoint URL to your
   real domain, and set `NEXT_PUBLIC_SITE_URL` to match.

## 9. Before submitting to Stripe for approval

Stripe reviewers check that a live, working site clearly explains what is
being sold and shows working legal pages. This site includes, linked in the
footer of every page:

- **Terms & Conditions** (`/terms`) — explicitly states this is an
  *educational* product, not gambling; no wagers are accepted or held.
- **Privacy Policy** (`/privacy`) — explains what account data is collected and how it's used.
- **Refund Policy** (`/refunds`) — 14-day window, conditions.
- **Cookie Policy** (`/cookies`) + a cookie consent banner on first visit.

Make sure, before submitting:

- [ ] At least one real course is published and purchasable end-to-end.
- [ ] The Stripe account's business description matches "digital poker
      education / e-learning," not anything gambling-related.
- [ ] `site.address` in `src/lib/site.ts` is updated to your real registered
      business address (a placeholder is there now).
- [ ] `site.email` matches a real, monitored support inbox.
