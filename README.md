# Bora's Library

My personal digital library: the books on my shelves, with their covers, in English or Turkish. Anyone can look around; only the admin can add, edit or delete books, and only the admin can see and write the private notes kept for each book.

Built with Next.js (App Router, Cache Components), Turso (SQLite) and Tailwind CSS, and deployed on Netlify.

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in the admin username/password/secret
npm run dev
```

Open http://localhost:3000. To sign in, use the small **admin** link at the bottom right of any page.

### Which database is used?

| `.env.local` | Data used |
| --- | --- |
| `TURSO_DATABASE_URL` empty | A local file, `data/library.db`, for experiments. Delete the `data/` folder to start over. |
| `TURSO_DATABASE_URL` set | The hosted Turso database, the same data as the live site. |

## Features

- **Public view:** book grid, search (case- and accent-insensitive, so `oguz` finds `Oğuz Atay`), author/genre menus, status tabs and sorting. Notes are private: visitors never see them (not even whether a book has notes).
- **Admin:** add/edit/delete books, change status with one click, and a large notes editor that saves as you type (Markdown, a 📅 date heading button, focus mode).
- **Covers:** drag and drop, pick a file, paste from the clipboard, or paste an image link. All are resized before upload.
- **English / Turkish:** a switch in the top right changes the whole interface. The choice is remembered in a cookie; first-time visitors get Turkish if their browser prefers it. Genres are stored in English and shown in the chosen language.
- **Sorting:** "Recently added" (default), title or author, using Turkish alphabetical order.

## Project structure

```
src/
  app/
    page.tsx                 Book list + filters
    admin/page.tsx           Admin sign in
    books/new/page.tsx       Add a book (admin)
    books/[id]/page.tsx      Book page + notes
    books/[id]/edit/page.tsx Edit a book (admin)
    actions.ts               Server actions (all writes check for admin)
    api/covers/[id]/         Serves cover images from the database
    api/image-proxy/         Lets the admin load cover images from links
  components/                UI pieces (form, filters, notes editor, language switch…)
  lib/
    db.ts                    Database connection (Turso or local file) and tables
    books.ts                 Book queries
    covers.ts                Cover storage
    auth.ts                  Admin session cookie
    i18n.ts                  English and Turkish texts
    locale.ts                Picks the visitor's language
    resize-image.ts          Browser-side cover resizing
```
