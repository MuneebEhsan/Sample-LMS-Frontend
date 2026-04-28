import { useState, useEffect, useRef } from 'react';
import { I, Av, Dot, Toggle, Spark, BarChart, Gauge, Donut } from '../shared.jsx';


const fmt = n => n >= 1e9 ? (n/1e9).toFixed(1)+"GB" : n >= 1e6 ? (n/1e6).toFixed(0)+"MB" : (n/1e3).toFixed(0)+"KB";

// ══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ══════════════════════════════════════════════════════════════════════════════
const CONTENT_ITEMS = [
  { id:1,  title:"React Hooks Deep Dive",         type:"video", course:"Advanced React",    size:847e6,  duration:"42:18", protected:true,  profile:"Enterprise", views:2841, lastStream:"2m ago"  },
  { id:2,  title:"TypeScript Generics Guide",     type:"pdf",   course:"Advanced React",    size:2.4e6,  pages:48,         protected:true,  profile:"Enterprise", views:1203, lastStream:"1h ago"  },
  { id:3,  title:"Neural Networks Explained",     type:"video", course:"ML Fundamentals",   size:1.2e9,  duration:"1:04:22",protected:true, profile:"Trial",      views:891,  lastStream:"3h ago"  },
  { id:4,  title:"Gradient Descent Workbook",     type:"pdf",   course:"ML Fundamentals",   size:8.1e6,  pages:92,         protected:true,  profile:"Trial",      views:445,  lastStream:"Yesterday"},
  { id:5,  title:"Figma Component Library",       type:"pdf",   course:"UX Design",         size:18.4e6, pages:186,        protected:true,  profile:"Enterprise", views:2107, lastStream:"30m ago" },
  { id:6,  title:"REST API Architecture",         type:"video", course:"Node.js & REST",    size:634e6,  duration:"38:55", protected:true,  profile:"Creator",    views:3402, lastStream:"5m ago"  },
  { id:7,  title:"Database Schema Design",        type:"video", course:"Node.js & REST",    size:490e6,  duration:"29:44", protected:false, profile:null,         views:189,  lastStream:"Never"   },
  { id:8,  title:"Accessibility Handbook",        type:"pdf",   course:"UX Design",         size:5.6e6,  pages:64,         protected:false, profile:null,         views:0,    lastStream:"Never"   },
];

const RIGHTS_RULES = [
  { id:1,  name:"Subscription Active Check",   event:"on_access",    condition:"user.subscription.status == active",   action:"allow",        profile:"All",        priority:1,  active:true,  hits:18420 },
  { id:2,  name:"Trial Content Limit",         event:"on_access",    condition:"user.group == Trial AND views > 5",     action:"deny",         profile:"Trial",      priority:2,  active:true,  hits:234   },
  { id:3,  name:"Geo Block — Sanctioned",      event:"on_access",    condition:"user.country IN [KP, IR, CU, SY]",     action:"block",        profile:"All",        priority:3,  active:true,  hits:12    },
  { id:4,  name:"Device Limit Enforcement",    event:"on_stream",    condition:"session.device_count > profile.max",   action:"revoke_token", profile:"All",        priority:4,  active:true,  hits:89    },
  { id:5,  name:"Business Hours Gate",         event:"on_access",    condition:"user.group == Corporate AND !in_window",action:"deny",         profile:"Corporate",  priority:5,  active:true,  hits:310   },
  { id:6,  name:"Screen Record Interrupt",     event:"on_stream",    condition:"client.screen_record_detected == true", action:"pause_stream", profile:"All",        priority:6,  active:true,  hits:7     },
  { id:7,  name:"Watermark — Video",           event:"on_render",    condition:"asset.type == video",                  action:"inject_wm",    profile:"Enterprise", priority:7,  active:true,  hits:98200 },
  { id:8,  name:"Watermark — PDF",             event:"on_render",    condition:"asset.type == pdf",                    action:"inject_wm",    profile:"Enterprise", priority:8,  active:true,  hits:41800 },
  { id:9,  name:"Token Expiry — Trial",        event:"on_token_gen", condition:"user.group == Trial",                  action:"set_ttl=900",  profile:"Trial",      priority:9,  active:true,  hits:3100  },
  { id:10, name:"Instructor Bypass",           event:"on_access",    condition:"user.role == instructor",              action:"allow_all",    profile:"Creator",    priority:10, active:true,  hits:4220  },
  { id:11, name:"Download Block — Trial",      event:"on_download",  condition:"user.group == Trial",                  action:"deny",         profile:"Trial",      priority:11, active:true,  hits:1890  },
  { id:12, name:"Offline Expiry Refresh",      event:"on_sync",      condition:"offline_asset.age > 24h",             action:"re_encrypt",   profile:"Enterprise", priority:12, active:false, hits:0     },
];

const EVENT_OPTIONS   = ["on_access","on_stream","on_render","on_download","on_token_gen","on_sync","on_upload","on_delete"];
const ACTION_OPTIONS  = ["allow","deny","block","revoke_token","pause_stream","inject_wm","set_ttl=900","allow_all","re_encrypt","log_only"];
const PROFILE_OPTIONS = ["All","Enterprise","Trial","Corporate","Creator","Blocked"];

const INIT_ADAPTERS = [
  {
    id:"r2", name:"Cloudflare R2", shortName:"R2",
    logo:"☁️", color:"var(--r2)",
    status:"connected", isPrimary:true,
    endpoint:"https://abc123.r2.cloudflarestorage.com",
    bucket:"acadlms-drm-prod",
    accessKey:"R2_••••••••••••1A4F",
    secretKey:"••••••••••••••••••••••••••••",
    region:"auto",
    cdnEnabled:true, cdnUrl:"https://cdn.acadlms.dev",
    signingEnabled:true, signedUrlTTL:3600,
    sseEnabled:true, sseAlgo:"AES256",
    filesStored:384, storageUsed:142e9, monthlyCost:4.20,
    latencyMs:18, uptimePct:99.98,
    lastTest:{ ok:true, ms:18, ts:"10m ago" },
  },
  {
    id:"gcs", name:"Google Cloud Storage", shortName:"GCS",
    logo:"🔵", color:"var(--gcs)",
    status:"connected", isPrimary:false,
    endpoint:"https://storage.googleapis.com",
    bucket:"acadlms-drm-backup",
    accessKey:"GCS_••••••••••••AB12",
    secretKey:"••••••••••••••••••••••••••••",
    region:"us-central1",
    cdnEnabled:true, cdnUrl:"https://gcs-cdn.acadlms.dev",
    signingEnabled:true, signedUrlTTL:7200,
    sseEnabled:true, sseAlgo:"AES256",
    filesStored:384, storageUsed:142e9, monthlyCost:7.60,
    latencyMs:42, uptimePct:99.99,
    lastTest:{ ok:true, ms:42, ts:"1h ago" },
  },
  {
    id:"s3", name:"Amazon S3", shortName:"S3",
    logo:"🟠", color:"var(--s3)",
    status:"idle", isPrimary:false,
    endpoint:"https://s3.us-east-1.amazonaws.com",
    bucket:"acadlms-drm-s3",
    accessKey:"AKIA••••••••••••5C9D",
    secretKey:"••••••••••••••••••••••••••••",
    region:"us-east-1",
    cdnEnabled:false, cdnUrl:"",
    signingEnabled:true, signedUrlTTL:3600,
    sseEnabled:true, sseAlgo:"aws:kms",
    filesStored:0, storageUsed:0, monthlyCost:0,
    latencyMs:null, uptimePct:null,
    lastTest:null,
  },
  {
    id:"azure", name:"Azure Blob Storage", shortName:"Azure",
    logo:"🔷", color:"var(--azure)",
    status:"idle", isPrimary:false,
    endpoint:"https://acadlmsstorage.blob.core.windows.net",
    bucket:"drm-assets",
    accessKey:"acadlmsstorage",
    secretKey:"••••••••••••••••••••••••••••",
    region:"eastus",
    cdnEnabled:false, cdnUrl:"",
    signingEnabled:true, signedUrlTTL:3600,
    sseEnabled:true, sseAlgo:"AES256",
    filesStored:0, storageUsed:0, monthlyCost:0,
    latencyMs:null, uptimePct:null,
    lastTest:null,
  },
  {
    id:"minio", name:"MinIO (Self-hosted)", shortName:"MinIO",
    logo:"🔴", color:"var(--minio)",
    status:"error", isPrimary:false,
    endpoint:"https://minio.internal.corp.com:9000",
    bucket:"drm-internal",
    accessKey:"minio_••••••••••",
    secretKey:"••••••••••••••••••••••••••••",
    region:"us-east-1",
    cdnEnabled:false, cdnUrl:"",
    signingEnabled:false, signedUrlTTL:3600,
    sseEnabled:false, sseAlgo:"None",
    filesStored:0, storageUsed:0, monthlyCost:0,
    latencyMs:null, uptimePct:null,
    lastTest:{ ok:false, ms:null, ts:"5m ago", error:"Connection timeout after 5000ms" },
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// RIGHTS MANAGEMENT VIEW
// ══════════════════════════════════════════════════════════════════════════════
const RightsView = () => {
  const [rules, setRules] = useState(RIGHTS_RULES);
  const [search, setSearch] = useState("");
  const [filterEvent, setFilterEvent] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [modal, setModal] = useState(null);
  const [selRule, setSelRule] = useState(null);
  const [subTab, setSubTab] = useState("rules");
  const [saved, setSaved] = useState(false);

  const blankRule = { name:"", event:"on_access", condition:"", action:"allow", profile:"All", priority:rules.length+1, active:true };
  const [form, setForm] = useState(blankRule);
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filtered = rules
    .filter(r => (filterEvent === "all" || r.event === filterEvent) && (r.name.toLowerCase().includes(search.toLowerCase()) || r.condition.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => sortBy === "priority" ? a.priority - b.priority : sortBy === "hits" ? b.hits - a.hits : a.name.localeCompare(b.name));

  const saveRule = () => {
    if (modal === "add") setRules(rs => [...rs, { ...form, id: Date.now(), hits: 0 }]);
    else setRules(rs => rs.map(r => r.id === modal ? { ...r, ...form } : r));
    setModal(null); setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  const ACTION_COLOR = { allow:"var(--green)", deny:"var(--red)", block:"var(--red)", revoke_token:"var(--orange)", pause_stream:"var(--orange)", inject_wm:"var(--teal)", "set_ttl=900":"var(--amber)", allow_all:"var(--green)", re_encrypt:"var(--indigo)", log_only:"var(--text2)" };
  const EVENT_COLOR  = { on_access:"var(--indigo)", on_stream:"var(--blue)", on_render:"var(--violet)", on_download:"var(--teal)", on_token_gen:"var(--amber)", on_sync:"var(--green)", on_upload:"var(--orange)", on_delete:"var(--red)" };

  return (
    <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:14 }}>

      {/* Sub-tabs */}
      <div style={{ display:"flex", gap:2, background:"var(--bg2)", padding:3, borderRadius:8, width:"fit-content" }}>
        {[["rules","Rights Rules"],["matrix","Permission Matrix"],["timeline","Rule Timeline"]].map(([id,lbl]) => (
          <div key={id} onClick={() => setSubTab(id)} style={{ padding:"7px 15px", borderRadius:7, fontSize:12.5, fontWeight:600, cursor:"pointer", color:subTab===id?"var(--text)":"var(--text2)", background:subTab===id?"var(--card)":"transparent", transition:"all .14s" }}>{lbl}</div>
        ))}
      </div>

      {/* ── RULES LIST ── */}
      {subTab==="rules" && <>
        {saved && <div style={{ padding:"10px 14px", background:"rgba(16,185,129,.08)", border:"1px solid rgba(16,185,129,.22)", borderRadius:8, fontSize:13, color:"var(--green)", display:"flex", gap:8, alignItems:"center" }}><I n="check" s={14}/>Rule saved successfully.</div>}

        {/* Toolbar */}
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:7, flex:1 }}>
            <span style={{ padding:"0 11px", color:"var(--text3)" }}><I n="search" s={14}/></span>
            <input style={{ background:"none", border:"none", padding:"8px", color:"var(--text)", fontSize:13, outline:"none", flex:1 }} placeholder="Search rules by name or condition…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <select className="sel" style={{ width:160, fontSize:12.5 }} value={filterEvent} onChange={e => setFilterEvent(e.target.value)}>
            <option value="all">All Events</option>
            {EVENT_OPTIONS.map(e => <option key={e}>{e}</option>)}
          </select>
          <select className="sel" style={{ width:140, fontSize:12.5 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="priority">Sort: Priority</option>
            <option value="hits">Sort: Hit Count</option>
            <option value="name">Sort: Name</option>
          </select>
          <button className="btn ba" onClick={() => { setForm(blankRule); setModal("add"); }}><I n="plus" s={14}/>New Rule</button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {[
            { label:"Total Rules",   val:rules.length,                         col:"var(--amber)"  },
            { label:"Active",        val:rules.filter(r=>r.active).length,     col:"var(--green)"  },
            { label:"Total Hits/Day",val:rules.reduce((n,r)=>n+r.hits,0).toLocaleString(), col:"var(--indigo)" },
            { label:"Events Covered",val:[...new Set(rules.map(r=>r.event))].length, col:"var(--teal)" },
          ].map(s => (
            <div className="scard" key={s.label}>
              <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:800, color:s.col, fontFamily:"var(--mono)", marginTop:3 }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Rules list */}
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {filtered.map(r => (
            <div key={r.id} className={`rule-row ${r.active?"active-rule":""}`} onClick={() => setSelRule(selRule===r.id?null:r.id)}>
              <div style={{ width:28, textAlign:"center", color:"var(--text3)", flexShrink:0, cursor:"grab" }}><I n="drag" s={13}/></div>
              <div style={{ width:26, height:26, borderRadius:6, background:"var(--bg2)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--mono)", fontSize:11, fontWeight:800, color:"var(--text2)", flexShrink:0 }}>{r.priority}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontWeight:700, fontSize:13.5 }}>{r.name}</span>
                  <span style={{ padding:"2px 7px", borderRadius:5, fontSize:11, fontWeight:700, background:EVENT_COLOR[r.event]+"14", color:EVENT_COLOR[r.event], border:`1px solid ${EVENT_COLOR[r.event]}28` }}>{r.event}</span>
                  <span style={{ padding:"2px 7px", borderRadius:5, fontSize:11, fontWeight:700, background:ACTION_COLOR[r.action]+"14", color:ACTION_COLOR[r.action], border:`1px solid ${ACTION_COLOR[r.action]}28` }}>{r.action}</span>
                  {r.profile!=="All" && <span className="badge BX" style={{ fontSize:10.5 }}>{r.profile}</span>}
                </div>
                <code style={{ fontSize:12, color:"var(--teal)", fontFamily:"var(--mono)", marginTop:3, display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.condition}</code>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontFamily:"var(--mono)", fontSize:13, fontWeight:700, color:"var(--text2)" }}>{r.hits.toLocaleString()}</div>
                <div style={{ fontSize:10.5, color:"var(--text3)" }}>hits/day</div>
              </div>
              <div className={`tog ${r.active?"on":""} grn`} style={{ flexShrink:0 }} onClick={e => { e.stopPropagation(); setRules(rs => rs.map(x => x.id===r.id?{...x,active:!x.active}:x)); }}/>
              <div style={{ display:"flex", gap:5, flexShrink:0 }} onClick={e => e.stopPropagation()}>
                <button className="btn bg bxs" onClick={() => { setForm({...r}); setModal(r.id); }}><I n="edit" s={12}/></button>
                <button className="btn bd bxs" onClick={() => setRules(rs => rs.filter(x => x.id!==r.id))}><I n="trash" s={12}/></button>
              </div>

              {/* Expanded */}
              {selRule===r.id && (
                <div style={{ gridColumn:"1/-1", width:"100%", marginTop:12, padding:"12px 14px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)", animation:"fadeIn .2s ease" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                    {[["Event Trigger",r.event],["Action",r.action],["Applies To",r.profile],["Daily Hits",r.hits.toLocaleString()],["Priority",`#${r.priority}`],["Status",r.active?"Active":"Inactive"]].map(([k,v])=>(
                      <div key={k} style={{ padding:"8px 10px", background:"var(--card)", borderRadius:7, border:"1px solid var(--border)" }}>
                        <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>{k}</div>
                        <div style={{ fontSize:13, fontWeight:700, marginTop:3, color:k==="Status"?r.active?"var(--green)":"var(--red)":"var(--text)" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:10 }}>
                    <div style={{ fontSize:10.5, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em", marginBottom:6 }}>Condition Expression</div>
                    <div className="codeblock"><span className="v">{r.condition}</span></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </>}

      {/* ── PERMISSION MATRIX ── */}
      {subTab==="matrix" && (
        <div style={{ overflowX:"auto", borderRadius:10, border:"1px solid var(--border)", background:"var(--card)" }}>
          <div style={{ minWidth:"max-content" }}>
            {/* Header */}
            <div style={{ display:"flex", borderBottom:"2px solid var(--border2)" }}>
              <div style={{ minWidth:200, background:"var(--bg2)", padding:"11px 14px", fontSize:11, fontWeight:700, color:"var(--text3)", letterSpacing:".06em", textTransform:"uppercase" }}>Action ╲ Event</div>
              {EVENT_OPTIONS.slice(0,6).map(e => (
                <div key={e} className="rm-cell rm-hdr" style={{ minWidth:120, borderRight:"1px solid var(--border)", padding:"0 8px", textAlign:"center", fontSize:10 }}>
                  {e.replace("on_","")}
                </div>
              ))}
            </div>
            {ACTION_OPTIONS.map((action, ai) => (
              <div key={action} style={{ display:"flex", borderBottom:"1px solid var(--border)" }}>
                <div style={{ minWidth:200, background:"var(--bg2)", padding:"10px 14px", fontFamily:"var(--mono)", fontSize:12.5, fontWeight:700, color:ACTION_COLOR[action] || "var(--text2)" }}>{action}</div>
                {EVENT_OPTIONS.slice(0,6).map(event => {
                  const hasRule = rules.some(r => r.event===event && r.action===action && r.active);
                  const ruleCount = rules.filter(r => r.event===event && r.action===action).length;
                  return (
                    <div key={event} className="rm-cell" style={{ minWidth:120, background: hasRule ? ACTION_COLOR[action]+"0D" : "transparent" }}>
                      {hasRule ? (
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:1 }}>
                          <I n="check" s={13} style={{ color: ACTION_COLOR[action] }}/>
                          <span style={{ fontSize:9, fontFamily:"var(--mono)", color:"var(--text3)" }}>{ruleCount}r</span>
                        </div>
                      ) : <span style={{ color:"var(--text4)", fontSize:12 }}>·</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RULE TIMELINE ── */}
      {subTab==="timeline" && (
        <div style={{ maxWidth:680 }}>
          <div style={{ fontSize:13, color:"var(--text2)", marginBottom:14 }}>Request evaluation order — rules checked top-to-bottom, first match wins.</div>
          {rules.filter(r=>r.active).sort((a,b)=>a.priority-b.priority).map((r, i, arr) => (
            <div key={r.id} style={{ display:"flex", gap:14, marginBottom:0 }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:20, flexShrink:0 }}>
                <div className="tnode" style={{ borderColor:ACTION_COLOR[r.action]||"var(--border2)", background:ACTION_COLOR[r.action]+"22" }}/>
                {i < arr.length-1 && <div className="tline" style={{ background:"var(--border)", flex:1, minHeight:32 }}/>}
              </div>
              <div style={{ flex:1, paddingBottom:i<arr.length-1?20:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--text3)" }}>#{r.priority}</span>
                  <span style={{ fontWeight:700, fontSize:13.5 }}>{r.name}</span>
                  <span style={{ padding:"2px 7px", borderRadius:5, fontSize:11, fontWeight:700, background:ACTION_COLOR[r.action]+"14", color:ACTION_COLOR[r.action] }}>{r.action}</span>
                </div>
                <code style={{ fontSize:11.5, color:"var(--teal)", fontFamily:"var(--mono)" }}>{r.condition}</code>
                <div style={{ fontSize:11, color:"var(--text3)", marginTop:3 }}>{r.event} · {r.hits.toLocaleString()} hits/day</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── RULE MODAL ── */}
      {modal && (
        <div className="ov" onClick={e => e.target===e.currentTarget&&setModal(null)}>
          <div className="modal" style={{ maxWidth:540 }}>
            <div className="mhd">
              <div><div style={{ fontWeight:700, fontSize:15 }}>{modal==="add"?"New Rights Rule":"Edit Rule"}</div><div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>Define condition-action logic for DRM enforcement</div></div>
              <button className="btn bg bico" onClick={() => setModal(null)}><I n="x" s={15}/></button>
            </div>
            <div className="mbd">
              <div className="fl"><label className="lbl">Rule Name *</label><input className="inp" placeholder="e.g. Block Trial After 5 Plays" value={form.name} onChange={e=>setF("name",e.target.value)} autoFocus/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                <div className="fl"><label className="lbl">Event Trigger</label>
                  <select className="sel" value={form.event} onChange={e=>setF("event",e.target.value)}>
                    {EVENT_OPTIONS.map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="fl"><label className="lbl">Action</label>
                  <select className="sel" value={form.action} onChange={e=>setF("action",e.target.value)}>
                    {ACTION_OPTIONS.map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="fl"><label className="lbl">Profile Scope</label>
                  <select className="sel" value={form.profile} onChange={e=>setF("profile",e.target.value)}>
                    {PROFILE_OPTIONS.map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="fl">
                <label className="lbl">Condition Expression *</label>
                <input className="inp" placeholder="e.g. user.group == Trial AND asset.views > 5" value={form.condition} onChange={e=>setF("condition",e.target.value)} style={{ fontFamily:"var(--mono)", fontSize:13 }}/>
                <div style={{ fontSize:11.5, color:"var(--text3)", marginTop:3 }}>
                  Supported: user.group, user.role, user.country, user.subscription.status, session.device_count, asset.type, asset.views, client.screen_record_detected, profile.max, !in_window
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div className="fl"><label className="lbl">Priority</label><input className="inp" type="number" min="1" max="100" value={form.priority} onChange={e=>setF("priority",Number(e.target.value))}/></div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 13px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)" }}>
                  <div><div style={{ fontWeight:600, fontSize:13 }}>Rule Active</div><div style={{ fontSize:11.5, color:"var(--text3)" }}>Evaluates on matching events</div></div>
                  <Toggle on={form.active} onChange={v=>setF("active",v)} cls="grn"/>
                </div>
              </div>
              {/* Preview */}
              <div style={{ padding:"12px 14px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)" }}>
                <div style={{ fontSize:10.5, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em", marginBottom:8 }}>Rule Preview</div>
                <div className="codeblock">
                  <span className="k">IF </span><span className="n">{form.event}</span><span className="k"> AND </span><span className="v">{form.condition||"…"}</span><span className="k"> THEN </span><span className="s">{form.action}</span><span className="c"> /* scope: {form.profile} · priority #{form.priority} */</span>
                </div>
              </div>
            </div>
            <div className="mft">
              <button className="btn bg" onClick={()=>setModal(null)}>Cancel</button>
              <button className="btn ba" onClick={saveRule} disabled={!form.name||!form.condition}><I n="check" s={13}/>Save Rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CLOUD STORAGE ADAPTERS
// ══════════════════════════════════════════════════════════════════════════════
const AdapterCard = ({ adapter, onEdit, onTest, onSetPrimary, testing }) => {
  const [expanded, setExpanded] = useState(false);
  const statusDot = { connected:"ok", idle:"idle", error:"err", testing:"testing" };

  return (
    <div className={`adapter-card ${adapter.status==="connected"?"active":""} ${testing?"testing":""}`}>
      {/* Top stripe */}
      <div style={{ height:3, background:`linear-gradient(to right, ${adapter.color}, ${adapter.color}44)` }}/>

      {/* Header */}
      <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:11, background:adapter.color+"18", border:`1.5px solid ${adapter.color}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
          {adapter.logo}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ fontWeight:700, fontSize:14 }}>{adapter.name}</span>
            {adapter.isPrimary && <span className="badge BA" style={{ fontSize:10 }}>Primary</span>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
            <div className={`conn-dot ${testing?"testing":statusDot[adapter.status]}`}/>
            <span style={{ fontSize:12, color:"var(--text2)", fontWeight:600 }}>
              {testing?"Testing…":adapter.status==="connected"?"Connected":adapter.status==="error"?"Connection Error":"Idle"}
            </span>
            {adapter.latencyMs && !testing && <span style={{ fontSize:11, color:"var(--text3)", fontFamily:"var(--mono)" }}>· {adapter.latencyMs}ms</span>}
          </div>
        </div>
        <div style={{ display:"flex", gap:6, flexShrink:0 }}>
          {!adapter.isPrimary && adapter.status==="connected" && (
            <button className="btn bg bxs" onClick={() => onSetPrimary(adapter.id)}>Set Primary</button>
          )}
          <button className={`btn ${testing?"ba":"bt"} bxs`} onClick={() => onTest(adapter.id)} disabled={testing}>
            {testing ? <span className="spin" style={{ display:"inline-block" }}>↻</span> : <I n="wifi" s={12}/>}
            {testing?"Testing":"Test"}
          </button>
          <button className="btn bg bxs" onClick={() => onEdit(adapter)}><I n="edit" s={12}/></button>
          <button className="btn bg bxs" onClick={() => setExpanded(!expanded)}>
            <I n={expanded?"chevD":"chevR"} s={12}/>
          </button>
        </div>
      </div>

      {/* Quick stats */}
      {adapter.status==="connected" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0, borderTop:"1px solid var(--border)" }}>
          {[
            { lbl:"Files",   val:adapter.filesStored,                                color:adapter.color },
            { lbl:"Storage", val:fmt(adapter.storageUsed),                            color:adapter.color },
            { lbl:"Cost/mo", val:`$${adapter.monthlyCost.toFixed(2)}`,               color:"var(--green)" },
            { lbl:"Uptime",  val:`${adapter.uptimePct}%`,                            color:"var(--teal)"  },
          ].map((m,i) => (
            <div key={m.lbl} style={{ padding:"10px 14px", borderRight:i<3?"1px solid var(--border)":"none", textAlign:"center" }}>
              <div style={{ fontFamily:"var(--mono)", fontWeight:800, fontSize:15, color:m.color }}>{m.val}</div>
              <div style={{ fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:".05em", marginTop:2 }}>{m.lbl}</div>
            </div>
          ))}
        </div>
      )}

      {/* Last test result */}
      {adapter.lastTest && (
        <div style={{ padding:"8px 16px", borderTop:"1px solid var(--border)", display:"flex", alignItems:"center", gap:8 }}>
          {adapter.lastTest.ok
            ? <div className="test-ok" style={{ flex:1 }}><I n="check" s={13}/>Connection OK · {adapter.lastTest.ms}ms · {adapter.lastTest.ts}</div>
            : <div className="test-fail" style={{ flex:1 }}><I n="alert" s={13}/>Failed: {adapter.lastTest.error} · {adapter.lastTest.ts}</div>
          }
        </div>
      )}

      {/* Error detail */}
      {adapter.status==="error" && (
        <div style={{ padding:"10px 16px", background:"rgba(239,68,68,.06)", borderTop:"1px solid rgba(239,68,68,.15)", fontSize:12.5, color:"var(--red)", display:"flex", gap:7 }}>
          <I n="alert" s={13}/>Endpoint unreachable. Check network, credentials, and bucket permissions.
        </div>
      )}

      {/* Expanded config */}
      {expanded && (
        <div style={{ padding:"14px 16px", borderTop:"1px solid var(--border)", display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, animation:"fadeIn .2s ease" }}>
          {[
            ["Endpoint",        adapter.endpoint],
            ["Bucket",          adapter.bucket],
            ["Region",          adapter.region],
            ["Access Key",      adapter.accessKey],
            ["CDN URL",         adapter.cdnEnabled?adapter.cdnUrl:"Disabled"],
            ["Signed URLs",     adapter.signingEnabled?`Enabled (${adapter.signedUrlTTL}s TTL)`:"Disabled"],
            ["Server-side Enc.",adapter.sseEnabled?adapter.sseAlgo:"Disabled"],
            ["CDN Enabled",     adapter.cdnEnabled?"Yes":"No"],
          ].map(([k,v]) => (
            <div key={k} style={{ display:"flex", flexDirection:"column", gap:2 }}>
              <div style={{ fontSize:10.5, color:"var(--text3)", fontWeight:700, letterSpacing:".05em", textTransform:"uppercase" }}>{k}</div>
              <div style={{ fontSize:12.5, fontFamily:"var(--mono)", color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={v}>{v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdapterModal = ({ adapter, onSave, onClose }) => {
  const [form, setForm] = useState(adapter ? { ...adapter } : {
    id:"new", name:"New Adapter", shortName:"", logo:"☁️", color:"#6366F1",
    status:"idle", isPrimary:false,
    endpoint:"", bucket:"", accessKey:"", secretKey:"", region:"us-east-1",
    cdnEnabled:false, cdnUrl:"", signingEnabled:true, signedUrlTTL:3600,
    sseEnabled:true, sseAlgo:"AES256",
    filesStored:0, storageUsed:0, monthlyCost:0,
    latencyMs:null, uptimePct:null, lastTest:null,
  });
  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const isEdit = !!adapter;

  return (
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ maxWidth:600 }}>
        <div className="mhd">
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>{isEdit?"Configure "+adapter.name:"Add Storage Adapter"}</div>
            <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>Storage credentials are encrypted at rest using AES-256.</div>
          </div>
          <button className="btn bg bico" onClick={onClose}><I n="x" s={15}/></button>
        </div>
        <div className="mbd">
          {!isEdit && (
            <div className="fl">
              <label className="lbl">Adapter Type</label>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
                {[["r2","☁️ R2"],["gcs","🔵 GCS"],["s3","🟠 S3"],["azure","🔷 Azure"],["minio","🔴 MinIO"]].map(([id,lbl])=>(
                  <div key={id} onClick={()=>setF("id",id)} style={{ padding:"10px 8px", borderRadius:8, textAlign:"center", cursor:"pointer", border:`1.5px solid ${form.id===id?"var(--amber)":"var(--border)"}`, background:form.id===id?"var(--adim)":"var(--bg2)", fontSize:12.5, fontWeight:700, transition:"all .14s", color:form.id===id?"var(--amber)":"var(--text2)" }}>{lbl}</div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div className="fl"><label className="lbl">Endpoint URL</label><input className="inp" placeholder="https://…" value={form.endpoint} onChange={e=>setF("endpoint",e.target.value)} style={{ fontFamily:"var(--mono)", fontSize:12.5 }}/></div>
            <div className="fl"><label className="lbl">Bucket / Container</label><input className="inp" placeholder="my-drm-bucket" value={form.bucket} onChange={e=>setF("bucket",e.target.value)} style={{ fontFamily:"var(--mono)", fontSize:13 }}/></div>
            <div className="fl"><label className="lbl">Access Key ID</label><input className="inp" placeholder="AKIA…" value={form.accessKey} onChange={e=>setF("accessKey",e.target.value)} style={{ fontFamily:"var(--mono)", fontSize:13 }}/></div>
            <div className="fl"><label className="lbl">Secret Access Key</label><input className="inp" type="password" placeholder="••••••••••••••••••••" value={form.secretKey} onChange={e=>setF("secretKey",e.target.value)} style={{ fontFamily:"var(--mono)", fontSize:13 }}/></div>
            <div className="fl"><label className="lbl">Region</label><input className="inp" placeholder="us-east-1 / auto" value={form.region} onChange={e=>setF("region",e.target.value)} style={{ fontFamily:"var(--mono)", fontSize:13 }}/></div>
            <div className="fl"><label className="lbl">Server-Side Encryption</label>
              <select className="sel" value={form.sseAlgo} onChange={e=>setF("sseAlgo",e.target.value)}>
                {["AES256","aws:kms","AES256-GCM","ChaCha20","None"].map(a=><option key={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display:"flex", gap:12 }}>
            {[
              ["cdnEnabled","CDN Enabled","Serve files via CDN"],
              ["signingEnabled","Signed URLs","Require token for all requests"],
              ["sseEnabled","Server-Side Encryption","Encrypt at rest"],
            ].map(([k,lbl,sub])=>(
              <div key={k} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 13px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)" }}>
                <div><div style={{ fontSize:13, fontWeight:600 }}>{lbl}</div><div style={{ fontSize:11, color:"var(--text3)" }}>{sub}</div></div>
                <div className={`tog ${form[k]?"on":""} grn`} onClick={()=>setF(k,!form[k])}/>
              </div>
            ))}
          </div>

          {form.cdnEnabled && (
            <div className="fl"><label className="lbl">CDN Base URL</label><input className="inp" placeholder="https://cdn.example.com" value={form.cdnUrl} onChange={e=>setF("cdnUrl",e.target.value)} style={{ fontFamily:"var(--mono)", fontSize:13 }}/></div>
          )}
          {form.signingEnabled && (
            <div className="fl">
              <label className="lbl">Signed URL TTL (seconds): <span style={{ color:"var(--amber)" }}>{form.signedUrlTTL}s · {Math.round(form.signedUrlTTL/60)}m</span></label>
              <input type="range" className="range" min="60" max="86400" step="60" value={form.signedUrlTTL} onChange={e=>setF("signedUrlTTL",Number(e.target.value))}/>
            </div>
          )}

          <div style={{ padding:"10px 13px", background:"rgba(245,158,11,.06)", border:"1px solid rgba(245,158,11,.18)", borderRadius:8, fontSize:12.5, color:"var(--amber2)", display:"flex", gap:8 }}>
            <I n="lock" s={13}/>Credentials are encrypted using platform master key before storage. Never logged.
          </div>
        </div>
        <div className="mft">
          <button className="btn bg" onClick={onClose}>Cancel</button>
          <button className="btn ba" onClick={()=>onSave(form)} disabled={!form.endpoint||!form.bucket}><I n="check" s={13}/>{isEdit?"Save Changes":"Add Adapter"}</button>
        </div>
      </div>
    </div>
  );
};

const CloudStorageView = () => {
  const [adapters, setAdapters] = useState(INIT_ADAPTERS);
  const [modal, setModal] = useState(null); // null | "add" | adapter object
  const [testing, setTesting] = useState(null); // adapter id being tested
  const [subTab, setSubTab] = useState("adapters");

  const saveAdapter = (form) => {
    if (modal==="add") setAdapters(as=>[...as,form]);
    else setAdapters(as=>as.map(a=>a.id===form.id?form:a));
    setModal(null);
  };

  const testAdapter = (id) => {
    setTesting(id);
    setTimeout(() => {
      setAdapters(as=>as.map(a => {
        if (a.id!==id) return a;
        const ok = a.id!=="minio";
        return { ...a, status:ok?"connected":"error", latencyMs:ok?Math.floor(Math.random()*50+10):null, uptimePct:ok?99.97:null, lastTest:{ ok, ms:ok?Math.floor(Math.random()*50+10):null, ts:"just now", error:ok?null:"Connection timeout after 5000ms" }};
      }));
      setTesting(null);
    }, 2000);
  };

  const setPrimary = (id) => setAdapters(as=>as.map(a=>({...a,isPrimary:a.id===id})));

  const totalStorage = adapters.filter(a=>a.status==="connected").reduce((n,a)=>n+a.storageUsed,0);
  const connectedCount = adapters.filter(a=>a.status==="connected").length;

  return (
    <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:14 }}>
      {/* Sub-tabs */}
      <div style={{ display:"flex", gap:2, background:"var(--bg2)", padding:3, borderRadius:8, width:"fit-content" }}>
        {[["adapters","Storage Adapters"],["routing","Routing Config"],["cdn","CDN Settings"]].map(([id,lbl])=>(
          <div key={id} onClick={()=>setSubTab(id)} style={{ padding:"7px 15px", borderRadius:7, fontSize:12.5, fontWeight:600, cursor:"pointer", color:subTab===id?"var(--text)":"var(--text2)", background:subTab===id?"var(--card)":"transparent", transition:"all .14s" }}>{lbl}</div>
        ))}
      </div>

      {/* ── ADAPTERS ── */}
      {subTab==="adapters" && <>
        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {[
            { label:"Adapters",      val:adapters.length,      col:"var(--amber)"  },
            { label:"Connected",     val:connectedCount,       col:"var(--green)"  },
            { label:"Total Storage", val:fmt(totalStorage),    col:"var(--indigo)" },
            { label:"Monthly Cost",  val:"$"+adapters.reduce((n,a)=>n+a.monthlyCost,0).toFixed(2), col:"var(--teal)" },
          ].map(s=>(
            <div className="scard" key={s.label}>
              <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:800, color:s.col, fontFamily:"var(--mono)", marginTop:3 }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Adapter cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {adapters.map(a=>(
            <AdapterCard key={a.id} adapter={a} testing={testing===a.id}
              onEdit={ad=>setModal(ad)} onTest={testAdapter} onSetPrimary={setPrimary}/>
          ))}
        </div>

        <button className="btn bg" style={{ alignSelf:"flex-start", gap:8 }} onClick={()=>setModal("add")}><I n="plus" s={14}/>Add Storage Adapter</button>
      </>}

      {/* ── ROUTING ── */}
      {subTab==="routing" && (
        <div style={{ maxWidth:720, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ fontSize:13.5, color:"var(--text2)", lineHeight:1.6 }}>
            Configure how files are routed to storage backends. Rules evaluated top-to-bottom.
          </div>

          {[
            { rule:"asset.type == video AND size > 500MB", dest:"Cloudflare R2 (Primary)",  reason:"Large video files — low-latency CDN edge", color:"var(--r2)"    },
            { rule:"asset.type == pdf",                    dest:"Cloudflare R2 (Primary)",  reason:"Documents — R2 zero-egress pricing",       color:"var(--r2)"    },
            { rule:"backup == true",                       dest:"Google Cloud Storage",     reason:"Backup tier — cross-region redundancy",     color:"var(--gcs)"   },
            { rule:"asset.type == video AND size <= 500MB",dest:"Cloudflare R2 (Primary)",  reason:"Short clips — default edge storage",        color:"var(--r2)"    },
            { rule:"*",                                    dest:"Cloudflare R2 (Primary)",  reason:"Fallback — catch-all rule",                  color:"var(--amber)" },
          ].map((r,i)=>(
            <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"13px 16px", borderRadius:9, border:"1px solid var(--border)", background:"var(--card)" }}>
              <div style={{ width:24, height:24, borderRadius:6, background:"var(--bg2)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--mono)", fontSize:11, fontWeight:800, color:"var(--text3)", flexShrink:0 }}>{i+1}</div>
              <div style={{ flex:1 }}>
                <code style={{ fontSize:13, color:"var(--teal)", fontFamily:"var(--mono)", display:"block", marginBottom:4 }}>{r.rule}</code>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ fontSize:12.5 }}>→</span>
                  <span style={{ fontWeight:700, fontSize:13, color:r.color }}>{r.dest}</span>
                </div>
                <div style={{ fontSize:12, color:"var(--text3)", marginTop:3 }}>{r.reason}</div>
              </div>
              <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                <button className="btn bg bxs"><I n="edit" s={12}/></button>
                {i < 4 && <button className="btn bd bxs"><I n="trash" s={12}/></button>}
              </div>
            </div>
          ))}

          <button className="btn bg bsm" style={{ alignSelf:"flex-start" }}><I n="plus" s={13}/>Add Routing Rule</button>

          <div className="card" style={{ marginTop:4 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Failover Configuration</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[["Primary Adapter","Cloudflare R2"],["Failover Adapter","Google Cloud Storage"],["Retry Attempts","3"],["Retry Backoff","Exponential (2s base)"],["Health Check Interval","60s"],["Auto-Failover","Enabled"]].map(([k,v])=>(
                <div key={k} className="card2">
                  <div style={{ fontSize:10.5, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>{k}</div>
                  <input className="inp" defaultValue={v} style={{ marginTop:7, fontSize:13 }}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CDN ── */}
      {subTab==="cdn" && (
        <div style={{ maxWidth:720, display:"flex", flexDirection:"column", gap:14 }}>
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>CDN Configuration</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div className="fl"><label className="lbl">Primary CDN Provider</label>
                <select className="sel"><option>Cloudflare</option><option>CloudFront (AWS)</option><option>Fastly</option><option>BunnyCDN</option><option>None</option></select>
              </div>
              <div className="fl"><label className="lbl">CDN Zone URL</label><input className="inp" defaultValue="https://cdn.acadlms.dev" style={{ fontFamily:"var(--mono)", fontSize:12.5 }}/></div>
              <div className="fl"><label className="lbl">Cache TTL (seconds)</label><input className="inp" defaultValue="86400" style={{ fontFamily:"var(--mono)" }}/></div>
              <div className="fl"><label className="lbl">Max File Size via CDN</label><input className="inp" defaultValue="2 GB" style={{ fontFamily:"var(--mono)" }}/></div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Signed URL Policy</div>
            {[
              ["Require signed URLs for all DRM content", true],
              ["Include user fingerprint in token", true],
              ["Rotate signing keys every 90 days", true],
              ["Invalidate token on IP change", false],
              ["Hotlink protection (block direct access)", true],
            ].map(([lbl,def])=>(
              <div key={lbl} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 0", borderBottom:"1px solid var(--border)" }}>
                <span style={{ fontSize:13.5, fontWeight:600 }}>{lbl}</span>
                <div className={`tog ${def?"on":""} grn`}/>
              </div>
            ))}
          </div>

          {/* CDN Speed test viz */}
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Edge Node Latency</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
              {[["North America","18ms","var(--green)"],["Europe","32ms","var(--green)"],["Asia Pacific","64ms","var(--amber)"],["South America","110ms","var(--orange)"]].map(([region,latency,col])=>(
                <div key={region} style={{ padding:"13px", background:"var(--bg2)", borderRadius:9, border:"1px solid var(--border)", textAlign:"center" }}>
                  <div style={{ fontFamily:"var(--mono)", fontWeight:800, fontSize:20, color:col }}>{latency}</div>
                  <div style={{ fontSize:12, color:"var(--text3)", marginTop:4 }}>{region}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {modal && <AdapterModal adapter={modal==="add"?null:modal} onSave={saveAdapter} onClose={()=>setModal(null)}/>}
    </div>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
const SIDENAV = [
  { sec:"Phase 7", items:[
    { id:"rights",   icon:"key",    label:"Rights Management" },
    { id:"storage",  icon:"cloud",  label:"Cloud Storage"     },
  ]},
  { sec:"DRM Phase 6", items:[
    { id:"dashboard",icon:"chart",  label:"Dashboard",  dim:true, phase:"Ph 6" },
    { id:"groups",   icon:"users",  label:"User Groups", dim:true, phase:"Ph 6" },
    { id:"profiles", icon:"shield", label:"Lic. Profiles",dim:true,phase:"Ph 6" },
  ]},
  { sec:"Coming Next", items:[
    { id:"protect",  icon:"lock",   label:"File Protection", dim:true, phase:"Ph 8" },
    { id:"reports",  icon:"chart",  label:"DRM Reports",     dim:true, phase:"Ph 8" },
  ]},
];


export { RightsView, CloudStorageView };
