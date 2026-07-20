# CV Tools

An editorial-style CV builder: open it, edit the CV in place, share it as a
link, export a PDF. Deploy it to Vercel and it works — there is nothing to
create, configure, or sign into.

The design is the magazine layout from the static CV in this repo's parent
folder — display serif (Fraunces) for headings, Inter for body, warm paper,
numbered sections, an experience timeline, and monochrome brand icons — rebuilt
as a Next.js app you can type directly into.

## Deploying

Import the repo in Vercel and press deploy. That is the whole setup: no
database, no storage bucket, no environment variables, no accounts.

Opening the deployment drops you straight into the editor with Bùi Công Minh's
CV loaded, transcribed from his PDF.

## How it works

**Your working copy lives in your browser.** Edits save to `localStorage` a
moment after you stop typing, so a reload picks up where you left off. Nothing
is uploaded and no server holds your data.

**Sharing is a link, not a record.** *Share* compresses the whole CV into the
URL fragment — the part after `#`, which browsers never send to a server. Send
that link and the recipient sees the CV, can export a PDF, and can press
**Edit a copy** to take it into their own browser and change it. Minh's CV runs
about a 5 KB link.

That means a shared CV keeps working even if this site goes away, and a
document holding someone's phone number and email never touches a request log
or a `Referer` header.

**Images travel inside the document.** Uploading a photo resizes it in the
browser and stores it as a data URL, so there is no upload endpoint and no
bucket to configure. Portraits are capped at 480px, logos at 256px, which keeps
share links small.

### Trade-offs, plainly

- Clearing your browser data clears the CV. Use **Download JSON** in the share
  panel for a backup, and re-import it from the *Import / export JSON* panel.
- Two people editing the same CV get two separate copies. Whoever changes
  something sends a fresh link back.
- Very image-heavy CVs make long links. The share panel warns you and suggests
  sending the JSON file instead.

## Thumbnails

Each product, client, and project entry has a thumbnail, filled three ways:

1. **Auto** — `/api/thumbnail` resolves a logo in this order:
   - the **known-logo library** in `lib/logo-library.ts`, seeded from the
     original CV's `logos/` folder plus every company and brand in Minh's CV.
     Entries naming the same product or company reuse that exact asset.
   - the page's `og:image` / `twitter:image` / `apple-touch-icon`. Short links
     (bit.ly, ...) are followed to their destination first, then re-checked
     against the library.
   - the site's favicon at 128px. Bare 16px `.ico` files are upgraded to this
     rather than used directly.
   Small results are inlined into the document as data URLs, so a CV never
   depends on someone else's hotlink staying up.
2. **Upload** — any PNG / JPEG / WebP / GIF / SVG, resized in the browser.
3. **Paste** — type an image URL into the field.

If none is set, the CV renders a monogram or a matched line icon instead of a
broken image.

To add a logo permanently, drop the file in `public/logos/` and add an entry to
`LOGO_LIBRARY`.

This is the only route that talks to a server. It fetches a URL you give it, so
it resolves the hostname first and refuses private, loopback, link-local, and
cloud-metadata addresses — it cannot be used to reach inside the deployment's
network.

## Editing

Click any text on the CV and type. **Enter** opens the next bullet,
**Backspace** on an empty one removes it, **Esc** cancels an edit, and hovering
a row reveals **+** / **✕**. The left panel handles images and anything
structural — adding jobs, reordering, importing and exporting JSON.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
```

No environment variables, in development or production.

## Export a PDF

Click **PDF**, then choose **Save as PDF**, margins **None**, and enable
**Background graphics** to keep the paper tint and accent colours. The
stylesheet has A4 print rules that keep bullets, cards, and headings from
splitting awkwardly across pages, and it drops the editing affordances.

## Layout

```
app/
  page.tsx              the app — editor, opened on a real CV
  cv/page.tsx           read-only view of a shared link
  api/thumbnail/        logo auto-resolution (the only server route)
  globals.css           the CV design, then app chrome under "APP UI"
components/
  Workspace.tsx         picks the CV to open: shared link > this browser > seed
  CvDocument.tsx        the CV sheet; renders read-only or inline-editable
  SharedCv.tsx          shared-link view + "Edit a copy"
  Editable.tsx          the inline-edit primitives
  editor/               editor panes, fields, image picker, share panel
lib/
  types.ts              the CV document shape
  share.ts              CV <-> compressed URL fragment
  local-store.ts        the browser working copy
  image.ts              client-side resize to data URLs
  logo-library.ts       known-logo matching
  seed-minh.ts          the CV that ships with the app
```
