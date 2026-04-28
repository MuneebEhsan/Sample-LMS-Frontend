import { useState, useEffect, useRef, useCallback } from 'react';
import { I, Av, Dot, Toggle, Spark, BarChart, Gauge, Donut } from '../shared.jsx';


const fmtBytes = n => n >= 1e9 ? (n/1e9).toFixed(2)+" GB" : n >= 1e6 ? (n/1e6).toFixed(1)+" MB" : (n/1e3).toFixed(0)+" KB";

// Fake token generator
const genToken = (prefix = "drm") => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const seg = (n) => Array.from({length:n}, () => chars[Math.floor(Math.random()*chars.length)]).join("");
  return `${prefix}_${seg(8)}.${seg(24)}.${seg(16)}`;
};
const genKeyId  = () => "kid_" + Math.random().toString(36).slice(2,10).toUpperCase();
const genHex    = (n=32) => Array.from({length:n}, () => Math.floor(Math.random()*16).toString(16)).join("");

// ══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ══════════════════════════════════════════════════════════════════════════════
const INIT_FILES = [
  { id:1,  name:"react-hooks-deep-dive.mp4",     type:"video", size:847e6,  course:"Advanced React",  profile:"Enterprise", status:"protected", algo:"AES-256-GCM",  watermark:true,  screenBlock:true,  geoLock:false, tokenTTL:3600, plays:2841, keyId:"KID_A1B2C3", uploadedAt:"Jun 10 2024", thumb:"🎬" },
  { id:2,  name:"typescript-generics-guide.pdf",  type:"pdf",   size:2.4e6,  course:"Advanced React",  profile:"Enterprise", status:"protected", algo:"AES-256-GCM",  watermark:true,  screenBlock:false, geoLock:false, tokenTTL:3600, plays:1203, keyId:"KID_D4E5F6", uploadedAt:"Jun 10 2024", thumb:"📄" },
  { id:3,  name:"neural-networks-explained.mp4",  type:"video", size:1.2e9,  course:"ML Fundamentals", profile:"Trial",      status:"protected", algo:"AES-128-HLS",  watermark:true,  screenBlock:true,  geoLock:true,  tokenTTL:900,  plays:891,  keyId:"KID_G7H8I9", uploadedAt:"Jun 09 2024", thumb:"🎬" },
  { id:4,  name:"gradient-descent-workbook.pdf",  type:"pdf",   size:8.1e6,  course:"ML Fundamentals", profile:"Trial",      status:"protected", algo:"AES-128-HLS",  watermark:true,  screenBlock:false, geoLock:true,  tokenTTL:900,  plays:445,  keyId:"KID_J1K2L3", uploadedAt:"Jun 09 2024", thumb:"📄" },
  { id:5,  name:"figma-component-library.pdf",    type:"pdf",   size:18.4e6, course:"UX Design",       profile:"Enterprise", status:"protected", algo:"AES-256-GCM",  watermark:true,  screenBlock:false, geoLock:false, tokenTTL:7200, plays:2107, keyId:"KID_M4N5O6", uploadedAt:"Jun 08 2024", thumb:"📄" },
  { id:6,  name:"rest-api-architecture.mp4",      type:"video", size:634e6,  course:"Node.js & REST",  profile:"Creator",    status:"protected", algo:"None",         watermark:false, screenBlock:false, geoLock:false, tokenTTL:86400,plays:3402, keyId:"KID_P7Q8R9", uploadedAt:"Jun 08 2024", thumb:"🎬" },
  { id:7,  name:"lesson-summary.html",            type:"html",  size:148e3,  course:"Advanced React",  profile:"Enterprise", status:"protected", algo:"AES-256-GCM",  watermark:true,  screenBlock:true,  geoLock:false, tokenTTL:1800, plays:612,  keyId:"KID_S1T2U3", uploadedAt:"Jun 07 2024", thumb:"🌐" },
  { id:8,  name:"ux-sprint-slides.html",          type:"html",  size:220e3,  course:"UX Design",       profile:"Corporate",  status:"protected", algo:"AES-256-GCM",  watermark:true,  screenBlock:true,  geoLock:true,  tokenTTL:1800, plays:389,  keyId:"KID_V4W5X6", uploadedAt:"Jun 07 2024", thumb:"🌐" },
  { id:9,  name:"brand-asset-pack.zip",           type:"zip",   size:94.2e6, course:"UX Design",       profile:"Enterprise", status:"protected", algo:"AES-256-GCM",  watermark:false, screenBlock:false, geoLock:false, tokenTTL:3600, plays:201,  keyId:"KID_Y7Z8A9", uploadedAt:"Jun 06 2024", thumb:"🗜️" },
  { id:10, name:"course-hero-banner.png",         type:"image", size:4.2e6,  course:"UX Design",       profile:"Enterprise", status:"protected", algo:"AES-256-GCM",  watermark:true,  screenBlock:false, geoLock:false, tokenTTL:3600, plays:892,  keyId:"KID_B1C2D3", uploadedAt:"Jun 06 2024", thumb:"🖼️" },
  { id:11, name:"database-schema-design.mp4",     type:"video", size:490e6,  course:"Node.js & REST",  profile:null,         status:"unprotected",algo:"None",         watermark:false, screenBlock:false, geoLock:false, tokenTTL:null, plays:189,  keyId:null,         uploadedAt:"Jun 05 2024", thumb:"🎬" },
  { id:12, name:"accessibility-handbook.pdf",     type:"pdf",   size:5.6e6,  course:"UX Design",       profile:null,         status:"unprotected",algo:"None",         watermark:false, screenBlock:false, geoLock:false, tokenTTL:null, plays:0,    keyId:null,         uploadedAt:"Jun 05 2024", thumb:"📄" },
];

const INIT_TOKENS = [
  { id:"TK001", token:genToken("drm"), fileId:1,  fileName:"react-hooks-deep-dive.mp4",    user:"Elena Vasquez",  av:"EV", col:"#6366F1", profile:"Enterprise", issued:"2024-06-10 14:22", expires:"2024-06-10 15:22", ttl:3600, status:"valid",   ip:"192.168.1.14",  ua:"Chrome 124 / macOS", uses:3, maxUses:null },
  { id:"TK002", token:genToken("drm"), fileId:3,  fileName:"neural-networks-explained.mp4", user:"Ryan Okafor",    av:"RO", col:"#14B8A6", profile:"Trial",      issued:"2024-06-10 13:58", expires:"2024-06-10 14:13", ttl:900,  status:"expired",  ip:"10.0.0.22",     ua:"Firefox 125 / Win", uses:1, maxUses:5 },
  { id:"TK003", token:genToken("drm"), fileId:2,  fileName:"typescript-generics-guide.pdf",  user:"Mei Lin",        av:"ML", col:"#F59E0B", profile:"Enterprise", issued:"2024-06-10 13:30", expires:"2024-06-10 14:30", ttl:3600, status:"valid",   ip:"172.16.0.8",    ua:"Safari 17 / iOS",   uses:7, maxUses:null },
  { id:"TK004", token:genToken("drm"), fileId:5,  fileName:"figma-component-library.pdf",    user:"Sophie Laurent", av:"SL", col:"#EC4899", profile:"Enterprise", issued:"2024-06-10 11:44", expires:"2024-06-10 13:44", ttl:7200, status:"valid",   ip:"192.168.2.33",  ua:"Chrome 124 / Win",  uses:12,maxUses:null },
  { id:"TK005", token:genToken("drm"), fileId:1,  fileName:"react-hooks-deep-dive.mp4",    user:"Kenji Tanaka",   av:"KT", col:"#F97316", profile:"Enterprise", issued:"2024-06-10 10:00", expires:"2024-06-10 11:00", ttl:3600, status:"revoked",  ip:"203.0.113.55",  ua:"Chrome 124 / Win",  uses:0, maxUses:null },
  { id:"TK006", token:genToken("drm"), fileId:7,  fileName:"lesson-summary.html",          user:"Ali Hassan",     av:"AH", col:"#10B981", profile:"Enterprise", issued:"2024-06-10 09:55", expires:"2024-06-10 10:25", ttl:1800, status:"valid",   ip:"10.0.1.4",      ua:"Edge 124 / Win",    uses:2, maxUses:null },
];

const FORMAT_DEFS = {
  video: {
    color:"#6366F1", label:"Video",      ext:["mp4","m3u8","webm","mkv"],
    icon:"video",    desc:"HLS/DASH streaming with AES-128/256 segment encryption",
    layers: [
      { key:"encryption",   label:"AES Segment Encryption",   desc:"Encrypts every HLS/DASH segment individually",              default:true  },
      { key:"watermark",    label:"Dynamic Video Watermark",   desc:"Burns user email+IP into video frames server-side",         default:true  },
      { key:"screenBlock",  label:"Screen Capture Block",      desc:"Detects OBS, Bandicam, iOS Screen Record and pauses stream",default:true  },
      { key:"tokenAuth",    label:"Signed URL Token Auth",     desc:"Every manifest and segment request requires a valid token", default:true  },
      { key:"geoLock",      label:"Geo IP Restriction",        desc:"Block playback outside approved countries",                 default:false },
      { key:"deviceLimit",  label:"Device Limit Enforcement",  desc:"Max concurrent devices per license profile",                default:true  },
      { key:"offlineEnc",   label:"Offline Cache Encryption",  desc:"Re-encrypts cached segments with device-bound key",         default:false },
    ],
    algos: ["AES-128-HLS","AES-256-GCM","ChaCha20-Poly1305"],
  },
  pdf: {
    color:"#EF4444", label:"PDF",        ext:["pdf"],
    icon:"file",     desc:"Encrypted PDFs with dynamic visible watermarks and copy protection",
    layers: [
      { key:"encryption",   label:"PDF Encryption (256-bit)",  desc:"RC4-256 / AES-256 owner password with permission flags",    default:true  },
      { key:"watermark",    label:"Visible Watermark Overlay",  desc:"User email, date, and IP stamped diagonally across pages",  default:true  },
      { key:"printBlock",   label:"Print Restriction",         desc:"Disables browser and OS print dialogs",                      default:true  },
      { key:"copyBlock",    label:"Copy-Paste Block",          desc:"Disables text selection and clipboard copy",                 default:true  },
      { key:"tokenAuth",    label:"Signed URL Token Auth",     desc:"PDF served only with valid expiring token",                 default:true  },
      { key:"pageExpiry",   label:"Page-Level Expiry",         desc:"Pages self-destruct after configured hours",                default:false },
    ],
    algos: ["AES-256-GCM","RC4-256","AES-128-CBC"],
  },
  html: {
    color:"#F97316", label:"HTML",       ext:["html","htm"],
    icon:"code",     desc:"Obfuscated HTML with anti-devtools, iframe sandbox, and CSP injection",
    layers: [
      { key:"obfuscation",  label:"JS/HTML Obfuscation",       desc:"Renames vars, mangles strings, inserts dead code",          default:true  },
      { key:"devtoolsBlock","label":"DevTools Detection",      desc:"Detects open DevTools and blanks the page",                 default:true  },
      { key:"watermark",    label:"Invisible DOM Watermark",   desc:"Injects hidden user-ID spans detectable by forensics",      default:true  },
      { key:"iframeSandbox",label:"iframe Sandbox CSP",        desc:"Prevents embedding in unauthorized domains",                default:true  },
      { key:"tokenAuth",    label:"Signed URL Token Auth",     desc:"HTML file served only with valid expiring token",           default:true  },
      { key:"selfDestruct", label:"Session Self-Destruct",     desc:"Clears page on tab/window visibility change",               default:false },
    ],
    algos: ["Obfuscation + CSP","AES-256-GCM + Obfuscation"],
  },
  image: {
    color:"#14B8A6", label:"Image",      ext:["png","jpg","webp","svg"],
    icon:"image",    desc:"Steganographic watermarking + signed CDN delivery for all image types",
    layers: [
      { key:"steganography","label":"Steganographic Watermark", desc:"Encodes user ID invisibly into pixel data",                 default:true  },
      { key:"visibleWM",    label:"Visible Overlay Watermark",  desc:"Semi-transparent text overlay stamped at delivery",        default:false },
      { key:"tokenAuth",    label:"Signed URL Token Auth",      desc:"Image URL requires valid HMAC-signed token",               default:true  },
      { key:"hotlinkBlock", label:"Hotlink Protection",         desc:"Blocks direct URL sharing — referrer validation",          default:true  },
      { key:"exifStrip",    label:"EXIF Data Stripping",        desc:"Removes GPS, camera, and author metadata on delivery",     default:true  },
      { key:"forensicWM",   label:"Forensic Hash Watermark",    desc:"Embeds traceable hash in DCT coefficients (JPEG/WebP)",    default:false },
    ],
    algos: ["AES-256-GCM","Steganographic","Signed CDN URL"],
  },
  zip: {
    color:"#8B5CF6", label:"Archive",    ext:["zip","tar.gz","rar"],
    icon:"zip",      desc:"Password-protected archives with encrypted manifest and download tokens",
    layers: [
      { key:"encryption",   label:"Archive Encryption (AES)",  desc:"ZIP AES-256 encryption with per-user derived password",     default:true  },
      { key:"tokenAuth",    label:"Signed Download Token",     desc:"One-time signed URL for archive download",                  default:true  },
      { key:"fileManifest", label:"Encrypted Manifest",        desc:"Signed list of archive contents to detect tampering",       default:true  },
      { key:"expiry",       label:"Download Link Expiry",      desc:"Download URL expires after configured TTL",                 default:true  },
    ],
    algos: ["ZIP-AES-256","7z-AES-256"],
  },
};

// ── Format Policy Card (needs own state for expand toggle) ────────────────────
const FormatCard = ({ type, def, count, total }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="fmt-card" onClick={() => setExpanded(e => !e)}>
      <div className="fmt-hdr" style={{ background:`linear-gradient(to right, ${def.color}, ${def.color}66)` }}/>
      <div style={{ padding:"14px 16px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:def.color+"18", border:`1.5px solid ${def.color}30`, display:"flex", alignItems:"center", justifyContent:"center", color:def.color }}>
              <I n={def.icon} s={18}/>
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:14.5 }}>{def.label} Files</div>
              <div style={{ fontSize:11.5, color:"var(--text3)", marginTop:1 }}>.{def.ext.join(", .")}</div>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"var(--mono)", fontWeight:800, fontSize:16, color:def.color }}>{count}/{total}</div>
            <div style={{ fontSize:10, color:"var(--text3)" }}>protected</div>
          </div>
        </div>
        <div style={{ fontSize:12.5, color:"var(--text2)", marginBottom:12, lineHeight:1.5 }}>{def.desc}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {def.layers.slice(0, expanded ? undefined : 3).map(layer => (
            <div key={layer.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 10px", background:"var(--bg2)", borderRadius:7, border:"1px solid var(--border)" }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:12.5 }}>{layer.label}</div>
                {expanded && <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>{layer.desc}</div>}
              </div>
              <div className={`tog ${layer.default?"on":""} grn`} style={{ marginLeft:10 }} onClick={e => e.stopPropagation()}/>
            </div>
          ))}
        </div>
        {def.layers.length > 3 && (
          <div style={{ marginTop:8, fontSize:12, color:"var(--amber)", fontWeight:600 }}>
            {expanded ? "Show less ↑" : `+${def.layers.length - 3} more layers ↓`}
          </div>
        )}
        {expanded && (
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em", marginBottom:6 }}>Encryption Algorithm</div>
            <select className="sel" style={{ fontSize:12.5 }} onClick={e => e.stopPropagation()} defaultValue={def.algos[0]}>
              {def.algos.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// FILE PROTECTION VIEW
// ══════════════════════════════════════════════════════════════════════════════
const ProtectFilesView = () => {
  const [files, setFiles]     = useState(INIT_FILES);
  const [selFile, setSelFile] = useState(null);
  const [search, setSearch]   = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [encrypting, setEncrypting] = useState(null);
  const [encProgress, setEncProgress] = useState(0);
  const [encLog, setEncLog]   = useState([]);
  const [subTab, setSubTab]   = useState("files");
  const [drag, setDrag]       = useState(false);
  const [configModal, setConfigModal] = useState(null);

  // Simulate encryption process
  const protectFile = useCallback((file) => {
    setEncrypting(file.id);
    setEncProgress(0);
    setEncLog([]);
    const LOG_STEPS = [
      { p:5,  msg:`[init]    Validating file integrity — SHA-256 hash computed` },
      { p:15, msg:`[keys]    Generating AES-256-GCM content encryption key (CEK)` },
      { p:25, msg:`[keys]    Wrapping CEK with platform master key (RSA-OAEP-4096)` },
      { p:35, msg:`[encrypt] Encrypting ${file.name} with CEK...` },
      { p:50, msg:`[encrypt] Writing encrypted segments to cloud storage` },
      { p:60, msg:`[drm]     Registering key ID ${genKeyId()} in key server` },
      { p:70, msg:`[wm]      Injecting watermark template for runtime stamping` },
      { p:80, msg:`[policy]  Writing license policy to DRM database` },
      { p:90, msg:`[cdn]     Purging CDN cache — propagating to edge nodes` },
      { p:100,msg:`[done]    ${file.name} is now DRM-protected ✓` },
    ];
    let step = 0;
    const tick = setInterval(() => {
      if (step >= LOG_STEPS.length) {
        clearInterval(tick);
        setFiles(fs => fs.map(f => f.id === file.id ? { ...f, status:"protected", algo:"AES-256-GCM", watermark:true, screenBlock:true, tokenTTL:3600, keyId:genKeyId() } : f));
        setEncrypting(null);
        return;
      }
      const s = LOG_STEPS[step];
      setEncProgress(s.p);
      setEncLog(l => [...l, s.msg]);
      step++;
    }, 280);
  }, []);

  const revokeProtection = (id) => {
    setFiles(fs => fs.map(f => f.id === id ? { ...f, status:"unprotected", algo:"None", watermark:false, screenBlock:false, tokenTTL:null, keyId:null } : f));
    if (selFile?.id === id) setSelFile(null);
  };

  const filtered = files.filter(f => {
    const q = search.toLowerCase();
    const matchQ = f.name.toLowerCase().includes(q) || f.course.toLowerCase().includes(q);
    const matchT = typeFilter === "all" || f.type === typeFilter;
    const matchS = statusFilter === "all" || f.status === statusFilter;
    return matchQ && matchT && matchS;
  });

  const TYPE_COLORS = { video:"var(--indigo)", pdf:"var(--red)", html:"var(--orange)", image:"var(--teal)", zip:"var(--violet)" };
  const protectedCount = files.filter(f => f.status === "protected").length;
  const totalSize      = files.reduce((n, f) => n + f.size, 0);

  return (
    <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>

      {/* Sub-tabs */}
      <div style={{ display:"flex", gap:2, background:"var(--bg2)", padding:3, borderRadius:8, width:"fit-content" }}>
        {[["files","File Library"],["formats","Format Policies"],["pipeline","Encryption Pipeline"],["keys","Key Management"]].map(([id,lbl]) => (
          <div key={id} onClick={() => setSubTab(id)}
            style={{ padding:"7px 14px", borderRadius:7, fontSize:12.5, fontWeight:600, cursor:"pointer", transition:"all .14s", color:subTab===id?"var(--text)":"var(--text2)", background:subTab===id?"var(--card)":"transparent" }}>
            {lbl}
          </div>
        ))}
      </div>

      {/* ── FILE LIBRARY ── */}
      {subTab === "files" && <>
        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
          {[
            { lbl:"Total Files",    val:files.length,       col:"var(--amber)"  },
            { lbl:"Protected",      val:protectedCount,     col:"var(--green)"  },
            { lbl:"Unprotected",    val:files.length - protectedCount, col:"var(--red)" },
            { lbl:"Total Size",     val:fmtBytes(totalSize), col:"var(--indigo)" },
            { lbl:"Total Plays",    val:files.reduce((n,f)=>n+f.plays,0).toLocaleString(), col:"var(--teal)" },
          ].map(s => (
            <div className="scard" key={s.lbl}>
              <div className="scard-glow" style={{ background:s.col }}/>
              <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{s.lbl}</div>
              <div style={{ fontSize:20, fontWeight:800, color:s.col, fontFamily:"var(--mono)", marginTop:3 }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:7, flex:1 }}>
            <span style={{ padding:"0 11px", color:"var(--text3)" }}><I n="search" s={14}/></span>
            <input style={{ background:"none", border:"none", padding:"8px", color:"var(--text)", fontSize:13, outline:"none", flex:1 }} placeholder="Search by filename or course…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <select className="sel" style={{ width:130, fontSize:12.5 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            {Object.keys(FORMAT_DEFS).map(t => <option key={t} value={t}>{FORMAT_DEFS[t].label}</option>)}
          </select>
          <select className="sel" style={{ width:150, fontSize:12.5 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="protected">Protected</option>
            <option value="unprotected">Unprotected</option>
          </select>
          <button className="btn ba" onClick={() => setSubTab("upload")}><I n="upload" s={14}/>Upload Files</button>
        </div>

        {/* File table */}
        <div className="tbl">
          <table>
            <thead>
              <tr>{["File","Type","Course","Size","Profile","Encryption","Layers","Plays","Status",""].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(file => {
                const isEncrypting = encrypting === file.id;
                const fmtDef = FORMAT_DEFS[file.type];
                return (
                  <tr key={file.id} onClick={() => setSelFile(selFile?.id === file.id ? null : file)} style={{ cursor:"pointer" }}>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:TYPE_COLORS[file.type]+"18", border:`1px solid ${TYPE_COLORS[file.type]}28`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>{file.thumb}</div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:13, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.name}</div>
                          {file.keyId && <div style={{ fontFamily:"var(--mono)", fontSize:10.5, color:"var(--text3)", marginTop:1 }}>{file.keyId}</div>}
                        </div>
                      </div>
                    </td>
                    <td><span className="badge" style={{ background:TYPE_COLORS[file.type]+"15", color:TYPE_COLORS[file.type], border:`1px solid ${TYPE_COLORS[file.type]}30`, fontSize:10.5 }}>{fmtDef?.label}</span></td>
                    <td style={{ fontSize:12.5, color:"var(--text2)" }}>{file.course}</td>
                    <td style={{ fontFamily:"var(--mono)", fontSize:12.5, color:"var(--text3)" }}>{fmtBytes(file.size)}</td>
                    <td>{file.profile ? <span className="badge BA" style={{ fontSize:10.5 }}>{file.profile}</span> : <span className="badge BX" style={{ fontSize:10.5 }}>None</span>}</td>
                    <td><span style={{ fontFamily:"var(--mono)", fontSize:12, color: file.algo === "None" ? "var(--text3)" : "var(--green)", fontWeight:700 }}>{file.algo}</span></td>
                    <td>
                      <div style={{ display:"flex", gap:4 }}>
                        {file.watermark    && <span title="Watermark" style={{ fontSize:14 }}>💧</span>}
                        {file.screenBlock  && <span title="Screen Block" style={{ fontSize:14 }}>🖥️</span>}
                        {file.geoLock      && <span title="Geo Lock" style={{ fontSize:14 }}>🌍</span>}
                        {file.tokenTTL     && <span title="Token Auth" style={{ fontSize:14 }}>🔑</span>}
                      </div>
                    </td>
                    <td style={{ fontFamily:"var(--mono)", fontSize:12.5, color:"var(--text2)" }}>{file.plays.toLocaleString()}</td>
                    <td>
                      {isEncrypting
                        ? <span className="badge BA" style={{ fontSize:10.5, gap:5 }}><span className="spin" style={{ display:"inline-block" }}>↻</span> Encrypting…</span>
                        : file.status === "protected"
                          ? <span className="badge BG" style={{ fontSize:10.5 }}><Dot c="var(--green)" sz={5}/>Protected</span>
                          : <span className="badge BR" style={{ fontSize:10.5 }}><Dot c="var(--red)" sz={5}/>Unprotected</span>
                      }
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display:"flex", gap:5 }}>
                        {file.status === "unprotected"
                          ? <button className="btn ba bxs" disabled={isEncrypting} onClick={() => protectFile(file)}><I n="lock" s={12}/>Protect</button>
                          : <button className="btn bg bxs" onClick={() => setConfigModal(file)}><I n="edit" s={12}/></button>
                        }
                        {file.status === "protected" && <button className="btn bd bxs" onClick={() => revokeProtection(file.id)}><I n="unlock" s={12}/></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Encryption progress panel */}
        {encrypting && (
          <div className="card" style={{ borderColor:"rgba(245,158,11,.3)", animation:"encryptFlash 1.2s ease infinite" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
              <div style={{ color:"var(--amber)", animation:"shield 1s ease infinite" }}><I n="shield" s={22}/></div>
              <div>
                <div style={{ fontWeight:700, fontSize:14 }}>Encrypting {files.find(f=>f.id===encrypting)?.name}</div>
                <div style={{ fontSize:12, color:"var(--text3)", marginTop:1 }}>AES-256-GCM · Platform master key wrapping</div>
              </div>
              <div style={{ marginLeft:"auto", fontFamily:"var(--mono)", fontWeight:800, fontSize:18, color:"var(--amber)" }}>{encProgress}%</div>
            </div>
            <div className="prog" style={{ height:8, marginBottom:12 }}>
              <div className="pb" style={{ width:`${encProgress}%`, background:"linear-gradient(to right, var(--amber), var(--teal))" }}/>
            </div>
            <div style={{ background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)", padding:"10px 12px", maxHeight:120, overflowY:"auto" }}>
              {encLog.map((line, i) => (
                <div key={i} style={{ fontFamily:"var(--mono)", fontSize:11.5, lineHeight:1.7, color: line.includes("[done]") ? "var(--green)" : line.includes("[error]") ? "var(--red)" : "var(--text2)" }}>{line}</div>
              ))}
            </div>
          </div>
        )}

        {/* Expanded file detail */}
        {selFile && !encrypting && (
          <div className="card" style={{ borderColor:"var(--border2)", animation:"fadeUp .2s ease" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
              <div style={{ fontSize:28 }}>{selFile.thumb}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:15 }}>{selFile.name}</div>
                <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>{selFile.course} · {fmtBytes(selFile.size)} · uploaded {selFile.uploadedAt}</div>
              </div>
              <button className="btn bg bico" onClick={() => setSelFile(null)}><I n="x" s={14}/></button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:14 }}>
              {[
                ["Encryption",  selFile.algo || "None",                 selFile.algo !== "None" ? "var(--green)" : "var(--text3)" ],
                ["Key ID",      selFile.keyId || "—",                   "var(--amber)"  ],
                ["Token TTL",   selFile.tokenTTL ? selFile.tokenTTL+"s" : "—", "var(--indigo)" ],
                ["Total Plays", selFile.plays.toLocaleString(),         "var(--teal)"   ],
              ].map(([k,v,c]) => (
                <div key={k} className="card2">
                  <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>{k}</div>
                  <div style={{ fontSize:13.5, fontWeight:700, color:c, fontFamily:["Key ID","Token TTL"].includes(k)?"var(--mono)":"var(--font)", marginTop:3 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>Active Protection Layers</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {FORMAT_DEFS[selFile.type]?.layers.map(layer => {
                const isOn = selFile[layer.key] === true || (layer.key === "encryption" && selFile.algo !== "None") || (layer.key === "tokenAuth" && selFile.tokenTTL);
                return (
                  <span key={layer.key} className={`layer ${isOn ? "layer-on" : "layer-off"}`}>
                    <I n={isOn ? "check" : "x"} s={10}/>{layer.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </>}

      {/* ── FORMAT POLICIES ── */}
      {subTab === "formats" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:14 }}>
          {Object.entries(FORMAT_DEFS).map(([type, def]) => (
            <FormatCard key={type} type={type} def={def}
              count={files.filter(f => f.type === type && f.status === "protected").length}
              total={files.filter(f => f.type === type).length}
            />
          ))}
        </div>
      )}

      {/* ── ENCRYPTION PIPELINE ── */}
      {subTab === "pipeline" && (
        <div style={{ maxWidth:700, display:"flex", flexDirection:"column", gap:16 }}>
          <div className="card" style={{ background:"linear-gradient(135deg,rgba(99,102,241,.06),rgba(245,158,11,.04))", borderColor:"rgba(99,102,241,.18)" }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>How File Protection Works</div>
            <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6 }}>Every uploaded file passes through a 7-stage pipeline before it's accessible to users. Keys never leave the key server — only encrypted content reaches cloud storage.</div>
          </div>

          {[
            { step:1, icon:"upload",  color:"var(--blue)",   title:"File Ingestion & Validation",      desc:"SHA-256 integrity check · MIME type validation · virus scan · metadata extraction", detail:"Uploaded file is written to a temporary encrypted staging bucket. Malware signature scan runs before any further processing.", done:true },
            { step:2, icon:"key",     color:"var(--amber)",  title:"Key Generation (CEK + KEK)",        desc:"Content Encryption Key (CEK) generated via CSPRNG · Wrapped with platform Key Encryption Key (RSA-OAEP-4096)", detail:"CEK is a 256-bit random key unique to this file. The wrapped (encrypted) CEK is stored — the raw CEK exists only in memory during encryption.", done:true },
            { step:3, icon:"lock",    color:"var(--indigo)", title:"Format-Specific Encryption",        desc:"Video → AES-256-GCM HLS segments · PDF → AES-256 owner encrypt · HTML → obfuscation + CSP · Image → AES-GCM + steg", detail:"Each file type uses its optimal encryption strategy. Video is segmented for adaptive streaming. PDFs get permission flags preventing print/copy.", done:true },
            { step:4, icon:"water",   color:"var(--teal)",   title:"Watermark Template Injection",      desc:"Dynamic watermark slots embedded — user email, IP, timestamp injected at delivery time, not at rest", detail:"Watermarks are NOT burned in at upload. A template with placeholder {{USER_EMAIL}}, {{IP}}, {{TS}} is created. Values are injected server-side on each delivery request.", done:true },
            { step:5, icon:"layers",  color:"var(--violet)", title:"DRM Policy Registration",           desc:"License policy written to DRM DB · Key ID registered · Profile rules linked · Geo/device limits attached", detail:"The file's keyId, license profile, allowed countries, device limits, and token TTL are stored in the DRM policy database, indexed by content ID.", done:true },
            { step:6, icon:"cloud",   color:"var(--sky)",    title:"Encrypted Upload to Cloud Storage", desc:"Encrypted content written to Cloudflare R2 (primary) · SHA-256 checksum verified post-upload · CDN edge propagation", detail:"The unencrypted original is deleted from staging. Only the AES-encrypted content reaches R2. CDN cache is primed for edge delivery.", done:true },
            { step:7, icon:"sparkle", color:"var(--green)",  title:"Protected — Ready for Delivery",    desc:"File status set to 'protected' · Signed URL delivery enabled · Token auth active · Access logging started", detail:"File is now ready. All subsequent access requires a valid signed token. Every delivery is logged with user, IP, device, and timestamp.", done:true },
          ].map((s, i, arr) => (
            <div className="pipe-step" key={s.step}>
              <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center" }}>
                <div className="pipe-dot" style={{ borderColor:s.color, background:s.color+"18" }}>
                  <span style={{ color:s.color }}><I n={s.icon} s={15}/></span>
                </div>
                {i < arr.length-1 && <div className="pipe-line" style={{ background:`linear-gradient(to bottom, ${s.color}44, ${arr[i+1].color}44)`, height:40, position:"relative", width:2, marginTop:4 }}/>}
              </div>
              <div style={{ flex:1, paddingBottom:i < arr.length-1 ? 24 : 0, paddingTop:4 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--text3)" }}>Step {s.step}</span>
                  <span style={{ fontWeight:700, fontSize:14 }}>{s.title}</span>
                  {s.done && <span className="badge BG" style={{ fontSize:10 }}>Active</span>}
                </div>
                <div style={{ fontSize:13, color:"var(--text2)", marginBottom:6 }}>{s.desc}</div>
                <div style={{ fontSize:12, color:"var(--text3)", background:"var(--bg2)", padding:"8px 12px", borderRadius:7, border:"1px solid var(--border)", lineHeight:1.6 }}>{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── KEY MANAGEMENT ── */}
      {subTab === "keys" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14, maxWidth:800 }}>
          {/* Master key status */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {[
              { title:"Platform Master Key",   val:"RSA-OAEP-4096",       status:"Active",   age:"Rotated 14d ago",  col:"var(--green)" },
              { title:"Key Encryption Key",     val:"AES-256-GCM",         status:"Active",   age:"Rotated 14d ago",  col:"var(--green)" },
              { title:"Token Signing Secret",   val:"HS256-JWT",           status:"Active",   age:"Rotated 7d ago",   col:"var(--teal)"  },
            ].map(k => (
              <div className="card" key={k.title} style={{ borderColor:k.col+"33" }}>
                <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>{k.title}</div>
                <div style={{ fontFamily:"var(--mono)", fontWeight:800, fontSize:15, color:k.col, marginTop:6 }}>{k.val}</div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:8 }}>
                  <Dot c={k.col} sz={6}/><span style={{ fontSize:12, color:k.col, fontWeight:700 }}>{k.status}</span>
                  <span style={{ fontSize:11, color:"var(--text3)", marginLeft:"auto" }}>{k.age}</span>
                </div>
                <button className="btn bg bsm" style={{ marginTop:10, width:"100%", justifyContent:"center" }}><I n="refresh" s={12}/>Rotate Key</button>
              </div>
            ))}
          </div>

          {/* Content key table */}
          <div style={{ fontWeight:700, fontSize:14 }}>Content Encryption Keys</div>
          <div className="tbl">
            <table>
              <thead><tr>{["Key ID","File","Algorithm","Issued","Status",""].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {files.filter(f => f.keyId).map(f => (
                  <tr key={f.id}>
                    <td><code style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--amber)" }}>{f.keyId}</code></td>
                    <td style={{ fontSize:13, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</td>
                    <td><code style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--green)" }}>{f.algo}</code></td>
                    <td style={{ fontFamily:"var(--mono)", fontSize:11.5, color:"var(--text3)" }}>{f.uploadedAt}</td>
                    <td><span className="badge BG" style={{ fontSize:10.5 }}>Active</span></td>
                    <td>
                      <div style={{ display:"flex", gap:5 }}>
                        <button className="btn bg bxs"><I n="refresh" s={12}/>Re-key</button>
                        <button className="btn bd bxs"><I n="ban" s={12}/>Revoke</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key server config */}
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Key Server Configuration</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                ["KMS Provider","Cloudflare KMS (internal)"],
                ["Key Derivation","HKDF-SHA256"],
                ["Key Rotation Schedule","Every 90 days"],
                ["HSM Backed","Yes — FIPS 140-2 Level 2"],
                ["Key Escrow","Disabled"],
                ["Audit Logging","All key access logged"],
              ].map(([k,v]) => (
                <div key={k} className="card2">
                  <div style={{ fontSize:10.5, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>{k}</div>
                  <div style={{ fontSize:13, fontWeight:600, marginTop:4 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Config modal */}
      {configModal && (
        <div className="ov" onClick={e => e.target === e.currentTarget && setConfigModal(null)}>
          <div className="modal" style={{ maxWidth:540 }}>
            <div className="mhd">
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>Edit DRM Config — {configModal.name}</div>
                <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>{FORMAT_DEFS[configModal.type]?.label} · {configModal.algo}</div>
              </div>
              <button className="btn bg bico" onClick={() => setConfigModal(null)}><I n="x" s={15}/></button>
            </div>
            <div className="mbd">
              {FORMAT_DEFS[configModal.type]?.layers.map(layer => (
                <div key={layer.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 13px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:13.5 }}>{layer.label}</div>
                    <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>{layer.desc}</div>
                  </div>
                  <Toggle on={!!configModal[layer.key] || layer.default} onChange={() => {}} cls="grn"/>
                </div>
              ))}
              <div className="fl">
                <label className="lbl">Token TTL (seconds)</label>
                <input className="inp" defaultValue={configModal.tokenTTL || 3600} style={{ fontFamily:"var(--mono)" }}/>
              </div>
              <div className="fl">
                <label className="lbl">Encryption Algorithm</label>
                <select className="sel" defaultValue={configModal.algo}>
                  {FORMAT_DEFS[configModal.type]?.algos.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <div className="mft">
              <button className="btn bg" onClick={() => setConfigModal(null)}>Cancel</button>
              <button className="btn ba" onClick={() => setConfigModal(null)}><I n="check" s={13}/>Save & Re-encrypt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TOKEN DELIVERY ENGINE
// ══════════════════════════════════════════════════════════════════════════════
const TokenDeliveryView = () => {
  const [tokens, setTokens]     = useState(INIT_TOKENS);
  const [subTab, setSubTab]     = useState("active");
  const [search, setSearch]     = useState("");
  const [showSecret, setShowSecret] = useState({});
  const [genModal, setGenModal] = useState(false);
  const [genForm, setGenForm]   = useState({ fileId:"", userId:"", profile:"Enterprise", ttl:3600, maxUses:"", ip:"", bindDevice:false });
  const [generated, setGenerated] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [testToken, setTestToken] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [deliveryConfig, setDeliveryConfig] = useState({
    autoIssue:      true,
    ipBind:         false,
    deviceBind:     true,
    uaMatch:        false,
    revokeOnCancel: true,
    slidingTTL:     true,
  });
  const toggleDC = (key) => setDeliveryConfig(c => ({...c, [key]: !c[key]}));

  const filteredTokens = tokens.filter(t => {
    const q = search.toLowerCase();
    const matchSub = subTab === "active" ? t.status === "valid" : subTab === "expired" ? t.status === "expired" : subTab === "revoked" ? t.status === "revoked" : true;
    return matchSub && (t.user.toLowerCase().includes(q) || t.fileName.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
  });

  const revokeToken = (id) => setTokens(ts => ts.map(t => t.id === id ? {...t, status:"revoked"} : t));

  const issueToken = () => {
    const newTok = {
      id: "TK" + String(tokens.length + 1).padStart(3,"0"),
      token: genToken("drm"),
      fileId: Number(genForm.fileId) || 1,
      fileName: INIT_FILES.find(f=>f.id === Number(genForm.fileId))?.name || "unknown.mp4",
      user: genForm.userId || "manual@issue.com",
      av: (genForm.userId||"MN").slice(0,2).toUpperCase(),
      col: "#6366F1",
      profile: genForm.profile,
      issued: new Date().toISOString().slice(0,16).replace("T"," "),
      expires: new Date(Date.now() + genForm.ttl * 1000).toISOString().slice(0,16).replace("T"," "),
      ttl: Number(genForm.ttl),
      status: "valid",
      ip: genForm.ip || "0.0.0.0/0",
      ua: "Manually issued",
      uses: 0,
      maxUses: genForm.maxUses ? Number(genForm.maxUses) : null,
    };
    setTokens(ts => [newTok, ...ts]);
    setGenerated(newTok);
    setGenModal(false);
  };

  const copyText = (text, key) => {
    navigator.clipboard?.writeText(text).catch(()=>{});
    setCopyFeedback(key);
    setTimeout(() => setCopyFeedback(null), 1500);
  };

  const verifyToken = () => {
    const match = tokens.find(t => t.token === testToken.trim());
    if (!match) { setTestResult({ ok:false, reason:"Token not found in registry" }); return; }
    if (match.status === "revoked") { setTestResult({ ok:false, reason:"Token has been manually revoked" }); return; }
    if (match.status === "expired") { setTestResult({ ok:false, reason:"Token has expired (TTL exceeded)" }); return; }
    setTestResult({ ok:true, token:match });
  };

  const STATUS_COUNTS = {
    active:  tokens.filter(t=>t.status==="valid").length,
    expired: tokens.filter(t=>t.status==="expired").length,
    revoked: tokens.filter(t=>t.status==="revoked").length,
  };

  return (
    <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>

      {/* Sub-tabs */}
      <div style={{ display:"flex", gap:2, background:"var(--bg2)", padding:3, borderRadius:8, width:"fit-content" }}>
        {[
          ["active",  `Active (${STATUS_COUNTS.active})`],
          ["expired", `Expired (${STATUS_COUNTS.expired})`],
          ["revoked", `Revoked (${STATUS_COUNTS.revoked})`],
          ["verify",  "Verify Token"],
          ["config",  "Delivery Config"],
        ].map(([id,lbl]) => (
          <div key={id} onClick={() => setSubTab(id)}
            style={{ padding:"7px 14px", borderRadius:7, fontSize:12.5, fontWeight:600, cursor:"pointer", transition:"all .14s", color:subTab===id?"var(--text)":"var(--text2)", background:subTab===id?"var(--card)":"transparent" }}>
            {lbl}
          </div>
        ))}
      </div>

      {/* ── ACTIVE / EXPIRED / REVOKED ── */}
      {["active","expired","revoked"].includes(subTab) && <>
        {/* Toolbar */}
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:7, flex:1 }}>
            <span style={{ padding:"0 11px", color:"var(--text3)" }}><I n="search" s={14}/></span>
            <input style={{ background:"none", border:"none", padding:"8px", color:"var(--text)", fontSize:13, outline:"none", flex:1 }} placeholder="Search by user, file, token ID…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <button className="btn ba" onClick={() => setGenModal(true)}><I n="plus" s={14}/>Issue Token</button>
          <button className="btn bg bsm"><I n="dl" s={13}/>Export</button>
        </div>

        {/* Token cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filteredTokens.map(tok => {
            const visible = showSecret[tok.id];
            const statusColor = tok.status === "valid" ? "var(--green)" : tok.status === "expired" ? "var(--amber)" : "var(--red)";
            return (
              <div key={tok.id} className={`token-card ${tok.status}`}>
                <div style={{ padding:"13px 16px" }}>
                  {/* Top row */}
                  <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                    <Av i={tok.av} c={tok.col} sz={36}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                        <span style={{ fontWeight:700, fontSize:13.5 }}>{tok.user}</span>
                        <span className="badge BX" style={{ fontSize:10.5 }}>{tok.id}</span>
                        <span className="badge BV" style={{ fontSize:10.5 }}>{tok.profile}</span>
                        <span className={`badge ${tok.status==="valid"?"BG":tok.status==="expired"?"BA":"BR"}`} style={{ fontSize:10.5 }}>{tok.status}</span>
                      </div>
                      <div style={{ fontSize:12.5, color:"var(--text2)", marginTop:3, display:"flex", alignItems:"center", gap:6 }}>
                        <I n="file" s={12}/>{tok.fileName}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                      {tok.status === "valid" && <button className="btn bd bxs" onClick={() => revokeToken(tok.id)}><I n="ban" s={12}/>Revoke</button>}
                      <button className="btn bg bxs" onClick={() => setShowSecret(s => ({...s,[tok.id]:!s[tok.id]}))}><I n={visible?"eyeoff":"eye"} s={12}/></button>
                    </div>
                  </div>

                  {/* Token string */}
                  <div style={{ margin:"10px 0", display:"flex", gap:7, alignItems:"center" }}>
                    <div style={{ flex:1, background:"var(--bg2)", border:`1px solid ${statusColor}28`, borderRadius:7, padding:"7px 12px", fontFamily:"var(--mono)", fontSize:11.5, color:statusColor, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", filter:visible?"none":"blur(4px)", transition:"filter .2s" }}>
                      {tok.token}
                    </div>
                    <button className="btn bg bico" onClick={() => copyText(tok.token, tok.id)} title="Copy token">
                      {copyFeedback === tok.id ? <I n="check" s={13}/> : <I n="copy" s={13}/>}
                    </button>
                  </div>

                  {/* Metadata grid */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
                    {[
                      ["Issued",  tok.issued.split(" ")[1]],
                      ["Expires", tok.expires.split(" ")[1]],
                      ["TTL",     tok.ttl+"s"],
                      ["Uses",    tok.maxUses ? `${tok.uses}/${tok.maxUses}` : tok.uses+"×"],
                      ["IP",      tok.ip],
                    ].map(([k,v]) => (
                      <div key={k} style={{ padding:"6px 8px", background:"var(--bg2)", borderRadius:6, border:"1px solid var(--border)" }}>
                        <div style={{ fontSize:9.5, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>{k}</div>
                        <div style={{ fontFamily:"var(--mono)", fontSize:11.5, color:"var(--text)", fontWeight:600, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* User agent */}
                  <div style={{ marginTop:8, fontSize:11.5, color:"var(--text3)", display:"flex", gap:6 }}>
                    <I n="screen" s={12}/>{tok.ua}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredTokens.length === 0 && (
            <div style={{ padding:"40px", textAlign:"center", color:"var(--text3)", fontSize:13 }}>No tokens in this category</div>
          )}
        </div>
      </>}

      {/* ── TOKEN VERIFIER ── */}
      {subTab === "verify" && (
        <div style={{ maxWidth:660 }}>
          <div className="card" style={{ marginBottom:14 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Token Verification Tool</div>
            <div style={{ fontSize:13, color:"var(--text2)", marginBottom:14, lineHeight:1.6 }}>
              Paste any DRM token to validate its status, expiry, bound file, and user. Use this to debug delivery issues or verify token integrity.
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input className="inp" placeholder="drm_xxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxx" value={testToken} onChange={e => setTestToken(e.target.value)} style={{ fontFamily:"var(--mono)", fontSize:12.5 }}/>
              <button className="btn ba" onClick={verifyToken} disabled={!testToken.trim()}><I n="shield" s={13}/>Verify</button>
            </div>
            {/* Shortcut: click any token to test it */}
            <div style={{ marginTop:10, fontSize:12, color:"var(--text3)" }}>
              Or click a token from the Active tab to auto-fill. Try pasting a token from the list above.
            </div>
          </div>

          {testResult && (
            <div style={{ animation:"fadeUp .2s ease" }}>
              {testResult.ok ? (
                <div>
                  <div style={{ padding:"12px 16px", background:"rgba(16,185,129,.08)", border:"1px solid rgba(16,185,129,.22)", borderRadius:10, display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
                    <I n="check" s={18}/><div><div style={{ fontWeight:700, fontSize:14, color:"var(--green)" }}>Token Valid</div><div style={{ fontSize:12.5, color:"var(--text2)", marginTop:2 }}>Token is active and authorized for access</div></div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                    {[
                      ["User",      testResult.token.user],
                      ["File",      testResult.token.fileName],
                      ["Profile",   testResult.token.profile],
                      ["Issued",    testResult.token.issued],
                      ["Expires",   testResult.token.expires],
                      ["TTL",       testResult.token.ttl+"s"],
                      ["Uses",      String(testResult.token.uses)],
                      ["Max Uses",  testResult.token.maxUses || "Unlimited"],
                      ["Bound IP",  testResult.token.ip],
                    ].map(([k,v]) => (
                      <div key={k} className="card2">
                        <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>{k}</div>
                        <div style={{ fontSize:13, fontWeight:600, marginTop:3 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding:"14px 16px", background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.22)", borderRadius:10, display:"flex", gap:10, alignItems:"center" }}>
                  <I n="alert" s={18}/><div><div style={{ fontWeight:700, fontSize:14, color:"var(--red)" }}>Token Invalid</div><div style={{ fontSize:13, color:"var(--text2)", marginTop:2 }}>{testResult.reason}</div></div>
                </div>
              )}
            </div>
          )}

          {/* JWT anatomy */}
          <div className="card" style={{ marginTop:14 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>Token Structure (JWT)</div>
            <div className="cb">
              <span className="c">{"// DRM Token — 3 parts separated by dots\n"}</span>
              <span className="k">Header  </span><span className="p">{"→ "}</span><span className="s">{`{"alg":"HS256","typ":"JWT","kid":"${genKeyId()}"}`}</span>{"\n"}
              <span className="k">Payload </span><span className="p">{"→ "}</span><span className="n">{`{"sub":"user_id","cid":"content_id","exp":${Math.floor(Date.now()/1000)+3600},"iat":${Math.floor(Date.now()/1000)},"ip":"192.168.1.x","profile":"Enterprise","jti":"${genHex(8)}"}`}</span>{"\n"}
              <span className="k">Sig     </span><span className="p">{"→ "}</span><span className="v">HMACSHA256(base64(header)+"."+base64(payload), SIGNING_SECRET)</span>
            </div>
            <div style={{ marginTop:10, padding:"9px 12px", background:"var(--adim)", border:"1px solid var(--aglow)", borderRadius:8, fontSize:12.5, color:"var(--amber2)", display:"flex", gap:7 }}>
              <I n="info" s={13}/>Signing secret never leaves the token server. Client-side token verification is not supported.
            </div>
          </div>
        </div>
      )}

      {/* ── DELIVERY CONFIG ── */}
      {subTab === "config" && (
        <div style={{ maxWidth:720, display:"flex", flexDirection:"column", gap:14 }}>
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Token Issuance Rules</div>
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {[
                { lbl:"Auto-issue on enrollment",       key:"autoIssue",      sub:"Issue tokens automatically when a student enrolls in a course"   },
                { lbl:"Bind token to IP address",        key:"ipBind",         sub:"Token invalid if request comes from a different IP than issuance" },
                { lbl:"Bind token to device fingerprint",key:"deviceBind",     sub:"Token tied to browser fingerprint — prevents cross-device sharing" },
                { lbl:"Require user-agent match",        key:"uaMatch",        sub:"Token rejected if User-Agent header changes mid-session"          },
                { lbl:"Revoke on subscription cancel",   key:"revokeOnCancel", sub:"Immediately revoke all tokens when subscription lapses"           },
                { lbl:"Allow token refresh (sliding TTL)",key:"slidingTTL",    sub:"Extend TTL by 50% on each valid use (up to 2× original)"          },
              ].map((row, i, arr) => (
                <div key={row.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:i<arr.length-1?"1px solid var(--border)":"none" }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:13.5 }}>{row.lbl}</div>
                    <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>{row.sub}</div>
                  </div>
                  <Toggle on={deliveryConfig[row.key]} onChange={() => toggleDC(row.key)} cls="grn"/>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Default TTL per Profile</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { profile:"Enterprise", ttl:3600,  col:"var(--amber)"  },
                { profile:"Trial",      ttl:900,   col:"var(--teal)"   },
                { profile:"Corporate",  ttl:1800,  col:"var(--indigo)" },
                { profile:"Creator",    ttl:86400, col:"var(--green)"  },
                { profile:"Blocked",    ttl:0,     col:"var(--red)"    },
              ].map(p => (
                <div key={p.profile} style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <span style={{ width:100, fontWeight:700, fontSize:13, color:p.col }}>{p.profile}</span>
                  <input type="range" className="range" min="0" max="86400" step="60" defaultValue={p.ttl} style={{ flex:1 }}/>
                  <span style={{ fontFamily:"var(--mono)", fontWeight:700, fontSize:13, color:p.col, minWidth:80, textAlign:"right" }}>
                    {p.ttl === 0 ? "Blocked" : p.ttl >= 3600 ? (p.ttl/3600).toFixed(1)+"h" : p.ttl+"s"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Delivery API Endpoints</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { method:"POST", path:"/api/v1/drm/token/issue",    desc:"Issue a new DRM token for a user+content pair",    auth:"Admin/Server" },
                { method:"POST", path:"/api/v1/drm/token/verify",   desc:"Verify token validity and return claims",          auth:"Server only" },
                { method:"POST", path:"/api/v1/drm/token/revoke",   desc:"Revoke a token by ID or user+content pair",        auth:"Admin/Server" },
                { method:"GET",  path:"/api/v1/drm/token/refresh",  desc:"Refresh token TTL (sliding window)",               auth:"Authenticated user" },
                { method:"GET",  path:"/api/v1/drm/content/:id",    desc:"Get signed delivery URL for content",              auth:"Valid token required" },
                { method:"GET",  path:"/api/v1/drm/keys/:kid",      desc:"Fetch wrapped content key (key server)",           auth:"Server only" },
              ].map(ep => (
                <div key={ep.path} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"10px 12px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)" }}>
                  <span style={{ fontSize:11, fontWeight:800, padding:"3px 8px", borderRadius:5, background: ep.method==="GET"?"rgba(20,184,166,.12)":"rgba(245,158,11,.1)", color:ep.method==="GET"?"var(--teal)":"var(--amber)", fontFamily:"var(--mono)", flexShrink:0 }}>{ep.method}</span>
                  <code style={{ fontFamily:"var(--mono)", fontSize:12.5, color:"var(--text)", fontWeight:600, flex:1 }}>{ep.path}</code>
                  <span style={{ fontSize:12, color:"var(--text3)", flex:2 }}>{ep.desc}</span>
                  <span className="badge BX" style={{ fontSize:10, flexShrink:0 }}>{ep.auth}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ISSUE TOKEN MODAL ── */}
      {genModal && (
        <div className="ov" onClick={e => e.target === e.currentTarget && setGenModal(false)}>
          <div className="modal" style={{ maxWidth:500 }}>
            <div className="mhd">
              <div><div style={{ fontWeight:700, fontSize:15 }}>Issue DRM Token</div><div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>Manually issue a signed access token for a user and file</div></div>
              <button className="btn bg bico" onClick={() => setGenModal(false)}><I n="x" s={15}/></button>
            </div>
            <div className="mbd">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div className="fl">
                  <label className="lbl">File *</label>
                  <select className="sel" value={genForm.fileId} onChange={e => setGF("fileId", e.target.value)}>
                    <option value="">Select file…</option>
                    {INIT_FILES.filter(f=>f.status==="protected").map(f => <option key={f.id} value={f.id}>{f.name.slice(0,30)}</option>)}
                  </select>
                </div>
                <div className="fl">
                  <label className="lbl">Profile</label>
                  <select className="sel" value={genForm.profile} onChange={e => setGF("profile", e.target.value)}>
                    {["Enterprise","Trial","Corporate","Creator"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="fl"><label className="lbl">User Email / ID *</label><input className="inp" placeholder="user@example.com or user_id" value={genForm.userId} onChange={e => setGF("userId", e.target.value)}/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div className="fl">
                  <label className="lbl">TTL (seconds): <span style={{ color:"var(--amber)" }}>{genForm.ttl}s = {(genForm.ttl/3600).toFixed(1)}h</span></label>
                  <input type="range" className="range" min="60" max="86400" step="60" value={genForm.ttl} onChange={e => setGF("ttl", Number(e.target.value))}/>
                </div>
                <div className="fl"><label className="lbl">Max Uses (blank = unlimited)</label><input className="inp" type="number" placeholder="∞" value={genForm.maxUses} onChange={e => setGF("maxUses", e.target.value)}/></div>
              </div>
              <div className="fl"><label className="lbl">IP Restriction (blank = any)</label><input className="inp" placeholder="e.g. 192.168.1.0/24" value={genForm.ip} onChange={e => setGF("ip", e.target.value)} style={{ fontFamily:"var(--mono)", fontSize:13 }}/></div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 13px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)" }}>
                <div><div style={{ fontWeight:600, fontSize:13.5 }}>Bind to Device Fingerprint</div><div style={{ fontSize:12, color:"var(--text3)" }}>Token rejected if browser fingerprint changes</div></div>
                <Toggle on={genForm.bindDevice} onChange={v => setGF("bindDevice", v)} cls="grn"/>
              </div>
              <div style={{ padding:"10px 13px", background:"var(--adim)", border:"1px solid var(--aglow)", borderRadius:8, fontSize:12.5, color:"var(--amber2)", display:"flex", gap:8 }}>
                <I n="info" s={13}/>Issued tokens are signed with the platform secret. They cannot be forged or modified.
              </div>
            </div>
            <div className="mft">
              <button className="btn bg" onClick={() => setGenModal(false)}>Cancel</button>
              <button className="btn ba" onClick={issueToken} disabled={!genForm.fileId || !genForm.userId}><I n="send" s={13}/>Issue Token</button>
            </div>
          </div>
        </div>
      )}

      {/* Generated token reveal */}
      {generated && (
        <div className="ov" onClick={() => setGenerated(null)}>
          <div className="modal" style={{ maxWidth:520 }}>
            <div className="mhd">
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ color:"var(--green)" }}><I n="check" s={20}/></div>
                <div><div style={{ fontWeight:700, fontSize:15, color:"var(--green)" }}>Token Issued Successfully</div><div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>Copy this token — it won't be shown again</div></div>
              </div>
            </div>
            <div className="mbd">
              <div style={{ background:"var(--bg2)", border:"1px solid rgba(16,185,129,.3)", borderRadius:9, padding:"14px", display:"flex", flexDirection:"column", gap:8 }}>
                <div style={{ fontFamily:"var(--mono)", fontSize:11.5, color:"var(--green)", wordBreak:"break-all", lineHeight:1.8, animation:"tokenReveal .5s ease" }}>{generated.token}</div>
                <button className="btn bg bsm" style={{ alignSelf:"flex-start" }} onClick={() => copyText(generated.token, "gen")}>
                  {copyFeedback === "gen" ? <><I n="check" s={13}/>Copied!</> : <><I n="copy" s={13}/>Copy Token</>}
                </button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                {[["User",generated.user],["Expires",generated.expires],["TTL",generated.ttl+"s"]].map(([k,v]) => (
                  <div key={k} className="card2"><div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, textTransform:"uppercase" }}>{k}</div><div style={{ fontSize:12.5, fontWeight:700, marginTop:3 }}>{v}</div></div>
                ))}
              </div>
              <div style={{ padding:"10px 13px", background:"rgba(239,68,68,.07)", border:"1px solid rgba(239,68,68,.18)", borderRadius:8, fontSize:12.5, color:"var(--red)", display:"flex", gap:7 }}>
                <I n="alert" s={13}/>This token is shown only once. Store it securely — it cannot be retrieved after closing this dialog.
              </div>
            </div>
            <div className="mft"><button className="btn ba" onClick={() => setGenerated(null)}>Done</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Watermark Studio (fully stateful) ────────────────────────────────────────
const WatermarkStudio = () => {
  const [wmText,   setWmText]   = useState("{{USER_EMAIL}} · {{DATE}}");
  const [opacity,  setOpacity]  = useState(15);
  const [angle,    setAngle]    = useState(-25);
  const [repeat,   setRepeat]   = useState(true);
  const [timing,   setTiming]   = useState({ upload:false, delivery:true, clientJs:false });
  const [copied,   setCopied]   = useState(null);

  const POSITIONS = repeat
    ? [[-10,-10],[25,30],[60,70],[90,15],[45,-5],[10,65],[80,45],[-5,50],[55,10],[120,30],[120,80]]
    : [[40,42]];

  const toggleTiming = (key) => setTiming(t => ({ ...t, [key]: !t[key] }));

  const copyVar = (v) => {
    navigator.clipboard?.writeText(v).catch(()=>{});
    setCopied(v);
    setTimeout(() => setCopied(null), 1400);
  };

  return (
    <div style={{ padding:"20px 24px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, maxWidth:900 }}>
      {/* Left — live preview + controls */}
      <div className="card">
        <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Live Preview</div>

        {/* Canvas */}
        <div style={{ position:"relative", width:"100%", height:170, overflow:"hidden", borderRadius:10, background:"linear-gradient(135deg,#0B1020,#131F30)", marginBottom:14, border:"1px solid var(--border)" }}>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text3)", fontSize:13, textAlign:"center", pointerEvents:"none" }}>
            <div><I n="video" s={30}/><div style={{ marginTop:6 }}>Protected content</div></div>
          </div>
          {POSITIONS.map(([x,y], i) => (
            <div key={i} className="wm-text" style={{ left:`${x}%`, top:`${y}%`, transform:`rotate(${angle}deg)`, opacity:opacity/100, fontSize:repeat?11:15 }}>
              {wmText || "watermark text"}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div className="fl">
            <label className="lbl">Watermark Text</label>
            <input className="inp" value={wmText} onChange={e => setWmText(e.target.value)} placeholder="{{USER_EMAIL}} {{DATE}} {{IP}}"/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div className="fl">
              <label className="lbl">Opacity: {opacity}%</label>
              <input type="range" className="range" min="5" max="60" value={opacity} onChange={e => setOpacity(Number(e.target.value))}/>
            </div>
            <div className="fl">
              <label className="lbl">Angle: {angle}°</label>
              <input type="range" className="range" min="-45" max="45" value={angle} onChange={e => setAngle(Number(e.target.value))}/>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 12px", background:"var(--bg2)", borderRadius:7, border:"1px solid var(--border)" }}>
            <span style={{ fontSize:13, fontWeight:600 }}>Repeat tiled pattern</span>
            <Toggle on={repeat} onChange={setRepeat} cls="grn"/>
          </div>
        </div>
      </div>

      {/* Right — timing + variables */}
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div className="card">
          <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Watermark Injection Timing</div>
          {[
            { key:"upload",   lbl:"At Upload (static)",    sub:"Burns watermark permanently. Fast but not personalized." },
            { key:"delivery", lbl:"At Delivery (dynamic)", sub:"Injects user-specific data server-side per request. Recommended." },
            { key:"clientJs", lbl:"Client-side (JS)",      sub:"Injected via JS overlay in browser. Bypassable — not recommended." },
          ].map((row, i, arr) => (
            <div key={row.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 0", borderBottom:i < arr.length-1 ? "1px solid var(--border)" : "none" }}>
              <div>
                <div style={{ fontWeight:600, fontSize:13 }}>{row.lbl}</div>
                <div style={{ fontSize:11.5, color:"var(--text3)", marginTop:2 }}>{row.sub}</div>
              </div>
              <Toggle on={timing[row.key]} onChange={() => toggleTiming(row.key)} cls="grn"/>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Template Variables</div>
          {["{{USER_EMAIL}}","{{USER_ID}}","{{IP_ADDRESS}}","{{DATE}}","{{TIMESTAMP}}","{{COURSE_ID}}","{{SESSION_ID}}","{{DEVICE_FP}}"].map(v => (
            <div key={v} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 10px", marginBottom:5, background:"var(--bg2)", borderRadius:6, border:"1px solid var(--border)" }}>
              <code style={{ fontFamily:"var(--mono)", fontSize:12.5, color:"var(--teal)" }}>{v}</code>
              <button className="btn bg bxs" style={{ fontSize:11 }} onClick={() => copyVar(v)}>
                {copied === v ? <><I n="check" s={11}/>Copied</> : <><I n="copy" s={11}/>Copy</>}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
const SIDENAV = [
  { sec:"Phase 8", items:[
    { id:"protect", icon:"shield", label:"Protect Files"      },
    { id:"tokens",  icon:"key",    label:"Token Delivery"     },
    { id:"wm",      icon:"water",  label:"Watermark Studio"   },
  ]},
  { sec:"DRM Phases 6–7", items:[
    { id:"dashboard",icon:"chart",  label:"Dashboard",    dim:true, phase:"Ph 6" },
    { id:"rights",   icon:"lock",   label:"Rights Rules", dim:true, phase:"Ph 7" },
    { id:"storage",  icon:"layers", label:"Cloud Storage",dim:true, phase:"Ph 7" },
  ]},
  { sec:"Platform", items:[
    { id:"courses",  icon:"book",   label:"Courses",      dim:true, phase:"Ph 2" },
    { id:"grades",   icon:"tag",    label:"Grades",       dim:true, phase:"Ph 3" },
  ]},
];


export { ProtectFilesView, TokenDeliveryView, WatermarkStudio };
