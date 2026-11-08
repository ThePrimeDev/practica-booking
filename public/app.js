"use strict";
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---------------- i18n (hu for the students, ro for the teacher) ----------------
const STR = {
  hu: {
    prev: "Előző hét", next: "Következő hét", thisWeek: "Ez a hét", weekThis: "Ez a hét", weekNext: "Következő hét", weekPrev: "Előző hét",
    grid: "Táblázat", list: "Lista", admin: "Admin", adminOut: "Kilépés az adminból",
    me: (n) => `Belépve: ${n}`, viewer: "Csak megtekintés",
    viewerNote: "Csak megtekintés. A beiratkozáshoz nyisd meg a csoportvezetőtől kapott személyes linkedet.",
    badToken: "Ez a személyes link már nem érvényes. Kérj újat a csoportvezetőtől.",
    quota: (h, m) => `${h}/${m} óra ezen a héten`, quotaDone: (m) => `Kész: ${m}/${m} óra ezen a héten`,
    people: (n, m) => `Beiratkozottak (${n}/${m})`, nobody: "Még senki.", you: "te",
    join: "Beiratkozom", leave: "Lemondom", remove: "Töröl", close: "Bezár",
    started: "Ez az óra már elkezdődött, nem módosítható.", full: "Az óra betelt.", notSignable: "Erre az órára nem lehet beiratkozni.",
    notYou: "Beiratkozáshoz nyisd meg a személyes linkedet.",
    addFor: "Diák hozzáadása", add: "Hozzáad", pick: "Válassz diákot…",
    forceAsk: "Ez átlépi a limitet (óraszám vagy létszám). Mégis hozzáadod?",
    joined: "Beiratkoztál ✔", left: "Lemondtad", done: "Kész ✔",
    legend: "Fekete keret = te vagy beírva · csíkos szürke = ide nem lehet jelentkezni · halvány = már elkezdődött · a fehér mezők üresek.",
    full2: "teli",
    // admin
    admTitle: "Csoportvezetői panel", admWeek: (w) => `Órák a kiválasztott héten (${w})`,
    student: "Diák", hours: "Óra", linkCopy: "Link másolása", linkNew: "Új link", rename: "Átnevez", del: "Törlés",
    copied: "Link kimásolva", newLinkAsk: "Új linket kap, a régi link érvénytelen lesz. Folytatod?",
    delAsk: (n) => `${n} törlése a beiratkozásaival együtt?`, renameAsk: "Új név:",
    addStudents: "Diákok hozzáadása", addHint: "Egy sor = egy diák", addBtn: "Hozzáadás",
    teacherLink: "Link a tanárnőnek (csak megtekintés)", keyAsk: "Admin kulcs:", keyBad: "Hibás admin kulcs.",
    noStudents: "Még nincs diák. Add hozzá őket lent.",
    err: { unauthorized: "Nincs jogosultságod ehhez.", bad_week: "Ez a hét nem választható.", bad_slot: "Ismeretlen óra.", not_signable: "Erre az órára nem lehet beiratkozni.",
      started: "Az óra már elkezdődött.", full: "Az óra betelt (max 5 fő).", quota: "Elérted a heti 3 órát.", already: "Már be vagy iratkozva.",
      bad_student: "Ismeretlen diák.", name_required: "Adj meg egy nevet.", exists: "Ilyen nevű diák már van.", server: "Szerverhiba, próbáld újra.", no_database: "Az adatbázis nincs beállítva.", net: "Nincs kapcsolat." },
    days: ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek"], dshort: ["H", "K", "Sze", "Cs", "P"],
  },
  ro: {
    prev: "Săptămâna anterioară", next: "Săptămâna următoare", thisWeek: "Săptămâna curentă", weekThis: "Săptămâna aceasta", weekNext: "Săptămâna viitoare", weekPrev: "Săptămâna trecută",
    grid: "Tabel", list: "Listă", admin: "Admin", adminOut: "Ieși din admin",
    me: (n) => `Autentificat: ${n}`, viewer: "Doar vizualizare",
    viewerNote: "Doar vizualizare. Pentru înscriere, deschide linkul personal primit de la liderul grupei.",
    badToken: "Acest link personal nu mai este valabil. Cere unul nou liderului grupei.",
    quota: (h, m) => `${h}/${m} ore săptămâna aceasta`, quotaDone: (m) => `Gata: ${m}/${m} ore săptămâna aceasta`,
    people: (n, m) => `Înscriși (${n}/${m})`, nobody: "Încă nimeni.", you: "tu",
    join: "Mă înscriu", leave: "Renunț", remove: "Șterge", close: "Închide",
    started: "Ora a început deja, nu se mai poate modifica.", full: "Ora este completă.", notSignable: "La această oră nu se poate face înscriere.",
    notYou: "Pentru înscriere deschide linkul tău personal.",
    addFor: "Adaugă student", add: "Adaugă", pick: "Alege studentul…",
    forceAsk: "Depășește limita (ore sau locuri). Adaugi oricum?",
    joined: "Te-ai înscris ✔", left: "Ai renunțat", done: "Gata ✔",
    legend: "Contur negru = ești înscris · gri cu dungi = nu se poate înscrie · estompat = a început deja · câmpurile albe sunt libere.",
    full2: "complet",
    admTitle: "Panou lider grupă", admWeek: (w) => `Ore în săptămâna aleasă (${w})`,
    student: "Student", hours: "Ore", linkCopy: "Copiază link", linkNew: "Link nou", rename: "Redenumește", del: "Șterge",
    copied: "Link copiat", newLinkAsk: "Primește un link nou, cel vechi nu va mai funcționa. Continui?",
    delAsk: (n) => `Ștergi ${n} împreună cu înscrierile?`, renameAsk: "Nume nou:",
    addStudents: "Adaugă studenți", addHint: "Un rând = un student", addBtn: "Adaugă",
    teacherLink: "Link pentru doamna profesoară (doar vizualizare)", keyAsk: "Cheie admin:", keyBad: "Cheie admin greșită.",
    noStudents: "Nu există studenți. Adaugă-i mai jos.",
    err: { unauthorized: "Nu ai drepturi pentru asta.", bad_week: "Această săptămână nu este disponibilă.", bad_slot: "Oră necunoscută.", not_signable: "La această oră nu se poate face înscriere.",
      started: "Ora a început deja.", full: "Ora este completă (max. 5).", quota: "Ai atins limita de 3 ore pe săptămână.", already: "Ești deja înscris.",
      bad_student: "Student necunoscut.", name_required: "Introdu un nume.", exists: "Există deja un student cu acest nume.", server: "Eroare de server, încearcă din nou.", no_database: "Baza de date nu este configurată.", net: "Fără conexiune." },
    days: ["Luni", "Marți", "Miercuri", "Joi", "Vineri"], dshort: ["L", "Ma", "Mi", "J", "V"],
  },
};

// ---------------- state ----------------
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} },
};
const S = { lang: "hu", view: "grid", week: null, st: null, sched: null, open: null, badToken: false };
const T = () => STR[S.lang];

// one-off URL params: ?t=<personal token>  ?admin=<key>  ?lang=ro
(() => {
  const q = new URLSearchParams(location.search);
  if (q.get("t")) store.set("tk", q.get("t"));
  if (q.get("admin")) store.set("ak", q.get("admin"));
  if (q.get("lang") && STR[q.get("lang")]) store.set("lang", q.get("lang"));
  if ([...q.keys()].length) history.replaceState(null, "", location.pathname);
  S.lang = STR[store.get("lang")] ? store.get("lang") : "ro";
  S.view = store.get("view") || (innerWidth < 760 ? "list" : "grid");
})();

// ---------------- helpers ----------------
const addDays = (s, n) => { const d = new Date(s + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const nowLocal = () => new Date().toLocaleString("sv-SE", { timeZone: "Europe/Bucharest" }).slice(0, 16);
const fmtT = (s) => s.replace(/^0/, "").replace(":", ".");
const fmtD = (s, o) => new Intl.DateTimeFormat(S.lang, { timeZone: "UTC", ...o }).format(new Date(s + "T00:00:00Z"));
const dm = (s) => `${s.slice(8)}.${s.slice(5, 7)}.`;
const lighten = (hex) => { // same pastel look as the aSc export: 50% towards white
  const n = parseInt((hex || "#cccccc").slice(1), 16);
  return "#" + [n >> 16, (n >> 8) & 255, n & 255].map((c) => Math.round(c + (255 - c) * 0.5).toString(16).padStart(2, "0")).join("");
};
const lessonById = (id) => S.sched.lessons.find((l) => l.id === id);
const startedL = (l) => `${addDays(S.week, l.d)} ${S.sched.periods.find((p) => p.n === l.p).start}` <= nowLocal();
const endTime = (l) => S.sched.periods.find((p) => p.n === l.p + l.len - 1).end;
const startTime = (l) => S.sched.periods.find((p) => p.n === l.p).start;
const peopleOf = (id) => S.st.signups.filter((s) => s.slot === id);

function toast(msg, bad) {
  const el = $("#toast");
  el.textContent = msg; el.className = "show" + (bad ? " err" : "");
  clearTimeout(toast.t); toast.t = setTimeout(() => (el.className = ""), 2600);
}

async function api(path, body, method) {
  const h = { "content-type": "application/json" };
  if (store.get("tk")) h["x-token"] = store.get("tk");
  if (store.get("ak")) h["x-admin-key"] = store.get("ak");
  let r;
  try { r = await fetch("/api/" + path, { method: method || (body ? "POST" : "GET"), headers: h, body: body ? JSON.stringify(body) : undefined, cache: "no-store" }); }
  catch { throw { code: "net" }; }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw { code: j.error || "server", message: j.message };
  return j;
}
const errMsg = (e) => T().err[e.code] || e.message || e.code;

// ---------------- data ----------------
async function load(week) {
  try {
    const q = week ? "?week=" + week : "";
    S.st = await api("state" + q);
    S.week = S.st.week;
    S.badToken = !!store.get("tk") && !S.st.me;
    if (store.get("ak") && !S.st.isAdmin) { store.set("ak", null); toast(T().keyBad, true); }
  } catch (e) {
    if (e.code === "bad_week") return toast(errMsg(e), true);
    if (!S.st) $("#stage").innerHTML = `<p class="empty">${esc(errMsg(e))}</p>`;
    else toast(errMsg(e), true);
    return;
  }
  render();
}
const reload = () => load(S.week);

// ---------------- rendering ----------------
function render() {
  if (!S.sched || !S.st) return;
  const t = T(), st = S.st;
  document.documentElement.lang = S.lang;
  document.title = `${S.sched.teacher} · ${S.lang === "ro" ? "Orar practică" : "Gyakorlat órarend"}`;
  $("#teacher").textContent = S.sched.teacher;
  $("#school").textContent = S.sched.school;
  $("#adminBtn").textContent = st.isAdmin ? t.admin + " ⚙" : t.admin;
  $("#thisWeek").textContent = t.thisWeek;
  $("#prev").title = t.prev; $("#next").title = t.next;
  $("#views").children[0].textContent = t.grid; $("#views").children[1].textContent = t.list;
  document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.lang === S.lang));
  document.querySelectorAll("[data-view]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.view === S.view));

  const me = $("#me");
  me.className = "pill" + (st.isAdmin ? " admin" : st.me ? "" : " view");
  me.textContent = st.me ? t.me(st.me.name) : st.isAdmin ? t.admin : t.viewer;

  // week header
  const fri = addDays(S.week, 4), cur = st.today;
  const curMon = addDays(cur, -((new Date(cur + "T00:00:00Z").getUTCDay() + 6) % 7));
  const diff = Math.round((new Date(S.week) - new Date(curMon)) / 6048e5);
  $("#wkTitle").textContent = `${fmtD(S.week, { day: "numeric", month: "long" })} – ${fmtD(fri, { day: "numeric", month: "long", year: "numeric" })}`;
  $("#wkSub").textContent = diff === 0 ? t.weekThis : diff === 1 ? t.weekNext : diff === -1 ? t.weekPrev : "";
  $("#prev").disabled = addDays(S.week, -1) < S.sched.validity.from;
  $("#next").disabled = addDays(S.week, 7) > S.sched.validity.to;

  $("#notice").textContent = S.badToken ? t.badToken : !st.me && !st.isAdmin ? t.viewerNote : "";
  const q = $("#quota");
  if (st.me) {
    const m = st.limits.hoursPerWeek, h = st.me.hours;
    q.className = h >= m ? "done" : "";
    q.innerHTML = `<span class="meter">${Array.from({ length: m }, (_, i) => `<i class="${i < h ? "on" : ""}"></i>`).join("")}</span>` +
      esc(h >= m ? t.quotaDone(m) : t.quota(h, m));
  } else q.innerHTML = "";

  $("#stage").innerHTML = S.view === "grid" ? gridHTML() : listHTML();
  $("#legend").textContent = t.legend;
  if (S.open) renderSlot();
  if ($("#adm").open) renderAdmin();
}

function info(l) {
  const ppl = peopleOf(l.id), me = S.st.me;
  return {
    ppl, n: ppl.length, full: ppl.length >= S.st.limits.perSlot, off: !l.signable, past: startedL(l),
    mine: !!me && ppl.some((p) => p.studentId === me.id), date: addDays(S.week, l.d),
  };
}
const nameChips = (ppl) => ppl.map((p) => `<span class="nm${S.st.me && p.studentId === S.st.me.id ? " me" : ""}">${esc(p.name)}</span>`).join("");

function gridHTML() {
  const { periods, lessons } = S.sched, t = T(), cur = S.st.today;
  let h = `<div class="tt"><div style="grid-row:1;grid-column:1"></div>`;
  h += periods.map((p) => `<div class="ph" style="grid-row:1;grid-column:${p.n + 1}">${fmtT(p.start)} - ${fmtT(p.end)}</div>`).join("");
  const covered = new Set();
  lessons.forEach((l) => { for (let i = 0; i < l.len; i++) covered.add(`${l.d}-${l.p + i}`); });
  for (let d = 0; d < 5; d++) {
    const date = addDays(S.week, d);
    h += `<div class="dh${date === cur ? " today" : ""}" style="grid-row:${d + 2};grid-column:1">${esc(t.dshort[d])}<small>${dm(date)}</small></div>`;
    for (const p of periods) if (!covered.has(`${d}-${p.n}`)) h += `<div style="grid-row:${d + 2};grid-column:${p.n + 1}"></div>`;
  }
  for (const l of lessons) {
    const i = info(l);
    const cls = ["lc", i.off && "off", i.mine && "mine", i.full && "full", i.past && !i.off && "past"].filter(Boolean).join(" ");
    h += `<button class="${cls}" data-slot="${l.id}" style="--b:${lighten(l.color)};grid-row:${l.d + 2};grid-column:${l.p + 1}/span ${l.len}">` +
      `<div class="t"><b>${esc(l.short)}</b><span>${esc(l.room)}</span></div>` +
      `<div class="c">${esc(l.class)}</div>` +
      (l.group ? `<div class="g">${esc(l.group)}</div>` : "") +
      (i.off ? "" : `<div class="names">${nameChips(i.ppl)}</div><span class="cap">${i.full ? t.full2 + " · " : ""}${i.n}/${S.st.limits.perSlot}</span>`) + "</button>";
  }
  return h + "</div>";
}

function listHTML() {
  const t = T();
  let h = '<div class="list">';
  for (let d = 0; d < 5; d++) {
    const ls = S.sched.lessons.filter((l) => l.d === d);
    if (!ls.length) continue;
    const date = addDays(S.week, d);
    h += `<section class="day${date === S.st.today ? " today" : ""}"><h3>${esc(t.days[d])} <small>${dm(date)}</small></h3>`;
    for (const l of ls) {
      const i = info(l);
      const st = i.off ? "—" : i.mine ? "✔" : i.full ? t.full2 : `${i.n}/${S.st.limits.perSlot}`;
      h += `<button class="row${i.mine ? " mine" : ""}${i.off ? " off" : ""}${i.past && !i.off ? " past" : ""}" data-slot="${l.id}" style="--b:${lighten(l.color)}">` +
        `<span class="tm">${fmtT(startTime(l))}–${fmtT(endTime(l))}</span>` +
        `<span class="mid"><b>${esc(l.class)}</b><small>${esc(l.short)}${l.group ? " · " + esc(l.group) : ""} · ${esc(l.room)}</small></span>` +
        `<span class="st">${st}</span>` +
        (i.ppl.length && !i.off ? `<span class="names">${nameChips(i.ppl)}</span>` : "") + `</button>`;
    }
    h += "</section>";
  }
  return h + "</div>";
}

// ---------------- slot dialog ----------------
function openSlot(id) {
  const l = lessonById(id), i = info(l);
  if (i.off) return toast(T().notSignable, true);
  S.open = id; renderSlot();
  if (!$("#slot").open) $("#slot").showModal();
}
function renderSlot() {
  const l = lessonById(S.open), t = T(), st = S.st, i = info(l), me = st.me;
  const canEdit = st.isAdmin || !i.past;
  const canLeave = (p) => st.isAdmin || (me && p.studentId === me.id && !i.past);
  const mineFull = me && me.hours + l.len > st.limits.hoursPerWeek;
  let h = `<div class="dh2" style="--b:${lighten(l.color)}"><h2>${esc(l.short)} · ${esc(l.class)}${l.group ? " · " + esc(l.group) : ""}</h2>` +
    `<p>${esc(t.days[l.d])} ${dm(i.date)} · ${fmtT(startTime(l))}–${fmtT(endTime(l))} · ${esc(l.room)}${l.len > 1 ? ` · ${l.len} ${S.lang === "hu" ? "óra" : "ore"}` : ""}</p></div><div class="body">` +
    `<h4>${esc(t.people(i.n, st.limits.perSlot))}</h4>`;
  h += i.ppl.length
    ? `<ul class="ppl">${i.ppl.map((p) => `<li class="${me && p.studentId === me.id ? "me" : ""}"><span>${esc(p.name)}${me && p.studentId === me.id ? " (" + t.you + ")" : ""}</span>` +
      (canLeave(p) ? `<button data-rm="${p.studentId}">${me && p.studentId === me.id && !st.isAdmin ? t.leave : t.remove}</button>` : "") + `</li>`).join("")}</ul>`
    : `<p class="empty">${t.nobody}</p>`;
  if (i.past && !st.isAdmin) h += `<p class="warn">${t.started}</p>`;
  else if (me && !i.mine && i.full) h += `<p class="warn">${t.full}</p>`;
  else if (me && !i.mine && mineFull) h += `<p class="warn">${esc(t.err.quota)}</p>`;
  else if (!me && !st.isAdmin) h += `<p class="empty">${t.notYou}</p>`;
  if (st.isAdmin) {
    const free = (st.students || []).filter((s) => !i.ppl.some((p) => p.studentId === s.id));
    h += `<h4>${t.addFor}</h4><div class="add"><select id="addSel"><option value="">${t.pick}</option>` +
      free.map((s) => `<option value="${s.id}">${esc(s.name)} (${s.hours}/${st.limits.hoursPerWeek})</option>`).join("") +
      `</select><button class="primary" id="addBtn">${t.add}</button></div>`;
  }
  h += `</div><div class="foot"><button id="closeSlot">${t.close}</button>`;
  if (me && !i.mine && canEdit) h += `<button class="primary" id="joinBtn" ${i.full || mineFull ? "disabled" : ""}>${t.join}</button>`;
  h += `</div>`;
  $("#slot").innerHTML = h;
}

async function act(path, body, okMsg) {
  try { await api(path, body); if (okMsg) toast(okMsg); }
  catch (e) { toast(errMsg(e), true); await reload(); return false; }
  await reload(); return true;
}

$("#slot").addEventListener("click", async (e) => {
  const b = e.target.closest("button");
  if (e.target === $("#slot") || (b && b.id === "closeSlot")) return $("#slot").close();
  if (!b) return;
  const slot = S.open;
  if (b.id === "joinBtn") await act("signup", { week: S.week, slot }, T().joined);
  else if (b.dataset.rm) {
    const mine = S.st.me && +b.dataset.rm === S.st.me.id;
    await act("unsignup", { week: S.week, slot, studentId: +b.dataset.rm }, mine ? T().left : T().done);
  } else if (b.id === "addBtn") {
    const sid = +$("#addSel").value;
    if (!sid) return;
    try { await api("signup", { week: S.week, slot, studentId: sid }); toast(T().done); }
    catch (er) {
      if ((er.code === "full" || er.code === "quota") && confirm(T().forceAsk)) {
        try { await api("signup", { week: S.week, slot, studentId: sid, force: true }); toast(T().done); } catch (e2) { toast(errMsg(e2), true); }
      } else toast(errMsg(er), true);
    }
    await reload();
  }
});
$("#slot").addEventListener("close", () => (S.open = null));

// ---------------- admin dialog ----------------
const personalLink = (s) => `${location.origin}/?t=${s.token}`;
function renderAdmin() {
  const t = T(), st = S.st, m = st.limits.hoursPerWeek;
  const wk = `${dm(S.week)} – ${dm(addDays(S.week, 4))}`;
  const ta = $("#admNew") ? $("#admNew").value : "";
  let h = `<div class="dh2"><h2>${t.admTitle}</h2><p>${esc(t.admWeek(wk))}</p></div><div class="body">` +
    `<div class="share"><b>${t.teacherLink}</b><code>${location.origin}/?lang=ro</code><div><button data-copy="${location.origin}/?lang=ro">${t.linkCopy}</button></div></div>`;
  h += (st.students || []).length
    ? `<table class="st"><thead><tr><th>${t.student}</th><th>${t.hours}</th><th></th></tr></thead><tbody>` +
      st.students.map((s) => `<tr><td>${esc(s.name)}</td><td><span class="hrs ${s.hours >= m ? "ok" : s.hours === 0 ? "low" : ""}">${s.hours}/${m}</span></td>` +
        `<td class="act"><button data-copy="${esc(personalLink(s))}">${t.linkCopy}</button> <button data-newtok="${s.id}">${t.linkNew}</button> ` +
        `<button data-ren="${s.id}">${t.rename}</button> <button class="danger" data-del="${s.id}">${t.del}</button></td></tr>`).join("") + `</tbody></table>`
    : `<p class="empty">${t.noStudents}</p>`;
  h += `<h4>${t.addStudents}</h4><textarea id="admNew" placeholder="${t.addHint}">${esc(ta)}</textarea>` +
    `</div><div class="foot"><button id="admOut">${t.adminOut}</button><button class="primary" id="admAdd">${t.addBtn}</button><button id="admClose">${t.close}</button></div>`;
  $("#adm").innerHTML = h;
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); }
  catch { const x = document.createElement("textarea"); x.value = text; document.body.append(x); x.select(); document.execCommand("copy"); x.remove(); }
  toast(T().copied);
}
$("#adm").addEventListener("click", async (e) => {
  const b = e.target.closest("button"), st = S.st, t = T();
  if (e.target === $("#adm") || (b && b.id === "admClose")) return $("#adm").close();
  if (!b) return;
  const stu = (id) => st.students.find((s) => s.id === +id);
  try {
    if (b.dataset.copy) return copy(b.dataset.copy);
    if (b.id === "admOut") { store.set("ak", null); $("#adm").close(); return reload(); }
    if (b.id === "admAdd") {
      const names = $("#admNew").value.split("\n").map((x) => x.trim()).filter(Boolean);
      if (!names.length) return;
      await api("students", { names }); $("#admNew").value = ""; toast(t.done);
    } else if (b.dataset.newtok) { if (!confirm(t.newLinkAsk)) return; await api(`students/${b.dataset.newtok}/token`, {}); toast(t.done); }
    else if (b.dataset.del) { if (!confirm(t.delAsk(stu(b.dataset.del).name))) return; await api(`students/${b.dataset.del}`, null, "DELETE"); toast(t.done); }
    else if (b.dataset.ren) { const n = prompt(t.renameAsk, stu(b.dataset.ren).name); if (!n) return; await api(`students/${b.dataset.ren}/rename`, { name: n }); toast(t.done); }
    else return;
  } catch (er) { toast(errMsg(er), true); }
  await reload();
});

// ---------------- events ----------------
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.slot) openSlot(b.dataset.slot);
  else if (b.dataset.lang) { S.lang = b.dataset.lang; store.set("lang", S.lang); render(); }
  else if (b.dataset.view) { S.view = b.dataset.view; store.set("view", S.view); render(); }
  else if (b.id === "prev") load(addDays(S.week, -7));
  else if (b.id === "next") load(addDays(S.week, 7));
  else if (b.id === "thisWeek") load();
  else if (b.id === "adminBtn") {
    if (!S.st.isAdmin) {
      const k = prompt(T().keyAsk);
      if (!k) return;
      store.set("ak", k.trim());
      load(S.week).then(() => { if (S.st.isAdmin) { renderAdmin(); $("#adm").showModal(); } });
    } else { renderAdmin(); $("#adm").showModal(); }
  }
});
setInterval(() => { if (!document.hidden && S.st && !$("#adm").open) reload(); }, 30000);
document.addEventListener("visibilitychange", () => { if (!document.hidden && S.st && !$("#adm").open) reload(); });

(async () => {
  S.sched = await (await fetch("schedule.json")).json();
  // every period of a multi-hour block is its own bookable slot (same rule as the API)
  S.sched.lessons = S.sched.lessons.flatMap((l) => Array.from({ length: l.len }, (_, i) => ({ ...l, id: `${l.d}-${l.p + i}`, p: l.p + i, len: 1 })));
  await load();
})();
