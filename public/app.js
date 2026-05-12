const app = document.querySelector("#app");
const accountArea = document.querySelector("#accountArea");
const adminButton = document.querySelector("#adminButton");
const libraryButton = document.querySelector("#libraryButton");
const brandButton = document.querySelector("#brandButton");
const themeButton = document.querySelector("#themeButton");
const searchInput = document.querySelector("#searchInput");
const authModal = document.querySelector("#authModal");
const authTitle = document.querySelector("#authTitle");
const authMessage = document.querySelector("#authMessage");
const authForm = document.querySelector("#authForm");
const toast = document.querySelector("#toast");

const state = {
  user: null,
  books: [],
  collections: [],
  activeBook: null,
  readerPage: 0,
  view: "library",
  category: "Все",
  collectionId: null,
  search: "",
  authMode: "login",
  pendingBookId: null,
  editingId: null,
  theme: localStorage.getItem("lumi-theme") || "light",
  fontScale: Number(localStorage.getItem("lumi-font-scale") || "1")
};

const accentOptions = [
  "#0a84ff",
  "#30d158",
  "#ff9f0a",
  "#ff375f",
  "#64d2ff",
  "#bf5af2",
  "#8e8e93"
];

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return map[char];
  });
}

function applyTheme() {
  document.body.dataset.theme = state.theme;
  themeButton.setAttribute(
    "title",
    state.theme === "dark" ? "Светлая тема" : "Темная тема"
  );
}

function applyFontScale() {
  document.documentElement.style.setProperty("--font-scale", state.fontScale);
  localStorage.setItem("lumi-font-scale", String(state.fontScale));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 3200);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Запрос не выполнен");
  }
  return payload;
}

async function loadSession() {
  const payload = await api("/api/session");
  state.user = payload.user;
}

async function loadBooks() {
  const payload = await api("/api/books");
  state.books = payload.books;
}

async function loadCollections() {
  const payload = await api("/api/collections");
  state.collections = payload.collections;
}

function initials(name) {
  return String(name || "U")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderAccount() {
  adminButton.classList.toggle("hidden", state.user?.role !== "admin");

  if (!state.user) {
    accountArea.innerHTML = `
      <div class="account-card">
        <button class="text-button ghost" type="button" data-auth="login">Войти</button>
        <button class="text-button primary" type="button" data-auth="register">Создать</button>
      </div>
    `;
  } else {
    accountArea.innerHTML = `
      <div class="account-card">
        <span class="avatar" aria-hidden="true">${esc(initials(state.user.name))}</span>
        <span class="muted">${esc(state.user.name)}</span>
        <button class="text-button ghost" type="button" data-logout>Выйти</button>
      </div>
    `;
  }

  accountArea.querySelectorAll("[data-auth]").forEach((button) => {
    button.addEventListener("click", () => openAuth(button.dataset.auth));
  });

  accountArea.querySelector("[data-logout]")?.addEventListener("click", async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
      state.user = null;
      state.activeBook = null;
      state.view = "library";
      render();
      showToast("Вы вышли из учетной записи");
    } catch (error) {
      showToast(error.message);
    }
  });
}

function categories() {
  return ["Все", ...new Set(state.books.map((book) => book.category).filter(Boolean))];
}

function activeCollection() {
  return state.collections.find((collection) => collection.id === state.collectionId);
}

function filteredBooks() {
  const query = state.search.trim().toLowerCase();
  const collection = activeCollection();

  return state.books.filter((book) => {
    const inCategory = state.category === "Все" || book.category === state.category;
    const inCollection = !collection || collection.bookIds.includes(book.id);
    const haystack = `${book.title} ${book.author} ${book.summary}`.toLowerCase();
    return inCategory && inCollection && (!query || haystack.includes(query));
  });
}

function bookCover(book, className = "") {
  const safeAccent = /^#[0-9a-f]{6}$/i.test(book.accent) ? book.accent : "#0a84ff";
  const image = book.coverUrl
    ? `<img src="${esc(book.coverUrl)}" alt="Обложка ${esc(book.title)}" loading="lazy" />`
    : `<span class="cover-title">${esc(book.title)}</span>`;
  return `<div class="cover ${className}" style="--cover-accent:${safeAccent}">${image}</div>`;
}

function miniCover(book) {
  const safeAccent = /^#[0-9a-f]{6}$/i.test(book?.accent) ? book.accent : "#0a84ff";
  const image = book?.coverUrl
    ? `<img src="${esc(book.coverUrl)}" alt="" loading="lazy" />`
    : `<span>${esc(book?.title || "")}</span>`;
  return `<span class="mini-cover" style="--cover-accent:${safeAccent}">${image}</span>`;
}

function renderCollections() {
  if (!state.collections.length) return "";
  const byId = new Map(state.books.map((book) => [book.id, book]));

  const collectionCards = state.collections
    .map((collection) => {
      const books = collection.bookIds.map((id) => byId.get(id)).filter(Boolean);
      const covers = books.slice(0, 3).map((book) => miniCover(book)).join("");
      return `
        <button class="collection-card ${collection.id === state.collectionId ? "active" : ""}" type="button" data-collection="${esc(collection.id)}">
          <span class="collection-covers">${covers}</span>
          <span class="collection-copy">
            <strong>${esc(collection.title)}</strong>
            <span>${esc(collection.description)}</span>
            <small>${books.length} книги</small>
          </span>
        </button>
      `;
    })
    .join("");

  return `
    <section class="collection-section" aria-label="Подборки книг">
      <div class="section-title">
        <div>
          <p class="eyebrow">Подборки</p>
          <h2>Книги под настроение</h2>
        </div>
        ${
          state.collectionId
            ? '<button class="text-button ghost" type="button" data-clear-collection>Все книги</button>'
            : ""
        }
      </div>
      <div class="collection-grid">${collectionCards}</div>
    </section>
  `;
}

function renderLibrary() {
  const books = filteredBooks();
  const collection = activeCollection();
  const totalMinutes = state.books.reduce((sum, book) => sum + book.stats.minutes, 0);
  const categoryButtons = categories()
    .map(
      (category) => `
        <button class="chip ${category === state.category ? "active" : ""}" type="button" data-category="${esc(category)}">
          ${esc(category)}
        </button>
      `
    )
    .join("");

  const cards = books
    .map(
      (book) => `
        <button class="book-card" type="button" data-book-id="${esc(book.id)}" aria-label="Открыть ${esc(book.title)}">
          ${bookCover(book)}
          <span class="book-meta">
            <span class="book-category">${esc(book.category)}</span>
            <h3>${esc(book.title)}</h3>
            <p class="book-author">${esc(book.author)}</p>
            <p class="book-summary">${esc(book.summary)}</p>
            <span class="book-facts">
              <span>${book.stats.pages} стр.</span>
              <span class="dot" aria-hidden="true"></span>
              <span>${book.stats.minutes} мин</span>
            </span>
          </span>
        </button>
      `
    )
    .join("");

  app.innerHTML = `
    <section class="library-head glass-hero">
      <div>
        <p class="eyebrow">Облачная библиотека</p>
        <h1>Lumi Books</h1>
        <p class="subcopy">
          Полные версии книг, подборки для разного настроения и легкий стеклянный интерфейс для спокойного чтения.
        </p>
      </div>
      <div class="stats-strip" aria-label="Статистика библиотеки">
        <div class="stat"><strong>${state.books.length}</strong><span>книг</span></div>
        <div class="stat"><strong>${state.collections.length}</strong><span>подборок</span></div>
        <div class="stat"><strong>${totalMinutes}</strong><span>мин чтения</span></div>
      </div>
    </section>
    ${renderCollections()}
    ${
      collection
        ? `<div class="active-collection-bar"><span>${esc(collection.title)}</span><p>${esc(collection.description)}</p></div>`
        : ""
    }
    <div class="category-row" aria-label="Категории">${categoryButtons}</div>
    ${
      cards
        ? `<section class="book-grid" aria-label="Книги">${cards}</section>`
        : `<section class="empty-state"><div><h2>Книги не найдены</h2><p>Измените поиск, категорию или выбранную подборку.</p></div></section>`
    }
  `;

  app.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      state.category = button.dataset.category;
      state.collectionId = null;
      renderLibrary();
    });
  });

  app.querySelectorAll("[data-collection]").forEach((button) => {
    button.addEventListener("click", () => {
      state.collectionId = button.dataset.collection;
      state.category = "Все";
      renderLibrary();
    });
  });

  app.querySelector("[data-clear-collection]")?.addEventListener("click", () => {
    state.collectionId = null;
    renderLibrary();
  });

  app.querySelectorAll("[data-book-id]").forEach((button) => {
    button.addEventListener("click", () => openBook(button.dataset.bookId));
  });
}

async function openBook(id) {
  if (!state.user) {
    state.pendingBookId = id;
    openAuth("login");
    return;
  }

  try {
    const payload = await api(`/api/books/${encodeURIComponent(id)}`);
    state.activeBook = payload.book;
    state.readerPage = 0;
    state.view = "reader";
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    showToast(error.message);
  }
}

function updateReaderProgress() {
  const progress = app.querySelector(".reader-progress span");
  if (!progress || state.view !== "reader") return;
  const total = Number(app.dataset.readerPages || 1);
  const current = Number(app.dataset.readerPage || 0);
  const value = total <= 1 ? 100 : (current / (total - 1)) * 100;
  progress.style.setProperty("--progress", `${Math.min(100, Math.max(0, value))}%`);
}

function normalizeBookText(content) {
  return String(content || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function isSeparatorLine(line) {
  return /^(\*\s*){3,}$/.test(line) || /^[\-–—_]{3,}$/.test(line);
}

function isChapterHeading(line) {
  const text = line.trim().replace(/\s+/g, " ");
  if (/^#{1,3}\s+\S+/.test(text)) return true;
  if (/^(пролог|эпилог|вступление|предисловие|послесловие)$/i.test(text)) return true;
  return /^(глава|часть|книга)\s+([0-9]+|[ivxlcdm]+|[ivxlcdmх]+)\b/i.test(text);
}

function cleanHeading(line) {
  return line.trim().replace(/^#{1,3}\s+/, "").replace(/\s+/g, " ");
}

function findReadableStart(lines) {
  const headingIndexes = lines
    .map((line, index) => (isChapterHeading(line) ? index : -1))
    .filter((index) => index >= 0);

  for (let i = 0; i < headingIndexes.length; i += 1) {
    const start = headingIndexes[i];
    const end = headingIndexes[i + 1] ?? Math.min(lines.length, start + 45);
    const segment = lines
      .slice(start + 1, end)
      .map((line) => line.trim())
      .filter(Boolean);
    const hasRealText = segment.some(
      (line) => !isChapterHeading(line) && !isSeparatorLine(line) && line.length > 35
    );
    if (hasRealText) return start;
  }

  return 0;
}

function buildBookChapters(content) {
  const lines = normalizeBookText(content)
    .split("\n")
    .map((line) => line.trim());
  const start = findReadableStart(lines);
  const source = lines.slice(start);
  const chapters = [];
  let current = null;
  let paragraph = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(" ").replace(/\s+/g, " ").trim();
    if (text) {
      if (!current) current = { title: "Вступление", blocks: [] };
      current.blocks.push({ type: "paragraph", text });
    }
    paragraph = [];
  };

  const pushCurrent = () => {
    flushParagraph();
    if (current?.blocks.length) chapters.push(current);
    current = null;
  };

  for (let index = 0; index < source.length; index += 1) {
    const line = source[index];

    if (!line) {
      flushParagraph();
      continue;
    }

    if (/^notes\d*$/i.test(line) || /^примечания$/i.test(line)) {
      pushCurrent();
      current = { title: "Примечания", blocks: [{ type: "heading", text: "Примечания" }] };
      continue;
    }

    if (isSeparatorLine(line)) {
      flushParagraph();
      if (!current) current = { title: "Вступление", blocks: [] };
      current.blocks.push({ type: "separator", text: "" });
      continue;
    }

    if (isChapterHeading(line)) {
      pushCurrent();
      const title = cleanHeading(line);
      current = { title, blocks: [{ type: "heading", text: title }] };

      let lookAhead = index + 1;
      while (lookAhead < source.length && !source[lookAhead].trim()) lookAhead += 1;
      const subtitle = source[lookAhead]?.trim();
      if (
        subtitle &&
        subtitle.length <= 90 &&
        !isChapterHeading(subtitle) &&
        !isSeparatorLine(subtitle) &&
        !/^notes\d*$/i.test(subtitle)
      ) {
        current.title = `${title}. ${subtitle}`;
        current.blocks.push({ type: "subtitle", text: subtitle });
        index = lookAhead;
      }
      continue;
    }

    paragraph.push(line);
  }

  pushCurrent();

  if (!chapters.length) {
    return [
      {
        title: "Текст книги",
        blocks: normalizeBookText(content)
          .split(/\n{2,}/)
          .map((block) => block.trim())
          .filter(Boolean)
          .map((text) => ({ type: "paragraph", text }))
      }
    ];
  }

  return chapters;
}

function readerPageLimit() {
  const width = window.innerWidth || 1024;
  const base = width < 620 ? 1150 : width < 980 ? 1450 : 1800;
  return Math.round(base / state.fontScale);
}

function blockWeight(block) {
  if (block.type === "heading") return 260;
  if (block.type === "subtitle") return 150;
  if (block.type === "separator") return 90;
  return Math.max(90, block.text.length);
}

function paginateChapters(chapters) {
  const limit = readerPageLimit();
  const pages = [];

  chapters.forEach((chapter, chapterIndex) => {
    let blocks = [];
    let weight = 0;

    const pushPage = () => {
      if (!blocks.length) return;
      pages.push({
        chapterIndex,
        chapterTitle: chapter.title,
        blocks
      });
      blocks = [];
      weight = 0;
    };

    chapter.blocks.forEach((block) => {
      const nextWeight = blockWeight(block);
      if (blocks.length && weight + nextWeight > limit) pushPage();
      blocks.push(block);
      weight += nextWeight;
    });

    pushPage();
  });

  return pages.length
    ? pages
    : [{ chapterIndex: 0, chapterTitle: "Текст книги", blocks: [] }];
}

function renderReaderBlocks(blocks) {
  return blocks
    .map((block) => {
      if (block.type === "heading") {
        return `<h2 class="chapter-title">${esc(block.text)}</h2>`;
      }
      if (block.type === "subtitle") {
        return `<p class="chapter-subtitle">${esc(block.text)}</p>`;
      }
      if (block.type === "separator") {
        return '<div class="reader-separator" aria-hidden="true"></div>';
      }
      return `<p>${esc(block.text)}</p>`;
    })
    .join("");
}

function setReaderPage(nextPage, pages) {
  state.readerPage = Math.min(Math.max(nextPage, 0), pages.length - 1);
  renderReader();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderReader() {
  const book = state.activeBook;
  if (!book) {
    state.view = "library";
    renderLibrary();
    return;
  }

  const chapters = buildBookChapters(book.content);
  const pages = paginateChapters(chapters);
  state.readerPage = Math.min(Math.max(state.readerPage, 0), pages.length - 1);
  const page = pages[state.readerPage];
  const currentChapterPage = pages.findIndex(
    (candidate) => candidate.chapterIndex === page.chapterIndex
  );
  const previousChapterPage =
    page.chapterIndex > 0
      ? pages.findIndex((candidate) => candidate.chapterIndex === page.chapterIndex - 1)
      : -1;
  const nextChapterPage =
    page.chapterIndex < chapters.length - 1
      ? pages.findIndex((candidate) => candidate.chapterIndex === page.chapterIndex + 1)
      : -1;
  const chapterButtons = chapters
    .map((chapter, index) => {
      const firstPage = pages.findIndex((candidate) => candidate.chapterIndex === index);
      const active = page.chapterIndex === index ? "active" : "";
      return `
        <button class="chapter-nav ${active}" type="button" data-reader-chapter="${index}" data-reader-page="${firstPage}">
          <span>${esc(chapter.title)}</span>
        </button>
      `;
    })
    .join("");

  app.innerHTML = `
    <section class="reader-shell">
      <aside class="reader-aside">
        ${bookCover(book, "reader-cover")}
        <div class="reader-tools glass-panel">
          <button class="text-button ghost" type="button" data-library>Назад</button>
          <div class="reader-badge">Страницы и главы</div>
          <div class="page-turner">
            <button class="icon-button" type="button" data-page-prev title="Предыдущая страница" aria-label="Предыдущая страница" ${state.readerPage === 0 ? "disabled" : ""}>‹</button>
            <span>${state.readerPage + 1} / ${pages.length}</span>
            <button class="icon-button" type="button" data-page-next title="Следующая страница" aria-label="Следующая страница" ${state.readerPage >= pages.length - 1 ? "disabled" : ""}>›</button>
          </div>
          <div class="chapter-jump-actions">
            <button class="text-button ghost" type="button" data-reader-page="${previousChapterPage}" ${previousChapterPage < 0 ? "disabled" : ""}>Пред. глава</button>
            <button class="text-button ghost" type="button" data-reader-page="${nextChapterPage}" ${nextChapterPage < 0 ? "disabled" : ""}>След. глава</button>
          </div>
          <div class="tool-row">
            <button class="icon-button" type="button" data-font="down" title="Меньше текст" aria-label="Меньше текст">A-</button>
            <button class="icon-button" type="button" data-font="up" title="Больше текст" aria-label="Больше текст">A+</button>
          </div>
          <div class="tool-row">
            <span class="muted">${pages.length} стр.</span>
            <span class="muted">${book.stats.minutes} мин</span>
          </div>
          <div class="reader-progress" aria-hidden="true"><span></span></div>
          <div class="chapter-list" aria-label="Главы">${chapterButtons}</div>
        </div>
      </aside>
      <article class="reader-article glass-reader">
        <p class="reader-kicker">${esc(book.category)} · ${esc(book.author)}</p>
        <h1 class="reader-title">${esc(book.title)}</h1>
        <p class="reader-summary">${esc(book.summary)}</p>
        <div class="page-meta">
          <span>${esc(page.chapterTitle)}</span>
          <span>Страница ${state.readerPage + 1} · глава с ${currentChapterPage + 1}</span>
        </div>
        <div class="reader-content reader-page">${renderReaderBlocks(page.blocks)}</div>
        <div class="reader-footer">
          <button class="text-button ghost" type="button" data-page-prev ${state.readerPage === 0 ? "disabled" : ""}>Назад</button>
          <button class="text-button primary" type="button" data-page-next ${state.readerPage >= pages.length - 1 ? "disabled" : ""}>Дальше</button>
        </div>
      </article>
    </section>
  `;

  app.dataset.readerPages = String(pages.length);
  app.dataset.readerPage = String(state.readerPage);
  app.querySelector("[data-library]").addEventListener("click", showLibrary);
  app.querySelectorAll("[data-page-prev]").forEach((button) => {
    button.addEventListener("click", () => setReaderPage(state.readerPage - 1, pages));
  });
  app.querySelectorAll("[data-page-next]").forEach((button) => {
    button.addEventListener("click", () => setReaderPage(state.readerPage + 1, pages));
  });
  app.querySelectorAll("[data-reader-page]").forEach((button) => {
    button.addEventListener("click", () => {
      setReaderPage(Number(button.dataset.readerPage || 0), pages);
    });
  });
  app.querySelector('[data-font="down"]').addEventListener("click", () => {
    state.fontScale = Math.max(0.88, Number((state.fontScale - 0.08).toFixed(2)));
    applyFontScale();
    state.readerPage = 0;
    renderReader();
  });
  app.querySelector('[data-font="up"]').addEventListener("click", () => {
    state.fontScale = Math.min(1.34, Number((state.fontScale + 0.08).toFixed(2)));
    applyFontScale();
    state.readerPage = 0;
    renderReader();
  });
  updateReaderProgress();
}

function looksLikeMojibake(text) {
  return mojibakeScore(text) > 0 || /Ð|Ñ/.test(text.slice(0, 3000));
}

const cp1251SpecialChars = [
  "\u0402",
  "\u0403",
  "\u201a",
  "\u0453",
  "\u201e",
  "\u2026",
  "\u2020",
  "\u2021",
  "\u20ac",
  "\u2030",
  "\u0409",
  "\u2039",
  "\u040a",
  "\u040c",
  "\u040b",
  "\u040f",
  "\u0452",
  "\u2018",
  "\u2019",
  "\u201c",
  "\u201d",
  "\u2022",
  "\u2013",
  "\u2014",
  null,
  "\u2122",
  "\u0459",
  "\u203a",
  "\u045a",
  "\u045c",
  "\u045b",
  "\u045f",
  "\u00a0",
  "\u040e",
  "\u045e",
  "\u0408",
  "\u00a4",
  "\u0490",
  "\u00a6",
  "\u00a7",
  "\u0401",
  "\u00a9",
  "\u0404",
  "\u00ab",
  "\u00ac",
  "\u00ad",
  "\u00ae",
  "\u0407",
  "\u00b0",
  "\u00b1",
  "\u0406",
  "\u0456",
  "\u0491",
  "\u00b5",
  "\u00b6",
  "\u00b7",
  "\u0451",
  "\u2116",
  "\u0454",
  "\u00bb",
  "\u0458",
  "\u0405",
  "\u0455",
  "\u0457"
];

const cp1251SpecialBytes = new Map(
  cp1251SpecialChars
    .map((char, index) => (char ? [char, index + 0x80] : null))
    .filter(Boolean)
);

function cp1251ByteForChar(char) {
  const code = char.charCodeAt(0);
  if (code <= 0x7f) return code;
  if (code >= 0x0410 && code <= 0x044f) return code - 0x0410 + 0xc0;
  return cp1251SpecialBytes.get(char);
}

function mojibakeScore(value) {
  return (
    String(value || "")
      .slice(0, 12000)
      .match(
        /(?:\u0420[\u0402-\u040f\u0452-\u045f\u201a-\u2026\u2030-\u203a\u20ac\u2122\u00a0-\u00bf\u0490\u0491]|\u0421[\u0402-\u040f\u0452-\u045f\u201a-\u2026\u2030-\u203a\u20ac\u2122\u00a0-\u00bf\u0490\u0491]|\u0412[\u00ab\u00bb]|\u0432[\u0402\u20ac])/g
      ) || []
  ).length;
}

function repairMojibake(text) {
  const source = String(text || "");
  const sourceScore = mojibakeScore(source);
  if (sourceScore < 3) return source;

  const bytes = [];
  for (const char of source) {
    const byte = cp1251ByteForChar(char);
    if (byte === undefined) return source;
    bytes.push(byte);
  }

  const repaired = new TextDecoder("utf-8").decode(new Uint8Array(bytes));
  return mojibakeScore(repaired) < sourceScore ? repaired : source;
}

function normalizeImportedBookText(text) {
  return normalizeBookText(repairMojibake(text))
    .replace(/\n[ \t]*\n[ \t]*\n/g, "\n\n")
    .replace(/^\s*Annotation\s*\n+/i, "")
    .trim();
}

async function decodeTextFile(file) {
  const buffer = await file.arrayBuffer();
  let utf8 = "";
  try {
    utf8 = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1251").decode(buffer);
  }
  if (!looksLikeMojibake(utf8)) return utf8;
  const cp1251 = new TextDecoder("windows-1251").decode(buffer);
  return mojibakeScore(cp1251) < mojibakeScore(utf8) ? cp1251 : utf8;
}

async function importBookFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = normalizeImportedBookText(await decodeTextFile(file));
    const form = event.target.closest("form");
    const content = form?.querySelector("#bookContent");
    const title = form?.querySelector("#bookTitle");

    if (content) content.value = text;
    if (title && !title.value.trim()) {
      title.value = file.name
        .replace(/\.[^.]+$/, "")
        .replace(/^avidreaders\.ru__?/i, "")
        .replace(/[-_]+/g, " ")
        .trim();
    }

    const chapters = buildBookChapters(text).length;
    showToast(`TXT импортирован: найдено глав ${chapters}`);
  } catch (error) {
    showToast(error.message);
  } finally {
    event.target.value = "";
  }
}

function renderAdmin() {
  if (state.user?.role !== "admin") {
    app.innerHTML = `
      <section class="empty-state">
        <div>
          <h2>Доступ закрыт</h2>
          <p>Книги может добавлять только администратор.</p>
        </div>
      </section>
    `;
    return;
  }

  const editingBook = state.books.find((book) => book.id === state.editingId);
  const accent = editingBook?.accent || accentOptions[0];
  const list = state.books
    .map(
      (book) => `
        <article class="admin-book">
          ${bookCover(book, "admin-cover")}
          <div>
            <h3>${esc(book.title)}</h3>
            <p class="muted">${esc(book.author)} · ${esc(book.category)} · ${book.stats.pages} стр.</p>
          </div>
          <div class="row-actions">
            <button class="text-button ghost" type="button" data-edit="${esc(book.id)}">Править</button>
            <button class="text-button danger" type="button" data-delete="${esc(book.id)}">Удалить</button>
          </div>
        </article>
      `
    )
    .join("");

  app.innerHTML = `
    <section class="admin-layout">
      <form class="panel form-grid glass-panel" id="bookForm">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Админка</p>
            <h2>${editingBook ? "Редактировать" : "Новая книга"}</h2>
          </div>
          ${editingBook ? '<button class="icon-button" type="button" data-cancel-edit title="Сбросить" aria-label="Сбросить">×</button>' : ""}
        </div>
        <div class="field">
          <label for="bookTitle">Название</label>
          <input id="bookTitle" name="title" value="${esc(editingBook?.title || "")}" required minlength="2" maxlength="120" />
        </div>
        <div class="field">
          <label for="bookAuthor">Автор</label>
          <input id="bookAuthor" name="author" value="${esc(editingBook?.author || "")}" required minlength="2" maxlength="120" />
        </div>
        <div class="field">
          <label for="bookCategory">Категория</label>
          <input id="bookCategory" name="category" value="${esc(editingBook?.category || "")}" maxlength="60" />
        </div>
        <div class="field compact">
          <label for="bookSummary">Описание</label>
          <textarea id="bookSummary" name="summary" required maxlength="280">${esc(editingBook?.summary || "")}</textarea>
        </div>
        <div class="field file-field">
          <label for="bookTxtFile">Импорт TXT</label>
          <input id="bookTxtFile" name="txtFile" type="file" accept=".txt,text/plain" />
          <p class="field-hint">Можно выбрать обычный .txt: главы вида «Глава I» распознаются в читалке автоматически.</p>
        </div>
        <div class="field">
          <label for="bookContent">Текст книги</label>
          <textarea id="bookContent" name="content" required>${esc(editingBook?.content || "")}</textarea>
        </div>
        <div class="field">
          <label for="bookCover">Ссылка на обложку</label>
          <input id="bookCover" name="coverUrl" type="text" placeholder="/covers/example.svg или https://..." value="${esc(editingBook?.coverUrl || "")}" />
        </div>
        <div class="field">
          <label for="bookAccent">Цвет обложки</label>
          <input id="bookAccent" name="accent" type="color" value="${esc(accent)}" />
        </div>
        <div class="form-actions">
          <button class="text-button primary" type="submit">${editingBook ? "Сохранить" : "Добавить"}</button>
          <button class="text-button ghost" type="button" data-library>Библиотека</button>
        </div>
      </form>
      <section class="panel glass-panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Каталог</p>
            <h2>Книги</h2>
          </div>
          <span class="muted">${state.books.length}</span>
        </div>
        <div class="admin-list">
          ${list || '<div class="empty-state"><div><h2>Пусто</h2><p>Добавьте первую книгу.</p></div></div>'}
        </div>
      </section>
    </section>
  `;

  app.querySelector("[data-library]").addEventListener("click", showLibrary);
  app.querySelector("[data-cancel-edit]")?.addEventListener("click", () => {
    state.editingId = null;
    renderAdmin();
  });

  app.querySelector("#bookForm").addEventListener("submit", saveBook);
  app.querySelector("#bookTxtFile")?.addEventListener("change", importBookFile);
  app.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      state.editingId = button.dataset.edit;
      renderAdmin();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  app.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteBook(button.dataset.delete));
  });
}

async function saveBook(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const body = {
    title: form.get("title"),
    author: form.get("author"),
    category: form.get("category") || "Без категории",
    summary: form.get("summary"),
    content: form.get("content"),
    coverUrl: form.get("coverUrl"),
    accent: form.get("accent")
  };
  const path = state.editingId
    ? `/api/books/${encodeURIComponent(state.editingId)}`
    : "/api/books";
  const method = state.editingId ? "PUT" : "POST";

  try {
    await api(path, { method, body: JSON.stringify(body) });
    await Promise.all([loadBooks(), loadCollections()]);
    state.editingId = null;
    renderAdmin();
    showToast(method === "POST" ? "Книга добавлена" : "Книга сохранена");
  } catch (error) {
    showToast(error.message);
  }
}

async function deleteBook(id) {
  const book = state.books.find((candidate) => candidate.id === id);
  if (!window.confirm(`Удалить «${book?.title || "книгу"}»?`)) return;

  try {
    await api(`/api/books/${encodeURIComponent(id)}`, { method: "DELETE" });
    await Promise.all([loadBooks(), loadCollections()]);
    if (state.editingId === id) state.editingId = null;
    renderAdmin();
    showToast("Книга удалена");
  } catch (error) {
    showToast(error.message);
  }
}

function openAuth(mode) {
  state.authMode = mode;
  const isRegister = mode === "register";
  authTitle.textContent = isRegister ? "Создать аккаунт" : "Вход";
  authMessage.textContent = isRegister
    ? "Новый профиль получает роль читателя."
    : "Войдите, чтобы открыть книгу.";
  authForm.innerHTML = `
    ${
      isRegister
        ? `<div class="field">
            <label for="authName">Имя</label>
            <input id="authName" name="name" autocomplete="name" required minlength="2" />
          </div>`
        : ""
    }
    <div class="field">
      <label for="authEmail">Email</label>
      <input id="authEmail" name="email" type="text" inputmode="email" autocomplete="email" required />
    </div>
    <div class="field">
      <label for="authPassword">Пароль</label>
      <input id="authPassword" name="password" type="password" autocomplete="${isRegister ? "new-password" : "current-password"}" required minlength="8" />
    </div>
    <div class="form-actions">
      <button class="text-button primary" type="submit">${isRegister ? "Создать" : "Войти"}</button>
      <button class="text-button ghost" type="button" data-switch-auth>
        ${isRegister ? "У меня есть аккаунт" : "Создать аккаунт"}
      </button>
    </div>
  `;
  authModal.classList.remove("hidden");
  authForm.querySelector("input")?.focus();
}

function closeAuth() {
  authModal.classList.add("hidden");
}

async function submitAuth(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const isRegister = state.authMode === "register";
  const body = {
    email: form.get("email"),
    password: form.get("password")
  };
  if (isRegister) body.name = form.get("name");

  try {
    const payload = await api(isRegister ? "/api/auth/register" : "/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body)
    });
    state.user = payload.user;
    closeAuth();
    render();
    showToast(isRegister ? "Аккаунт создан" : "Вход выполнен");
    if (state.pendingBookId) {
      const id = state.pendingBookId;
      state.pendingBookId = null;
      await openBook(id);
    }
  } catch (error) {
    showToast(error.message);
  }
}

function showLibrary() {
  state.view = "library";
  state.activeBook = null;
  state.editingId = null;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showAdmin() {
  state.view = "admin";
  state.activeBook = null;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  renderAccount();
  searchInput.value = state.search;
  if (state.view === "reader") renderReader();
  else if (state.view === "admin") renderAdmin();
  else renderLibrary();
}

brandButton.addEventListener("click", showLibrary);
libraryButton.addEventListener("click", showLibrary);
adminButton.addEventListener("click", showAdmin);
themeButton.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem("lumi-theme", state.theme);
  applyTheme();
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  if (state.view !== "library") state.view = "library";
  renderLibrary();
});

authForm.addEventListener("submit", submitAuth);
authForm.addEventListener("click", (event) => {
  const switchButton = event.target.closest("[data-switch-auth]");
  if (switchButton) {
    openAuth(state.authMode === "register" ? "login" : "register");
  }
});

authModal.querySelectorAll("[data-close-auth]").forEach((node) => {
  node.addEventListener("click", closeAuth);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeAuth();
  const target = event.target;
  const isTyping =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement;
  if (isTyping || state.view !== "reader") return;
  if (event.key === "ArrowRight" || event.key === " ") {
    event.preventDefault();
    app.querySelector("[data-page-next]:not([disabled])")?.click();
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    app.querySelector("[data-page-prev]:not([disabled])")?.click();
  }
});
window.addEventListener("scroll", updateReaderProgress, { passive: true });

applyTheme();
applyFontScale();

try {
  await Promise.all([loadSession(), loadBooks(), loadCollections()]);
  render();
} catch (error) {
  app.innerHTML = `
    <section class="empty-state">
      <div>
        <h2>Не удалось загрузить библиотеку</h2>
        <p>${esc(error.message)}</p>
      </div>
    </section>
  `;
}
