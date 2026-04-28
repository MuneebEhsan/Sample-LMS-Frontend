import { useState, useEffect, useRef } from 'react';
import { I, Av, Dot, Toggle, Spark, BarChart } from '../shared.jsx';


const fmt = (n) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;
const fmtFull = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const REVENUE_DATA = [3200, 4100, 3800, 5200, 6800, 7400, 6900, 8100, 9200, 8700, 10400, 11800];

const TRANSACTIONS = [
  { id: "TXN-8821", student: "Elena Vasquez",  av: "EV", col: "#6366F1", course: "Advanced React & TypeScript",     amount: 49,  status: "completed", method: "stripe",  date: "Jun 10, 2024", invoice: "INV-001" },
  { id: "TXN-8820", student: "Ryan Okafor",    av: "RO", col: "#14B8A6", course: "ML Fundamentals",                amount: 79,  status: "completed", method: "paypal",  date: "Jun 10, 2024", invoice: "INV-002" },
  { id: "TXN-8819", student: "Mei Lin",        av: "ML", col: "#F59E0B", course: "UX Design Masterclass",          amount: 59,  status: "refunded",  method: "stripe",  date: "Jun 09, 2024", invoice: "INV-003" },
  { id: "TXN-8818", student: "Ali Hassan",     av: "AH", col: "#10B981", course: "Advanced React & TypeScript",    amount: 49,  status: "pending",   method: "stripe",  date: "Jun 09, 2024", invoice: "INV-004" },
  { id: "TXN-8817", student: "Sophie Laurent", av: "SL", col: "#EC4899", course: "Node.js & REST API Design",      amount: 0,   status: "free",      method: "—",       date: "Jun 08, 2024", invoice: "—" },
  { id: "TXN-8816", student: "Kenji Tanaka",   av: "KT", col: "#F97316", course: "UX Design Masterclass",          amount: 59,  status: "completed", method: "razorpay",date: "Jun 08, 2024", invoice: "INV-005" },
  { id: "TXN-8815", student: "Priya Nair",     av: "PN", col: "#3B82F6", course: "ML Fundamentals",                amount: 79,  status: "completed", method: "stripe",  date: "Jun 07, 2024", invoice: "INV-006" },
  { id: "TXN-8814", student: "Marcus Webb",    av: "MW", col: "#0EA5E9", course: "Advanced React & TypeScript",    amount: 49,  status: "disputed",  method: "paypal",  date: "Jun 07, 2024", invoice: "INV-007" },
];

const COUPONS = [
  { id: 1, code: "LAUNCH30",    type: "percent", val: 30, uses: 47,  limit: 100, expiry: "Jul 1, 2024",  courses: "All",             active: true  },
  { id: 2, code: "SUMMER20",    type: "percent", val: 20, uses: 103, limit: 200, expiry: "Aug 31, 2024", courses: "All",             active: true  },
  { id: 3, code: "REACT10OFF",  type: "fixed",   val: 10, uses: 28,  limit: 50,  expiry: "Jun 30, 2024", courses: "Advanced React",  active: false },
  { id: 4, code: "WELCOME15",   type: "percent", val: 15, uses: 214, limit: null,expiry: "Never",        courses: "All",             active: true  },
];

const PAYOUTS = [
  { id: 1, instructor: "Sophia Chen",  av: "SC", col: "#6366F1", courses: 3, students: 284, earned: 4180, paid: 3200, pending: 980,  split: 70 },
  { id: 2, instructor: "Marcus Rivera",av: "MR", col: "#14B8A6", courses: 2, students: 127, earned: 2340, paid: 2340, pending: 0,    split: 65 },
  { id: 3, instructor: "Aisha Patel",  av: "AP", col: "#F59E0B", courses: 1, students: 89,  earned: 1560, paid: 800,  pending: 760,  split: 70 },
  { id: 4, instructor: "Jonas Weber",  av: "JW", col: "#10B981", courses: 4, students: 412, earned: 7200, paid: 7200, pending: 0,    split: 60 },
];

const CONVS = [
  { id: 1, name: "Elena Vasquez",  av: "EV", col: "#6366F1", online: true,  last: "Can I get an extension for the assignment?", time: "2m ago",   unread: 2, course: "Advanced React" },
  { id: 2, name: "Ryan Okafor",    av: "RO", col: "#14B8A6", online: true,  last: "Thank you, the feedback was very helpful!",  time: "1h ago",   unread: 0, course: "Advanced React" },
  { id: 3, name: "Mei Lin",        av: "ML", col: "#F59E0B", online: false, last: "I'm having trouble with module 3...",         time: "3h ago",   unread: 1, course: "ML Fundamentals" },
  { id: 4, name: "Course: React",  av: "CR", col: "#6366F1", online: false, last: "[Group] Sophia: Office hours this Friday!",  time: "5h ago",   unread: 3, course: "Group Chat",   isGroup: true },
  { id: 5, name: "Ali Hassan",     av: "AH", col: "#10B981", online: false, last: "When will grades be released?",              time: "Yesterday", unread: 0, course: "UX Design" },
  { id: 6, name: "Kenji Tanaka",   av: "KT", col: "#F97316", online: true,  last: "I submitted the final project.",             time: "Yesterday", unread: 0, course: "Node.js" },
];

const INIT_MESSAGES = {
  1: [
    { id: 1, from: "Elena Vasquez", mine: false, text: "Hi! I wanted to ask about Assignment 2.", time: "10:05 AM" },
    { id: 2, from: "me", mine: true,  text: "Of course! What would you like to know?", time: "10:07 AM" },
    { id: 3, from: "Elena Vasquez", mine: false, text: "Can I get an extension for the assignment? I've been sick this week.", time: "10:08 AM" },
  ],
  2: [
    { id: 1, from: "me", mine: true,  text: "Great work on the final exam, Ryan! A+ performance.", time: "9:00 AM" },
    { id: 2, from: "Ryan Okafor", mine: false, text: "Thank you so much! Your teaching style really clicked for me.", time: "9:15 AM" },
    { id: 3, from: "Ryan Okafor", mine: false, text: "Thank you, the feedback was very helpful!", time: "9:16 AM" },
  ],
  3: [
    { id: 1, from: "Mei Lin", mine: false, text: "Hello, I'm having trouble understanding module 3...", time: "Yesterday" },
    { id: 2, from: "me", mine: true,  text: "Which part is giving you trouble?", time: "Yesterday" },
    { id: 3, from: "Mei Lin", mine: false, text: "I'm having trouble with module 3 concepts. Could we schedule a call?", time: "3h ago" },
  ],
};

const NOTIF_TYPES = [
  { id: "msg",        icon: "msg",     label: "New Message",             color: "var(--indigo)", email: true,  inapp: true,  push: false },
  { id: "grade",      icon: "star",    label: "Grade Released",          color: "var(--amber)",  email: true,  inapp: true,  push: true  },
  { id: "enroll",     icon: "users",   label: "New Enrollment",          color: "var(--green)",  email: true,  inapp: true,  push: false },
  { id: "assign",     icon: "book",    label: "Assignment Submitted",    color: "var(--teal)",   email: false, inapp: true,  push: false },
  { id: "payment",    icon: "dollar",  label: "Payment Received",        color: "var(--green)",  email: true,  inapp: true,  push: true  },
  { id: "refund",     icon: "refund",  label: "Refund Requested",        color: "var(--red)",    email: true,  inapp: true,  push: true  },
  { id: "due",        icon: "bell",    label: "Assignment Due Soon",     color: "var(--orange)", email: true,  inapp: true,  push: true  },
  { id: "announce",   icon: "announce",label: "Course Announcement",     color: "var(--violet)", email: false, inapp: true,  push: false },
];

const NOTIF_HISTORY = [
  { id: 1, type: "enroll",  icon: "users",   color: "var(--green)",  title: "New enrollment",          body: "Elena Vasquez enrolled in Advanced React & TypeScript", time: "2m ago",   read: false },
  { id: 2, type: "payment", icon: "dollar",  color: "var(--green)",  title: "Payment received",        body: "Ryan Okafor paid $79 for ML Fundamentals",               time: "1h ago",   read: false },
  { id: 3, type: "msg",     icon: "msg",     color: "var(--indigo)", title: "New message",             body: "Mei Lin: I'm having trouble with module 3...",            time: "3h ago",   read: false },
  { id: 4, type: "assign",  icon: "book",    color: "var(--teal)",   title: "Assignment submitted",    body: "Kenji Tanaka submitted Project: Build Your Own",          time: "5h ago",   read: true  },
  { id: 5, type: "refund",  icon: "refund",  color: "var(--red)",    title: "Refund requested",        body: "Mei Lin requested a refund for UX Design Masterclass",    time: "Yesterday",read: true  },
  { id: 6, type: "grade",   icon: "star",    color: "var(--amber)",  title: "Grade released",          body: "Sophia Chen released grades for Module 1 Quiz",           time: "Yesterday",read: true  },
  { id: 7, type: "due",     icon: "bell",    color: "var(--orange)", title: "Assignment due soon",     body: "Assignment 2 is due in 24 hours — 12 students pending",   time: "2 days ago",read: true  },
  { id: 8, type: "enroll",  icon: "users",   color: "var(--green)",  title: "Bulk enrollment",         body: "14 students enrolled via CSV import in Node.js course",   time: "3 days ago",read: true  },
];

// ══════════════════════════════════════════════════════════════════════════════
// PAYMENTS MODULE
// ══════════════════════════════════════════════════════════════════════════════

const RevenueDashboard = () => {
  const [period, setPeriod] = useState("12m");
  const maxRev = Math.max(...REVENUE_DATA);
  const totalRev = REVENUE_DATA.reduce((a, b) => a + b, 0);
  const thisMonth = REVENUE_DATA[11];
  const lastMonth = REVENUE_DATA[10];
  const growth = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { lbl: "Total Revenue (YTD)", val: fmtFull(totalRev), sub: `+${growth}% vs last month`, subCol: "var(--green)", icon: "dollar", col: "var(--amber)" },
          { lbl: "This Month",           val: fmtFull(thisMonth), sub: `${growth >= 0 ? "+" : ""}${growth}% MoM`,           subCol: growth >= 0 ? "var(--green)" : "var(--red)", icon: "chart",  col: "var(--teal)" },
          { lbl: "Transactions",         val: "847",              sub: "84 this month",                                      subCol: "var(--text2)", icon: "credit", col: "var(--indigo)" },
          { lbl: "Refund Rate",          val: "2.4%",             sub: "$1,180 refunded",                                    subCol: "var(--text2)", icon: "refund", col: "var(--red)" },
        ].map(s => (
          <div className="scard" key={s.lbl} style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.col + "18", border: `1px solid ${s.col}2E`, display: "flex", alignItems: "center", justifyContent: "center", color: s.col, flexShrink: 0 }}>
              <I n={s.icon} s={18} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>{s.lbl}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.col, fontFamily: "var(--mono)", marginTop: 2 }}>{s.val}</div>
              <div style={{ fontSize: 11.5, color: s.subCol, marginTop: 2 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 14 }}>
        {/* Bar chart */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Monthly Revenue</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>All courses combined · 2024</div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {["3m","6m","12m"].map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`btn bsm ${period === p ? "ba" : "bg"}`}>{p}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 150 }}>
            {REVENUE_DATA.slice(period === "3m" ? 9 : period === "6m" ? 6 : 0).map((v, i, arr) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                  <div style={{ width: "100%", height: `${(v / maxRev) * 100}%`, background: i === arr.length - 1 ? "var(--amber)" : `rgba(245,158,11,${0.25 + (v / maxRev) * 0.5})`, borderRadius: "4px 4px 0 0", transition: "height .4s ease", cursor: "pointer", minHeight: 4 }}
                    title={`${MONTHS[12 - arr.length + i]}: ${fmtFull(v)}`} />
                </div>
                <span style={{ fontSize: 10, color: "var(--text3)", textAlign: "center" }}>{MONTHS[12 - arr.length + i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Course breakdown */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 14 }}>Revenue by Course</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { name: "Advanced React",  rev: 6958,  pct: 59, col: "#6366F1" },
              { name: "Node.js & APIs",  rev: 2870,  pct: 24, col: "#10B981" },
              { name: "UX Design",       rev: 1180,  pct: 10, col: "#F59E0B" },
              { name: "ML Fundamentals", rev: 790,   pct: 7,  col: "#14B8A6" },
            ].map(c => (
              <div key={c.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{c.name}</span>
                  <span style={{ fontSize: 12, fontFamily: "var(--mono)", color: c.col, fontWeight: 700 }}>{fmt(c.rev)}</span>
                </div>
                <div className="prog">
                  <div className="pb" style={{ width: `${c.pct}%`, background: c.col }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{c.pct}% of total</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Recent Transactions</div>
          <button className="btn bg bsm"><I n="dl" s={13} />Export CSV</button>
        </div>
        <div className="tbl">
          <table>
            <thead>
              <tr>
                {["Transaction", "Student", "Course", "Amount", "Method", "Status", "Date", ""].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map(t => (
                <tr key={t.id}>
                  <td><span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text2)" }}>{t.id}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Av i={t.av} c={t.col} sz={26} />
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{t.student}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12.5, color: "var(--text2)", maxWidth: 180 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{t.course}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: t.status === "refunded" ? "var(--red)" : t.amount === 0 ? "var(--text3)" : "var(--green)" }}>
                      {t.amount === 0 ? "FREE" : t.status === "refunded" ? `-${fmtFull(t.amount)}` : fmtFull(t.amount)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${t.method === "stripe" ? "BI" : t.method === "paypal" ? "BB" : t.method === "razorpay" ? "BT" : "BX"}`} style={{ fontSize: 11, textTransform: "capitalize" }}>
                      {t.method}
                    </span>
                  </td>
                  <td>
                    {t.status === "completed" ? <span className="badge BG" style={{fontSize:11}}>Completed</span> : t.status === "refunded" ? <span className="badge BR" style={{fontSize:11}}>Refunded</span> : t.status === "pending" ? <span className="badge BA" style={{fontSize:11}}>Pending</span> : t.status === "disputed" ? <span className="badge BR" style={{fontSize:11}}>Disputed</span> : <span className="badge BX" style={{fontSize:11}}>Free</span>}
                  </td>
                  <td style={{ fontSize: 12.5, color: "var(--text3)" }}>{t.date}</td>
                  <td>
                    <div style={{ display: "flex", gap: 5 }}>
                      {t.invoice !== "—" && <button className="btn bg bxs"><I n="invoice" s={12} /></button>}
                      {t.status === "completed" && <button className="btn bd bxs"><I n="refund" s={12} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Coupons ───────────────────────────────────────────────────────────────────
const CouponsView = () => {
  const [coupons, setCoupons] = useState(COUPONS);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent", val: 20, limit: "", expiry: "", courses: "All", active: true });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    setCoupons(cs => [...cs, { id: Date.now(), ...form, val: Number(form.val), limit: form.limit ? Number(form.limit) : null, uses: 0 }]);
    setModal(false);
  };

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Discount Coupons</div>
          <div style={{ fontSize: 12.5, color: "var(--text3)", marginTop: 2 }}>Create percentage or fixed-amount discount codes</div>
        </div>
        <button className="btn ba" onClick={() => { setForm({ code: "", type: "percent", val: 20, limit: "", expiry: "", courses: "All", active: true }); setModal(true); }}><I n="plus" s={14} />New Coupon</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {coupons.map(c => (
          <div className="coupon" key={c.id}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: c.active ? "var(--adim)" : "var(--bg2)", border: `1px solid ${c.active ? "var(--aglow)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.active ? "var(--amber)" : "var(--text3)", flexShrink: 0 }}>
              <I n="percent" s={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "var(--mono)", fontWeight: 800, fontSize: 15, letterSpacing: ".06em", color: c.active ? "var(--text)" : "var(--text2)" }}>{c.code}</span>
                <span className={`badge ${c.active ? "BG" : "BX"}`} style={{ fontSize: 10.5 }}>{c.active ? "Active" : "Inactive"}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3, display: "flex", gap: 12 }}>
                <span>{c.type === "percent" ? `${c.val}% off` : `$${c.val} off`}</span>
                <span>Used: {c.uses}{c.limit ? `/${c.limit}` : ""}</span>
                <span>Courses: {c.courses}</span>
                <span>Expires: {c.expiry}</span>
              </div>
            </div>
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
              {c.limit && (
                <div style={{ width: 80 }}>
                  <div className="prog">
                    <div className="pb" style={{ width: `${(c.uses / c.limit) * 100}%`, background: c.uses / c.limit > 0.8 ? "var(--red)" : "var(--amber)" }} />
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--text3)", marginTop: 3, textAlign: "center" }}>{Math.round((c.uses / c.limit) * 100)}%</div>
                </div>
              )}
              <div className={`tog ${c.active ? "on" : ""}`} onClick={() => setCoupons(cs => cs.map(x => x.id === c.id ? { ...x, active: !x.active } : x))} />
              <button className="btn bg bxs"><I n="copy" s={12} /></button>
              <button className="btn bd bxs" onClick={() => setCoupons(cs => cs.filter(x => x.id !== c.id))}><I n="trash" s={12} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="ov" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="mhd"><div style={{ fontWeight: 700, fontSize: 15 }}>Create Coupon</div><button className="btn bg bico" onClick={() => setModal(false)}><I n="x" s={15} /></button></div>
            <div className="mbd">
              <div className="fl"><label className="lbl">Coupon Code *</label><input className="inp" placeholder="e.g. SUMMER30" value={form.code} onChange={e => set("code", e.target.value.toUpperCase())} style={{ fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: ".06em" }} autoFocus /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="fl"><label className="lbl">Discount Type</label>
                  <select className="sel" value={form.type} onChange={e => set("type", e.target.value)}><option value="percent">Percentage (%)</option><option value="fixed">Fixed Amount ($)</option></select>
                </div>
                <div className="fl"><label className="lbl">Value</label>
                  <div style={{ position: "relative" }}>
                    <input className="inp" type="number" min="0" max={form.type === "percent" ? 100 : 999} value={form.val} onChange={e => set("val", e.target.value)} style={{ paddingRight: 30 }} />
                    <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)", fontSize: 13 }}>{form.type === "percent" ? "%" : "$"}</span>
                  </div>
                </div>
                <div className="fl"><label className="lbl">Usage Limit</label><input className="inp" type="number" placeholder="Unlimited" value={form.limit} onChange={e => set("limit", e.target.value)} /></div>
                <div className="fl"><label className="lbl">Expiry Date</label><input className="inp" type="date" value={form.expiry} onChange={e => set("expiry", e.target.value)} /></div>
              </div>
              <div className="fl"><label className="lbl">Apply to Courses</label>
                <select className="sel" value={form.courses} onChange={e => set("courses", e.target.value)}>
                  <option>All</option><option>Advanced React & TypeScript</option><option>ML Fundamentals</option><option>UX Design Masterclass</option><option>Node.js & REST API Design</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 13px", background: "var(--bg2)", borderRadius: 8, border: "1px solid var(--border)" }}>
                <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>Activate immediately</div><div style={{ fontSize: 12, color: "var(--text3)" }}>Coupon is live as soon as it's created</div></div>
                <div className={`tog ${form.active ? "on" : ""}`} onClick={() => set("active", !form.active)} />
              </div>
            </div>
            <div className="mft">
              <button className="btn bg" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn ba" onClick={save} disabled={!form.code.trim()}><I n="check" s={13} />Create Coupon</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Payouts ───────────────────────────────────────────────────────────────────
const PayoutsView = () => (
  <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
      {[
        { lbl: "Total Instructor Earnings", val: fmtFull(PAYOUTS.reduce((n, p) => n + p.earned, 0)), col: "var(--amber)" },
        { lbl: "Total Paid Out",            val: fmtFull(PAYOUTS.reduce((n, p) => n + p.paid, 0)),   col: "var(--green)" },
        { lbl: "Pending Payouts",           val: fmtFull(PAYOUTS.reduce((n, p) => n + p.pending, 0)), col: "var(--orange)" },
      ].map(s => (
        <div className="scard" key={s.lbl}>
          <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>{s.lbl}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: s.col, fontFamily: "var(--mono)", marginTop: 4 }}>{s.val}</div>
        </div>
      ))}
    </div>

    <div className="tbl">
      <table>
        <thead><tr>{["Instructor","Courses","Students","Revenue Split","Total Earned","Paid","Pending",""].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {PAYOUTS.map(p => (
            <tr key={p.id}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <Av i={p.av} c={p.col} sz={30} />
                  <span style={{ fontWeight: 600 }}>{p.instructor}</span>
                </div>
              </td>
              <td style={{ fontFamily: "var(--mono)" }}>{p.courses}</td>
              <td style={{ fontFamily: "var(--mono)" }}>{p.students}</td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="prog" style={{ width: 60 }}><div className="pb" style={{ width: `${p.split}%`, background: "var(--amber)" }} /></div>
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: "var(--amber)" }}>{p.split}%</span>
                </div>
              </td>
              <td><span style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{fmtFull(p.earned)}</span></td>
              <td><span style={{ fontFamily: "var(--mono)", color: "var(--green)", fontWeight: 600 }}>{fmtFull(p.paid)}</span></td>
              <td><span style={{ fontFamily: "var(--mono)", color: p.pending > 0 ? "var(--orange)" : "var(--text3)", fontWeight: 600 }}>{fmtFull(p.pending)}</span></td>
              <td>
                <div style={{ display: "flex", gap: 5 }}>
                  {p.pending > 0 && <button className="btn bt bxs"><I n="payout" s={12} />Pay Now</button>}
                  <button className="btn bg bxs"><I n="edit" s={12} />Split</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Global split settings */}
    <div className="card">
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Default Revenue Split Settings</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
        {[["Default Instructor Split","70%"],["Platform Fee","30%"],["Payout Schedule","Monthly"],["Minimum Payout","$50"]].map(([k,v])=>(
          <div className="card2" key={k}>
            <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase" }}>{k}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--amber)", fontFamily: "var(--mono)", marginTop: 6 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── Gateway Config ─────────────────────────────────────────────────────────────
const INIT_GATEWAYS = [
  // ── Pakistani Gateways ──
  {
    id: "easypaisa",  region: "pk", name: "Easypaisa",       tag: "Mobile Wallet",
    logo: "🟢", col: "#00A651",
    active: true,  key: "EP_LIVE_••••••••••A3F2",  secret: "••••••••••••••••••••",
    webhook: "https://acadlms.dev/webhooks/easypaisa",
    env: "production", merchantId: "EP-MERCH-00421",
    supports: ["mobile_wallet","otc","qr_code"],
    txns: 312, volume: 156000, currency: "PKR",
    sandboxUrl: "https://easypaisaapi.com/ps/api/",
    liveUrl:    "https://easypaisaapi.com/ps/api/",
    desc: "Pakistan's #1 mobile wallet — Telenor Microfinance Bank",
    docs: "https://developer.easypaisa.com.pk",
  },
  {
    id: "jazzcash",   region: "pk", name: "JazzCash",        tag: "Mobile Wallet",
    logo: "🔴", col: "#E4002B",
    active: true,  key: "JC_LIVE_••••••••••B7C1",  secret: "••••••••••••••••••••",
    webhook: "https://acadlms.dev/webhooks/jazzcash",
    env: "production", merchantId: "JC-MERCH-00187",
    supports: ["mobile_wallet","debit_card","otc","qr_code"],
    txns: 278, volume: 139000, currency: "PKR",
    sandboxUrl: "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/",
    liveUrl:    "https://payments.jazzcash.com.pk/ApplicationAPI/API/",
    desc: "Mobilink Microfinance Bank — wallet + debit card gateway",
    docs: "https://developer.jazzcash.com.pk",
  },
  {
    id: "nayapay",    region: "pk", name: "NayaPay",         tag: "Digital Bank",
    logo: "🔵", col: "#1B4FD8",
    active: false, key: "NP_LIVE_••••••••••D4E8",  secret: "••••••••••••••••••••",
    webhook: "https://acadlms.dev/webhooks/nayapay",
    env: "sandbox",  merchantId: "",
    supports: ["mobile_wallet","visa","mastercard"],
    txns: 0, volume: 0, currency: "PKR",
    sandboxUrl: "https://api.sandbox.nayapay.com/",
    liveUrl:    "https://api.nayapay.com/",
    desc: "SBP licensed EMI — Visa & Mastercard + NayaPay wallet",
    docs: "https://developer.nayapay.com",
  },
  {
    id: "sadapay",    region: "pk", name: "SadaPay",         tag: "Neo Bank",
    logo: "🟡", col: "#FFCC00",
    active: false, key: "",  secret: "",
    webhook: "https://acadlms.dev/webhooks/sadapay",
    env: "sandbox",  merchantId: "",
    supports: ["visa","mobile_wallet"],
    txns: 0, volume: 0, currency: "PKR",
    sandboxUrl: "https://api-sandbox.sadapay.pk/",
    liveUrl:    "https://api.sadapay.pk/",
    desc: "Visa-powered neo bank — SBP EMI licensed",
    docs: "https://developer.sadapay.pk",
  },
  {
    id: "ubl_omni",   region: "pk", name: "UBL Omni",        tag: "Bank Branchless",
    logo: "🏦", col: "#003087",
    active: false, key: "UBL_••••••••••F1A9",       secret: "••••••••••••••••••••",
    webhook: "https://acadlms.dev/webhooks/ubl_omni",
    env: "sandbox",  merchantId: "",
    supports: ["otc","bank_transfer","debit_card"],
    txns: 0, volume: 0, currency: "PKR",
    sandboxUrl: "https://ubldirektapi.ublbank.com/sandbox/",
    liveUrl:    "https://ubldirektapi.ublbank.com/",
    desc: "United Bank Limited — branchless banking & OTC payments",
    docs: "https://developer.ublbank.com",
  },
  {
    id: "hbl_pay",    region: "pk", name: "HBL Pay",          tag: "Bank Gateway",
    logo: "🏦", col: "#006341",
    active: false, key: "",  secret: "",
    webhook: "https://acadlms.dev/webhooks/hbl",
    env: "sandbox",  merchantId: "",
    supports: ["credit_card","debit_card","bank_transfer"],
    txns: 0, volume: 0, currency: "PKR",
    sandboxUrl: "https://hblpay-sandbox.hbl.com/api/",
    liveUrl:    "https://hblpay.hbl.com/api/",
    desc: "Habib Bank Limited — credit/debit cards & direct bank transfers",
    docs: "https://developer.hbl.com",
  },
  // ── International ──
  {
    id: "stripe",     region: "intl", name: "Stripe",         tag: "Global",
    logo: "💳", col: "#635BFF",
    active: true,  key: "sk_live_••••••••••1234",   secret: "whsec_••••••••••••",
    webhook: "https://acadlms.dev/webhooks/stripe",
    env: "production", merchantId: "acct_1A2B3C4D",
    supports: ["credit_card","debit_card","apple_pay","google_pay","sepa"],
    txns: 724, volume: 36200, currency: "USD",
    sandboxUrl: "https://api.stripe.com/v1/",
    liveUrl:    "https://api.stripe.com/v1/",
    desc: "Global leader — 135+ currencies, 3DS2, Apple/Google Pay",
    docs: "https://stripe.com/docs",
  },
  {
    id: "paypal",     region: "intl", name: "PayPal",         tag: "Global",
    logo: "🅿️", col: "#0070BA",
    active: true,  key: "AeJ2••••••••••KXYZ",       secret: "••••••••••••••••••••",
    webhook: "https://acadlms.dev/webhooks/paypal",
    env: "production", merchantId: "PAYPAL-MERCH-8821",
    supports: ["paypal_wallet","credit_card","pay_later"],
    txns: 89, volume: 7031, currency: "USD",
    sandboxUrl: "https://api-m.sandbox.paypal.com/",
    liveUrl:    "https://api-m.paypal.com/",
    desc: "200+ markets — PayPal wallet, Pay Later, card processing",
    docs: "https://developer.paypal.com",
  },
];

const SUPPORT_LABEL = {
  mobile_wallet: "Mobile Wallet", otc: "OTC Cash", qr_code: "QR Code",
  credit_card: "Credit Card", debit_card: "Debit Card", bank_transfer: "Bank Transfer",
  visa: "Visa", mastercard: "Mastercard", apple_pay: "Apple Pay",
  google_pay: "Google Pay", sepa: "SEPA", paypal_wallet: "PayPal", pay_later: "Pay Later",
};

const GatewayView = () => {
  const [gateways, setGateways] = useState(INIT_GATEWAYS);
  const [expanded, setExpanded] = useState(null);
  const [regionFilter, setRegionFilter] = useState("all");
  const [testingId, setTestingId] = useState(null);
  const [testResult, setTestResult] = useState({});
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const setEF = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

  const toggle = (id) => setGateways(gs => gs.map(x => x.id === id ? { ...x, active: !x.active } : x));

  const testGateway = (gw) => {
    setTestingId(gw.id);
    setTestResult(r => ({ ...r, [gw.id]: null }));
    setTimeout(() => {
      const ok = gw.key.length > 0 && gw.active;
      setTestResult(r => ({ ...r, [gw.id]: { ok, ms: ok ? Math.floor(Math.random() * 80 + 20) : null, err: ok ? null : "Invalid credentials or gateway inactive" } }));
      setTestingId(null);
    }, 1800);
  };

  const openEdit = (gw) => { setEditForm({ ...gw }); setEditModal(gw.id); };
  const saveEdit = () => {
    setGateways(gs => gs.map(x => x.id === editModal ? { ...x, ...editForm } : x));
    setEditModal(null);
  };

  const filtered = gateways.filter(gw => regionFilter === "all" || gw.region === regionFilter);
  const pkActive  = gateways.filter(g => g.region === "pk"   && g.active).length;
  const intlActive= gateways.filter(g => g.region === "intl" && g.active).length;
  const totalVol  = gateways.reduce((n, g) => n + g.volume, 0);

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { lbl: "PK Gateways Active",   val: `${pkActive}/6`,        col: "#00A651" },
          { lbl: "Intl Gateways Active",  val: `${intlActive}/2`,      col: "#635BFF" },
          { lbl: "Total Transactions",    val: gateways.reduce((n,g)=>n+g.txns,0).toLocaleString(), col: "var(--amber)" },
          { lbl: "Total Volume",          val: "$"+totalVol.toLocaleString(), col: "var(--teal)" },
        ].map(s => (
          <div className="scard" key={s.lbl}>
            <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase" }}>{s.lbl}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.col, fontFamily: "var(--mono)", marginTop: 3 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Region filter tabs */}
      <div style={{ display: "flex", gap: 2, background: "var(--bg2)", padding: 3, borderRadius: 8, width: "fit-content" }}>
        {[["all","All Gateways"],["pk","🇵🇰 Pakistan"],["intl","🌐 International"]].map(([id, lbl]) => (
          <div key={id} onClick={() => setRegionFilter(id)}
            style={{ padding: "7px 16px", borderRadius: 7, fontSize: 12.5, fontWeight: 600, cursor: "pointer", transition: "all .14s", color: regionFilter === id ? "var(--text)" : "var(--text2)", background: regionFilter === id ? "var(--card)" : "transparent" }}>
            {lbl}
          </div>
        ))}
      </div>

      {/* Gateway cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(gw => {
          const isExpanded = expanded === gw.id;
          const result = testResult[gw.id];
          const isTesting = testingId === gw.id;
          return (
            <div className={`gw-card ${gw.active ? "active" : ""}`} key={gw.id} style={{ padding: 0, overflow: "hidden" }}>
              {/* Top stripe */}
              <div style={{ height: 3, background: `linear-gradient(to right, ${gw.col}, ${gw.col}44)` }} />

              {/* Header row */}
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: gw.col + "1A", border: `1.5px solid ${gw.col}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{gw.logo}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 14.5 }}>{gw.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: gw.col + "18", color: gw.col, border: `1px solid ${gw.col}30` }}>{gw.tag}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: gw.region === "pk" ? "rgba(0,166,81,.1)" : "rgba(99,91,255,.1)", color: gw.region === "pk" ? "#00A651" : "#635BFF", border: `1px solid ${gw.region === "pk" ? "#00A65130" : "#635BFF30"}` }}>
                      {gw.region === "pk" ? "🇵🇰 PKR" : "🌐 USD"}
                    </span>
                    {gw.env === "sandbox" && <span className="badge BA" style={{ fontSize: 10 }}>Sandbox</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3 }}>{gw.desc}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {gw.txns > 0 && <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--mono)", fontWeight: 800, fontSize: 15, color: gw.col }}>{gw.txns.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".04em" }}>txns</div>
                  </div>}
                  <div className={`tog ${gw.active ? "on" : ""}`} onClick={() => toggle(gw.id)} />
                  <button className="btn bg bxs" onClick={() => openEdit(gw)}><I n="edit" s={12} /></button>
                  <button className={`btn ${isTesting ? "ba" : "bt"} bxs`} onClick={() => testGateway(gw)} disabled={isTesting}>
                    {isTesting ? "Testing…" : "Test API"}
                  </button>
                  <button className="btn bg bxs" onClick={() => setExpanded(isExpanded ? null : gw.id)}>
                    <I n={isExpanded ? "chevD" : "chevR"} s={12} />
                  </button>
                </div>
              </div>

              {/* Payment method chips */}
              <div style={{ padding: "0 16px 12px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                {gw.supports.map(s => (
                  <span key={s} style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 5, background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text2)" }}>
                    {SUPPORT_LABEL[s] || s}
                  </span>
                ))}
              </div>

              {/* Test result bar */}
              {result && (
                <div style={{ margin: "0 16px 12px", padding: "8px 12px", borderRadius: 8, border: `1px solid ${result.ok ? "rgba(16,185,129,.25)" : "rgba(239,68,68,.22)"}`, background: result.ok ? "rgba(16,185,129,.07)" : "rgba(239,68,68,.06)", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: result.ok ? "var(--green)" : "var(--red)" }}>
                  <I n={result.ok ? "check" : "alert"} s={14} />
                  {result.ok ? `Connection OK — ${result.ms}ms response` : `Failed: ${result.err}`}
                </div>
              )}

              {/* Expanded config */}
              {isExpanded && (
                <div style={{ borderTop: "1px solid var(--border)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn .2s ease" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="fl" style={{ gap: 4 }}>
                      <label className="lbl">API Key / Merchant ID</label>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input className="inp" value={gw.key || "Not configured"} readOnly style={{ fontFamily: "var(--mono)", fontSize: 12, padding: "7px 10px", color: gw.key ? "var(--text)" : "var(--text3)" }} />
                        <button className="btn bg bico" onClick={() => openEdit(gw)}><I n="edit" s={13} /></button>
                      </div>
                    </div>
                    <div className="fl" style={{ gap: 4 }}>
                      <label className="lbl">Webhook URL</label>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input className="inp" value={gw.webhook} readOnly style={{ fontSize: 11.5, padding: "7px 10px", color: "var(--teal)", fontFamily: "var(--mono)" }} />
                        <button className="btn bg bico"><I n="copy" s={13} /></button>
                      </div>
                    </div>
                    <div className="fl" style={{ gap: 4 }}>
                      <label className="lbl">Sandbox Endpoint</label>
                      <input className="inp" value={gw.sandboxUrl} readOnly style={{ fontFamily: "var(--mono)", fontSize: 11, padding: "7px 10px", color: "var(--amber)" }} />
                    </div>
                    <div className="fl" style={{ gap: 4 }}>
                      <label className="lbl">Live Endpoint</label>
                      <input className="inp" value={gw.liveUrl} readOnly style={{ fontFamily: "var(--mono)", fontSize: 11, padding: "7px 10px", color: "var(--green)" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <a href={gw.docs} target="_blank" rel="noreferrer" className="btn bg bsm" style={{ textDecoration: "none" }}><I n="link" s={12} />API Docs</a>
                    <button className="btn bg bsm"><I n="chart" s={12} />Transaction History</button>
                    {!gw.active && <button className="btn bt bsm" onClick={() => toggle(gw.id)}><I n="check" s={12} />Activate</button>}
                    {gw.active && gw.env === "sandbox" && <span className="badge BA" style={{ alignSelf: "center", fontSize: 11 }}>Switch to Live before accepting real payments</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tax & Currency config */}
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Pakistan Tax & Currency Settings</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            ["Default Currency", "PKR"],
            ["GST Rate (Pakistan)", "0%"],
            ["Tax ID Label", "NTN / CNIC"],
            ["WHT on Services", "3%"],
            ["FED on Banking", "13%"],
            ["Currency Symbol", "₨"],
          ].map(([k, v]) => (
            <div className="fl" key={k}><label className="lbl">{k}</label><input className="inp" defaultValue={v} /></div>
          ))}
        </div>
      </div>

      {/* Edit modal */}
      {editModal && (
        <div className="ov" onClick={e => e.target === e.currentTarget && setEditModal(null)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="mhd">
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Configure {editForm.name}</div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Credentials are encrypted at rest.</div>
              </div>
              <button className="btn bg bico" onClick={() => setEditModal(null)}><I n="x" s={15} /></button>
            </div>
            <div className="mbd">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="fl"><label className="lbl">Merchant / Store ID</label><input className="inp" value={editForm.merchantId || ""} onChange={e => setEF("merchantId", e.target.value)} placeholder="e.g. EP-MERCH-00421" style={{ fontFamily: "var(--mono)", fontSize: 13 }} /></div>
                <div className="fl"><label className="lbl">Environment</label>
                  <select className="sel" value={editForm.env} onChange={e => setEF("env", e.target.value)}>
                    <option value="sandbox">Sandbox / Test</option>
                    <option value="production">Production / Live</option>
                  </select>
                </div>
              </div>
              <div className="fl"><label className="lbl">API Key / Access Token</label><input className="inp" value={editForm.key || ""} onChange={e => setEF("key", e.target.value)} placeholder="Paste your API key here" style={{ fontFamily: "var(--mono)", fontSize: 13 }} /></div>
              <div className="fl"><label className="lbl">Secret Key / Hash Salt</label><input className="inp" type="password" value={editForm.secret || ""} onChange={e => setEF("secret", e.target.value)} placeholder="Paste your secret key here" style={{ fontFamily: "var(--mono)", fontSize: 13 }} /></div>
              <div style={{ padding: "10px 13px", background: "var(--adim)", border: "1px solid var(--aglow)", borderRadius: 8, fontSize: 12.5, color: "var(--amber2)", display: "flex", gap: 8 }}>
                <I n="info" s={13} />Always test with Sandbox credentials before switching to Production.
              </div>
            </div>
            <div className="mft">
              <button className="btn bg" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn ba" onClick={saveEdit}><I n="check" s={13} />Save Credentials</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MESSAGING MODULE
// ══════════════════════════════════════════════════════════════════════════════

const MessagingView = () => {
  const [convs, setConvs] = useState(CONVS);
  const [selConv, setSelConv] = useState(CONVS[0]);
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [composeModal, setComposeModal] = useState(false);
  const [composeForm, setComposeForm] = useState({ to: "", subject: "", body: "" });
  const msgEndRef = useRef();

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selConv, messages]);

  const send = () => {
    if (!draft.trim()) return;
    const msg = { id: Date.now(), from: "me", mine: true, text: draft, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(m => ({ ...m, [selConv.id]: [...(m[selConv.id] || []), msg] }));
    setConvs(cs => cs.map(c => c.id === selConv.id ? { ...c, last: draft, time: "now", unread: 0 } : c));
    setDraft("");
  };

  const markRead = (id) => setConvs(cs => cs.map(c => c.id === id ? { ...c, unread: 0 } : c));

  const filteredConvs = convs.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const curMsgs = messages[selConv?.id] || [];

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left panel — conversation list */}
      <div style={{ width: 280, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", background: "var(--card)", flexShrink: 0 }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 7, flex: 1 }}>
            <span style={{ padding: "0 10px", color: "var(--text3)" }}><I n="search" s={13} /></span>
            <input style={{ background: "none", border: "none", padding: "7px 6px", color: "var(--text)", fontSize: 13, outline: "none", flex: 1 }} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn ba bico" onClick={() => setComposeModal(true)}><I n="edit" s={14} /></button>
        </div>

        {/* Unread count */}
        {convs.some(c => c.unread > 0) && (
          <div style={{ padding: "8px 14px", background: "var(--adim)", borderBottom: "1px solid var(--aglow)", fontSize: 12, color: "var(--amber)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <I n="bell" s={12} /> {convs.reduce((n, c) => n + c.unread, 0)} unread messages
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredConvs.map(c => (
            <div key={c.id} className={`conv-row ${selConv?.id === c.id ? "on" : ""}`}
              onClick={() => { setSelConv(c); markRead(c.id); }}>
              <Av i={c.av} c={c.col} sz={38} online={c.online} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: c.unread > 0 ? 700 : 600, fontSize: 13.5, color: selConv?.id === c.id ? "var(--amber)" : "var(--text)" }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>{c.time}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.last}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 3 }}>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>{c.course}</span>
                  {c.unread > 0 && <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--amber)", color: "#000", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{c.unread}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — message thread */}
      {selConv ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Thread header */}
          <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--card)", flexShrink: 0 }}>
            <Av i={selConv.av} c={selConv.col} sz={36} online={selConv.online} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{selConv.name}</div>
              <div style={{ fontSize: 12, color: selConv.online ? "var(--green)" : "var(--text3)", marginTop: 1 }}>
                {selConv.online ? "● Online now" : "○ Offline"} · {selConv.course}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn bg bico" title="Mute"><I n="mute" s={14} /></button>
              <button className="btn bg bico" title="Block"><I n="block" s={14} /></button>
              <button className="btn bg bico" title="User profile"><I n="user" s={14} /></button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            {curMsgs.map((m, i) => (
              <div key={m.id} className="msg-in" style={{ display: "flex", flexDirection: m.mine ? "row-reverse" : "row", alignItems: "flex-end", gap: 8 }}>
                {!m.mine && <Av i={selConv.av} c={selConv.col} sz={28} />}
                <div style={{ display: "flex", flexDirection: "column", alignItems: m.mine ? "flex-end" : "flex-start", gap: 3 }}>
                  <div className={`bubble ${m.mine ? "bubble-out" : "bubble-in"}`}>{m.text}</div>
                  <span style={{ fontSize: 11, color: "var(--text3)", paddingInline: 4 }}>{m.time} {m.mine && <span style={{ color: "var(--teal)" }}>✓✓</span>}</span>
                </div>
              </div>
            ))}
            <div ref={msgEndRef} />
          </div>

          {/* Compose bar */}
          <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", background: "var(--card)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button className="btn bg bico" style={{ border: "none" }}><I n="attach" s={15} /></button>
                <button className="btn bg bico" style={{ border: "none" }}><I n="image" s={15} /></button>
                <button className="btn bg bico" style={{ border: "none" }}><I n="emoji" s={15} /></button>
              </div>
              <textarea
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 13.5, resize: "none", minHeight: 24, maxHeight: 120, lineHeight: 1.5 }}
                placeholder={`Message ${selConv.name}…`} value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={1}
              />
              <button className="btn ba bico" onClick={send} disabled={!draft.trim()}><I n="send" s={15} /></button>
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 5, textAlign: "center" }}>Enter to send · Shift+Enter for new line</div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)" }}>
          <div style={{ textAlign: "center" }}><I n="msg" s={40} /><div style={{ marginTop: 12, fontWeight: 600 }}>Select a conversation</div></div>
        </div>
      )}

      {/* Compose Modal */}
      {composeModal && (
        <div className="ov" onClick={e => e.target === e.currentTarget && setComposeModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="mhd"><div style={{ fontWeight: 700, fontSize: 15 }}>New Message</div><button className="btn bg bico" onClick={() => setComposeModal(false)}><I n="x" s={15} /></button></div>
            <div className="mbd">
              <div className="fl"><label className="lbl">To (email or username)</label><input className="inp" placeholder="student@example.com or username" value={composeForm.to} onChange={e => setComposeForm(f => ({ ...f, to: e.target.value }))} autoFocus /></div>
              <div className="fl"><label className="lbl">Subject</label><input className="inp" placeholder="e.g. Regarding your assignment submission" value={composeForm.subject} onChange={e => setComposeForm(f => ({ ...f, subject: e.target.value }))} /></div>
              <div className="fl"><label className="lbl">Message</label><textarea className="inp ta" style={{ minHeight: 120 }} placeholder="Type your message…" value={composeForm.body} onChange={e => setComposeForm(f => ({ ...f, body: e.target.value }))} /></div>
            </div>
            <div className="mft">
              <button className="btn bg" onClick={() => setComposeModal(false)}>Cancel</button>
              <button className="btn ba" disabled={!composeForm.to || !composeForm.body}><I n="send" s={13} />Send Message</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS MODULE
// ══════════════════════════════════════════════════════════════════════════════

const NotificationCenter = () => {
  const [notifs, setNotifs] = useState(NOTIF_HISTORY);
  const [prefs, setPrefs] = useState(NOTIF_TYPES);
  const [subTab, setSubTab] = useState("inbox");
  const [toast, setToast] = useState(null);
  const [broadModal, setBroadModal] = useState(false);
  const [broadForm, setBroadForm] = useState({ to: "all", subject: "", body: "", channel: "inapp" });
  const setBF = (k, v) => setBroadForm(f => ({ ...f, [k]: v }));

  const unread = notifs.filter(n => !n.read).length;

  const togglePref = (id, channel) => {
    setPrefs(ps => ps.map(p => p.id === id ? { ...p, [channel]: !p[channel] } : p));
  };

  const markAllRead = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id) => setNotifs(ns => ns.filter(n => n.id !== id));

  const demoToast = () => {
    setToast({ id: Date.now(), icon: "bell", color: "var(--amber)", title: "Assignment Due Soon", body: "Module 2 Quiz closes in 2 hours" });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Sub-tabs */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 2, background: "var(--bg2)", padding: 3, borderRadius: 8 }}>
          {[["inbox","Inbox"], ["prefs","Preferences"], ["broadcast","Broadcast"]].map(([id, lbl]) => (
            <div key={id} onClick={() => setSubTab(id)}
              style={{ padding: "7px 14px", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .14s", color: subTab === id ? "var(--text)" : "var(--text2)", background: subTab === id ? "var(--card)" : "transparent", position: "relative" }}>
              {lbl}
              {id === "inbox" && unread > 0 && (
                <span style={{ position: "absolute", top: 4, right: 6, width: 16, height: 16, borderRadius: "50%", background: "var(--red)", color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{unread}</span>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {subTab === "inbox" && <button className="btn bg bsm" onClick={markAllRead}><I n="check2" s={13} />Mark all read</button>}
          {subTab === "broadcast" && <button className="btn ba" onClick={() => setBroadModal(true)}><I n="announce" s={14} />New Broadcast</button>}
          <button className="btn bi bsm" onClick={demoToast}><I n="bell" s={13} />Preview Toast</button>
        </div>
      </div>

      {/* INBOX */}
      {subTab === "inbox" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {notifs.map(n => (
            <div key={n.id} onClick={() => markRead(n.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderRadius: 10, border: `1px solid ${n.read ? "var(--border)" : n.color + "33"}`, background: n.read ? "var(--card)" : n.color + "06", cursor: "pointer", transition: "all .14s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border2)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = n.read ? "var(--border)" : n.color + "33"}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: n.color + "18", border: `1px solid ${n.color}2E`, display: "flex", alignItems: "center", justifyContent: "center", color: n.color, flexShrink: 0 }}>
                <I n={n.icon} s={16} />
              </div>
              {!n.read && <div className="unread-dot" />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: n.read ? 600 : 700, fontSize: 13.5 }}>{n.title}</span>
                  <span style={{ fontSize: 11.5, color: "var(--text3)", flexShrink: 0 }}>{n.time}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text2)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.body}</div>
              </div>
              <button className="btn bg bico" onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}><I n="x" s={13} /></button>
            </div>
          ))}
          {notifs.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text3)" }}>
              <I n="bell" s={36} /><div style={{ marginTop: 12, fontWeight: 600 }}>All caught up!</div>
            </div>
          )}
        </div>
      )}

      {/* PREFERENCES */}
      {subTab === "prefs" && (
        <div className="card" style={{ maxWidth: 780 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Notification Preferences</div>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 100px", gap: 0, padding: "0 0 8px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: ".06em", textTransform: "uppercase" }}>Event</div>
            {["Email", "In-App", "Push"].map(ch => (
              <div key={ch} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: ".06em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                <I n={ch === "Email" ? "mail" : ch === "Push" ? "mobile" : "bell"} s={12} />{ch}
              </div>
            ))}
          </div>
          {prefs.map(p => (
            <div key={p.id} className="npref" style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 100px", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: p.color + "18", display: "flex", alignItems: "center", justifyContent: "center", color: p.color }}>
                  <I n={p.icon} s={14} />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{p.label}</span>
              </div>
              {["email", "inapp", "push"].map(ch => (
                <div key={ch} style={{ display: "flex", justifyContent: "center" }}>
                  <div className={`tog ${p[ch] ? "on" : ""}`} onClick={() => togglePref(p.id, ch)} />
                </div>
              ))}
            </div>
          ))}
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button className="btn bg bsm">Reset</button>
            <button className="btn ba bsm"><I n="check" s={13} />Save Preferences</button>
          </div>
        </div>
      )}

      {/* BROADCAST */}
      {subTab === "broadcast" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { lbl: "Broadcasts Sent",  val: "47",   col: "var(--amber)" },
              { lbl: "Total Recipients", val: "2,841", col: "var(--teal)"  },
              { lbl: "Avg Open Rate",    val: "68%",  col: "var(--green)" },
            ].map(s => (
              <div className="scard" key={s.lbl}>
                <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>{s.lbl}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.col, fontFamily: "var(--mono)", marginTop: 4 }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Past broadcasts table */}
          <div className="tbl">
            <table>
              <thead><tr>{["Subject","Audience","Channel","Sent","Recipients","Open Rate"].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {[
                  { sub: "Office Hours This Friday",            aud: "All Students",        ch: "In-App + Email", date: "Jun 9",  rec: 501, open: 72 },
                  { sub: "New Course: Python Bootcamp",         aud: "All Users",           ch: "Email",          date: "Jun 5",  rec: 847, open: 61 },
                  { sub: "Advanced React — Grades Released",    aud: "Course: React",       ch: "In-App",         date: "Jun 3",  rec: 142, open: 94 },
                  { sub: "Platform maintenance June 15th",      aud: "All Users",           ch: "Email + In-App", date: "Jun 1",  rec: 847, open: 58 },
                ].map((b, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{b.sub}</td>
                    <td><span className="badge BI" style={{ fontSize: 11 }}>{b.aud}</span></td>
                    <td style={{ fontSize: 12.5, color: "var(--text2)" }}>{b.ch}</td>
                    <td style={{ fontSize: 12.5, color: "var(--text3)" }}>{b.date}</td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 13 }}>{b.rec.toLocaleString()}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="prog" style={{ width: 60 }}><div className="pb" style={{ width: `${b.open}%`, background: b.open >= 70 ? "var(--green)" : "var(--amber)" }} /></div>
                        <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: b.open >= 70 ? "var(--green)" : "var(--amber)", fontSize: 13 }}>{b.open}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {broadModal && (
        <div className="ov" onClick={e => e.target === e.currentTarget && setBroadModal(false)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="mhd"><div style={{ fontWeight: 700, fontSize: 15 }}>New Broadcast Message</div><button className="btn bg bico" onClick={() => setBroadModal(false)}><I n="x" s={15} /></button></div>
            <div className="mbd">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="fl"><label className="lbl">Send To</label>
                  <select className="sel" value={broadForm.to} onChange={e => setBF("to", e.target.value)}>
                    <option value="all">All Users</option><option value="students">All Students</option><option value="instructors">All Instructors</option><option value="course">Specific Course</option><option value="role">Specific Role</option>
                  </select>
                </div>
                <div className="fl"><label className="lbl">Channel</label>
                  <select className="sel" value={broadForm.channel} onChange={e => setBF("channel", e.target.value)}>
                    <option value="inapp">In-App Only</option><option value="email">Email Only</option><option value="both">In-App + Email</option><option value="push">Push Notification</option>
                  </select>
                </div>
              </div>
              <div className="fl"><label className="lbl">Subject / Title</label><input className="inp" placeholder="e.g. Important platform update" value={broadForm.subject} onChange={e => setBF("subject", e.target.value)} /></div>
              <div className="fl"><label className="lbl">Message Body</label><textarea className="inp ta" style={{ minHeight: 120 }} placeholder="Write your broadcast message here…" value={broadForm.body} onChange={e => setBF("body", e.target.value)} /></div>
              <div style={{ display: "flex", gap: 10, padding: "10px 13px", background: "var(--bg2)", borderRadius: 8, border: "1px solid var(--border)" }}>
                <I n="info" s={14} style={{ color: "var(--amber)", flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 12.5, color: "var(--text2)" }}>This will send to <strong style={{ color: "var(--amber)" }}>847 users</strong> immediately. Use with care — broadcasts cannot be undone.</div>
              </div>
            </div>
            <div className="mft">
              <button className="btn bg" onClick={() => setBroadModal(false)}>Cancel</button>
              <button className="btn ba" disabled={!broadForm.subject || !broadForm.body}><I n="announce" s={13} />Send Broadcast</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification preview */}
      {toast && (
        <div className="ntf-toast" style={{ animation: "notifSlide .35s ease forwards" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: toast.color + "18", border: `1px solid ${toast.color}2E`, display: "flex", alignItems: "center", justifyContent: "center", color: toast.color, flexShrink: 0 }}>
            <I n={toast.icon} s={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{toast.title}</div>
            <div style={{ fontSize: 12.5, color: "var(--text2)", marginTop: 2 }}>{toast.body}</div>
          </div>
          <button className="btn bg bico" onClick={() => setToast(null)} style={{ flexShrink: 0 }}><I n="x" s={13} /></button>
        </div>
      )}
    </div>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
const SIDENAV = [
  { sec: "Payments", items: [
    { id: "revenue",  icon: "chart",   label: "Revenue Dashboard" },
    { id: "coupons",  icon: "percent", label: "Coupons" },
    { id: "payouts",  icon: "payout",  label: "Payouts" },
    { id: "gateways", icon: "credit",  label: "Gateway Config" },
  ]},
  { sec: "Communication", items: [
    { id: "messaging",      icon: "msg",     label: "Messaging",  badge: true },
    { id: "notifications",  icon: "bell",    label: "Notifications" },
  ]},
  { sec: "Platform", items: [
    { id: "courses", icon: "book",     label: "Courses",  dim: true },
    { id: "grades",  icon: "star",     label: "Grades",   dim: true },
    { id: "users",   icon: "users",    label: "Users",    dim: true },
  ]},
];


export { RevenueDashboard, CouponsView, PayoutsView, GatewayView, MessagingView, NotificationCenter };
