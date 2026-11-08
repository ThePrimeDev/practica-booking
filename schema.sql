CREATE TABLE IF NOT EXISTS students (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE COLLATE NOCASE,
  token      TEXT NOT NULL UNIQUE,            -- secret in the student's personal link
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS signups (
  week       TEXT NOT NULL,                   -- Monday of the week, YYYY-MM-DD
  slot       TEXT NOT NULL,                   -- lesson id from schedule.json, "<day>-<period>"
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  hours      INTEGER NOT NULL,                -- lesson length in periods (counts toward the weekly quota)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (week, slot, student_id)
);
CREATE INDEX IF NOT EXISTS signups_student ON signups(student_id, week);
