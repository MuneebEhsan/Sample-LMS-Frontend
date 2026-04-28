import { useState, useEffect, useRef } from 'react';
import { I, Av, Dot, Toggle, Spark, BarChart, Gauge, Donut } from '../shared.jsx';



// ══════════════════════════════════════════════════════════════════════════════
// SECURITY MODULE
// ══════════════════════════════════════════════════════════════════════════════

const INIT_IPS_ALLOW = ["192.168.1.0/24", "10.0.0.0/8", "172.16.42.15"];
const INIT_IPS_BLOCK = ["45.33.102.55", "103.21.244.0/22", "185.220.101.0/24"];

const SecurityOverview = () => {
  const [passwordPolicy, setPasswordPolicy] = useState({ minLen: 8, uppercase: true, number: true, special: true, expireDays: 90, historyCount: 5, maxAttempts: 5, lockoutMins: 15 });
  const [ipAllow, setIpAllow] = useState(INIT_IPS_ALLOW);
  const [ipBlock, setIpBlock] = useState(INIT_IPS_BLOCK);
  const [newIp, setNewIp] = useState({ allow: "", block: "" });
  const [features, setFeatures] = useState({ twofa_required: false, captcha_login: true, captcha_register: true, https_force: true, cors_enabled: true, rate_limit: true, csrf: true, session_timeout: true, ip_logging: true, geo_block: false });
  const [ssoConfig, setSsoConfig] = useState({ saml_enabled: false, saml_entity: "https://acadlms.dev", saml_acs: "https://acadlms.dev/sso/saml/acs", ldap_enabled: false, ldap_host: "ldap://corp.example.com", ldap_dn: "CN=Users,DC=corp,DC=example,DC=com" });
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("password");

  const setP = (k, v) => setPasswordPolicy(p => ({ ...p, [k]: v }));
  const setF = (k, v) => setFeatures(f => ({ ...f, [k]: v }));
  const setSSO = (k, v) => setSsoConfig(s => ({ ...s, [k]: v }));

  const addIp = (type) => {
    const val = newIp[type].trim();
    if (!val) return;
    if (type === "allow") setIpAllow(a => [...a, val]);
    else setIpBlock(b => [...b, val]);
    setNewIp(n => ({ ...n, [type]: "" }));
  };

  const threatScore = Math.round(
    (features.twofa_required ? 20 : 0) + (features.https_force ? 15 : 0) + (features.captcha_login ? 10 : 0) +
    (features.rate_limit ? 15 : 0) + (features.csrf ? 15 : 0) + (features.ip_logging ? 10 : 0) +
    (passwordPolicy.special ? 8 : 0) + (passwordPolicy.expireDays <= 90 ? 7 : 0)
  );

  const threatColor = threatScore >= 80 ? "var(--green)" : threatScore >= 60 ? "var(--amber)" : "var(--red)";
  const sectionItems = [
    { id: "password", label: "Password Policy" },
    { id: "features", label: "Security Features" },
    { id: "ip", label: "IP Controls" },
    { id: "sso", label: "SSO & LDAP" },
    { id: "gdpr", label: "GDPR & Privacy" },
  ];

  return (
    <div style={{ padding: "20px 24px", display: "flex", gap: 20 }}>
      {/* Sub-nav */}
      <div style={{ width: 180, flexShrink: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        <div className="sec-hdr" style={{ padding: "0 0 6px" }}>Security Settings</div>

        {/* Score widget */}
        <div className="card" style={{ marginBottom: 10, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>Security Score</div>
          <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto" }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" strokeWidth="6" />
              <circle cx="40" cy="40" r="32" fill="none" stroke={threatColor} strokeWidth="6" strokeDasharray={`${threatScore * 2.01} 201`} strokeLinecap="round" transform="rotate(-90 40 40)" style={{ transition: "stroke-dasharray .8s ease" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: threatColor, fontFamily: "var(--mono)" }}>{threatScore}</span>
              <span style={{ fontSize: 9, color: "var(--text3)", letterSpacing: ".05em" }}>/ 100</span>
            </div>
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: threatColor, marginTop: 6 }}>
            {threatScore >= 80 ? "Strong" : threatScore >= 60 ? "Moderate" : "Weak"}
          </div>
        </div>

        {sectionItems.map(s => (
          <div key={s.id} className={`sni ${activeSection === s.id ? "on" : ""}`} onClick={() => setActiveSection(s.id)}>
            {s.label}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
        {saved && <div style={{ padding: "10px 14px", background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)", borderRadius: 8, fontSize: 13, color: "var(--green)", display: "flex", alignItems: "center", gap: 8 }}><I n="check" s={14} />Security settings saved successfully.</div>}

        {/* PASSWORD POLICY */}
        {activeSection === "password" && (
          <div className="card" style={{ maxWidth: 680 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Password Policy</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="fl">
                  <label className="lbl">Minimum Length: <span style={{ color: "var(--amber)" }}>{passwordPolicy.minLen} chars</span></label>
                  <input type="range" className="range" min="6" max="32" value={passwordPolicy.minLen} onChange={e => setP("minLen", Number(e.target.value))} />
                </div>
                <div className="fl">
                  <label className="lbl">History Count (no reuse): <span style={{ color: "var(--amber)" }}>{passwordPolicy.historyCount}</span></label>
                  <input type="range" className="range" min="0" max="24" value={passwordPolicy.historyCount} onChange={e => setP("historyCount", Number(e.target.value))} />
                </div>
                <div className="fl">
                  <label className="lbl">Expiry: <span style={{ color: "var(--amber)" }}>{passwordPolicy.expireDays === 0 ? "Never" : `${passwordPolicy.expireDays} days`}</span></label>
                  <input type="range" className="range" min="0" max="365" step="30" value={passwordPolicy.expireDays} onChange={e => setP("expireDays", Number(e.target.value))} />
                </div>
                <div className="fl">
                  <label className="lbl">Lockout After: <span style={{ color: "var(--amber)" }}>{passwordPolicy.maxAttempts} fails</span></label>
                  <input type="range" className="range" min="3" max="20" value={passwordPolicy.maxAttempts} onChange={e => setP("maxAttempts", Number(e.target.value))} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["uppercase", "Require Uppercase Letter"], ["number", "Require Number"], ["special", "Require Special Character"], ["minLen", "Min Length Enforced"]].map(([k, lbl]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--bg2)", borderRadius: 8, border: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{lbl}</span>
                    <Toggle on={typeof passwordPolicy[k] === "boolean" ? passwordPolicy[k] : true} onChange={v => typeof passwordPolicy[k] === "boolean" && setP(k, v)} />
                  </div>
                ))}
              </div>
              <div style={{ padding: "12px 14px", background: "var(--adim)", border: "1px solid var(--aglow)", borderRadius: 8, fontSize: 12.5, color: "var(--amber2)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                <I n="info" s={14} />
                <span>Lockout duration: <strong>{passwordPolicy.lockoutMins} minutes</strong>. Admins can manually unlock accounts from the Users panel.</span>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY FEATURES */}
        {activeSection === "features" && (
          <div className="card" style={{ maxWidth: 680 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Security Feature Toggles</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { k: "twofa_required",  lbl: "Force 2FA for All Users",     sub: "All users must set up TOTP before accessing the platform", risk: "high"   },
                { k: "captcha_login",   lbl: "CAPTCHA on Login",             sub: "Adds hCaptcha/reCAPTCHA challenge after failed attempts",   risk: "medium" },
                { k: "captcha_register",lbl: "CAPTCHA on Registration",      sub: "Prevents automated bot account creation",                  risk: "medium" },
                { k: "https_force",     lbl: "Force HTTPS",                  sub: "Redirect all HTTP requests to HTTPS, set HSTS header",      risk: "high"   },
                { k: "cors_enabled",    lbl: "CORS Restriction",             sub: "Only allow listed domains in Access-Control-Allow-Origin",  risk: "high"   },
                { k: "rate_limit",      lbl: "API Rate Limiting",            sub: "100 req/min per user, 30 req/min on auth endpoints",        risk: "high"   },
                { k: "csrf",            lbl: "CSRF Protection",              sub: "Double-submit cookie and SameSite token validation",        risk: "high"   },
                { k: "session_timeout", lbl: "Session Timeout (30 min)",     sub: "Auto-logout after inactivity",                             risk: "medium" },
                { k: "ip_logging",      lbl: "IP Address Logging",           sub: "Log login IPs and flag suspicious geographic changes",      risk: "low"    },
                { k: "geo_block",       lbl: "Geographic Blocking",          sub: "Block all logins from non-allowlisted countries",           risk: "low"    },
              ].map((item, i, arr) => (
                <div key={item.k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13.5 }}>{item.lbl}</span>
                      <span className={`badge ${item.risk === "high" ? "BR" : item.risk === "medium" ? "BA" : "BT"}`} style={{ fontSize: 10 }}>{item.risk}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{item.sub}</div>
                  </div>
                  <Toggle on={features[item.k]} onChange={v => setF(item.k, v)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IP CONTROLS */}
        {activeSection === "ip" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 680 }}>
            {[
              { title: "IP Allowlist", sub: "Only these IPs/CIDRs can access the admin panel", list: ipAllow, setList: setIpAllow, key: "allow", col: "var(--green)", tagClass: "BG" },
              { title: "IP Blocklist", sub: "These IPs/CIDRs are permanently banned from all access", list: ipBlock, setList: setIpBlock, key: "block", col: "var(--red)",   tagClass: "BR" },
            ].map(s => (
              <div className="card" key={s.title}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{s.sub}</div>
                  </div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: s.col, fontWeight: 700, background: s.col + "18", border: `1px solid ${s.col}2E`, borderRadius: 6, padding: "3px 10px" }}>{s.list.length} entries</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
                  {s.list.map(ip => (
                    <div key={ip} className={`ip-tag badge ${s.tagClass}`} style={{ fontSize: 12 }}>
                      {ip}
                      <button onClick={() => s.setList(l => l.filter(x => x !== ip))} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", alignItems: "center", opacity: .7, padding: 0, marginLeft: 2 }}><I n="x" s={11} /></button>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="inp" placeholder="e.g. 203.0.113.0/24 or 198.51.100.1" style={{ fontFamily: "var(--mono)", fontSize: 13 }} value={newIp[s.key]} onChange={e => setNewIp(n => ({ ...n, [s.key]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addIp(s.key)} />
                  <button className={`btn ${s.key === "allow" ? "bt" : "bd"}`} onClick={() => addIp(s.key)}><I n="plus" s={14} />Add</button>
                </div>
              </div>
            ))}

            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Rate Limiting Configuration</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[["API (per user)", "100 req/min"], ["Auth endpoints", "30 req/min"], ["Admin panel", "200 req/min"]].map(([k, v]) => (
                  <div key={k} className="card2">
                    <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{k}</div>
                    <input className="inp" defaultValue={v} style={{ marginTop: 8, fontFamily: "var(--mono)", fontWeight: 700, color: "var(--amber)" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SSO & LDAP */}
        {activeSection === "sso" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 680 }}>
            {/* SAML */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: "rgba(99,102,241,.12)", border: "1px solid rgba(99,102,241,.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--indigo)" }}><I n="saml" s={18} /></div>
                  <div><div style={{ fontWeight: 700, fontSize: 14 }}>SAML 2.0 Single Sign-On</div><div style={{ fontSize: 12, color: "var(--text3)", marginTop: 1 }}>Connect to any SAML 2.0 identity provider</div></div>
                </div>
                <Toggle on={ssoConfig.saml_enabled} onChange={v => setSSO("saml_enabled", v)} />
              </div>
              {ssoConfig.saml_enabled && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="fl"><label className="lbl">Entity ID</label><input className="inp" value={ssoConfig.saml_entity} onChange={e => setSSO("saml_entity", e.target.value)} style={{ fontFamily: "var(--mono)", fontSize: 13 }} /></div>
                  <div className="fl"><label className="lbl">ACS URL (Auto-generated)</label><input className="inp" value={ssoConfig.saml_acs} readOnly style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--teal)" }} /></div>
                  <div className="fl"><label className="lbl">IdP Metadata XML</label><textarea className="inp ta" placeholder="Paste your IdP metadata XML here…" /></div>
                  <div className="fl"><label className="lbl">Attribute Mapping — Email Field</label><input className="inp" placeholder="e.g. urn:oid:0.9.2342.19200300.100.1.3" /></div>
                  <button className="btn bg bsm" style={{ alignSelf: "flex-start" }}><I n="check" s={13} />Test SAML Connection</button>
                </div>
              )}
            </div>
            {/* LDAP */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: "rgba(20,184,166,.12)", border: "1px solid rgba(20,184,166,.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal)" }}><I n="users" s={18} /></div>
                  <div><div style={{ fontWeight: 700, fontSize: 14 }}>LDAP / Active Directory</div><div style={{ fontSize: 12, color: "var(--text3)", marginTop: 1 }}>Sync users from your corporate directory</div></div>
                </div>
                <Toggle on={ssoConfig.ldap_enabled} onChange={v => setSSO("ldap_enabled", v)} />
              </div>
              {ssoConfig.ldap_enabled && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="fl"><label className="lbl">LDAP Host</label><input className="inp" value={ssoConfig.ldap_host} onChange={e => setSSO("ldap_host", e.target.value)} style={{ fontFamily: "var(--mono)", fontSize: 13 }} /></div>
                    <div className="fl"><label className="lbl">Port</label><input className="inp" defaultValue="389" style={{ fontFamily: "var(--mono)" }} /></div>
                    <div className="fl"><label className="lbl">Bind DN</label><input className="inp" value={ssoConfig.ldap_dn} onChange={e => setSSO("ldap_dn", e.target.value)} style={{ fontFamily: "var(--mono)", fontSize: 12 }} /></div>
                    <div className="fl"><label className="lbl">Bind Password</label><input className="inp" type="password" placeholder="••••••••" /></div>
                  </div>
                  <div className="fl"><label className="lbl">User Search Base</label><input className="inp" placeholder="CN=Users,DC=corp,DC=example,DC=com" style={{ fontFamily: "var(--mono)", fontSize: 12 }} /></div>
                  <button className="btn bg bsm" style={{ alignSelf: "flex-start" }}><I n="check" s={13} />Test LDAP Connection</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GDPR */}
        {activeSection === "gdpr" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 680 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>GDPR & Privacy Controls</div>
            {[
              { icon: "dl",     col: "var(--teal)",  title: "Data Export Request",    sub: "Generate a full data export for any user account (ZIP with JSON + CSV)",    btn: "Generate Export",  btnCls: "bt" },
              { icon: "trash",  col: "var(--red)",   title: "Right to Erasure",       sub: "Permanently delete all user data. This action is irreversible.",             btn: "Submit Erasure",   btnCls: "bd" },
              { icon: "eraser", col: "var(--orange)",title: "Anonymize User",         sub: "Replace PII with anonymous tokens while retaining grade records.",           btn: "Anonymize",        btnCls: "bg" },
              { icon: "eye",    col: "var(--indigo)", title: "Data Processing Audit",  sub: "View a log of all data access and processing events for a specific user.",   btn: "View Audit Trail", btnCls: "bi" },
            ].map(g => (
              <div className="gdpr-card" key={g.title}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: g.col + "18", border: `1px solid ${g.col}2E`, display: "flex", alignItems: "center", justifyContent: "center", color: g.col, flexShrink: 0 }}><I n={g.icon} s={18} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{g.title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text3)", marginTop: 3, marginBottom: 10 }}>{g.sub}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input className="inp" placeholder="Enter user email or ID" style={{ maxWidth: 280 }} />
                    <button className={`btn ${g.btnCls} bsm`}>{g.btn}</button>
                  </div>
                </div>
              </div>
            ))}
            <div className="card" style={{ marginTop: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Data Retention Policies</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[["Audit Logs", "2 years"], ["User Messages", "1 year"], ["Payment Records", "7 years"], ["Grade History", "Indefinite"], ["Session Logs", "90 days"], ["File Access Logs", "1 year"]].map(([k, v]) => (
                  <div key={k} className="card2">
                    <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{k}</div>
                    <select className="sel" defaultValue={v} style={{ marginTop: 8, fontSize: 13 }}>
                      {["30 days", "90 days", "6 months", "1 year", "2 years", "7 years", "Indefinite"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
          <button className="btn bg">Reset</button>
          <button className="btn ba" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}><I n="check" s={13} />Save Security Settings</button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// APPEARANCE MODULE
// ══════════════════════════════════════════════════════════════════════════════

const ACCENT_COLORS = ["#F59E0B", "#6366F1", "#14B8A6", "#10B981", "#3B82F6", "#EC4899", "#F97316", "#8B5CF6", "#EF4444", "#0EA5E9"];
const FONTS_LIST = [
  { name: "Plus Jakarta Sans", css: "'Plus Jakarta Sans', sans-serif", preview: "Aa Bb" },
  { name: "Syne",              css: "'Syne', sans-serif",              preview: "Aa Bb" },
  { name: "Outfit",            css: "'Outfit', sans-serif",            preview: "Aa Bb" },
  { name: "DM Sans",           css: "'DM Sans', sans-serif",           preview: "Aa Bb" },
  { name: "Manrope",           css: "'Manrope', sans-serif",           preview: "Aa Bb" },
];

const AppearanceView = () => {
  const [theme, setTheme] = useState({
    mode: "dark", accent: "#F59E0B", font: "Plus Jakarta Sans", radius: 8,
    sidebarBg: "#0E1220", topbarBg: "#0E1220",
    logoText: "AcadLMS", tagline: "Learn without limits.",
    customCss: "", customJs: "",
    heroEnabled: true, heroBg: "#0A0D18", heroTitle: "Learn Anything, Anytime.",
    footerText: "© 2024 AcadLMS. All rights reserved.",
    loginBg: "#07090D",
  });
  const setT = (k, v) => setTheme(t => ({ ...t, [k]: v }));
  const [subTab, setSubTab] = useState("colors");
  const [saved, setSaved] = useState(false);

  const Preview = () => (
    <div className="preview-frame" style={{ flex: 1, minHeight: 360 }}>
      {/* Mock admin layout preview */}
      <div style={{ display: "flex", height: "100%", fontFamily: theme.font }}>
        {/* Sidebar */}
        <div style={{ width: 140, background: theme.sidebarBg, borderRight: "1px solid #1E2535", padding: "14px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontFamily: theme.font, fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 12, paddingLeft: 4 }}>
            {theme.logoText.slice(0, 4)}<span style={{ color: theme.accent }}>{theme.logoText.slice(4)}</span>
          </div>
          {["Dashboard","Courses","Grades","Students","Settings"].map(item => (
            <div key={item} style={{ padding: "7px 10px", borderRadius: theme.radius * 0.6, fontSize: 12, fontWeight: 600, color: item === "Courses" ? theme.accent : "#8494AB", background: item === "Courses" ? theme.accent + "18" : "transparent", border: item === "Courses" ? `1px solid ${theme.accent}30` : "1px solid transparent" }}>{item}</div>
          ))}
        </div>
        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ height: 44, background: theme.topbarBg, borderBottom: "1px solid #1E2535", display: "flex", alignItems: "center", padding: "0 14px", gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#DCE8F8" }}>Course Manager</span>
            <div style={{ marginLeft: "auto", width: 26, height: 26, borderRadius: "50%", background: theme.accent + "22", border: `1.5px solid ${theme.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: theme.accent }}>SC</div>
          </div>
          <div style={{ flex: 1, background: "#07090D", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {["4 Courses","284 Students","$11.8k Revenue"].map((s, i) => (
                <div key={s} style={{ background: "#0E1220", border: "1px solid #182030", borderRadius: theme.radius * 0.7, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10, color: "#344D66", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>Metric {i + 1}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: theme.accent, fontFamily: "'JetBrains Mono',monospace", marginTop: 3 }}>{s.split(" ")[0]}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#0E1220", border: "1px solid #182030", borderRadius: theme.radius * 0.7, padding: "10px 12px", flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#DCE8F8", marginBottom: 8 }}>Recent Courses</div>
              {["Advanced React & TypeScript","ML Fundamentals"].map(c => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #182030" }}>
                  <div style={{ width: 22, height: 22, borderRadius: theme.radius * 0.5, background: theme.accent + "22", display: "flex", alignItems: "center", justifyContent: "center", color: theme.accent, fontSize: 10 }}>📚</div>
                  <span style={{ fontSize: 11, color: "#8494AB" }}>{c}</span>
                  <div style={{ marginLeft: "auto", padding: "2px 7px", borderRadius: 10, background: theme.accent + "18", color: theme.accent, fontSize: 10, fontWeight: 700 }}>Live</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 8, right: 10, fontSize: 10, color: "#344D66" }}>Live Preview</div>
    </div>
  );

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      {saved && <div style={{ padding: "10px 14px", background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)", borderRadius: 8, fontSize: 13, color: "var(--green)", display: "flex", gap: 8, alignItems: "center" }}><I n="check" s={14} />Appearance saved. Changes are live!</div>}

      {/* Subtabs */}
      <div style={{ display: "flex", gap: 2, background: "var(--bg2)", padding: 3, borderRadius: 8, width: "fit-content" }}>
        {[["colors","Colors & Theme"],["typography","Typography"],["layout","Layout & Logo"],["pages","Pages"],["code","Custom Code"]].map(([id, lbl]) => (
          <div key={id} onClick={() => setSubTab(id)} style={{ padding: "7px 14px", borderRadius: 7, fontSize: 12.5, fontWeight: 600, cursor: "pointer", color: subTab === id ? "var(--text)" : "var(--text2)", background: subTab === id ? "var(--card)" : "transparent", transition: "all .14s" }}>{lbl}</div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 18 }}>
        {/* Controls */}
        <div style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* COLORS */}
          {subTab === "colors" && (
            <>
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 12 }}>Color Mode</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["dark","Dark"], ["light","Light"]].map(([m, lbl]) => (
                    <div key={m} onClick={() => setT("mode", m)} style={{ flex: 1, padding: "10px", borderRadius: 8, cursor: "pointer", border: `1px solid ${theme.mode === m ? "var(--amber)" : "var(--border)"}`, background: theme.mode === m ? "var(--adim)" : "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all .14s" }}>
                      <I n={m === "dark" ? "moon" : "sun"} s={14} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: theme.mode === m ? "var(--amber)" : "var(--text2)" }}>{lbl}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 12 }}>Accent Color</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {ACCENT_COLORS.map(c => (
                    <div key={c} className={`swatch ${theme.accent === c ? "on" : ""}`} style={{ background: c }} onClick={() => setT("accent", c)} />
                  ))}
                  <input type="color" value={theme.accent} onChange={e => setT("accent", e.target.value)} style={{ width: 28, height: 28, borderRadius: 7, border: "none", cursor: "pointer", background: "none", padding: 0 }} title="Custom color" />
                </div>
              </div>
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 12 }}>Border Radius</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input type="range" className="range" min="0" max="20" value={theme.radius} onChange={e => setT("radius", Number(e.target.value))} style={{ flex: 1 }} />
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: "var(--amber)", minWidth: 36 }}>{theme.radius}px</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {[0, 4, 8, 12, 20].map(r => <div key={r} onClick={() => setT("radius", r)} style={{ width: 36, height: 36, borderRadius: r, background: theme.radius === r ? "var(--adim)" : "var(--bg2)", border: `1px solid ${theme.radius === r ? "var(--amber)" : "var(--border)"}`, cursor: "pointer", transition: "all .14s" }} />)}
                </div>
              </div>
            </>
          )}

          {/* TYPOGRAPHY */}
          {subTab === "typography" && (
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 12 }}>Platform Font</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {FONTS_LIST.map(f => (
                  <div key={f.name} className={`font-opt ${theme.font === f.name ? "on" : ""}`} onClick={() => setT("font", f.name)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: theme.font === f.name ? "var(--amber)" : "var(--text)" }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>Body · Headings · UI</div>
                    </div>
                    <span style={{ fontFamily: f.css, fontSize: 20, color: "var(--text2)" }}>{f.preview}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LAYOUT & LOGO */}
          {subTab === "layout" && (
            <>
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 12 }}>Logo & Branding</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="fl"><label className="lbl">Logo Text</label><input className="inp" value={theme.logoText} onChange={e => setT("logoText", e.target.value)} /></div>
                  <div className="fl"><label className="lbl">Tagline</label><input className="inp" value={theme.tagline} onChange={e => setT("tagline", e.target.value)} /></div>
                  <div style={{ padding: "10px", background: "var(--bg2)", border: "2px dashed var(--border2)", borderRadius: 8, textAlign: "center", cursor: "pointer" }}>
                    <I n="upload" s={18} /><div style={{ fontSize: 12.5, color: "var(--text3)", marginTop: 6 }}>Upload Logo (PNG/SVG)</div>
                  </div>
                  <div style={{ padding: "10px", background: "var(--bg2)", border: "2px dashed var(--border2)", borderRadius: 8, textAlign: "center", cursor: "pointer" }}>
                    <I n="upload" s={18} /><div style={{ fontSize: 12.5, color: "var(--text3)", marginTop: 6 }}>Upload Favicon (32×32)</div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 12 }}>Navigation Layout</div>
                {[["Sidebar left (default)","Sidebar right","Top navigation only"].map((opt, i) => (
                  <div key={opt} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${i === 0 ? "var(--amber)" : "var(--border2)"}`, background: i === 0 ? "var(--amber)" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {i === 0 && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#000" }} />}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? "var(--text)" : "var(--text2)" }}>{opt}</span>
                  </div>
                ))]}
              </div>
            </>
          )}

          {/* PAGES */}
          {subTab === "pages" && (
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 12 }}>Page Settings</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="fl"><label className="lbl">Homepage Hero Title</label><input className="inp" value={theme.heroTitle} onChange={e => setT("heroTitle", e.target.value)} /></div>
                <div className="fl"><label className="lbl">Footer Text</label><input className="inp" value={theme.footerText} onChange={e => setT("footerText", e.target.value)} /></div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--bg2)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div><div style={{ fontWeight: 600, fontSize: 13 }}>Hero Section Enabled</div><div style={{ fontSize: 11.5, color: "var(--text3)", marginTop: 1 }}>Show hero banner on homepage</div></div>
                  <Toggle on={theme.heroEnabled} onChange={v => setT("heroEnabled", v)} />
                </div>
                <div className="fl"><label className="lbl">Login Page Background Color</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={theme.loginBg} onChange={e => setT("loginBg", e.target.value)} style={{ width: 38, height: 38, border: "none", cursor: "pointer", borderRadius: 7, background: "none" }} />
                    <input className="inp" value={theme.loginBg} onChange={e => setT("loginBg", e.target.value)} style={{ fontFamily: "var(--mono)", fontSize: 13 }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CUSTOM CODE */}
          {subTab === "code" && (
            <>
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4, display: "flex", alignItems: "center", gap: 7 }}><I n="css" s={14} />Custom CSS</div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10 }}>Injected into {'<head>'} on every page</div>
                <textarea className="inp ta" style={{ fontFamily: "var(--mono)", fontSize: 12, minHeight: 120, color: "var(--teal)" }} placeholder={`:root {\n  --custom-accent: #F59E0B;\n}\n\n.my-class { ... }`} value={theme.customCss} onChange={e => setT("customCss", e.target.value)} />
              </div>
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4, display: "flex", alignItems: "center", gap: 7 }}><I n="css" s={14} />Custom JavaScript</div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10 }}>Injected before {'</body>'} — admin only</div>
                <textarea className="inp ta" style={{ fontFamily: "var(--mono)", fontSize: 12, minHeight: 100, color: "var(--amber)" }} placeholder={`// Analytics, custom widgets\nconsole.log('AcadLMS loaded');`} value={theme.customJs} onChange={e => setT("customJs", e.target.value)} />
                <div style={{ marginTop: 8, padding: "8px 10px", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.18)", borderRadius: 7, fontSize: 11.5, color: "var(--red)", display: "flex", gap: 7 }}>
                  <I n="alert" s={13} />Only Super Admins can inject JavaScript. Code runs in users' browsers.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Live preview */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text2)" }}>Live Preview</div>
          <Preview />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn bg bsm">Reset to Default</button>
            <button className="btn ba" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}><I n="check" s={13} />Apply Theme</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// AUDIT LOGS MODULE
// ══════════════════════════════════════════════════════════════════════════════

const AUDIT_EVENTS = [
  { id: 1,  ts: "2024-06-10 14:22:01", actor: "Sophia Chen",   av: "SC", col: "#6366F1", action: "grade.override",      resource: "Module 1 Quiz",           detail: "Grade changed 72→78 for Elena Vasquez",            severity: "medium", ip: "192.168.1.1",  module: "Grades"    },
  { id: 2,  ts: "2024-06-10 13:58:44", actor: "System",        av: "SY", col: "#14B8A6", action: "security.brute_force",resource: "Login page",              detail: "45.33.102.55 blocked after 5 failed attempts",      severity: "high",   ip: "45.33.102.55", module: "Security"  },
  { id: 3,  ts: "2024-06-10 13:30:19", actor: "Marcus Rivera", av: "MR", col: "#F59E0B", action: "user.role_change",    resource: "Priya Nair",              detail: "Role changed: Student → Course Manager",            severity: "high",   ip: "10.0.0.45",    module: "Users"     },
  { id: 4,  ts: "2024-06-10 12:10:55", actor: "Sophia Chen",   av: "SC", col: "#6366F1", action: "course.published",   resource: "Advanced React & TS",     detail: "Course published — now visible to all students",    severity: "low",    ip: "192.168.1.1",  module: "Courses"   },
  { id: 5,  ts: "2024-06-10 11:44:08", actor: "Aisha Patel",   av: "AP", col: "#EC4899", action: "payment.refund",     resource: "TXN-8819",                detail: "Refund $59 issued to Mei Lin — UX Design",          severity: "medium", ip: "172.16.0.22",  module: "Payments"  },
  { id: 6,  ts: "2024-06-10 11:02:33", actor: "System",        av: "SY", col: "#14B8A6", action: "security.ip_blocked",resource: "IP 103.21.244.5",         detail: "IP auto-blocked: matched CIDR blocklist",           severity: "high",   ip: "103.21.244.5", module: "Security"  },
  { id: 7,  ts: "2024-06-10 10:30:00", actor: "Marcus Rivera", av: "MR", col: "#F59E0B", action: "settings.changed",   resource: "Password Policy",         detail: "Min length changed 8→12, special chars required",   severity: "medium", ip: "10.0.0.45",    module: "Security"  },
  { id: 8,  ts: "2024-06-10 09:55:12", actor: "Sophia Chen",   av: "SC", col: "#6366F1", action: "user.created",       resource: "derek@lms.dev",           detail: "New user created — role: Teaching Assistant",       severity: "low",    ip: "192.168.1.1",  module: "Users"     },
  { id: 9,  ts: "2024-06-09 17:20:30", actor: "Sophia Chen",   av: "SC", col: "#6366F1", action: "appearance.theme",   resource: "Platform Theme",          detail: "Accent color changed to #6366F1, radius 8px",       severity: "low",    ip: "192.168.1.1",  module: "Appearance"},
  { id: 10, ts: "2024-06-09 16:45:01", actor: "Jonas Weber",   av: "JW", col: "#10B981", action: "drm.license_revoked",resource: "Elena Vasquez",           detail: "DRM license revoked for Node.js course files",      severity: "medium", ip: "192.168.2.10", module: "DRM"       },
  { id: 11, ts: "2024-06-09 15:00:00", actor: "System",        av: "SY", col: "#14B8A6", action: "backup.completed",   resource: "Full DB Backup",          detail: "Automated backup completed — 2.4 GB archived",      severity: "low",    ip: "127.0.0.1",    module: "System"    },
  { id: 12, ts: "2024-06-09 14:10:18", actor: "Marcus Rivera", av: "MR", col: "#F59E0B", action: "user.suspended",     resource: "Ali Hassan",              detail: "Account suspended — reason: TOS violation",         severity: "high",   ip: "10.0.0.45",    module: "Users"     },
];

const LIVE_LOG_LINES = [
  { t: "14:22:01.324", lvl: "INFO",  col: "#14B8A6", msg: "GET /api/v1/courses/1/sections — 200 OK — 24ms — user:1"        },
  { t: "14:22:01.891", lvl: "INFO",  col: "#14B8A6", msg: "POST /api/v1/grades/override — 200 OK — 41ms — user:1"           },
  { t: "14:22:02.114", lvl: "WARN",  col: "#F59E0B", msg: "Rate limit approaching for IP 10.0.0.45 — 88/100 req/min"        },
  { t: "14:22:02.500", lvl: "INFO",  col: "#14B8A6", msg: "GET /api/v1/users?page=1 — 200 OK — 11ms — user:2"               },
  { t: "14:22:03.012", lvl: "ERROR", col: "#EF4444", msg: "Auth failed — 401 Unauthorized — IP: 45.33.102.55 (attempt 5/5)" },
  { t: "14:22:03.018", lvl: "WARN",  col: "#F59E0B", msg: "Brute force detected — IP 45.33.102.55 auto-blocked"             },
  { t: "14:22:04.200", lvl: "INFO",  col: "#14B8A6", msg: "WebSocket connection — user:3 — msg channel opened"              },
  { t: "14:22:04.780", lvl: "INFO",  col: "#14B8A6", msg: "GET /api/v1/notifications?unread=true — 200 OK — 8ms — user:4"  },
  { t: "14:22:05.001", lvl: "DEBUG", col: "#6366F1", msg: "Grade recalculation triggered — course:1 — 8 students affected"  },
  { t: "14:22:05.450", lvl: "INFO",  col: "#14B8A6", msg: "POST /api/v1/messages — 201 Created — 19ms — user:5"             },
  { t: "14:22:06.300", lvl: "INFO",  col: "#14B8A6", msg: "File access: video/module2.mp4 — user:3 — DRM token valid"       },
  { t: "14:22:06.990", lvl: "WARN",  col: "#F59E0B", msg: "Slow query detected — 1,240ms — GET /reports/overview"           },
];

const severityBadge = (s) => ({ high: <span className="badge BR" style={{fontSize:10.5}}>High</span>, medium: <span className="badge BA" style={{fontSize:10.5}}>Medium</span>, low: <span className="badge BT" style={{fontSize:10.5}}>Low</span> }[s]);

const AuditLogsView = () => {
  const [view, setView] = useState("audit");
  const [search, setSearch] = useState("");
  const [filterMod, setFilterMod] = useState("all");
  const [filterSev, setFilterSev] = useState("all");
  const [liveRunning, setLiveRunning] = useState(true);
  const [liveLines, setLiveLines] = useState(LIVE_LOG_LINES);
  const [selEvent, setSelEvent] = useState(null);
  const logRef = useRef();

  useEffect(() => {
    if (!liveRunning) return;
    const interval = setInterval(() => {
      const next = LIVE_LOG_LINES[Math.floor(Math.random() * LIVE_LOG_LINES.length)];
      const now = new Date();
      const ts = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}.${String(now.getMilliseconds()).slice(0,3)}`;
      setLiveLines(ll => [...ll.slice(-60), { ...next, t: ts }]);
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 1200);
    return () => clearInterval(interval);
  }, [liveRunning]);

  const filtered = AUDIT_EVENTS.filter(e => {
    const q = search.toLowerCase();
    const match = e.actor.toLowerCase().includes(q) || e.action.includes(q) || e.resource.toLowerCase().includes(q) || e.detail.toLowerCase().includes(q);
    const mod = filterMod === "all" || e.module === filterMod;
    const sev = filterSev === "all" || e.severity === filterSev;
    return match && mod && sev;
  });

  const modules = [...new Set(AUDIT_EVENTS.map(e => e.module))];

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* View switch */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 2, background: "var(--bg2)", padding: 3, borderRadius: 8 }}>
          {[["audit","Audit Log"],["live","Live Logs"]].map(([id, lbl]) => (
            <div key={id} onClick={() => setView(id)} style={{ padding: "7px 16px", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", color: view === id ? "var(--text)" : "var(--text2)", background: view === id ? "var(--card)" : "transparent", transition: "all .14s", display: "flex", alignItems: "center", gap: 6 }}>
              {id === "live" && <Dot c={liveRunning ? "var(--green)" : "var(--red)"} sz={6} />}{lbl}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {view === "live" && (
            <button className={`btn ${liveRunning ? "bd" : "bt"} bsm`} onClick={() => setLiveRunning(!liveRunning)}>
              {liveRunning ? <><I n="live" s={13} />Pause</> : <><I n="refresh" s={13} />Resume</>}
            </button>
          )}
          <button className="btn bg bsm"><I n="dl" s={13} />Export</button>
        </div>
      </div>

      {/* Stats */}
      {view === "audit" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[
            { lbl: "Total Events",  val: AUDIT_EVENTS.length, c: "var(--amber)"  },
            { lbl: "High Severity", val: AUDIT_EVENTS.filter(e=>e.severity==="high").length, c: "var(--red)"    },
            { lbl: "Security Events",val:AUDIT_EVENTS.filter(e=>e.module==="Security").length, c: "var(--orange)"},
            { lbl: "Unique Actors", val: [...new Set(AUDIT_EVENTS.map(e=>e.actor))].length, c: "var(--teal)"   },
          ].map(s => (
            <div className="scard" key={s.lbl}>
              <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>{s.lbl}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.c, fontFamily: "var(--mono)", marginTop: 4 }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* AUDIT TABLE */}
      {view === "audit" && (
        <>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 7, flex: 1 }}>
              <span style={{ padding: "0 11px", color: "var(--text3)" }}><I n="search" s={14} /></span>
              <input style={{ background: "none", border: "none", padding: "8px", color: "var(--text)", fontSize: 13, outline: "none", flex: 1 }} placeholder="Search events, actors, resources…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="sel" style={{ width: 150, fontSize: 12.5 }} value={filterMod} onChange={e => setFilterMod(e.target.value)}>
              <option value="all">All Modules</option>
              {modules.map(m => <option key={m}>{m}</option>)}
            </select>
            <select className="sel" style={{ width: 130, fontSize: 12.5 }} value={filterSev} onChange={e => setFilterSev(e.target.value)}>
              <option value="all">All Severity</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input type="date" className="inp" style={{ width: 140, padding: "8px 11px", fontSize: 12.5 }} />
          </div>

          <div className="tbl">
            <table>
              <thead><tr>{["Timestamp","Actor","Action","Resource","Severity","IP","Module",""].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id} onClick={() => setSelEvent(selEvent?.id === e.id ? null : e)} style={{ cursor: "pointer" }}>
                    <td><span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text3)" }}>{e.ts}</span></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Av i={e.av} c={e.col} sz={24} />
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{e.actor}</span>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--indigo)", background: "rgba(99,102,241,.08)", border: "1px solid rgba(99,102,241,.15)", borderRadius: 5, padding: "2px 8px" }}>{e.action}</span></td>
                    <td style={{ fontSize: 13, maxWidth: 140 }}><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{e.resource}</span></td>
                    <td>{severityBadge(e.severity)}</td>
                    <td><span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text3)" }}>{e.ip}</span></td>
                    <td><span className="badge BX" style={{ fontSize: 10.5 }}>{e.module}</span></td>
                    <td><button className="btn bg bxs"><I n="eye" s={12} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expanded event detail */}
          {selEvent && (
            <div className="card" style={{ borderColor: "var(--border2)", animation: "fadeUp .2s ease" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Av i={selEvent.av} c={selEvent.col} sz={32} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{selEvent.action}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 1 }}>{selEvent.ts}</div>
                  </div>
                </div>
                <button className="btn bg bico" onClick={() => setSelEvent(null)}><I n="x" s={14} /></button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 12 }}>
                {[["Actor", selEvent.actor], ["Module", selEvent.module], ["IP Address", selEvent.ip], ["Resource", selEvent.resource], ["Severity", selEvent.severity], ["Event ID", `#${selEvent.id}`]].map(([k, v]) => (
                  <div key={k} style={{ padding: "9px 12px", background: "var(--bg2)", borderRadius: 8, border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{k}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 3, fontFamily: ["IP Address","Event ID"].includes(k) ? "var(--mono)" : "var(--font)" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px 14px", background: "var(--bg2)", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13.5 }}>
                <span style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 4 }}>Event Detail</span>
                {selEvent.detail}
              </div>
            </div>
          )}
        </>
      )}

      {/* LIVE LOGS */}
      {view === "live" && (
        <div style={{ background: "#05070D", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "var(--card2)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <Dot c={liveRunning ? "var(--green)" : "var(--red)"} sz={8} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 12.5, fontWeight: 600, color: "var(--text2)" }}>
              {liveRunning ? "Streaming live…" : "Paused"} — {liveLines.length} lines
            </span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {["ALL","INFO","WARN","ERROR","DEBUG"].map(lvl => (
                <span key={lvl} style={{ fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700, cursor: "pointer", color: lvl === "ALL" ? "var(--amber)" : "var(--text3)", padding: "2px 7px", borderRadius: 4, background: lvl === "ALL" ? "var(--adim)" : "transparent" }}>{lvl}</span>
              ))}
            </div>
          </div>
          <div ref={logRef} style={{ height: 420, overflowY: "auto", fontFamily: "var(--mono)" }}>
            {liveLines.map((line, i) => (
              <div key={i} className="logline">
                <span style={{ color: "var(--text3)", flexShrink: 0, fontSize: 11 }}>{line.t}</span>
                <span style={{ background: line.col + "18", color: line.col, padding: "0px 6px", borderRadius: 4, flexShrink: 0, fontSize: 11, fontWeight: 700 }}>{line.lvl}</span>
                <span style={{ color: line.lvl === "ERROR" ? "var(--red)" : line.lvl === "WARN" ? "var(--amber)" : "var(--text2)" }}>{line.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
const SIDENAV = [
  { sec: "Security", items: [
    { id: "security",   icon: "shield",  label: "Security Center" },
  ]},
  { sec: "Appearance", items: [
    { id: "appearance", icon: "paint",   label: "Theme Builder" },
  ]},
  { sec: "Audit", items: [
    { id: "audit",      icon: "log",     label: "Audit Logs" },
  ]},
  { sec: "Platform", items: [
    { id: "courses", icon: "book",    label: "Courses",  dim: true },
    { id: "payments",icon: "settings",label: "Payments", dim: true },
    { id: "grades",  icon: "users",   label: "Grades",   dim: true },
  ]},
];


export { SecurityOverview, AppearanceView, AuditLogsView };
