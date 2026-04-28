import React from 'react';
// ─────────────────────────────────────────────────────────────────────────────
// AcadLMS Shared Design System
// Used by all 10 phases — import once, never duplicated
// ─────────────────────────────────────────────────────────────────────────────

export const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap');`;

export const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#05070C;--bg2:#07091A;--card:#0B1020;--card2:#0F1728;--card3:#131F32;
  --border:#152030;--border2:#1A2C40;--border3:#223650;
  --amber:#F59E0B;--amber2:#FCD34D;--adim:rgba(245,158,11,.09);--aglow:rgba(245,158,11,.24);
  --teal:#14B8A6;--indigo:#6366F1;--red:#EF4444;--green:#10B981;--blue:#3B82F6;
  --orange:#F97316;--violet:#8B5CF6;--sky:#0EA5E9;--lime:#84CC16;--pink:#EC4899;
  --text:#D2E8FA;--text2:#6E8FA8;--text3:#2A4560;--text4:#152840;
  --font:'Plus Jakarta Sans',sans-serif;--mono:'JetBrains Mono',monospace;--display:'Syne',sans-serif;
}
body{background:var(--bg);color:var(--text);font-family:var(--font);min-height:100vh}
input,select,textarea,button{font-family:var(--font)}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:var(--bg2)}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}

@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes livepulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.5)}70%{box-shadow:0 0 0 6px rgba(239,68,68,0)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes barRise{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes lineTrace{from{stroke-dashoffset:800}to{stroke-dashoffset:0}}
@keyframes tokenReveal{from{opacity:0;letter-spacing:-.5em}to{opacity:1;letter-spacing:normal}}
@keyframes encryptFlash{0%,100%{background:var(--card2)}50%{background:rgba(245,158,11,.08)}}
@keyframes progressFill{from{width:0}to{width:100%}}
@keyframes scanDown{from{top:0}to{top:100%}}
@keyframes shield{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
@keyframes watermarkFloat{0%,100%{transform:rotate(-15deg) translate(0,0)}50%{transform:rotate(-15deg) translate(4px,-4px)}}
.au{animation:fadeUp .3s ease forwards}
.ai{animation:fadeIn .2s ease forwards}
.spin{animation:spin .75s linear infinite}

/* ── Buttons ── */
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 15px;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .15s;user-select:none;white-space:nowrap}
.btn:disabled{opacity:.4;cursor:not-allowed}
.ba{background:var(--amber);color:#000}.ba:hover:not(:disabled){background:var(--amber2);box-shadow:0 0 22px var(--aglow);transform:translateY(-1px)}
.bg{background:transparent;color:var(--text2);border:1px solid var(--border2)}.bg:hover:not(:disabled){background:var(--card2);color:var(--text);border-color:var(--border3)}
.bd{background:rgba(239,68,68,.08);color:var(--red);border:1px solid rgba(239,68,68,.18)}.bd:hover:not(:disabled){background:rgba(239,68,68,.14)}
.bt{background:rgba(20,184,166,.08);color:var(--teal);border:1px solid rgba(20,184,166,.2)}.bt:hover:not(:disabled){background:rgba(20,184,166,.14)}
.bv{background:rgba(139,92,246,.08);color:var(--violet);border:1px solid rgba(139,92,246,.2)}.bv:hover:not(:disabled){background:rgba(139,92,246,.14)}
.bi{background:rgba(99,102,241,.08);color:var(--indigo);border:1px solid rgba(99,102,241,.2)}.bi:hover:not(:disabled){background:rgba(99,102,241,.14)}
.bsm{padding:5px 11px;font-size:12.5px}.bxs{padding:3px 8px;font-size:12px;border-radius:6px}
.bico{padding:7px;aspect-ratio:1;border-radius:7px}

/* ── Form ── */
.fl{display:flex;flex-direction:column;gap:5px}
.lbl{font-size:11px;font-weight:700;color:var(--text2);letter-spacing:.06em;text-transform:uppercase}
.inp{background:var(--bg2);border:1px solid var(--border);border-radius:7px;padding:9px 12px;color:var(--text);font-size:13.5px;outline:none;transition:border-color .15s,box-shadow .15s;width:100%}
.inp:focus{border-color:var(--amber);box-shadow:0 0 0 3px var(--adim)}
.inp::placeholder{color:var(--text3)}
.sel{background:var(--bg2);border:1px solid var(--border);border-radius:7px;padding:9px 12px;color:var(--text);font-size:13.5px;outline:none;transition:border-color .15s;width:100%;appearance:none;cursor:pointer}
.sel:focus{border-color:var(--amber);box-shadow:0 0 0 3px var(--adim)}
.ta{background:var(--bg2);border:1px solid var(--border);border-radius:7px;padding:9px 12px;color:var(--text);font-size:13px;outline:none;width:100%;resize:vertical;min-height:80px;line-height:1.6}
.ta:focus{border-color:var(--amber);box-shadow:0 0 0 3px var(--adim)}

/* ── Cards ── */
.card{background:var(--card);border:1px solid var(--border);border-radius:11px;padding:16px}
.card2{background:var(--card2);border:1px solid var(--border);border-radius:8px;padding:11px 13px}
.card-hi{background:linear-gradient(135deg,rgba(245,158,11,.06),rgba(99,102,241,.04));border:1px solid rgba(245,158,11,.15);border-radius:12px;padding:18px}

/* ── Badges ── */
.badge{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:20px;font-size:11.5px;font-weight:600}
.BG{background:rgba(16,185,129,.1);color:var(--green);border:1px solid rgba(16,185,129,.2)}
.BA{background:var(--adim);color:var(--amber);border:1px solid var(--aglow)}
.BR{background:rgba(239,68,68,.1);color:var(--red);border:1px solid rgba(239,68,68,.2)}
.BI{background:rgba(99,102,241,.1);color:var(--indigo);border:1px solid rgba(99,102,241,.2)}
.BT{background:rgba(20,184,166,.1);color:var(--teal);border:1px solid rgba(20,184,166,.2)}
.BX{background:rgba(148,163,184,.06);color:var(--text2);border:1px solid var(--border)}
.BV{background:rgba(139,92,246,.1);color:var(--violet);border:1px solid rgba(139,92,246,.2)}
.BO{background:rgba(249,115,22,.1);color:var(--orange);border:1px solid rgba(249,115,22,.2)}
.BL{background:rgba(132,204,22,.1);color:var(--lime);border:1px solid rgba(132,204,22,.2)}

/* ── Modal ── */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.86);backdrop-filter:blur(8px);z-index:300;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn .18s ease}
.modal{background:var(--card);border:1px solid var(--border2);border-radius:14px;width:100%;max-height:92vh;overflow-y:auto;box-shadow:0 32px 90px rgba(0,0,0,.8);animation:fadeUp .26s ease}
.mhd{padding:16px 22px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px}
.mbd{padding:20px 22px;display:flex;flex-direction:column;gap:14px}
.mft{padding:12px 22px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end}

/* ── Sidebar nav ── */
.sni{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:7px;cursor:pointer;font-size:13px;font-weight:500;color:var(--text2);transition:all .13s;margin-bottom:1px;user-select:none}
.sni:hover{background:var(--card2);color:var(--text)}
.sni.on{background:var(--adim);color:var(--amber);border:1px solid rgba(245,158,11,.18)}

/* ── Toggle ── */
.tog{width:36px;height:20px;border-radius:10px;background:var(--border2);position:relative;cursor:pointer;transition:background .17s;flex-shrink:0}
.tog.on{background:var(--amber)}
.tog::after{content:'';width:14px;height:14px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:transform .17s;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.tog.on::after{transform:translateX(16px)}
.tog.grn.on{background:var(--green)}.tog.red.on{background:var(--red)}

/* ── Table ── */
.tbl{overflow-x:auto;border-radius:10px;border:1px solid var(--border)}
table{width:100%;border-collapse:collapse;font-size:13.5px}
thead th{background:var(--bg2);padding:10px 14px;text-align:left;font-size:10.5px;font-weight:700;color:var(--text3);letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid var(--border)}
tbody tr{border-bottom:1px solid var(--border);transition:background .13s;cursor:pointer}
tbody tr:last-child{border-bottom:none}
tbody tr:hover{background:var(--card2)}
tbody td{padding:11px 14px;vertical-align:middle}

/* ── Progress ── */
.prog{height:5px;background:var(--border);border-radius:3px;overflow:hidden}
.pb{height:100%;border-radius:3px;transition:width .5s ease}

/* ── Stat card ── */
.scard{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px 16px;position:relative;overflow:hidden}
.scard:hover{border-color:var(--border2)}
.sg{position:absolute;top:-28px;right:-28px;width:96px;height:96px;border-radius:50%;opacity:.05;pointer-events:none}

/* ── Sub-tab bar ── */
.stab-bar{display:flex;gap:2px;background:var(--bg2);padding:3px;border-radius:8px;width:fit-content}
.stab{padding:7px 14px;border-radius:6px;font-size:12.5px;font-weight:600;cursor:pointer;transition:all .14s;color:var(--text2)}
.stab:hover{color:var(--text)}
.stab.on{background:var(--card);color:var(--text)}

/* ── Phase-specific extras ── */
.dropzone{border:2px dashed var(--border2);border-radius:10px;padding:32px;text-align:center;cursor:pointer;transition:all .15s;color:var(--text3)}
.dropzone:hover,.dropzone.drag{border-color:var(--amber);color:var(--amber);background:var(--adim)}
.step-dot{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;border:2px solid;transition:all .2s}
.step-line{flex:1;height:2px;border-radius:1px;transition:background .3s}
.live-dot{width:8px;height:8px;border-radius:50%;background:var(--red);animation:livepulse 1.5s infinite}
.hm{border-radius:3px;cursor:pointer;transition:outline .1s}
.hm:hover{outline:1px solid rgba(255,255,255,.28)}
.xml-block{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px 14px;font-family:var(--mono);font-size:11.5px;line-height:1.8;overflow-x:auto;color:var(--text2)}
.vrow{display:flex;gap:12px;align-items:flex-start;padding:13px 16px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .13s}
.vrow:hover{background:var(--card2)}
.vrow:last-child{border-bottom:none}
.sc{padding:2px 8px;border-radius:4px;font-size:10.5px;font-weight:700;letter-spacing:.03em}
.sc-crit{background:rgba(239,68,68,.12);color:var(--red);border:1px solid rgba(239,68,68,.25)}
.sc-high{background:rgba(249,115,22,.1);color:var(--orange);border:1px solid rgba(249,115,22,.22)}
.sc-med{background:var(--adim);color:var(--amber);border:1px solid var(--aglow)}
.sc-low{background:rgba(20,184,166,.08);color:var(--teal);border:1px solid rgba(20,184,166,.2)}
.h5p-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;border:1px solid;cursor:pointer;transition:all .14s}
.sso-card{background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:14px;transition:all .14s}
.sso-card:hover{border-color:var(--border3)}
.sso-card.sso-on{border-color:rgba(16,185,129,.3);background:rgba(16,185,129,.03)}
.arule{background:var(--card2);border:1px solid var(--border);border-radius:9px;padding:13px 16px;display:flex;align-items:center;gap:12px;transition:border-color .14s}
.arule.firing{border-color:rgba(239,68,68,.3);background:rgba(239,68,68,.03)}
.arule:hover{border-color:var(--border2)}
.tenant-card{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:all .16s;cursor:pointer}
.tenant-card:hover{border-color:var(--border2);transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,.4)}
.tenant-card.active-t{border-color:var(--amber);background:rgba(245,158,11,.03)}
.content-card{background:var(--card2);border:1px solid var(--border);border-radius:10px;overflow:hidden;transition:border-color .14s}
.content-card:hover{border-color:var(--border2)}
.bar-outer{display:flex;align-items:flex-end;gap:5px;position:relative}
.bar-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;position:relative}
.bar-rect{width:100%;border-radius:4px 4px 0 0;transform-origin:bottom;animation:barRise .5s ease forwards;cursor:pointer;transition:opacity .15s}
.bar-rect:hover{opacity:.8}
.bar-lbl{font-size:9.5px;color:var(--text3);font-weight:600;white-space:nowrap;font-family:var(--mono)}
.bar-val{position:absolute;bottom:calc(100% + 3px);left:50%;transform:translateX(-50%);font-size:10px;font-family:var(--mono);font-weight:700;opacity:0;transition:opacity .15s;pointer-events:none;white-space:nowrap}
.bar-item:hover .bar-val{opacity:1}
.spk{overflow:visible}
`;

// ─── Icon component ───────────────────────────────────────────────────────────
export const I = ({ n, s = 15 }) => {
  const icons = {
    x:        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    plus:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    check:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    edit:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    search:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    shield:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    alert:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    chart:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    activity: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    eye:      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    dl:       <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    file:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    mail:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    clock:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    users:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    user:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    key:      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
    lock:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    unlock:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
    globe:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    ban:      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
    refresh:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
    back:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    vol:      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
    quiz:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    assign:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
    calendar: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    clock:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    star:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    layers:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
    chevD:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
    chevR:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
    chevL:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
    info:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    zap:      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    server:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
    bell:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    copy:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
    book:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    layers:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
    target:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    tag:      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    palette:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>,
    link:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    arrow:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    play:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    star:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    upload:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
    building: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M3 9h6"/><path d="M3 15h6"/><path d="M15 3v18"/><path d="M15 9h6"/><path d="M15 15h6"/></svg>,
    settings: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    logout:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    video:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
    wifi:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  };
  return icons[n] || null;
};

// ─── Shared primitives ────────────────────────────────────────────────────────
import { useState } from 'react';

export const Av = ({ i, c, sz = 30 }) => (
  <div style={{ width:sz, height:sz, borderRadius:"50%", background:c+"1E", color:c, display:"flex", alignItems:"center", justifyContent:"center", fontSize:sz*.34, fontWeight:700, border:`1.5px solid ${c}33`, flexShrink:0 }}>{i}</div>
);

export const Dot = ({ c, sz = 7 }) => (
  <span style={{ width:sz, height:sz, borderRadius:"50%", background:c, display:"inline-block", flexShrink:0 }} />
);

export const Toggle = ({ on, onChange, cls = "" }) => (
  <div className={`tog ${on?"on":""} ${cls}`} onClick={() => onChange(!on)} />
);

export const Spark = ({ data, color, w = 80, h = 28 }) => {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const last = pts.split(" ").pop().split(",");
  return (
    <svg width={w} height={h} className="spk">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray:800, animation:"lineTrace .8s ease forwards" }}/>
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color}/>
    </svg>
  );
};

export const BarChart = ({ data, color = "var(--amber)", color2 = null, h = 120, lk = "lbl", vk = "val", v2k = null }) => {
  const maxV = Math.max(...data.map(d => Math.max(d[vk], v2k ? (d[v2k]||0) : 0)));
  return (
    <div className="bar-outer" style={{ height:h, alignItems:"flex-end" }}>
      {data.map((d, i) => (
        <div key={i} className="bar-item">
          {v2k && (
            <div className="bar-rect" style={{ height:`${((d[v2k]||0)/maxV*100)}%`, background:color2||"var(--red)", opacity:.5 }}>
              <span className="bar-val" style={{ color:color2||"var(--red)" }}>{d[v2k]}</span>
            </div>
          )}
          <div className="bar-rect" style={{ height:`${(d[vk]/maxV*100)}%`, background:color }}>
            <span className="bar-val" style={{ color }}>{d[vk]}</span>
          </div>
          <div className="bar-lbl">{d[lk]}</div>
        </div>
      ))}
    </div>
  );
};

export const Gauge = ({ value, max = 100, color, label, unit = "%" }) => {
  const r = 36, stroke = 7, circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = pct * circ * 0.75;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <svg width={96} height={96} viewBox="0 0 96 96">
        <circle cx={48} cy={48} r={r} fill="none" stroke="var(--border2)" strokeWidth={stroke}
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeDashoffset={circ * 0.625} strokeLinecap="round"/>
        <circle cx={48} cy={48} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ * 0.625}
          strokeLinecap="round" style={{ transition:"stroke-dasharray .6s ease" }}/>
        <text x="48" y="44" textAnchor="middle" style={{ fill:"var(--text)", fontSize:12, fontWeight:800, fontFamily:"var(--mono)" }}>{value}{unit}</text>
        <text x="48" y="57" textAnchor="middle" style={{ fill:"var(--text3)", fontSize:7, fontFamily:"var(--font)" }}>{label}</text>
      </svg>
    </div>
  );
};

export const Donut = ({ slices, total, cx = 60, r = 24, stroke = 7 }) => {
  const circ = 2 * Math.PI * r;
  let offset = -circ * 0.25;
  return (
    <svg width={cx*2} height={cx*2} viewBox={`0 0 ${cx*2} ${cx*2}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--border2)" strokeWidth={stroke}/>
      {slices.map((s, i) => {
        const dash = (s.pct/100) * circ;
        const el = <circle key={i} cx={cx} cy={cx} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={offset} strokeLinecap="butt"/>;
        offset -= dash;
        return el;
      })}
      <text x={cx} y={cx-4} textAnchor="middle" style={{ fill:"var(--text)", fontSize:11, fontWeight:800, fontFamily:"var(--mono)" }}>{total}</text>
      <text x={cx} y={cx+10} textAnchor="middle" style={{ fill:"var(--text3)", fontSize:7, fontFamily:"var(--font)" }}>total</text>
    </svg>
  );
};
