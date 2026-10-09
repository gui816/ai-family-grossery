require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
const { Server } = require("socket.io");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const io = new Server(server, { cors: { origin: allowedOrigin, methods: ["GET", "POST", "PATCH", "DELETE"] } });
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: "100kb" }));

const PORT = Number(process.env.PORT || 3001);
const mongoUri = process.env.MONGODB_URI;
let lists;
let items;

function createCode() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.randomBytes(8);
  return Array.from(bytes, b => alphabet[b % alphabet.length]).slice(0, 6).join("");
}
function validCode(code) { return typeof code === "string" && /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(code); }
function cleanName(value) { return typeof value === "string" ? value.trim().slice(0, 100) : ""; }
function serializeItem(item) { return { ...item, _id: String(item._id), listId: String(item.listId) }; }
async function findList(code) {
  if (!validCode(code)) return null;
  return lists.findOne({ shareCode: code });
}
async function getItems(listId) {
  const docs = await items.find({ listId: String(listId) }).sort({ createdAt: 1 }).toArray();
  return docs.map(serializeItem);
}
async function responseFor(code) {
  const list = await findList(code);
  if (!list) return null;
  return { list: { name: list.name, shareCode: list.shareCode }, items: await getItems(list._id) };
}
async function emitUpdate(code) {
  const data = await responseFor(code);
  if (data) io.to(code).emit("list-updated", { listCode: code, items: data.items });
}

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "lista-familia" }));

app.post("/api/lists", async (req, res, next) => {
  try {
    const name = cleanName(req.body?.name) || "Compras da família";
    let shareCode;
    let exists = true;
    while (exists) {
      shareCode = createCode();
      exists = await lists.findOne({ shareCode }, { projection: { _id: 1 } });
    }
    const doc = { name, shareCode, createdAt: new Date() };
    const result = await lists.insertOne(doc);
    res.status(201).json({ list: { name: doc.name, shareCode: doc.shareCode, _id: String(result.insertedId) }, items: [] });
  } catch (error) { next(error); }
});

app.get("/api/lists/:code", async (req, res, next) => {
  try {
    const data = await responseFor(req.params.code.toUpperCase());
    if (!data) return res.status(404).json({ error: "Lista não encontrada." });
    res.json(data);
  } catch (error) { next(error); }
});

app.post("/api/lists/:code/items", async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase();
    const list = await findList(code);
    if (!list) return res.status(404).json({ error: "Lista não encontrada." });
    const name = cleanName(req.body?.name);
    if (!name) return res.status(400).json({ error: "Indica o nome do artigo." });
    const quantity = Math.max(1, Math.min(999, Number.parseInt(req.body?.quantity, 10) || 1));
    const categories = ["fruta", "frescos", "despensa", "limpeza", "outros"];
    const category = categories.includes(req.body?.category) ? req.body.category : "outros";
    await items.insertOne({ listId: String(list._id), name, quantity, category, done: false, createdAt: new Date() });
    const updated = await getItems(list._id);
    res.status(201).json({ items: updated });
    await emitUpdate(code);
  } catch (error) { next(error); }
});

app.patch("/api/lists/:code/items/:itemId", async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase();
    const list = await findList(code);
    if (!list) return res.status(404).json({ error: "Lista não encontrada." });
    if (!ObjectId.isValid(req.params.itemId)) return res.status(400).json({ error: "Artigo inválido." });
    const changes = {};
    if (typeof req.body?.done === "boolean") changes.done = req.body.done;
    if (req.body?.name !== undefined) {
      const name = cleanName(req.body.name);
      if (!name) return res.status(400).json({ error: "O nome não pode ficar vazio." });
      changes.name = name;
    }
    if (req.body?.quantity !== undefined) changes.quantity = Math.max(1, Math.min(999, Number.parseInt(req.body.quantity, 10) || 1));
    if (req.body?.category !== undefined && ["fruta", "frescos", "despensa", "limpeza", "outros"].includes(req.body.category)) changes.category = req.body.category;
    const result = await items.updateOne({ _id: new ObjectId(req.params.itemId), listId: String(list._id) }, { $set: changes });
    if (!result.matchedCount) return res.status(404).json({ error: "Artigo não encontrado." });
    const updated = await getItems(list._id);
    res.json({ items: updated });
    await emitUpdate(code);
  } catch (error) { next(error); }
});

app.delete("/api/lists/:code/items/:itemId", async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase();
    const list = await findList(code);
    if (!list) return res.status(404).json({ error: "Lista não encontrada." });
    if (!ObjectId.isValid(req.params.itemId)) return res.status(400).json({ error: "Artigo inválido." });
    await items.deleteOne({ _id: new ObjectId(req.params.itemId), listId: String(list._id) });
    const updated = await getItems(list._id);
    res.json({ items: updated });
    await emitUpdate(code);
  } catch (error) { next(error); }
});

app.delete("/api/lists/:code/completed", async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase();
    const list = await findList(code);
    if (!list) return res.status(404).json({ error: "Lista não encontrada." });
    await items.deleteMany({ listId: String(list._id), done: true });
    const updated = await getItems(list._id);
    res.json({ items: updated });
    await emitUpdate(code);
  } catch (error) { next(error); }
});

io.on("connection", socket => {
  socket.on("join-list", code => {
    const normalized = String(code || "").toUpperCase();
    if (validCode(normalized)) socket.join(normalized);
  });
});

if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "..", "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
}
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Ocorreu um erro inesperado. Tenta novamente." });
});

async function start() {
  if (!mongoUri) {
    console.error("MONGODB_URI não está definido. Copia .env.example para .env e configura o MongoDB.");
    process.exit(1);
  }
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "lista_familia");
  lists = db.collection("lists");
  items = db.collection("items");
  await lists.createIndex({ shareCode: 1 }, { unique: true });
  await items.createIndex({ listId: 1, createdAt: 1 });
  server.listen(PORT, "0.0.0.0", () => console.log(`Lista Família API listening on port ${PORT}`));
}
start().catch(error => { console.error("Failed to start server:", error); process.exit(1); });
