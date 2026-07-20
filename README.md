# CV Tools

An editorial-style CV builder: edit in the browser, upload images, share a
read-only link, export to PDF. Deploys to Vercel.

The design is the same magazine layout as the original static CV in this
repo's parent folder — display serif (Fraunces) for headings, Inter for body,
warm paper, numbered sections, an experience timeline, and monochrome brand
icons — rebuilt as a Next.js app with a live editor.

## How sharing works

Every CV has two links:

| Link | Who gets it | What it does |
| --- | --- | --- |
| `/cv/<id>` | anyone | public, read-only, **Export PDF** |
| `/edit/<id>?k=<editKey>` | only the owner | full editor with live preview |

The edit key **is** the password — there are no accounts. Anyone holding the
editor link can change that CV, so send it only to the person who should be
editing. The public view never exposes the key.

The home page hides editor links by default. Set an `ADMIN_TOKEN` env var and
open `/?admin=<token>` to get them back.

## Thumbnails

Each product, client, and project entry has a thumbnail, resolvable three ways:

1. **Auto** — `/api/thumbnail` resolves a logo in this order:
   - the **known-logo library** in `lib/logo-library.ts`, seeded from the
     original CV's `logos/` folder. Entries naming the same product or company
     (Joy, Joy Subscription, Chatty, ShopVid, Adecos, tocco, Vinamilk,
     Allbirds…) reuse that exact asset.
   - the page's `og:image` / `twitter:image` / `apple-touch-icon`. Short links
     (bit.ly, …) are followed to their destination first, then re-checked
     against the library.
   - the site's favicon at 128px. Bare 16px `.ico` files are upgraded to this
     rather than used directly.
2. **Upload** — any PNG / JPEG / WebP / GIF / SVG up to 5 MB.
3. **Paste** — type an image URL into the field.

If none is set, the CV renders a monogram or a matched line icon instead of a
broken image. Auto-resolved remote images are mirrored into Blob so a CV never
depends on someone else's hotlink staying up.

To add a logo permanently, drop the file in `public/logos/` and add an entry to
`LOGO_LIBRARY`.

## Deploying to Vercel

1. Import this repo in Vercel (framework auto-detects as Next.js).
2. **Storage → Create → Blob**, connect it to the project. That injects
   `BLOB_READ_WRITE_TOKEN`, which is all the app needs.
3. Optionally add `ADMIN_TOKEN` to unlock editor links on the home page.
4. Deploy.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
```

Without `BLOB_READ_WRITE_TOKEN` the app stores CVs in a gitignored `.data/`
folder and uploads into `public/uploads/`, so it runs with no cloud setup. To
develop against real Blob storage, run `vercel env pull .env.local` first.

## Layout

```
app/
  page.tsx              home — create a CV, list existing ones
  cv/[id]/page.tsx      public read-only view + Export PDF
  edit/[id]/page.tsx    editor, gated on the edit key
  api/cv/               create / read / update
  api/upload/           image upload → Blob
  api/thumbnail/        logo auto-resolution
  globals.css           the CV design, then app chrome under "APP UI"
components/
  CvDocument.tsx        the CV sheet itself (pure presentation)
  Icon.tsx              inline SVG icons
  editor/               editor panes, fields, image picker
lib/
  types.ts              the CV document shape
  store.ts              Blob persistence (+ local fallback)
  logo-library.ts       known-logo matching
  seed-minh.ts          starter data
  icon-data.ts          generated from the original icons.js
```

## Exporting a PDF

Click **Export PDF**, then in the print dialog choose **Save as PDF**, margins
**None**, and enable **Background graphics** to keep the paper tint and accent
colours. The stylesheet has A4 print rules that keep bullets, cards, and
headings from splitting awkwardly across pages.
