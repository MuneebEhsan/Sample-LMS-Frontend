import { useState, useEffect, useRef } from 'react';
import { I, Av, Dot, Toggle, Spark, BarChart, Gauge, Donut } from '../shared.jsx';

const Chip = ({ on, label, icon }) => <span className={`pchip ${on === true ? "pchip-on" : on === false ? "pchip-off" : "pchip-na"}`}><I n={on === true ? "check" : on === false ? "ban" : "x"} s={10} />{label}</span>;

// ── Mock Data ─────────────────────────────────────────────────────────────────
const SPARKLINES = [[18,22,19,26,24,31,28,35,32,40],[40,35,42,38,44,41,48,43,52,49],[8,5,9,4,10,6,12,8,14,11],[3,4,2,5,3,6,4,7,5,9]];

const ACTIVITY_FEED = [
  { id:1,  time:"2m ago",    type:"violation", color:"var(--red)",    icon:"alert",  msg:"Screen capture blocked",       detail:"Elena Vasquez · Advanced React · Module 2 Video",        severity:"high"   },
  { id:2,  time:"8m ago",    type:"issued",    color:"var(--green)",  icon:"key",    msg:"License issued",               detail:"Ryan Okafor · 5-device · Node.js & REST API",            severity:"low"    },
  { id:3,  time:"15m ago",   type:"expired",   color:"var(--amber)",  icon:"clock",  msg:"License expired",              detail:"Mei Lin · ML Fundamentals · 30-day trial lapsed",       severity:"medium" },
  { id:4,  time:"23m ago",   type:"revoked",   color:"var(--orange)", icon:"ban",    msg:"License revoked",              detail:"Marcus Webb · UX Design · Admin action by Sophia",      severity:"medium" },
  { id:5,  time:"41m ago",   type:"violation", color:"var(--red)",    icon:"alert",  msg:"Geo-restriction triggered",    detail:"Ali Hassan · login from PK · course geo-locked to US",  severity:"high"   },
  { id:6,  time:"1h ago",    type:"issued",    color:"var(--green)",  icon:"key",    msg:"Bulk licenses issued",         detail:"Group: Premium — 42 users · All courses",               severity:"low"    },
  { id:7,  time:"2h ago",    type:"violation", color:"var(--red)",    icon:"alert",  msg:"Device limit exceeded",        detail:"Kenji Tanaka · limit 3 · attempted 4th device",         severity:"high"   },
  { id:8,  time:"3h ago",    type:"issued",    color:"var(--teal)",   icon:"key",    msg:"License renewed",              detail:"Sophie Laurent · Annual plan · UX Masterclass",         severity:"low"    },
];

const VIOLATIONS = [
  { id:1, type:"Screen Capture Attempt",  user:"Elena Vasquez",  av:"EV", col:"#6366F1", file:"module2-intro.mp4",   time:"2m ago",    sev:"critical", count:1 },
  { id:2, type:"Device Limit Exceeded",   user:"Kenji Tanaka",   av:"KT", col:"#F97316", file:"All DRM Files",       time:"1h ago",    sev:"critical", count:3 },
  { id:3, type:"Geo-Restriction",         user:"Ali Hassan",     av:"AH", col:"#10B981", file:"ux-design-kit.pdf",   time:"41m ago",   sev:"high",     count:1 },
  { id:4, type:"Watermark Detected",      user:"Unknown",        av:"??", col:"#EF4444", file:"lecture-notes.pdf",   time:"6h ago",    sev:"high",     count:1 },
  { id:5, type:"Token Replay Attack",     user:"System",         av:"SY", col:"#14B8A6", file:"API endpoint",        time:"Yesterday", sev:"critical", count:7 },
];

const INIT_GROUPS = [
  { id:1, name:"Premium Members",  color:"#F59E0B", icon:"sparkle", desc:"Full-access paid subscribers",         members:142, autoRule:"payment_status = paid",      profiles:["Enterprise","Full Access"],      active:true  },
  { id:2, name:"Free Trial Users", color:"#14B8A6", icon:"clock",   desc:"30-day trial — limited access",        members:89,  autoRule:"signup_days <= 30",            profiles:["Trial"],                         active:true  },
  { id:3, name:"Corporate Cohort", color:"#6366F1", icon:"users",   desc:"B2B clients — VPN-only streaming",     members:34,  autoRule:"company_domain = corp.com",    profiles:["Corporate","VPN Restricted"],    active:true  },
  { id:4, name:"Instructors",      color:"#10B981", icon:"book",    desc:"Content creators — no download limit", members:12,  autoRule:"role = instructor",            profiles:["Creator"],                       active:true  },
  { id:5, name:"Blocked Users",    color:"#EF4444", icon:"ban",     desc:"TOS violations — access revoked",      members:7,   autoRule:"violation_count >= 3",         profiles:["Blocked"],                       active:false },
];

const INIT_PROFILES = [
  {
    id:1, name:"Enterprise",    color:"#F59E0B", tier:"premium",
    devices:10, streams:5, downloads:true, offline:true,
    watermark:true, screenBlock:true, geoEnabled:false, geoCountries:[],
    windowStart:"00:00", windowEnd:"23:59", expiryDays:365,
    maxPlays:null, tokenTTL:3600, encryptionKey:"AES-256-GCM",
    desc:"Full-access enterprise license with all protections enabled",
    assignedGroups:["Premium Members","Corporate Cohort"], users:176
  },
  {
    id:2, name:"Trial",         color:"#14B8A6", tier:"trial",
    devices:2, streams:1, downloads:false, offline:false,
    watermark:true, screenBlock:false, geoEnabled:true, geoCountries:["US","CA","GB"],
    windowStart:"06:00", windowEnd:"22:00", expiryDays:30,
    maxPlays:5, tokenTTL:900, encryptionKey:"AES-128-HLS",
    desc:"30-day limited trial — streaming only, 5 plays per item",
    assignedGroups:["Free Trial Users"], users:89
  },
  {
    id:3, name:"Corporate",     color:"#6366F1", tier:"business",
    devices:5, streams:3, downloads:true, offline:true,
    watermark:true, screenBlock:true, geoEnabled:true, geoCountries:["US"],
    windowStart:"08:00", windowEnd:"18:00", expiryDays:180,
    maxPlays:null, tokenTTL:1800, encryptionKey:"AES-256-GCM",
    desc:"Business hours only, VPN-required, US geo-lock",
    assignedGroups:["Corporate Cohort"], users:34
  },
  {
    id:4, name:"Creator",       color:"#10B981", tier:"creator",
    devices:null, streams:null, downloads:true, offline:true,
    watermark:false, screenBlock:false, geoEnabled:false, geoCountries:[],
    windowStart:"00:00", windowEnd:"23:59", expiryDays:null,
    maxPlays:null, tokenTTL:86400, encryptionKey:"None",
    desc:"Instructors — unrestricted access to all own content",
    assignedGroups:["Instructors"], users:12
  },
  {
    id:5, name:"Blocked",       color:"#EF4444", tier:"blocked",
    devices:0, streams:0, downloads:false, offline:false,
    watermark:true, screenBlock:true, geoEnabled:false, geoCountries:[],
    windowStart:"00:00", windowEnd:"00:00", expiryDays:null,
    maxPlays:0, tokenTTL:0, encryptionKey:"N/A",
    desc:"All access revoked — account flagged for violations",
    assignedGroups:["Blocked Users"], users:7
  },
];

const COUNTRIES = ["US","CA","GB","AU","DE","FR","JP","IN","BR","SG","AE","NL","SE","CH","NZ"];

// ══════════════════════════════════════════════════════════════════════════════
// DRM DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
const DRMDashboard = () => {
  const [activityPage, setActivityPage] = useState(0);
  const [liveCount, setLiveCount] = useState(247);

  useEffect(() => {
    const t = setInterval(() => setLiveCount(n => n + Math.floor(Math.random() * 3) - 1), 3000);
    return () => clearInterval(t);
  }, []);

  const KPI = [
    { label:"Active Licenses",   val:"1,842",  delta:"+12%",  pos:true,  color:"var(--amber)",  spark:SPARKLINES[0], icon:"key"    },
    { label:"Protected Files",   val:"384",    delta:"+5",    pos:true,  color:"var(--indigo)", spark:SPARKLINES[1], icon:"shield" },
    { label:"Violations (24h)",  val:"11",     delta:"+3",    pos:false, color:"var(--red)",    spark:SPARKLINES[2], icon:"alert"  },
    { label:"Live Streams",      val:liveCount,delta:"live",  pos:null,  color:"var(--green)",  spark:SPARKLINES[3], icon:"wifi"   },
  ];

  return (
    <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:18 }}>

      {/* KPI Strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {KPI.map(k => (
          <div className="scard" key={k.label}>
            <div className="scard-glow" style={{ background:k.color }} />
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{k.label}</div>
                <div style={{ fontSize:26, fontWeight:800, color:k.color, fontFamily:"var(--mono)", marginTop:4, transition:"all .3s" }}>{k.val.toLocaleString()}</div>
                <div style={{ fontSize:12, marginTop:3, color: k.pos === null ? "var(--green)" : k.pos ? "var(--green)" : "var(--red)", display:"flex", alignItems:"center", gap:4, fontWeight:600 }}>
                  {k.pos === null ? <Dot c="var(--green)" sz={6} pulse="Amber" /> : null}
                  {k.delta} {k.pos === null ? "streaming" : "vs yesterday"}
                </div>
              </div>
              <div style={{ color:k.color, opacity:.5 }}><I n={k.icon} s={22} /></div>
            </div>
            <div className="sparkline" style={{ marginTop:10 }}>
              {k.spark.map((v,i) => (
                <div key={i} className="spark-col" style={{ height:`${(v/Math.max(...k.spark))*100}%`, background:k.color, opacity:.5+i*.05 }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:14 }}>

        {/* Activity Feed */}
        <div className="card" style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"13px 18px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ fontWeight:700, fontSize:14 }}>DRM Activity Feed</div>
            <div style={{ display:"flex", gap:8 }}>
              <span className="badge BA" style={{ fontSize:10.5 }}><Dot c="var(--amber)" sz={5} />Live</span>
              <button className="btn bg bsm"><I n="filter" s={12} />Filter</button>
              <button className="btn bg bsm"><I n="dl" s={12} />Export</button>
            </div>
          </div>
          <div style={{ height:380, overflowY:"auto" }}>
            {ACTIVITY_FEED.map(a => (
              <div className="afeed-row" key={a.id}>
                <div style={{ width:34, height:34, borderRadius:9, background:a.color+"18", border:`1px solid ${a.color}28`, display:"flex", alignItems:"center", justifyContent:"center", color:a.color, flexShrink:0 }}>
                  <I n={a.icon} s={15} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontWeight:700, fontSize:13.5, color:a.color }}>{a.msg}</span>
                    <span style={{ fontSize:11, color:"var(--text3)", fontFamily:"var(--mono)", flexShrink:0 }}>{a.time}</span>
                  </div>
                  <div style={{ fontSize:12.5, color:"var(--text2)", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.detail}</div>
                </div>
                <div style={{ width:8, height:8, borderRadius:"50%", background:a.type==="violation"?"var(--red)":a.type==="expired"?"var(--amber)":"var(--green)", flexShrink:0, marginTop:6 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Violation Alerts */}
          <div className="card" style={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:"13px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontWeight:700, fontSize:13.5, display:"flex", alignItems:"center", gap:7 }}>
                <Dot c="var(--red)" sz={8} pulse="Red" />
                Active Violations
              </div>
              <span className="badge BR" style={{ fontSize:10.5 }}>{VIOLATIONS.length} open</span>
            </div>
            <div style={{ maxHeight:280, overflowY:"auto" }}>
              {VIOLATIONS.map(v => (
                <div key={v.id} style={{ padding:"10px 14px", borderBottom:"1px solid var(--border)", display:"flex", gap:9, alignItems:"flex-start" }}>
                  <Av i={v.av} c={v.col} sz={28} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, justifyContent:"space-between" }}>
                      <span style={{ fontWeight:700, fontSize:12.5, color: v.sev==="critical"?"var(--red)":"var(--orange)" }}>{v.type}</span>
                      <span className={`badge ${v.sev==="critical"?"BR":"BA"}`} style={{ fontSize:10, padding:"1px 6px" }}>{v.sev}</span>
                    </div>
                    <div style={{ fontSize:11.5, color:"var(--text2)", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.user} · {v.file}</div>
                    <div style={{ fontSize:11, color:"var(--text3)", marginTop:1 }}>{v.time} {v.count > 1 ? `· ${v.count}× attempts` : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="card-drm">
            <div style={{ fontWeight:700, fontSize:13.5, marginBottom:12, display:"flex", alignItems:"center", gap:7 }}>
              <I n="shield" s={15} />DRM Coverage
            </div>
            {[
              { label:"Videos encrypted", val:98, col:"var(--indigo)" },
              { label:"PDFs watermarked",  val:84, col:"var(--amber)"  },
              { label:"Token auth active", val:100,col:"var(--green)"  },
              { label:"Geo rules applied", val:61, col:"var(--teal)"   },
            ].map(r => (
              <div key={r.label} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12.5, fontWeight:600 }}>{r.label}</span>
                  <span style={{ fontFamily:"var(--mono)", fontWeight:700, fontSize:12.5, color:r.col }}>{r.val}%</span>
                </div>
                <div className="prog"><div className="pb" style={{ width:`${r.val}%`, background:r.col }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geo Map (CSS art) */}
      <div className="card">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:14 }}>Geographic License Distribution</div>
          <div style={{ display:"flex", gap:10, fontSize:12, color:"var(--text2)" }}>
            <span style={{ display:"flex", alignItems:"center", gap:4 }}><Dot c="var(--green)" sz={8} />Allowed</span>
            <span style={{ display:"flex", alignItems:"center", gap:4 }}><Dot c="var(--red)" sz={8} />Blocked</span>
            <span style={{ display:"flex", alignItems:"center", gap:4 }}><Dot c="var(--amber)" sz={8} />Restricted</span>
          </div>
        </div>
        <div style={{ background:"var(--bg2)", borderRadius:10, border:"1px solid var(--border)", padding:"20px 30px", position:"relative", minHeight:180, overflow:"hidden" }}>
          {/* Stylized world grid */}
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle, rgba(99,102,241,.06) 1px, transparent 1px)", backgroundSize:"18px 18px", borderRadius:10 }} />
          {/* Continents as blobs */}
          {[
            { label:"NA",  x:"18%",  y:"38%", w:100, h:70,  col:"var(--green)",  count:684, countries:"US,CA,MX" },
            { label:"EU",  x:"43%",  y:"28%", w:80,  h:55,  col:"var(--green)",  count:421, countries:"GB,DE,FR" },
            { label:"AS",  x:"64%",  y:"32%", w:110, h:80,  col:"var(--amber)",  count:287, countries:"JP,IN,SG" },
            { label:"SA",  x:"26%",  y:"62%", w:60,  h:65,  col:"var(--amber)",  count:98,  countries:"BR,AR,CL"  },
            { label:"AF",  x:"46%",  y:"55%", w:65,  h:70,  col:"var(--red)",    count:12,  countries:"Blocked"   },
            { label:"OC",  x:"74%",  y:"66%", w:50,  h:38,  col:"var(--green)",  count:76,  countries:"AU,NZ"    },
          ].map(c => (
            <div key={c.label} title={`${c.label}: ${c.count} licenses · ${c.countries}`} style={{
              position:"absolute", left:c.x, top:c.y,
              width:c.w, height:c.h,
              background:c.col+"18",
              border:`1.5px solid ${c.col}44`,
              borderRadius:"40% 60% 55% 45% / 45% 55% 60% 40%",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              cursor:"pointer", transition:"all .2s",
              transform:"translate(-50%,-50%)"
            }}
              onMouseEnter={e => { e.currentTarget.style.background = c.col+"2E"; e.currentTarget.style.borderColor = c.col+"88"; }}
              onMouseLeave={e => { e.currentTarget.style.background = c.col+"18"; e.currentTarget.style.borderColor = c.col+"44"; }}>
              <span style={{ fontSize:10, fontWeight:800, color:c.col, letterSpacing:".04em" }}>{c.label}</span>
              <span style={{ fontSize:11, fontWeight:700, color:c.col, fontFamily:"var(--mono)" }}>{c.count}</span>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:12 }}>
          {[["US",684,"var(--green)"],["GB",203,"var(--green)"],["CA",148,"var(--green)"],["AU",76,"var(--green)"],["JP",64,"var(--amber)"],["IN",58,"var(--amber)"],["BR",41,"var(--amber)"],["NG",12,"var(--red)"]].map(([c,n,col])=>(
            <span key={c} style={{ fontSize:12, fontFamily:"var(--mono)", fontWeight:700, color:col, background:col+"12", border:`1px solid ${col}28`, borderRadius:6, padding:"3px 10px" }}>{c} {n}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// USER GROUPS
// ══════════════════════════════════════════════════════════════════════════════
const GroupModal = ({ initial, profiles, onSave, onClose }) => {
  const [form, setForm] = useState(initial || { name:"", color:"#F59E0B", desc:"", autoRule:"", profiles:[], active:true });
  const setF = (k,v) => setForm(f => ({...f,[k]:v}));
  const COLORS = ["#F59E0B","#6366F1","#14B8A6","#10B981","#EF4444","#EC4899","#F97316","#3B82F6","#8B5CF6","#0EA5E9"];
  const toggleProfile = (name) => setForm(f => ({ ...f, profiles: f.profiles.includes(name) ? f.profiles.filter(p=>p!==name) : [...f.profiles, name] }));

  return (
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ maxWidth:560 }}>
        <div className="mhd">
          <div><div style={{ fontWeight:700, fontSize:15 }}>{initial?"Edit Group":"Create User Group"}</div><div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>Groups auto-assign license profiles to matching users</div></div>
          <button className="btn bg bico" onClick={onClose}><I n="x" s={15}/></button>
        </div>
        <div className="mbd">
          <div className="fl"><label className="lbl">Group Name *</label><input className="inp" placeholder="e.g. Premium Members" value={form.name} onChange={e=>setF("name",e.target.value)} autoFocus /></div>
          <div className="fl"><label className="lbl">Description</label><input className="inp" placeholder="Short description of this group's purpose" value={form.desc} onChange={e=>setF("desc",e.target.value)} /></div>

          <div className="fl">
            <label className="lbl">Group Color</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {COLORS.map(c=>(
                <div key={c} onClick={()=>setF("color",c)} style={{ width:28, height:28, borderRadius:7, background:c, cursor:"pointer", border:`3px solid ${form.color===c?"#fff":"transparent"}`, outline:`2px solid ${form.color===c?c+"66":"transparent"}`, transition:"all .14s" }}/>
              ))}
              <input type="color" value={form.color} onChange={e=>setF("color",e.target.value)} style={{ width:28, height:28, border:"none", cursor:"pointer", borderRadius:7, padding:0, background:"none" }}/>
            </div>
          </div>

          <div className="fl">
            <label className="lbl">Auto-Assignment Rule</label>
            <input className="inp" placeholder="e.g. payment_status = paid  OR  role = instructor  OR  signup_days ≤ 30" value={form.autoRule} onChange={e=>setF("autoRule",e.target.value)} style={{ fontFamily:"var(--mono)", fontSize:13 }}/>
            <div style={{ fontSize:11.5, color:"var(--text3)", marginTop:3 }}>Leave blank for manual-only assignment. Supported: payment_status, role, company_domain, signup_days, violation_count</div>
          </div>

          <div className="fl">
            <label className="lbl">Assigned License Profiles</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {profiles.map(p=>(
                <div key={p.name} onClick={()=>toggleProfile(p.name)} style={{ padding:"6px 12px", borderRadius:7, cursor:"pointer", border:`1.5px solid ${form.profiles.includes(p.name)?p.color+"66":"var(--border)"}`, background:form.profiles.includes(p.name)?p.color+"12":"var(--bg2)", transition:"all .14s" }}>
                  <span style={{ fontSize:13, fontWeight:700, color:form.profiles.includes(p.name)?p.color:"var(--text2)" }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 13px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)" }}>
            <div><div style={{ fontWeight:600, fontSize:13.5 }}>Group Active</div><div style={{ fontSize:12, color:"var(--text3)" }}>Inactive groups don't assign licenses</div></div>
            <Toggle on={form.active} onChange={v=>setF("active",v)} cls="grn"/>
          </div>
        </div>
        <div className="mft">
          <button className="btn bg" onClick={onClose}>Cancel</button>
          <button className="btn ba" onClick={()=>onSave(form)} disabled={!form.name.trim()}><I n="check" s={13}/>{initial?"Save Changes":"Create Group"}</button>
        </div>
      </div>
    </div>
  );
};

const UserGroupsView = () => {
  const [groups, setGroups] = useState(INIT_GROUPS);
  const [modal, setModal] = useState(null);
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.desc.toLowerCase().includes(search.toLowerCase()));

  const saveGroup = (form) => {
    if (modal === "add") setGroups(gs => [...gs, { ...form, id: Date.now(), members: 0 }]);
    else setGroups(gs => gs.map(g => g.id === modal.id ? { ...g, ...form } : g));
    setModal(null);
  };

  const selGroup = sel ? groups.find(g=>g.id===sel) : null;
  const MEMBER_SAMPLE = [
    { name:"Elena Vasquez", av:"EV", col:"#6366F1", email:"e.vasquez@edu.com", joined:"Jan 15" },
    { name:"Ryan Okafor",   av:"RO", col:"#14B8A6", email:"r.okafor@edu.com",  joined:"Jan 18" },
    { name:"Mei Lin",       av:"ML", col:"#F59E0B", email:"mei.lin@edu.com",   joined:"Feb 2"  },
    { name:"Sophie Laurent",av:"SL", col:"#EC4899", email:"s.laurent@edu.com", joined:"Mar 3"  },
  ];

  return (
    <div style={{ padding:"20px 24px", display:"flex", gap:18 }}>
      {/* Group list */}
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", gap:10, marginBottom:14, alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:7, flex:1 }}>
            <span style={{ padding:"0 11px", color:"var(--text3)" }}><I n="search" s={14}/></span>
            <input style={{ background:"none", border:"none", padding:"8px", color:"var(--text)", fontSize:13, outline:"none", flex:1 }} placeholder="Search groups…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <button className="btn ba" onClick={()=>setModal("add")}><I n="plus" s={14}/>New Group</button>
        </div>

        {/* Summary stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:14 }}>
          {[
            { label:"Total Groups",   val:groups.length,                              col:"var(--amber)"  },
            { label:"Total Members",  val:groups.reduce((n,g)=>n+g.members,0),        col:"var(--teal)"   },
            { label:"Active Groups",  val:groups.filter(g=>g.active).length,          col:"var(--green)"  },
            { label:"Auto-Assigned",  val:groups.filter(g=>g.autoRule).length,        col:"var(--indigo)" },
          ].map(s=>(
            <div className="scard" key={s.label}>
              <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:800, color:s.col, fontFamily:"var(--mono)", marginTop:3 }}>{s.val}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.map(g=>(
            <div key={g.id} className={`group-card ${sel===g.id?"selected":""}`} onClick={()=>setSel(sel===g.id?null:g.id)}>
              <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px" }}>
                <div className="drm-stripe" style={{ background:g.color }}/>
                <div style={{ width:42, height:42, borderRadius:11, background:g.color+"1E", border:`1.5px solid ${g.color}33`, display:"flex", alignItems:"center", justifyContent:"center", color:g.color, flexShrink:0 }}>
                  <I n={g.icon} s={18}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontWeight:700, fontSize:14 }}>{g.name}</span>
                    {!g.active && <span className="badge BX" style={{ fontSize:10 }}>Inactive</span>}
                    {g.autoRule && <span className="badge BV" style={{ fontSize:10 }}>Auto-rule</span>}
                  </div>
                  <div style={{ fontSize:12.5, color:"var(--text2)", marginTop:2 }}>{g.desc}</div>
                  <div style={{ display:"flex", gap:8, marginTop:5, flexWrap:"wrap" }}>
                    {g.profiles.map(p=>(
                      <span key={p} style={{ fontSize:11, background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:4, padding:"2px 7px", color:"var(--text2)" }}>{p}</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:22, fontWeight:800, color:g.color, fontFamily:"var(--mono)" }}>{g.members}</div>
                  <div style={{ fontSize:11, color:"var(--text3)", marginTop:1 }}>members</div>
                  <div style={{ display:"flex", gap:5, marginTop:8, justifyContent:"flex-end" }}>
                    <button className="btn bg bxs" onClick={e=>{e.stopPropagation();setModal(g)}}><I n="edit" s={12}/></button>
                    <button className="btn bd bxs" onClick={e=>{e.stopPropagation();setGroups(gs=>gs.filter(x=>x.id!==g.id));setSel(null)}}><I n="trash" s={12}/></button>
                  </div>
                </div>
              </div>

              {/* Expanded */}
              {sel===g.id && (
                <div style={{ borderTop:"1px solid var(--border)", padding:"14px 16px", animation:"fadeIn .2s ease" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <div>
                      <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>Auto-Assignment Rule</div>
                      {g.autoRule ? (
                        <code style={{ display:"block", padding:"8px 12px", background:"var(--bg2)", borderRadius:7, border:"1px solid var(--border)", fontFamily:"var(--mono)", fontSize:12.5, color:"var(--teal)" }}>{g.autoRule}</code>
                      ) : <span style={{ fontSize:12.5, color:"var(--text3)" }}>Manual assignment only</span>}
                    </div>
                    <div>
                      <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>Members (sample)</div>
                      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                        {MEMBER_SAMPLE.slice(0,3).map(m=>(
                          <div key={m.name} style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <Av i={m.av} c={m.col} sz={22}/>
                            <span style={{ fontSize:12.5, fontWeight:600 }}>{m.name}</span>
                            <span style={{ fontSize:11, color:"var(--text3)", marginLeft:"auto" }}>+{m.joined}</span>
                          </div>
                        ))}
                        {g.members > 3 && <div style={{ fontSize:11.5, color:"var(--text3)", marginTop:2 }}>+{g.members-3} more members</div>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right: inheritance diagram */}
      <div style={{ width:260, flexShrink:0 }}>
        <div className="card" style={{ marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:13.5, marginBottom:12, display:"flex", alignItems:"center", gap:7 }}><I n="tree" s={14}/>Group Hierarchy</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6, fontSize:12.5 }}>
            {[
              { label:"All Users",        indent:0, col:"var(--text2)", count:groups.reduce((n,g)=>n+g.members,0) },
              { label:"Premium Members",  indent:1, col:"#F59E0B",     count:142 },
              { label:"Corporate Cohort", indent:2, col:"#6366F1",     count:34  },
              { label:"Free Trial Users", indent:1, col:"#14B8A6",     count:89  },
              { label:"Instructors",      indent:1, col:"#10B981",     count:12  },
              { label:"Blocked Users",    indent:1, col:"#EF4444",     count:7   },
            ].map(n=>(
              <div key={n.label} style={{ display:"flex", alignItems:"center", gap:6, paddingLeft:n.indent*16 }}>
                <span style={{ color:"var(--text3)" }}>{n.indent > 0 ? "└ " : ""}</span>
                <Dot c={n.col} sz={7}/>
                <span style={{ color:n.col, fontWeight:600 }}>{n.label}</span>
                <span style={{ marginLeft:"auto", fontFamily:"var(--mono)", fontSize:11.5, color:"var(--text3)" }}>{n.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card-drm">
          <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>Quick Actions</div>
          {[
            ["Import CSV members",  "users"],
            ["Bulk assign profiles","layers"],
            ["Export group list",   "dl"],
            ["Run auto-rule now",   "refresh"],
          ].map(([lbl,ico])=>(
            <button key={lbl} className="btn bg" style={{ width:"100%", justifyContent:"flex-start", marginBottom:6, fontSize:12.5 }}><I n={ico} s={13}/>{lbl}</button>
          ))}
        </div>
      </div>

      {modal && (
        <GroupModal initial={modal==="add"?null:modal} profiles={INIT_PROFILES} onSave={saveGroup} onClose={()=>setModal(null)}/>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// LICENSE PROFILES
// ══════════════════════════════════════════════════════════════════════════════
const ProfileModal = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState(initial || {
    name:"", color:"#F59E0B", tier:"standard", desc:"",
    devices:3, streams:2, downloads:false, offline:false,
    watermark:true, screenBlock:true,
    geoEnabled:false, geoCountries:[],
    windowStart:"00:00", windowEnd:"23:59",
    expiryDays:365, maxPlays:null, tokenTTL:3600,
    encryptionKey:"AES-256-GCM"
  });
  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const toggleCountry = (cc) => setForm(f=>({ ...f, geoCountries: f.geoCountries.includes(cc) ? f.geoCountries.filter(c=>c!==cc) : [...f.geoCountries,cc] }));
  const COLORS = ["#F59E0B","#6366F1","#14B8A6","#10B981","#EF4444","#EC4899","#8B5CF6","#F97316","#3B82F6","#84CC16"];
  const [step, setStep] = useState(0);
  const STEPS = ["Basic Info","Access Limits","Protection","Geo & Time"];

  return (
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ maxWidth:580 }}>
        <div className="mhd">
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>{initial?"Edit Profile":"New License Profile"}</div>
            <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>Step {step+1} of {STEPS.length}: {STEPS[step]}</div>
          </div>
          <button className="btn bg bico" onClick={onClose}><I n="x" s={15}/></button>
        </div>

        {/* Step indicators */}
        <div style={{ padding:"10px 22px 0", display:"flex", gap:6 }}>
          {STEPS.map((s,i)=>(
            <div key={s} onClick={()=>setStep(i)} style={{ flex:1, height:3, borderRadius:2, background:i<=step?"var(--amber)":"var(--border2)", cursor:"pointer", transition:"background .2s" }}/>
          ))}
        </div>

        <div className="mbd">
          {/* STEP 0: Basic Info */}
          {step===0&&<>
            <div className="fl"><label className="lbl">Profile Name *</label><input className="inp" placeholder="e.g. Enterprise Full Access" value={form.name} onChange={e=>setF("name",e.target.value)} autoFocus /></div>
            <div className="fl"><label className="lbl">Description</label><input className="inp" placeholder="What does this profile allow?" value={form.desc} onChange={e=>setF("desc",e.target.value)} /></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div className="fl"><label className="lbl">Tier</label>
                <select className="sel" value={form.tier} onChange={e=>setF("tier",e.target.value)}>
                  {["premium","business","standard","trial","creator","blocked"].map(t=><option key={t} value={t} style={{ textTransform:"capitalize" }}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
              <div className="fl"><label className="lbl">Encryption</label>
                <select className="sel" value={form.encryptionKey} onChange={e=>setF("encryptionKey",e.target.value)}>
                  {["AES-256-GCM","AES-128-HLS","ChaCha20","None"].map(e=><option key={e}>{e}</option>)}
                </select>
              </div>
            </div>
            <div className="fl">
              <label className="lbl">Profile Color</label>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {COLORS.map(c=>(
                  <div key={c} onClick={()=>setF("color",c)} style={{ width:28, height:28, borderRadius:7, background:c, cursor:"pointer", border:`3px solid ${form.color===c?"#fff":"transparent"}`, outline:`2px solid ${form.color===c?c+"66":"transparent"}`, transition:"all .14s" }}/>
                ))}
              </div>
            </div>
          </>}

          {/* STEP 1: Access Limits */}
          {step===1&&<>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div className="fl">
                <label className="lbl">Max Devices: <span style={{ color:"var(--amber)" }}>{form.devices===null?"Unlimited":form.devices}</span></label>
                <input type="range" className="range" min="0" max="20" value={form.devices??20} onChange={e=>setF("devices",Number(e.target.value)===20?null:Number(e.target.value))}/>
                <div style={{ fontSize:11, color:"var(--text3)" }}>Slide to 20 for Unlimited</div>
              </div>
              <div className="fl">
                <label className="lbl">Concurrent Streams: <span style={{ color:"var(--amber)" }}>{form.streams===null?"Unlimited":form.streams}</span></label>
                <input type="range" className="range" min="0" max="10" value={form.streams??10} onChange={e=>setF("streams",Number(e.target.value)===10?null:Number(e.target.value))}/>
              </div>
              <div className="fl">
                <label className="lbl">Token TTL (seconds): <span style={{ color:"var(--amber)" }}>{form.tokenTTL}</span></label>
                <input type="range" className="range" min="60" max="86400" step="60" value={form.tokenTTL} onChange={e=>setF("tokenTTL",Number(e.target.value))}/>
                <div style={{ fontSize:11, color:"var(--text3)" }}>{Math.round(form.tokenTTL/60)} min · {(form.tokenTTL/3600).toFixed(1)} hrs</div>
              </div>
              <div className="fl">
                <label className="lbl">Max Plays per Item: <span style={{ color:"var(--amber)" }}>{form.maxPlays===null?"Unlimited":form.maxPlays}</span></label>
                <input type="range" className="range" min="0" max="50" value={form.maxPlays??50} onChange={e=>setF("maxPlays",Number(e.target.value)===50?null:Number(e.target.value))}/>
              </div>
              <div className="fl">
                <label className="lbl">License Expiry (days): <span style={{ color:"var(--amber)" }}>{form.expiryDays===null?"Never":form.expiryDays}</span></label>
                <input type="range" className="range" min="0" max="366" step="1" value={form.expiryDays??366} onChange={e=>setF("expiryDays",Number(e.target.value)===366?null:Number(e.target.value))}/>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:4 }}>
              {[["downloads","Allow Downloads","Files can be saved locally"],["offline","Offline Playback","Cached content playable without internet"]].map(([k,lbl,sub])=>(
                <div key={k} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 13px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)" }}>
                  <div><div style={{ fontSize:13.5, fontWeight:600 }}>{lbl}</div><div style={{ fontSize:11.5, color:"var(--text3)" }}>{sub}</div></div>
                  <Toggle on={form[k]} onChange={v=>setF(k,v)} cls="grn"/>
                </div>
              ))}
            </div>
          </>}

          {/* STEP 2: Protection */}
          {step===2&&<>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                ["watermark","Dynamic Watermark","Embed user email/ID into video and PDF content","water","grn"],
                ["screenBlock","Screen Recording Block","Prevent OBS, Bandicam, iOS Screen Record","screen","red"],
              ].map(([k,lbl,sub,icon,cls])=>(
                <div key={k} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 14px", background:"var(--bg2)", borderRadius:9, border:"1px solid var(--border)" }}>
                  <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                    <div style={{ color: k==="watermark"?"var(--teal)":"var(--red)", marginTop:2 }}><I n={icon} s={20}/></div>
                    <div><div style={{ fontWeight:700, fontSize:13.5 }}>{lbl}</div><div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>{sub}</div></div>
                  </div>
                  <Toggle on={form[k]} onChange={v=>setF(k,v)} cls={cls}/>
                </div>
              ))}
            </div>
            <div style={{ padding:"14px 16px", background:"var(--bg2)", borderRadius:9, border:"1px solid var(--border)" }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>DRM Token Settings</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div className="fl"><label className="lbl">Token Algorithm</label><select className="sel" style={{ fontSize:12.5 }}><option>HS256 JWT</option><option>RS256 JWT</option><option>EdDSA</option></select></div>
                <div className="fl"><label className="lbl">Signed URL Expiry</label><input className="inp" defaultValue="900s" style={{ fontFamily:"var(--mono)" }}/></div>
              </div>
            </div>
            {/* Permissions summary */}
            <div style={{ padding:"13px 14px", background:"var(--card2)", borderRadius:9, border:"1px solid var(--border)" }}>
              <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:9 }}>Current Permissions</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                <Chip on={form.downloads}   label="Downloads"/>
                <Chip on={form.offline}     label="Offline"/>
                <Chip on={form.watermark}   label="Watermark"/>
                <Chip on={form.screenBlock} label="Screen Block"/>
                <Chip on={form.geoEnabled}  label="Geo-Lock"/>
              </div>
            </div>
          </>}

          {/* STEP 3: Geo & Time */}
          {step===3&&<>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 13px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)" }}>
              <div><div style={{ fontWeight:700, fontSize:13.5, display:"flex", alignItems:"center", gap:7 }}><I n="globe" s={14}/>Geographic Restriction</div><div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>Limit access to selected countries only</div></div>
              <Toggle on={form.geoEnabled} onChange={v=>setF("geoEnabled",v)}/>
            </div>
            {form.geoEnabled && (
              <div>
                <div style={{ fontSize:11.5, color:"var(--text2)", marginBottom:8 }}>{form.geoCountries.length} countries selected</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {COUNTRIES.map(cc=>(
                    <div key={cc} onClick={()=>toggleCountry(cc)} style={{ padding:"5px 12px", borderRadius:7, cursor:"pointer", border:`1.5px solid ${form.geoCountries.includes(cc)?"var(--amber)66":"var(--border)"}`, background:form.geoCountries.includes(cc)?"var(--adim)":"var(--bg2)", fontFamily:"var(--mono)", fontWeight:700, fontSize:13, color:form.geoCountries.includes(cc)?"var(--amber)":"var(--text2)", transition:"all .14s" }}>
                      {cc}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div className="fl"><label className="lbl">Access Window Start</label><input className="inp" type="time" value={form.windowStart} onChange={e=>setF("windowStart",e.target.value)}/></div>
              <div className="fl"><label className="lbl">Access Window End</label><input className="inp" type="time" value={form.windowEnd} onChange={e=>setF("windowEnd",e.target.value)}/></div>
            </div>
            <div style={{ padding:"10px 13px", background:"var(--adim)", border:"1px solid var(--aglow)", borderRadius:8, fontSize:12.5, color:"var(--amber2)", display:"flex", gap:8 }}>
              <I n="clock" s={14}/>
              Access window: <strong>{form.windowStart}</strong> – <strong>{form.windowEnd}</strong> daily (platform server time)
            </div>
          </>}
        </div>

        <div className="mft" style={{ justifyContent:"space-between" }}>
          <button className="btn bg" onClick={()=>step>0?setStep(step-1):onClose()}>{step>0?"← Back":"Cancel"}</button>
          <div style={{ display:"flex", gap:8 }}>
            {step<STEPS.length-1
              ? <button className="btn ba" onClick={()=>setStep(step+1)} disabled={step===0&&!form.name.trim()}>Next →</button>
              : <button className="btn ba" onClick={()=>onSave(form)} disabled={!form.name.trim()}><I n="check" s={13}/>Save Profile</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

const LicenseProfilesView = () => {
  const [profiles, setProfiles] = useState(INIT_PROFILES);
  const [modal, setModal] = useState(null);
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState("");

  const saveProfile = (form) => {
    if (modal==="add") setProfiles(ps=>[...ps,{...form,id:Date.now(),users:0,assignedGroups:[]}]);
    else setProfiles(ps=>ps.map(p=>p.id===modal.id?{...p,...form}:p));
    setModal(null);
  };

  const selProfile = sel ? profiles.find(p=>p.id===sel) : null;
  const filtered = profiles.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.desc.toLowerCase().includes(search.toLowerCase()));

  const TIER_BADGE = { premium:<span className="badge BA" style={{fontSize:10.5}}>Premium</span>, business:<span className="badge BI" style={{fontSize:10.5}}>Business</span>, standard:<span className="badge BX" style={{fontSize:10.5}}>Standard</span>, trial:<span className="badge BT" style={{fontSize:10.5}}>Trial</span>, creator:<span className="badge BL" style={{fontSize:10.5}}>Creator</span>, blocked:<span className="badge BR" style={{fontSize:10.5}}>Blocked</span> };

  return (
    <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:7, flex:1 }}>
          <span style={{ padding:"0 11px", color:"var(--text3)" }}><I n="search" s={14}/></span>
          <input style={{ background:"none", border:"none", padding:"8px", color:"var(--text)", fontSize:13, outline:"none", flex:1 }} placeholder="Search profiles…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <button className="btn ba" onClick={()=>setModal("add")}><I n="plus" s={14}/>New Profile</button>
      </div>

      {/* Profile cards grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
        {filtered.map(p=>(
          <div key={p.id} className={`profile-card ${sel===p.id?"selected":""}`} onClick={()=>setSel(sel===p.id?null:p.id)}>
            {/* Header stripe */}
            <div style={{ height:4, background:`linear-gradient(to right, ${p.color}, ${p.color}88)` }}/>
            <div style={{ padding:"14px 16px" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:p.color+"1E", border:`1.5px solid ${p.color}33`, display:"flex", alignItems:"center", justifyContent:"center", color:p.color }}><I n="shield" s={16}/></div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14.5 }}>{p.name}</div>
                      {TIER_BADGE[p.tier]}
                    </div>
                  </div>
                  <div style={{ fontSize:12.5, color:"var(--text2)", marginTop:8, lineHeight:1.5 }}>{p.desc}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:20, fontWeight:800, color:p.color, fontFamily:"var(--mono)" }}>{p.users}</div>
                  <div style={{ fontSize:10.5, color:"var(--text3)" }}>users</div>
                </div>
              </div>

              {/* Permission chips */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:12 }}>
                <Chip on={p.downloads}   label="Downloads"/>
                <Chip on={p.offline}     label="Offline"/>
                <Chip on={p.watermark}   label="Watermark"/>
                <Chip on={p.screenBlock} label="Screen Block"/>
                <Chip on={p.geoEnabled}  label="Geo-Lock"/>
              </div>

              {/* Key metrics row */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginTop:12, padding:"10px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)" }}>
                {[
                  { lbl:"Devices", val:p.devices===null?"∞":p.tier==="blocked"?"0":p.devices },
                  { lbl:"Streams", val:p.streams===null?"∞":p.tier==="blocked"?"0":p.streams },
                  { lbl:"Expiry",  val:p.expiryDays===null?"Never":`${p.expiryDays}d` },
                  { lbl:"Plays",   val:p.maxPlays===null?"∞":p.maxPlays===0?"0":p.maxPlays },
                ].map(m=>(
                  <div key={m.lbl} style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"var(--mono)", fontWeight:800, fontSize:15, color:p.color }}>{m.val}</div>
                    <div style={{ fontSize:10, color:"var(--text3)", letterSpacing:".04em", textTransform:"uppercase" }}>{m.lbl}</div>
                  </div>
                ))}
              </div>

              {/* Expanded detail */}
              {sel===p.id&&(
                <div style={{ marginTop:12, animation:"fadeIn .2s ease" }}>
                  <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>Full Configuration</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    {[
                      ["Encryption",    p.encryptionKey],
                      ["Token TTL",     `${p.tokenTTL}s (${Math.round(p.tokenTTL/60)} min)`],
                      ["Access Window", `${p.windowStart} – ${p.windowEnd}`],
                      ["Geo Countries", p.geoEnabled?p.geoCountries.join(", ")||"None selected":"Unrestricted"],
                      ["Groups",        p.assignedGroups.join(", ")||"None"],
                    ].map(([k,v])=>(
                      <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"6px 10px", background:"var(--bg2)", borderRadius:6, border:"1px solid var(--border)" }}>
                        <span style={{ fontSize:12, color:"var(--text3)", fontWeight:600 }}>{k}</span>
                        <span style={{ fontSize:12, color:"var(--text)", fontFamily:["Token TTL","Encryption"].includes(k)?"var(--mono)":"var(--font)", fontWeight:600, maxWidth:180, textAlign:"right", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:12 }}>
                    <button className="btn bg bsm" style={{ flex:1 }} onClick={e=>{e.stopPropagation();setModal(p)}}><I n="edit" s={13}/>Edit Profile</button>
                    <button className="btn bg bsm" style={{ flex:1 }}><I n="copy" s={13}/>Duplicate</button>
                    <button className="btn bd bsm" onClick={e=>{e.stopPropagation();setProfiles(ps=>ps.filter(x=>x.id!==p.id));setSel(null)}}><I n="trash" s={13}/></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add new card */}
        <div onClick={()=>setModal("add")} style={{ border:"2px dashed var(--border2)", borderRadius:12, minHeight:200, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--text3)", gap:10, transition:"all .15s" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--amber)";e.currentTarget.style.color="var(--amber)"}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border2)";e.currentTarget.style.color="var(--text3)"}}>
          <I n="plus" s={28}/>
          <span style={{ fontWeight:700, fontSize:13.5 }}>New License Profile</span>
          <span style={{ fontSize:12, textAlign:"center", maxWidth:160 }}>Define custom DRM rules for a user tier</span>
        </div>
      </div>

      {modal&&<ProfileModal initial={modal==="add"?null:modal} onSave={saveProfile} onClose={()=>setModal(null)}/>}
    </div>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
const SIDENAV = [
  { sec:"DRM Core", items:[
    { id:"dashboard",  icon:"chart",  label:"Dashboard"       },
    { id:"groups",     icon:"users",  label:"User Groups"     },
    { id:"profiles",   icon:"shield", label:"License Profiles"},
  ]},
  { sec:"DRM (Upcoming)", items:[
    { id:"rights",     icon:"key",    label:"Manage Rights",  dim:true, phase:"Phase 7" },
    { id:"storage",    icon:"layers", label:"Cloud Storage",  dim:true, phase:"Phase 7" },
    { id:"protect",    icon:"lock",   label:"Protect Files",  dim:true, phase:"Phase 8" },
    { id:"reports",    icon:"file",   label:"DRM Reports",    dim:true, phase:"Phase 8" },
  ]},
  { sec:"Platform", items:[
    { id:"courses",    icon:"book",   label:"Courses",        dim:true, phase:"Ph 2" },
    { id:"grades",     icon:"tag",    label:"Grades",         dim:true, phase:"Ph 3" },
    { id:"security",   icon:"settings",label:"Security",     dim:true, phase:"Ph 5" },
  ]},
];


export { DRMDashboard, UserGroupsView, LicenseProfilesView };
