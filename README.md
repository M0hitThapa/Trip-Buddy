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

1. Create a new Vercel project and import this repository.
2. Set the following Environment Variables in Vercel Project Settings → Environment Variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CONVEX_URL`
   - `OPENROUTER_API_KEY`
   - `GOOGLE_MAPS_API_KEY`
   - (optional) `ARCJET_KEY`
3. Framework Preset: Next.js. No additional build command is needed (uses `npm run build`).
4. Add the following domains to providers if needed:
   - Clerk: Allowed Origins (add your Vercel domain) and Webhooks if used
   - Google Maps: Enable Places API and add your domain to restrictions
5. Click Deploy.

Notes
- This project uses Next.js App Router and Edge-friendly APIs. No custom `vercel.json` is required.
- To run locally, copy `.env.example` to `.env.local` and fill values, then `npm run dev`.
