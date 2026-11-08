// Pulls one teacher's weekly timetable from the public EduPage of Colegiul "Mihai Eminescu"
// (same endpoints as ../eminescu-orar/functions/api/timetable.js) and writes public/schedule.json.
// Usage: node scripts/build-schedule.mjs ["Bolea Cristina"]
import { writeFileSync } from "node:fs";

const SCHOOL = "https://eminescu.edupage.org";
const TEACHER = process.argv[2] || "Bolea Cristina";
const FALLBACK_TT = "70";
const H = { "content-type": "application/json; charset=UTF-8", origin: SCHOOL, referer: SCHOOL + "/" };
// Subjects the student teachers may NOT take over (matched on the full subject name, lower-case).
const NOT_SIGNABLE = [/dezvoltare personala/];

async function currentTtNum() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const year = +today.slice(0, 4) - (today.slice(5, 7) < "08" ? 1 : 0);
    const r = await fetch(`${SCHOOL}/rpr/server/maindbi.js?__func=mainDBIAccessor`, {
      method: "POST", headers: H,
      body: JSON.stringify({ __args: [null, year, { vt_filter: { datefrom: today, dateto: today } },
        { op: "fetch", needed_part: { dates: ["tt_num", "tt_day"] }, needed_combos: {} }], __gsh: "00000000" }),
    });
    const j = await r.json();
    return j.r.tables.find((t) => t.id === "dates").data_rows[0]?.tt_num || FALLBACK_TT;
  } catch { return FALLBACK_TT; }
}

const tt = await currentTtNum();
const res = await fetch(`${SCHOOL}/timetable/server/regulartt.js?__func=regularttGetData`, {
  method: "POST", headers: H, body: JSON.stringify({ __args: [null, String(tt)], __gsh: "00000000" }),
});
if (!res.ok) throw new Error("EduPage returned " + res.status);
const json = await res.json();
const T = {};
for (const t of json.r.dbiAccessorRes.tables) if (t.data_rows) T[t.id] = Object.fromEntries(t.data_rows.map((r) => [r.id, r]));
const globals = Object.values(T.globals)[0];

const teacher = Object.values(T.teachers).find((t) => t.short === TEACHER);
if (!teacher) throw new Error(`Teacher "${TEACHER}" not found`);

const lessons = [];
for (const card of Object.values(T.cards)) {
  if (!card.days || !card.days.includes("1")) continue;
  const l = T.lessons[card.lessonid];
  if (!l || !l.teacherids.includes(teacher.id)) continue;
  const subj = T.subjects[l.subjectid] || {};
  const cls = T.classes[l.classids[0]] || {};
  const groups = l.groupids.map((g) => T.groups[g]).filter((g) => g && !g.entireclass).map((g) => g.name);
  const d = card.days.indexOf("1"), p = +card.period;
  lessons.push({
    id: `${d}-${p}`, d, p, len: l.durationperiods || 1,
    subject: subj.name, short: subj.short, class: cls.name, color: cls.color,
    group: [...new Set(groups)].join(", "),
    room: card.classroomids.map((r) => T.classrooms[r]?.short).filter(Boolean).join(", "),
    signable: !NOT_SIGNABLE.some((re) => re.test((subj.name || "").toLowerCase())),
  });
}
lessons.sort((a, b) => a.d - b.d || a.p - b.p);

const out = {
  teacher: teacher.short,
  school: globals.settings?.m_strSchoolName || 'COLEGIUL NATIONAL "MIHAI EMINESCU", ORADEA, BIHOR',
  generated: new Date().toISOString(),
  validity: { from: "2026-09-28", to: "2027-07-31" }, // from the footer of the EduPage timetable
  periods: Object.values(T.periods).map((p) => ({ n: +p.period, start: p.starttime, end: p.endtime })),
  days: Object.values(T.days).map((d) => d.name),
  lessons,
};
writeFileSync(new URL("../public/schedule.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(`${out.teacher}: ${lessons.length} lessons -> public/schedule.json`);
