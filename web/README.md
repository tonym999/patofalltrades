This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, set environment variables for email (Resend):

```
RESEND_API_KEY=your_resend_api_key
CONTACT_TO_EMAIL=your_destination_email@example.com
CONTACT_FROM_EMAIL="Pat Of All Trades <onboarding@resend.dev>"
```

Then run the development server (pnpm is the default package manager for this repo):

```bash
corepack enable
corepack prepare pnpm@10.17.1 --activate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Development workflow

- **Dev server (with Turbopack)**: `pnpm dev` starts the watcher. It hot-reloads changes using Fast Refresh.
- **What hot-reloads**:
  - Client components, styles, and static assets are swapped in place without a full page reload.
  - Server components and API routes trigger a refresh on change.
- **When to restart**: Changes to `next.config.ts`, `tsconfig.json`, or dependencies usually require stopping and re-running `pnpm dev`.
- **Windows note**: Avoid running `pnpm build` while the dev server is active; Windows can lock `.next` files. Use one or the other.
- **Production build**: `pnpm build` then `pnpm start` to serve the optimized output.
- **Images**: When using `next/image` with `fill`, ensure the parent has a positioned container (e.g., `relative` + explicit size or `absolute inset-0`) so the image can render.

## Package manager

This repository uses pnpm. Key commands:

```bash
pnpm install            # install deps
pnpm dev                # start dev server
pnpm build              # build production bundle
pnpm run start:test     # build+start server for e2e
pnpm run test:e2e       # run all e2e tests
pnpm run test:e2e:smoke # run smoke e2e tests
```

Postinstall build scripts are allowlisted via `package.json` → `pnpm.onlyBuiltDependencies`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Portfolio image pairs

The portfolio section auto-discovers before/after image pairs from `public/portfolio/<category>/`.

- Naming pattern: `{category}-{location}-{pairId}-{before|after}.{ext}`
  - `category`: e.g., `kitchen`, `bathroom`, `exterior`
  - `location`: short area or borough, kebab-case (e.g., `southwark`, `kensington`)
  - `pairId`: 3-digit sequence per project (e.g., `001`, `002`)
  - `before|after`: literal `before` or `after`
  - `ext`: `jpg`, `jpeg`, `png`, or `webp`

Example

```
public/portfolio/kitchen/kitchen-southwark-001-before.jpg
public/portfolio/kitchen/kitchen-southwark-001-after.jpg
```

If no valid pairs are present, the Portfolio section is hidden automatically.

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/tonym999/patofalltrades?utm_source=oss&utm_medium=github&utm_campaign=tonym999%2Fpatofalltrades&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
