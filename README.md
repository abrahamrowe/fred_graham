# In Memory of Fred Conway Graham

A private memorial website with a photo gallery, stories from friends and
family, and a form for visitors to submit their own memories.

It's a plain static website (HTML/CSS/JavaScript) — no build step, no server.
That makes it free to host on **GitHub Pages**.

---

## What you can edit (no coding required)

| To change… | Edit this file |
|---|---|
| Name, dates, intro text, password, form link | `config.js` |
| Photos in the gallery | `data/photos.js` (and add image files to `photos/`) |
| Stories shown on the page | `data/stories.js` |

Everything else (`index.html`, `assets/`) you can leave alone.

---

## 1. Add photos

1. Put your image files in the **`photos/`** folder (`.jpg` or `.png`,
   filenames without spaces work best).
2. Open **`data/photos.js`** and add a line for each photo:
   ```js
   { file: "fred-at-the-lake.jpg", caption: "At the lake, summer 1985" },
   ```
3. Delete the three `example-…` lines that ship with it.

Photos open in a full-screen viewer when clicked, with arrow-key navigation.

---

## 2. Add memories

The **Memories** tab shows one memory at a time, with arrow buttons (and
left/right arrow keys) to move between them.

Open **`data/stories.js`** and add a block for each memory:
```js
{
  author: "Jane Smith",
  date: "June 2026",          // or leave as ""
  text: "First paragraph.\n\nSecond paragraph.",
},
```
Use `\n\n` to start a new paragraph.

---

## 3. The memory submission form (Google Form)

The **Share a Memory** tab already embeds your Google Form
("Memories of Fred Graham") — it's set in `config.js`. To point it at a
different form later, replace `googleFormEmbedUrl` (the share link plus
`?embedded=true`) and `googleFormShareUrl` in `config.js`.

**Receiving submissions:** In your Google Form, open the **Responses** tab and
turn on **email notifications** (the ⋮ menu → "Get email notifications for new
responses"). When a memory comes in you'd like to publish, copy it into
`data/stories.js`.

> Submissions are *not* added to the site automatically — this gives you a
> chance to review each one first, which is usually what you want for a memorial.

---

## 4. Set the password

The password is **`conway`**.

To change it, open **`set-password.html`** in your browser, type the password
you want, click **Generate**, and follow the on-screen steps (it gives you a
value to paste into `config.js`).

> **Note on security:** This is a client-side password — it keeps the site out
> of search engines and away from casual visitors, which is right for a private
> family memorial. It is *not* bank-grade security; a determined technical
> person could view the page source. If you ever need stronger protection, the
> site can be put behind free **Cloudflare Access** — ask and it can be set up.

---

## 5. Publish on GitHub Pages

1. Create a free account at <https://github.com> if you don't have one.
2. Create a new **repository** (e.g. `fred-memorial`). You can make it
   **Private** — GitHub Pages still works.
3. Upload all these files (drag-and-drop works: on the repo page click
   **Add file → Upload files**, then drag everything in, including the
   `assets/`, `data/`, and `photos/` folders).
4. Go to the repo's **Settings → Pages**.
5. Under **Build and deployment**, set **Source** to *Deploy from a branch*,
   choose branch **`main`** and folder **`/ (root)`**, then **Save**.
6. Wait a minute, refresh, and GitHub shows the live address
   (something like `https://yourname.github.io/fred-memorial/`).

To update the site later, edit the files and upload them again to the same repo.

---

## Local preview

To see it on your own computer before publishing, open a terminal in this
folder and run:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. (Opening `index.html` directly by
double-clicking also mostly works, but a local server matches the real site.)

---

## File overview

```
index.html         the page
config.js          ← main settings (name, dates, password, form)
set-password.html  helper for changing the password
data/
  photos.js        ← list of gallery photos
  stories.js       ← the stories shown on the page
photos/            ← put image files here
assets/
  styles.css       look & feel
  app.js           page logic (no need to edit)
```
