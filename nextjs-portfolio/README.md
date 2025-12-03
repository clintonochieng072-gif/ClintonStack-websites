# ClintonStack — Multi-Tenant Niche Website SaaS

A multi-tenant SaaS platform that allows users to instantly get a fully functional website + admin dashboard tailored to their specific business niche. No drag-and-drop, no templates, no coding — just fill in the fields and your site is live.

## Features

- **Multi-Tenant Architecture**: Each user has isolated database space and cannot access others' data.
- **Niche-Specific Admin Dashboards**: Pre-built admin panels with industry-specific input fields (e.g., Car Dealers: add cars, prices, photos; Plumbers: services, pricing, testimonials).
- **Auto-Generated Public Websites**: Websites update instantly when admin data changes. Includes homepage, about, services/portfolio, contact, gallery, and niche-specific pages.
- **Layout Styles**: Choose between Minimal, Modern, Classic styles for your public site.
- **Responsive & Mobile-Friendly**: All generated sites work perfectly on any device.
- **Subdomain Hosting**: Default username.clintonstack.app with custom domain support.
- **Email/Password Authentication**: JWT-based sessions with secure login.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- MongoDB + Mongoose
- SWR for data fetching

## Setup & Run

1. **Install deps**:

   ```bash
   npm install
   ```

2. **Environment**:
   Add to `.env.local`:

   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/clintonstack
   JWT_SECRET=your-secret-here
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. **Seed demo data**:

   ```bash
   npx tsx scripts/seed.ts
   ```

4. **Run dev server**:

   ```bash
   npm run dev
   ```

5. **Access**:
   - **Public site**: Visit `/site/demo-plumber`
   - **Admin editor**: Visit `/admin/site/editor/{siteId}` (replace {siteId} with the seeded site's ID from DB)
     - You'll need to set a JWT cookie `token` with payload `{ id: 'demo-user-1' }` to authenticate.

## API Endpoints

- `GET /api/site/me` — Get current user's site
- `POST /api/site` — Create new site
- `GET /api/site/[id]` — Get site by ID
- `PUT /api/site/[id]` — Update site blocks/title/theme/published
- `GET /api/site/public/[slug]` — Public site data (only if published)

## Niche Configs

Located in `niches/*.json`. Example:

```json
{
  "slug": "plumber",
  "displayName": "Plumber",
  "blocks": [
    "profile",
    "services",
    "emergency_button",
    "testimonials",
    "gallery",
    "contact"
  ]
}
```

## Sample Blocks

- **profile**: Name, title, bio, photo
- **services**: List of services with title/description
- **emergency_button**: Call-to-action button with phone
- **gallery**: Image grid
- **testimonials**: Customer reviews
- **contact**: Email, phone, social links

## Deployment to Vercel

1. **Connect GitHub Repository**: Link your GitHub repo to Vercel.

2. **Environment Variables**: In Vercel dashboard, set the following environment variables (copy from `.env.example`):

   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `PUSHER_APP_ID`
   - `PUSHER_KEY`
   - `PUSHER_SECRET`
   - `PUSHER_CLUSTER`
   - `NEXT_PUBLIC_PUSHER_KEY`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`
   - `EMAIL_HOST`
   - `EMAIL_PORT`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `FRONTEND_URL`
   - `NEXT_PUBLIC_BASE_URL`
   - `NODE_ENV=production`

3. **Build Settings**: Vercel auto-detects Next.js, no additional config needed.

4. **Deploy**: Push to main branch or deploy manually.

## Notes

- Media uploads stubbed (paste URLs for now).
- Auth is stubbed — replace `getUserFromToken` with your real auth.
- No production file uploads or payments implemented.
- Extend blocks by adding to niche configs and implementing editors/renderers.
