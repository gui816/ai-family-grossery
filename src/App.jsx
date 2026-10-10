import { useEffect, useMemo, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "./lib/supabase.js";
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


const LANGUAGE_OPTIONS = [
  ["pt-PT", "Português (Portugal)"], ["en", "English"], ["es", "Español"],
  ["fr", "Français"], ["de", "Deutsch"], ["it", "Italiano"], ["nl", "Nederlands"],
  ["pl", "Polski"], ["ro", "Română"], ["zh-CN", "简体中文"]
];
const I18N = {
en: {
"Todos":"All","Tudo":"All","Fruta e legumes":"Fruit & vegetables","Frescos":"Fresh","Despensa":"Pantry","Limpeza":"Cleaning","Outros":"Other",
"Falta configurar o Supabase":"Supabase setup required","A preparar a tua lista…":"Preparing your list…","MAIS SIMPLES, JUNTOS":"SIMPLER, TOGETHER","As compras da família.":"Family shopping.","Sem esquecimentos.":"Never forget a thing.","Uma lista partilhada, sempre atualizada. Adiciona o que falta em casa e deixa o resto connosco.":"One shared list, always up to date. Add what you need at home and leave the rest to us.","Criar uma lista nova":"Create a new list","Começa uma lista e convida a família.":"Start a list and invite your family.","Nome da lista":"List name","Compras da família":"Family shopping","Criar lista":"Create list","A criar…":"Creating…","ou":"or","Já tens um código de partilha?":"Already have a sharing code?","Entrar na lista":"Join list","Feita para partilhar. Simples para todos.":"Made to share. Simple for everyone.","A tua casa, mais organizada.":"A more organised home.","Partilhar":"Share","A LISTA DA CASA":"THE HOUSEHOLD LIST","Sincronização ativa":"Sync active","A ligar":"Connecting","Sincronizada":"Synced","A ligar…":"Connecting…","O que está a faltar em casa?":"What are we running out of?","Nome do artigo":"Item name","Adicionar artigo":"Add item","Qtd.":"Qty.","Categoria":"Category","Automática":"Automatic","Filtrar por categoria":"Filter by category","Já comprados":"Purchased","Falta comprar":"To buy","artigo":"item","artigos":"items","Ver por comprar":"View items to buy","A lista está vazia":"Your list is empty","Nada nesta categoria":"Nothing in this category","Ainda não há compras concluídas":"No items purchased yet","Quando marcares um artigo como comprado, aparece aqui.":"Items marked as purchased will appear here.","Adiciona o primeiro artigo no campo acima.":"Add your first item above.","Marcar como por comprar":"Mark as not purchased","Marcar como comprado":"Mark as purchased","Limpar artigos comprados":"Clear purchased items","Menos esquecimentos, mais tempo juntos.":"Fewer forgotten items, more time together.","Sair da lista":"Leave list","Sair desta lista neste dispositivo? A lista partilhada não será apagada.":"Leave this list on this device? The shared list will not be deleted.","Fechar":"Close","A lista é melhor em família":"Shopping is better together","Partilha o link ou o código com quem faz as compras contigo. Todos veem as alterações em tempo real.":"Share the link or code with whoever shops with you. Everyone sees changes in real time.","CÓDIGO DA LISTA":"LIST CODE","Copiar link de convite":"Copy invite link","Copiar apenas o código":"Copy code only","Qualquer pessoa com o link ou código pode aceder à lista. Partilha apenas com pessoas de confiança.":"Anyone with the link or code can access this list. Only share it with people you trust.","Link de convite copiado!":"Invite link copied!","Código copiado. O link público ainda não está configurado.":"Code copied. The public link is not configured yet.","Código da lista copiado!":"List code copied!","Copia este link e partilha com a família:":"Copy this link and share it with your family:","Copia este código e partilha com a família:":"Copy this code and share it with your family:","Queres remover todos os artigos já comprados?":"Remove all purchased items?","Compras concluídas removidas":"Purchased items removed","Lista não encontrada.":"List not found.","Não encontrámos essa lista. Confirma o código e tenta novamente.":"We couldn't find that list. Check the code and try again."
},
es: {"Tudo":"Todo","Fruta e legumes":"Fruta y verdura","Frescos":"Frescos","Despensa":"Despensa","Limpeza":"Limpieza","Outros":"Otros","A preparar a tua lista…":"Preparando tu lista…","MAIS SIMPLES, JUNTOS":"MÁS SENCILLO, JUNTOS","As compras da família.":"La compra familiar.","Sem esquecimentos.":"Sin olvidos.","Uma lista partilhada, sempre atualizada. Adiciona o que falta em casa e deixa o resto connosco.":"Una lista compartida y siempre actualizada. Añade lo que falta en casa.","Criar uma lista nova":"Crear una lista nueva","Começa uma lista e convida a família.":"Empieza una lista e invita a tu familia.","Nome da lista":"Nombre de la lista","Compras da família":"Compra familiar","Criar lista":"Crear lista","A criar…":"Creando…","ou":"o","Já tens um código de partilha?":"¿Ya tienes un código para compartir?","Entrar na lista":"Entrar en la lista","Partilhar":"Compartir","A LISTA DA CASA":"LA LISTA DE CASA","Sincronizada":"Sincronizada","A ligar…":"Conectando…","O que está a faltar em casa?":"¿Qué falta en casa?","Adicionar artigo":"Añadir producto","Qtd.":"Cant.","Categoria":"Categoría","Automática":"Automática","Já comprados":"Comprados","Falta comprar":"Por comprar","artigo":"producto","artigos":"productos","Ver por comprar":"Ver pendientes","A lista está vazia":"La lista está vacía","Nada nesta categoria":"Nada en esta categoría","Ainda não há compras concluídas":"Aún no hay compras completadas","Limpar artigos comprados":"Eliminar productos comprados","Sair da lista":"Salir de la lista","Fechar":"Cerrar","A lista é melhor em família":"La compra es mejor en familia","CÓDIGO DA LISTA":"CÓDIGO DE LA LISTA","Copiar link de convite":"Copiar enlace de invitación","Copiar apenas o código":"Copiar solo el código"},
fr: {"Tudo":"Tout","Fruta e legumes":"Fruits et légumes","Frescos":"Produits frais","Despensa":"Épicerie","Limpeza":"Nettoyage","Outros":"Autres","A preparar a tua lista…":"Préparation de votre liste…","MAIS SIMPLES, JUNTOS":"PLUS SIMPLE, ENSEMBLE","As compras da família.":"Les courses de la famille.","Sem esquecimentos.":"Sans rien oublier.","Criar uma lista nova":"Créer une nouvelle liste","Começa uma lista e convida a família.":"Créez une liste et invitez votre famille.","Nome da lista":"Nom de la liste","Criar lista":"Créer la liste","A criar…":"Création…","ou":"ou","Já tens um código de partilha?":"Vous avez déjà un code de partage ?","Entrar na lista":"Rejoindre la liste","Partilhar":"Partager","A LISTA DA CASA":"LA LISTE DE LA MAISON","Sincronizada":"Synchronisée","A ligar…":"Connexion…","O que está a faltar em casa?":"Que manque-t-il à la maison ?","Adicionar artigo":"Ajouter un article","Qtd.":"Qté","Categoria":"Catégorie","Automática":"Automatique","Já comprados":"Déjà achetés","Falta comprar":"À acheter","A lista está vazia":"Votre liste est vide","Limpar artigos comprados":"Effacer les articles achetés","Sair da lista":"Quitter la liste","Fechar":"Fermer","A lista é melhor em família":"Les courses, c’est mieux en famille","CÓDIGO DA LISTA":"CODE DE LA LISTE","Copiar link de convite":"Copier le lien d’invitation","Copiar apenas o código":"Copier uniquement le code"},
de: {"Tudo":"Alle","Fruta e legumes":"Obst & Gemüse","Frescos":"Frischeprodukte","Despensa":"Vorrat","Limpeza":"Reinigung","Outros":"Sonstiges","A preparar a tua lista…":"Deine Liste wird vorbereitet…","MAIS SIMPLES, JUNTOS":"EINFACHER ZUSAMMEN","As compras da família.":"Familieneinkauf.","Sem esquecimentos.":"Nichts mehr vergessen.","Criar uma lista nova":"Neue Liste erstellen","Começa uma lista e convida a família.":"Erstelle eine Liste und lade deine Familie ein.","Nome da lista":"Listenname","Criar lista":"Liste erstellen","A criar…":"Wird erstellt…","ou":"oder","Já tens um código de partilha?":"Hast du schon einen Einladungscode?","Entrar na lista":"Liste öffnen","Partilhar":"Teilen","A LISTA DA CASA":"DIE HAUSHALTSLISTE","Sincronizada":"Synchronisiert","A ligar…":"Verbindung…","O que está a faltar em casa?":"Was fehlt zu Hause?","Adicionar artigo":"Artikel hinzufügen","Qtd.":"Menge","Categoria":"Kategorie","Automática":"Automatisch","Já comprados":"Bereits gekauft","Falta comprar":"Noch zu kaufen","A lista está vazia":"Deine Liste ist leer","Limpar artigos comprados":"Gekaufte Artikel löschen","Sair da lista":"Liste verlassen","Fechar":"Schließen","A lista é melhor em família":"Einkaufen ist gemeinsam besser","CÓDIGO DA LISTA":"LISTENCODE","Copiar link de convite":"Einladungslink kopieren","Copiar apenas o código":"Nur Code kopieren"},
it: {"Tudo":"Tutto","Fruta e legumes":"Frutta e verdura","Frescos":"Freschi","Despensa":"Dispensa","Limpeza":"Pulizia","Outros":"Altro","A preparar a tua lista…":"Preparazione della lista…","MAIS SIMPLES, JUNTOS":"PIÙ SEMPLICE, INSIEME","As compras da família.":"La spesa di famiglia.","Sem esquecimentos.":"Senza dimenticanze.","Criar uma lista nova":"Crea una nuova lista","Começa uma lista e convida a família.":"Crea una lista e invita la famiglia.","Nome da lista":"Nome della lista","Criar lista":"Crea lista","A criar…":"Creazione…","ou":"oppure","Já tens um código de partilha?":"Hai già un codice di condivisione?","Entrar na lista":"Entra nella lista","Partilhar":"Condividi","A LISTA DA CASA":"LA LISTA DI CASA","Sincronizada":"Sincronizzata","A ligar…":"Connessione…","O que está a faltar em casa?":"Cosa manca a casa?","Adicionar artigo":"Aggiungi articolo","Qtd.":"Qtà","Categoria":"Categoria","Automática":"Automatica","Já comprados":"Già acquistati","Falta comprar":"Da comprare","A lista está vazia":"La lista è vuota","Limpar artigos comprados":"Cancella articoli acquistati","Sair da lista":"Esci dalla lista","Fechar":"Chiudi","A lista é melhor em família":"La spesa è meglio in famiglia","CÓDIGO DA LISTA":"CODICE DELLA LISTA","Copiar link de convite":"Copia link d'invito","Copiar apenas o código":"Copia solo il codice"},
nl: {"Tudo":"Alles","Fruta e legumes":"Groente en fruit","Frescos":"Vers","Despensa":"Voorraadkast","Limpeza":"Schoonmaak","Outros":"Overig","A preparar a tua lista…":"Je lijst wordt klaargemaakt…","MAIS SIMPLES, JUNTOS":"EENVOUDIGER, SAMEN","As compras da família.":"Boodschappen voor het gezin.","Sem esquecimentos.":"Niets meer vergeten.","Criar uma lista nova":"Nieuwe lijst maken","Começa uma lista e convida a família.":"Maak een lijst en nodig je gezin uit.","Nome da lista":"Naam van de lijst","Criar lista":"Lijst maken","A criar…":"Bezig met maken…","ou":"of","Já tens um código de partilha?":"Heb je al een deelcode?","Entrar na lista":"Naar lijst","Partilhar":"Delen","A LISTA DA CASA":"DE HUISLIJST","Sincronizada":"Gesynchroniseerd","A ligar…":"Verbinden…","O que está a faltar em casa?":"Wat ontbreekt er thuis?","Adicionar artigo":"Artikel toevoegen","Qtd.":"Aantal","Categoria":"Categorie","Automática":"Automatisch","Já comprados":"Al gekocht","Falta comprar":"Nog kopen","A lista está vazia":"Je lijst is leeg","Limpar artigos comprados":"Gekochte artikelen wissen","Sair da lista":"Lijst verlaten","Fechar":"Sluiten","A lista é melhor em família":"Samen boodschappen doen is beter","CÓDIGO DA LISTA":"LIJSTCODE","Copiar link de convite":"Uitnodigingslink kopiëren","Copiar apenas o código":"Alleen code kopiëren"},
pl: {"Tudo":"Wszystko","Fruta e legumes":"Owoce i warzywa","Frescos":"Świeże","Despensa":"Spiżarnia","Limpeza":"Środki czystości","Outros":"Inne","A preparar a tua lista…":"Przygotowywanie listy…","MAIS SIMPLES, JUNTOS":"PROŚCIEJ RAZEM","As compras da família.":"Zakupy rodzinne.","Sem esquecimentos.":"Nic już nie umknie.","Criar uma lista nova":"Utwórz nową listę","Começa uma lista e convida a família.":"Utwórz listę i zaproś rodzinę.","Nome da lista":"Nazwa listy","Criar lista":"Utwórz listę","A criar…":"Tworzenie…","ou":"lub","Já tens um código de partilha?":"Masz już kod udostępniania?","Entrar na lista":"Dołącz do listy","Partilhar":"Udostępnij","A LISTA DA CASA":"LISTA DOMOWA","Sincronizada":"Zsynchronizowano","A ligar…":"Łączenie…","O que está a faltar em casa?":"Czego brakuje w domu?","Adicionar artigo":"Dodaj produkt","Qtd.":"Ilość","Categoria":"Kategoria","Automática":"Automatyczna","Já comprados":"Kupione","Falta comprar":"Do kupienia","A lista está vazia":"Lista jest pusta","Limpar artigos comprados":"Usuń kupione produkty","Sair da lista":"Opuść listę","Fechar":"Zamknij","A lista é melhor em família":"Zakupy lepsze razem","CÓDIGO DA LISTA":"KOD LISTY","Copiar link de convite":"Kopiuj link zaproszenia","Copiar apenas o código":"Kopiuj tylko kod"},
ro: {"Tudo":"Toate","Fruta e legumes":"Fructe și legume","Frescos":"Proaspete","Despensa":"Cămară","Limpeza":"Curățenie","Outros":"Altele","A preparar a tua lista…":"Se pregătește lista…","MAIS SIMPLES, JUNTOS":"MAI SIMPLU, ÎMPREUNĂ","As compras da família.":"Cumpărăturile familiei.","Sem esquecimentos.":"Fără să uiți nimic.","Criar uma lista nova":"Creează o listă nouă","Começa uma lista e convida a família.":"Începe o listă și invită familia.","Nome da lista":"Numele listei","Criar lista":"Creează lista","A criar…":"Se creează…","ou":"sau","Já tens um código de partilha?":"Ai deja un cod de partajare?","Entrar na lista":"Intră în listă","Partilhar":"Partajează","A LISTA DA CASA":"LISTA CASEI","Sincronizada":"Sincronizat","A ligar…":"Se conectează…","O que está a faltar em casa?":"Ce lipsește din casă?","Adicionar artigo":"Adaugă produs","Qtd.":"Cant.","Categoria":"Categorie","Automática":"Automată","Já comprados":"Cumpărate","Falta comprar":"De cumpărat","A lista está vazia":"Lista este goală","Limpar artigos comprados":"Șterge produsele cumpărate","Sair da lista":"Părăsește lista","Fechar":"Închide","A lista é melhor em família":"Cumpărăturile sunt mai ușoare în familie","CÓDIGO DA LISTA":"CODUL LISTEI","Copiar link de convite":"Copiază linkul de invitație","Copiar apenas o código":"Copiază doar codul"},
"zh-CN": {"Tudo":"全部","Fruta e legumes":"水果和蔬菜","Frescos":"生鲜","Despensa":"食品储藏","Limpeza":"清洁用品","Outros":"其他","A preparar a tua lista…":"正在准备清单…","MAIS SIMPLES, JUNTOS":"一起，更简单","As compras da família.":"家庭购物清单","Sem esquecimentos.":"不再遗漏","Criar uma lista nova":"创建新清单","Começa uma lista e convida a família.":"创建清单并邀请家人","Nome da lista":"清单名称","Criar lista":"创建清单","A criar…":"正在创建…","ou":"或","Já tens um código de partilha?":"已有共享码？","Entrar na lista":"加入清单","Partilhar":"分享","A LISTA DA CASA":"家庭清单","Sincronizada":"已同步","A ligar…":"正在连接…","O que está a faltar em casa?":"家里还缺什么？","Adicionar artigo":"添加商品","Qtd.":"数量","Categoria":"类别","Automática":"自动","Já comprados":"已购买","Falta comprar":"待购买","A lista está vazia":"清单为空","Limpar artigos comprados":"清除已购买商品","Sair da lista":"退出清单","Fechar":"关闭","A lista é melhor em família":"一起购物更轻松","CÓDIGO DA LISTA":"清单代码","Copiar link de convite":"复制邀请链接","Copiar apenas o código":"只复制代码"}
};
function tx(text, lang) {
  if (!lang || lang === "pt-PT") return text;
  return (I18N[lang] && I18N[lang][text]) || I18N.en[text] || text;
}
function LanguagePicker({ language, onChange }) {
  return <label className="language-picker" aria-label="Idioma">
    <span aria-hidden="true">🌐</span>
    <select value={language} onChange={e => onChange(e.target.value)} aria-label="Idioma">
      {LANGUAGE_OPTIONS.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
    </select>
  </label>;
}

export default function App() {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("lista-familia-language");
    if (saved && LANGUAGE_OPTIONS.some(([code]) => code === saved)) return saved;
    const browserLanguage = (navigator.language || "pt-PT").toLowerCase();
    if (browserLanguage.startsWith("zh")) return "zh-CN";
    return LANGUAGE_OPTIONS.find(([code]) => browserLanguage.startsWith(code.toLowerCase().split("-")[0]))?.[0] || "pt-PT";
  });
  const t = text => tx(text, language);
  useEffect(() => { localStorage.setItem("lista-familia-language", language); }, [language]);

  const [listCode, setListCode] = useState(() => new URLSearchParams(window.location.search).get("list")?.toUpperCase() || localStorage.getItem("lista-familia-code") || "");
  const channelRef = useRef(null);
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
  const [listName, setListName] = useState(t("Compras da família"));
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
    if (!listCode || !isSupabaseConfigured) return;
    let alive = true;
    setLoading(true);
    supabase.rpc("get_family_list", { p_share_code: listCode })
      .then(({ data, error: rpcError }) => {
        if (!alive) return;
        if (rpcError || !data?.list) throw rpcError || new Error(t("Lista não encontrada."));
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
        setError(t("Não encontrámos essa lista. Confirma o código e tenta novamente."));
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [listCode]);

  useEffect(() => {
    if (!listCode || !list || !isSupabaseConfigured) return;
    let alive = true;
    const channel = supabase.channel(`list:${listCode}`, {
      config: { broadcast: { self: false } }
    });
    channel
      .on("broadcast", { event: "changed" }, async () => {
        const { data, error: rpcError } = await supabase.rpc("get_family_list", { p_share_code: listCode });
        if (alive && !rpcError && data?.list) {
          setList(data.list);
          setItems(data.items || []);
        }
      })
      .subscribe(status => setConnected(alive && status === "SUBSCRIBED"));
    channelRef.current = channel;
    return () => {
      alive = false;
      channelRef.current = null;
      setConnected(false);
      supabase.removeChannel(channel);
    };
  }, [listCode, !!list]);

  function broadcastChange() {
    channelRef.current?.send({ type: "broadcast", event: "changed", payload: {} });
  }

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  async function createList(e) {
    e?.preventDefault();
    setLoading(true); setError("");
    try {
      const { data, error: rpcError } = await supabase.rpc("create_family_list", { p_name: listName.trim() || t("Compras da família") });
      if (rpcError) throw rpcError;
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
      const { data, error: rpcError } = await supabase.rpc("get_family_list", { p_share_code: code });
      if (rpcError || !data?.list) throw rpcError || new Error("Lista não encontrada.");
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
      const { data, error: rpcError } = await supabase.rpc("add_family_item", {
        p_share_code: listCode, p_name: cleanName, p_quantity: qty,
        p_category: category === "auto" ? guessCategory(cleanName) : category
      });
      if (rpcError) throw rpcError;
      broadcastChange();
      setItems(data.items);
      setName(""); setQuantity("1"); setCategory("auto");
    } catch (err) { setError(err.message); }
  }

  async function updateItem(item, changes) {
    try {
      const { data, error: rpcError } = await supabase.rpc("update_family_item", {
        p_share_code: listCode, p_item_id: item._id,
        p_done: changes.done ?? null, p_name: changes.name ?? null,
        p_quantity: changes.quantity ?? null, p_category: changes.category ?? null
      });
      if (rpcError) throw rpcError;
      broadcastChange();
      setItems(data.items);
    } catch (err) { setError(err.message); }
  }

  async function deleteItem(item) {
    try {
      const { data, error: rpcError } = await supabase.rpc("delete_family_item", { p_share_code: listCode, p_item_id: item._id });
      if (rpcError) throw rpcError;
      broadcastChange();
      setItems(data.items);
    } catch (err) { setError(err.message); }
  }

  async function clearDone() {
    if (!window.confirm(t("Queres remover todos os artigos já comprados?"))) return;
    try {
      const { data, error: rpcError } = await supabase.rpc("clear_completed_items", { p_share_code: listCode });
      if (rpcError) throw rpcError;
      broadcastChange();
      setItems(data.items);
      notify(t("Compras concluídas removidas"));
    } catch (err) { setError(err.message); }
  }

  async function copyShareLink() {
    // The Capacitor debug APK runs at https://localhost. Never share that
    // internal WebView URL because it cannot be opened on another device.
    const configuredBase = import.meta.env.VITE_PUBLIC_APP_URL?.trim();
    const hostname = window.location.hostname;
    const isLocalOrigin = hostname === "localhost" || hostname === "127.0.0.1";
    const isCapacitorOrigin = window.location.protocol === "capacitor:" ||
      (isLocalOrigin && window.location.protocol === "https:");
    const baseUrl = configuredBase || (!isLocalOrigin && !isCapacitorOrigin ? window.location.origin : "");
    const value = baseUrl
      ? baseUrl.replace(/\/$/, "") + "/?list=" + encodeURIComponent(listCode)
      : listCode;

    try {
      await navigator.clipboard.writeText(value);
      notify(baseUrl
        ? "Link de convite copiado!"
        : "Código copiado. O link público ainda não está configurado.");
    } catch {
      window.prompt(baseUrl
        ? "Copia este link e partilha com a família:"
        : "Copia este código e partilha com a família:", value);
    }
  }

  async function copyListCode() {
    try {
      await navigator.clipboard.writeText(listCode);
      notify(t("Código da lista copiado!"));
    } catch {
      window.prompt("Copia este código e partilha com a família:", listCode);
    }
  }

  useEffect(() => {
    const codeFromUrl = new URLSearchParams(window.location.search).get("list");
    if (codeFromUrl) {
      const code = codeFromUrl.toUpperCase();
      setJoinCode(code);
      setListCode(code);
      localStorage.setItem("lista-familia-code", code);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  if (!isSupabaseConfigured) return (
    <main className="loading-screen">
      <div style={{ maxWidth: 520, padding: 24, textAlign: "center" }}>
        <h1>Falta configurar o Supabase</h1>
        <p>Cria um projeto Supabase, executa o SQL de <code>supabase/migrations</code> e define <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> no ficheiro <code>.env.local</code>.</p>
      </div>
    </main>
  );

  if (loading && !list) return <main className="loading-screen"><LoaderCircle className="spin" size={30}/><span>A preparar a tua lista…</span></main>;

  if (!listCode || !list) return (
    <main className="welcome-page">
      <div className="welcome-glow glow-one" /><div className="welcome-glow glow-two" />
      <header className="welcome-top"><div className="brand"><span className="brand-mark"><ShoppingBasket size={23}/></span><span>lista<span className="brand-light">família</span></span></div><LanguagePicker language={language} onChange={setLanguage}/></header>
      <section className="welcome-content">
        <div className="eyebrow"><Leaf size={15}/> MAIS SIMPLES, JUNTOS</div>
        <h1>As compras da família.<br/><span>Sem esquecimentos.</span></h1>
        <p className="welcome-copy">Uma lista partilhada, sempre atualizada. Adiciona o que falta em casa e deixa o resto connosco.</p>
        <div className="welcome-card">
          <div className="card-heading"><span className="card-icon"><Plus size={19}/></span><div><h2>Criar uma lista nova</h2><p>Começa uma lista e convida a família.</p></div></div>
          <form onSubmit={createList} className="create-form">
            <label htmlFor="list-name">Nome da lista</label>
            <input id="list-name" value={listName} onChange={e => setListName(e.target.value)} maxLength={60} placeholder="Ex.: Compras da família"/>
            <button className="primary-button" disabled={loading} type="submit">{loading ? t("A criar…") : t("Criar lista")} <ArrowRight size={18}/></button>
          </form>
          <div className="form-divider"><span>ou</span></div>
          <form onSubmit={joinList} className="join-form">
            <label htmlFor="join-code">Já tens um código de partilha?</label>
            <div className="join-row"><input id="join-code" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Ex.: A3K9PX" maxLength={12}/><button aria-label=t("Entrar na lista") type="submit" className="join-button"><ArrowRight size={20}/></button></div>
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
        <div className="list-title-line"><div><div className="eyebrow">A LISTA DA CASA</div><h1>{list.name}</h1></div><span className={`sync-status ${connected ? "online" : ""}`} title={connected ? t("Sincronização ativa") : t("A ligar")}>{connected ? <Wifi size={15}/> : <WifiOff size={15}/>}<span>{connected ? t("Sincronizada") : t("A ligar…")}</span></span></div>
        <div className="progress-line"><div className="progress-track"><span style={{ width: `${items.length ? (doneItems.length / items.length) * 100 : 0}%` }}/></div><span>{doneItems.length} de {items.length} comprados</span></div>
      </section>
      <section className="add-panel">
        <form onSubmit={addItem}>
          <div className="add-main"><span className="input-plus"><Plus size={22}/></span><input value={name} onChange={e => setName(e.target.value)} placeholder=t("O que está a faltar em casa?") aria-label=t("Nome do artigo") maxLength={100}/><button type="submit" aria-label=t("Adicionar artigo") disabled={!name.trim()}><Plus size={22}/></button></div>
          <div className="add-options"><div className="quantity-control"><label htmlFor="quantity">Qtd.</label><input id="quantity" type="number" min="1" max="999" value={quantity} onChange={e => setQuantity(e.target.value)}/></div><span className="option-separator"/><label className="category-select-label" htmlFor="category-select">Categoria</label><select id="category-select" value={category} onChange={e => setCategory(e.target.value)}><option value="auto">Automática</option>{CATEGORIES.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.emoji} {t(c.label)}</option>)}</select></div>
        </form>
      </section>
      <nav className="category-tabs" aria-label=t("Filtrar por categoria")>
        {CATEGORIES.map(c => <button key={c.id} className={filter === c.id ? "category-tab active" : "category-tab"} onClick={() => setFilter(c.id)}><span>{c.emoji}</span>{t(c.label)}{c.id === "all" && <span className="tab-count">{activeItems.length}</span>}</button>)}
      </nav>
      <section className="items-section">
        <div className="section-heading"><div><h2>{showDone ? t("Já comprados") : t("Falta comprar")}</h2><span>{visibleItems.length} {visibleItems.length === 1 ? t("artigo") : t("artigos")}</span></div><button className="view-toggle" onClick={() => setShowDone(!showDone)}>{showDone ? t("Ver por comprar") : `Ver comprados (${doneItems.length})`} <ChevronDown size={15} className={showDone ? "rotate" : ""}/></button></div>
        {visibleItems.length === 0 ? <div className="empty-state"><span className="empty-illustration">{showDone ? "✨" : "🧺"}</span><h3>{showDone ? t("Ainda não há compras concluídas") : filter === "all" ? t("A lista está vazia") : t("Nada nesta categoria")}</h3><p>{showDone ? t("Quando marcares um artigo como comprado, aparece aqui.") : t("Adiciona o primeiro artigo no campo acima.")}</p></div> : (
          <div className="items-list">{visibleItems.map(item => {
            const cat = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[5];
            return <article className={`shopping-item ${item.done ? "is-done" : ""}`} key={item._id}>
              <button className={`check-button ${item.done ? "checked" : ""}`} onClick={() => updateItem(item, { done: !item.done })} aria-label={item.done ? t("Marcar como por comprar") : t("Marcar como comprado")}>{item.done && <Check size={17}/>}</button>
              <div className="item-copy"><span className="item-name">{item.name}</span><span className="item-meta"><span>{cat.emoji} {t(cat.label)}</span><span className="meta-dot">·</span><span>Qtd. {item.quantity}</span></span></div>
              <button className="delete-button" onClick={() => deleteItem(item)} aria-label={`Remover ${item.name}`}><Trash2 size={17}/></button>
            </article>;
          })}</div>
        )}
        {doneItems.length > 0 && !showDone && <button className="clear-done" onClick={clearDone}><CheckCheck size={16}/> Limpar artigos comprados</button>}
      </section>
      <footer className="app-footer"><span><Leaf size={15}/> Menos esquecimentos, mais tempo juntos.</span><button onClick={() => { if (window.confirm(t("Sair desta lista neste dispositivo? A lista partilhada não será apagada."))) { localStorage.removeItem("lista-familia-code"); setListCode(""); setList(null); setItems([]); } }}>Sair da lista</button></footer>
      {showShare && <div className="modal-backdrop" onClick={() => setShowShare(false)}><section className="share-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="share-title"><button className="modal-close" onClick={() => setShowShare(false)} aria-label=t("Fechar")><X size={20}/></button><div className="share-graphic"><Users size={28}/></div><h2 id="share-title">A lista é melhor em família</h2><p>Partilha o link ou o código com quem faz as compras contigo. Todos veem as alterações em tempo real.</p><div className="share-code-box"><span>CÓDIGO DA LISTA</span><strong>{list.shareCode}</strong></div><button className="primary-button" onClick={copyShareLink}><Copy size={17}/> Copiar link de convite</button><button className="secondary-button" onClick={copyListCode}><Clipboard size={17}/> Copiar apenas o código</button><p className="share-note"><CircleHelp size={14}/> Qualquer pessoa com o link ou código pode aceder à lista. Partilha apenas com pessoas de confiança.</p></section></div>}
      {toast && <div className="toast"><Check size={16}/>{toast}</div>}
      {error && <button className="error-toast" onClick={() => setError("")}>{error}<X size={15}/></button>}
    </main>
  );
}