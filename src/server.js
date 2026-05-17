import crypto from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedBooks, seedCollections } from "./seed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");

const port = Number(process.env.PORT || 3003);
const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(rootDir, "data");
const dbPath = path.join(dataDir, "library.json");
const cookieName = "lumi_session";
const sessionDays = 7;
const maxJsonBytes = 12 * 1024 * 1024;
const passwordIterations = 120000;

let db = null;
let saveQueue = Promise.resolve();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon"
};

const sampleBooks = [
  {
    id: crypto.randomUUID(),
    title: "Тихий сад",
    author: "Lumi Editorial",
    category: "Проза",
    summary:
      "Камерная история о доме у воды, где старые письма помогают героине вернуть себе спокойствие.",
    coverUrl: "",
    accent: "#0a84ff",
    createdAt: new Date().toISOString(),
    createdBy: "system",
    content: [
      "Утро пришло без спешки. Ветер едва касался воды, и сад за домом казался собранным из тонких зеленых стекол. Марина открыла окно, поставила на подоконник чашку кофе и впервые за долгое время не стала проверять телефон.",
      "На письменном столе лежала коробка с письмами. Их перевязали шелковой лентой, давно выцветшей на сгибах. Каждое письмо пахло бумагой, солнцем и чем-то еще, что невозможно было назвать одним словом.",
      "Она читала медленно, будто училась заново слышать тишину. В этих строках не было больших обещаний. Только маленькие доказательства жизни: дождь в июне, яблоки на кухне, голос соседки за изгородью.",
      "К полудню сад стал светлее. Марина вынесла кресло под грушу и поняла, что возвращение иногда не требует дороги. Иногда достаточно открыть старое письмо и позволить дому снова произнести твое имя.",
      "Вечером она зажгла лампу и написала ответ. Не тем, кто давно ушел, а себе самой. Почерк сначала дрожал, затем стал ровным. За окном темнела вода, и город на другом берегу включал огни один за другим."
    ].join("\n\n")
  },
  {
    id: crypto.randomUUID(),
    title: "Маршрут без карты",
    author: "Lumi Editorial",
    category: "Путешествия",
    summary:
      "Небольшой путевой дневник о северном поезде, случайных городах и людях, которые меняют план лучше навигатора.",
    coverUrl: "",
    accent: "#30d158",
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    createdBy: "system",
    content: [
      "Поезд уходил в шесть десять, и вокзал еще не успел проснуться окончательно. На табло мерцали города, похожие на чужие пароли. Илья купил чай в бумажном стакане и сел у окна, не открывая карту.",
      "Он обещал себе ехать туда, где захочется выйти. Первый день прошел в ровном стуке колес. Второй принес станцию с коротким названием, деревянный мост и женщину в красном пальто, которая спросила, не ищет ли он гостиницу.",
      "Гостиница оказалась бывшей школой. В коридоре пахло мелом и свежей краской. Хозяин рассказывал о реке так, будто она была членом семьи: капризная весной, щедрая летом и совершенно честная осенью.",
      "Илья остался на три дня. Он ходил вдоль берега, пил крепкий чай, записывал разговоры и все никак не мог объяснить, почему незнакомый город быстро стал понятным. Возможно, потому что никто не требовал от него готового ответа.",
      "Когда поезд пришел снова, карта в телефоне так и осталась закрытой. Впереди было еще несколько станций, несколько случайных улиц и странное удовольствие жить не по маршруту, а по вниманию."
    ].join("\n\n")
  },
  {
    id: crypto.randomUUID(),
    title: "Свет в мастерской",
    author: "Lumi Editorial",
    category: "Нон-фикшн",
    summary:
      "Эссе о творческой дисциплине, тихой работе и привычках, которые помогают доводить идеи до формы.",
    coverUrl: "",
    accent: "#ff9f0a",
    createdAt: new Date(Date.now() - 7200 * 1000).toISOString(),
    createdBy: "system",
    content: [
      "Мастерская редко похожа на вдохновение. Чаще она выглядит как стол, на котором осталось место только для локтей, лампа с теплым кругом света и список дел, написанный слишком крупно.",
      "Но именно в таких условиях идея перестает быть туманом. Ей дают время, бумагу, сопротивление материала и право быть несовершенной в первые часы. Дисциплина не делает работу холодной. Она сохраняет для нее пространство.",
      "Полезная привычка начинается с малого движения: открыть документ, наточить карандаш, положить рядом книгу, выключить лишний звук. Через несколько минут тело понимает сигнал раньше головы.",
      "Творческая работа редко вознаграждает немедленно. Зато она накапливает доверие к собственному вниманию. День за днем становится ясно: форма появляется не потому, что момент идеален, а потому, что ты снова сел к столу.",
      "Когда вечером лампа гаснет, важен не масштаб сделанного. Важнее, что мысль получила продолжение. Завтра она вернется уже не пустой, а с краем, за который можно взяться."
    ].join("\n\n")
  }
];

function nowIso() {
  return new Date().toISOString();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto
    .pbkdf2Sync(password, salt, passwordIterations, 32, "sha256")
    .toString("hex");
  return `pbkdf2$${passwordIterations}$${salt}$${hash}`;
}

function verifyPassword(password, storedHash) {
  const [scheme, iterations, salt, hash] = String(storedHash || "").split("$");
  if (scheme !== "pbkdf2" || !iterations || !salt || !hash) return false;
  const candidate = crypto
    .pbkdf2Sync(password, salt, Number(iterations), 32, "sha256")
    .toString("hex");
  const left = Buffer.from(hash, "hex");
  const right = Buffer.from(candidate, "hex");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function bookStats(content) {
  const words = String(content || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return {
    words,
    minutes: Math.max(1, Math.ceil(words / 220)),
    pages: Math.max(1, Math.ceil(words / 300))
  };
}

function publicBook(book, includeContent = false) {
  const base = {
    id: book.id,
    seedKey: book.seedKey,
    title: book.title,
    author: book.author,
    category: book.category,
    summary: book.summary,
    coverUrl: book.coverUrl,
    accent: book.accent,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt || book.createdAt,
    stats: bookStats(book.content)
  };
  if (includeContent) base.content = book.content;
  return base;
}

function publicCollection(collection) {
  const bookIds = (collection.bookKeys || collection.bookIds || [])
    .map((keyOrId) => {
      const book = db.books.find(
        (candidate) => candidate.seedKey === keyOrId || candidate.id === keyOrId
      );
      return book?.id;
    })
    .filter(Boolean);

  return {
    id: collection.id,
    title: collection.title,
    description: collection.description,
    bookIds
  };
}

async function loadDb() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    const raw = await fs.readFile(dbPath, "utf8");
    db = JSON.parse(raw);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    db = {
      meta: { createdAt: nowIso() },
      users: [],
      sessions: [],
      books: seedBooks.map((book) => ({ ...book })),
      collections: seedCollections.map((collection) => ({ ...collection }))
    };
  }

  syncSeedData();
  await ensureAdminUser();
  pruneExpiredSessions();
  await saveDb();
}

function syncSeedData() {
  db.books ||= [];
  db.collections ||= [];

  for (const seed of seedBooks) {
    const existing = db.books.find(
      (book) => book.seedKey === seed.seedKey || book.id === seed.id || book.title === seed.title
    );

    if (existing) {
      Object.assign(existing, {
        seedKey: seed.seedKey,
        title: seed.title,
        author: seed.author,
        category: seed.category,
        summary: seed.summary,
        coverUrl: seed.coverUrl,
        accent: seed.accent,
        collectionIds: seed.collectionIds,
        content: seed.content,
        updatedAt: nowIso(),
        createdBy: existing.createdBy || "system"
      });
    } else {
      db.books.push({ ...seed });
    }
  }

  db.collections = seedCollections.map((collection) => ({ ...collection }));
}

async function saveDb() {
  saveQueue = saveQueue.then(async () => {
    const tmpPath = `${dbPath}.tmp`;
    await fs.writeFile(tmpPath, `${JSON.stringify(db, null, 2)}\n`, "utf8");
    await fs.rename(tmpPath, dbPath);
  });
  return saveQueue;
}

async function ensureAdminUser() {
  const adminEmail = normalizeEmail(
    process.env.ADMIN_EMAIL || "admin@lumi-books.local"
  );
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const adminName = process.env.ADMIN_NAME || "Администратор";
  const existing = db.users.find((user) => user.email === adminEmail);

  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      existing.updatedAt = nowIso();
    }
    return;
  }

  db.users.push({
    id: crypto.randomUUID(),
    name: adminName,
    email: adminEmail,
    passwordHash: hashPassword(adminPassword),
    role: "admin",
    createdAt: nowIso()
  });
}

function pruneExpiredSessions() {
  const now = Date.now();
  db.sessions = db.sessions.filter((session) => session.expiresAt > now);
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

const cp1251Special = new Map(
  [
    "\u0402",
    "\u0403",
    "\u201A",
    "\u0453",
    "\u201E",
    "\u2026",
    "\u2020",
    "\u2021",
    "\u20AC",
    "\u2030",
    "\u0409",
    "\u2039",
    "\u040A",
    "\u040C",
    "\u040B",
    "\u040F",
    "\u0452",
    "\u2018",
    "\u2019",
    "\u201C",
    "\u201D",
    "\u2022",
    "\u2013",
    "\u2014",
    "",
    "\u2122",
    "\u0459",
    "\u203A",
    "\u045A",
    "\u045C",
    "\u045B",
    "\u045F",
    "\u00A0",
    "\u040E",
    "\u045E",
    "\u0408",
    "\u00A4",
    "\u0490",
    "\u00A6",
    "\u00A7",
    "\u0401",
    "\u00A9",
    "\u0404",
    "\u00AB",
    "\u00AC",
    "\u00AD",
    "\u00AE",
    "\u0407",
    "\u00B0",
    "\u00B1",
    "\u0406",
    "\u0456",
    "\u0491",
    "\u00B5",
    "\u00B6",
    "\u00B7",
    "\u0451",
    "\u2116",
    "\u0454",
    "\u00BB",
    "\u0458",
    "\u0405",
    "\u0455",
    "\u0457"
  ]
    .map((char, index) => (char ? [char, index + 0x80] : null))
    .filter(Boolean)
);

function cp1251ByteForChar(char) {
  const code = char.charCodeAt(0);
  if (code <= 0x7f) return code;
  if (code >= 0x0410 && code <= 0x044f) return code - 0x0410 + 0xc0;
  return cp1251Special.get(char);
}

function mojibakeScore(value) {
  return (
    String(value || "").match(
      /(Р[А-Яа-яЁёЇїІіЄєҐґЎў]|С[А-Яа-яЁёЇїІіЄєҐґЎў]|В[«»]|вЂ)/g
    ) || []
  ).length;
}

function repairMojibake(value) {
  const text = String(value || "");
  if (mojibakeScore(text) < 6) return text;
  const bytes = [];
  for (const char of text) {
    const byte = cp1251ByteForChar(char);
    if (byte === undefined) return text;
    bytes.push(byte);
  }
  const repaired = Buffer.from(bytes).toString("utf8");
  return mojibakeScore(repaired) < mojibakeScore(text) ? repaired : text;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + sessionDays * 24 * 60 * 60 * 1000;
  db.sessions.push({
    id: crypto.randomUUID(),
    userId,
    tokenHash: sha256(token),
    expiresAt,
    createdAt: nowIso()
  });
  return { token, expiresAt };
}

function parseCookies(header = "") {
  return header.split(";").reduce((cookies, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) return cookies;
    cookies[rawKey] = decodeURIComponent(rest.join("=") || "");
    return cookies;
  }, {});
}

function sessionCookie(token, expiresAt) {
  const parts = [
    `${cookieName}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor((expiresAt - Date.now()) / 1000)}`
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

function clearSessionCookie() {
  return `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function getCurrentUser(req) {
  const token = parseCookies(req.headers.cookie || "")[cookieName];
  if (!token) return null;
  const tokenHash = sha256(token);
  const session = db.sessions.find(
    (candidate) =>
      candidate.tokenHash === tokenHash && candidate.expiresAt > Date.now()
  );
  if (!session) return null;
  return db.users.find((user) => user.id === session.userId) || null;
}

function deleteSession(req) {
  const token = parseCookies(req.headers.cookie || "")[cookieName];
  if (!token) return;
  const tokenHash = sha256(token);
  db.sessions = db.sessions.filter((session) => session.tokenHash !== tokenHash);
}

function sendJson(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...extraHeaders
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxJsonBytes) {
      const error = new Error("Слишком большой запрос");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("Некорректный JSON");
    error.status = 400;
    throw error;
  }
}

function requireUser(req, res) {
  const user = getCurrentUser(req);
  if (!user) {
    sendError(res, 401, "Нужен вход в учетную запись");
    return null;
  }
  return user;
}

function requireAdmin(req, res) {
  const user = requireUser(req, res);
  if (!user) return null;
  if (user.role !== "admin") {
    sendError(res, 403, "Добавлять книги может только администратор");
    return null;
  }
  return user;
}

function normalizeBookInput(body) {
  const title = cleanText(repairMojibake(body.title), 120);
  const author = cleanText(repairMojibake(body.author), 120);
  const category = cleanText(repairMojibake(body.category || "Без категории"), 60);
  const summary = cleanText(repairMojibake(body.summary), 280);
  const content = cleanText(repairMojibake(body.content), 2000000);
  const coverUrl = cleanText(body.coverUrl, 500);
  const accent = cleanText(body.accent || "#0a84ff", 20);

  if (title.length < 2) return { error: "Укажите название книги" };
  if (author.length < 2) return { error: "Укажите автора" };
  if (summary.length < 10) return { error: "Добавьте короткое описание" };
  if (content.length < 80) return { error: "Добавьте текст книги" };
  if (coverUrl && !/^(https?:\/\/|\/).+/i.test(coverUrl)) {
    return { error: "Обложка должна быть ссылкой http или https" };
  }
  if (!/^#[0-9a-f]{6}$/i.test(accent)) {
    return { error: "Акцентный цвет должен быть в формате #0a84ff" };
  }

  return {
    book: { title, author, category, summary, content, coverUrl, accent }
  };
}

async function handleApi(req, res, url) {
  pruneExpiredSessions();

  if (req.method === "GET" && url.pathname === "/api/session") {
    sendJson(res, 200, { user: publicUser(getCurrentUser(req)) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/auth/register") {
    const body = await readJsonBody(req);
    const name = cleanText(body.name, 80);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");

    if (name.length < 2) return sendError(res, 400, "Укажите имя");
    if (!validateEmail(email)) return sendError(res, 400, "Укажите email");
    if (password.length < 8) {
      return sendError(res, 400, "Пароль должен быть не короче 8 символов");
    }
    if (db.users.some((user) => user.email === email)) {
      return sendError(res, 409, "Пользователь с таким email уже есть");
    }

    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: hashPassword(password),
      role: "reader",
      createdAt: nowIso()
    };
    db.users.push(user);
    const session = createSession(user.id);
    await saveDb();
    sendJson(
      res,
      201,
      { user: publicUser(user) },
      { "Set-Cookie": sessionCookie(session.token, session.expiresAt) }
    );
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await readJsonBody(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const user = db.users.find((candidate) => candidate.email === email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return sendError(res, 401, "Неверный email или пароль");
    }

    const session = createSession(user.id);
    await saveDb();
    sendJson(
      res,
      200,
      { user: publicUser(user) },
      { "Set-Cookie": sessionCookie(session.token, session.expiresAt) }
    );
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/auth/logout") {
    deleteSession(req);
    await saveDb();
    sendJson(res, 200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/books") {
    const books = db.books
      .slice()
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .map((book) => publicBook(book));
    sendJson(res, 200, { books });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/collections") {
    const collections = db.collections
      .map((collection) => publicCollection(collection))
      .filter((collection) => collection.bookIds.length > 0);
    sendJson(res, 200, { collections });
    return;
  }

  const bookMatch = url.pathname.match(/^\/api\/books\/([^/]+)$/);

  if (req.method === "GET" && bookMatch) {
    const user = requireUser(req, res);
    if (!user) return;
    const book = db.books.find((candidate) => candidate.id === bookMatch[1]);
    if (!book) return sendError(res, 404, "Книга не найдена");
    sendJson(res, 200, { book: publicBook(book, true) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/books") {
    const user = requireAdmin(req, res);
    if (!user) return;
    const body = await readJsonBody(req);
    const normalized = normalizeBookInput(body);
    if (normalized.error) return sendError(res, 400, normalized.error);

    const book = {
      id: crypto.randomUUID(),
      ...normalized.book,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdBy: user.id
    };
    db.books.unshift(book);
    await saveDb();
    sendJson(res, 201, { book: publicBook(book, true) });
    return;
  }

  if (req.method === "PUT" && bookMatch) {
    const user = requireAdmin(req, res);
    if (!user) return;
    const book = db.books.find((candidate) => candidate.id === bookMatch[1]);
    if (!book) return sendError(res, 404, "Книга не найдена");
    const body = await readJsonBody(req);
    const normalized = normalizeBookInput(body);
    if (normalized.error) return sendError(res, 400, normalized.error);

    Object.assign(book, normalized.book, { updatedAt: nowIso() });
    await saveDb();
    sendJson(res, 200, { book: publicBook(book, true) });
    return;
  }

  if (req.method === "DELETE" && bookMatch) {
    const user = requireAdmin(req, res);
    if (!user) return;
    const index = db.books.findIndex((candidate) => candidate.id === bookMatch[1]);
    if (index === -1) return sendError(res, 404, "Книга не найдена");
    db.books.splice(index, 1);
    await saveDb();
    sendJson(res, 200, { ok: true });
    return;
  }

  sendError(res, 404, "Маршрут не найден");
}

async function serveStatic(req, res, url) {
  const safePath = decodeURIComponent(url.pathname);
  const relativePath = safePath === "/" ? "index.html" : safePath.slice(1);
  const normalizedPath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(publicDir, normalizedPath);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    const contentType =
      mimeTypes[path.extname(filePath).toLowerCase()] ||
      "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": (
        contentType.startsWith("text/html") ||
        contentType.startsWith("text/css") ||
        contentType.startsWith("application/javascript")
      )
        ? "no-store"
        : "public, max-age=3600"
    });
    res.end(data);
  } catch (error) {
    if (error.code === "ENOENT" && !path.extname(filePath)) {
      filePath = path.join(publicDir, "index.html");
      const data = await fs.readFile(filePath);
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      });
      res.end(data);
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

async function handleRequest(req, res) {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }

    await serveStatic(req, res, url);
  } catch (error) {
    const status = error.status || 500;
    const message = status >= 500 ? "Внутренняя ошибка сервера" : error.message;
    if (status >= 500) console.error(error);
    sendError(res, status, message);
  }
}

await loadDb();

http.createServer(handleRequest).listen(port, () => {
  console.log(`Lumi Books is running at http://localhost:${port}`);
  console.log(`Data directory: ${dataDir}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log("Default admin: admin@lumi-books.local / ChangeMe123!");
  }
});
