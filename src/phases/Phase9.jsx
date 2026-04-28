import { useState, useEffect, useRef } from 'react';
import { I, Av, Dot, Toggle, Spark, BarChart, Gauge, Donut } from '../shared.jsx';


// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const rng = (a, b) => Math.floor(a + Math.random() * (b - a));

const TOKEN_MONTHLY = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  .map((lbl, i) => ({ lbl, val: rng(2400, 4200), v2: rng(12, 60) }));

const VIOLATION_WEEK = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
  .map((lbl, i) => ({ lbl, val: rng(3, 18), v2: rng(0, 5) }));

const BANDWIDTH_WEEKLY = ["W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12"]
  .map((lbl, i) => ({ lbl, val: rng(160, 280) }));

const LATENCY_HOURLY = Array.from({ length: 24 }, (_, i) => ({
  lbl: String(i).padStart(2, "0"),
  val: rng(12, i > 8 && i < 22 ? 48 : 22),
}));

const VIOLATIONS = [
  { id:"V001", type:"Screen Capture Attempt",   sev:"critical", user:"Elena Vasquez",  av:"EV", col:"#6366F1", file:"react-hooks-deep-dive.mp4",     course:"Advanced React",  ip:"192.168.1.14", ua:"Chrome 124 / macOS",      action:"auto_blocked",  time:"2m ago",    count:1,  resolved:false },
  { id:"V002", type:"Device Limit Exceeded",    sev:"critical", user:"Kenji Tanaka",   av:"KT", col:"#F97316", file:"All DRM files",                 course:"All",             ip:"203.0.113.55", ua:"Multiple devices",        action:"token_revoked", time:"1h ago",    count:3,  resolved:false },
  { id:"V003", type:"Geo-Restriction Block",    sev:"high",     user:"Ali Hassan",     av:"AH", col:"#10B981", file:"ux-sprint-slides.html",          course:"UX Design",       ip:"103.21.244.5", ua:"Firefox 125 / PK",        action:"access_denied", time:"41m ago",   count:1,  resolved:false },
  { id:"V004", type:"Token Replay Attack",      sev:"critical", user:"Unknown",        av:"??", col:"#EF4444", file:"/api/drm/content/3",             course:"ML Fundamentals", ip:"45.33.102.99", ua:"curl/7.88",               action:"ip_blocked",    time:"3h ago",    count:7,  resolved:true  },
  { id:"V005", type:"Watermark Tampering",      sev:"high",     user:"Marcus Webb",    av:"MW", col:"#0EA5E9", file:"figma-component-library.pdf",    course:"UX Design",       ip:"172.16.0.55",  ua:"Adobe Reader 23",         action:"flagged",       time:"5h ago",    count:1,  resolved:false },
  { id:"V006", type:"Offline Cache Exploit",    sev:"high",     user:"Ryan Okafor",    av:"RO", col:"#14B8A6", file:"neural-networks-explained.mp4",  course:"ML Fundamentals", ip:"10.0.0.22",    ua:"VLC / Android",           action:"session_ended", time:"Yesterday", count:2,  resolved:true  },
  { id:"V007", type:"Copy-Paste Block Bypass",  sev:"medium",   user:"Sophie Laurent", av:"SL", col:"#EC4899", file:"typescript-generics-guide.pdf",  course:"Advanced React",  ip:"192.168.2.33", ua:"Chrome 123 / Win",        action:"logged",        time:"Yesterday", count:4,  resolved:true  },
  { id:"V008", type:"DevTools Detection",       sev:"medium",   user:"Unknown",        av:"??", col:"#8B5CF6", file:"lesson-summary.html",            course:"Advanced React",  ip:"192.0.2.44",   ua:"Chrome DevTools",         action:"page_blanked",  time:"2d ago",    count:9,  resolved:true  },
  { id:"V009", type:"Print Block Bypass",       sev:"medium",   user:"Mei Lin",        av:"ML", col:"#F59E0B", file:"gradient-descent-workbook.pdf",  course:"ML Fundamentals", ip:"172.16.0.8",   ua:"Safari 17 / iOS",         action:"logged",        time:"2d ago",    count:2,  resolved:false },
  { id:"V010", type:"Hotlink Protection Hit",   sev:"low",      user:"External",       av:"EX", col:"#84CC16", file:"course-hero-banner.png",         course:"UX Design",       ip:"Various",      ua:"Various bots",            action:"blocked",       time:"3d ago",    count:12, resolved:true  },
];

const ALERT_RULES_INIT = [
  { id:1, name:"Critical Violation Spike",     cond:"violations.critical > 3 in 1h",         action:"Email + Slack",       sev:"critical", active:true,  triggered:2  },
  { id:2, name:"Token Error Rate High",         cond:"token.error_rate > 1% in 5m",           action:"Email",               sev:"high",     active:true,  triggered:0  },
  { id:3, name:"CDN Hit Rate Drop",             cond:"cdn.hit_rate < 90% in 15m",             action:"PagerDuty",           sev:"high",     active:true,  triggered:0  },
  { id:4, name:"Stream Latency P99 > 200ms",   cond:"stream.latency_p99 > 200ms",            action:"Email",               sev:"medium",   active:true,  triggered:1  },
  { id:5, name:"Geo Block Flood",               cond:"geo_blocks > 50 in 10m",                action:"Auto-block subnet",   sev:"high",     active:false, triggered:0  },
  { id:6, name:"Token Replay — New IP",         cond:"token.replay_from_new_ip == true",      action:"Revoke + Alert",      sev:"critical", active:true,  triggered:7  },
];

const SCHEDULED_REPORTS_INIT = [
  { id:1, name:"Weekly Violations Summary",   freq:"Weekly · Mon 09:00",  to:"security@acadlms.dev",    fmt:"PDF",  active:true,  last:"Jun 10" },
  { id:2, name:"Monthly DRM Performance",     freq:"Monthly · 1st 08:00", to:"admin@acadlms.dev",       fmt:"XLSX", active:true,  last:"Jun 1"  },
  { id:3, name:"Daily Token Issuance Log",    freq:"Daily · 00:00",       to:"logs@acadlms.dev",        fmt:"CSV",  active:true,  last:"Today"  },
  { id:4, name:"Quarterly Compliance Report", freq:"Quarterly · Q-end",   to:"compliance@acadlms.dev",  fmt:"PDF",  active:false, last:"Mar 31" },
];

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS VIEW
// ─────────────────────────────────────────────────────────────────────────────
const ReportsView = () => {
  const [sub, setSub]       = useState("overview");
  const [period, setPeriod] = useState("30d");
  const [schedules, setSchedules] = useState(SCHEDULED_REPORTS_INIT);
  const [schedModal, setSchedModal] = useState(false);
  const [newSched, setNewSched] = useState({ name:"", template:"Violation Incident Log", fmt:"PDF", freq:"Weekly", to:"" });
  const setNS = (k, v) => setNewSched(s => ({ ...s, [k]: v }));

  return (
    <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:14 }}>

      {/* Header controls */}
      <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
        <div className="stab-bar">
          {[["overview","Overview"],["tokens","Token Report"],["violations","Violation Report"],["schedule","Scheduled"]].map(([id,lbl]) => (
            <div key={id} className={`stab ${sub===id?"on":""}`} onClick={() => setSub(id)}>{lbl}</div>
          ))}
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:6, alignItems:"center" }}>
          {["7d","30d","90d","1y"].map(p => (
            <div key={p} className={`period-pill ${period===p?"on":""}`} onClick={() => setPeriod(p)}>{p}</div>
          ))}
          <button className="btn bg bsm" style={{ marginLeft:4 }}><I n="dl" s={13}/>Export</button>
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      {sub === "overview" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* KPI row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {[
              { lbl:"Tokens Issued",    val:"38,420", delta:"+12%", col:"var(--amber)", spark:[28,31,30,35,33,38,36,40,38,42] },
              { lbl:"Total Violations", val:"184",    delta:"+3%",  col:"var(--red)",   spark:[8,12,9,14,11,18,14,20,17,22]   },
              { lbl:"Avg Token Latency",val:"18ms",   delta:"-4ms", col:"var(--green)", spark:[24,22,20,19,21,18,20,18,17,18] },
              { lbl:"DRM Uptime",       val:"99.98%", delta:"SLA ✓",col:"var(--teal)",  spark:[100,99.9,100,100,100,100,100,100,100,100] },
            ].map(k => (
              <div className="scard" key={k.lbl}>
                <div className="sg" style={{ background:k.col }}/>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{k.lbl}</div>
                    <div style={{ fontSize:26, fontWeight:800, color:k.col, fontFamily:"var(--mono)", marginTop:4 }}>{k.val}</div>
                    <div style={{ fontSize:11.5, color:k.delta.startsWith("-")?"var(--green)":"var(--text2)", marginTop:3, fontWeight:600 }}>{k.delta} vs prev period</div>
                  </div>
                  <Spark data={k.spark} color={k.col} w={66} h={26}/>
                </div>
              </div>
            ))}
          </div>

          {/* Two charts */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div className="card">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>Token Issuance — Monthly</div>
                <div style={{ display:"flex", gap:10, fontSize:12, color:"var(--text3)" }}>
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}><Dot c="var(--amber)" sz={7}/>Issued</span>
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}><Dot c="var(--red)" sz={7}/>Revoked</span>
                </div>
              </div>
              <BarChart data={TOKEN_MONTHLY} color="var(--amber)" color2="var(--red)" h={110} v2k="v2"/>
            </div>
            <div className="card">
              <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Daily Violations — Last 7 Days</div>
              <BarChart data={VIOLATION_WEEK} color="var(--orange)" color2="var(--red)" h={110} v2k="v2"/>
            </div>
          </div>

          {/* Donut + top violators */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div className="card">
              <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Violation Type Breakdown</div>
              <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                <Donut total="184" cx={60} r={24} stroke={7} slices={[
                  { pct:32, color:"var(--red)"    },
                  { pct:24, color:"var(--orange)" },
                  { pct:18, color:"var(--amber)"  },
                  { pct:14, color:"var(--indigo)" },
                  { pct:12, color:"var(--teal)"   },
                ]}/>
                <div style={{ flex:1, display:"flex", flexDirection:"column", gap:7 }}>
                  {[
                    ["Screen Capture", 59,  "var(--red)"    ],
                    ["Device Limit",   44,  "var(--orange)" ],
                    ["Geo Block",      33,  "var(--amber)"  ],
                    ["Token Replay",   26,  "var(--indigo)" ],
                    ["Other",          22,  "var(--teal)"   ],
                  ].map(([lbl,cnt,col]) => (
                    <div key={lbl} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <Dot c={col} sz={7}/>
                      <span style={{ flex:1, fontSize:12.5, fontWeight:600 }}>{lbl}</span>
                      <span style={{ fontFamily:"var(--mono)", fontSize:12.5, color:col, fontWeight:700, minWidth:22 }}>{cnt}</span>
                      <div style={{ width:56 }}><div className="prog"><div className="pb" style={{ width:`${(cnt/59)*100}%`, background:col }}/></div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Top Violating Users</div>
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {[
                  { user:"Kenji Tanaka",    av:"KT", col:"#F97316", n:14, t:"+5" },
                  { user:"Unknown IPs",     av:"??", col:"#EF4444", n:11, t:"+8" },
                  { user:"Marcus Webb",     av:"MW", col:"#0EA5E9", n:7,  t:"-1" },
                  { user:"Sophie Laurent",  av:"SL", col:"#EC4899", n:6,  t:"0"  },
                  { user:"Ali Hassan",      av:"AH", col:"#10B981", n:4,  t:"+2" },
                ].map(u => (
                  <div key={u.user} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Av i={u.av} c={u.col} sz={28}/>
                    <span style={{ flex:1, fontSize:13, fontWeight:600 }}>{u.user}</span>
                    <span style={{ fontFamily:"var(--mono)", fontWeight:800, fontSize:14, color:u.col, minWidth:20 }}>{u.n}</span>
                    <span style={{ fontSize:11.5, fontWeight:700, color:u.t.startsWith("+")?"var(--red)":u.t==="0"?"var(--text3)":"var(--green)", minWidth:24, textAlign:"right" }}>{u.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOKEN REPORT ── */}
      {sub === "tokens" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {[
              { lbl:"Total Issued", val:"38,420", col:"var(--amber)"  },
              { lbl:"Active Now",   val:"1,842",  col:"var(--green)"  },
              { lbl:"Revoked",      val:"312",    col:"var(--red)"    },
              { lbl:"Error Rate",   val:"0.12%",  col:"var(--indigo)" },
            ].map(s => (
              <div className="scard" key={s.lbl}>
                <div className="sg" style={{ background:s.col }}/>
                <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{s.lbl}</div>
                <div style={{ fontSize:24, fontWeight:800, color:s.col, fontFamily:"var(--mono)", marginTop:3 }}>{s.val}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Token Issuance — Monthly (12 months)</div>
            <BarChart data={TOKEN_MONTHLY} color="var(--amber)" color2="var(--red)" h={140} v2k="v2"/>
          </div>
          <div className="tbl">
            <table>
              <thead><tr>{["Profile","Issued","Active","Expired","Revoked","Error Rate","Avg TTL"].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {[
                  ["Enterprise","18,240","1,102","16,841","297","0.09%","3600s"],
                  ["Trial",     "12,840","480",  "12,201","159","0.22%","900s" ],
                  ["Corporate", "4,920", "184",  "4,710", "26", "0.08%","1800s"],
                  ["Creator",   "2,420", "76",   "2,344", "0",  "0.00%","86400s"],
                ].map(([p,...rest]) => (
                  <tr key={p}>
                    <td><span className="badge BA" style={{ fontSize:11 }}>{p}</span></td>
                    {rest.map((v,i) => <td key={i} style={{ fontFamily:"var(--mono)", fontSize:12.5, color:"var(--text2)" }}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Bandwidth Usage — Weekly (GB)</div>
            <BarChart data={BANDWIDTH_WEEKLY} color="var(--indigo)" h={120}/>
          </div>
        </div>
      )}

      {/* ── VIOLATION REPORT ── */}
      {sub === "violations" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
            {[
              { lbl:"Total",    val:184, col:"var(--text)"   },
              { lbl:"Critical", val:59,  col:"var(--red)"    },
              { lbl:"High",     val:44,  col:"var(--orange)" },
              { lbl:"Medium",   val:55,  col:"var(--amber)"  },
              { lbl:"Low",      val:26,  col:"var(--teal)"   },
            ].map(s => (
              <div className="scard" key={s.lbl}>
                <div className="sg" style={{ background:s.col }}/>
                <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{s.lbl}</div>
                <div style={{ fontSize:24, fontWeight:800, color:s.col, fontFamily:"var(--mono)", marginTop:3 }}>{s.val}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div className="card">
              <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Violations by Day of Week</div>
              <BarChart data={VIOLATION_WEEK} color="var(--orange)" color2="var(--red)" h={110} v2k="v2"/>
            </div>
            <div className="card">
              <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Resolution Actions</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:4 }}>
                {[
                  ["Auto-blocked",  42, "var(--red)"    ],
                  ["Token revoked", 28, "var(--orange)" ],
                  ["IP blocked",    18, "var(--violet)" ],
                  ["Logged only",   62, "var(--amber)"  ],
                  ["Resolved",      34, "var(--green)"  ],
                ].map(([lbl,n,col]) => (
                  <div key={lbl}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ fontSize:13, fontWeight:600 }}>{lbl}</span>
                      <span style={{ fontFamily:"var(--mono)", fontSize:13, fontWeight:700, color:col }}>{n}</span>
                    </div>
                    <div className="prog"><div className="pb" style={{ width:`${(n/62)*100}%`, background:col }}/></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Violation Heatmap — Hour × Day of Week</div>
            <div style={{ overflowX:"auto" }}>
              <div style={{ display:"grid", gridTemplateColumns:"50px repeat(24,1fr)", gap:3, minWidth:620 }}>
                <div/>
                {Array.from({ length:24 }, (_,h) => (
                  <div key={h} style={{ fontSize:9, color:"var(--text3)", textAlign:"center", fontFamily:"var(--mono)", paddingBottom:3 }}>{String(h).padStart(2,"0")}</div>
                ))}
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => (
                  [
                    <div key={day+"l"} style={{ fontSize:11, color:"var(--text2)", display:"flex", alignItems:"center", fontWeight:600 }}>{day}</div>,
                    ...Array.from({ length:24 }, (_, h) => {
                      const isPeak = h >= 9 && h <= 22;
                      const raw    = rng(0, 10) * (isPeak ? 1.5 : 0.5);
                      const alpha  = Math.min(raw / 15, 1);
                      return (
                        <div key={`${day}-${h}`} className="hm"
                          title={`${day} ${String(h).padStart(2,"0")}:00 — ${Math.floor(raw)} violations`}
                          style={{ height:18, background:`rgba(239,68,68,${alpha.toFixed(2)})`, borderRadius:3, border:"1px solid rgba(239,68,68,.06)" }}/>
                      );
                    })
                  ]
                ))}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10 }}>
              <span style={{ fontSize:11, color:"var(--text3)" }}>Low</span>
              {[.08,.2,.35,.55,.75,1].map(a => <div key={a} style={{ width:14, height:14, borderRadius:3, background:`rgba(239,68,68,${a})` }}/>)}
              <span style={{ fontSize:11, color:"var(--text3)" }}>High</span>
            </div>
          </div>
        </div>
      )}

      {/* ── SCHEDULED REPORTS ── */}
      {sub === "schedule" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:13, color:"var(--text2)" }}>Automated report delivery to configured recipients</div>
            <button className="btn ba" onClick={() => setSchedModal(true)}><I n="plus" s={14}/>New Schedule</button>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {schedules.map(s => (
              <div key={s.id} style={{ background:"var(--card2)", border:"1px solid var(--border)", borderRadius:9, padding:"13px 16px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:"var(--adim)", border:"1px solid var(--aglow)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--amber)", flexShrink:0 }}>
                  <I n="mail" s={16}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13.5 }}>{s.name}</div>
                  <div style={{ fontSize:12, color:"var(--text3)", marginTop:3, display:"flex", gap:12, flexWrap:"wrap" }}>
                    <span><I n="clock" s={11}/> {s.freq}</span>
                    <span><I n="mail" s={11}/> {s.to}</span>
                    <span><I n="file" s={11}/> {s.fmt}</span>
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:11, color:"var(--text3)" }}>Last: {s.last}</div>
                  <div style={{ display:"flex", gap:6, marginTop:8, justifyContent:"flex-end" }}>
                    <button className="btn bg bxs"><I n="dl" s={12}/>Preview</button>
                    <button className="btn bg bxs"><I n="edit" s={12}/></button>
                  </div>
                </div>
                <Toggle on={s.active} onChange={v => setSchedules(ss => ss.map(x => x.id===s.id ? {...x,active:v} : x))} cls="grn"/>
              </div>
            ))}
          </div>

          {/* Templates */}
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Report Templates</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {[
                ["DRM Coverage Report",    "shield",   "Protected vs unprotected files per course"],
                ["License Audit Trail",    "key",      "All license issuances, revocations, changes"],
                ["User Access Log",        "users",    "Per-user content access and token history"],
                ["Violation Incident Log", "alert",    "Full violation log with evidence details"],
                ["Performance SLA Report", "activity", "Latency, uptime, error rates vs SLA"],
                ["Geo Access Report",      "globe",    "Content access by country with block summary"],
              ].map(([name, icon, desc]) => (
                <div key={name} className="card2" style={{ cursor:"pointer" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="var(--border3)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="var(--border)"}>
                  <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <div style={{ color:"var(--amber)", marginTop:1, flexShrink:0 }}><I n={icon} s={15}/></div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13 }}>{name}</div>
                      <div style={{ fontSize:11.5, color:"var(--text3)", marginTop:3, lineHeight:1.5 }}>{desc}</div>
                      <button className="btn bg bxs" style={{ marginTop:9, fontSize:11 }}><I n="dl" s={11}/>Generate</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Schedule modal */}
      {schedModal && (
        <div className="ov" onClick={e => e.target===e.currentTarget && setSchedModal(false)}>
          <div className="modal" style={{ maxWidth:480 }}>
            <div className="mhd">
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>New Report Schedule</div>
                <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>Configure automated delivery</div>
              </div>
              <button className="btn bg bico" onClick={() => setSchedModal(false)}><I n="x" s={15}/></button>
            </div>
            <div className="mbd">
              <div className="fl"><label className="lbl">Report Name</label><input className="inp" placeholder="e.g. Weekly Violations Summary" value={newSched.name} onChange={e => setNS("name",e.target.value)}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div className="fl"><label className="lbl">Template</label>
                  <select className="sel" value={newSched.template} onChange={e => setNS("template",e.target.value)}>
                    <option>Violation Incident Log</option><option>DRM Coverage Report</option><option>Token Issuance Report</option><option>Performance SLA</option>
                  </select>
                </div>
                <div className="fl"><label className="lbl">Format</label>
                  <select className="sel" value={newSched.fmt} onChange={e => setNS("fmt",e.target.value)}>
                    <option>PDF</option><option>XLSX</option><option>CSV</option><option>JSON</option>
                  </select>
                </div>
              </div>
              <div className="fl"><label className="lbl">Frequency</label>
                <select className="sel" value={newSched.freq} onChange={e => setNS("freq",e.target.value)}>
                  <option>Daily</option><option>Weekly</option><option>Monthly</option><option>Quarterly</option>
                </select>
              </div>
              <div className="fl"><label className="lbl">Recipients</label><input className="inp" placeholder="admin@acadlms.dev, security@acadlms.dev" value={newSched.to} onChange={e => setNS("to",e.target.value)}/></div>
            </div>
            <div className="mft">
              <button className="btn bg" onClick={() => setSchedModal(false)}>Cancel</button>
              <button className="btn ba" onClick={() => {
                if (newSched.name && newSched.to) {
                  setSchedules(ss => [...ss, { id:Date.now(), name:newSched.name, freq:`${newSched.freq} schedule`, to:newSched.to, fmt:newSched.fmt, active:true, last:"Never" }]);
                }
                setSchedModal(false);
              }}><I n="check" s={13}/>Save Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// VIOLATIONS VIEW
// ─────────────────────────────────────────────────────────────────────────────
const ViolationDetail = ({ v }) => {
  const ACTION_COLOR = { auto_blocked:"var(--red)", token_revoked:"var(--orange)", access_denied:"var(--orange)", ip_blocked:"var(--red)", flagged:"var(--amber)", session_ended:"var(--amber)", logged:"var(--text3)", page_blanked:"var(--indigo)", blocked:"var(--red)" };
  return (
    <div style={{ padding:"13px 16px 13px 68px", borderBottom:"1px solid var(--border)", background:"rgba(15,23,40,.7)", animation:"fadeIn .18s ease" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:9, marginBottom:12 }}>
        {[["ID",v.id],["Course",v.course],["IP",v.ip],["User-Agent",v.ua]].map(([k,val]) => (
          <div key={k} className="card2">
            <div style={{ fontSize:9.5, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>{k}</div>
            <div style={{ fontSize:12.5, fontWeight:600, marginTop:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:k==="IP"||k==="ID"?"var(--mono)":"var(--font)" }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:7 }}>
        <button className="btn bd bsm"><I n="ban" s={12}/>Block User</button>
        <button className="btn bg bsm"><I n="globe" s={12}/>Block IP</button>
        <button className="btn bg bsm"><I n="eye" s={12}/>Full Log</button>
        {!v.resolved && <button className="btn bt bsm"><I n="check" s={12}/>Mark Resolved</button>}
      </div>
    </div>
  );
};

const ViolationsView = () => {
  const [violations, setViolations] = useState(VIOLATIONS);
  const [expanded, setExpanded]     = useState(null);
  const [search, setSearch]         = useState("");
  const [sevF, setSevF]             = useState("all");
  const [statF, setStatF]           = useState("all");
  const [alertRules, setAlertRules] = useState(ALERT_RULES_INIT);
  const [sub, setSub]               = useState("log");
  const [ruleModal, setRuleModal]   = useState(false);
  const [newRule, setNewRule]       = useState({ name:"", cond:"", action:"Email", sev:"medium" });
  const setNR = (k,v) => setNewRule(r => ({ ...r, [k]:v }));

  const SEV_CLS = { critical:"sc sc-crit", high:"sc sc-high", medium:"sc sc-med", low:"sc sc-low" };
  const ACT_COL = { auto_blocked:"var(--red)", token_revoked:"var(--orange)", access_denied:"var(--orange)", ip_blocked:"var(--red)", flagged:"var(--amber)", session_ended:"var(--amber)", logged:"var(--text3)", page_blanked:"var(--indigo)", blocked:"var(--red)" };

  const filtered = violations.filter(v => {
    const q = search.toLowerCase();
    return (
      (v.type.toLowerCase().includes(q) || v.user.toLowerCase().includes(q) || v.file.toLowerCase().includes(q)) &&
      (sevF === "all" || v.sev === sevF) &&
      (statF === "all" || (statF === "open" ? !v.resolved : v.resolved))
    );
  });

  return (
    <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:14 }}>
      <div className="stab-bar">
        {[["log","Violation Log"],["alerts","Alert Rules"],["blocked","Blocked Entities"]].map(([id,lbl]) => (
          <div key={id} className={`stab ${sub===id?"on":""}`} onClick={() => setSub(id)}>{lbl}</div>
        ))}
      </div>

      {/* ── LOG ── */}
      {sub === "log" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Summary KPIs */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {[
              { lbl:"Open",      val:violations.filter(v=>!v.resolved).length, col:"var(--red)"    },
              { lbl:"Critical",  val:violations.filter(v=>v.sev==="critical").length, col:"var(--orange)" },
              { lbl:"Resolved",  val:violations.filter(v=>v.resolved).length,  col:"var(--green)"  },
              { lbl:"This Week", val:violations.length,                        col:"var(--amber)"  },
            ].map(s => (
              <div className="scard" key={s.lbl}>
                <div className="sg" style={{ background:s.col }}/>
                <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{s.lbl}</div>
                <div style={{ fontSize:24, fontWeight:800, color:s.col, fontFamily:"var(--mono)", marginTop:3 }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div style={{ display:"flex", gap:9, alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:7, flex:1 }}>
              <span style={{ padding:"0 11px", color:"var(--text3)" }}><I n="search" s={14}/></span>
              <input style={{ background:"none", border:"none", padding:"8px", color:"var(--text)", fontSize:13, outline:"none", flex:1 }} placeholder="Search violations…" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <select className="sel" style={{ width:150 }} value={sevF} onChange={e => setSevF(e.target.value)}>
              <option value="all">All Severity</option>
              {["critical","high","medium","low"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </select>
            <select className="sel" style={{ width:130 }} value={statF} onChange={e => setStatF(e.target.value)}>
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
            <button className="btn bg bsm"><I n="dl" s={13}/>Export</button>
          </div>

          {/* Violation list */}
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:11, overflow:"hidden" }}>
            {filtered.length === 0 && (
              <div style={{ padding:"36px", textAlign:"center", color:"var(--text3)", fontSize:13 }}>No violations match current filters.</div>
            )}
            {filtered.map(v => (
              <div key={v.id}>
                <div className="vrow" onClick={() => setExpanded(expanded===v.id ? null : v.id)}>
                  <Av i={v.av} c={v.col} sz={34}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
                      <span style={{ fontWeight:700, fontSize:13.5 }}>{v.type}</span>
                      <span className={SEV_CLS[v.sev]}>{v.sev}</span>
                      {v.resolved && <span className="badge BG" style={{ fontSize:10 }}>Resolved</span>}
                    </div>
                    <div style={{ fontSize:12.5, color:"var(--text2)", marginTop:2 }}>
                      {v.user} · <span style={{ color:"var(--text3)" }}>{v.file}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:12.5, fontWeight:700, color:ACT_COL[v.action]||"var(--text2)" }}>{v.action.replace(/_/g," ")}</div>
                    <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>{v.time}{v.count>1 ? ` · ${v.count}× attempts` : ""}</div>
                  </div>
                  <div style={{ color:"var(--text3)", flexShrink:0 }}><I n={expanded===v.id?"chevD":"chevR"} s={14}/></div>
                </div>
                {expanded === v.id && <ViolationDetail v={v}/>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ALERT RULES ── */}
      {sub === "alerts" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <button className="btn ba" onClick={() => setRuleModal(true)}><I n="plus" s={14}/>New Alert Rule</button>
          </div>
          {alertRules.map(rule => (
            <div key={rule.id} className={`arule ${rule.active && rule.triggered > 0 ? "firing" : ""}`}>
              <div style={{ width:36, height:36, borderRadius:9, background:rule.active?"rgba(239,68,68,.1)":"var(--bg2)", border:`1px solid ${rule.active?"rgba(239,68,68,.25)":"var(--border)"}`, display:"flex", alignItems:"center", justifyContent:"center", color:rule.active?"var(--red)":"var(--text3)", flexShrink:0 }}>
                <I n="bell" s={15}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
                  <span style={{ fontWeight:700, fontSize:13.5 }}>{rule.name}</span>
                  <span className={SEV_CLS[rule.sev]}>{rule.sev}</span>
                  {rule.triggered > 0 && <span className="badge BR" style={{ fontSize:10 }}>{rule.triggered}× triggered</span>}
                </div>
                <code style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--teal)", marginTop:3, display:"block" }}>{rule.cond}</code>
                <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>Action: <span style={{ color:"var(--text2)", fontWeight:600 }}>{rule.action}</span></div>
              </div>
              <button className="btn bg bxs"><I n="edit" s={12}/></button>
              <Toggle on={rule.active} onChange={v => setAlertRules(rs => rs.map(r => r.id===rule.id ? {...r,active:v} : r))} cls="red"/>
            </div>
          ))}
        </div>
      )}

      {/* ── BLOCKED ENTITIES ── */}
      {sub === "blocked" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div className="card" style={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:"13px 16px", borderBottom:"1px solid var(--border)", fontWeight:700, fontSize:14 }}>Blocked IP Addresses</div>
            {[
              { ip:"45.33.102.99",  reason:"Token replay attack",  when:"1h ago",  auto:true  },
              { ip:"103.21.244.5",  reason:"CIDR blocklist match", when:"2d ago",  auto:true  },
              { ip:"192.0.2.44",    reason:"DevTools flood",       when:"3d ago",  auto:false },
              { ip:"198.51.100.22", reason:"Geo-fenced country",   when:"5d ago",  auto:true  },
              { ip:"203.0.113.10",  reason:"Manual admin block",   when:"1w ago",  auto:false },
            ].map(b => (
              <div key={b.ip} style={{ padding:"11px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
                <code style={{ fontFamily:"var(--mono)", fontSize:13, color:"var(--red)", flex:1 }}>{b.ip}</code>
                <span style={{ fontSize:12, color:"var(--text3)", flex:1 }}>{b.reason}</span>
                <span style={{ fontSize:11, color:"var(--text3)", whiteSpace:"nowrap" }}>{b.when}</span>
                {b.auto && <span className="badge BX" style={{ fontSize:10 }}>Auto</span>}
                <button className="btn bg bxs" style={{ fontSize:11 }}>Unblock</button>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:"13px 16px", borderBottom:"1px solid var(--border)", fontWeight:700, fontSize:14 }}>Flagged Users</div>
            {[
              { user:"Kenji Tanaka",  av:"KT", col:"#F97316", reason:"Device limit × 3",     since:"1h ago", status:"flagged" },
              { user:"Unknown",       av:"??", col:"#EF4444", reason:"Token replay × 7",     since:"3h ago", status:"blocked" },
              { user:"Marcus Webb",   av:"MW", col:"#0EA5E9", reason:"Watermark tamper",     since:"5h ago", status:"flagged" },
              { user:"External bots", av:"🤖", col:"#8B5CF6", reason:"Hotlink flood × 12",   since:"3d ago", status:"blocked" },
            ].map(u => (
              <div key={u.user} style={{ padding:"11px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
                <Av i={u.av} c={u.col} sz={28}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{u.user}</div>
                  <div style={{ fontSize:11.5, color:"var(--text3)", marginTop:1 }}>{u.reason}</div>
                </div>
                <span style={{ fontSize:11, color:"var(--text3)" }}>{u.since}</span>
                <span className={u.status==="blocked"?"badge BR":"badge BA"} style={{ fontSize:10 }}>{u.status}</span>
                <button className="btn bg bxs" style={{ fontSize:11 }}>Review</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rule modal */}
      {ruleModal && (
        <div className="ov" onClick={e => e.target===e.currentTarget && setRuleModal(false)}>
          <div className="modal" style={{ maxWidth:480 }}>
            <div className="mhd">
              <div><div style={{ fontWeight:700, fontSize:15 }}>New Alert Rule</div><div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>Define condition-based alert triggers</div></div>
              <button className="btn bg bico" onClick={() => setRuleModal(false)}><I n="x" s={15}/></button>
            </div>
            <div className="mbd">
              <div className="fl"><label className="lbl">Rule Name</label><input className="inp" placeholder="e.g. High Violation Rate" value={newRule.name} onChange={e => setNR("name",e.target.value)}/></div>
              <div className="fl"><label className="lbl">Condition (DSL)</label><input className="inp" placeholder='violations.count > 5 in 10m' value={newRule.cond} onChange={e => setNR("cond",e.target.value)} style={{ fontFamily:"var(--mono)", fontSize:12.5 }}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div className="fl"><label className="lbl">Severity</label>
                  <select className="sel" value={newRule.sev} onChange={e => setNR("sev",e.target.value)}>
                    <option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                  </select>
                </div>
                <div className="fl"><label className="lbl">Action</label>
                  <select className="sel" value={newRule.action} onChange={e => setNR("action",e.target.value)}>
                    <option>Email</option><option>Email + Slack</option><option>PagerDuty</option><option>Auto-block subnet</option><option>Revoke + Alert</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mft">
              <button className="btn bg" onClick={() => setRuleModal(false)}>Cancel</button>
              <button className="btn ba" onClick={() => {
                if (newRule.name && newRule.cond) {
                  setAlertRules(rs => [...rs, { id:Date.now(), name:newRule.name, cond:newRule.cond, action:newRule.action, sev:newRule.sev, active:true, triggered:0 }]);
                }
                setRuleModal(false);
              }}><I n="check" s={13}/>Create Rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE MONITORING VIEW
// ─────────────────────────────────────────────────────────────────────────────
const PerformanceView = () => {
  const [sub, setSub]               = useState("realtime");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [live, setLive]             = useState({ streams:247, latency:18, tokenRate:142, errRate:0.12 });
  const [hist, setHist]             = useState({
    streams:   Array.from({ length:20 }, () => rng(200,300)),
    latency:   Array.from({ length:20 }, () => rng(12,40)),
    tokenRate: Array.from({ length:20 }, () => rng(100,190)),
  });

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(() => {
      setLive(d => ({
        streams:   Math.max(200, Math.min(300, d.streams + rng(-6,6))),
        latency:   Math.max(10,  Math.min(60,  d.latency + rng(-4,4))),
        tokenRate: Math.max(80,  Math.min(200, d.tokenRate + rng(-10,10))),
        errRate:   Math.max(0,   Math.min(2,   +(d.errRate + (Math.random()*.1-.05)).toFixed(2))),
      }));
      setHist(h => ({
        streams:   [...h.streams.slice(1),   rng(200,300)],
        latency:   [...h.latency.slice(1),   rng(12,40)],
        tokenRate: [...h.tokenRate.slice(1), rng(100,190)],
      }));
    }, 1800);
    return () => clearInterval(t);
  }, [autoRefresh]);

  const SVC_STATUS = [
    { name:"DRM Token Server",     status:"operational", lat:"18ms",  up:"99.99%" },
    { name:"Key Management Server",status:"operational", lat:"8ms",   up:"99.99%" },
    { name:"Cloudflare R2",        status:"operational", lat:"12ms",  up:"99.98%" },
    { name:"HLS Encryption",       status:"operational", lat:"24ms",  up:"99.97%" },
    { name:"CDN Edge Network",     status:"operational", lat:"6ms",   up:"100.0%" },
    { name:"Watermark Engine",     status:"degraded",    lat:"142ms", up:"98.20%" },
  ];

  return (
    <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:14 }}>

      {/* Controls */}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div className="stab-bar">
          {[["realtime","Real-time"],["latency","Latency Analysis"],["sla","SLA Dashboard"]].map(([id,lbl]) => (
            <div key={id} className={`stab ${sub===id?"on":""}`} onClick={() => setSub(id)}>{lbl}</div>
          ))}
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12.5, color:autoRefresh?"var(--green)":"var(--text3)", fontWeight:600 }}>
            {autoRefresh ? <div className="live-dot"/> : <Dot c="var(--text3)" sz={7}/>}
            {autoRefresh ? "Live" : "Paused"}
          </div>
          <Toggle on={autoRefresh} onChange={setAutoRefresh} cls="grn"/>
        </div>
      </div>

      {/* ── REAL-TIME ── */}
      {sub === "realtime" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Live KPIs */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {[
              { lbl:"Concurrent Streams", val:live.streams,   unit:"",   col:"var(--green)",  sparkData:hist.streams   },
              { lbl:"Token Latency",      val:live.latency,   unit:"ms", col:"var(--amber)",  sparkData:hist.latency   },
              { lbl:"Tokens / min",       val:live.tokenRate, unit:"",   col:"var(--indigo)", sparkData:hist.tokenRate },
              { lbl:"Error Rate",         val:live.errRate,   unit:"%",  col:live.errRate>1?"var(--red)":"var(--teal)", sparkData:[.1,.12,.09,.11,.13,.1,.12,.11,.12,.1,.09,.12] },
            ].map(k => (
              <div className="scard" key={k.lbl}>
                <div className="sg" style={{ background:k.col }}/>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{k.lbl}</div>
                    <div style={{ fontSize:28, fontWeight:800, color:k.col, fontFamily:"var(--mono)", marginTop:4, transition:"all .4s" }}>{k.val}{k.unit}</div>
                  </div>
                  {autoRefresh && <Dot c="var(--green)" sz={6}/>}
                </div>
                <Spark data={k.sparkData} color={k.col} w={130} h={30}/>
              </div>
            ))}
          </div>

          {/* Health Gauges */}
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>System Health</div>
            <div style={{ display:"flex", justifyContent:"space-around", flexWrap:"wrap", gap:12 }}>
              <Gauge value={97.4}  max={100} color="var(--green)"  label="CDN Hit Rate"   unit="%"/>
              <Gauge value={99.98} max={100} color="var(--teal)"   label="Storage Uptime" unit="%"/>
              <Gauge value={99.99} max={100} color="var(--amber)"  label="DRM Engine"     unit="%"/>
              <Gauge value={99.3}  max={100} color="var(--indigo)" label="Detect Rate"    unit="%"/>
              <Gauge value={99.88} max={100} color="var(--violet)" label="Token Success"  unit="%"/>
            </div>
          </div>

          {/* Service status */}
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Service Status</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {SVC_STATUS.map(svc => (
                <div key={svc.name} className="card2" style={{ borderColor: svc.status==="degraded" ? "rgba(249,115,22,.3)" : "var(--border)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7 }}>
                    <Dot c={svc.status==="operational"?"var(--green)":"var(--orange)"} sz={7}/>
                    <span style={{ fontWeight:700, fontSize:13, flex:1 }}>{svc.name}</span>
                    {svc.status==="degraded" && <span className="badge BO" style={{ fontSize:10 }}>Degraded</span>}
                  </div>
                  <div style={{ display:"flex", gap:14 }}>
                    <div>
                      <div style={{ fontSize:9.5, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".04em" }}>Latency</div>
                      <div style={{ fontFamily:"var(--mono)", fontWeight:700, fontSize:13, color:svc.status==="degraded"?"var(--orange)":"var(--green)", marginTop:1 }}>{svc.lat}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:9.5, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".04em" }}>Uptime</div>
                      <div style={{ fontFamily:"var(--mono)", fontWeight:700, fontSize:13, color:"var(--teal)", marginTop:1 }}>{svc.up}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LATENCY ANALYSIS ── */}
      {sub === "latency" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {[
              { lbl:"Token Issuance P50", val:"18ms",  col:"var(--green)"  },
              { lbl:"Token Issuance P95", val:"42ms",  col:"var(--amber)"  },
              { lbl:"Token Issuance P99", val:"87ms",  col:"var(--orange)" },
              { lbl:"Decryption P50",     val:"24ms",  col:"var(--green)"  },
              { lbl:"Decryption P95",     val:"68ms",  col:"var(--amber)"  },
              { lbl:"Decryption P99",     val:"142ms", col:"var(--red)"    },
            ].map(s => (
              <div className="scard" key={s.lbl}>
                <div className="sg" style={{ background:s.col }}/>
                <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{s.lbl}</div>
                <div style={{ fontSize:22, fontWeight:800, color:s.col, fontFamily:"var(--mono)", marginTop:3 }}>{s.val}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Token Latency by Hour (24h)</div>
            <BarChart data={LATENCY_HOURLY} color="var(--amber)" h={130}/>
          </div>

          {/* CDN edge latency */}
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>CDN Edge Node Latency</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
              {[
                { region:"North America", lat:18, col:"var(--green)"  },
                { region:"Europe",        lat:32, col:"var(--green)"  },
                { region:"Asia Pacific",  lat:64, col:"var(--amber)"  },
                { region:"South America", lat:110,col:"var(--orange)" },
                { region:"Middle East",   lat:88, col:"var(--amber)"  },
                { region:"Africa",        lat:140,col:"var(--red)"    },
                { region:"South Asia",    lat:54, col:"var(--green)"  },
                { region:"East Asia",     lat:42, col:"var(--green)"  },
              ].map(e => (
                <div key={e.region} className="card2">
                  <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".04em", marginBottom:5 }}>{e.region}</div>
                  <div style={{ fontFamily:"var(--mono)", fontWeight:800, fontSize:18, color:e.col }}>{e.lat}ms</div>
                  <div className="prog" style={{ marginTop:6 }}><div className="pb" style={{ width:`${Math.min((e.lat/140)*100,100)}%`, background:e.col }}/></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SLA DASHBOARD ── */}
      {sub === "sla" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* SLA targets vs actual */}
          <div className="card" style={{ background:"linear-gradient(135deg,rgba(245,158,11,.05),rgba(99,102,241,.04))", borderColor:"rgba(245,158,11,.15)" }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>Current SLA Period — June 2024</div>
            <div style={{ fontSize:13, color:"var(--text2)" }}>All SLA targets met for 30 consecutive days. Next review: July 1, 2024.</div>
          </div>

          <div className="tbl">
            <table>
              <thead><tr>{["Metric","SLA Target","Actual","Status","30d Trend"].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {[
                  ["DRM Engine Uptime",     "99.9%",  "99.99%", true,  [99.9,100,100,100,99.95,100,100] ],
                  ["Token Issuance P99",    "< 200ms","87ms",   true,  [120,95,110,88,92,87,87]          ],
                  ["Token Issuance P50",    "< 50ms", "18ms",   true,  [26,22,20,19,20,18,18]            ],
                  ["CDN Hit Rate",          "≥ 95%",  "97.4%",  true,  [95.1,96,97,97.2,97.3,97.4,97.4] ],
                  ["Violation Detect Rate", "≥ 99%",  "99.3%",  true,  [99,99.1,99.2,99.2,99.3,99.3,99.3]],
                  ["Watermark Engine Uptime","99.5%", "98.2%",  false, [99.8,99.7,99.5,99.2,98.8,98.4,98.2]],
                ].map(([metric, target, actual, ok, trend]) => (
                  <tr key={metric}>
                    <td style={{ fontWeight:600 }}>{metric}</td>
                    <td style={{ fontFamily:"var(--mono)", fontSize:12.5, color:"var(--text3)" }}>{target}</td>
                    <td style={{ fontFamily:"var(--mono)", fontSize:13, fontWeight:700, color:ok?"var(--green)":"var(--red)" }}>{actual}</td>
                    <td>{ok ? <span className="badge BG" style={{ fontSize:10.5 }}>✓ Met</span> : <span className="badge BR" style={{ fontSize:10.5 }}>✗ Breached</span>}</td>
                    <td><Spark data={trend} color={ok?"var(--green)":"var(--red)"} w={80} h={22}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Incident log */}
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Incident History (30d)</div>
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {[
                { date:"Jun 08", duration:"4m 12s", service:"Watermark Engine", impact:"Degraded watermark injection for 312 delivery requests", sev:"minor",  resolved:true  },
                { date:"May 31", duration:"0m 47s", service:"DRM Token Server", impact:"Elevated latency P99 >200ms — token issuance throttled",  sev:"minor",  resolved:true  },
                { date:"May 22", duration:"12m 0s", service:"CDN Edge / APAC",  impact:"CDN hit rate dropped to 78% for Asia-Pacific region",       sev:"major",  resolved:true  },
                { date:"May 14", duration:"1m 03s", service:"Key Server",       impact:"Brief key retrieval timeout — 18 tokens failed to issue",   sev:"minor",  resolved:true  },
              ].map(inc => (
                <div key={inc.date} style={{ display:"flex", gap:12, padding:"12px 0", borderBottom:"1px solid var(--border)", alignItems:"flex-start" }}>
                  <div style={{ flexShrink:0, width:54, fontFamily:"var(--mono)", fontSize:12, color:"var(--text3)", fontWeight:700 }}>{inc.date}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap" }}>
                      <span style={{ fontWeight:700, fontSize:13 }}>{inc.service}</span>
                      <span className={inc.sev==="major"?"badge BR":"badge BA"} style={{ fontSize:10 }}>{inc.sev}</span>
                      <span className="badge BG" style={{ fontSize:10 }}>Resolved</span>
                    </div>
                    <div style={{ fontSize:12.5, color:"var(--text2)", marginTop:3 }}>{inc.impact}</div>
                  </div>
                  <div style={{ flexShrink:0, fontFamily:"var(--mono)", fontSize:12, color:"var(--teal)", fontWeight:700 }}>{inc.duration}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
const SIDENAV = [
  { sec:"Phase 9", items:[
    { id:"reports",    icon:"chart",    label:"DRM Reports"        },
    { id:"violations", icon:"alert",    label:"Violations"         },
    { id:"perf",       icon:"activity", label:"Performance"        },
  ]},
  { sec:"DRM Core", items:[
    { id:"ph8", icon:"shield",  label:"File Protection", dim:true, tag:"Ph 8" },
    { id:"ph7", icon:"layers",  label:"Rights Rules",    dim:true, tag:"Ph 7" },
    { id:"ph6", icon:"key",     label:"Licenses",        dim:true, tag:"Ph 6" },
  ]},
  { sec:"Platform", items:[
    { id:"ph4", icon:"bell",    label:"Payments",        dim:true, tag:"Ph 4" },
    { id:"ph2", icon:"book",    label:"Courses",         dim:true, tag:"Ph 2" },
  ]},
];


export { ReportsView, ViolationsView, PerformanceView };
