/* ============================================================
   Memorial site — app logic
   (You normally won't need to edit this file. Edit config.js,
    data/photos.js and data/stories.js instead.)
   ============================================================ */

/* ---------- Password gate ---------- */

const GATE_KEY = "fred-memorial-unlocked";

async function sha256(text) {
  // Preferred path: the browser's built-in crypto (HTTPS / localhost).
  if (window.crypto && window.crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback for insecure contexts (e.g. opening the file directly from disk),
  // where crypto.subtle isn't available. Pure-JS SHA-256.
  return sha256Fallback(unescape(encodeURIComponent(text)));
}

// Compact pure-JS SHA-256 (operates on a byte string). Used only as a fallback.
function sha256Fallback(ascii) {
  function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
  const maxWord = Math.pow(2, 32);
  let result = "";
  const words = [];
  const asciiBitLength = ascii.length * 8;
  let hash = sha256Fallback.h = sha256Fallback.h || [];
  const k = sha256Fallback.k = sha256Fallback.k || [];
  let primeCounter = k.length;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) { isComposite[i] = candidate; }
      hash[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  ascii += "\x80";
  while (ascii.length % 64 - 56) ascii += "\x00";
  for (let i = 0; i < ascii.length; i++) {
    const j = ascii.charCodeAt(i);
    if (j >> 8) return "";
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;
  for (let j = 0; j < words.length;) {
    const w = words.slice(j, j += 16);
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ (~e & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0);
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (let i = 0; i < 8; i++) { hash[i] = (hash[i] + oldHash[i]) | 0; }
  }
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16) ? 0 : "") + b.toString(16);
    }
  }
  return result;
}

function revealSite() {
  document.getElementById("gate").hidden = true;
  document.getElementById("site").hidden = false;
  document.body.style.overflow = "";
  renderSite();
}

function setupGate() {
  const form  = document.getElementById("gate-form");
  const input = document.getElementById("gate-input");
  const error = document.getElementById("gate-error");
  const gateName = document.getElementById("gate-name");

  if (SITE_CONFIG.name) gateName.textContent = "In Memory of " + SITE_CONFIG.name;

  if (sessionStorage.getItem(GATE_KEY) === "yes") {
    revealSite();
    return;
  }

  document.body.style.overflow = "hidden";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const entered = await sha256(input.value);
    if (entered === SITE_CONFIG.passwordHash) {
      sessionStorage.setItem(GATE_KEY, "yes");
      revealSite();
    } else {
      error.hidden = false;
      input.value = "";
      input.focus();
    }
  });
}

/* ---------- Render content ---------- */

function renderSite() {
  document.getElementById("site-name").textContent    = SITE_CONFIG.name || "";
  document.getElementById("site-dates").textContent   = SITE_CONFIG.dates || "";
  document.getElementById("site-tagline").textContent = SITE_CONFIG.tagline || "";
  document.getElementById("footer-name").textContent  = SITE_CONFIG.name || "him";
  document.title = "In Memory of " + (SITE_CONFIG.name || "");

  renderAbout();
  renderGallery();
  renderStories();
  renderForm();
  setupTabs();
}

// Turn text with blank lines into <p> paragraphs (safe — uses textContent)
function renderParagraphs(container, text) {
  container.innerHTML = "";
  String(text).split(/\n\s*\n/).forEach((chunk) => {
    if (!chunk.trim()) return;
    const p = document.createElement("p");
    p.textContent = chunk.trim();
    container.appendChild(p);
  });
}

/* ---------- About ---------- */

function renderAbout() {
  // Portrait
  if (SITE_CONFIG.portrait) {
    const fig = document.getElementById("about-portrait");
    const img = document.getElementById("about-portrait-img");
    img.src = "photos/" + SITE_CONFIG.portrait;
    img.alt = SITE_CONFIG.name || "Portrait";
    img.onload = () => { fig.hidden = false; };
    img.onerror = () => { fig.hidden = true; };
  }

  const introEl = document.getElementById("about-intro");
  introEl.textContent = SITE_CONFIG.intro || "";
  introEl.hidden = !SITE_CONFIG.intro;
  renderParagraphs(document.getElementById("about-obituary"), SITE_CONFIG.obituary || "");

  if (SITE_CONFIG.service) {
    const card = document.getElementById("about-service");
    card.hidden = false;
    const label = document.createElement("span");
    label.className = "service-label";
    label.textContent = "Service";
    const p = document.createElement("p");
    p.style.margin = "0";
    p.textContent = SITE_CONFIG.service;
    card.appendChild(label);
    card.appendChild(p);
  }
}

/* ---------- Tabs ---------- */

function setupTabs() {
  const tabs = [...document.querySelectorAll(".tab")];
  const panels = {
    about:   document.getElementById("about"),
    gallery: document.getElementById("gallery"),
    stories: document.getElementById("stories"),
    share:   document.getElementById("share"),
  };

  function activate(name, { scroll = true } = {}) {
    if (!panels[name]) name = "about";
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.target === name));
    Object.entries(panels).forEach(([key, el]) => { el.hidden = key !== name; });
    if (history.replaceState) history.replaceState(null, "", "#" + name);
    if (scroll) {
      const tabsBar = document.querySelector(".tabs");
      const y = tabsBar.getBoundingClientRect().top + window.scrollY - 1;
      // only scroll up to the tab bar if we're below it
      if (window.scrollY > y) window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  tabs.forEach((t) => t.addEventListener("click", () => activate(t.dataset.target)));

  const initial = (location.hash || "").replace("#", "");
  activate(panels[initial] ? initial : "about", { scroll: false });
}

function activeTab() {
  const t = document.querySelector(".tab.active");
  return t ? t.dataset.target : "about";
}

/* ---------- Gallery ---------- */

let galleryPhotos = [];

function renderGallery() {
  const grid  = document.getElementById("gallery-grid");
  const empty = document.getElementById("gallery-empty");
  grid.innerHTML = "";
  galleryPhotos = (typeof PHOTOS !== "undefined" && Array.isArray(PHOTOS)) ? PHOTOS : [];

  if (galleryPhotos.length === 0) { empty.hidden = false; return; }
  empty.hidden = true;

  galleryPhotos.forEach((photo, i) => {
    const item = document.createElement("div");
    item.className = "gallery-item";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = "photos/" + photo.file;
    img.alt = photo.caption || SITE_CONFIG.name || "Photo";
    img.onerror = () => { item.style.display = "none"; };
    item.appendChild(img);

    if (photo.caption) {
      const cap = document.createElement("div");
      cap.className = "cap";
      cap.textContent = photo.caption;
      item.appendChild(cap);
    }

    item.addEventListener("click", () => openLightbox(i));
    grid.appendChild(item);
  });
}

/* ---------- Stories (one at a time) ---------- */

let stories = [];
let storyIndex = 0;

function renderStories() {
  stories = (typeof STORIES !== "undefined" && Array.isArray(STORIES)) ? STORIES : [];
  const empty   = document.getElementById("stories-empty");
  const viewer  = document.getElementById("story-viewer");
  const controls = document.getElementById("story-controls");

  if (stories.length === 0) {
    empty.hidden = false;
    viewer.hidden = true;
    controls.hidden = true;
    return;
  }
  empty.hidden = true;
  viewer.hidden = false;
  controls.hidden = false;

  document.getElementById("story-prev").addEventListener("click", () => stepStory(-1));
  document.getElementById("story-next").addEventListener("click", () => stepStory(1));

  storyIndex = 0;
  showStory();
}

function showStory() {
  const s = stories[storyIndex];
  if (!s) return;
  const card = document.getElementById("story-card");
  card.style.opacity = "0";
  // small fade for a gentle transition
  window.setTimeout(() => {
    renderParagraphs(document.getElementById("story-text"), s.text || "");
    const meta = document.getElementById("story-meta");
    meta.innerHTML = "";
    meta.append("— " + (s.author || "Anonymous"));
    if (s.date) {
      const d = document.createElement("span");
      d.className = "date";
      d.textContent = "  ·  " + s.date;
      meta.appendChild(d);
    }
    document.getElementById("story-counter").textContent =
      (storyIndex + 1) + " of " + stories.length;
    card.scrollIntoView({ block: "nearest" });
    card.style.opacity = "1";
  }, 120);
}

function stepStory(delta) {
  storyIndex = (storyIndex + delta + stories.length) % stories.length;
  showStory();
}

/* ---------- Submission form ---------- */

function renderForm() {
  const container = document.getElementById("form-container");
  container.innerHTML = "";
  const embed = SITE_CONFIG.googleFormEmbedUrl;
  const share = SITE_CONFIG.googleFormShareUrl;

  if (embed) {
    const iframe = document.createElement("iframe");
    iframe.src = embed;
    iframe.height = "760";
    iframe.title = "Share a story";
    iframe.loading = "lazy";
    container.appendChild(iframe);
  } else if (share) {
    const a = document.createElement("a");
    a.className = "form-fallback";
    a.href = share; a.target = "_blank"; a.rel = "noopener";
    a.textContent = "Open the story form";
    container.appendChild(a);
  } else {
    const p = document.createElement("p");
    p.className = "empty-note";
    p.textContent = "The story submission form will be available here soon.";
    container.appendChild(p);
  }

  if (embed && share) {
    const a = document.createElement("a");
    a.className = "form-fallback";
    a.href = share; a.target = "_blank"; a.rel = "noopener";
    a.textContent = "Open the form in a new tab";
    a.style.display = "block";
    a.style.marginTop = "20px";
    container.appendChild(a);
  }
}

/* ---------- Lightbox ---------- */

let lightboxIndex = 0;

function openLightbox(i) {
  lightboxIndex = i;
  updateLightbox();
  document.getElementById("lightbox").hidden = false;
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  document.getElementById("lightbox").hidden = true;
  document.body.style.overflow = "";
}
function updateLightbox() {
  const photo = galleryPhotos[lightboxIndex];
  if (!photo) return;
  document.getElementById("lightbox-img").src = "photos/" + photo.file;
  document.getElementById("lightbox-img").alt = photo.caption || "";
  document.getElementById("lightbox-caption").textContent = photo.caption || "";
}
function stepLightbox(delta) {
  lightboxIndex = (lightboxIndex + delta + galleryPhotos.length) % galleryPhotos.length;
  updateLightbox();
}

function setupLightbox() {
  document.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  document.querySelector(".lightbox-prev").addEventListener("click", () => stepLightbox(-1));
  document.querySelector(".lightbox-next").addEventListener("click", () => stepLightbox(1));
  document.getElementById("lightbox").addEventListener("click", (e) => {
    if (e.target.id === "lightbox") closeLightbox();
  });
}

/* ---------- Keyboard ---------- */

function setupKeys() {
  document.addEventListener("keydown", (e) => {
    const lb = document.getElementById("lightbox");
    if (lb && !lb.hidden) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
      return;
    }
    // Arrow keys navigate stories when the Stories tab is open
    if (document.getElementById("site").hidden) return;
    if (activeTab() === "stories" && stories.length > 1) {
      if (e.key === "ArrowLeft") stepStory(-1);
      if (e.key === "ArrowRight") stepStory(1);
    }
  });
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  setupGate();
  setupLightbox();
  setupKeys();
});
