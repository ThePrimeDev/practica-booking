// Cloudflare Pages Function: /api/*  (D1 binding: DB, secret: ADMIN_KEY)
// Identity without passwords: each student has a secret personal link (token). The group leader
// has an admin key. The teacher just opens the plain link (read-only).
import schedule from "../../public/schedule.json";

const LIMITS = { perSlot: 5, hoursPerWeek: 3 };
const TZ = "Europe/Bucharest";
// Multi-period blocks (e.g. 3-hour Informatica) are bookable one period at a time: every period is its own slot.
const UNITS = schedule.lessons.flatMap((l) => Array.from({ length: l.len }, (_, i) => ({ ...l, id: `${l.d}-${l.p + i}`, p: l.p + i, len: 1 })));
const LESSONS = Object.fromEntries(UNITS.map((l) => [l.id, l]));
const PERIOD = Object.fromEntries(schedule.periods.map((p) => [p.n, p]));

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
class Fail extends Error { constructor(code, status = 400) { super(code); this.code = code; this.status = status; } }

// ---------- date helpers ----------
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (s, n) => { const d = new Date(s + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const isMonday = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(s + "T00:00:00Z").getUTCDay() === 1 && iso(new Date(s + "T00:00:00Z")) === s;
const nowLocal = () => new Date().toLocaleString("sv-SE", { timeZone: TZ }).slice(0, 16); // "YYYY-MM-DD HH:MM" in Oradea
function defaultWeek() { // weekends -> show next week
  const t = nowLocal().slice(0, 10), dow = new Date(t + "T00:00:00Z").getUTCDay();
  return addDays(t, dow === 0 ? 1 : dow === 6 ? 2 : 1 - dow);
}
function checkWeek(w) {
  if (!isMonday(w)) throw new Fail("bad_week");
  if (addDays(w, 6) < schedule.validity.from || w > schedule.validity.to) throw new Fail("bad_week");
}
const started = (week, lesson) => `${addDays(week, lesson.d)} ${PERIOD[lesson.p].start}` <= nowLocal();

// ---------- auth ----------
const same = (a, b) => { // constant-time-ish compare
  a = String(a || ""); b = String(b || "");
  let r = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) r |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return r === 0;
};
async function whoAmI(req, env) {
  const isAdmin = !!env.ADMIN_KEY && same(req.headers.get("x-admin-key"), env.ADMIN_KEY);
  const tok = req.headers.get("x-token");
  const me = tok ? await env.DB.prepare("SELECT id, name FROM students WHERE token = ?").bind(tok).first() : null;
  return { isAdmin, me };
}
const newToken = () => { const b = crypto.getRandomValues(new Uint8Array(12)); return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };

// ---------- handlers ----------
async function getState(req, env, url) {
  const { isAdmin, me } = await whoAmI(req, env);
  const week = url.searchParams.get("week") || defaultWeek();
  checkWeek(week);
  const [signups, used, students] = await Promise.all([
    env.DB.prepare("SELECT s.slot, s.student_id AS studentId, st.name FROM signups s JOIN students st ON st.id = s.student_id WHERE s.week = ? ORDER BY s.created_at, st.name").bind(week).all(),
    env.DB.prepare("SELECT student_id AS id, SUM(hours) AS hours FROM signups WHERE week = ? GROUP BY student_id").bind(week).all(),
    isAdmin ? env.DB.prepare("SELECT id, name, token FROM students ORDER BY name").all() : null,
  ]);
  const hours = Object.fromEntries(used.results.map((r) => [r.id, r.hours]));
  return json({
    week, today: nowLocal().slice(0, 10), limits: LIMITS, isAdmin, me: me && { ...me, hours: hours[me.id] || 0 },
    signups: signups.results,
    students: students && students.results.map((s) => ({ ...s, hours: hours[s.id] || 0 })),
  });
}

async function signup(req, env) {
  const { isAdmin, me } = await whoAmI(req, env);
  const b = await req.json().catch(() => ({}));
  checkWeek(b.week);
  const lesson = LESSONS[b.slot];
  if (!lesson) throw new Fail("bad_slot");
  if (!lesson.signable) throw new Fail("not_signable");
  const sid = isAdmin ? +b.studentId : me?.id;
  if (!sid) throw new Fail(isAdmin ? "bad_student" : "unauthorized", isAdmin ? 400 : 401);
  if (!isAdmin && started(b.week, lesson)) throw new Fail("started", 403);
  const force = isAdmin && b.force === true;
  const r = await env.DB.prepare(
    `INSERT OR IGNORE INTO signups (week, slot, student_id, hours)
     SELECT ?1, ?2, ?3, ?4
     WHERE (SELECT COUNT(*) FROM signups WHERE week = ?1 AND slot = ?2) < ?5
       AND (SELECT COALESCE(SUM(hours), 0) FROM signups WHERE week = ?1 AND student_id = ?3) + ?4 <= ?6
       AND EXISTS (SELECT 1 FROM students WHERE id = ?3)`
  ).bind(b.week, b.slot, sid, lesson.len, force ? 999 : LIMITS.perSlot, force ? 999 : LIMITS.hoursPerWeek).run();
  if (!r.meta.changes) { // work out why
    if (!(await env.DB.prepare("SELECT 1 FROM students WHERE id = ?").bind(sid).first())) throw new Fail("bad_student");
    if (await env.DB.prepare("SELECT 1 FROM signups WHERE week = ? AND slot = ? AND student_id = ?").bind(b.week, b.slot, sid).first()) throw new Fail("already", 409);
    const c = await env.DB.prepare("SELECT COUNT(*) AS n FROM signups WHERE week = ? AND slot = ?").bind(b.week, b.slot).first();
    throw new Fail(c.n >= LIMITS.perSlot ? "full" : "quota", 409);
  }
  return json({ ok: true });
}

async function unsignup(req, env) {
  const { isAdmin, me } = await whoAmI(req, env);
  const b = await req.json().catch(() => ({}));
  checkWeek(b.week);
  const lesson = LESSONS[b.slot];
  if (!lesson) throw new Fail("bad_slot");
  const sid = isAdmin ? +b.studentId : me?.id;
  if (!sid) throw new Fail(isAdmin ? "bad_student" : "unauthorized", isAdmin ? 400 : 401);
  if (!isAdmin && started(b.week, lesson)) throw new Fail("started", 403);
  await env.DB.prepare("DELETE FROM signups WHERE week = ? AND slot = ? AND student_id = ?").bind(b.week, b.slot, sid).run();
  return json({ ok: true });
}

async function adminStudents(req, env, seg) {
  const { isAdmin } = await whoAmI(req, env);
  if (!isAdmin) throw new Fail("unauthorized", 401);
  const [, id, action] = seg;
  if (req.method === "POST" && !id) { // add one or many: { names: ["A", "B"] }
    const b = await req.json().catch(() => ({}));
    const names = [...new Set((b.names || []).map((n) => String(n).trim().replace(/\s+/g, " ")).filter(Boolean))].slice(0, 100);
    if (!names.length) throw new Fail("name_required");
    const added = [];
    for (const n of names) {
      const r = await env.DB.prepare("INSERT OR IGNORE INTO students (name, token) VALUES (?, ?)").bind(n.slice(0, 60), newToken()).run();
      if (r.meta.changes) added.push(n);
    }
    return json({ ok: true, added });
  }
  if (!+id) throw new Fail("bad_student");
  if (req.method === "DELETE") {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM signups WHERE student_id = ?").bind(+id),
      env.DB.prepare("DELETE FROM students WHERE id = ?").bind(+id),
    ]);
    return json({ ok: true });
  }
  if (req.method === "POST" && action === "token") { // invalidate the old link, issue a new one
    await env.DB.prepare("UPDATE students SET token = ? WHERE id = ?").bind(newToken(), +id).run();
    return json({ ok: true });
  }
  if (req.method === "POST" && action === "rename") {
    const b = await req.json().catch(() => ({}));
    const n = String(b.name || "").trim().replace(/\s+/g, " ").slice(0, 60);
    if (!n) throw new Fail("name_required");
    const r = await env.DB.prepare("UPDATE OR IGNORE students SET name = ? WHERE id = ?").bind(n, +id).run();
    if (!r.meta.changes) throw new Fail("exists", 409);
    return json({ ok: true });
  }
  throw new Fail("not_found", 404);
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const seg = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  try {
    if (!env.DB) throw new Fail("no_database", 500);
    const m = request.method;
    if (seg[0] === "state" && m === "GET") return await getState(request, env, url);
    if (seg[0] === "signup" && m === "POST") return await signup(request, env);
    if (seg[0] === "unsignup" && m === "POST") return await unsignup(request, env);
    if (seg[0] === "students") return await adminStudents(request, env, seg);
    throw new Fail("not_found", 404);
  } catch (e) {
    if (e instanceof Fail) return json({ error: e.code }, e.status);
    return json({ error: "server", message: String(e.message || e) }, 500);
  }
}
