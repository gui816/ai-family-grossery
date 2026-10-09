import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  ArrowRight, Check, CheckCheck, ChevronDown, CircleHelp, Clipboard, Copy,
  Leaf, LoaderCircle, Plus, ShoppingBasket, Trash2, Users, Wifi, WifiOff, X
} from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "Tudo", emoji: "🛒" },
  { id: "fruta", label: "Fruta e legumes", emoji: "🥑" },
  { id: "frescos", label: "Frescos", emoji: "🥛" },
  { id: "despensa", label: "Despensa", emoji: "🥫" },
  { id: "limpeza", label: "Limpeza", emoji: "🧽" },
  { id: "outros", label: "Outros", emoji: "📦" }
];

function guessCategory(name) {
  const n = name.toLocaleLowerCase("pt-PT");
  if (/maçã|banana|laranja|pera|uva|morango|tomate|alface|cebola|batata|cenoura|courgette|pepino|fruta|legume|abacate|limão/.test(n)) return "fruta";
  if (/leite|iogurte|queijo|manteiga|ovo|ovos|natas|fiambre|carne|frango|peixe|salmão|presunto/.test(n)) return "frescos";
  if (/arroz|massa|atum|feijão|grão|farinha|açúcar|café|chá|azeite|óleo|cereais|bolacha|pão|conserva|molho/.test(n)) return "despensa";
  if (/detergente|lixívia|esponja|papel higiénico|papel de cozinha|saco do lixo|limpeza|lava-loiça|sabão/.test(n)) return "limpeza";
  return "outros";
}

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Não foi possível concluir a operação.");
  return data;
}

export default function App() {
  const [listCode, setListCode] = useState(() => localStorage.getItem("lista-familia-code") || "");
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [category, setCategory] = useState("auto");
  const [filter, setFilter] = useState("all");
  const [showDone, setShowDone] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [listName, setListName] = useState("Compras da família");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [showShare, setShowShare] = useState(false);

  const activeItems = useMemo(() => items.filter(i => !i.done), [items]);
  const doneItems = useMemo(() => items.filter(i => i.done), [items]);
  const visibleItems = useMemo(() => {
    const source = showDone ? items : activeItems;
    return source.filter(i => filter === "all" || i.category === filter);
  }, [items, activeItems, filter, showDone]);

  useEffect(() => {
    if (!listCode) return;
    let alive = true;
    setLoading(true);
    api(`/lists/${encodeURIComponent(listCode)}`)
      .then(data => {
        if (!alive) return;
        setList(data.list);
        setItems(data.items || []);
        setError("");
      })
      .catch(() => {
        if (!alive) return;
        localStorage.removeItem("lista-familia-code");
        setListCode("");
        setList(null);
        setItems([]);
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [listCode]);

  useEffect(() => {
    if (!listCode || !list) return;
    const socket = io({ transports: ["websocket", "polling"] });
    socket.on("connect", () => { setConnected(true); socket.emit("join-list", listCode); });
    socket.on("disconnect", () => setConnected(false));
    socket.on("list-updated", payload => {
      if (payload?.listCode === listCode && Array.isArray(payload.items)) setItems(payload.items);
    });
    return () => { socket.disconnect(); setConnected(false); };
  }, [listCode, !!list]);

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  async function createList(e) {
    e?.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await api("/lists", { method: "POST", body: JSON.stringify({ name: listName.trim() || "Compras da família" }) });
      localStorage.setItem("lista-familia-code", data.list.shareCode);
      setListCode(data.list.shareCode);
      setList(data.list);
      setItems([]);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function joinList(e) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setLoading(true); setError("");
    try {
      const data = await api(`/lists/${encodeURIComponent(code)}`);
      localStorage.setItem("lista-familia-code", code);
      setListCode(code); setList(data.list); setItems(data.items || []);
    } catch { setError("Não encontrámos essa lista. Confirma o código e tenta novamente."); }
    finally { setLoading(false); }
  }

  async function addItem(e) {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName || !listCode) return;
    const qty = Math.max(1, Math.min(999, Number.parseInt(quantity, 10) || 1));
    try {
      const data = await api(`/lists/${encodeURIComponent(listCode)}/items`, {
        method: "POST",
        body: JSON.stringify({ name: cleanName, quantity: qty, category: category === "auto" ? guessCategory(cleanName) : category })
      });
      setItems(data.items);
      setName(""); setQuantity("1"); setCategory("auto");
    } catch (err) { setError(err.message); }
  }

  async function updateItem(item, changes) {
    try {
      const data = await api(`/lists/${encodeURIComponent(listCode)}/items/${item._id}`, {
        method: "PATCH", body: JSON.stringify(changes)
      });
      setItems(data.items);
    } catch (err) { setError(err.message); }
  }

  async function deleteItem(item) {
    try {
      const data = await api(`/lists/${encodeURIComponent(listCode)}/items/${item._id}`, { method: "DELETE" });
      setItems(data.items);
    } catch (err) { setError(err.message); }
  }

  async function clearDone() {
    if (!window.confirm("Queres remover todos os artigos já comprados?")) return;
    try {
      const data = await api(`/lists/${encodeURIComponent(listCode)}/completed`, { method: "DELETE" });
      setItems(data.items);
      notify("Compras concluídas removidas");
    } catch (err) { setError(err.message); }
  }

  async function copyShareLink() {
    const url = `${window.location.origin}/?list=${encodeURIComponent(listCode)}`;
    try {
      await navigator.clipboard.writeText(url);
      notify("Link copiado! Envia à tua família.");
    } catch {
      window.prompt("Copia este link e partilha com a família:", url);
    }
  }

  useEffect(() => {
    const codeFromUrl = new URLSearchParams(window.location.search).get("list");
    if (codeFromUrl && !listCode) {
      setJoinCode(codeFromUrl.toUpperCase());
      setListCode(codeFromUrl.toUpperCase());
      localStorage.setItem("lista-familia-code", codeFromUrl.toUpperCase());
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  if (loading && !list) return <main className="loading-screen"><LoaderCircle className="spin" size={30}/><span>A preparar a tua lista…</span></main>;

  if (!listCode || !list) return (
    <main className="welcome-page">
      <div className="welcome-glow glow-one" /><div className="welcome-glow glow-two" />
      <header className="brand"><span className="brand-mark"><ShoppingBasket size={23}/></span><span>lista<span className="brand-light">família</span></span></header>
      <section className="welcome-content">
        <div className="eyebrow"><Leaf size={15}/> MAIS SIMPLES, JUNTOS</div>
        <h1>As compras da família.<br/><span>Sem esquecimentos.</span></h1>
        <p className="welcome-copy">Uma lista partilhada, sempre atualizada. Adiciona o que falta em casa e deixa o resto connosco.</p>
        <div className="welcome-card">
          <div className="card-heading"><span className="card-icon"><Plus size={19}/></span><div><h2>Criar uma lista nova</h2><p>Começa uma lista e convida a família.</p></div></div>
          <form onSubmit={createList} className="create-form">
            <label htmlFor="list-name">Nome da lista</label>
            <input id="list-name" value={listName} onChange={e => setListName(e.target.value)} maxLength={60} placeholder="Ex.: Compras da família"/>
            <button className="primary-button" disabled={loading} type="submit">{loading ? "A criar…" : "Criar lista"} <ArrowRight size={18}/></button>
          </form>
          <div className="form-divider"><span>ou</span></div>
          <form onSubmit={joinList} className="join-form">
            <label htmlFor="join-code">Já tens um código de partilha?</label>
            <div className="join-row"><input id="join-code" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Ex.: A3K9PX" maxLength={12}/><button aria-label="Entrar na lista" type="submit" className="join-button"><ArrowRight size={20}/></button></div>
          </form>
          {error && <p className="error-message">{error}</p>}
        </div>
        <div className="welcome-foot"><Users size={17}/><span>Feita para partilhar. Simples para todos.</span></div>
      </section>
      <footer className="welcome-footer">A tua casa, mais organizada.</footer>
    </main>
  );

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><ShoppingBasket size={21}/></span><span>lista<span className="brand-light">família</span></span></div>
        <button className="share-button" onClick={() => setShowShare(true)}><Users size={17}/><span>Partilhar</span></button>
      </header>
      <section className="list-header">
        <div className="list-title-line"><div><div className="eyebrow">A LISTA DA CASA</div><h1>{list.name}</h1></div><span className={`sync-status ${connected ? "online" : ""}`} title={connected ? "Sincronização ativa" : "A ligar"}>{connected ? <Wifi size={15}/> : <WifiOff size={15}/>}<span>{connected ? "Sincronizada" : "A ligar…"}</span></span></div>
        <div className="progress-line"><div className="progress-track"><span style={{ width: `${items.length ? (doneItems.length / items.length) * 100 : 0}%` }}/></div><span>{doneItems.length} de {items.length} comprados</span></div>
      </section>
      <section className="add-panel">
        <form onSubmit={addItem}>
          <div className="add-main"><span className="input-plus"><Plus size={22}/></span><input value={name} onChange={e => setName(e.target.value)} placeholder="O que está a faltar em casa?" aria-label="Nome do artigo" maxLength={100}/><button type="submit" aria-label="Adicionar artigo" disabled={!name.trim()}><Plus size={22}/></button></div>
          <div className="add-options"><div className="quantity-control"><label htmlFor="quantity">Qtd.</label><input id="quantity" type="number" min="1" max="999" value={quantity} onChange={e => setQuantity(e.target.value)}/></div><span className="option-separator"/><label className="category-select-label" htmlFor="category-select">Categoria</label><select id="category-select" value={category} onChange={e => setCategory(e.target.value)}><option value="auto">Automática</option>{CATEGORIES.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}</select></div>
        </form>
      </section>
      <nav className="category-tabs" aria-label="Filtrar por categoria">
        {CATEGORIES.map(c => <button key={c.id} className={filter === c.id ? "category-tab active" : "category-tab"} onClick={() => setFilter(c.id)}><span>{c.emoji}</span>{c.label}{c.id === "all" && <span className="tab-count">{activeItems.length}</span>}</button>)}
      </nav>
      <section className="items-section">
        <div className="section-heading"><div><h2>{showDone ? "Já comprados" : "Falta comprar"}</h2><span>{visibleItems.length} {visibleItems.length === 1 ? "artigo" : "artigos"}</span></div><button className="view-toggle" onClick={() => setShowDone(!showDone)}>{showDone ? "Ver por comprar" : `Ver comprados (${doneItems.length})`} <ChevronDown size={15} className={showDone ? "rotate" : ""}/></button></div>
        {visibleItems.length === 0 ? <div className="empty-state"><span className="empty-illustration">{showDone ? "✨" : "🧺"}</span><h3>{showDone ? "Ainda não há compras concluídas" : filter === "all" ? "A lista está vazia" : "Nada nesta categoria"}</h3><p>{showDone ? "Quando marcares um artigo como comprado, aparece aqui." : "Adiciona o primeiro artigo no campo acima."}</p></div> : (
          <div className="items-list">{visibleItems.map(item => {
            const cat = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[5];
            return <article className={`shopping-item ${item.done ? "is-done" : ""}`} key={item._id}>
              <button className={`check-button ${item.done ? "checked" : ""}`} onClick={() => updateItem(item, { done: !item.done })} aria-label={item.done ? "Marcar como por comprar" : "Marcar como comprado"}>{item.done && <Check size={17}/>}</button>
              <div className="item-copy"><span className="item-name">{item.name}</span><span className="item-meta"><span>{cat.emoji} {cat.label}</span><span className="meta-dot">·</span><span>Qtd. {item.quantity}</span></span></div>
              <button className="delete-button" onClick={() => deleteItem(item)} aria-label={`Remover ${item.name}`}><Trash2 size={17}/></button>
            </article>;
          })}</div>
        )}
        {doneItems.length > 0 && !showDone && <button className="clear-done" onClick={clearDone}><CheckCheck size={16}/> Limpar artigos comprados</button>}
      </section>
      <footer className="app-footer"><span><Leaf size={15}/> Menos esquecimentos, mais tempo juntos.</span><button onClick={() => { if (window.confirm("Sair desta lista neste dispositivo? A lista partilhada não será apagada.")) { localStorage.removeItem("lista-familia-code"); setListCode(""); setList(null); setItems([]); } }}>Sair da lista</button></footer>
      {showShare && <div className="modal-backdrop" onClick={() => setShowShare(false)}><section className="share-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="share-title"><button className="modal-close" onClick={() => setShowShare(false)} aria-label="Fechar"><X size={20}/></button><div className="share-graphic"><Users size={28}/></div><h2 id="share-title">A lista é melhor em família</h2><p>Partilha o link ou o código com quem faz as compras contigo. Todos veem as alterações em tempo real.</p><div className="share-code-box"><span>CÓDIGO DA LISTA</span><strong>{list.shareCode}</strong></div><button className="primary-button" onClick={copyShareLink}><Copy size={17}/> Copiar link de convite</button><button className="secondary-button" onClick={() => { navigator.clipboard?.writeText(list.shareCode); notify("Código copiado!"); }}><Clipboard size={17}/> Copiar apenas o código</button><p className="share-note"><CircleHelp size={14}/> Qualquer pessoa com o link ou código pode aceder à lista. Partilha apenas com pessoas de confiança.</p></section></div>}
      {toast && <div className="toast"><Check size={16}/>{toast}</div>}
      {error && <button className="error-toast" onClick={() => setError("")}>{error}<X size={15}/></button>}
    </main>
  );
}