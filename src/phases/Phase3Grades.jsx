import { useState, useEffect, useRef, useCallback } from 'react';
import { I, Av, Dot, Toggle, Spark, BarChart, Gauge, Donut } from '../shared.jsx';

const STUDENTS = [
  { id: 1, name: "Elena Vasquez",  av: "EV", col: "#6366F1" },
  { id: 2, name: "Ryan Okafor",    av: "RO", col: "#14B8A6" },
  { id: 3, name: "Mei Lin",        av: "ML", col: "#F59E0B" },
  { id: 4, name: "Ali Hassan",     av: "AH", col: "#10B981" },
  { id: 5, name: "Sophie Laurent", av: "SL", col: "#EC4899" },
  { id: 6, name: "Kenji Tanaka",   av: "KT", col: "#F97316" },
  { id: 7, name: "Priya Nair",     av: "PN", col: "#3B82F6" },
  { id: 8, name: "Marcus Webb",    av: "MW", col: "#0EA5E9" },
];

const GRADE_ITEMS = [
  { id: 1, catId: 1, name: "Module 1 Quiz",     type: "quiz",   max: 100, weight: 15, pass: 60 },
  { id: 2, catId: 1, name: "Module 2 Quiz",     type: "quiz",   max: 100, weight: 15, pass: 60 },
  { id: 3, catId: 2, name: "Assignment 1",       type: "assign", max: 100, weight: 20, pass: 50 },
  { id: 4, catId: 2, name: "Assignment 2",       type: "assign", max: 100, weight: 20, pass: 50 },
  { id: 5, catId: 3, name: "Midterm Exam",       type: "exam",   max: 100, weight: 30, pass: 65 },
  { id: 6, catId: 3, name: "Final Exam",         type: "exam",   max: 100, weight: 40, pass: 65 },
  { id: 7, catId: 4, name: "Participation",      type: "manual", max: 50,  weight: 10, pass: 25 },
];

const CATS = [
  { id: 1, name: "Quizzes",     weight: 30, agg: "Mean" },
  { id: 2, name: "Assignments", weight: 40, agg: "Mean" },
  { id: 3, name: "Exams",       weight: 70, agg: "Weighted Mean" },
  { id: 4, name: "Participation", weight: 10, agg: "Mean" },
];

const buildRaw = () => {
  const raw = {};
  STUDENTS.forEach(s => {
    raw[s.id] = {};
    GRADE_ITEMS.forEach(g => {
      const v = Math.floor(Math.random() * 45 + 50);
      raw[s.id][g.id] = v;
    });
  });
  // Ryan completed it all with A
  GRADE_ITEMS.forEach(g => { raw[2][g.id] = Math.floor(Math.random() * 10 + 89); });
  // Ali struggling
  GRADE_ITEMS.forEach(g => { raw[4][g.id] = Math.floor(Math.random() * 25 + 35); });
  return raw;
};

const INIT_GRADES = buildRaw();

const HIST_ITEMS = [
  { id: 1, ts: "2024-06-10 14:22", actor: "Sophia Chen",  student: "Elena Vasquez",  item: "Module 1 Quiz",   old: 72,  nw: 78,  reason: "Regrade after appeal" },
  { id: 2, ts: "2024-06-10 11:05", actor: "Marcus Rivera",student: "Kenji Tanaka",   item: "Final Exam",      old: null, nw: 88,  reason: "Initial entry" },
  { id: 3, ts: "2024-06-09 16:40", actor: "Sophia Chen",  student: "Mei Lin",        item: "Assignment 2",    old: 55,  nw: 63,  reason: "Manual correction" },
  { id: 4, ts: "2024-06-09 09:15", actor: "Aisha Patel",  student: "Sophie Laurent", item: "Midterm Exam",    old: null, nw: 91,  reason: "Initial entry" },
  { id: 5, ts: "2024-06-08 17:30", actor: "Marcus Rivera",student: "Ali Hassan",     item: "Module 2 Quiz",   old: 38,  nw: 40,  reason: "Extra credit applied" },
  { id: 6, ts: "2024-06-08 13:10", actor: "Sophia Chen",  student: "Ryan Okafor",    item: "Assignment 1",    old: 95,  nw: 97,  reason: "Regrade" },
  { id: 7, ts: "2024-06-07 10:55", actor: "Aisha Patel",  student: "Priya Nair",     item: "Participation",   old: null, nw: 42,  reason: "Initial entry" },
  { id: 8, ts: "2024-06-07 08:00", actor: "Marcus Rivera",student: "Marcus Webb",    item: "Final Exam",      old: 70,  nw: 74,  reason: "Grading error fix" },
];

const OVERVIEW_COURSES = [
  { id: 1, name: "Advanced React & TypeScript", enrolled: 142, completed: 89, avgGrade: 81, passRate: 87, dist: [4, 8, 14, 22, 31, 28, 18, 10, 7] },
  { id: 2, name: "Machine Learning Fundamentals", enrolled: 67, completed: 34, avgGrade: 74, passRate: 78, dist: [2, 4, 8, 10, 14, 12, 9, 5, 3] },
  { id: 3, name: "UX Design Masterclass",  enrolled: 89, completed: 71, avgGrade: 88, passRate: 94, dist: [1, 2, 4, 8, 12, 18, 22, 15, 7] },
  { id: 4, name: "Node.js & REST API Design", enrolled: 203, completed: 178, avgGrade: 85, passRate: 91, dist: [3, 5, 9, 15, 30, 42, 50, 35, 14] },
];

const INIT_SCALES = [
  { id: 1, name: "Standard Letter Grade", items: [ { label: "A+", min: 97 }, { label: "A",  min: 93 }, { label: "A-", min: 90 }, { label: "B+", min: 87 }, { label: "B",  min: 83 }, { label: "B-", min: 80 }, { label: "C+", min: 77 }, { label: "C",  min: 73 }, { label: "C-", min: 70 }, { label: "D",  min: 60 }, { label: "F",  min: 0 } ] },
  { id: 2, name: "Pass / Merit / Distinction", items: [ { label: "Distinction", min: 80 }, { label: "Merit", min: 65 }, { label: "Pass", min: 50 }, { label: "Fail", min: 0 } ] },
  { id: 3, name: "4.0 GPA Scale", items: [ { label: "4.0", min: 93 }, { label: "3.7", min: 90 }, { label: "3.3", min: 87 }, { label: "3.0", min: 83 }, { label: "2.7", min: 80 }, { label: "2.3", min: 77 }, { label: "2.0", min: 73 }, { label: "1.0", min: 60 }, { label: "0.0", min: 0 } ] },
];

// grade to letter helper
const toLetter = (pct) => {
  if (pct >= 97) return "A+"; if (pct >= 93) return "A"; if (pct >= 90) return "A-";
  if (pct >= 87) return "B+"; if (pct >= 83) return "B"; if (pct >= 80) return "B-";
  if (pct >= 77) return "C+"; if (pct >= 73) return "C"; if (pct >= 70) return "C-";
  if (pct >= 60) return "D"; return "F";
};

const gradeColor = (val, max, pass) => {
  const pct = (val / max) * 100;
  if (pct >= 90) return { bg: "rgba(16,185,129,.13)", color: "#10B981" };
  if (pct >= (pass / max) * 100 + 10) return { bg: "rgba(245,158,11,.1)", color: "#F59E0B" };
  if (pct >= (pass / max) * 100) return { bg: "rgba(99,102,241,.1)", color: "#6366F1" };
  return { bg: "rgba(239,68,68,.12)", color: "#EF4444" };
};

const calcAvg = (studentId, grades) => {
  const vals = GRADE_ITEMS.map(g => grades[studentId]?.[g.id]).filter(v => v != null);
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
};

const calcColAvg = (itemId, grades) => {
  const vals = STUDENTS.map(s => grades[s.id]?.[itemId]).filter(v => v != null);
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
};

// ── Inline-editable Gradebook cell ────────────────────────────────────────────
const GCell = ({ val, itemId, studentId, item, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(val ?? ""));
  const [flash, setFlash] = useState(false);
  const ref = useRef();

  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);

  const commit = () => {
    const n = Number(draft);
    if (!isNaN(n) && n >= 0 && n <= item.max) {
      if (n !== val) { onSave(studentId, itemId, n); setFlash(true); setTimeout(() => setFlash(false), 600); }
    } else { setDraft(String(val ?? "")); }
    setEditing(false);
  };

  const { bg, color } = val != null ? gradeColor(val, item.max, item.pass) : { bg: "transparent", color: "var(--text3)" };

  return (
    <div className={`gcell ${editing ? "gcell-edit" : ""} ${flash ? "cell-flash" : ""}`}
      style={{ background: editing ? undefined : bg, color }}
      onClick={() => { if (!editing) { setDraft(String(val ?? "")); setEditing(true); } }}>
      {editing
        ? <input ref={ref} value={draft} onChange={e => setDraft(e.target.value)}
            onBlur={commit} onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(String(val ?? "")); setEditing(false); } }} />
        : val != null ? val : <span style={{ color: "var(--text3)", fontSize: 11 }}>—</span>
      }
    </div>
  );
};

// ── Gradebook (Grader Report) ─────────────────────────────────────────────────
const GradebookView = () => {
  const [grades, setGrades] = useState(INIT_GRADES);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [filterCat, setFilterCat] = useState("all");
  const [showLetter, setShowLetter] = useState(false);
  const [selStudent, setSelStudent] = useState(null);

  const saveGrade = useCallback((sId, iId, val) => {
    setGrades(g => ({ ...g, [sId]: { ...g[sId], [iId]: val } }));
  }, []);

  const visItems = GRADE_ITEMS.filter(g => filterCat === "all" || g.catId === Number(filterCat));
  const filteredStudents = STUDENTS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const sorted = [...filteredStudents].sort((a, b) => {
    if (!sortBy) return 0;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "avg") return (calcAvg(b.id, grades) ?? 0) - (calcAvg(a.id, grades) ?? 0);
    const ia = grades[a.id]?.[sortBy] ?? -1, ib = grades[b.id]?.[sortBy] ?? -1;
    return ib - ia;
  });

  const colAvgs = {};
  visItems.forEach(g => { colAvgs[g.id] = calcColAvg(g.id, grades); });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "20px 24px" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
        {[
          { lbl: "Students",    val: STUDENTS.length, c: "var(--amber)" },
          { lbl: "Grade Items", val: GRADE_ITEMS.length, c: "var(--indigo)" },
          { lbl: "Class Avg",   val: Math.round(STUDENTS.reduce((n, s) => n + (calcAvg(s.id, grades) ?? 0), 0) / STUDENTS.length) + "%", c: "var(--teal)" },
          { lbl: "Pass Rate",   val: Math.round(STUDENTS.filter(s => (calcAvg(s.id, grades) ?? 0) >= 60).length / STUDENTS.length * 100) + "%", c: "var(--green)" },
          { lbl: "At Risk",     val: STUDENTS.filter(s => (calcAvg(s.id, grades) ?? 0) < 60).length, c: "var(--red)" },
        ].map(s => (
          <div className="scard" key={s.lbl}>
            <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase" }}>{s.lbl}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.c, fontFamily: "var(--mono)" }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 7, flex: 1 }}>
          <span style={{ padding: "0 11px", color: "var(--text3)" }}><I n="search" s={14} /></span>
          <input style={{ background: "none", border: "none", padding: "8px 8px", color: "var(--text)", fontSize: 13, outline: "none", flex: 1 }} placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="sel" style={{ width: 155, fontSize: 12.5 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">All Categories</option>
          {CATS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="sel" style={{ width: 130, fontSize: 12.5 }} value={sortBy || ""} onChange={e => setSortBy(e.target.value || null)}>
          <option value="">Default order</option>
          <option value="name">Sort: Name</option>
          <option value="avg">Sort: Average</option>
          {visItems.map(g => <option key={g.id} value={g.id}>Sort: {g.name}</option>)}
        </select>
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 7 }}>
          <span style={{ fontSize: 12, color: "var(--text2)", fontWeight: 600 }}>Letter grades</span>
          <div className={`tog ${showLetter ? "on" : ""}`} onClick={() => setShowLetter(!showLetter)} />
        </div>
        <button className="btn bg bsm"><I n="dl" s={13} />Export CSV</button>
      </div>

      {/* Alert */}
      {STUDENTS.filter(s => (calcAvg(s.id, grades) ?? 0) < 60).length > 0 && (
        <div style={{ padding: "10px 14px", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.18)", borderRadius: 8, fontSize: 13, color: "#FCA5A5", display: "flex", alignItems: "center", gap: 8 }}>
          <I n="info" s={14} />
          <strong>{STUDENTS.filter(s => (calcAvg(s.id, grades) ?? 0) < 60).length} student(s)</strong> are below the pass threshold (60%). Click cells to override grades.
        </div>
      )}

      {/* Spreadsheet */}
      <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)" }}>
        <div style={{ minWidth: "max-content" }}>
          {/* Header row */}
          <div style={{ display: "flex", position: "sticky", top: 0, zIndex: 10, background: "var(--bg2)", borderBottom: "2px solid var(--border2)" }}>
            <div className="gcell gcell-name" style={{ background: "var(--bg2)", fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: ".06em", textTransform: "uppercase", borderRight: "2px solid var(--border2)" }}>
              Student ({sorted.length})
            </div>
            {visItems.map(item => (
              <div key={item.id} className="gcell gcell-hdr" onClick={() => setSortBy(item.id)} style={{ cursor: "pointer" }}>
                <span style={{ fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 78, display: "block", textAlign: "center" }}>{item.name}</span>
                <span style={{ fontSize: 10, color: "var(--text3)" }}>{item.weight}% · /{item.max}</span>
              </div>
            ))}
            <div className="gcell gcell-hdr" style={{ minWidth: 100, width: 100, cursor: "pointer" }} onClick={() => setSortBy("avg")}>
              <span style={{ fontSize: 11, fontWeight: 700 }}>Average</span>
              <span style={{ fontSize: 10, color: "var(--text3)" }}>Weighted</span>
            </div>
            <div className="gcell gcell-hdr" style={{ minWidth: 72, width: 72 }}>
              <span style={{ fontSize: 11, fontWeight: 700 }}>Letter</span>
            </div>
          </div>

          {/* Data rows */}
          {sorted.map((student, ri) => {
            const avg = calcAvg(student.id, grades);
            const { bg: avgBg, color: avgColor } = avg != null ? gradeColor(avg, 100, 60) : { bg: "transparent", color: "var(--text3)" };
            return (
              <div key={student.id} style={{ display: "flex", background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,.015)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,.04)"}
                onMouseLeave={e => e.currentTarget.style.background = ri % 2 === 0 ? "transparent" : "rgba(255,255,255,.015)"}>
                <div className="gcell gcell-name" style={{ borderRight: "2px solid var(--border2)" }}>
                  <Av i={student.av} c={student.col} sz={24} />
                  <span style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{student.name}</span>
                </div>
                {visItems.map(item => (
                  <GCell key={item.id} val={grades[student.id]?.[item.id]} itemId={item.id} studentId={student.id} item={item} onSave={saveGrade} />
                ))}
                <div className="gcell" style={{ minWidth: 100, width: 100, background: avgBg, color: avgColor, fontWeight: 700 }}>
                  {avg != null ? `${avg}%` : "—"}
                </div>
                <div className="gcell" style={{ minWidth: 72, width: 72, fontWeight: 700, color: avg != null ? (avg >= 90 ? "var(--green)" : avg >= 60 ? "var(--amber)" : "var(--red)") : "var(--text3)" }}>
                  {avg != null ? (showLetter ? toLetter(avg) : `${avg >= 90 ? "A" : avg >= 80 ? "B" : avg >= 70 ? "C" : avg >= 60 ? "D" : "F"}`) : "—"}
                </div>
              </div>
            );
          })}

          {/* Column averages footer */}
          <div style={{ display: "flex", background: "var(--bg2)", borderTop: "2px solid var(--border2)" }}>
            <div className="gcell gcell-name" style={{ background: "var(--bg2)", borderRight: "2px solid var(--border2)", fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: ".05em", textTransform: "uppercase" }}>
              Class Average
            </div>
            {visItems.map(item => {
              const avg = colAvgs[item.id];
              const { bg, color } = avg != null ? gradeColor(avg, item.max, item.pass) : { bg: "transparent", color: "var(--text3)" };
              return (
                <div key={item.id} className="gcell gcell-avg" style={{ background: bg, color, fontWeight: 700 }}>
                  {avg ?? "—"}
                </div>
              );
            })}
            <div className="gcell gcell-avg" style={{ minWidth: 100, width: 100 }}>
              {Math.round(STUDENTS.reduce((n, s) => n + (calcAvg(s.id, grades) ?? 0), 0) / STUDENTS.length)}%
            </div>
            <div className="gcell gcell-avg" style={{ minWidth: 72, width: 72 }}>—</div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center" }}>
        💡 Click any grade cell to edit inline · Press Enter to confirm · Esc to cancel · Cells color-code automatically based on pass threshold
      </div>
    </div>
  );
};

// ── Grade History ─────────────────────────────────────────────────────────────
const HistoryView = () => {
  const [search, setSearch] = useState("");
  const [hist] = useState(HIST_ITEMS);

  const filtered = hist.filter(h => {
    const q = search.toLowerCase();
    return h.student.toLowerCase().includes(q) || h.item.toLowerCase().includes(q) || h.actor.toLowerCase().includes(q);
  });

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 7, flex: 1 }}>
          <span style={{ padding: "0 11px", color: "var(--text3)" }}><I n="search" s={14} /></span>
          <input style={{ background: "none", border: "none", padding: "8px", color: "var(--text)", fontSize: 13, outline: "none", flex: 1 }} placeholder="Search by student, item, or grader…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="sel" style={{ width: 140, fontSize: 12.5 }}><option>All items</option>{GRADE_ITEMS.map(g => <option key={g.id}>{g.name}</option>)}</select>
        <input type="date" className="inp" style={{ width: 140, fontSize: 12.5, padding: "8px 11px" }} />
        <button className="btn bg bsm"><I n="dl" s={13} />Export</button>
      </div>

      <div style={{ borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
              {["Timestamp", "Changed By", "Student", "Grade Item", "Previous", "New Value", "Δ Change", "Reason"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "var(--text3)", letterSpacing: ".07em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((h, i) => {
              const delta = h.old != null ? h.nw - h.old : null;
              return (
                <tr key={h.id} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,.012)" }}>
                  <td style={{ padding: "11px 14px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--text3)" }}>{h.ts}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text2)" }}>{h.actor}</span>
                  </td>
                  <td style={{ padding: "11px 14px", fontWeight: 600 }}>{h.student}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <span className="badge B-I" style={{ fontSize: 11 }}>{h.item}</span>
                  </td>
                  <td style={{ padding: "11px 14px", fontFamily: "var(--mono)", color: "var(--text3)", fontWeight: 600 }}>
                    {h.old != null ? h.old : <span style={{ fontSize: 11, color: "var(--text3)" }}>none</span>}
                  </td>
                  <td style={{ padding: "11px 14px", fontFamily: "var(--mono)", fontWeight: 700, color: "var(--green)" }}>{h.nw}</td>
                  <td style={{ padding: "11px 14px" }}>
                    {delta != null ? (
                      <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 12.5, color: delta >= 0 ? "var(--green)" : "var(--red)" }}>
                        {delta >= 0 ? "+" : ""}{delta}
                      </span>
                    ) : <span className="badge B-S" style={{ fontSize: 10 }}>NEW</span>}
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 12.5, color: "var(--text2)", fontStyle: "italic" }}>{h.reason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "right" }}>
        {filtered.length} change records found
      </div>
    </div>
  );
};

// ── Overview Report ────────────────────────────────────────────────────────────
const OverviewView = () => {
  const [selCourse, setSelCourse] = useState(null);
  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Platform stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { lbl: "Total Enrolled", val: OVERVIEW_COURSES.reduce((n, c) => n + c.enrolled, 0), c: "var(--amber)" },
          { lbl: "Completed",      val: OVERVIEW_COURSES.reduce((n, c) => n + c.completed, 0), c: "var(--green)" },
          { lbl: "Platform Avg",   val: Math.round(OVERVIEW_COURSES.reduce((n, c) => n + c.avgGrade, 0) / OVERVIEW_COURSES.length) + "%", c: "var(--teal)" },
          { lbl: "Avg Pass Rate",  val: Math.round(OVERVIEW_COURSES.reduce((n, c) => n + c.passRate, 0) / OVERVIEW_COURSES.length) + "%", c: "var(--indigo)" },
        ].map(s => (
          <div className="scard" key={s.lbl}>
            <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase" }}>{s.lbl}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.c, fontFamily: "var(--mono)" }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Course table */}
      <div style={{ borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
              {["Course", "Enrolled", "Completed", "Avg Grade", "Pass Rate", "Distribution", ""].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "var(--text3)", letterSpacing: ".07em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {OVERVIEW_COURSES.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,.012)" }}>
                <td style={{ padding: "13px 14px" }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{c.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text3)", marginTop: 2 }}>
                    {Math.round(c.completed / c.enrolled * 100)}% completion rate
                  </div>
                </td>
                <td style={{ padding: "13px 14px", fontFamily: "var(--mono)", fontWeight: 600 }}>{c.enrolled}</td>
                <td style={{ padding: "13px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>{c.completed}</span>
                    <div className="prog" style={{ width: 60 }}>
                      <div className="prog-b" style={{ width: `${c.completed / c.enrolled * 100}%`, background: "var(--teal)" }} />
                    </div>
                  </div>
                </td>
                <td style={{ padding: "13px 14px" }}>
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 800, fontSize: 15, color: c.avgGrade >= 80 ? "var(--green)" : c.avgGrade >= 65 ? "var(--amber)" : "var(--red)" }}>
                    {c.avgGrade}%
                  </span>
                </td>
                <td style={{ padding: "13px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: c.passRate >= 85 ? "var(--green)" : "var(--amber)" }}>{c.passRate}%</span>
                    <div className="prog" style={{ width: 60 }}>
                      <div className="prog-b" style={{ width: `${c.passRate}%`, background: c.passRate >= 85 ? "var(--green)" : "var(--amber)" }} />
                    </div>
                  </div>
                </td>
                <td style={{ padding: "13px 14px" }}>
                  <div className="mbar">
                    {c.dist.map((v, di) => (
                      <div key={di} className="mbar-col" style={{ height: `${(v / Math.max(...c.dist)) * 100}%`, background: di < 2 ? "var(--red)" : di < 5 ? "var(--amber)" : "var(--green)", opacity: 0.8 }} />
                    ))}
                  </div>
                </td>
                <td style={{ padding: "13px 14px" }}>
                  <button className="btn bg bxs" onClick={() => setSelCourse(selCourse?.id === c.id ? null : c)}>
                    {selCourse?.id === c.id ? "Hide" : "Details"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expanded detail */}
      {selCourse && (
        <div className="card" style={{ borderColor: "var(--border2)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{selCourse.name} — Grade Distribution</div>
            <button className="btn bg bxs" onClick={() => setSelCourse(null)}><I n="x" s={12} /></button>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100 }}>
            {selCourse.dist.map((v, i) => {
              const labels = ["0–10", "10–20", "20–30", "30–40", "40–50", "50–60", "60–70", "70–80", "80–90+"];
              const pct = (v / Math.max(...selCourse.dist)) * 100;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text3)" }}>{v}</span>
                  <div style={{ width: "100%", height: `${pct}%`, background: i < 4 ? "rgba(239,68,68,.5)" : i < 5 ? "rgba(245,158,11,.5)" : "rgba(16,185,129,.5)", borderRadius: "3px 3px 0 0", transition: "height .4s ease" }} />
                  <span style={{ fontSize: 9, color: "var(--text3)", transform: "rotate(-30deg)", transformOrigin: "top left", marginTop: 4 }}>{labels[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── User Report (per-student) ─────────────────────────────────────────────────
const UserReportView = () => {
  const [selStudent, setSelStudent] = useState(STUDENTS[0]);
  const [grades] = useState(INIT_GRADES);

  const avg = calcAvg(selStudent.id, grades);
  const letter = avg != null ? toLetter(avg) : "—";
  const letterColor = avg != null ? (avg >= 90 ? "var(--green)" : avg >= 80 ? "var(--amber)" : avg >= 70 ? "var(--indigo)" : avg >= 60 ? "var(--blue)" : "var(--red)") : "var(--text3)";

  return (
    <div style={{ padding: "20px 24px", display: "flex", gap: 18 }}>
      {/* Student picker */}
      <div style={{ width: 210, flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 8 }}>Select Student</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {STUDENTS.map(s => {
            const avg = calcAvg(s.id, grades);
            const isOn = selStudent.id === s.id;
            return (
              <div key={s.id} onClick={() => setSelStudent(s)} style={{ padding: "9px 12px", borderRadius: 8, cursor: "pointer", border: `1px solid ${isOn ? s.col + "55" : "var(--border)"}`, background: isOn ? s.col + "11" : "var(--card)", transition: "all .14s", display: "flex", alignItems: "center", gap: 9 }}>
                <Av i={s.av} c={s.col} sz={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: isOn ? s.col : "var(--text)" }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--mono)" }}>{avg != null ? `${avg}%` : "no grades"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report card */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Header */}
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 18, background: selStudent.col + "0D", borderColor: selStudent.col + "44" }}>
          <Av i={selStudent.av} c={selStudent.col} sz={56} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 800 }}>{selStudent.name}</div>
            <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 2, fontFamily: "var(--mono)" }}>Advanced React & TypeScript</div>
          </div>
          <div style={{ textAlign: "center", padding: "12px 20px", background: letterColor + "1A", border: `2px solid ${letterColor}44`, borderRadius: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: letterColor, fontFamily: "var(--display)", lineHeight: 1 }}>{letter}</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4, fontFamily: "var(--mono)" }}>{avg ?? "—"}%</div>
          </div>
          <button className="btn bg bsm" style={{ alignSelf: "flex-start" }}><I n="dl" s={13} />Print Report</button>
        </div>

        {/* Per-category breakdown */}
        {CATS.map(cat => {
          const items = GRADE_ITEMS.filter(g => g.catId === cat.id);
          const catVals = items.map(g => grades[selStudent.id]?.[g.id]).filter(v => v != null);
          const catAvg = catVals.length ? Math.round(catVals.reduce((a, b) => a + b, 0) / catVals.length) : null;
          const { color: catColor } = catAvg != null ? gradeColor(catAvg, 100, 60) : { color: "var(--text3)" };
          return (
            <div className="card" key={cat.id}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{cat.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 1 }}>Weight: {cat.weight}% · Aggregation: {cat.agg}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--mono)", fontWeight: 800, fontSize: 18, color: catColor }}>{catAvg != null ? `${catAvg}%` : "—"}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>Category avg</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map(item => {
                  const val = grades[selStudent.id]?.[item.id];
                  const pct = val != null ? Math.round((val / item.max) * 100) : null;
                  const { bg, color } = pct != null ? gradeColor(pct, 100, 60) : { bg: "var(--bg2)", color: "var(--text3)" };
                  return (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", background: bg, border: `1px solid ${color}22`, borderRadius: 7 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text3)", marginTop: 2 }}>Max: {item.max} · Pass: {item.pass} · Weight: {item.weight}%</div>
                      </div>
                      <div className="prog" style={{ width: 100 }}>
                        <div className="prog-b" style={{ width: `${pct ?? 0}%`, background: color }} />
                      </div>
                      <div style={{ fontFamily: "var(--mono)", fontWeight: 800, fontSize: 15, color, minWidth: 50, textAlign: "right" }}>
                        {val != null ? `${val}/${item.max}` : "—"}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color, minWidth: 28, textAlign: "right" }}>
                        {pct != null ? `${pct}%` : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Grade Categories Settings ─────────────────────────────────────────────────
const CategoriesView = () => {
  const [cats, setCats] = useState(CATS);
  const [items, setItems] = useState(GRADE_ITEMS);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", weight: 0, agg: "Mean" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const totalW = cats.reduce((n, c) => n + Number(c.weight), 0);

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 900 }}>
      {totalW !== 100 && (
        <div style={{ padding: "10px 14px", background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.2)", borderRadius: 8, fontSize: 13, color: "var(--amber)", display: "flex", gap: 8, alignItems: "center" }}>
          <I n="info" s={14} /> Total category weight is <strong>{totalW}%</strong> — should equal 100%.
        </div>
      )}

      {/* Categories */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Grade Categories</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Categories group grade items and control weighting</div>
          </div>
          <button className="btn ba bsm" onClick={() => { setForm({ name: "", weight: 0, agg: "Mean" }); setModal("cat"); }}><I n="plus" s={13} />Add Category</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
          {cats.map((c, i) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderBottom: i < cats.length - 1 ? "1px solid var(--border)" : "none", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,.012)" }}>
              <I n="drag" s={14} style={{ color: "var(--text3)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 1 }}>Aggregation: {c.agg} · {items.filter(g => g.catId === c.id).length} items</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ padding: "5px 12px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 6 }}>
                  <input type="number" min="0" max="100" value={c.weight} onChange={e => setCats(cs => cs.map(x => x.id === c.id ? { ...x, weight: Number(e.target.value) } : x))} style={{ background: "none", border: "none", outline: "none", color: "var(--amber)", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 14, width: 36, textAlign: "center" }} />
                  <span style={{ fontSize: 12, color: "var(--text3)" }}>%</span>
                </div>
              </div>
              <button className="btn bd bxs" onClick={() => setCats(cs => cs.filter(x => x.id !== c.id))}><I n="trash" s={12} /></button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(totalW, 100)}%`, background: totalW === 100 ? "var(--green)" : totalW > 100 ? "var(--red)" : "var(--amber)", transition: "all .3s" }} />
          </div>
          <span style={{ fontSize: 12, fontFamily: "var(--mono)", fontWeight: 700, color: totalW === 100 ? "var(--green)" : totalW > 100 ? "var(--red)" : "var(--amber)" }}>{totalW}% / 100%</span>
        </div>
      </div>

      {/* Grade Items */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Grade Items</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Individual assessments that feed into categories</div>
          </div>
          <button className="btn ba bsm"><I n="plus" s={13} />Add Item</button>
        </div>
        <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid var(--border)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
                {["Grade Item", "Category", "Type", "Max", "Pass", "Weight", "Actions"].map(h => (
                  <th key={h} style={{ padding: "9px 13px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "var(--text3)", letterSpacing: ".07em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((g, i) => (
                <tr key={g.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 13px", fontWeight: 600 }}>{g.name}</td>
                  <td style={{ padding: "10px 13px" }}><span className="badge B-I" style={{ fontSize: 11 }}>{cats.find(c => c.id === g.catId)?.name}</span></td>
                  <td style={{ padding: "10px 13px" }}><span className="badge B-X" style={{ fontSize: 11 }}>{g.type}</span></td>
                  <td style={{ padding: "10px 13px", fontFamily: "var(--mono)", fontWeight: 600 }}>{g.max}</td>
                  <td style={{ padding: "10px 13px", fontFamily: "var(--mono)", color: "var(--text2)" }}>{g.pass}</td>
                  <td style={{ padding: "10px 13px", fontFamily: "var(--mono)", color: "var(--amber)", fontWeight: 700 }}>{g.weight}%</td>
                  <td style={{ padding: "10px 13px" }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button className="btn bg bxs"><I n="edit" s={12} /></button>
                      <button className="btn bd bxs" onClick={() => setItems(is => is.filter(x => x.id !== g.id))}><I n="trash" s={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal === "cat" && (
        <div className="ov" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="mhd"><div style={{ fontWeight: 700, fontSize: 15 }}>Add Grade Category</div><button className="btn bg bico" onClick={() => setModal(null)}><I n="x" s={15} /></button></div>
            <div className="mbd">
              <div className="fl"><label className="lbl">Category Name *</label><input className="inp" placeholder="e.g. Quizzes" value={form.name} onChange={e => set("name", e.target.value)} autoFocus /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="fl"><label className="lbl">Weight (%)</label><input className="inp" type="number" min="0" max="100" value={form.weight} onChange={e => set("weight", Number(e.target.value))} /></div>
                <div className="fl"><label className="lbl">Aggregation</label>
                  <select className="sel" value={form.agg} onChange={e => set("agg", e.target.value)}>
                    {["Mean", "Weighted Mean", "Median", "Min", "Max", "Sum"].map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="fl"><label className="lbl">Drop Lowest N</label><input className="inp" type="number" min="0" max="5" defaultValue="0" /></div>
                <div className="fl"><label className="lbl">Extra Credit?</label><select className="sel"><option>No</option><option>Yes</option></select></div>
              </div>
            </div>
            <div className="mft">
              <button className="btn bg" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn ba" onClick={() => { setCats(cs => [...cs, { id: Date.now(), ...form }]); setModal(null); }} disabled={!form.name.trim()}><I n="check" s={13} />Add Category</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Scales ────────────────────────────────────────────────────────────────────
const ScalesView = () => {
  const [scales, setScales] = useState(INIT_SCALES);
  const [selScale, setSelScale] = useState(0);
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState("");
  const sc = scales[selScale];

  const updateItem = (scIdx, itemIdx, key, val) => {
    setScales(ss => ss.map((s, si) => si !== scIdx ? s : {
      ...s, items: s.items.map((it, ii) => ii !== itemIdx ? it : { ...it, [key]: val })
    }));
  };

  const addItem = () => {
    setScales(ss => ss.map((s, si) => si !== selScale ? s : {
      ...s, items: [...s.items, { label: "New", min: 0 }]
    }));
  };

  const removeItem = (itemIdx) => {
    setScales(ss => ss.map((s, si) => si !== selScale ? s : { ...s, items: s.items.filter((_, ii) => ii !== itemIdx) }));
  };

  return (
    <div style={{ padding: "20px 24px", display: "flex", gap: 18 }}>
      {/* Scale list */}
      <div style={{ width: 210, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>Scales ({scales.length})</div>
        {scales.map((s, i) => (
          <div key={s.id} onClick={() => setSelScale(i)} style={{ padding: "10px 12px", borderRadius: 8, cursor: "pointer", border: `1px solid ${selScale === i ? "rgba(245,158,11,.4)" : "var(--border)"}`, background: selScale === i ? "var(--adim)" : "var(--card)", transition: "all .14s" }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: selScale === i ? "var(--amber)" : "var(--text)" }}>{s.name}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{s.items.length} levels</div>
          </div>
        ))}
        <button className="btn bg bsm" style={{ justifyContent: "center", marginTop: 2 }} onClick={() => setModal(true)}><I n="plus" s={13} />New Scale</button>
      </div>

      {/* Scale editor */}
      <div style={{ flex: 1, maxWidth: 520 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{sc.name}</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Click to edit labels and minimum % thresholds</div>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            <button className="btn bg bsm"><I n="copy" s={13} />Duplicate</button>
            <button className="btn bd bsm"><I n="trash" s={13} />Delete</button>
          </div>
        </div>

        {/* Visual scale preview */}
        <div style={{ height: 10, borderRadius: 5, background: `linear-gradient(to right, var(--red), var(--amber), var(--green))`, marginBottom: 16, position: "relative" }}>
          {sc.items.filter(it => it.min > 0).map((it, i) => (
            <div key={i} style={{ position: "absolute", left: `${it.min}%`, top: -2, width: 1, height: 14, background: "var(--bg)", opacity: .5 }} />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 80px 40px", gap: 8, padding: "6px 10px" }}>
            {["Grade Label", "Min % (≥)", "Color Preview", ""].map(h => (
              <div key={h} style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text3)", letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>
          {sc.items.map((it, ii) => {
            const col = it.min >= 90 ? "var(--green)" : it.min >= 70 ? "var(--amber)" : it.min >= 60 ? "var(--indigo)" : "var(--red)";
            return (
              <div key={ii} className="scale-row" style={{ display: "grid", gridTemplateColumns: "1fr 120px 80px 40px", gap: 8, alignItems: "center" }}>
                <input className="inp" value={it.label} onChange={e => updateItem(selScale, ii, "label", e.target.value)} style={{ padding: "7px 10px", fontWeight: 700 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input className="inp" type="number" min="0" max="100" value={it.min} onChange={e => updateItem(selScale, ii, "min", Number(e.target.value))} style={{ padding: "7px 10px", fontFamily: "var(--mono)", fontWeight: 700 }} />
                  <span style={{ fontSize: 12, color: "var(--text3)", flexShrink: 0 }}>%</span>
                </div>
                <div style={{ height: 28, borderRadius: 6, background: col + "22", border: `1.5px solid ${col}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: col }}>{it.label}</span>
                </div>
                <button className="btn bd bxs" style={{ padding: "6px 8px" }} onClick={() => removeItem(ii)}><I n="x" s={12} /></button>
              </div>
            );
          })}
          <button className="btn bg bsm" style={{ justifyContent: "center", borderStyle: "dashed" }} onClick={addItem}><I n="plus" s={13} />Add Grade Level</button>
        </div>
      </div>

      {modal && (
        <div className="ov" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="mhd"><div style={{ fontWeight: 700, fontSize: 15 }}>New Scale</div><button className="btn bg bico" onClick={() => setModal(false)}><I n="x" s={15} /></button></div>
            <div className="mbd">
              <div className="fl"><label className="lbl">Scale Name</label><input className="inp" placeholder="e.g. Honors Scale" value={newName} onChange={e => setNewName(e.target.value)} autoFocus /></div>
              <div style={{ padding: "10px 14px", background: "var(--bg2)", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12.5, color: "var(--text2)" }}>
                <I n="info" s={13} /> New scale starts with F–A defaults. Customize levels after creation.
              </div>
            </div>
            <div className="mft">
              <button className="btn bg" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn ba" disabled={!newName.trim()} onClick={() => {
                setScales(ss => [...ss, { id: Date.now(), name: newName, items: [{ label: "A", min: 90 }, { label: "B", min: 80 }, { label: "C", min: 70 }, { label: "D", min: 60 }, { label: "F", min: 0 }] }]);
                setSelScale(scales.length); setNewName(""); setModal(false);
              }}><I n="check" s={13} />Create Scale</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── General Settings ──────────────────────────────────────────────────────────
const GeneralSettingsView = () => {
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };
  return (
    <div style={{ padding: "20px 24px", maxWidth: 680, display: "flex", flexDirection: "column", gap: 14 }}>
      {saved && <div style={{ padding: "10px 14px", background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)", borderRadius: 8, fontSize: 13, color: "var(--green)", display: "flex", alignItems: "center", gap: 8 }}><I n="check" s={14} />Settings saved successfully!</div>}

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Grade Display</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="fl"><label className="lbl">Display Type</label>
            <select className="sel"><option>Percentage</option><option>Letter Grade</option><option>Real (Points)</option><option>Letter + Percentage</option></select>
          </div>
          <div className="fl"><label className="lbl">Decimal Places</label>
            <select className="sel"><option>0 (e.g. 85%)</option><option>1 (e.g. 85.3%)</option><option>2 (e.g. 85.34%)</option></select>
          </div>
          <div className="fl"><label className="lbl">Default Scale</label>
            <select className="sel">{INIT_SCALES.map(s => <option key={s.id}>{s.name}</option>)}</select>
          </div>
          <div className="fl"><label className="lbl">Grade Point Scale</label>
            <select className="sel"><option>0 – 100</option><option>0 – 10</option><option>0 – 4.0 (GPA)</option></select>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Pass / Fail Thresholds</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div className="fl"><label className="lbl">Course Pass Grade (%)</label><input className="inp" type="number" defaultValue="60" /></div>
          <div className="fl"><label className="lbl">Activity Pass Grade (%)</label><input className="inp" type="number" defaultValue="50" /></div>
          <div className="fl"><label className="lbl">Overall Pass Grade (%)</label><input className="inp" type="number" defaultValue="65" /></div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Aggregation Defaults</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="fl"><label className="lbl">Default Aggregation</label>
            <select className="sel"><option>Weighted Mean</option><option>Mean</option><option>Median</option><option>Min</option><option>Max</option><option>Sum</option></select>
          </div>
          <div className="fl"><label className="lbl">Drop Lowest N (default)</label><input className="inp" type="number" defaultValue="0" min="0" max="10" /></div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Visibility & Release</div>
        {[
          ["Hide grades until release date", "Grades are hidden from students until you publish them"],
          ["Show grade feedback to students", "Students can read instructor comments on graded items"],
          ["Show class average to students", "Display the class average alongside individual grades"],
          ["Show rank percentile", "Show student where they rank in the class (e.g. Top 20%)"],
          ["Email on grade release", "Notify students via email when new grades are posted"],
        ].map(([lbl, sub]) => (
          <div key={lbl} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid var(--border)" }}>
            <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{lbl}</div><div style={{ fontSize: 12, color: "var(--text3)", marginTop: 1 }}>{sub}</div></div>
            <div className="tog on" />
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Report Settings</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {["Show empty grades", "Show feedback column", "Show activity completion", "Show last access", "Show letter grade", "Show percentage"].map(lbl => (
            <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--bg2)", borderRadius: 7, border: "1px solid var(--border)" }}>
              <div className="tog on" style={{ width: 28, height: 16 }} />
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn bg">Reset Defaults</button>
        <button className="btn ba" onClick={save}><I n="check" s={13} />Save Settings</button>
      </div>
    </div>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────

// Export all views
export { GradebookView, HistoryView, OverviewView, UserReportView, CategoriesView, ScalesView, GeneralSettingsView };
