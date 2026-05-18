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
  isTurningPage: false,
  view: "library",
  activeAuthor: null,
  category: "Все",
  collectionId: null,
  search: "",
  authMode: "login",
  pendingBookId: null,
  editingId: null,
  editingBook: null,
  theme: localStorage.getItem("lumi-theme") || "light",
  fontScale: Number(localStorage.getItem("lumi-font-scale") || "1")
};

const accentOptions = [
  "#1f5f97",
  "#8bbad8",
  "#203f62",
  "#7a4e2f",
  "#b88752",
  "#d9bf95",
  "#5f7690"
];

const authorDescriptions = {
  "Александр Пушкин":
    "Главный поэт русской литературы, который соединил ясность языка, живой сюжет и точную психологию. В библиотеке его удобно читать как вход в русскую классику: от романтической прозы до исторических тем.",
  "А. С. Пушкин":
    "Главный поэт русской литературы, который соединил ясность языка, живой сюжет и точную психологию. В библиотеке его удобно читать как вход в русскую классику: от романтической прозы до исторических тем.",
  "Михаил Лермонтов":
    "Поэт и прозаик напряженного внутреннего конфликта, одиночества и свободы. Его тексты звучат резко и музыкально, а герои часто стоят на границе между личной гордостью и судьбой.",
  "Николай Гоголь":
    "Мастер гротеска, сатиры и тревожной фантастики в повседневном мире. У Гоголя смешное быстро становится странным, а бытовая деталь открывает драму маленького человека.",
  "Иван Тургенев":
    "Писатель тонких наблюдений, мягкой лирики и точного социального чувства. Его проза часто держится на сочувствии, природе и тихом столкновении характера с обстоятельствами.",
  "Лев Толстой":
    "Классик нравственного выбора, психологической глубины и больших человеческих вопросов. Даже в короткой прозе Толстой показывает, как одно событие меняет взгляд человека на жизнь.",
  "Антон Чехов":
    "Писатель пауз, подтекста и живой человеческой неловкости. Его рассказы не торопятся объяснять героев, но точно передают момент, когда обычная жизнь становится внутренним открытием.",
  "Lumi Editorial":
    "Редакционная полка Lumi Books с авторскими подборками, заметками и демонстрационными материалами для чтения внутри проекта."
};

const authorBiographies = {
  "Александр Пушкин": [
    "Александр Сергеевич Пушкин родился в 1799 году в Москве и рано оказался в среде, где литература, французская культура и русская история были частью повседневной жизни. Учеба в Царскосельском лицее дала ему круг друзей, свободу литературного эксперимента и первые серьезные публикации.",
    "Пушкин стал фигурой, вокруг которой сформировался современный русский литературный язык. В его творчестве соединяются легкость стиха, точность прозы, историческое воображение и живой разговорный тон, поэтому его тексты читаются не как музейная классика, а как очень ясная и подвижная речь.",
    "Его жизнь была тесно связана с эпохой после Отечественной войны 1812 года, с идеями свободы, ссылками, цензурой и постоянным поиском личной независимости. Пушкин погиб в 1837 году после дуэли, но успел оставить корпус произведений, который стал основой русской классической традиции."
  ],
  "Михаил Лермонтов": [
    "Михаил Юрьевич Лермонтов родился в 1814 году в Москве и вырос в атмосфере семейных конфликтов, ранней потери матери и строгого воспитания у бабушки. Эти переживания часто связывают с его темами одиночества, внутренней гордости и болезненного чувства несвободы.",
    "Лермонтов вошел в литературу как поэт поколения после Пушкина, но быстро выработал собственный голос: резкий, музыкальный, драматичный. Его герои ищут абсолютной свободы и одновременно не могут выйти из круга судьбы, общества и собственного характера.",
    "За стихотворение на смерть Пушкина Лермонтов был отправлен на Кавказ, и кавказская тема стала одной из центральных в его творчестве. Он погиб в 1841 году на дуэли в Пятигорске, прожив всего двадцать шесть лет, но успел стать одним из главных авторов русского романтизма."
  ],
  "Николай Гоголь": [
    "Николай Васильевич Гоголь родился в 1809 году в Полтавской губернии, в украинской дворянской семье. Ранние впечатления от местного быта, народных историй и театральной культуры позже превратились в яркую смесь фантастики, юмора и тревожной прозы.",
    "Гоголь сделал смешное способом говорить о самом болезненном: чиновничьей пустоте, страхе маленького человека, духовной растерянности и странности повседневной жизни. Его Петербург часто выглядит реальным и призрачным одновременно, а бытовая деталь легко превращается в символ.",
    "Последние годы Гоголя были связаны с религиозными поисками, сомнениями в собственном даре и тяжелым внутренним кризисом. Он умер в 1852 году, оставив произведения, которые сильно повлияли на Достоевского, Салтыкова-Щедрина, Булгакова и всю русскую сатирическую традицию."
  ],
  "Иван Тургенев": [
    "Иван Сергеевич Тургенев родился в 1818 году в Орловской губернии, в дворянской семье. Детство в Спасском-Лутовинове, наблюдение за крепостной жизнью и сложные отношения с властной матерью стали важным опытом для его будущей прозы.",
    "Тургенев получил европейское образование, много жил за границей и стал одним из главных русских писателей, которых хорошо знали в Европе. Его стиль отличается мягкой точностью, вниманием к природе, психологической сдержанностью и умением показывать социальные перемены через частную судьбу.",
    "В его произведениях часто сталкиваются разные поколения, взгляды и типы характера. Тургенев умер во Франции в 1883 году, но его проза осталась одной из самых ясных дорог к пониманию русской жизни XIX века."
  ],
  "Лев Толстой": [
    "Лев Николаевич Толстой родился в 1828 году в Ясной Поляне, в дворянской семье. Рано потеряв родителей, он много размышлял о воспитании, семье, долге и смысле жизни, а позже превратил эти вопросы в центральные темы своего творчества.",
    "Толстой служил на Кавказе и участвовал в Крымской войне, что дало ему опыт прямого столкновения с насилием, страхом и моральным выбором. Его проза известна редкой психологической точностью: он показывает не только поступок, но и движение мысли, сомнение, самообман и пробуждение совести.",
    "Во второй половине жизни Толстой пережил духовный кризис, пересмотрел отношение к собственности, церкви, государству и насилию. Он умер в 1910 году на станции Астапово, оставив огромную литературную и нравственную традицию, которая до сих пор вызывает споры."
  ],
  "Антон Чехов": [
    "Антон Павлович Чехов родился в 1860 году в Таганроге, в семье купца. Он рано узнал и труд, и семейную ответственность: после разорения отца Чехов помогал близким, учился на врача и одновременно писал короткие юмористические тексты для журналов.",
    "Медицинское образование сильно повлияло на его взгляд на человека: Чехов редко судит героев напрямую, он наблюдает за ними точно, спокойно и внимательно. В его рассказах важны паузы, недосказанность, бытовые детали и момент, когда человек внезапно понимает что-то о себе.",
    "Чехов много занимался благотворительностью, лечил людей, участвовал в переписи на Сахалине и писал о жизни без громких эффектов, но с огромной внутренней силой. Он умер в 1904 году, став одним из главных мастеров рассказа и драматургии XX века."
  ],
  "Lumi Editorial": [
    "Lumi Editorial — внутренняя редакционная полка проекта, где собраны демонстрационные материалы, подборки и тексты для проверки интерфейса. Эти записи помогают тестировать карточки книг, ридер, статистику и навигацию без привязки к одному классическому автору.",
    "Такая полка нужна как рабочий инструмент: на ней удобно проверять разные длины текста, обложки, категории и сценарии чтения. В реальном каталоге этот раздел можно заменить редакционными заметками, подборками команды или авторскими рекомендациями."
  ]
};

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

function withPageTransition(update, type = "soft") {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || prefersReducedMotion) {
    update();
    return Promise.resolve();
  }

  document.documentElement.dataset.pageTransition = type;
  const transition = document.startViewTransition(update);
  return transition.finished
    .catch(() => {})
    .finally(() => {
      delete document.documentElement.dataset.pageTransition;
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
      state.activeAuthor = null;
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
  const safeAccent = /^#[0-9a-f]{6}$/i.test(book.accent) ? book.accent : "#1f5f97";
  const image = book.coverUrl
    ? `<img src="${esc(book.coverUrl)}" alt="Обложка ${esc(book.title)}" loading="lazy" />`
    : `<span class="cover-title">${esc(book.title)}</span>`;
  return `<div class="cover ${className}" style="--cover-accent:${safeAccent}">${image}</div>`;
}

function miniCover(book) {
  const safeAccent = /^#[0-9a-f]{6}$/i.test(book?.accent) ? book.accent : "#1f5f97";
  const image = book?.coverUrl
    ? `<img src="${esc(book.coverUrl)}" alt="" loading="lazy" />`
    : `<span>${esc(book?.title || "")}</span>`;
  return `<span class="mini-cover" style="--cover-accent:${safeAccent}">${image}</span>`;
}

function authorProfileName(name) {
  return name === "А. С. Пушкин" ? "Александр Пушкин" : name;
}

function authorDescription(author) {
  const name = typeof author === "string" ? author : author.name;
  const profileName = authorProfileName(name);
  if (authorDescriptions[profileName]) return authorDescriptions[profileName];

  const books = Array.isArray(author.books) ? author.books : [];
  const categories = Array.isArray(author.categories) ? author.categories : [];
  const categoryText = categories.length ? categories.join(", ") : "разных жанрах";
  const worksText = books
    .slice(0, 2)
    .map((book) => `«${book.title}»`)
    .join(" и ");

  if (worksText) {
    return `${name} представлен в библиотеке в разделе ${categoryText}. Начните с ${worksText}, чтобы познакомиться с авторским стилем и основными темами.`;
  }

  return `${name} представлен в библиотеке отдельной авторской полкой. Здесь собраны произведения, которые можно открыть и читать без перехода в другие разделы.`;
}

function authorBiography(author) {
  const name = typeof author === "string" ? author : author.name;
  const profileName = authorProfileName(name);
  if (authorBiographies[profileName]) return authorBiographies[profileName];

  return [
    authorDescription(author),
    "Биографический блок можно расширить после добавления новых сведений об авторе. Пока здесь показана краткая справка, связанная с произведениями, которые уже есть в библиотеке."
  ];
}

function authorShortDescription(author) {
  const description = author.description || authorDescription(author);
  return description.length > 132 ? `${description.slice(0, 129).trimEnd()}...` : description;
}

function authorSummaries() {
  const byAuthor = new Map();

  state.books.forEach((book) => {
    const name = book.author?.trim() || "Без автора";
    const summary =
      byAuthor.get(name) ||
      {
        name,
        books: [],
        bookIds: new Set(),
        categories: new Set(),
        totalPages: 0,
        totalMinutes: 0
      };

    summary.books.push(book);
    summary.bookIds.add(book.id);
    if (book.category) summary.categories.add(book.category);
    summary.totalPages += Number(book.stats?.pages || 0);
    summary.totalMinutes += Number(book.stats?.minutes || 0);
    byAuthor.set(name, summary);
  });

  return [...byAuthor.values()]
    .map((summary) => {
      const collectionIds = state.collections
        .filter((collection) => collection.bookIds.some((id) => summary.bookIds.has(id)))
        .map((collection) => collection.id);

      const author = {
        ...summary,
        books: [...summary.books].sort((left, right) => left.title.localeCompare(right.title, "ru")),
        categories: [...summary.categories].sort((left, right) => left.localeCompare(right, "ru")),
        collectionIds
      };

      return {
        ...author,
        description: authorDescription(author)
      };
    })
    .sort((left, right) => {
      const leftClassic = left.categories.includes("Русская классика") ? 1 : 0;
      const rightClassic = right.categories.includes("Русская классика") ? 1 : 0;
      return (
        rightClassic - leftClassic ||
        right.books.length - left.books.length ||
        right.totalMinutes - left.totalMinutes ||
        left.name.localeCompare(right.name, "ru")
      );
    });
}

function getAuthorSummary(authorName) {
  return authorSummaries().find((author) => author.name === authorName);
}

function libraryAuthorRecommendations(limit = 8) {
  return authorSummaries().slice(0, limit);
}

function recommendedAuthors(authorName, limit = 4) {
  const current = getAuthorSummary(authorName);
  if (!current) return libraryAuthorRecommendations(limit);

  const currentCategories = new Set(current.categories);
  const currentCollections = new Set(current.collectionIds);

  return authorSummaries()
    .filter((author) => author.name !== current.name)
    .map((author) => {
      const categoryScore = author.categories.filter((category) => currentCategories.has(category)).length * 6;
      const collectionScore = author.collectionIds.filter((id) => currentCollections.has(id)).length * 4;
      const classicScore =
        author.categories.includes("Русская классика") && currentCategories.has("Русская классика") ? 4 : 0;
      const volumeScore = Math.min(author.books.length, 4);
      return {
        ...author,
        score: categoryScore + collectionScore + classicScore + volumeScore
      };
    })
    .sort((left, right) => {
      return (
        right.score - left.score ||
        right.books.length - left.books.length ||
        right.totalMinutes - left.totalMinutes ||
        left.name.localeCompare(right.name, "ru")
      );
    })
    .slice(0, limit);
}

function renderBookCards(books) {
  return books
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
}

function renderAuthorCard(author, className = "") {
  const covers = author.books.slice(0, 3).map((book) => miniCover(book)).join("");
  const categoryText = author.categories.slice(0, 2).join(" · ") || "Книги автора";
  const description = authorShortDescription(author);
  return `
    <button class="author-card ${className}" type="button" data-author="${esc(author.name)}" aria-label="Открыть автора ${esc(author.name)}">
      <span class="author-covers">${covers}</span>
      <span class="author-copy">
        <strong>${esc(author.name)}</strong>
        <span>${esc(categoryText)}</span>
        <p class="author-description">${esc(description)}</p>
        <small>${author.books.length} произв. · ${author.totalMinutes} мин</small>
      </span>
    </button>
  `;
}

function renderAuthorsSection() {
  const authors = libraryAuthorRecommendations();
  if (!authors.length) return "";

  return `
    <section class="author-section" aria-label="Рекомендации по авторам">
      <div class="section-title">
        <div>
          <p class="eyebrow">Авторы</p>
          <h2>Рекомендации по авторам</h2>
        </div>
      </div>
      <div class="author-grid">${authors.map((author) => renderAuthorCard(author)).join("")}</div>
    </section>
  `;
}

function bindBookOpeners(root = app) {
  root.querySelectorAll("[data-book-id]").forEach((button) => {
    button.addEventListener("click", () => openBook(button.dataset.bookId, button));
  });
}

function bindAuthorOpeners(root = app) {
  root.querySelectorAll("[data-author]").forEach((button) => {
    button.addEventListener("click", () => openAuthor(button.dataset.author));
  });
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
  document.body.dataset.view = "library";
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

  const cards = renderBookCards(books);

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
    ${renderAuthorsSection()}
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

  bindAuthorOpeners();
  bindBookOpeners();
}

function openAuthor(authorName) {
  if (!authorName) return;
  withPageTransition(() => {
    state.activeAuthor = authorName;
    state.activeBook = null;
    state.editingId = null;
    state.editingBook = null;
    state.search = "";
    state.view = "author";
    render();
    window.scrollTo({ top: 0, behavior: "auto" });
  }, "soft");
}

function renderAuthorPage() {
  document.body.dataset.view = "author";
  const author = getAuthorSummary(state.activeAuthor);
  if (!author) {
    state.activeAuthor = null;
    state.view = "library";
    renderLibrary();
    return;
  }

  const query = state.search.trim().toLowerCase();
  const authorBooks = author.books.filter((book) => {
    const haystack = `${book.title} ${book.summary} ${book.category}`.toLowerCase();
    return !query || haystack.includes(query);
  });
  const recommendations = recommendedAuthors(author.name);
  const categoryText = author.categories.join(" · ") || "Авторская полка";
  const description = author.description || authorDescription(author);
  const biography = authorBiography(author);
  const cards = renderBookCards(authorBooks);
  const recommendationCards = recommendations.map((item) => renderAuthorCard(item)).join("");

  app.innerHTML = `
    <section class="author-page">
      <section class="author-hero glass-hero">
        <div class="author-hero-copy">
          <button class="text-button ghost" type="button" data-back-library>← Библиотека</button>
          <p class="eyebrow">Автор</p>
          <h1>${esc(author.name)}</h1>
          <p class="subcopy">${esc(categoryText)}</p>
          <p class="author-description-large">${esc(description)}</p>
        </div>
        <div class="author-stats" aria-label="Статистика автора">
          <div class="stat"><strong>${author.books.length}</strong><span>произведений</span></div>
          <div class="stat"><strong>${author.totalPages}</strong><span>страниц</span></div>
          <div class="stat"><strong>${author.totalMinutes}</strong><span>мин чтения</span></div>
        </div>
      </section>

      <section class="author-bio" aria-label="Биография автора">
        <div class="section-title">
          <div>
            <p class="eyebrow">Биография</p>
            <h2>Жизнь и творчество</h2>
          </div>
        </div>
        <div class="author-bio-text">
          ${biography.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}
        </div>
      </section>

      <section class="author-books" aria-label="Произведения автора">
        <div class="section-title">
          <div>
            <p class="eyebrow">Книги</p>
            <h2>Произведения автора</h2>
          </div>
        </div>
        ${
          cards
            ? `<div class="book-grid">${cards}</div>`
            : `<section class="empty-state"><div><h2>Книги не найдены</h2><p>Измените поиск, чтобы увидеть произведения этого автора.</p></div></section>`
        }
      </section>

      ${
        recommendationCards
          ? `<section class="author-section" aria-label="Похожие авторы">
              <div class="section-title">
                <div>
                  <p class="eyebrow">Авторы</p>
                  <h2>Похожие авторы</h2>
                </div>
              </div>
              <div class="author-grid">${recommendationCards}</div>
            </section>`
          : ""
      }
    </section>
  `;

  app.querySelector("[data-back-library]")?.addEventListener("click", showLibrary);
  bindAuthorOpeners();
  bindBookOpeners();
}

async function openBook(id, trigger) {
  if (!state.user) {
    state.pendingBookId = id;
    openAuth("login");
    return;
  }

  try {
    trigger?.classList.add("is-opening");
    const payload = await api(`/api/books/${encodeURIComponent(id)}`);
    await withPageTransition(() => {
      state.activeBook = payload.book;
      state.readerPage = 0;
      state.view = "reader";
      render();
      window.scrollTo({ top: 0, behavior: "auto" });
    }, "book-open");
  } catch (error) {
    showToast(error.message);
  } finally {
    trigger?.classList.remove("is-opening");
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
  const base = width < 620 ? 1350 : width < 980 ? 1850 : 2450;
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

async function setReaderPage(nextPage, pages) {
  const nextReaderPage = Math.min(Math.max(nextPage, 0), pages.length - 1);
  if (nextReaderPage === state.readerPage || state.isTurningPage) return;

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const transitionType = nextReaderPage > state.readerPage ? "page-next" : "page-prev";
  state.isTurningPage = true;

  try {
    await withPageTransition(() => {
      state.readerPage = nextReaderPage;
      renderReader();
      window.scrollTo({ top: 0, behavior: "auto" });
    }, transitionType);
  } finally {
    state.isTurningPage = false;
  }
}

function renderReader() {
  document.body.dataset.view = "reader";
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
  document.body.dataset.view = "admin";
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

  const listedEditingBook = state.books.find((book) => book.id === state.editingId);
  const editingBook = state.editingBook?.id === state.editingId
    ? state.editingBook
    : listedEditingBook;
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
    state.editingBook = null;
    renderAdmin();
  });

  app.querySelector("#bookForm").addEventListener("submit", saveBook);
  app.querySelector("#bookTxtFile")?.addEventListener("change", importBookFile);
  app.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => editBook(button.dataset.edit));
  });
  app.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteBook(button.dataset.delete));
  });
}

async function editBook(id) {
  try {
    const payload = await api(`/api/books/${encodeURIComponent(id)}`);
    state.editingId = id;
    state.editingBook = payload.book;
    renderAdmin();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    showToast(error.message);
  }
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
    state.editingBook = null;
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
    if (state.editingId === id) {
      state.editingId = null;
      state.editingBook = null;
    }
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
  withPageTransition(() => {
    state.view = "library";
    state.activeBook = null;
    state.activeAuthor = null;
    state.editingId = null;
    state.editingBook = null;
    render();
    window.scrollTo({ top: 0, behavior: "auto" });
  }, "soft-close");
}

function showAdmin() {
  state.view = "admin";
  state.activeBook = null;
  state.activeAuthor = null;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  renderAccount();
  searchInput.value = state.search;
  if (state.view === "reader") renderReader();
  else if (state.view === "author") renderAuthorPage();
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
  if (state.view !== "library" && state.view !== "author") {
    state.view = "library";
    state.activeAuthor = null;
  }
  render();
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
