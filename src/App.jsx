import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase, isSupabaseConfigured } from "./lib/supabase.js";
import {
  ArrowRight, Check, CheckCheck, ChevronDown, CircleHelp, Clipboard, Copy, Share2, Repeat2,
  Camera, Mic, Leaf, LoaderCircle, Plus, ShoppingBasket, Trash2, Users, Wifi, WifiOff, X, FileText, Receipt, Upload, ExternalLink
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
"Falta configurar o Supabase":"Supabase setup required","A preparar a tua lista…":"Preparing your list…","MAIS SIMPLES, JUNTOS":"SIMPLER, TOGETHER","As compras da família.":"Family shopping.","Sem esquecimentos.":"Never forget a thing.","Uma lista partilhada, sempre atualizada. Adiciona o que falta em casa e deixa o resto connosco.":"One shared list, always up to date. Add what you need at home and leave the rest to us.","Criar uma lista nova":"Create a new list","Começa uma lista e convida a família.":"Start a list and invite your family.","Nome da lista":"List name","Compras da família":"Family shopping","Criar lista":"Create list","A criar…":"Creating…","ou":"or","Já tens um código de partilha?":"Already have a sharing code?","Entrar na lista":"Join list","Feita para partilhar. Simples para todos.":"Made to share. Simple for everyone.","A tua casa, mais organizada.":"A more organised home.","Partilhar":"Share","A LISTA DA CASA":"THE HOUSEHOLD LIST","Sincronização ativa":"Sync active","A ligar":"Connecting","Sincronizada":"Synced","A ligar…":"Connecting…","O que está a faltar em casa?":"What are we running out of?","Nome do artigo":"Item name","Adicionar artigo":"Add item","Qtd.":"Qty.","Categoria":"Category","Automática":"Automatic","Filtrar por categoria":"Filter by category","Já comprados":"Purchased","Falta comprar":"To buy","artigo":"item","artigos":"items","Ver por comprar":"View items to buy","A lista está vazia":"Your list is empty","Nada nesta categoria":"Nothing in this category","Ainda não há compras concluídas":"No items purchased yet","Quando marcares um artigo como comprado, aparece aqui.":"Items marked as purchased will appear here.","Adiciona o primeiro artigo no campo acima.":"Add your first item above.","Marcar como por comprar":"Mark as not purchased","Marcar como comprado":"Mark as purchased","Limpar artigos comprados":"Clear purchased items","Queres remover todos os produtos desta lista? Esta ação afeta todos os membros e não pode ser desfeita.":"Remove every product from this list? This affects all members and cannot be undone.","Todos os produtos foram removidos":"All products were removed","Remover todos os produtos":"Remove all products","Menos esquecimentos, mais tempo juntos.":"Fewer forgotten items, more time together.","Sair da lista":"Leave list","Sair desta lista neste dispositivo? A lista partilhada não será apagada.":"Leave this list on this device? The shared list will not be deleted.","Fechar":"Close","A lista é melhor em família":"Shopping is better together","Partilha o link ou o código com quem faz as compras contigo. Todos veem as alterações em tempo real.":"Share the link or code with whoever shops with you. Everyone sees changes in real time.","CÓDIGO DA LISTA":"LIST CODE","Código da lista":"List code","Lista Família":"Listora","Partilhar código":"Share code","Partilha o código com a família. Cada pessoa introduz o código na app para abrir a mesma lista e sincronizar as alterações.":"Share the code with your family. Each person enters it in the app to open the same list and sync changes.","Qualquer pessoa com o código pode aceder à lista. Partilha apenas com pessoas de confiança.":"Anyone with the code can access this list. Only share it with people you trust.","Copiar link de convite":"Copy invite link","Copiar apenas o código":"Copy code only","Qualquer pessoa com o link ou código pode aceder à lista. Partilha apenas com pessoas de confiança.":"Anyone with the link or code can access this list. Only share it with people you trust.","Link de convite copiado!":"Invite link copied!","Código copiado. O link público ainda não está configurado.":"Code copied. The public link is not configured yet.","Código da lista copiado!":"List code copied!","Copiar código":"Copy code","Repetir compras":"Buy again","Artigo adicionado novamente":"Item added again","Listas reutilizáveis":"Reusable lists","Guardar lista atual":"Save current list","Guarda uma compra habitual para a reutilizares noutra semana.":"Save a regular shopping list to reuse next week.","Nome para esta lista reutilizável:":"Name this reusable list:","Compra semanal":"Weekly shop","Lista guardada neste dispositivo":"List saved on this device","Lista reutilizada":"List restored","Modo supermercado":"Shopping mode","Ativo":"On","Ativar":"Start","A tua compra":"Shopping list","Partilhar código":"Share code","CÓDIGO DA LISTA":"LIST CODE","A LISTA DA CASA":"THE HOUSEHOLD LIST","Partilhar":"Share","de":"of","comprados":"purchased","Menos esquecimentos, mais tempo juntos.":"Fewer forgotten items, more time together.","Não foi possível abrir a partilha. Copia o código em alternativa.":"Sharing couldn't be opened. Copy the code instead.","Copia este link e partilha com a família:":"Copy this link and share it with your family:","Copia este código e partilha com a família:":"Copy this code and share it with your family:","Queres remover todos os artigos já comprados?":"Remove all purchased items?","Compras concluídas removidas":"Purchased items removed","Lista não encontrada.":"List not found.","Não encontrámos essa lista. Confirma o código e tenta novamente.":"We couldn't find that list. Check the code and try again.",
"Lista de compras":"Shopping list","Faturas":"Receipts","Faturas de compras":"Shopping receipts","Comprovativos acessíveis a todos os membros desta lista.":"Receipts accessible to all members of this list.","Adicionar fatura":"Add receipt","Supermercado":"Supermarket","Data da compra":"Purchase date","Total (€)":"Total (€)","Notas (opcional)":"Notes (optional)","Máx. 10 MB":"Max. 10 MB","Sugerir dados com IA":"Suggest details with AI","Faturas partilhadas":"Shared receipts","Ainda não há faturas":"No receipts yet","Adiciona o primeiro comprovativo para ficar disponível a toda a família.":"Add the first receipt to make it available to the whole family.","Confirmar produtos":"Review products","Cancelar":"Cancel","Digitaliza com a câmara para entrar na lista":"Scan with your camera to join the list","O que está a faltar em casa?":"What are we running out of?","Escolhe como queres adicionar os produtos":"Choose how you want to add products","Fotografar lista":"Photograph list","Importa produtos de uma fotografia":"Import products from a photo","Adicionar por voz":"Add by voice","Dita os produtos sem escrever":"Dictate products without typing","Listas guardadas":"Saved lists","O teu nome":"Your name","A analisar fatura…":"Analyzing receipt…","Sugestões extraídas — confirma os campos acima":"Extracted suggestions — review the fields above","IVA identificado:":"VAT identified:","Copiar link de convite":"Copy invite link"
},
es: {"Tudo":"Todo","Fruta e legumes":"Fruta y verdura","Frescos":"Frescos","Despensa":"Despensa","Limpeza":"Limpieza","Outros":"Otros","A preparar a tua lista…":"Preparando tu lista…","MAIS SIMPLES, JUNTOS":"MÁS SENCILLO, JUNTOS","As compras da família.":"La compra familiar.","Sem esquecimentos.":"Sin olvidos.","Uma lista partilhada, sempre atualizada. Adiciona o que falta em casa e deixa o resto connosco.":"Una lista compartida y siempre actualizada. Añade lo que falta en casa.","Criar uma lista nova":"Crear una lista nueva","Começa uma lista e convida a família.":"Empieza una lista e invita a tu familia.","Nome da lista":"Nombre de la lista","Compras da família":"Compra familiar","Criar lista":"Crear lista","A criar…":"Creando…","ou":"o","Já tens um código de partilha?":"¿Ya tienes un código para compartir?","Entrar na lista":"Entrar en la lista","Partilhar":"Compartir","A LISTA DA CASA":"LA LISTA DE CASA","Sincronizada":"Sincronizada","A ligar…":"Conectando…","O que está a faltar em casa?":"¿Qué falta en casa?","Adicionar artigo":"Añadir producto","Qtd.":"Cant.","Categoria":"Categoría","Automática":"Automática","Já comprados":"Comprados","Falta comprar":"Por comprar","artigo":"producto","artigos":"productos","Ver por comprar":"Ver pendientes","A lista está vazia":"La lista está vacía","Nada nesta categoria":"Nada en esta categoría","Ainda não há compras concluídas":"Aún no hay compras completadas","Limpar artigos comprados":"Eliminar productos comprados","Sair da lista":"Salir de la lista","Fechar":"Cerrar","A lista é melhor em família":"La compra es mejor en familia","CÓDIGO DA LISTA":"CÓDIGO DE LA LISTA","Copiar link de convite":"Copiar enlace de invitación","Copiar apenas o código":"Copiar solo el código"},
fr: {"Tudo":"Tout","Fruta e legumes":"Fruits et légumes","Frescos":"Produits frais","Despensa":"Épicerie","Limpeza":"Nettoyage","Outros":"Autres","A preparar a tua lista…":"Préparation de votre liste…","MAIS SIMPLES, JUNTOS":"PLUS SIMPLE, ENSEMBLE","As compras da família.":"Les courses de la famille.","Sem esquecimentos.":"Sans rien oublier.","Criar uma lista nova":"Créer une nouvelle liste","Começa uma lista e convida a família.":"Créez une liste et invitez votre famille.","Nome da lista":"Nom de la liste","Criar lista":"Créer la liste","A criar…":"Création…","ou":"ou","Já tens um código de partilha?":"Vous avez déjà un code de partage ?","Entrar na lista":"Rejoindre la liste","Partilhar":"Partager","A LISTA DA CASA":"LA LISTE DE LA MAISON","Sincronizada":"Synchronisée","A ligar…":"Connexion…","O que está a faltar em casa?":"Que manque-t-il à la maison ?","Adicionar artigo":"Ajouter un article","Qtd.":"Qté","Categoria":"Catégorie","Automática":"Automatique","Já comprados":"Déjà achetés","Falta comprar":"À acheter","A lista está vazia":"Votre liste est vide","Limpar artigos comprados":"Effacer les articles achetés","Sair da lista":"Quitter la liste","Fechar":"Fermer","A lista é melhor em família":"Les courses, c’est mieux en famille","CÓDIGO DA LISTA":"CODE DE LA LISTE","Copiar link de convite":"Copier le lien d’invitation","Copiar apenas o código":"Copier uniquement le code"},
de: {"Uma lista partilhada, sempre atualizada. Adiciona o que falta em casa e deixa o resto connosco.":"Eine gemeinsame, stets aktuelle Liste. Ergänze, was zu Hause fehlt, und den Rest übernehmen wir.","Feita para partilhar. Simples para todos.":"Zum Teilen gemacht. Einfach für alle.","A tua casa, mais organizada.":"Ein besser organisiertes Zuhause.","Compras da família":"Familieneinkauf","Tudo":"Alle","Fruta e legumes":"Obst & Gemüse","Frescos":"Frischeprodukte","Despensa":"Vorrat","Limpeza":"Reinigung","Outros":"Sonstiges","A preparar a tua lista…":"Deine Liste wird vorbereitet…","MAIS SIMPLES, JUNTOS":"EINFACHER ZUSAMMEN","As compras da família.":"Familieneinkauf.","Sem esquecimentos.":"Nichts mehr vergessen.","Criar uma lista nova":"Neue Liste erstellen","Começa uma lista e convida a família.":"Erstelle eine Liste und lade deine Familie ein.","Nome da lista":"Listenname","Criar lista":"Liste erstellen","A criar…":"Wird erstellt…","ou":"oder","Já tens um código de partilha?":"Hast du schon einen Einladungscode?","Entrar na lista":"Liste öffnen","Partilhar":"Teilen","A LISTA DA CASA":"DIE HAUSHALTSLISTE","Sincronizada":"Synchronisiert","A ligar…":"Verbindung…","O que está a faltar em casa?":"Was fehlt zu Hause?","Adicionar artigo":"Artikel hinzufügen","Qtd.":"Menge","Categoria":"Kategorie","Automática":"Automatisch","Já comprados":"Bereits gekauft","Falta comprar":"Noch zu kaufen","A lista está vazia":"Deine Liste ist leer","Limpar artigos comprados":"Gekaufte Artikel löschen","Sair da lista":"Liste verlassen","Fechar":"Schließen","A lista é melhor em família":"Einkaufen ist gemeinsam besser","CÓDIGO DA LISTA":"LISTENCODE","Copiar link de convite":"Einladungslink kopieren","Copiar apenas o código":"Nur Code kopieren"},
it: {"Tudo":"Tutto","Fruta e legumes":"Frutta e verdura","Frescos":"Freschi","Despensa":"Dispensa","Limpeza":"Pulizia","Outros":"Altro","A preparar a tua lista…":"Preparazione della lista…","MAIS SIMPLES, JUNTOS":"PIÙ SEMPLICE, INSIEME","As compras da família.":"La spesa di famiglia.","Sem esquecimentos.":"Senza dimenticanze.","Criar uma lista nova":"Crea una nuova lista","Começa uma lista e convida a família.":"Crea una lista e invita la famiglia.","Nome da lista":"Nome della lista","Criar lista":"Crea lista","A criar…":"Creazione…","ou":"oppure","Já tens um código de partilha?":"Hai già un codice di condivisione?","Entrar na lista":"Entra nella lista","Partilhar":"Condividi","A LISTA DA CASA":"LA LISTA DI CASA","Sincronizada":"Sincronizzata","A ligar…":"Connessione…","O que está a faltar em casa?":"Cosa manca a casa?","Adicionar artigo":"Aggiungi articolo","Qtd.":"Qtà","Categoria":"Categoria","Automática":"Automatica","Já comprados":"Già acquistati","Falta comprar":"Da comprare","A lista está vazia":"La lista è vuota","Limpar artigos comprados":"Cancella articoli acquistati","Sair da lista":"Esci dalla lista","Fechar":"Chiudi","A lista é melhor em família":"La spesa è meglio in famiglia","CÓDIGO DA LISTA":"CODICE DELLA LISTA","Copiar link de convite":"Copia link d'invito","Copiar apenas o código":"Copia solo il codice"},
nl: {"Tudo":"Alles","Fruta e legumes":"Groente en fruit","Frescos":"Vers","Despensa":"Voorraadkast","Limpeza":"Schoonmaak","Outros":"Overig","A preparar a tua lista…":"Je lijst wordt klaargemaakt…","MAIS SIMPLES, JUNTOS":"EENVOUDIGER, SAMEN","As compras da família.":"Boodschappen voor het gezin.","Sem esquecimentos.":"Niets meer vergeten.","Criar uma lista nova":"Nieuwe lijst maken","Começa uma lista e convida a família.":"Maak een lijst en nodig je gezin uit.","Nome da lista":"Naam van de lijst","Criar lista":"Lijst maken","A criar…":"Bezig met maken…","ou":"of","Já tens um código de partilha?":"Heb je al een deelcode?","Entrar na lista":"Naar lijst","Partilhar":"Delen","A LISTA DA CASA":"DE HUISLIJST","Sincronizada":"Gesynchroniseerd","A ligar…":"Verbinden…","O que está a faltar em casa?":"Wat ontbreekt er thuis?","Adicionar artigo":"Artikel toevoegen","Qtd.":"Aantal","Categoria":"Categorie","Automática":"Automatisch","Já comprados":"Al gekocht","Falta comprar":"Nog kopen","A lista está vazia":"Je lijst is leeg","Limpar artigos comprados":"Gekochte artikelen wissen","Sair da lista":"Lijst verlaten","Fechar":"Sluiten","A lista é melhor em família":"Samen boodschappen doen is beter","CÓDIGO DA LISTA":"LIJSTCODE","Copiar link de convite":"Uitnodigingslink kopiëren","Copiar apenas o código":"Alleen code kopiëren"},
pl: {"Tudo":"Wszystko","Fruta e legumes":"Owoce i warzywa","Frescos":"Świeże","Despensa":"Spiżarnia","Limpeza":"Środki czystości","Outros":"Inne","A preparar a tua lista…":"Przygotowywanie listy…","MAIS SIMPLES, JUNTOS":"PROŚCIEJ RAZEM","As compras da família.":"Zakupy rodzinne.","Sem esquecimentos.":"Nic już nie umknie.","Criar uma lista nova":"Utwórz nową listę","Começa uma lista e convida a família.":"Utwórz listę i zaproś rodzinę.","Nome da lista":"Nazwa listy","Criar lista":"Utwórz listę","A criar…":"Tworzenie…","ou":"lub","Já tens um código de partilha?":"Masz już kod udostępniania?","Entrar na lista":"Dołącz do listy","Partilhar":"Udostępnij","A LISTA DA CASA":"LISTA DOMOWA","Sincronizada":"Zsynchronizowano","A ligar…":"Łączenie…","O que está a faltar em casa?":"Czego brakuje w domu?","Adicionar artigo":"Dodaj produkt","Qtd.":"Ilość","Categoria":"Kategoria","Automática":"Automatyczna","Já comprados":"Kupione","Falta comprar":"Do kupienia","A lista está vazia":"Lista jest pusta","Limpar artigos comprados":"Usuń kupione produkty","Sair da lista":"Opuść listę","Fechar":"Zamknij","A lista é melhor em família":"Zakupy lepsze razem","CÓDIGO DA LISTA":"KOD LISTY","Copiar link de convite":"Kopiuj link zaproszenia","Copiar apenas o código":"Kopiuj tylko kod"},
ro: {"Tudo":"Toate","Fruta e legumes":"Fructe și legume","Frescos":"Proaspete","Despensa":"Cămară","Limpeza":"Curățenie","Outros":"Altele","A preparar a tua lista…":"Se pregătește lista…","MAIS SIMPLES, JUNTOS":"MAI SIMPLU, ÎMPREUNĂ","As compras da família.":"Cumpărăturile familiei.","Sem esquecimentos.":"Fără să uiți nimic.","Criar uma lista nova":"Creează o listă nouă","Começa uma lista e convida a família.":"Începe o listă și invită familia.","Nome da lista":"Numele listei","Criar lista":"Creează lista","A criar…":"Se creează…","ou":"sau","Já tens um código de partilha?":"Ai deja un cod de partajare?","Entrar na lista":"Intră în listă","Partilhar":"Partajează","A LISTA DA CASA":"LISTA CASEI","Sincronizada":"Sincronizat","A ligar…":"Se conectează…","O que está a faltar em casa?":"Ce lipsește din casă?","Adicionar artigo":"Adaugă produs","Qtd.":"Cant.","Categoria":"Categorie","Automática":"Automată","Já comprados":"Cumpărate","Falta comprar":"De cumpărat","A lista está vazia":"Lista este goală","Limpar artigos comprados":"Șterge produsele cumpărate","Sair da lista":"Părăsește lista","Fechar":"Închide","A lista é melhor em família":"Cumpărăturile sunt mai ușoare în familie","CÓDIGO DA LISTA":"CODUL LISTEI","Copiar link de convite":"Copiază linkul de invitație","Copiar apenas o código":"Copiază doar codul"},
"zh-CN": {"Tudo":"全部","Fruta e legumes":"水果和蔬菜","Frescos":"生鲜","Despensa":"食品储藏","Limpeza":"清洁用品","Outros":"其他","A preparar a tua lista…":"正在准备清单…","MAIS SIMPLES, JUNTOS":"一起，更简单","As compras da família.":"家庭购物清单","Sem esquecimentos.":"不再遗漏","Criar uma lista nova":"创建新清单","Começa uma lista e convida a família.":"创建清单并邀请家人","Nome da lista":"清单名称","Criar lista":"创建清单","A criar…":"正在创建…","ou":"或","Já tens um código de partilha?":"已有共享码？","Entrar na lista":"加入清单","Partilhar":"分享","A LISTA DA CASA":"家庭清单","Sincronizada":"已同步","A ligar…":"正在连接…","O que está a faltar em casa?":"家里还缺什么？","Adicionar artigo":"添加商品","Qtd.":"数量","Categoria":"类别","Automática":"自动","Já comprados":"已购买","Falta comprar":"待购买","A lista está vazia":"清单为空","Limpar artigos comprados":"清除已购买商品","Sair da lista":"退出清单","Fechar":"关闭","A lista é melhor em família":"一起购物更轻松","CÓDIGO DA LISTA":"清单代码","Copiar link de convite":"复制邀请链接","Copiar apenas o código":"只复制代码"}
};
const EXTRA_I18N = {"en":{"Ver comprados":"View purchased","Limpar artigos comprados":"Clear purchased items","Sair da lista":"Leave list","Remover":"Remove","Ex.: A3K9PX":"e.g. A3K9PX","Guardar lista atual":"Save current list","Listas reutilizáveis":"Reusable lists","Repetir compras":"Buy again","Guarda uma compra habitual para a reutilizares noutra semana.":"Save a regular shopping list to reuse next week.","Modo supermercado":"Shopping mode","Ativo":"On","Ativar":"Start","A tua compra":"Shopping list","Ver por comprar":"View items to buy","Sair desta lista neste dispositivo? A lista partilhada não será apagada.":"Leave this list on this device? The shared list will not be deleted.","Artigo adicionado novamente":"Item added again","Lista guardada neste dispositivo":"List saved on this device","Lista reutilizada":"List restored","Queres remover todos os artigos já comprados?":"Remove all purchased items?","Compras concluídas removidas":"Purchased items removed","Copia este código e partilha com a família:":"Copy this code and share it with your family:","Lista não encontrada.":"List not found.","Não encontrámos essa lista. Confirma o código e tenta novamente.":"We couldn't find that list. Check the code and try again.","Código da lista copiado!":"List code copied!","Falta configurar o Supabase":"Supabase setup required","Cria um projeto Supabase, executa o SQL de":"Create a Supabase project, run the SQL in","e define":"and set","no ficheiro":"in the file"},"es":{"Uma lista partilhada, sempre atualizada. Adiciona o que falta em casa e deixa o resto connosco.":"Una lista compartida que siempre está al día. Añade lo que falta en casa y deja el resto en nuestras manos.","Feita para partilhar. Simples para todos.":"Hecha para compartir. Fácil para todos.","A tua casa, mais organizada.":"Tu casa, más organizada.","Guardar lista atual":"Guardar la lista actual","Listas reutilizáveis":"Listas reutilizables","Repetir compras":"Volver a comprar","Guarda uma compra habitual para a reutilizares noutra semana.":"Guarda una compra habitual para reutilizarla otra semana.","Modo supermercado":"Modo supermercado","Ativo":"Activo","Ativar":"Activar","A tua compra":"Tu compra","Ver por comprar":"Ver pendientes","Ver comprados":"Ver comprados","Limpar artigos comprados":"Borrar productos comprados","Menos esquecimentos, mais tempo juntos.":"Menos olvidos, más tiempo juntos.","Sair da lista":"Salir de la lista","Sair desta lista neste dispositivo? A lista partilhada não será apagada.":"¿Salir de esta lista en este dispositivo? La lista compartida no se eliminará.","Artigo adicionado novamente":"Producto añadido de nuevo","Lista guardada neste dispositivo":"Lista guardada en este dispositivo","Lista reutilizada":"Lista reutilizada","Queres remover todos os artigos já comprados?":"¿Quieres eliminar todos los productos comprados?","Compras concluídas removidas":"Productos comprados eliminados","Copia este código e partilha com a família:":"Copia este código y compártelo con tu familia:","Lista não encontrada.":"Lista no encontrada.","Não encontrámos essa lista. Confirma o código e tenta novamente.":"No encontramos esa lista. Comprueba el código e inténtalo de nuevo.","Código da lista copiado!":"¡Código de la lista copiado!","Qualquer pessoa com o código pode aceder à lista. Partilha apenas com pessoas de confiança.":"Cualquiera que tenga el código puede acceder a esta lista. Compártelo solo con personas de confianza.","Partilha o código com a família. Cada pessoa introduz o código na app para abrir a mesma lista e sincronizar as alterações.":"Comparte el código con tu familia. Cada persona lo introduce en la app para abrir la misma lista y sincronizar los cambios."},"fr":{"Uma lista partilhada, sempre atualizada. Adiciona o que falta em casa e deixa o resto connosco.":"Une liste partagée toujours à jour. Ajoutez ce qui manque à la maison et laissez-nous faire le reste.","Feita para partilhar. Simples para todos.":"Conçue pour le partage. Simple pour tout le monde.","A tua casa, mais organizada.":"Une maison mieux organisée.","Guardar lista atual":"Enregistrer la liste actuelle","Listas reutilizáveis":"Listes réutilisables","Repetir compras":"Racheter","Guarda uma compra habitual para a reutilizares noutra semana.":"Enregistrez une liste habituelle pour la réutiliser une autre semaine.","Modo supermercado":"Mode courses","Ativo":"Activé","Ativar":"Activer","A tua compra":"Vos courses","Ver por comprar":"Voir les articles à acheter","Ver comprados":"Voir les articles achetés","Limpar artigos comprados":"Effacer les articles achetés","Menos esquecimentos, mais tempo juntos.":"Moins d’oublis, plus de temps ensemble.","Sair da lista":"Quitter la liste","Sair desta lista neste dispositivo? A lista partilhada não será apagada.":"Quitter cette liste sur cet appareil ? La liste partagée ne sera pas supprimée.","Artigo adicionado novamente":"Article ajouté à nouveau","Lista guardada neste dispositivo":"Liste enregistrée sur cet appareil","Lista reutilizada":"Liste réutilisée","Queres remover todos os artigos já comprados?":"Voulez-vous supprimer tous les articles achetés ?","Compras concluídas removidas":"Articles achetés supprimés","Copia este código e partilha com a família:":"Copiez ce code et partagez-le avec votre famille:","Lista não encontrada.":"Liste introuvable.","Não encontrámos essa lista. Confirma o código e tenta novamente.":"Liste introuvable. Vérifiez le code et réessayez.","Código da lista copiado!":"Code de la liste copié !","Qualquer pessoa com o código pode aceder à lista. Partilha apenas com pessoas de confiança.":"Toute personne disposant du code peut accéder à cette liste. Partagez-le uniquement avec des personnes de confiance.","Partilha o código com a família. Cada pessoa introduz o código na app para abrir a mesma lista e sincronizar as alterações.":"Partagez le code avec votre famille. Chacun le saisit dans l’application pour ouvrir la même liste et synchroniser les modifications."},"de":{"Guardar lista atual":"Aktuelle Liste speichern","Listas reutilizáveis":"Wiederverwendbare Listen","Repetir compras":"Erneut kaufen","Guarda uma compra habitual para a reutilizares noutra semana.":"Speichere einen regelmäßigen Einkauf, um ihn nächste Woche wiederzuverwenden.","Modo supermercado":"Einkaufsmodus","Ativo":"Aktiv","Ativar":"Aktivieren","A tua compra":"Dein Einkauf","Ver por comprar":"Noch zu kaufen anzeigen","Ver comprados":"Gekaufte anzeigen","Limpar artigos comprados":"Gekaufte Artikel löschen","Menos esquecimentos, mais tempo juntos.":"Weniger vergessen, mehr Zeit miteinander.","Sair da lista":"Liste verlassen","Sair desta lista neste dispositivo? A lista partilhada não será apagada.":"Diese Liste auf diesem Gerät verlassen? Die geteilte Liste wird nicht gelöscht.","Artigo adicionado novamente":"Artikel erneut hinzugefügt","Lista guardada neste dispositivo":"Liste auf diesem Gerät gespeichert","Lista reutilizada":"Liste wiederverwendet","Queres remover todos os artigos já comprados?":"Möchtest du alle gekauften Artikel entfernen?","Compras concluídas removidas":"Gekaufte Artikel entfernt","Copia este código e partilha com a família:":"Kopiere diesen Code und teile ihn mit deiner Familie:","Lista não encontrada.":"Liste nicht gefunden.","Não encontrámos essa lista. Confirma o código e tenta novamente.":"Liste nicht gefunden. Prüfe den Code und versuche es erneut.","Código da lista copiado!":"Listencode kopiert!","Qualquer pessoa com o código pode aceder à lista. Partilha apenas com pessoas de confiança.":"Jede Person mit dem Code kann auf diese Liste zugreifen. Teile ihn nur mit vertrauenswürdigen Personen.","Partilha o código com a família. Cada pessoa introduz o código na app para abrir a mesma lista e sincronizar as alterações.":"Teile den Code mit deiner Familie. Alle geben ihn in der App ein, um dieselbe Liste zu öffnen und Änderungen zu synchronisieren."},"it":{"Guardar lista atual":"Salva la lista attuale","Listas reutilizáveis":"Liste riutilizzabili","Repetir compras":"Riacquista","Guarda uma compra habitual para a reutilizares noutra semana.":"Salva una lista della spesa abituale per riutilizzarla la settimana successiva.","Modo supermercado":"Modalità spesa","Ativo":"Attiva","Ativar":"Attiva","A tua compra":"La tua spesa","Ver por comprar":"Vedi da comprare","Ver comprados":"Vedi acquistati","Limpar artigos comprados":"Elimina gli articoli acquistati","Menos esquecimentos, mais tempo juntos.":"Meno dimenticanze, più tempo insieme.","Sair da lista":"Esci dalla lista","Sair desta lista neste dispositivo? A lista partilhada não será apagada.":"Uscire da questa lista su questo dispositivo? La lista condivisa non verrà eliminata.","Artigo adicionado novamente":"Articolo aggiunto di nuovo","Lista guardada neste dispositivo":"Lista salvata su questo dispositivo","Lista reutilizada":"Lista riutilizzata","Queres remover todos os artigos já comprados?":"Vuoi rimuovere tutti gli articoli acquistati?","Compras concluídas removidas":"Articoli acquistati rimossi","Copia este código e partilha com a família:":"Copia questo codice e condividilo con la famiglia:","Lista não encontrada.":"Lista non trovata.","Não encontrámos essa lista. Confirma o código e tenta novamente.":"Lista non trovata. Controlla il codice e riprova.","Código da lista copiado!":"Codice della lista copiato!","Qualquer pessoa com o código pode aceder à lista. Partilha apenas com pessoas de confiança.":"Chiunque abbia il codice può accedere a questa lista. Condividilo solo con persone fidate.","Partilha o código com a família. Cada pessoa introduz o código na app para abrir a mesma lista e sincronizar as alterações.":"Condividi il codice con la famiglia. Ogni persona lo inserisce nell'app per aprire la stessa lista e sincronizzare le modifiche."},"nl":{"Guardar lista atual":"Huidige lijst opslaan","Listas reutilizáveis":"Herbruikbare lijsten","Repetir compras":"Opnieuw kopen","Guarda uma compra habitual para a reutilizares noutra semana.":"Bewaar een vaste boodschappenlijst om die volgende week opnieuw te gebruiken.","Modo supermercado":"Boodschappenmodus","Ativo":"Actief","Ativar":"Activeren","A tua compra":"Jouw boodschappen","Ver por comprar":"Nog te kopen bekijken","Ver comprados":"Gekochte bekijken","Limpar artigos comprados":"Gekochte artikelen wissen","Menos esquecimentos, mais tempo juntos.":"Minder vergeten, meer tijd samen.","Sair da lista":"Lijst verlaten","Sair desta lista neste dispositivo? A lista partilhada não será apagada.":"Deze lijst op dit apparaat verlaten? De gedeelde lijst wordt niet verwijderd.","Artigo adicionado novamente":"Artikel opnieuw toegevoegd","Lista guardada neste dispositivo":"Lijst opgeslagen op dit apparaat","Lista reutilizada":"Lijst opnieuw gebruikt","Queres remover todos os artigos já comprados?":"Wil je alle gekochte artikelen verwijderen?","Compras concluídas removidas":"Gekochte artikelen verwijderd","Copia este código e partilha com a família:":"Kopieer deze code en deel hem met je gezin:","Lista não encontrada.":"Lijst niet gevonden.","Não encontrámos essa lista. Confirma o código e tenta novamente.":"We konden de lijst niet vinden. Controleer de code en probeer opnieuw.","Código da lista copiado!":"Lijstcode gekopieerd!","Qualquer pessoa com o código pode aceder à lista. Partilha apenas com pessoas de confiança.":"Iedereen met de code heeft toegang tot deze lijst. Deel de code alleen met mensen die je vertrouwt.","Partilha o código com a família. Cada pessoa introduz o código na app para abrir a mesma lista e sincronizar as alterações.":"Deel de code met je gezin. Iedereen voert de code in de app in om dezelfde lijst te openen en wijzigingen te synchroniseren."},"pl":{"Guardar lista atual":"Zapisz bieżącą listę","Listas reutilizáveis":"Listy wielokrotnego użytku","Repetir compras":"Kup ponownie","Guarda uma compra habitual para a reutilizares noutra semana.":"Zapisz typową listę zakupów, aby użyć jej ponownie w kolejnym tygodniu.","Modo supermercado":"Tryb zakupów","Ativo":"Włączony","Ativar":"Włącz","A tua compra":"Twoje zakupy","Ver por comprar":"Pokaż do kupienia","Ver comprados":"Pokaż kupione","Limpar artigos comprados":"Usuń kupione produkty","Menos esquecimentos, mais tempo juntos.":"Mniej zapominania, więcej wspólnego czasu.","Sair da lista":"Opuść listę","Sair desta lista neste dispositivo? A lista partilhada não será apagada.":"Opuścić tę listę na tym urządzeniu? Lista udostępniona nie zostanie usunięta.","Artigo adicionado novamente":"Produkt dodany ponownie","Lista guardada neste dispositivo":"Lista zapisana na tym urządzeniu","Lista reutilizada":"Lista użyta ponownie","Queres remover todos os artigos já comprados?":"Czy usunąć wszystkie kupione produkty?","Compras concluídas removidas":"Usunięto kupione produkty","Copia este código e partilha com a família:":"Skopiuj ten kod i udostępnij go rodzinie:","Lista não encontrada.":"Nie znaleziono listy.","Não encontrámos essa lista. Confirma o código e tenta novamente.":"Nie znaleziono listy. Sprawdź kod i spróbuj ponownie.","Código da lista copiado!":"Skopiowano kod listy!","Qualquer pessoa com o código pode aceder à lista. Partilha apenas com pessoas de confiança.":"Każda osoba z kodem może uzyskać dostęp do listy. Udostępniaj go tylko zaufanym osobom.","Partilha o código com a família. Cada pessoa introduz o código na app para abrir a mesma lista e sincronizar as alterações.":"Udostępnij kod rodzinie. Każda osoba wpisuje go w aplikacji, aby otworzyć tę samą listę i synchronizować zmiany."},"ro":{"Guardar lista atual":"Salvează lista curentă","Listas reutilizáveis":"Liste reutilizabile","Repetir compras":"Cumpără din nou","Guarda uma compra habitual para a reutilizares noutra semana.":"Salvează o listă obișnuită de cumpărături pentru a o reutiliza săptămâna viitoare.","Modo supermercado":"Mod cumpărături","Ativo":"Activ","Ativar":"Activează","A tua compra":"Cumpărăturile tale","Ver por comprar":"Vezi de cumpărat","Ver comprados":"Vezi cumpărate","Limpar artigos comprados":"Șterge produsele cumpărate","Menos esquecimentos, mais tempo juntos.":"Mai puține lucruri uitate, mai mult timp împreună.","Sair da lista":"Ieși din listă","Sair desta lista neste dispositivo? A lista partilhada não será apagada.":"Ieși din această listă de pe dispozitiv? Lista partajată nu va fi ștearsă.","Artigo adicionado novamente":"Produs adăugat din nou","Lista guardada neste dispositivo":"Listă salvată pe acest dispozitiv","Lista reutilizada":"Listă reutilizată","Queres remover todos os artigos já comprados?":"Vrei să elimini toate produsele cumpărate?","Compras concluídas removidas":"Produse cumpărate eliminate","Copia este código e partilha com a família:":"Copiază acest cod și distribuie-l familiei:","Lista não encontrada.":"Lista nu a fost găsită.","Não encontrámos essa lista. Confirma o código e tenta novamente.":"Nu am găsit lista. Verifică codul și încearcă din nou.","Código da lista copiado!":"Codul listei a fost copiat!","Qualquer pessoa com o código pode aceder à lista. Partilha apenas com pessoas de confiança.":"Oricine are codul poate accesa lista. Distribuie-l doar persoanelor de încredere.","Partilha o código com a família. Cada pessoa introduz o código na app para abrir a mesma lista e sincronizar as alterações.":"Distribuie codul familiei. Fiecare persoană îl introduce în aplicație pentru a deschide aceeași listă și a sincroniza modificările."},"zh-CN":{"Guardar lista atual":"保存当前清单","Listas reutilizáveis":"可重复使用的清单","Repetir compras":"再次购买","Guarda uma compra habitual para a reutilizares noutra semana.":"保存常用购物清单，下周可再次使用。","Modo supermercado":"购物模式","Ativo":"已开启","Ativar":"开启","A tua compra":"你的购物清单","Ver por comprar":"查看待购买","Ver comprados":"查看已购买","Limpar artigos comprados":"清除已购买商品","Menos esquecimentos, mais tempo juntos.":"少些遗忘，多些相伴。","Sair da lista":"退出清单","Sair desta lista neste dispositivo? A lista partilhada não será apagada.":"要在此设备上退出此清单吗？共享清单不会被删除。","Artigo adicionado novamente":"已重新添加商品","Lista guardada neste dispositivo":"清单已保存在此设备","Lista reutilizada":"已重新使用清单","Queres remover todos os artigos já comprados?":"要删除所有已购买商品吗？","Compras concluídas removidas":"已删除已购买商品","Copia este código e partilha com a família:":"复制此代码并与家人分享：","Lista não encontrada.":"未找到清单。","Não encontrámos essa lista. Confirma o código e tenta novamente.":"未找到该清单。请检查代码并重试。","Código da lista copiado!":"清单代码已复制！","Qualquer pessoa com o código pode aceder à lista. Partilha apenas com pessoas de confiança.":"任何拥有代码的人都可以访问此清单。请仅与可信的人分享。","Partilha o código com a família. Cada pessoa introduz o código na app para abrir a mesma lista e sincronizar as alterações.":"与家人分享代码。每个人在应用中输入代码即可打开同一清单并同步更改。"}};
function tx(text, lang) {
  if (!lang || lang === "pt-PT") return text;
  return EXTRA_I18N[lang]?.[text] || I18N[lang]?.[text] || I18N.en[text] || text;
}
const LANGUAGE_FLAGS = {
  "pt-PT": "🇵🇹", en: "🇬🇧", es: "🇪🇸", fr: "🇫🇷", de: "🇩🇪",
  it: "🇮🇹", nl: "🇳🇱", pl: "🇵🇱", ro: "🇷🇴", "zh-CN": "🇨🇳"
};

function LanguagePicker({ language, onChange }) {
  const selectedLanguage = LANGUAGE_OPTIONS.find(([code]) => code === language);
  return <label className="language-picker" aria-label="Idioma">
    <span className="language-flag" aria-hidden="true">{LANGUAGE_FLAGS[language] || "🌐"}</span>
    <select value={language} onChange={e => onChange(e.target.value)} aria-label="Idioma" title={selectedLanguage?.[1] || "Idioma"}>
      {LANGUAGE_OPTIONS.map(([code, label]) => <option key={code} value={code}>{LANGUAGE_FLAGS[code]} {label}</option>)}
    </select>
  </label>;
}

function getDeviceId() { let id = localStorage.getItem("listora-device-id"); if (!id) { id = crypto.randomUUID ? crypto.randomUUID() : "device-" + Date.now() + "-" + Math.random().toString(36).slice(2); localStorage.setItem("listora-device-id", id); } return id; }



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

  const [listCode, setListCode] = useState(() => (new URLSearchParams(window.location.search).get("join") || new URLSearchParams(window.location.search).get("list") || localStorage.getItem("lista-familia-code") || "").toUpperCase());
  const [memberName, setMemberName] = useState(() => localStorage.getItem("listora-member-name") || "");
  const [memberNameInput, setMemberNameInput] = useState(() => localStorage.getItem("listora-member-name") || "");
  const [memberId, setMemberId] = useState(() => getDeviceId());
  const [activeTab, setActiveTab] = useState("shopping");
  const [receipts, setReceipts] = useState([]);
  const [receiptStore, setReceiptStore] = useState("");
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().slice(0,10));
  const [receiptTotal, setReceiptTotal] = useState("");
  const [receiptNotes, setReceiptNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptBusy, setReceiptBusy] = useState(false);
  const [receiptExtractBusy, setReceiptExtractBusy] = useState(false);
  const [receiptExtraction, setReceiptExtraction] = useState(null);
  const channelRef = useRef(null);
  const [list, setList] = useState(null);
  const displayListName = list && ["Compras da família", "Family shopping", "Compra familiar"].includes(list.name) ? t("Compras da família") : list?.name;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [category, setCategory] = useState("auto");
  const [filter, setFilter] = useState("all");
  const [showDone, setShowDone] = useState(false);
  const [shoppingMode, setShoppingMode] = useState(false);
  const [templates, setTemplates] = useState(() => { try { return JSON.parse(localStorage.getItem("lista-familia-templates") || "[]"); } catch { return []; } });
  const [itemHistory, setItemHistory] = useState(() => { try { return JSON.parse(localStorage.getItem("lista-familia-item-history") || "[]"); } catch { return []; } });
  const [joinCode, setJoinCode] = useState(() => (new URLSearchParams(window.location.search).get("join") || localStorage.getItem("lista-familia-code") || "").toUpperCase());
  const [listName, setListName] = useState(() => tx("Compras da família", language));
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [importSource, setImportSource] = useState("");
  const [importBusy, setImportBusy] = useState(false);
  const [importError, setImportError] = useState("");
  const [listening, setListening] = useState(false);
  const imageInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const activeItems = useMemo(() => items.filter(i => !i.done), [items]);
  const doneItems = useMemo(() => items.filter(i => i.done), [items]);
  const visibleItems = useMemo(() => {
    const source = shoppingMode ? (showDone ? doneItems : activeItems) : (showDone ? items : activeItems);
    return source.filter(i => filter === "all" || i.category === filter);
  }, [items, activeItems, doneItems, filter, showDone, shoppingMode]);
  const shoppingProgress = items.length ? Math.round((doneItems.length / items.length) * 100) : 0;
  const suggestions = useMemo(() => [...new Map([...items.map(item => item.name), ...itemHistory].map(value => [value.toLocaleLowerCase(), value])).values()].slice(0, 30), [items, itemHistory]);

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
    const displayName = memberNameInput.trim().slice(0, 60);
    if (!displayName) { setError("Indica o teu nome para poderes criar a lista."); return; }
    localStorage.setItem("listora-member-name", displayName); setMemberName(displayName);
    setLoading(true); setError("");
    try {
      const { data, error: rpcError } = await supabase.rpc("create_family_list", { p_name: listName.trim() || t("Compras da família") });
      if (rpcError) throw rpcError;
      localStorage.setItem("lista-familia-code", data.list.shareCode);
      setListCode(data.list.shareCode);
      setList(data.list);
      setItems(data.items || []); setReceipts(data.receipts || []);
      const deviceId = getDeviceId(); setMemberId(deviceId);
      const { error: memberError } = await supabase.rpc("register_family_member", { p_share_code: data.list.shareCode, p_device_id: deviceId, p_display_name: displayName });
      if (memberError) throw memberError;
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function joinList(e) {
    e.preventDefault();
    const displayName = memberNameInput.trim().slice(0, 60);
    if (!displayName) { setError("Indica o teu nome para entrares na lista."); return; }
    localStorage.setItem("listora-member-name", displayName); setMemberName(displayName);
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setLoading(true); setError("");
    try {
      const { data, error: rpcError } = await supabase.rpc("get_family_list", { p_share_code: code });
      if (rpcError || !data?.list) throw rpcError || new Error("Lista não encontrada.");
      const deviceId = getDeviceId(); setMemberId(deviceId);
      const { error: memberError } = await supabase.rpc("register_family_member", { p_share_code: code, p_device_id: deviceId, p_display_name: displayName });
      if (memberError) throw memberError;
      localStorage.setItem("lista-familia-code", code);
      setListCode(code); setList(data.list); setItems(data.items || []); setReceipts(data.receipts || []);
    } catch { setError(t("Não encontrámos essa lista. Confirma o código e tenta novamente.")); }
    finally { setLoading(false); }
  }

  async function submitItem(cleanName, qty = 1, selectedCategory = "auto") {
    if (!cleanName || !listCode) return;
    try {
      const { data, error: rpcError } = await supabase.rpc("add_family_item", {
        p_share_code: listCode, p_name: cleanName, p_quantity: qty,
        p_category: selectedCategory === "auto" ? guessCategory(cleanName) : selectedCategory
      });
      if (rpcError) throw rpcError;
      broadcastChange();
      setItems(data.items);
      setItemHistory(previous => {
        const next = [cleanName, ...previous.filter(value => value.toLocaleLowerCase() !== cleanName.toLocaleLowerCase())].slice(0, 80);
        localStorage.setItem("lista-familia-item-history", JSON.stringify(next));
        return next;
      });
      setName(""); setQuantity("1"); setCategory("auto");
      return true;
    } catch (err) { setError(err.message); return false; }
  }

  function parseGeminiItems(payload) {
    const text = payload?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("") || "";
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleaned);
    const source = Array.isArray(parsed) ? parsed : parsed.items;
    if (!Array.isArray(source)) throw new Error("O Gemini não devolveu uma lista válida.");
    return source.map(item => ({
      name: String(item.name || item.product || "").trim().replace(/\s+/g, " ").slice(0, 100),
      quantity: Math.max(1, Math.min(999, Number.parseInt(item.quantity, 10) || 1))
    })).filter(item => item.name).slice(0, 60);
  }

  async function callGemini({ text, image }) {
    const { data, error } = await supabase.functions.invoke("listora-list-extract", {
      body: {
        text: text || "",
        mimeType: image?.mimeType || "",
        fileData: image?.data || ""
      }
    });
    if (error) {
      let detail = error.message || "Não foi possível contactar o serviço de IA.";
      try {
        const context = error.context;
        if (context && typeof context.json === "function") {
          const payload = await context.json();
          detail = payload?.error || payload?.message || detail;
        }
      } catch { /* Keep the original function error. */ }
      throw new Error(detail);
    }
    if (data?.error) throw new Error(data.error);
    return parseGeminiItems({ candidates: [{ content: { parts: [{ text: JSON.stringify(data) }] } }] });
  }

  async function processPhoto(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setImportError("Escolhe um ficheiro de imagem."); return; }
    if (file.size > 12 * 1024 * 1024) { setImportError("A imagem deve ter menos de 12 MB."); return; }
    setImportError("");
    // The file input (with capture="environment") lets the browser handle camera permission.
    // Do not require getUserMedia here: users may also select an existing image file.
    setImportBusy(true); setImportError(""); setImportSource("photo");
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(",")[1];
      const itemsFound = await callGemini({ image: { mimeType: file.type, data: base64 } });
      if (!itemsFound.length) throw new Error("Não consegui identificar produtos. Tenta uma fotografia mais nítida.");
      setImportPreview(itemsFound);
    } catch (err) { setImportError(err.message || "Não foi possível interpretar a imagem."); }
    finally { setImportBusy(false); if (imageInputRef.current) imageInputRef.current.value = ""; }
  }

  async function startVoiceImport() {
    setImportError("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setImportError("O reconhecimento de voz não está disponível neste navegador. Experimenta usar o microfone do teclado para ditar no campo de texto.");
      return;
    }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    try {
      // Ask for microphone access on the user gesture before starting recognition.
      // This allows Android/WebView to show its permission dialog when supported.
      if (navigator.mediaDevices?.getUserMedia) {
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (permissionError) {
          const denied = permissionError?.name === "NotAllowedError" || permissionError?.name === "PermissionDeniedError";
          setImportError(denied
            ? t("O acesso ao microfone foi recusado. Ativa a permissão nas definições da aplicação.")
            : t("Não foi possível aceder ao microfone neste dispositivo."));
          return;
        } finally {
          stream?.getTracks().forEach(track => track.stop());
        }
      }
      const recognition = new SpeechRecognition();
      recognition.lang = language === "pt-PT" ? "pt-PT" : language;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;
      recognition.onstart = () => setListening(true);
      recognition.onerror = event => {
        setListening(false);
        setImportError(event.error === "not-allowed"
          ? t("O acesso ao microfone foi recusado. Ativa a permissão nas definições da aplicação.")
          : t("Não foi possível reconhecer a voz. Tenta novamente."));
      };
      recognition.onend = () => setListening(false);
      recognition.onresult = async event => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim();
        if (!transcript) { setImportError("Não foi detetado discurso."); return; }
        setImportBusy(true); setImportSource("voice"); setImportError("");
        try {
          const itemsFound = await callGemini({ text: transcript });
          if (!itemsFound.length) throw new Error("Não foram identificados produtos na frase. Tenta novamente.");
          setImportPreview(itemsFound);
        } catch (err) { setImportError(err.message || "Não foi possível interpretar a voz."); }
        finally { setImportBusy(false); }
      };
      recognition.start();
    } catch {
      setListening(false);
      setImportError("Não foi possível iniciar o microfone neste dispositivo.");
    }
  }

  function editPreviewItem(index, changes) {
    setImportPreview(previous => previous.map((item, i) => i === index ? { ...item, ...changes } : item));
  }

  async function confirmImport() {
    const validItems = importPreview.filter(item => item.name.trim()).map(item => ({
      name: item.name.trim().slice(0, 100),
      quantity: Math.max(1, Math.min(999, Number.parseInt(item.quantity, 10) || 1))
    }));
    if (!validItems.length) { setImportError("Adiciona pelo menos um produto."); return; }
    setImportBusy(true); setImportError("");
    let added = 0;
    try {
      for (const item of validItems) {
        if (!await submitItem(item.name, item.quantity, "auto")) throw new Error("Alguns produtos não foram adicionados. Podes tentar novamente.");
        added += 1;
      }
      setImportPreview([]);
      setImportSource("");
      notify(`${added} ${added === 1 ? "produto adicionado" : "produtos adicionados"}`);
    } finally { setImportBusy(false); }
  }

  async function addItem(e) {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;
    const qty = Math.max(1, Math.min(999, Number.parseInt(quantity, 10) || 1));
    await submitItem(cleanName, qty, category);
  }

  async function repeatItem(itemName) {
    if (await submitItem(itemName, 1, "auto")) notify(t("Artigo adicionado novamente"));
  }

  function saveCurrentTemplate() {
    const pending = activeItems.map(item => ({ name: item.name, quantity: item.quantity, category: item.category }));
    if (!pending.length) return;
    const templateName = window.prompt(t("Nome para esta lista reutilizável:"), list.name || t("Compra semanal"));
    if (!templateName || !templateName.trim()) return;
    const next = [{ id: Date.now(), name: templateName.trim().slice(0, 50), items: pending }, ...templates].slice(0, 8);
    setTemplates(next);
    localStorage.setItem("lista-familia-templates", JSON.stringify(next));
    notify(t("Lista guardada neste dispositivo"));
  }

  async function useTemplate(template) {
    for (const item of template.items) {
      const ok = await submitItem(item.name, item.quantity || 1, item.category || "auto");
      if (!ok) return;
    }
    notify(t("Lista reutilizada"));
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

  async function clearAllItems() {
    if (!items.length) return;
    if (!window.confirm(t("Queres remover todos os produtos desta lista? Esta ação afeta todos os membros e não pode ser desfeita."))) return;
    try {
      let remainingItems = items;
      for (const item of items) {
        const { data, error: rpcError } = await supabase.rpc("delete_family_item", { p_share_code: listCode, p_item_id: item._id });
        if (rpcError) throw rpcError;
        remainingItems = data.items;
      }
      broadcastChange();
      setItems(remainingItems);
      setShowDone(false);
      notify(t("Todos os produtos foram removidos"));
    } catch (err) { setError(err.message); }
  }

  const inviteUrl = window.location.origin + (import.meta.env.BASE_URL || "/") + "?join=" + encodeURIComponent(listCode);
  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      notify(t("Link de convite copiado!"));
    } catch {
      window.prompt(t("Copia este link e partilha com a família:"), inviteUrl);
    }
  }

  async function shareListCode() {
    const message = "Entra na minha lista da Listora: " + inviteUrl + " (código: " + listCode + ")";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Listora — lista partilhada", text: message, url: inviteUrl });
      } else {
        await navigator.clipboard.writeText(message);
        notify(t("Link de convite copiado!"));
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(listCode);
        notify(t("Código da lista copiado!"));
      } catch {
        window.prompt(t("Copia este link e partilha com a família:"), inviteUrl);
      }
    }
  }

  async function extractReceiptData(file = receiptFile) {
    if (!file) { setError("Seleciona primeiro uma fotografia ou PDF da fatura."); return; }
    if (!["image/jpeg","image/png","image/webp","application/pdf"].includes(file.type)) {
      setError("Usa uma imagem JPG, PNG, WebP ou PDF."); return;
    }
    if (file.size > 10 * 1024 * 1024) { setError("O comprovativo deve ter no máximo 10 MB."); return; }
    setReceiptExtractBusy(true); setError(""); setReceiptExtraction(null);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Não foi possível ler o ficheiro."));
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(",")[1];
      const { data, error: invokeError } = await supabase.functions.invoke("listora-receipt-extract", {
        body: { mimeType: file.type, fileData: base64 }
      });
      if (invokeError) {
        const detail = await invokeError.context?.json?.().catch(() => null);
        throw new Error(detail?.error || invokeError.message || "Não foi possível analisar a fatura.");
      }
      if (!data || data.error) throw new Error(data?.error || "A IA não conseguiu analisar esta fatura.");
      if (data.storeName) setReceiptStore(String(data.storeName).slice(0,120));
      if (data.purchasedAt && /^\\d{4}-\\d{2}-\\d{2}$/.test(data.purchasedAt)) setReceiptDate(data.purchasedAt);
      if (data.total !== null && data.total !== undefined && Number.isFinite(Number(data.total))) setReceiptTotal(String(Number(data.total).toFixed(2)));
      const items = Array.isArray(data.items) ? data.items.slice(0,40) : [];
      const detailLines = [];
      if (data.vatTotal !== null && data.vatTotal !== undefined && Number.isFinite(Number(data.vatTotal))) detailLines.push("IVA identificado: €" + Number(data.vatTotal).toFixed(2));
      if (items.length) detailLines.push("Artigos identificados: " + items.map(item => {
        const label = String(item.name || "").trim().slice(0,100);
        const amount = Number(item.total);
        return label + (Number.isFinite(amount) ? " (€" + amount.toFixed(2) + ")" : "");
      }).filter(Boolean).join(", "));
      if (detailLines.length) setReceiptNotes(previous => [previous.trim(), detailLines.join("\\n")].filter(Boolean).join("\\n").slice(0,1000));
      setReceiptExtraction({ items, vatTotal: data.vatTotal, confidence: data.confidence || "medium", warnings: Array.isArray(data.warnings) ? data.warnings : [] });
      notify("Sugestões extraídas. Confirma os campos antes de guardar.");
    } catch (err) {
      setError(err.message || "Não foi possível extrair os dados da fatura.");
    } finally { setReceiptExtractBusy(false); }
  }

  async function addReceipt(e) {
    e.preventDefault();
    if (!receiptStore.trim() || receiptTotal === "" || Number(receiptTotal) < 0) return;
    setReceiptBusy(true); setError("");
    let filePath = null;
    try {
      const receiptId = crypto.randomUUID();
      if (receiptFile) {
        if (receiptFile.size > 10 * 1024 * 1024) throw new Error("O comprovativo deve ter no máximo 10 MB.");
        if (!["image/jpeg","image/png","image/webp","application/pdf"].includes(receiptFile.type)) throw new Error("Usa uma imagem JPG, PNG, WebP ou PDF.");
        filePath = listCode + "/" + receiptId + "/" + receiptFile.name.replace(/[^a-zA-Z0-9._-]/g,"_");
        const { error: uploadError } = await supabase.storage.from("family-receipts").upload(filePath, receiptFile, { contentType: receiptFile.type, upsert: false });
        if (uploadError) throw uploadError;
      }
      const { data, error: rpcError } = await supabase.rpc("add_family_receipt", {
        p_share_code: listCode, p_device_id: memberId, p_store_name: receiptStore.trim(),
        p_purchased_at: receiptDate, p_total: Number(receiptTotal), p_notes: receiptNotes.trim(),
        p_file_path: filePath, p_file_name: receiptFile?.name || null
      });
      if (rpcError) throw rpcError;
      setReceipts(data.receipts || []); setList(data.list || list); broadcastChange();
      setReceiptStore(""); setReceiptTotal(""); setReceiptNotes(""); setReceiptFile(null); setReceiptExtraction(null);
      const input = document.getElementById("receipt-file"); if (input) input.value = "";
      notify("Fatura adicionada à lista partilhada.");
    } catch (err) {
      if (filePath) await supabase.storage.from("family-receipts").remove([filePath]);
      setError(err.message || "Não foi possível guardar a fatura.");
    } finally { setReceiptBusy(false); }
  }

  async function openReceipt(receipt) {
    if (!receipt.filePath) return;
    const { data, error: fileError } = await supabase.storage.from("family-receipts").createSignedUrl(receipt.filePath, 300);
    if (fileError) { setError(fileError.message); return; }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function removeReceipt(receipt) {
    if (!window.confirm("Apagar esta fatura partilhada?")) return;
    try {
      const { data, error: rpcError } = await supabase.rpc("delete_family_receipt", { p_share_code: listCode, p_receipt_id: receipt.id });
      if (rpcError) throw rpcError;
      if (data.filePath) await supabase.storage.from("family-receipts").remove([data.filePath]);
      setReceipts(data.payload?.receipts || []); broadcastChange();
    } catch (err) { setError(err.message); }
  }

  async function copyListCode() {
    try {
      await navigator.clipboard.writeText(listCode);
      notify(t("Código da lista copiado!"));
    } catch {
      window.prompt(t("Copia este link e partilha com a família:"), inviteUrl);
    }
  }

  if (!isSupabaseConfigured) return (
    <main className="loading-screen">
      <div style={{ maxWidth: 520, padding: 24, textAlign: "center" }}>
        <h1>{t("Falta configurar o Supabase")}</h1>
        <p>{t("Cria um projeto Supabase, executa o SQL de")} <code>supabase/migrations</code> {t("e define")} <code>VITE_SUPABASE_URL</code> {t("e")} <code>VITE_SUPABASE_ANON_KEY</code> {t("no ficheiro")} <code>.env.local</code>.</p>
      </div>
    </main>
  );

  if (loading && !list) return <main className="loading-screen"><LoaderCircle className="spin" size={30}/><span>{t("A preparar a tua lista…")}</span></main>;

  if (!listCode || !list || !memberName) return (
    <main className="welcome-page">
      <div className="welcome-glow glow-one" /><div className="welcome-glow glow-two" />
      <header className="welcome-top"><div className="brand"><span className="brand-mark"><ShoppingBasket size={23}/></span><span>List<span className="brand-light">ora</span></span></div><LanguagePicker language={language} onChange={setLanguage}/></header>
      <section className="welcome-content">
        <div className="eyebrow"><Leaf size={15}/> {t("MAIS SIMPLES, JUNTOS")}</div>
        <h1>{t("As compras da família.")}<br/><span>{t("Sem esquecimentos.")}</span></h1>
        <p className="welcome-copy">{t("Uma lista partilhada, sempre atualizada. Adiciona o que falta em casa e deixa o resto connosco.")}</p>
        <div className="welcome-card">
          <div className="card-heading"><span className="card-icon"><Plus size={19}/></span><div><h2>{t("Criar uma lista nova")}</h2><p>{t("Começa uma lista e convida a família.")}</p></div></div>
          <form onSubmit={createList} className="create-form">
            <label htmlFor="member-name">O teu nome</label><input id="member-name" value={memberNameInput} onChange={e => setMemberNameInput(e.target.value)} maxLength={60} placeholder="Ex.: Guilherme" required autoComplete="name"/>
            <label htmlFor="list-name">{t("Nome da lista")}</label>
            <input id="list-name" value={listName} onChange={e => setListName(e.target.value)} maxLength={60} placeholder={t("Compras da família")}/>
            <button className="primary-button" disabled={loading} type="submit">{loading ? t("A criar…") : t("Criar lista")} <ArrowRight size={18}/></button>
          </form>
          <div className="form-divider"><span>{t("ou")}</span></div>
          <form onSubmit={joinList} className="join-form">
            <label htmlFor="member-name-join">O teu nome</label><input id="member-name-join" value={memberNameInput} onChange={e => setMemberNameInput(e.target.value)} maxLength={60} placeholder="Ex.: Guilherme" required autoComplete="name"/>
            <label htmlFor="join-code">{t("Já tens um código de partilha?")}</label>
            <div className="join-row"><input id="join-code" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder={t("Ex.: A3K9PX")} maxLength={12}/><button aria-label={t("Entrar na lista")} type="submit" className="join-button"><ArrowRight size={20}/></button></div>
          </form>
          {error && <p className="error-message">{error}</p>}
        </div>
        <div className="welcome-foot"><Users size={17}/><span>{t("Feita para partilhar. Simples para todos.")}</span></div>
      </section>
      <footer className="welcome-footer">{t("A tua casa, mais organizada.")}</footer>
    </main>
  );

  return (
    <main className="app-shell">
      <header className="topbar refined-topbar">
        <div className="refined-brand">
          <span className="brand-mark"><ShoppingBasket size={24}/></span>
          <div className="refined-brand-copy"><span className="brand-name">Listora</span><span className="list-name-inline">{displayListName}<ChevronDown size={15}/></span></div>
        </div>
        <div className="topbar-actions">
          <LanguagePicker language={language} onChange={setLanguage} />
          <button className="icon-action" onClick={() => setShowShare(true)} aria-label={t("Partilhar")} title={t("Partilhar")}><Share2 size={22}/></button>
          <button className="icon-action" onClick={() => { if (doneItems.length) repeatItem(doneItems[0].name); else document.querySelector(".add-main input")?.focus(); }} aria-label={t("Repetir compras")} title={t("Repetir compras")}><Repeat2 size={22}/></button>
        </div>
      </header>
      <nav className="main-tabs" aria-label="Secções da lista">
        <button type="button" className={activeTab === "shopping" ? "main-tab active" : "main-tab"} onClick={() => setActiveTab("shopping")}><ShoppingBasket size={17}/> Lista de compras</button>
        <button type="button" className={activeTab === "receipts" ? "main-tab active" : "main-tab"} onClick={() => setActiveTab("receipts")}><Receipt size={17}/> Faturas <span>{receipts.length}</span></button>
      </nav>
      {activeTab === "shopping" && <>
      <section className="list-header">
        <div className="list-title-line"><div><div className="eyebrow">{t("A LISTA DA CASA")}</div><h1>{displayListName}</h1></div><span className={`sync-status ${connected ? "online" : ""}`} title={connected ? t("Sincronização ativa") : t("A ligar")}>{connected ? <Wifi size={15}/> : <WifiOff size={15}/>}<span>{connected ? t("Sincronizada") : t("A ligar…")}</span></span></div>
        <div className="progress-line"><div className="progress-track"><span style={{ width: `${items.length ? (doneItems.length / items.length) * 100 : 0}%` }}/></div><span>{doneItems.length} {t("de")} {items.length} {t("comprados")}</span></div>
      </section>
      <section className="add-panel" hidden={shoppingMode}>
        <form onSubmit={addItem}>
          <div className="add-main"><button type="submit" className="input-plus add-submit-left" aria-label={t("Adicionar artigo")} disabled={!name.trim()}><Plus size={22}/></button><input list="item-history-suggestions" value={name} onChange={e => setName(e.target.value)} placeholder="Adicionar produto…" aria-label={t("Nome do artigo")} maxLength={100}/><datalist id="item-history-suggestions">{suggestions.map(itemName => <option key={itemName} value={itemName}/>)}</datalist></div>
          <div className="quick-add-chips" aria-label="Sugestões rápidas">{["Leite","Pão","Água"].map(itemName => <button type="button" key={itemName} onClick={() => submitItem(itemName)}><Plus size={13}/>{itemName}</button>)}</div>
          <section className="smart-add-section" aria-label="Adicionar artigos rapidamente"><div className="smart-add-heading"><span>ADICIONAR MAIS RÁPIDO</span><small>Fotografa uma lista em papel ou dita os produtos</small></div><div className="ai-import-actions"><button type="button" onClick={() => imageInputRef.current?.click()} disabled={importBusy} className="ai-import-button ai-import-photo"><span className="ai-import-icon"><Camera size={21}/></span><span className="ai-import-copy"><strong>Fotografar lista</strong><small>Manuscrito, quadro ou papel</small><small className="ai-import-detail">Reconhece os produtos automaticamente</small></span></button><button type="button" onClick={startVoiceImport} disabled={importBusy} className={listening ? "ai-import-button ai-import-voice recording" : "ai-import-button ai-import-voice"}><span className="ai-import-icon"><Mic size={21}/></span><span className="ai-import-copy"><strong>{listening ? "A ouvir… toca para parar" : "Por voz"}</strong><small>{listening ? "Diz os produtos que precisas" : "Dita os produtos"}</small></span></button><input ref={imageInputRef} type="file" accept="image/*" capture="environment" hidden onChange={e => processPhoto(e.target.files?.[0])}/></div></section>{(importBusy || importError) && <div className={importError ? "ai-import-status error-message" : "ai-import-status"}>{importBusy && <LoaderCircle size={15} className="spin"/>}{importBusy ? (importSource === "photo" ? "A analisar a fotografia…" : "A interpretar os produtos…") : importError}</div>}
          <div className="add-options"><div className="quantity-control"><label htmlFor="quantity">{t("Qtd.")}</label><input id="quantity" type="number" min="1" max="999" value={quantity} onChange={e => setQuantity(e.target.value)}/></div><span className="option-separator"/><label className="category-select-label" htmlFor="category-select">{t("Categoria")}</label><select id="category-select" value={category} onChange={e => setCategory(e.target.value)}><option value="auto">{t("Automática")}</option>{CATEGORIES.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.emoji} {t(c.label)}</option>)}</select></div>
        </form>
      </section>
      <nav className="quick-actions" hidden={shoppingMode} aria-label={t("Ações rápidas")}>
        <button type="button" className="quick-action" onClick={() => doneItems.length ? repeatItem(doneItems[0].name) : document.querySelector(".add-main input")?.focus()}><span className="quick-action-icon">↻</span>{t("Repetir compras")}</button>
        <button type="button" className="quick-action" onClick={() => { setShoppingMode(false); document.querySelector(".templates-section")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}><span className="quick-action-icon"><span className="folder-glyph">▱</span></span>{t("Listas guardadas")}</button>
      </nav>
      <section className={templates.length ? "templates-section" : "templates-section is-empty"} hidden={shoppingMode}>
        <div className="templates-title-row"><span>{t("Listas reutilizáveis")}</span><button type="button" onClick={saveCurrentTemplate} disabled={!activeItems.length}>{t("Guardar lista atual")}</button></div>
        {templates.length > 0 ? <div className="template-chips">{templates.map(template => <button type="button" className="template-chip" key={template.id} onClick={() => useTemplate(template)}><span>{template.name}</span><small>{template.items.length} {t("artigos")}</small></button>)}</div> : <p className="template-hint">{t("Guarda uma compra habitual para a reutilizares noutra semana.")}</p>}
      </section>
      {doneItems.length > 0 && !shoppingMode && <section className="repeat-section" aria-label={t("Repetir compras")}>
        <div className="repeat-heading">{t("Repetir compras")}</div>
        <div className="repeat-chips">{[...new Map(doneItems.map(item => [item.name.toLocaleLowerCase(), item.name])).values()].slice(0, 5).map(itemName => <button type="button" className="repeat-chip" key={itemName} onClick={() => repeatItem(itemName)}><Plus size={13}/>{itemName}</button>)}</div>
      </section>}
      <div className={shoppingMode ? "shopping-mode-row active" : "shopping-mode-row"}>
        <span><ShoppingBasket size={16}/>{t("Modo supermercado")}</span>
        <button type="button" className={shoppingMode ? "mode-toggle active" : "mode-toggle"} aria-pressed={shoppingMode} onClick={() => { setShoppingMode(!shoppingMode); setShowDone(false); }}>{shoppingMode ? "Sair" : t("Ativar")}</button>
      </div>
      {shoppingMode && <section className="supermarket-summary" aria-label="Progresso das compras">
        <div className="supermarket-summary-top"><div><span className="supermarket-kicker">AS TUAS COMPRAS</span><h2>{doneItems.length === items.length && items.length > 0 ? "Tudo comprado!" : "Vamos às compras"}</h2></div><strong>{doneItems.length}<span> / {items.length}</span></strong></div>
        <div className="supermarket-progress-track"><span style={{width: `${shoppingProgress}%`}}/></div>
        <div className="supermarket-summary-bottom"><span>{doneItems.length} de {items.length} produtos verificados</span><button type="button" className={showDone ? "purchased-filter active" : "purchased-filter"} onClick={() => setShowDone(!showDone)}>{showDone ? "Ver por comprar" : `Comprados (${doneItems.length})`}</button></div>
      </section>}
      <nav className="category-tabs" aria-label={t("Filtrar por categoria")} tabIndex={0}>
        {CATEGORIES.map(c => <button key={c.id} className={filter === c.id ? "category-tab active" : "category-tab"} onClick={() => setFilter(c.id)}><span>{c.emoji}</span>{t(c.label)}{c.id === "all" && <span className="tab-count">{activeItems.length}</span>}</button>)}
      </nav>
      <section className={shoppingMode ? "items-section supermarket-items-section" : "items-section"}>
        <div className="section-heading"><div><h2>{shoppingMode ? (showDone ? "Comprados" : "Por comprar") : showDone ? t("Já comprados") : t("Falta comprar")}</h2><span>{visibleItems.length} {visibleItems.length === 1 ? t("artigo") : t("artigos")}</span></div>{!shoppingMode && <button className="view-toggle" onClick={() => setShowDone(!showDone)}>{showDone ? t("Ver por comprar") : `${t("Ver comprados")} (${doneItems.length})`} <ChevronDown size={15} className={showDone ? "rotate" : ""}/></button>}</div>
        {visibleItems.length === 0 ? <div className="empty-state"><span className="empty-illustration">{showDone ? "✨" : "🧺"}</span><h3>{showDone ? t("Ainda não há compras concluídas") : filter === "all" ? t("A lista está vazia") : t("Nada nesta categoria")}</h3><p>{showDone ? t("Quando marcares um artigo como comprado, aparece aqui.") : t("Adiciona o primeiro artigo no campo acima.")}</p></div> : (
          <div className={shoppingMode ? "items-list supermarket-list" : "items-list"}>{(shoppingMode && filter === "all" ? [...visibleItems].sort((a, b) => CATEGORIES.findIndex(cat => cat.id === a.category) - CATEGORIES.findIndex(cat => cat.id === b.category)) : visibleItems).map(item => {
            const cat = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[5];
            return <article className={`shopping-item ${item.done ? "is-done" : ""}`} key={item._id}>
              <button className={`check-button ${item.done ? "checked" : ""}`} onClick={() => updateItem(item, { done: !item.done })} aria-label={item.done ? t("Marcar como por comprar") : t("Marcar como comprado")}>{item.done && <Check size={17}/>}</button>
              <div className="item-copy"><span className="item-name">{item.name}</span><span className="item-meta"><span>{cat.emoji} {t(cat.label)}</span><span className="meta-dot">·</span><span>{t("Qtd.")} {item.quantity}</span></span></div>
              <button className="delete-button" onClick={() => deleteItem(item)} aria-label={`${t("Remover")} ${item.name}`}><Trash2 size={17}/></button>
            </article>;
          })}</div>
        )}
        {doneItems.length > 0 && !showDone && !shoppingMode && <button className="clear-done" onClick={clearDone}><CheckCheck size={16}/> {t("Limpar artigos comprados")}</button>}
        {items.length > 0 && !shoppingMode && <button type="button" className="clear-all-items" onClick={clearAllItems}><Trash2 size={16}/> {t("Remover todos os produtos")}</button>}
      </section>
      {!shoppingMode && <div className="purchased-dock">
        <button type="button" className={showDone ? "purchased-dock-button active" : "purchased-dock-button"} onClick={() => { setShowDone(!showDone); document.querySelector(".items-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
          <span>{showDone ? t("Ver por comprar") : t("Ver comprados")} ({doneItems.length})</span><ChevronDown size={19} className={showDone ? "dock-chevron rotated" : "dock-chevron"}/>
        </button>
      </div>}
      </>}
      {activeTab === "receipts" && <section className="receipts-section">
        <div className="receipts-heading"><div><span className="eyebrow">ARQUIVO PARTILHADO</span><h1>{t("Faturas de compras")}</h1><p>{t("Comprovativos acessíveis a todos os membros desta lista.")}</p></div></div>
        <form className="receipt-form" onSubmit={addReceipt}>
          <h2><Upload size={18}/> Adicionar fatura</h2>
          <label htmlFor="receipt-store">{t("Supermercado")}</label><input id="receipt-store" value={receiptStore} onChange={e => setReceiptStore(e.target.value)} placeholder="Ex.: Continente, Lidl, Pingo Doce" maxLength={120} required/>
          <div className="receipt-form-grid"><div><label htmlFor="receipt-date">{t("Data da compra")}</label><input id="receipt-date" type="date" value={receiptDate} onChange={e => setReceiptDate(e.target.value)} required/></div><div><label htmlFor="receipt-total">{t("Total (€)")}</label><input id="receipt-total" type="number" min="0" step="0.01" value={receiptTotal} onChange={e => setReceiptTotal(e.target.value)} placeholder="0,00" required/></div></div>
          <label htmlFor="receipt-notes">{t("Notas (opcional")}</label><textarea id="receipt-notes" value={receiptNotes} onChange={e => setReceiptNotes(e.target.value)} maxLength={1000} placeholder="Ex.: compras da semana, IVA, descontos…"/>
          <label className="receipt-file-label" htmlFor="receipt-file"><FileText size={17}/><span>{receiptFile ? receiptFile.name : "Anexar fotografia ou PDF"}</span><small>{t("Máx. 10 MB")}</small></label><input className="receipt-file-input" id="receipt-file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e => { const file = e.target.files?.[0] || null; setReceiptFile(file); setReceiptExtraction(null); if (file) void extractReceiptData(file); }}/>
          {receiptExtractBusy && <p className="receipt-ai-hint receipt-ai-progress"><LoaderCircle size={16} className="spin"/> A analisar a fatura automaticamente…</p>}
          <p className="receipt-ai-hint">A IA tenta identificar o supermercado, a data, o total, o IVA e os artigos. Revê sempre as sugestões antes de guardar.</p>
          {receiptExtraction && <div className="receipt-extraction-preview" role="status">
            <strong><Check size={16}/> Sugestões extraídas — confirma os campos acima</strong>
            {receiptExtraction.vatTotal !== null && receiptExtraction.vatTotal !== undefined && <span>IVA identificado: €{Number(receiptExtraction.vatTotal).toFixed(2)}</span>}
            {receiptExtraction.items.length > 0 && <div><span>Artigos identificados ({receiptExtraction.items.length})</span><ul>{receiptExtraction.items.slice(0,12).map((item,index) => <li key={index}>{item.name}{Number.isFinite(Number(item.total)) ? " — €"+Number(item.total).toFixed(2) : ""}</li>)}</ul>{receiptExtraction.items.length > 12 && <small>Mais {receiptExtraction.items.length - 12} artigos incluídos nas notas.</small>}</div>}
            {receiptExtraction.warnings.map((warning,index) => <small key={index}>{warning}</small>)}
          </div>}
          <button className="primary-button" type="submit" disabled={receiptBusy}>{receiptBusy ? <LoaderCircle size={17} className="spin"/> : <Plus size={17}/>} Guardar fatura</button>
        </form>
        <div className="receipt-list-heading"><h2>{t("Faturas partilhadas")}</h2><span>{receipts.length} {receipts.length === 1 ? "fatura" : "faturas"}</span></div>
        {receipts.length === 0 ? <div className="empty-state"><span className="empty-illustration">🧾</span><h3>{t("Ainda não há faturas")}</h3><p>Adiciona o primeiro comprovativo para ficar disponível a toda a família.</p></div> : <div className="receipt-list">{receipts.map(receipt => <article className="receipt-card" key={receipt.id}><div className="receipt-card-icon"><Receipt size={21}/></div><div className="receipt-card-main"><strong>{receipt.storeName}</strong><span>{new Date(receipt.purchasedAt + "T12:00:00").toLocaleDateString("pt-PT")} · {receipt.memberName || "Membro"}</span>{receipt.notes && <p>{receipt.notes}</p>}</div><div className="receipt-card-side"><strong>{Number(receipt.total).toLocaleString("pt-PT",{style:"currency",currency:"EUR"})}</strong>{receipt.filePath && <button type="button" onClick={() => openReceipt(receipt)} aria-label="Abrir comprovativo"><ExternalLink size={17}/></button>}<button type="button" onClick={() => removeReceipt(receipt)} aria-label="Apagar fatura"><Trash2 size={16}/></button></div></article>)}</div>}
      </section>}
      <footer className="app-footer"><span><Leaf size={15}/> {t("Menos esquecimentos, mais tempo juntos.")}</span><button onClick={() => { if (window.confirm(t("Sair desta lista neste dispositivo? A lista partilhada não será apagada."))) { localStorage.removeItem("lista-familia-code"); setListCode(""); setList(null); setItems([]); } }}>{t("Sair da lista")}</button></footer>
      {importPreview.length > 0 && <div className="modal-backdrop" onClick={() => !importBusy && setImportPreview([])}><section className="share-modal import-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="import-title"><button className="modal-close" onClick={() => !importBusy && setImportPreview([])} aria-label={t("Fechar")}><X size={20}/></button><div className="share-graphic"><ShoppingBasket size={28}/></div><h2 id="import-title">{t("Confirmar produtos")}</h2><p>{importSource === "photo" ? "Revê os produtos reconhecidos na fotografia." : "Revê os produtos reconhecidos por voz."} Podes corrigir os nomes e quantidades antes de adicionar.</p><div className="import-preview-list">{importPreview.map((item, index) => <div className="import-preview-row" key={index}><input aria-label={`Produto ${index + 1}`} value={item.name} maxLength={100} onChange={e => editPreviewItem(index, { name: e.target.value })}/><input aria-label={`Quantidade de ${item.name}`} type="number" min="1" max="999" value={item.quantity} onChange={e => editPreviewItem(index, { quantity: e.target.value })}/><button type="button" aria-label={`Remover ${item.name}`} onClick={() => setImportPreview(previous => previous.filter((_, i) => i !== index))}><X size={17}/></button></div>)}</div>{importError && <p className="error-message">{importError}</p>}<button className="primary-button" disabled={importBusy || !importPreview.some(item => item.name.trim())} onClick={confirmImport}>{importBusy ? <LoaderCircle className="spin" size={17}/> : <Check size={17}/>} {importBusy ? "A adicionar…" : `Adicionar ${importPreview.length} produtos`}</button><button className="secondary-button" disabled={importBusy} onClick={() => setImportPreview([])}>{t("Cancelar")}</button></section></div>}
      {showShare && <div className="modal-backdrop" onClick={() => setShowShare(false)}><section className="share-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="share-title"><button className="modal-close" onClick={() => setShowShare(false)} aria-label={t("Fechar")}><X size={20}/></button><div className="share-graphic"><Users size={28}/></div><h2 id="share-title">{t("A lista é melhor em família")}</h2><p>{t("Mostra este QR Code a quem queres convidar. Ao digitalizar, o convite abre a Listora com esta lista pronta a entrar.")}</p><div className="invite-qr"><QRCodeSVG value={inviteUrl} size={208} level="H" includeMargin/><span>{t("Digitaliza com a câmara para entrar na lista")}</span></div><button className="primary-button" onClick={copyInviteLink}><Copy size={17}/> Copiar link de convite</button><div className="share-code-box"><span>{t("CÓDIGO DA LISTA")}</span><strong>{list.shareCode}</strong></div><button className="primary-button" onClick={shareListCode}>{typeof navigator.share === "function" ? <Users size={17}/> : <Copy size={17}/>} {t(typeof navigator.share === "function" ? "Partilhar código" : "Copiar código")}</button>{typeof navigator.share === "function" && <button className="secondary-button" onClick={copyListCode}><Clipboard size={17}/> {t("Copiar apenas o código")}</button>}<p className="share-note"><CircleHelp size={14}/> {t("Qualquer pessoa com o código pode aceder à lista. Partilha apenas com pessoas de confiança.")}</p></section></div>}
      {toast && <div className="toast"><Check size={16}/>{toast}</div>}
      {error && <button className="error-toast" onClick={() => setError("")}>{error}<X size={15}/></button>}
    </main>
  );
}