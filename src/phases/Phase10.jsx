import { useState, useEffect, useRef } from 'react';
import { I, Av, Dot, Toggle, Spark, BarChart, Gauge, Donut } from '../shared.jsx';
import { INITIAL_USERS } from './Phase1Auth.jsx';



// ── DATA ────────────────────────────────────────────────────────────────────
export const TENANTS_INIT = [
  { id:"T001", name:"Acme Corp University",  slug:"acme",        plan:"Enterprise", color:"#6366F1", users:1842, courses:94,  storage:"48 GB",  status:"active",    subdomain:"acme.acadlms.dev",        sso:true,  scorm:true,  logo:"🏢", created:"Jan 2024" },
  { id:"T002", name:"TechLearn Institute",   slug:"techlearn",   plan:"Business",   color:"#14B8A6", users:534,  courses:41,  storage:"12 GB",  status:"active",    subdomain:"techlearn.acadlms.dev",    sso:true,  scorm:true,  logo:"💡", created:"Mar 2024" },
  { id:"T003", name:"MedEd Academy",         slug:"meded",       plan:"Enterprise", color:"#10B981", users:2901, courses:187, storage:"112 GB", status:"active",    subdomain:"meded.acadlms.dev",        sso:true,  scorm:true,  logo:"🏥", created:"Nov 2023" },
  { id:"T004", name:"Creative Skills Hub",   slug:"creativehub", plan:"Starter",    color:"#EC4899", users:218,  courses:28,  storage:"6 GB",   status:"active",    subdomain:"creativehub.acadlms.dev",  sso:false, scorm:false, logo:"🎨", created:"May 2024" },
  { id:"T005", name:"FinServ Training Co",   slug:"finserv",     plan:"Business",   color:"#F97316", users:720,  courses:56,  storage:"22 GB",  status:"suspended", subdomain:"finserv.acadlms.dev",      sso:true,  scorm:true,  logo:"💰", created:"Feb 2024" },
  { id:"T006", name:"GovLearn Portal",       slug:"govlearn",    plan:"Enterprise", color:"#F59E0B", users:4120, courses:312, storage:"234 GB", status:"active",    subdomain:"govlearn.acadlms.dev",     sso:true,  scorm:true,  logo:"🏛️", created:"Oct 2023" },
];

const SCORM_PACKAGES = [
  { id:"SC001", title:"Safety Induction 2024",           version:"SCORM 2004 4th Ed", tenant:"Acme Corp University", status:"active", size:"84 MB",  completions:1204, score:87, uploaded:"Jun 8",  modules:12 },
  { id:"SC002", title:"Compliance & Ethics Module",      version:"SCORM 1.2",         tenant:"TechLearn Institute",  status:"active", size:"34 MB",  completions:501,  score:91, uploaded:"Jun 5",  modules:8  },
  { id:"SC003", title:"Leadership Foundations",          version:"SCORM 2004 3rd Ed", tenant:"MedEd Academy",        status:"active", size:"127 MB", completions:2102, score:78, uploaded:"May 30", modules:20 },
  { id:"SC004", title:"Data Privacy & GDPR Training",    version:"SCORM 1.2",         tenant:"FinServ Training Co",  status:"paused", size:"52 MB",  completions:314,  score:94, uploaded:"May 22", modules:6  },
  { id:"SC005", title:"Product Knowledge Base v3",       version:"xAPI (Tin Can)",    tenant:"Acme Corp University", status:"active", size:"218 MB", completions:876,  score:82, uploaded:"May 18", modules:34 },
  { id:"SC006", title:"Clinical Procedures Simulation",  version:"SCORM 2004 4th Ed", tenant:"MedEd Academy",        status:"active", size:"340 MB", completions:1887, score:88, uploaded:"May 10", modules:28 },
];

const H5P_CONTENT = [
  { id:"H001", title:"React Hooks Quiz",               type:"Quiz",                  tenant:"TechLearn Institute",  uses:284,  created:"Jun 9",  status:"active" },
  { id:"H002", title:"Anatomy 3D Explorer",            type:"3D Model Viewer",       tenant:"MedEd Academy",        uses:1420, created:"Jun 7",  status:"active" },
  { id:"H003", title:"Corporate Policy Flashcards",    type:"Flashcards",            tenant:"Acme Corp University", uses:890,  created:"Jun 5",  status:"active" },
  { id:"H004", title:"Safety Procedure Hotspots",      type:"Image Hotspots",        tenant:"GovLearn Portal",      uses:2301, created:"Jun 2",  status:"active" },
  { id:"H005", title:"Compliance Branching Scenario",  type:"Branching Scenario",    tenant:"FinServ Training Co",  uses:188,  created:"May 29", status:"paused" },
  { id:"H006", title:"Sales Pitch Video Challenge",    type:"Interactive Video",     tenant:"Acme Corp University", uses:567,  created:"May 25", status:"active" },
  { id:"H007", title:"Risk Assessment Drag & Drop",    type:"Drag and Drop",         tenant:"FinServ Training Co",  uses:201,  created:"May 20", status:"active" },
  { id:"H008", title:"Vocabulary Memory Game",         type:"Memory Game",           tenant:"Creative Skills Hub",  uses:94,   created:"May 15", status:"active" },
];

const SSO_PROVIDERS_INIT = [
  { id:"sso1", name:"Microsoft Entra ID",  protocol:"SAML 2.0",      tenant:"Acme Corp University",  status:"connected", users:1842, entityId:"https://sts.windows.net/acme-tenant-id/",    lastSync:"2m ago"  },
  { id:"sso2", name:"Okta",               protocol:"SAML 2.0",      tenant:"MedEd Academy",          status:"connected", users:2901, entityId:"https://meded.okta.com/",                    lastSync:"5m ago"  },
  { id:"sso3", name:"Google Workspace",   protocol:"SAML 2.0",      tenant:"TechLearn Institute",    status:"connected", users:534,  entityId:"https://accounts.google.com/",               lastSync:"1h ago"  },
  { id:"sso4", name:"Auth0",              protocol:"OIDC / OAuth2",  tenant:"Creative Skills Hub",    status:"error",     users:0,    entityId:"https://creativehub.auth0.com/",             lastSync:"Failed"  },
  { id:"sso5", name:"Keycloak (on-prem)", protocol:"SAML 2.0",      tenant:"GovLearn Portal",        status:"connected", users:4120, entityId:"https://auth.govlearn.internal/realms/lms",  lastSync:"3m ago"  },
  { id:"sso6", name:"OneLogin",           protocol:"SAML 2.0",      tenant:"FinServ Training Co",    status:"inactive",  users:0,    entityId:"https://finserv.onelogin.com/",              lastSync:"Never"   },
];

const H5P_TYPE_COLOR = {
  "Quiz":"var(--amber)","Interactive Video":"var(--indigo)","Flashcards":"var(--teal)",
  "Branching Scenario":"var(--violet)","3D Model Viewer":"var(--sky)","Image Hotspots":"var(--orange)",
  "Drag and Drop":"var(--green)","Memory Game":"var(--pink)","Course Presentation":"var(--blue)",
};

// ══════════════════════════════════════════════════════════════════════════════
// MULTI-TENANCY VIEW
// ══════════════════════════════════════════════════════════════════════════════
const TenantCard = ({ t, isSelected, onClick }) => {
  const PLAN_COLOR = { Enterprise:"var(--amber)", Business:"var(--indigo)", Starter:"var(--teal)", Custom:"var(--pink)" };
  return (
    <div className={`tenant-card ${isSelected?"active-t":""}`} onClick={onClick}>
      <div style={{ height:4, background:`linear-gradient(to right,${t.color},${t.color}66)` }}/>
      <div style={{ padding:"14px 16px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:t.color+"1A", border:`1.5px solid ${t.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, overflow:"hidden" }}>
              {t.logo && t.logo.startsWith("blob:") ? <img src={t.logo} style={{ width:"100%", height:"100%", objectFit:"contain" }} alt=""/> : t.logo}
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:13.5 }}>{t.name}</div>
              <div style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--text3)", marginTop:1 }}>{t.subdomain}</div>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
            <span className={`badge ${t.status==="active"?"BG":"BR"}`} style={{ fontSize:10.5 }}>{t.status}</span>
            <span style={{ fontSize:11, fontWeight:700, color:PLAN_COLOR[t.plan], padding:"1px 7px", background:PLAN_COLOR[t.plan]+"15", borderRadius:4, border:`1px solid ${PLAN_COLOR[t.plan]}25` }}>{t.plan}</span>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:10 }}>
          {[["Users",t.users.toLocaleString()],["Courses",t.courses],["Storage",t.storage]].map(([k,v]) => (
            <div key={k} className="card2" style={{ padding:"7px 10px" }}>
              <div style={{ fontSize:9.5, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".04em" }}>{k}</div>
              <div style={{ fontFamily:"var(--mono)", fontWeight:800, fontSize:13, color:t.color, marginTop:2 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {t.sso   && <span className="badge BG"  style={{ fontSize:10 }}>SSO</span>}
          {t.scorm && <span className="badge BI"  style={{ fontSize:10 }}>SCORM</span>}
          <span className="badge BX" style={{ fontSize:10 }}>Since {t.created}</span>
          {t.status==="suspended" && <span className="badge BR" style={{ fontSize:10 }}>⚠ Suspended</span>}
        </div>
      </div>
    </div>
  );
};

const MultiTenancyView = () => {
  const [tenants, setTenants]       = useState(() => {
    const saved = localStorage.getItem("acadlms_tenants");
    try { return saved ? JSON.parse(saved) : TENANTS_INIT; } catch(e) { return TENANTS_INIT; }
  });

  useEffect(() => {
    localStorage.setItem("acadlms_tenants", JSON.stringify(tenants));
  }, [tenants]);
  const [selTenant, setSelTenant]   = useState(null);
  const [sub, setSub]               = useState("tenants");
  const [search, setSearch]         = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [wizStep, setWizStep]       = useState(0);
  const [newTenant, setNewTenant]   = useState({ name:"", slug:"", plan:"Starter", color:"#6366F1", logo:"🏢", adminEmail:"", adminName:"", adminPassword:"", customDomain:"", storageProvider:"Amazon S3", storageBucket:"", storageRegion:"us-east-1", storageAccountId:"", storageAccessKey:"", storageSecretKey:"" });
  const [copied, setCopied]         = useState(false);
  const [editModal, setEditModal]   = useState(null);
  const setNT = (k,v) => setNewTenant(t => ({...t,[k]:v}));

  const toggleSuspend = (id) => {
    setTenants(ts => ts.map(t => t.id === id ? { ...t, status: t.status === "active" ? "suspended" : "active" } : t));
    setSelTenant(cur => cur?.id === id ? { ...cur, status: cur.status === "active" ? "suspended" : "active" } : cur);
  };

  const deleteTenant = (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this tenant? This action cannot be undone.")) return;
    
    // Update synchronized users: remove the admin of this tenant
    const savedUsers = localStorage.getItem("acadlms_users");
    if (savedUsers) {
      try {
        let users = JSON.parse(savedUsers);
        users = users.filter(u => !(u.tenant === selTenant.name && u.role === "Admin"));
        localStorage.setItem("acadlms_users", JSON.stringify(users));
      } catch(e) {}
    }

    setTenants(ts => ts.filter(t => t.id !== id));
    setSelTenant(null);
  };

  const saveEdit = () => {
    if (!editModal.name || !editModal.slug) return;
    
    // Update synchronized user record
    const savedUsers = localStorage.getItem("acadlms_users");
    if (savedUsers) {
      try {
        let users = JSON.parse(savedUsers);
        // Find user by old tenant name and "Admin" role, then update
        users = users.map(u => (u.tenant === selTenant.name && u.role === "Admin") ? { ...u, name: editModal.adminName, email: editModal.adminEmail, tenant: editModal.name } : u);
        localStorage.setItem("acadlms_users", JSON.stringify(users));
      } catch(e) {}
    }

    setTenants(ts => ts.map(t => t.id === editModal.id ? { ...t, name: editModal.name, subdomain: `${editModal.slug}.acadlms.dev`, slug: editModal.slug, plan: editModal.plan, adminName: editModal.adminName, adminEmail: editModal.adminEmail, adminPassword: editModal.adminPassword, customDomain: editModal.customDomain, logo: editModal.logo, maxUsers: editModal.maxUsers, maxStorage: editModal.maxStorage } : t));
    setSelTenant({...editModal, subdomain: `${editModal.slug}.acadlms.dev`});
    setEditModal(null);
  };

  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.slug.toLowerCase().includes(search.toLowerCase())
  );

  const WIZARD_STEPS = ["Basic Info", "Plan & Limits", "Storage Config", "Admin Account", "Review"];

  const isStepValid = () => {
    if (wizStep === 0) return newTenant.name && newTenant.slug;
    if (wizStep === 1) return newTenant.plan !== "Custom" || (newTenant.maxUsers && newTenant.maxStorage);
    if (wizStep === 2) return newTenant.storageBucket && newTenant.storageRegion && newTenant.storageAccountId && newTenant.storageAccessKey && newTenant.storageSecretKey;
    if (wizStep === 3) return newTenant.adminName && newTenant.adminEmail && newTenant.adminPassword;
    return true;
  };

  const createTenant = () => {
    if (!newTenant.name || !newTenant.slug) return;
    const tId = "T"+String(Date.now()).slice(-4);
    const tenantData = {
      id: tId, ...newTenant,
      users:0, courses:0, storage:"0 GB", status:"active",
      subdomain:`${newTenant.slug}.acadlms.dev`, sso:false, scorm:false, created:"Jun 2024",
    };
    
    // update tenants state
    setTenants(ts => [...ts, tenantData]);

    // Update users storage so the admin shows up in Users Management
    const savedUsers = localStorage.getItem("acadlms_users");
    let currentUsers = [];
    try {
      currentUsers = savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS; 
    } catch(e) { currentUsers = INITIAL_USERS; }

    const initials = newTenant.adminName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const newUser = {
      id: Date.now(),
      name: newTenant.adminName,
      email: newTenant.adminEmail,
      role: "Admin",
      tenant: newTenant.name,
      status: "active",
      twofa: false,
      lastLogin: "Never",
      joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      avatar: initials || "AD",
      color: "#6366F1"
    };

    localStorage.setItem("acadlms_users", JSON.stringify([...currentUsers, newUser]));

    setCreateModal(false);
    setWizStep(0);
    setNewTenant({ name:"", slug:"", plan:"Starter", color:"#6366F1", logo:"🏢", adminEmail:"", adminName:"", adminPassword:"", customDomain:"", storageProvider:"Amazon S3", storageBucket:"", storageRegion:"us-east-1", storageAccountId:"", storageAccessKey:"", storageSecretKey:"" });
  };

  return (
    <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:14 }}>
      <div className="stab-bar">
        {[["tenants","Tenants"],["isolation","Data Isolation"],["billing","Plans & Billing"]].map(([id,lbl]) => (
          <div key={id} className={`stab ${sub===id?"on":""}`} onClick={() => setSub(id)}>{lbl}</div>
        ))}
      </div>

      {sub === "tenants" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {[
              { lbl:"Total Tenants",  val:tenants.length,                                              col:"var(--amber)"  },
              { lbl:"Active",         val:tenants.filter(t=>t.status==="active").length,               col:"var(--green)"  },
              { lbl:"Total Users",    val:tenants.reduce((n,t)=>n+t.users,0).toLocaleString(),         col:"var(--indigo)" },
              { lbl:"Total Courses",  val:tenants.reduce((n,t)=>n+t.courses,0).toLocaleString(),       col:"var(--teal)"   },
            ].map(s => (
              <div className="scard" key={s.lbl}>
                <div className="sg" style={{ background:s.col }}/>
                <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{s.lbl}</div>
                <div style={{ fontSize:26, fontWeight:800, color:s.col, fontFamily:"var(--mono)", marginTop:3 }}>{s.val}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:7, flex:1 }}>
              <span style={{ padding:"0 11px", color:"var(--text3)" }}><I n="search" s={14}/></span>
              <input style={{ background:"none", border:"none", padding:"8px", color:"var(--text)", fontSize:13, outline:"none", flex:1 }} placeholder="Search tenants…" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <button className="btn ba" onClick={() => setCreateModal(true)}><I n="plus" s={14}/>New Tenant</button>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:12 }}>
            {filtered.map(t => (
              <TenantCard key={t.id} t={t} isSelected={selTenant?.id===t.id} onClick={() => setSelTenant(selTenant?.id===t.id?null:t)}/>
            ))}
          </div>

          {selTenant && (
            <div className="card" style={{ borderColor:"var(--border2)", animation:"fadeUp .2s ease" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                <div style={{ fontSize:28, width:48, height:48, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:12, overflow:"hidden", background:selTenant.color+"1A" }}>
                  {selTenant.logo && selTenant.logo.startsWith("blob:") ? <img src={selTenant.logo} style={{width:"100%", height:"100%", objectFit:"contain"}} alt=""/> : selTenant.logo}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15 }}>{selTenant.name}</div>
                  <div style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--text3)", marginTop:2 }}>{selTenant.customDomain || selTenant.subdomain}</div>
                </div>
                <div style={{ display:"flex", gap:7 }}>
                  <button className="btn bg bsm" onClick={() => setEditModal({...selTenant})}><I n="settings" s={13}/>Configure</button>
                  {selTenant.status==="active"
                    ? <button className="btn bd bsm" onClick={() => toggleSuspend(selTenant.id)}><I n="alert" s={13}/>Suspend</button>
                    : <button className="btn bt bsm" onClick={() => toggleSuspend(selTenant.id)}><I n="check" s={13}/>Restore</button>}
                  <button className="btn ba bsm" style={{ background:"rgba(239,68,68,.1)", color:"var(--red)", border:"1px solid rgba(239,68,68,.2)" }} onClick={() => deleteTenant(selTenant.id)}><I n="trash" s={13}/>Delete</button>
                  <button className="btn bg bico" onClick={() => setSelTenant(null)}><I n="x" s={14}/></button>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:14 }}>
                {[["Tenant ID",selTenant.id],["Plan",selTenant.plan],["Users",selTenant.users.toLocaleString()],["Courses",selTenant.courses],["Storage",selTenant.storage]].map(([k,v]) => (
                  <div key={k} className="card2">
                    <div style={{ fontSize:9.5, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".04em" }}>{k}</div>
                    <div style={{ fontSize:13.5, fontWeight:700, marginTop:3, fontFamily:"var(--mono)" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center", padding:"10px 13px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)" }}>
                <span style={{ fontSize:11, color:"var(--text2)", fontWeight:600 }}>URL</span>
                <code style={{ fontFamily:"var(--mono)", fontSize:12.5, color:"var(--teal)", flex:1 }}>{selTenant.customDomain || selTenant.subdomain}</code>
                <button className="btn bg bxs" onClick={() => { navigator.clipboard?.writeText(selTenant.customDomain || selTenant.subdomain).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),1400); }}>
                  {copied ? <I n="check" s={12}/> : <I n="copy" s={12}/>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {sub === "isolation" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="card" style={{ background:"linear-gradient(135deg,rgba(99,102,241,.06),rgba(20,184,166,.04))", borderColor:"rgba(99,102,241,.2)" }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>Tenant Isolation Architecture</div>
            <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6 }}>Each tenant runs in a fully isolated context — schema-separated databases with row-level security, dedicated storage buckets with per-tenant encryption keys, and scoped auth tokens that cannot cross tenant boundaries.</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {[
              { icon:"layers",   title:"Database Isolation",  color:"var(--indigo)", desc:"PostgreSQL schema-per-tenant with RLS policies. Cross-tenant queries are structurally impossible.", chips:["Schema-per-tenant","RLS enforced","Zero cross-tenant reads"] },
              { icon:"lock",     title:"Storage Isolation",   color:"var(--teal)",   desc:"Dedicated R2 bucket per tenant with unique AES-256 key. No shared paths. CDN URLs scoped to tenant domain.", chips:["Dedicated R2 bucket","Per-tenant AES key","Scoped CDN URLs"] },
              { icon:"shield",   title:"Auth Isolation",      color:"var(--green)",  desc:"Tenant-scoped JWTs with tenant_id claim. SSO sessions bound to tenant IdP. No cross-tenant admin access.", chips:["Scoped JWTs","IdP-bound sessions","No cross-tenant admin"] },
              { icon:"globe",    title:"Domain Isolation",    color:"var(--amber)",  desc:"Each tenant served from a dedicated subdomain. Custom CNAME support. TLS auto-provisioned per domain.", chips:["Dedicated subdomain","Custom CNAME","Auto-TLS via Let's Encrypt"] },
              { icon:"zap",      title:"Rate Limiting",       color:"var(--orange)", desc:"Per-tenant API rate limits and resource quotas enforced at the infra layer.", chips:["Per-tenant rate limits","Storage quotas","CPU burst limits"] },
              { icon:"key",      title:"Key Management",      color:"var(--violet)", desc:"Separate CEK and KEK per tenant. Key rotation is fully isolated — one tenant's rotation never affects others.", chips:["Per-tenant CEK","Independent key rotation","HSM-backed keys"] },
            ].map(item => (
              <div key={item.title} className="card">
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <div style={{ width:38, height:38, borderRadius:9, background:item.color+"18", border:`1.5px solid ${item.color}28`, display:"flex", alignItems:"center", justifyContent:"center", color:item.color, flexShrink:0 }}><I n={item.icon} s={17}/></div>
                  <div style={{ fontWeight:700, fontSize:13.5 }}>{item.title}</div>
                </div>
                <div style={{ fontSize:12.5, color:"var(--text2)", lineHeight:1.6, marginBottom:10 }}>{item.desc}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {item.chips.map(c => <span key={c} style={{ fontSize:10.5, padding:"2px 8px", borderRadius:4, background:item.color+"12", color:item.color, border:`1px solid ${item.color}25`, fontWeight:600 }}>{c}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sub === "billing" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          {[
            { plan:"Starter",    color:"var(--teal)",   price:"$49/mo",  users:"Up to 250",   storage:"10 GB",     features:["Custom subdomain","Basic SCORM 1.2","Email support","Standard DRM"] },
            { plan:"Business",   color:"var(--indigo)", price:"$199/mo", users:"Up to 2,000", storage:"100 GB",    features:["Custom domain","SCORM 2004 + xAPI","SSO (SAML 2.0)","H5P content","Advanced DRM","Priority support"], popular:true },
            { plan:"Enterprise", color:"var(--amber)",  price:"Custom",  users:"Unlimited",   storage:"Unlimited", features:["White-label","All SCORM/xAPI/H5P","SSO + LDAP + OIDC","Multi-region","99.99% SLA","Dedicated CSM"] },
          ].map(p => (
            <div key={p.plan} className="card" style={{ border:`1px solid ${p.color}28`, position:"relative" }}>
              {p.popular && <div style={{ position:"absolute", top:-10, right:16, background:"var(--indigo)", color:"#fff", fontSize:10, fontWeight:700, padding:"2px 10px", borderRadius:10 }}>POPULAR</div>}
              <div style={{ fontWeight:800, fontSize:17, color:p.color, fontFamily:"var(--display)", marginBottom:4 }}>{p.plan}</div>
              <div style={{ fontSize:24, fontWeight:800, fontFamily:"var(--mono)", marginBottom:12 }}>{p.price}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:14 }}>
                {[["users","Users",p.users],["layers","Storage",p.storage]].map(([icon,k,v]) => (
                  <div key={k} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"var(--text2)" }}>
                    <span style={{ color:p.color }}><I n={icon} s={13}/></span>{k}: <span style={{ fontWeight:700, color:"var(--text)" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12.5 }}>
                    <span style={{ color:"var(--green)" }}><I n="check" s={12}/></span>{f}
                  </div>
                ))}
              </div>
              <div style={{ marginTop:14 }}>
                <span className="badge BX" style={{ fontSize:10 }}>{tenants.filter(t=>t.plan===p.plan).length} tenants</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {createModal && (
        <div className="ov" onClick={e => e.target===e.currentTarget && setCreateModal(false)}>
          <div className="modal" style={{ maxWidth:560 }}>
            <div className="mhd">
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>Create New Tenant</div>
                <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>Step {wizStep+1} of {WIZARD_STEPS.length} — {WIZARD_STEPS[wizStep]}</div>
              </div>
              <button className="btn bg bico" onClick={() => setCreateModal(false)}><I n="x" s={15}/></button>
            </div>
            <div style={{ padding:"14px 22px 0", display:"flex", alignItems:"center", gap:0 }}>
              {WIZARD_STEPS.map((step, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", flex:i<WIZARD_STEPS.length-1?1:"none" }}>
                  <div className="step-dot" style={{ borderColor:i<=wizStep?"var(--amber)":"var(--border2)", background:i<wizStep?"var(--amber)":i===wizStep?"var(--adim)":"var(--card2)", color:i<=wizStep?"var(--amber)":"var(--text3)" }}>
                    {i < wizStep ? <I n="check" s={12}/> : <span style={{ fontSize:11 }}>{i+1}</span>}
                  </div>
                  {i < WIZARD_STEPS.length-1 && <div className="step-line" style={{ background:i<wizStep?"var(--amber)":"var(--border2)" }}/>}
                </div>
              ))}
            </div>
            <div className="mbd">
              {wizStep === 0 && (
                <>
                  <div className="fl"><label className="lbl">Organization Name *</label><input className="inp" placeholder="e.g. Acme Corp University" value={newTenant.name} onChange={e => { setNT("name",e.target.value); setNT("slug",e.target.value.toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"")); }}/></div>
                  <div className="fl"><label className="lbl">URL Slug * <span style={{ color:"var(--teal)", fontWeight:400, textTransform:"none" }}>→ {newTenant.slug||"your-org"}.acadlms.dev</span></label><input className="inp" placeholder="your-org" value={newTenant.slug} onChange={e => setNT("slug",e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))} style={{ fontFamily:"var(--mono)" }}/></div>
                  <div className="fl"><label className="lbl">Custom Domain (Optional)</label><input className="inp" placeholder="e.g. learn.yourorg.com" value={newTenant.customDomain||""} onChange={e => setNT("customDomain",e.target.value)} style={{ fontFamily:"var(--mono)" }}/></div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 80px", gap:12 }}>
                    <div className="fl"><label className="lbl">Brand Color</label><input type="color" className="inp" value={newTenant.color} onChange={e => setNT("color",e.target.value)} style={{ height:42, cursor:"pointer", padding:"4px 8px" }}/></div>
                    <div className="fl"><label className="lbl">Logo (PNG)</label>
                      <label className="inp" style={{display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", padding:"8px", height:42}}>
                        {newTenant.logo && newTenant.logo.startsWith("blob:") ? <img src={newTenant.logo} style={{maxHeight:"100%"}} alt="logo"/> : <span style={{fontSize:20}}>{newTenant.logo}</span>}
                        <input type="file" accept="image/png" style={{display:"none"}} onChange={e => {if(e.target.files[0]) setNT("logo", URL.createObjectURL(e.target.files[0]))}}/>
                      </label>
                    </div>
                  </div>
                </>
              )}
              {wizStep === 1 && (
                <>
                  <div className="fl"><label className="lbl">Plan</label>
                    <select className="sel" value={newTenant.plan} onChange={e => setNT("plan",e.target.value)}>
                      <option value="Starter">Starter — $49/mo</option>
                      <option value="Business">Business — $199/mo</option>
                      <option value="Enterprise">Enterprise — Custom</option>
                      <option value="Custom">Custom — Configure Needs</option>
                    </select>
                  </div>
                  {newTenant.plan === "Custom" && (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                      <div className="fl"><label className="lbl">Max Users</label><input type="number" className="inp" value={newTenant.maxUsers||""} onChange={e=>setNT("maxUsers", e.target.value)} placeholder="e.g. 500"/></div>
                      <div className="fl"><label className="lbl">Max Storage (GB)</label><input type="number" className="inp" value={newTenant.maxStorage||""} onChange={e=>setNT("maxStorage", e.target.value)} placeholder="e.g. 50"/></div>
                    </div>
                  )}
                  <div style={{ padding:"12px 14px", background:"var(--adim)", border:"1px solid var(--aglow)", borderRadius:8, fontSize:13, color:"var(--amber2)", lineHeight:1.6 }}>
                    <I n="info" s={13}/>{" "}
                    {newTenant.plan==="Starter" ? "250 users · 10 GB storage · Basic SCORM 1.2" : newTenant.plan==="Business" ? "2,000 users · 100 GB · SCORM 2004 + xAPI + H5P + SSO" : newTenant.plan==="Enterprise" ? "Unlimited users and storage · All features · 99.99% SLA" : "Custom limits as specified above."}
                  </div>
                </>
              )}
              {wizStep === 2 && (
                <>
                  <div className="fl"><label className="lbl">Provider</label>
                    <select className="sel" value={newTenant.storageProvider} onChange={e => setNT("storageProvider",e.target.value)}>
                      <option value="Amazon S3">Amazon S3</option>
                      <option value="Cloudflare R2">Cloudflare R2</option>
                      <option value="Azure Blob">Azure Blob Storage</option>
                    </select>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div className="fl"><label className="lbl">AccountId / Endpoint *</label><input className="inp" placeholder="e.g. 1a2b3c4d5e" value={newTenant.storageAccountId||""} onChange={e => setNT("storageAccountId",e.target.value)}/></div>
                    <div className="fl"><label className="lbl">Region *</label><input className="inp" placeholder="e.g. us-east-1" value={newTenant.storageRegion} onChange={e => setNT("storageRegion",e.target.value)}/></div>
                  </div>
                  <div className="fl"><label className="lbl">Bucket Name *</label><input className="inp" placeholder="e.g. org-lms-assets" value={newTenant.storageBucket} onChange={e => setNT("storageBucket",e.target.value)}/></div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div className="fl"><label className="lbl">Access Key *</label><input type="password" className="inp" placeholder="Enter Access Key" value={newTenant.storageAccessKey||""} onChange={e => setNT("storageAccessKey",e.target.value)}/></div>
                    <div className="fl"><label className="lbl">Secret Key *</label><input type="password" className="inp" placeholder="Enter Secret Key" value={newTenant.storageSecretKey||""} onChange={e => setNT("storageSecretKey",e.target.value)}/></div>
                  </div>
                  <div style={{ padding:"10px 13px", background:"var(--adim)", border:"1px solid var(--aglow)", borderRadius:8, fontSize:13, color:"var(--amber2)", display:"flex", gap:7, alignItems:"flex-start" }}>
                    <I n="info" s={13}/>Bucket will be securely authenticated & isolated.
                  </div>
                </>
              )}
              {wizStep === 3 && (
                <>
                  <div className="fl"><label className="lbl">Admin Full Name *</label><input className="inp" placeholder="Jane Smith" value={newTenant.adminName} onChange={e => setNT("adminName",e.target.value)}/></div>
                  <div className="fl"><label className="lbl">Admin Email *</label><input className="inp" type="email" placeholder="admin@yourorg.com" value={newTenant.adminEmail} onChange={e => setNT("adminEmail",e.target.value)}/></div>
                  <div className="fl"><label className="lbl">Admin Password *</label><input className="inp" type="password" placeholder="Enter password" value={newTenant.adminPassword||""} onChange={e => setNT("adminPassword",e.target.value)}/></div>
                  <div style={{ padding:"10px 13px", background:"rgba(16,185,129,.07)", border:"1px solid rgba(16,185,129,.2)", borderRadius:8, fontSize:12.5, color:"var(--green)", display:"flex", gap:7, alignItems:"flex-start" }}>
                    <I n="info" s={13}/>An invitation email will be sent with these credentials.
                  </div>
                </>
              )}
              {wizStep === 4 && (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div style={{ fontSize:13, color:"var(--text2)", fontWeight:600 }}>Review before creation:</div>
                  {[["Organization",newTenant.name||"—"],["Subdomain",`${newTenant.slug||"—"}.acadlms.dev`],["Plan",newTenant.plan],["Storage",newTenant.storageBucket||"—"],["Admin",newTenant.adminEmail||"—"]].map(([k,v]) => (
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 12px", background:"var(--bg2)", borderRadius:7, border:"1px solid var(--border)" }}>
                      <span style={{ fontSize:13, color:"var(--text2)", fontWeight:600 }}>{k}</span>
                      <span style={{ fontSize:13, fontWeight:700, fontFamily:"var(--mono)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mft">
              {wizStep > 0 && <button className="btn bg" onClick={() => setWizStep(w=>w-1)}>Back</button>}
              <div style={{ flex:1 }}/>
              <button className="btn bg" onClick={() => setCreateModal(false)}>Cancel</button>
              {wizStep < WIZARD_STEPS.length-1
                ? <button className="btn ba" onClick={() => setWizStep(w=>w+1)} disabled={!isStepValid()}>Next <I n="arrow" s={13}/></button>
                : <button className="btn ba" onClick={createTenant} disabled={!isStepValid()}><I n="check" s={13}/>Create Tenant</button>
              }
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div className="ov" onClick={e => e.target===e.currentTarget && setEditModal(null)}>
          <div className="modal" style={{ maxWidth:500 }}>
            <div className="mhd">
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>Configure Tenant</div>
                <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>Update details for {editModal.name}</div>
              </div>
              <button className="btn bg bico" onClick={() => setEditModal(null)}><I n="x" s={15}/></button>
            </div>
            <div className="mbd">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div className="fl"><label className="lbl">Organization Name</label><input className="inp" value={editModal.name||''} onChange={e => setEditModal({...editModal, name:e.target.value})}/></div>
                <div className="fl"><label className="lbl">URL Slug</label><input className="inp" value={editModal.slug||''} onChange={e => setEditModal({...editModal, slug:e.target.value})} style={{ fontFamily:"var(--mono)" }}/></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 80px", gap:12 }}>
                <div className="fl"><label className="lbl">Custom Domain</label><input className="inp" placeholder="learn.yourorg.com" value={editModal.customDomain||''} onChange={e => setEditModal({...editModal, customDomain:e.target.value})} style={{ fontFamily:"var(--mono)" }}/></div>
                <div className="fl"><label className="lbl">Logo (PNG)</label>
                  <label className="inp" style={{display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", padding:"8px", height:42}}>
                    {editModal.logo && editModal.logo.startsWith("blob:") ? <img src={editModal.logo} style={{maxHeight:"100%"}} alt="logo"/> : <span style={{fontSize:20}}>{editModal.logo}</span>}
                    <input type="file" accept="image/png" style={{display:"none"}} onChange={e => {if(e.target.files[0]) setEditModal({...editModal, logo: URL.createObjectURL(e.target.files[0])})}}/>
                  </label>
                </div>
              </div>
              <div className="fl"><label className="lbl">Plan</label>
                <select className="sel" value={editModal.plan} onChange={e => setEditModal({...editModal, plan:e.target.value})}>
                  <option value="Starter">Starter</option>
                  <option value="Business">Business</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              {editModal.plan === "Custom" && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div className="fl"><label className="lbl">Max Users</label><input type="number" className="inp" value={editModal.maxUsers||""} onChange={e=>setEditModal({...editModal, maxUsers:e.target.value})} placeholder="e.g. 500"/></div>
                  <div className="fl"><label className="lbl">Max Storage (GB)</label><input type="number" className="inp" value={editModal.maxStorage||""} onChange={e=>setEditModal({...editModal, maxStorage:e.target.value})} placeholder="e.g. 50"/></div>
                </div>
              )}
              <div style={{ padding:"12px 0 6px", fontSize:12, fontWeight:700, color:"var(--text3)", textTransform:"uppercase", letterSpacing:".05em", borderBottom:"1px solid var(--border)", marginBottom:8, marginTop:4 }}>Tenant Admin Details</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div className="fl"><label className="lbl">Admin Full Name</label><input className="inp" value={editModal.adminName||''} onChange={e => setEditModal({...editModal, adminName:e.target.value})}/></div>
                <div className="fl"><label className="lbl">Admin Email</label><input className="inp" value={editModal.adminEmail||''} onChange={e => setEditModal({...editModal, adminEmail:e.target.value})}/></div>
              </div>
              <div className="fl"><label className="lbl">Update Password</label><input className="inp" type="password" value={editModal.adminPassword||''} placeholder="Leave blank to keep current password" onChange={e => setEditModal({...editModal, adminPassword:e.target.value})}/></div>
            </div>
            <div className="mft">
              <button className="btn bg" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn ba" onClick={saveEdit}><I n="check" s={13}/>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SCORM / H5P VIEW
// ══════════════════════════════════════════════════════════════════════════════
const UploadOption = ({ label, sub, defaultOn }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 12px", background:"var(--bg2)", borderRadius:7, border:"1px solid var(--border)" }}>
      <div>
        <div style={{ fontWeight:600, fontSize:13 }}>{label}</div>
        <div style={{ fontSize:11.5, color:"var(--text3)", marginTop:1 }}>{sub}</div>
      </div>
      <Toggle on={on} onChange={setOn} cls="grn"/>
    </div>
  );
};

const ScormH5PView = () => {
  const [sub, setSub]           = useState("scorm");
  const [search, setSearch]     = useState("");
  const [drag, setDrag]         = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProg, setUploadProg] = useState(0);
  const [uploadLog, setUploadLog] = useState([]);

  const simulateUpload = () => {
    setUploading(true); setUploadProg(0); setUploadLog([]);
    const steps = [
      { p:8,   msg:"[validate]  Parsing imsmanifest.xml…" },
      { p:18,  msg:"[validate]  SCORM 2004 4th Ed detected ✓" },
      { p:30,  msg:"[extract]   Extracting 47 files…" },
      { p:44,  msg:"[scan]      Malware scan — clean ✓" },
      { p:56,  msg:"[process]   Transcoding embedded media…" },
      { p:68,  msg:"[index]     Building completion tracking index…" },
      { p:78,  msg:"[store]     Uploading to tenant R2 bucket…" },
      { p:88,  msg:"[register]  Registering xAPI LRS endpoints…" },
      { p:95,  msg:"[drm]       Applying DRM protection layer…" },
      { p:100, msg:"[done]      Package published and ready ✓" },
    ];
    let i = 0;
    const t = setInterval(() => {
      if (i >= steps.length) { clearInterval(t); setUploading(false); return; }
      setUploadProg(steps[i].p);
      setUploadLog(l => [...l, steps[i].msg]);
      i++;
    }, 320);
  };

  const filteredScorm = SCORM_PACKAGES.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.tenant.toLowerCase().includes(search.toLowerCase()));
  const filteredH5P   = H5P_CONTENT.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:14 }}>
      <div className="stab-bar">
        {[["scorm","SCORM / xAPI"],["h5p","H5P Content"],["upload","Upload Package"],["lrs","LRS / Tracking"]].map(([id,lbl]) => (
          <div key={id} className={`stab ${sub===id?"on":""}`} onClick={() => setSub(id)}>{lbl}</div>
        ))}
      </div>

      {sub === "scorm" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {[
              { lbl:"Total Packages",  val:SCORM_PACKAGES.length,                                                col:"var(--amber)"  },
              { lbl:"Active",          val:SCORM_PACKAGES.filter(p=>p.status==="active").length,                 col:"var(--green)"  },
              { lbl:"Completions",     val:SCORM_PACKAGES.reduce((n,p)=>n+p.completions,0).toLocaleString(),     col:"var(--indigo)" },
              { lbl:"Avg Score",       val:Math.round(SCORM_PACKAGES.reduce((n,p)=>n+p.score,0)/SCORM_PACKAGES.length)+"%", col:"var(--teal)" },
            ].map(s => (
              <div className="scard" key={s.lbl}>
                <div className="sg" style={{ background:s.col }}/>
                <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{s.lbl}</div>
                <div style={{ fontSize:22, fontWeight:800, color:s.col, fontFamily:"var(--mono)", marginTop:3 }}>{s.val}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:7, flex:1 }}>
              <span style={{ padding:"0 11px", color:"var(--text3)" }}><I n="search" s={14}/></span>
              <input style={{ background:"none", border:"none", padding:"8px", color:"var(--text)", fontSize:13, outline:"none", flex:1 }} placeholder="Search packages or tenants…" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <button className="btn ba" onClick={() => setSub("upload")}><I n="upload" s={14}/>Upload Package</button>
          </div>

          <div className="tbl">
            <table>
              <thead><tr>{["Package","Standard","Tenant","Size","Completions","Avg Score","Status",""].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {filteredScorm.map(pkg => (
                  <tr key={pkg.id}>
                    <td>
                      <div style={{ fontWeight:600, fontSize:13.5 }}>{pkg.title}</div>
                      <div style={{ fontFamily:"var(--mono)", fontSize:10.5, color:"var(--text3)", marginTop:1 }}>{pkg.id} · {pkg.modules} modules · {pkg.uploaded}</div>
                    </td>
                    <td><span style={{ fontSize:10.5, padding:"2px 8px", borderRadius:5, background:"rgba(99,102,241,.15)", color:"var(--indigo)", border:"1px solid rgba(99,102,241,.25)", fontWeight:700 }}>{pkg.version}</span></td>
                    <td style={{ fontSize:12.5, color:"var(--text2)" }}>{pkg.tenant}</td>
                    <td style={{ fontFamily:"var(--mono)", fontSize:12.5, color:"var(--text3)" }}>{pkg.size}</td>
                    <td style={{ fontFamily:"var(--mono)", fontWeight:700, color:"var(--amber)" }}>{pkg.completions.toLocaleString()}</td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontFamily:"var(--mono)", fontWeight:800, fontSize:13, color:pkg.score>=90?"var(--green)":pkg.score>=70?"var(--amber)":"var(--red)", minWidth:32 }}>{pkg.score}%</span>
                        <div style={{ flex:1, minWidth:48 }}><div className="prog"><div className="pb" style={{ width:`${pkg.score}%`, background:pkg.score>=90?"var(--green)":pkg.score>=70?"var(--amber)":"var(--red)" }}/></div></div>
                      </div>
                    </td>
                    <td><span className={`badge ${pkg.status==="active"?"BG":"BA"}`} style={{ fontSize:10.5 }}>{pkg.status}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display:"flex", gap:5 }}>
                        <button className="btn bg bxs"><I n="settings" s={12}/></button>
                        <button className="btn bd bxs"><I n="trash" s={12}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sub === "h5p" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {[
              { lbl:"Content Items", val:H5P_CONTENT.length,                                    col:"var(--violet)" },
              { lbl:"Active",        val:H5P_CONTENT.filter(p=>p.status==="active").length,     col:"var(--green)"  },
              { lbl:"Total Uses",    val:H5P_CONTENT.reduce((n,p)=>n+p.uses,0).toLocaleString(),col:"var(--amber)"  },
              { lbl:"Content Types", val:[...new Set(H5P_CONTENT.map(p=>p.type))].length,       col:"var(--teal)"   },
            ].map(s => (
              <div className="scard" key={s.lbl}>
                <div className="sg" style={{ background:s.col }}/>
                <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{s.lbl}</div>
                <div style={{ fontSize:22, fontWeight:800, color:s.col, fontFamily:"var(--mono)", marginTop:3 }}>{s.val}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {Object.entries(H5P_TYPE_COLOR).map(([type, col]) => {
              const count = H5P_CONTENT.filter(p=>p.type===type).length;
              return (
                <div key={type} className="h5p-chip" style={{ background:col+"14", color:col, borderColor:col+"28" }}>
                  {type}{count>0 && <span style={{ background:col+"25", borderRadius:3, padding:"0 5px", fontSize:10 }}>{count}</span>}
                </div>
              );
            })}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
            {filteredH5P.map(item => {
              const col = H5P_TYPE_COLOR[item.type] || "var(--text2)";
              return (
                <div key={item.id} className="content-card">
                  <div style={{ height:3, background:`linear-gradient(to right,${col},${col}55)` }}/>
                  <div style={{ padding:"13px 15px" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}>
                      <div style={{ fontWeight:700, fontSize:13.5, flex:1, paddingRight:8 }}>{item.title}</div>
                      <span className={`badge ${item.status==="active"?"BG":"BA"}`} style={{ fontSize:10, flexShrink:0 }}>{item.status}</span>
                    </div>
                    <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
                      <span style={{ fontSize:11.5, fontWeight:700, padding:"2px 8px", borderRadius:5, background:col+"14", color:col, border:`1px solid ${col}28` }}>{item.type}</span>
                      <span className="badge BX" style={{ fontSize:10.5 }}>{item.tenant}</span>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ fontSize:12, color:"var(--text3)" }}>{item.created}</div>
                      <div style={{ fontFamily:"var(--mono)", fontWeight:800, fontSize:14, color:col }}>{item.uses.toLocaleString()} uses</div>
                    </div>
                    <div style={{ display:"flex", gap:6, marginTop:10 }}>
                      <button className="btn bg bxs" style={{ flex:1, justifyContent:"center" }}><I n="eye" s={12}/>Preview</button>
                      <button className="btn bg bxs"><I n="edit" s={12}/></button>
                      <button className="btn bd bxs"><I n="trash" s={12}/></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {sub === "upload" && (
        <div style={{ maxWidth:680, display:"flex", flexDirection:"column", gap:14 }}>
          <div className={`dropzone ${drag?"drag":""}`}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); simulateUpload(); }}>
            <div style={{ fontSize:36, marginBottom:12 }}>📦</div>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>Drop SCORM or H5P package here</div>
            <div style={{ fontSize:13, color:"var(--text3)", marginBottom:14 }}>Supports SCORM 1.2, SCORM 2004 (all editions), xAPI (Tin Can), H5P</div>
            <button className="btn ba" onClick={simulateUpload}><I n="upload" s={14}/>Browse File</button>
          </div>

          {uploading && (
            <div className="card" style={{ borderColor:"rgba(245,158,11,.3)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>Processing Package</div>
                <div style={{ fontFamily:"var(--mono)", fontWeight:800, fontSize:16, color:"var(--amber)" }}>{uploadProg}%</div>
              </div>
              <div className="prog" style={{ height:8, marginBottom:12 }}>
                <div className="pb" style={{ width:`${uploadProg}%`, background:"linear-gradient(to right,var(--amber),var(--teal))" }}/>
              </div>
              <div style={{ background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)", padding:"10px 12px", maxHeight:130, overflowY:"auto" }}>
                {uploadLog.map((line, i) => (
                  <div key={i} style={{ fontFamily:"var(--mono)", fontSize:11.5, lineHeight:1.7, color:line.includes("[done]")?"var(--green)":"var(--text2)" }}>{line}</div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Package Configuration</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div className="fl"><label className="lbl">Target Tenant</label>
                  <select className="sel"><option value="">Select tenant…</option>{TENANTS_INIT.map(t=><option key={t.id}>{t.name}</option>)}</select>
                </div>
                <div className="fl"><label className="lbl">Package Type</label>
                  <select className="sel"><option>Auto-detect</option><option>SCORM 1.2</option><option>SCORM 2004 4th Ed</option><option>xAPI (Tin Can)</option><option>H5P</option></select>
                </div>
              </div>
              <div className="fl"><label className="lbl">Display Title (override)</label><input className="inp" placeholder="Leave blank to use package manifest title"/></div>
              <UploadOption label="Apply DRM protection after upload"    sub="Encrypt package with tenant key"       defaultOn={true}/>
              <UploadOption label="Enable completion tracking"           sub="Track via SCORM API / xAPI LRS"        defaultOn={true}/>
              <UploadOption label="Allow offline caching"                sub="Students can cache for offline use"    defaultOn={false}/>
              <UploadOption label="Force re-attempt on fail"             sub="Reset progress if score < pass threshold" defaultOn={false}/>
            </div>
          </div>
        </div>
      )}

      {sub === "lrs" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="card" style={{ background:"linear-gradient(135deg,rgba(99,102,241,.06),rgba(20,184,166,.04))", borderColor:"rgba(99,102,241,.2)" }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>Learning Record Store (LRS)</div>
            <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6 }}>AcadLMS embeds a fully conformant xAPI LRS. All SCORM 1.2, SCORM 2004, and H5P completions emit xAPI statements stored per-tenant and queryable via the xAPI REST API.</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {[
              { lbl:"Statements / day", val:"24,812", col:"var(--amber)"  },
              { lbl:"Total Statements", val:"4.2M",   col:"var(--indigo)" },
              { lbl:"Unique Actors",    val:"10,135", col:"var(--teal)"   },
              { lbl:"LRS Uptime",       val:"99.99%", col:"var(--green)"  },
            ].map(s => (
              <div className="scard" key={s.lbl}>
                <div className="sg" style={{ background:s.col }}/>
                <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{s.lbl}</div>
                <div style={{ fontSize:22, fontWeight:800, color:s.col, fontFamily:"var(--mono)", marginTop:3 }}>{s.val}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Sample xAPI Statement</div>
            <div className="xml-block">
              <span style={{ color:"var(--text3)" }}>{"// Latest statement — 2m ago\n"}</span>
              {"{\n"}
              {"  "}<span style={{ color:"var(--amber)" }}>"id"</span>{": "}<span style={{ color:"var(--green)" }}>"f47ac10b-58cc-4372-a567-0e02b2c3d479"</span>{",\n"}
              {"  "}<span style={{ color:"var(--amber)" }}>"actor"</span>{": {mbox: "}<span style={{ color:"var(--green)" }}>"mailto:elena@acadlms.dev"</span>{"}, \n"}
              {"  "}<span style={{ color:"var(--amber)" }}>"verb"</span>{": {id: "}<span style={{ color:"var(--green)" }}>"http://adlnet.gov/expapi/verbs/completed"</span>{"}, \n"}
              {"  "}<span style={{ color:"var(--amber)" }}>"object"</span>{": {id: "}<span style={{ color:"var(--green)" }}>"https://acme.acadlms.dev/scorm/SC001"</span>{"}, \n"}
              {"  "}<span style={{ color:"var(--amber)" }}>"result"</span>{": {score: {scaled: "}<span style={{ color:"var(--teal)" }}>0.87</span>{"}, completion: "}<span style={{ color:"var(--teal)" }}>true</span>{"}\n"}
              {"}"}
            </div>
          </div>
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>xAPI Endpoints (per tenant)</div>
            {[
              { m:"GET",  path:"/xapi/statements",            desc:"Query statements with actor, verb, activity filters"    },
              { m:"POST", path:"/xapi/statements",            desc:"Submit one or more xAPI statements"                     },
              { m:"GET",  path:"/xapi/statements/:id",        desc:"Retrieve single statement by UUID"                      },
              { m:"GET",  path:"/xapi/activities/state",      desc:"Get learner state for an activity (bookmarks, progress)" },
              { m:"PUT",  path:"/xapi/activities/state",      desc:"Set learner state"                                      },
              { m:"GET",  path:"/xapi/agents/profile",        desc:"Retrieve agent profile document"                        },
            ].map(ep => (
              <div key={ep.path} style={{ display:"flex", gap:12, alignItems:"center", padding:"9px 12px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)", marginBottom:7 }}>
                <span style={{ fontSize:11, fontWeight:800, padding:"3px 8px", borderRadius:5, background:ep.m==="GET"?"rgba(20,184,166,.12)":"rgba(245,158,11,.1)", color:ep.m==="GET"?"var(--teal)":"var(--amber)", fontFamily:"var(--mono)", flexShrink:0 }}>{ep.m}</span>
                <code style={{ fontFamily:"var(--mono)", fontSize:12.5, color:"var(--text)", fontWeight:600, flex:1 }}>{ep.path}</code>
                <span style={{ fontSize:12, color:"var(--text3)", flex:2 }}>{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SSO / SAML VIEW
// ══════════════════════════════════════════════════════════════════════════════
const RoleMappingRow = ({ group, role, defaultOn }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
      <code style={{ fontFamily:"var(--mono)", fontSize:13, color:"var(--teal)", flex:1 }}>{group}</code>
      <div style={{ color:"var(--amber)" }}><I n="arrow" s={14}/></div>
      <span className="badge BI" style={{ flex:1, justifyContent:"flex-start" }}>{role}</span>
      <Toggle on={on} onChange={setOn} cls="grn"/>
    </div>
  );
};

const SSOConfigOption = ({ label, defaultOn }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 12px", background:"var(--bg2)", borderRadius:7, border:"1px solid var(--border)" }}>
      <span style={{ fontSize:13, fontWeight:600 }}>{label}</span>
      <Toggle on={on} onChange={setOn} cls="grn"/>
    </div>
  );
};

const SSOView = () => {
  const [sub, setSub]             = useState("providers");
  const [providers, setProviders] = useState(SSO_PROVIDERS_INIT);
  const [expanded, setExpanded]   = useState(null);
  const [configModal, setConfigModal] = useState(null);
  const [testResult, setTestResult]   = useState({});
  const [testing, setTesting]         = useState(null);
  const [attrMap, setAttrMap]         = useState([
    { saml:"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress", lms:"email"      },
    { saml:"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",    lms:"first_name" },
    { saml:"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",      lms:"last_name"  },
    { saml:"http://schemas.microsoft.com/ws/2008/06/identity/claims/groups",     lms:"role"       },
    { saml:"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/department",   lms:"department" },
  ]);

  const testSSO = (id) => {
    setTesting(id);
    setTimeout(() => {
      const prov = providers.find(p => p.id===id);
      const ok   = prov.status === "connected";
      setTestResult(r => ({ ...r, [id]:{ ok, ms:ok?Math.floor(28+Math.random()*57):null, err:ok?null:"IdP metadata unreachable or certificate mismatch" } }));
      setTesting(null);
    }, 1800);
  };

  const METADATA_XML = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
  entityID="https://acadlms.dev/saml/sp">
  <md:SPSSODescriptor
    AuthnRequestsSigned="true"
    WantAssertionsSigned="true"
    protocolSupportEnumeration=
      "urn:oasis:names:tc:SAML:2.0:protocol">
    <md:AssertionConsumerService
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="https://acadlms.dev/saml/acs"
      index="1"/>
    <md:SingleLogoutService
      Binding=
        "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
      Location="https://acadlms.dev/saml/slo"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;

  return (
    <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:14 }}>
      <div className="stab-bar">
        {[["providers","Identity Providers"],["attributes","Attribute Mapping"],["metadata","SP Metadata"],["oidc","OIDC / OAuth2"]].map(([id,lbl]) => (
          <div key={id} className={`stab ${sub===id?"on":""}`} onClick={() => setSub(id)}>{lbl}</div>
        ))}
      </div>

      {sub === "providers" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {[
              { lbl:"Configured IdPs", val:providers.length,                                      col:"var(--amber)"  },
              { lbl:"Connected",       val:providers.filter(p=>p.status==="connected").length,     col:"var(--green)"  },
              { lbl:"SSO Users",       val:providers.filter(p=>p.status==="connected").reduce((n,p)=>n+p.users,0).toLocaleString(), col:"var(--indigo)" },
              { lbl:"Errors",          val:providers.filter(p=>p.status==="error").length,         col:"var(--red)"    },
            ].map(s => (
              <div className="scard" key={s.lbl}>
                <div className="sg" style={{ background:s.col }}/>
                <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{s.lbl}</div>
                <div style={{ fontSize:22, fontWeight:800, color:s.col, fontFamily:"var(--mono)", marginTop:3 }}>{s.val}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <button className="btn ba"><I n="plus" s={14}/>Add Identity Provider</button>
          </div>

          {providers.map(prov => {
            const STATUS_COL = { connected:"var(--green)", error:"var(--red)", inactive:"var(--text3)" };
            const isExp = expanded === prov.id;
            const res   = testResult[prov.id];
            const logos = { "Microsoft Entra ID":"🔵", "Okta":"🟠", "Google Workspace":"🔴", "Auth0":"⚫", "Keycloak (on-prem)":"🔑", "OneLogin":"🟣" };
            return (
              <div key={prov.id} className={`sso-card ${prov.status==="connected"?"sso-on":""}`}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:"var(--bg2)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                    {logos[prov.name] || "🔐"}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <span style={{ fontWeight:700, fontSize:14 }}>{prov.name}</span>
                      <span className="badge BT" style={{ fontSize:10.5 }}>{prov.protocol}</span>
                      <span className={`badge ${prov.status==="connected"?"BG":prov.status==="error"?"BR":"BX"}`} style={{ fontSize:10.5 }}>
                        <Dot c={STATUS_COL[prov.status]} sz={5}/>{prov.status}
                      </span>
                    </div>
                    <div style={{ fontSize:12, color:"var(--text3)", marginTop:2, display:"flex", gap:10, flexWrap:"wrap" }}>
                      <span>{prov.tenant}</span>
                      {prov.users > 0 && <span style={{ color:"var(--text2)", fontWeight:600 }}>{prov.users.toLocaleString()} users</span>}
                      <span>Sync: {prov.lastSync}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:7, flexShrink:0 }}>
                    <button className={`btn ${testing===prov.id?"ba":"bt"} bsm`} disabled={testing===prov.id} onClick={() => testSSO(prov.id)}>
                      {testing===prov.id ? <><span className="spin" style={{ display:"inline-block" }}>↻</span>Testing…</> : "Test SSO"}
                    </button>
                    <button className="btn bg bsm" onClick={() => setConfigModal(prov)}><I n="settings" s={13}/>Config</button>
                    <button className="btn bg bico" onClick={() => setExpanded(isExp?null:prov.id)}><I n={isExp?"chevD":"chevR"} s={14}/></button>
                  </div>
                </div>

                {res && (
                  <div style={{ marginTop:10, padding:"8px 12px", borderRadius:8, border:`1px solid ${res.ok?"rgba(16,185,129,.25)":"rgba(239,68,68,.22)"}`, background:res.ok?"rgba(16,185,129,.07)":"rgba(239,68,68,.06)", display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:700, color:res.ok?"var(--green)":"var(--red)" }}>
                    <I n={res.ok?"check":"alert"} s={14}/>{res.ok ? `Connection OK — ${res.ms}ms response time` : res.err}
                  </div>
                )}

                {isExp && (
                  <div style={{ marginTop:12, padding:"13px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)", animation:"fadeIn .18s ease" }}>
                    <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>Entity ID / Issuer</div>
                    <code style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--teal)", wordBreak:"break-all", lineHeight:1.7 }}>{prov.entityId}</code>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:12 }}>
                      {[["ACS URL","https://acadlms.dev/saml/acs"],["SLO URL","https://acadlms.dev/saml/slo"],["Audience","https://acadlms.dev/saml/sp"]].map(([k,v]) => (
                        <div key={k} className="card2" style={{ padding:"8px 10px" }}>
                          <div style={{ fontSize:9.5, color:"var(--text3)", fontWeight:700, textTransform:"uppercase" }}>{k}</div>
                          <code style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--sky)", marginTop:3, display:"block", wordBreak:"break-all" }}>{v}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {sub === "attributes" && (
        <div style={{ maxWidth:740, display:"flex", flexDirection:"column", gap:14 }}>
          <div className="card" style={{ background:"linear-gradient(135deg,rgba(99,102,241,.06),rgba(20,184,166,.04))", borderColor:"rgba(99,102,241,.2)" }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>SAML Attribute Mapping</div>
            <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6 }}>Map SAML assertion attributes from your IdP to AcadLMS user fields. Mappings apply to all SSO login events across all configured Identity Providers.</div>
          </div>
          <div className="card">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 24px 1fr", gap:8, marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--text3)", textTransform:"uppercase", letterSpacing:".06em" }}>IdP Attribute (SAML Claim)</div>
              <div/>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--text3)", textTransform:"uppercase", letterSpacing:".06em" }}>LMS Field</div>
            </div>
            {attrMap.map((row, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 24px 1fr", alignItems:"center", gap:8, padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
                <input className="inp" value={row.saml} style={{ fontFamily:"var(--mono)", fontSize:11.5 }} onChange={e => setAttrMap(m => m.map((r,j) => j===i ? {...r,saml:e.target.value} : r))}/>
                <div style={{ display:"flex", justifyContent:"center", color:"var(--amber)" }}><I n="arrow" s={14}/></div>
                <select className="sel" value={row.lms} style={{ fontSize:13 }} onChange={e => setAttrMap(m => m.map((r,j) => j===i ? {...r,lms:e.target.value} : r))}>
                  {["email","first_name","last_name","role","department","employee_id","phone","timezone"].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            ))}
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <button className="btn bg bsm" onClick={() => setAttrMap(m => [...m, { saml:"", lms:"email" }])}><I n="plus" s={13}/>Add Mapping</button>
              <button className="btn ba bsm" style={{ marginLeft:"auto" }}><I n="check" s={13}/>Save Mappings</button>
            </div>
          </div>
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Role Mapping Rules</div>
            <RoleMappingRow group="LMS_Admins"      role="Administrator" defaultOn={true}/>
            <RoleMappingRow group="LMS_Instructors" role="Instructor"    defaultOn={true}/>
            <RoleMappingRow group="LMS_Learners"    role="Student"       defaultOn={true}/>
            <RoleMappingRow group="LMS_Managers"    role="Manager"       defaultOn={false}/>
          </div>
        </div>
      )}

      {sub === "metadata" && (
        <div style={{ maxWidth:740, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {[["Entity ID","https://acadlms.dev/saml/sp"],["ACS URL","https://acadlms.dev/saml/acs"],["SLO URL","https://acadlms.dev/saml/slo"]].map(([k,v]) => (
              <div key={k} className="card2">
                <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em", marginBottom:5 }}>{k}</div>
                <code style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--teal)", wordBreak:"break-all", lineHeight:1.6 }}>{v}</code>
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontWeight:700, fontSize:14 }}>Service Provider Metadata XML</div>
              <div style={{ display:"flex", gap:7 }}>
                <button className="btn bg bsm"><I n="copy" s={13}/>Copy</button>
                <button className="btn ba bsm"><I n="dl" s={13}/>Download</button>
              </div>
            </div>
            <div className="xml-block">{METADATA_XML}</div>
          </div>
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Signing Certificate</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:12 }}>
              {[["Algorithm","RSA-SHA256"],["Key Size","2048-bit"],["Expires","Dec 31, 2025"]].map(([k,v]) => (
                <div key={k} className="card2">
                  <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>{k}</div>
                  <div style={{ fontSize:13, fontWeight:700, marginTop:3 }}>{v}</div>
                </div>
              ))}
            </div>
            <button className="btn bg bsm"><I n="refresh" s={13}/>Rotate Certificate</button>
          </div>
        </div>
      )}

      {sub === "oidc" && (
        <div style={{ maxWidth:740, display:"flex", flexDirection:"column", gap:14 }}>
          <div className="card" style={{ background:"linear-gradient(135deg,rgba(99,102,241,.06),rgba(245,158,11,.04))", borderColor:"rgba(99,102,241,.18)" }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>OpenID Connect / OAuth 2.0</div>
            <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6 }}>In addition to SAML 2.0, AcadLMS supports OIDC for providers that prefer OAuth 2.0 flows. Both Authorization Code (with PKCE) and Implicit flows are supported.</div>
          </div>
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>OIDC Provider Configuration</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div className="fl"><label className="lbl">Client ID</label><input className="inp" defaultValue="acadlms-prod-client" style={{ fontFamily:"var(--mono)", fontSize:13 }}/></div>
                <div className="fl"><label className="lbl">Client Secret</label><input className="inp" type="password" defaultValue="••••••••••••••••••••" style={{ fontFamily:"var(--mono)", fontSize:13 }}/></div>
              </div>
              <div className="fl"><label className="lbl">Discovery URL (/.well-known/openid-configuration)</label><input className="inp" defaultValue="https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration" style={{ fontFamily:"var(--mono)", fontSize:12 }}/></div>
              <div className="fl"><label className="lbl">Redirect URI (read-only)</label><input className="inp" defaultValue="https://acadlms.dev/oidc/callback" readOnly style={{ fontFamily:"var(--mono)", fontSize:12.5, opacity:.7 }}/></div>
              <div className="fl"><label className="lbl">Scopes</label><input className="inp" defaultValue="openid profile email groups" style={{ fontFamily:"var(--mono)", fontSize:13 }}/></div>
            </div>
          </div>
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>AcadLMS OAuth2 Endpoints</div>
            {[
              { m:"GET",  path:"/oauth2/authorize",              desc:"Authorization endpoint — redirect here to begin OAuth flow"   },
              { m:"POST", path:"/oauth2/token",                  desc:"Exchange authorization code for access_token + id_token"     },
              { m:"POST", path:"/oauth2/revoke",                 desc:"Revoke an access or refresh token"                           },
              { m:"GET",  path:"/oauth2/userinfo",               desc:"Returns OIDC claims for the authenticated user"              },
              { m:"GET",  path:"/.well-known/openid-configuration", desc:"OIDC Discovery Document"                                  },
            ].map(ep => (
              <div key={ep.path} style={{ display:"flex", gap:12, alignItems:"center", padding:"9px 12px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)", marginBottom:7 }}>
                <span style={{ fontSize:11, fontWeight:800, padding:"3px 8px", borderRadius:5, background:ep.m==="GET"?"rgba(20,184,166,.12)":"rgba(245,158,11,.1)", color:ep.m==="GET"?"var(--teal)":"var(--amber)", fontFamily:"var(--mono)", flexShrink:0 }}>{ep.m}</span>
                <code style={{ fontFamily:"var(--mono)", fontSize:12.5, color:"var(--text)", fontWeight:600, flex:1 }}>{ep.path}</code>
                <span style={{ fontSize:12, color:"var(--text3)", flex:2 }}>{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {configModal && (
        <div className="ov" onClick={e => e.target===e.currentTarget && setConfigModal(null)}>
          <div className="modal" style={{ maxWidth:520 }}>
            <div className="mhd">
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>Configure — {configModal.name}</div>
                <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>{configModal.protocol} · {configModal.tenant}</div>
              </div>
              <button className="btn bg bico" onClick={() => setConfigModal(null)}><I n="x" s={15}/></button>
            </div>
            <div className="mbd">
              <div className="fl"><label className="lbl">IdP Entity ID / Issuer</label><input className="inp" defaultValue={configModal.entityId} style={{ fontFamily:"var(--mono)", fontSize:12.5 }}/></div>
              <div className="fl"><label className="lbl">IdP SSO URL</label><input className="inp" defaultValue={`${configModal.entityId}saml2/http-post/sso`} style={{ fontFamily:"var(--mono)", fontSize:12.5 }}/></div>
              <div className="fl"><label className="lbl">IdP Metadata XML</label><textarea className="ta" placeholder="Paste IdP metadata XML here, or enter URLs above manually…" style={{ fontFamily:"var(--mono)", fontSize:12, minHeight:100 }}/></div>
              <SSOConfigOption label="Require signed assertions"          defaultOn={true}/>
              <SSOConfigOption label="Require encrypted assertions"       defaultOn={false}/>
              <SSOConfigOption label="Enable Just-in-Time provisioning"   defaultOn={true}/>
              <SSOConfigOption label="Sync group membership on login"     defaultOn={true}/>
            </div>
            <div className="mft">
              <button className="btn bg" onClick={() => setConfigModal(null)}>Cancel</button>
              <button className="btn ba" onClick={() => setConfigModal(null)}><I n="check" s={13}/>Save Configuration</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Sidebar ──────────────────────────────────────────────────────────────────
const SIDENAV = [
  { sec:"Phase 10", items:[
    { id:"tenants", icon:"building", label:"Multi-Tenancy" },
    { id:"scorm",   icon:"layers",   label:"SCORM / H5P"   },
    { id:"sso",     icon:"shield",   label:"SSO / SAML"    },
  ]},
  { sec:"Analytics", items:[
    { id:"p9", icon:"chart",  label:"Reports",         dim:true, tag:"Ph 9" },
    { id:"p8", icon:"lock",   label:"File Protection", dim:true, tag:"Ph 8" },
  ]},
  { sec:"Platform", items:[
    { id:"p4", icon:"zap",    label:"Payments",        dim:true, tag:"Ph 4" },
    { id:"p2", icon:"book",   label:"Courses",         dim:true, tag:"Ph 2" },
  ]},
];


export { MultiTenancyView, ScormH5PView, SSOView };
