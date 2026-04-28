import { useState, useEffect, useRef } from 'react';

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@600;700;800&display=swap');`;

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#080A0F;--bg2:#0D1017;--card:#111520;--card2:#161B27;--card3:#1A2030;
  --border:#1E2535;--border2:#252D3D;--border3:#2E3A50;
  --amber:#F59E0B;--amber2:#FCD34D;--amber-dim:rgba(245,158,11,0.1);--amber-glow:rgba(245,158,11,0.22);
  --teal:#14B8A6;--indigo:#6366F1;--red:#EF4444;--green:#10B981;--blue:#3B82F6;--pink:#EC4899;--orange:#F97316;
  --text:#E2E8F0;--text2:#94A3B8;--text3:#475569;--text4:#2D3748;
  --font:'Plus Jakarta Sans',sans-serif;--mono:'JetBrains Mono',monospace;--display:'Syne',sans-serif;
}
body{background:var(--bg);color:var(--text);font-family:var(--font);min-height:100vh}
input,select,textarea,button{font-family:var(--font)}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:var(--bg2)}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}

@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideRight{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.anim-up{animation:fadeUp .4s ease forwards}
.anim-in{animation:fadeIn .25s ease forwards}
.anim-r{animation:slideRight .3s ease forwards}

.grid-bg{
  background-image:linear-gradient(rgba(99,102,241,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.025) 1px,transparent 1px);
  background-size:44px 44px;
}

/* Buttons */
.btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:8px;font-size:13.5px;font-weight:600;cursor:pointer;border:none;transition:all .18s ease;user-select:none;white-space:nowrap}
.btn:disabled{opacity:.45;cursor:not-allowed}
.btn-amber{background:var(--amber);color:#000}
.btn-amber:hover:not(:disabled){background:var(--amber2);box-shadow:0 0 22px var(--amber-glow);transform:translateY(-1px)}
.btn-ghost{background:transparent;color:var(--text2);border:1px solid var(--border2)}
.btn-ghost:hover:not(:disabled){background:var(--card2);color:var(--text);border-color:var(--border3)}
.btn-danger{background:rgba(239,68,68,.1);color:var(--red);border:1px solid rgba(239,68,68,.2)}
.btn-danger:hover:not(:disabled){background:rgba(239,68,68,.18)}
.btn-teal{background:rgba(20,184,166,.12);color:var(--teal);border:1px solid rgba(20,184,166,.22)}
.btn-teal:hover:not(:disabled){background:rgba(20,184,166,.2)}
.btn-sm{padding:6px 13px;font-size:13px}
.btn-xs{padding:4px 10px;font-size:12px;border-radius:6px}
.btn-icon{padding:7px;border-radius:8px;aspect-ratio:1}

/* Inputs */
.field{display:flex;flex-direction:column;gap:5px}
.label{font-size:12px;font-weight:700;color:var(--text2);letter-spacing:.04em;text-transform:uppercase}
.input{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 13px;color:var(--text);font-size:13.5px;outline:none;transition:all .18s;width:100%}
.input:focus{border-color:var(--amber);box-shadow:0 0 0 3px var(--amber-dim)}
.input::placeholder{color:var(--text3)}
.textarea{resize:vertical;min-height:90px}
.select{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 13px;color:var(--text);font-size:13.5px;outline:none;transition:all .18s;width:100%;appearance:none;cursor:pointer}
.select:focus{border-color:var(--amber);box-shadow:0 0 0 3px var(--amber-dim)}
.irow{position:relative}.irow .input{padding-left:40px}.irow .ico{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--text3);pointer-events:none}

/* Cards */
.card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px}
.card-sm{border-radius:8px;padding:12px 14px}

/* Badges */
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11.5px;font-weight:600}
.b-green{background:rgba(16,185,129,.1);color:var(--green);border:1px solid rgba(16,185,129,.2)}
.b-amber{background:var(--amber-dim);color:var(--amber);border:1px solid var(--amber-glow)}
.b-red{background:rgba(239,68,68,.1);color:var(--red);border:1px solid rgba(239,68,68,.2)}
.b-indigo{background:rgba(99,102,241,.1);color:var(--indigo);border:1px solid rgba(99,102,241,.2)}
.b-teal{background:rgba(20,184,166,.1);color:var(--teal);border:1px solid rgba(20,184,166,.2)}
.b-gray{background:rgba(148,163,184,.07);color:var(--text2);border:1px solid var(--border)}
.b-blue{background:rgba(59,130,246,.1);color:var(--blue);border:1px solid rgba(59,130,246,.2)}
.b-pink{background:rgba(236,72,153,.1);color:var(--pink);border:1px solid rgba(236,72,153,.2)}

/* Modal */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(5px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease}
.modal{background:var(--card);border:1px solid var(--border2);border-radius:16px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 30px 70px rgba(0,0,0,.6);animation:fadeUp .28s ease}
.mh{padding:18px 24px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0}
.mb{padding:22px 24px;display:flex;flex-direction:column;gap:16px}
.mf{padding:14px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end}

/* Tabs */
.tabs{display:flex;gap:2px;background:var(--bg2);padding:3px;border-radius:9px}
.tab{flex:1;padding:7px 14px;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer;text-align:center;color:var(--text2);transition:all .15s}
.tab.on{background:var(--card);color:var(--text);box-shadow:0 1px 4px rgba(0,0,0,.35)}

/* Table */
.tbl-wrap{overflow-x:auto;border-radius:10px;border:1px solid var(--border)}
table{width:100%;border-collapse:collapse;font-size:13.5px}
thead th{background:var(--bg2);padding:11px 15px;text-align:left;font-size:10.5px;font-weight:700;color:var(--text3);letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid var(--border)}
tbody tr{border-bottom:1px solid var(--border);transition:background .14s}
tbody tr:last-child{border-bottom:none}
tbody tr:hover{background:var(--card2)}
tbody td{padding:12px 15px;vertical-align:middle}

/* Sidebar nav */
.snav-item{display:flex;align-items:center;gap:9px;padding:8px 11px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:var(--text2);transition:all .14s;margin-bottom:1px}
.snav-item:hover{background:var(--card2);color:var(--text)}
.snav-item.on{background:var(--amber-dim);color:var(--amber);border:1px solid var(--amber-glow)}

/* Toggle */
.toggle{width:38px;height:21px;border-radius:11px;background:var(--border2);position:relative;cursor:pointer;transition:background .2s;flex-shrink:0}
.toggle.on{background:var(--amber)}
.toggle::after{content:'';width:15px;height:15px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.toggle.on::after{transform:translateX(17px)}

/* Progress bar */
.prog{height:5px;background:var(--border);border-radius:3px;overflow:hidden}
.prog-bar{height:100%;border-radius:3px;transition:width .4s ease}

/* Drag handle */
.drag-handle{cursor:grab;color:var(--text3);padding:4px 6px;border-radius:5px;transition:all .14s;display:flex;align-items:center}
.drag-handle:hover{background:var(--card2);color:var(--text2)}
.drag-handle:active{cursor:grabbing}

/* Activity type pill */
.act-type{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.04em}

/* Stat */
.stat{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:16px 18px}
.stat:hover{border-color:var(--border2)}
`;

// ── Icons ──────────────────────────────────────────────────────────────────────
const Ic = ({ n, s = 15 }) => {
  const d = {
    plus:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    x:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    edit:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    search:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    book:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    video:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
    file:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    check2:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="11" width="4" height="10"/><path d="M14 21V7a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v14"/><polyline points="3 21 21 21"/></svg>,
    users:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    user:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    grid:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    list:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    settings:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    eye:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    chevron:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
    chevronR:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
    drag:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="19" r="1" fill="currentColor"/><circle cx="15" cy="5" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1" fill="currentColor"/></svg>,
    lock:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    unlock:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
    check:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    upload:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
    mic:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    forum:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    live:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>,
    info:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    star:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    back:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    copy:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
    tag:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    clock:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    layers:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  };
  return d[n] || null;
};

// ── Activity type config ───────────────────────────────────────────────────────
const ACT_TYPES = [
  { id:'video',    label:'Video',       icon:'video',  color:'#6366F1', bg:'rgba(99,102,241,.12)'  },
  { id:'pdf',      label:'Document',    icon:'file',   color:'#EF4444', bg:'rgba(239,68,68,.12)'   },
  { id:'quiz',     label:'Quiz',        icon:'check2', color:'#10B981', bg:'rgba(16,185,129,.12)'  },
  { id:'assign',   label:'Assignment',  icon:'edit',   color:'#F59E0B', bg:'rgba(245,158,11,.12)'  },
  { id:'forum',    label:'Discussion',  icon:'forum',  color:'#14B8A6', bg:'rgba(20,184,166,.12)'  },
  { id:'live',     label:'Live Session',icon:'live',   color:'#F97316', bg:'rgba(249,115,22,.12)'  },
  { id:'audio',    label:'Audio',       icon:'mic',    color:'#EC4899', bg:'rgba(236,72,153,.12)'  },
  { id:'scorm',    label:'SCORM',       icon:'layers', color:'#3B82F6', bg:'rgba(59,130,246,.12)'  },
];

const actType = (id) => ACT_TYPES.find(a => a.id === id) || ACT_TYPES[0];

// ── Mock data ──────────────────────────────────────────────────────────────────
const COURSE_CATEGORIES = {
  'Technology': {
    'Development': ['Frontend', 'Backend', 'Mobile', 'Full Stack', 'Cloud'],
    'Data Science': ['Machine Learning', 'Data Analysis', 'Deep Learning', 'Statistics'],
    'Security': ['Cybersecurity', 'Ethical Hacking', 'Network Security']
  },
  'Design': {
    'UX/UI': ['User Research', 'Prototyping', 'Wireframing', 'Usability Testing'],
    'Graphic Design': ['Illustration', 'Branding', 'Typography'],
    '3D & Animation': ['Modeling', 'Rigging', 'Motion Graphics']
  },
  'Business': {
    'Management': ['Agile', 'Scrum', 'Leadership'],
    'Marketing': ['Digital Marketing', 'SEO', 'Content Strategy'],
    'Finance': ['Accounting', 'Investing', 'Corporate Finance']
  }
};

const INIT_COURSES = [
  { id:1, title:'Advanced React & TypeScript', slug:'advanced-react-ts', parentCategory:'Technology', subCategory:'Development', nestedSubCategory:'Frontend', instructor:'Sophia Chen', status:'published', enroll:'open', level:'Advanced', students:142, sections:6, activities:24, rating:4.8, thumb:'#6366F1', price:49, created:'Jan 12, 2024', tags:['React','TypeScript','Hooks'] },
  { id:2, title:'Machine Learning Fundamentals', slug:'ml-fundamentals', parentCategory:'Technology', subCategory:'Data Science', nestedSubCategory:'Machine Learning', instructor:'Marcus Rivera', status:'draft', enroll:'key', level:'Intermediate', students:0, sections:4, activities:18, rating:0, thumb:'#14B8A6', price:79, created:'Feb 3, 2024', tags:['Python','ML','TensorFlow'] },
  { id:3, title:'UX Design Masterclass', slug:'ux-design-masterclass', parentCategory:'Design', subCategory:'UX/UI', nestedSubCategory:'User Research', instructor:'Aisha Patel', status:'published', enroll:'paid', level:'Beginner', students:89, sections:8, activities:31, rating:4.6, thumb:'#F59E0B', price:59, created:'Mar 7, 2024', tags:['Figma','UX','Research'] },
  { id:4, title:'Node.js & REST API Design', slug:'nodejs-rest-api', parentCategory:'Technology', subCategory:'Development', nestedSubCategory:'Backend', instructor:'Jonas Weber', status:'archived', enroll:'open', level:'Intermediate', students:203, sections:5, activities:20, rating:4.9, thumb:'#10B981', price:0, created:'Apr 15, 2024', tags:['Node.js','REST','Express'] },
];

const INIT_SECTIONS = (courseId) => [
  { id:101, courseId, title:'Getting Started', order:1, locked:false, activities:[
    { id:1001, sId:101, type:'video',  title:'Course Introduction',      dur:'8:32',  required:true,  pub:true  },
    { id:1002, sId:101, type:'pdf',    title:'Course Syllabus & Resources', dur:'—', required:true,  pub:true  },
  ]},
  { id:102, courseId, title:'Core Concepts', order:2, locked:false, activities:[
    { id:1003, sId:102, type:'video',  title:'Understanding the Basics',  dur:'14:20', required:true,  pub:true  },
    { id:1004, sId:102, type:'video',  title:'Deep Dive: Key Patterns',   dur:'22:10', required:true,  pub:true  },
    { id:1005, sId:102, type:'quiz',   title:'Module 1 Knowledge Check',  dur:'15 q',  required:true,  pub:true  },
  ]},
  { id:103, courseId, title:'Advanced Topics', order:3, locked:true, activities:[
    { id:1006, sId:103, type:'video',  title:'Advanced Techniques',       dur:'31:05', required:true,  pub:false },
    { id:1007, sId:103, type:'assign', title:'Project: Build Your Own',   dur:'—',     required:true,  pub:false },
    { id:1008, sId:103, type:'forum',  title:'Peer Review Discussion',    dur:'—',     required:false, pub:false },
  ]},
];

const INIT_STUDENTS = [
  { id:1, name:'Elena Vasquez',  email:'e.vasquez@edu.com', avatar:'EV', color:'#6366F1', enrolled:'Jan 15, 2024', progress:78, status:'active',   grade:'A-'   },
  { id:2, name:'Ryan Okafor',    email:'r.okafor@edu.com',  avatar:'RO', color:'#14B8A6', enrolled:'Jan 18, 2024', progress:100,status:'completed', grade:'A+'   },
  { id:3, name:'Mei Lin',        email:'mei.lin@edu.com',   avatar:'ML', color:'#F59E0B', enrolled:'Feb 2, 2024',  progress:42, status:'active',   grade:'C+'   },
  { id:4, name:'Ali Hassan',     email:'a.hassan@edu.com',  avatar:'AH', color:'#10B981', enrolled:'Feb 10, 2024', progress:5,  status:'inactive', grade:'—'    },
  { id:5, name:'Sophie Laurent', email:'s.laurent@edu.com', avatar:'SL', color:'#EC4899', enrolled:'Mar 3, 2024',  progress:91, status:'active',   grade:'A'    },
  { id:6, name:'Kenji Tanaka',   email:'k.tanaka@edu.com',  avatar:'KT', color:'#F97316', enrolled:'Mar 12, 2024', progress:63, status:'active',   grade:'B+'   },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const Av = ({ i, c, sz=32 }) => (
  <div style={{ width:sz, height:sz, borderRadius:'50%', background:c+'22', color:c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:sz*.34, fontWeight:700, border:`1.5px solid ${c}44`, flexShrink:0 }}>{i}</div>
);

const Dot = ({ color }) => <span style={{ width:7, height:7, borderRadius:'50%', background:color, display:'inline-block' }} />;

const statusBadge = (s) => ({
  published:<span className="badge b-green"><Dot color="var(--green)"/>Published</span>,
  draft:     <span className="badge b-amber">Draft</span>,
  archived:  <span className="badge b-gray">Archived</span>,
}[s] || null);

const levelBadge = (l) => ({
  Beginner:    <span className="badge b-green">Beginner</span>,
  Intermediate:<span className="badge b-amber">Intermediate</span>,
  Advanced:    <span className="badge b-red">Advanced</span>,
}[l] || null);

const enrollBadge = (e) => ({
  open:<span className="badge b-teal"><Ic n="unlock" s={10}/>Open</span>,
  paid:<span className="badge b-indigo"><Ic n="star" s={10}/>Paid</span>,
  key: <span className="badge b-amber"><Ic n="lock" s={10}/>Key</span>,
}[e] || null);

const ActTypePill = ({ type }) => {
  const t = actType(type);
  return <span className="act-type" style={{ background:t.bg, color:t.color }}><Ic n={t.icon} s={11}/>{t.label}</span>;
};

// ── Activity Add Modal ─────────────────────────────────────────────────────────
const ActivityModal = ({ sectionTitle, onSave, onClose, editing=null }) => {
  const [form, setForm] = useState(editing || { type:'video', title:'', dur:'', required:true, pub:false, desc:'' });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:520}}>
        <div className="mh">
          <div>
            <div style={{fontWeight:700,fontSize:15}}>{editing?'Edit Activity':'Add Activity'}</div>
            <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>Section: <strong style={{color:'var(--text2)'}}>{sectionTitle}</strong></div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><Ic n="x" s={15}/></button>
        </div>
        <div className="mb">
          {/* Type picker */}
          <div>
            <div className="label" style={{marginBottom:8}}>Activity Type</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
              {ACT_TYPES.map(t=>(
                <div key={t.id} onClick={()=>set('type',t.id)} style={{
                  padding:'10px 8px', borderRadius:8, cursor:'pointer', textAlign:'center',
                  border:`1.5px solid ${form.type===t.id?t.color+'66':'var(--border)'}`,
                  background:form.type===t.id?t.bg:'var(--bg2)',
                  transition:'all .15s'
                }}>
                  <div style={{color:t.color, marginBottom:4, display:'flex', justifyContent:'center'}}><Ic n={t.icon} s={17}/></div>
                  <div style={{fontSize:11,fontWeight:600,color:form.type===t.id?t.color:'var(--text3)'}}>{t.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="field">
            <label className="label">Title *</label>
            <input className="input" placeholder="e.g. Introduction to Variables" value={form.title} onChange={e=>set('title',e.target.value)}/>
          </div>
          <div className="field">
            <label className="label">Description</label>
            <textarea className="input textarea" placeholder="What will students learn in this activity?" value={form.desc} onChange={e=>set('desc',e.target.value)}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div className="field">
              <label className="label">Duration / Length</label>
              <input className="input" placeholder="e.g. 12:30 or 10 questions" value={form.dur} onChange={e=>set('dur',e.target.value)}/>
            </div>
            {(form.type==='video'||form.type==='pdf'||form.type==='audio') && (
              <div className="field">
                <label className="label">Upload File</label>
                <button className="btn btn-ghost" style={{width:'100%',justifyContent:'center'}}><Ic n="upload" s={14}/>Choose File</button>
              </div>
            )}
          </div>
          <div style={{display:'flex',gap:20}}>
            {[['required','Required to complete','Learners must finish this to progress'],['pub','Published','Visible to enrolled students']].map(([k,lbl,sub])=>(
              <div key={k} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:'var(--bg2)',borderRadius:8,border:'1px solid var(--border)'}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600}}>{lbl}</div>
                  <div style={{fontSize:11.5,color:'var(--text3)',marginTop:2}}>{sub}</div>
                </div>
                <div className={`toggle ${form[k]?'on':''}`} onClick={()=>set(k,!form[k])}/>
              </div>
            ))}
          </div>
        </div>
        <div className="mf">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-amber" onClick={()=>onSave(form)} disabled={!form.title.trim()}>
            <Ic n="check" s={14}/>{editing?'Save Changes':'Add Activity'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Section Edit Modal ─────────────────────────────────────────────────────────
const SectionModal = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState(initial || {title:'',desc:'',locked:false});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:440}}>
        <div className="mh">
          <div style={{fontWeight:700,fontSize:15}}>{initial?'Edit Section':'Add Section'}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><Ic n="x" s={15}/></button>
        </div>
        <div className="mb">
          <div className="field"><label className="label">Section Title *</label><input className="input" placeholder="e.g. Module 1: Foundations" value={form.title} onChange={e=>set('title',e.target.value)} autoFocus/></div>
          <div className="field"><label className="label">Description</label><textarea className="input textarea" style={{minHeight:70}} placeholder="What's covered in this section?" value={form.desc} onChange={e=>set('desc',e.target.value)}/></div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:'var(--bg2)',borderRadius:8,border:'1px solid var(--border)'}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:6}}><Ic n="lock" s={13}/>Locked Section</div>
              <div style={{fontSize:11.5,color:'var(--text3)',marginTop:2}}>Students must complete prerequisite sections first</div>
            </div>
            <div className={`toggle ${form.locked?'on':''}`} onClick={()=>set('locked',!form.locked)}/>
          </div>
        </div>
        <div className="mf">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-amber" onClick={()=>onSave(form)} disabled={!form.title.trim()}><Ic n="check" s={14}/>{initial?'Save Section':'Add Section'}</button>
        </div>
      </div>
    </div>
  );
};

// ── Enroll Student Modal ───────────────────────────────────────────────────────
const EnrollModal = ({ onSave, onClose }) => {
  const [tab, setTab] = useState('manual');
  const [email, setEmail] = useState('');
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:460}}>
        <div className="mh">
          <div style={{fontWeight:700,fontSize:15}}>Enroll Students</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><Ic n="x" s={15}/></button>
        </div>
        <div className="mb">
          <div className="tabs" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            {['manual','bulk','link'].map(t=><div key={t} className={`tab ${tab===t?'on':''}`} onClick={()=>setTab(t)} style={{textTransform:'capitalize'}}>{t==='link'?'Invite Link':t==='bulk'?'Bulk CSV':t.charAt(0).toUpperCase()+t.slice(1)}</div>)}
          </div>
          {tab==='manual'&&(
            <>
              <div className="field"><label className="label">Student Email *</label>
                <div className="irow"><span className="ico"><Ic n="user" s={14}/></span><input className="input" placeholder="student@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div className="field"><label className="label">Role</label>
                  <select className="select"><option>Student</option><option>Teaching Assistant</option><option>Auditor</option></select>
                </div>
                <div className="field"><label className="label">Access Expires</label><input className="input" type="date"/></div>
              </div>
              <div style={{padding:'12px 14px',background:'var(--bg2)',borderRadius:8,border:'1px solid var(--border)',fontSize:12.5,color:'var(--text2)'}}>
                <Ic n="info" s={13}/> An invitation email will be sent with login instructions.
              </div>
            </>
          )}
          {tab==='bulk'&&(
            <div style={{textAlign:'center',padding:'28px 20px',background:'var(--bg2)',borderRadius:10,border:'2px dashed var(--border2)'}}>
              <Ic n="upload" s={28}/>
              <div style={{marginTop:10,fontWeight:600}}>Drop CSV file here or click to upload</div>
              <div style={{fontSize:12,color:'var(--text3)',marginTop:4}}>CSV must have: name, email, role columns</div>
              <button className="btn btn-ghost btn-sm" style={{marginTop:14}}>Download Template</button>
            </div>
          )}
          {tab==='link'&&(
            <div>
              <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:'11px 14px',fontFamily:'var(--mono)',fontSize:12.5,color:'var(--teal)',wordBreak:'break-all'}}>
                https://acadlms.dev/enroll/advanced-react-ts?token=xK9mP2
              </div>
              <div style={{display:'flex',gap:10,marginTop:12}}>
                <button className="btn btn-ghost btn-sm"><Ic n="copy" s={13}/>Copy Link</button>
                <button className="btn btn-danger btn-sm"><Ic n="x" s={13}/>Revoke</button>
                <div className="field" style={{flex:1}}>
                  <select className="select" style={{fontSize:12.5,padding:'8px 11px'}}>
                    <option>Expires: Never</option><option>Expires: 24 hours</option><option>Expires: 7 days</option><option>Expires: 30 days</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mf">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-amber" onClick={()=>onSave({email})}><Ic n="users" s={14}/>Enroll</button>
        </div>
      </div>
    </div>
  );
};

// ── Course Card ────────────────────────────────────────────────────────────────
const CourseCard = ({ course, onOpen, onEdit, onDelete }) => (
  <div className="card" style={{padding:0,overflow:'hidden',cursor:'pointer',transition:'all .18s',display:'flex',flexDirection:'column'}}
    onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.transform='translateY(-2px)'}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='translateY(0)'}}>
    {/* Thumb */}
    <div style={{height:110,background:`linear-gradient(135deg,${course.thumb}22,${course.thumb}44)`,position:'relative',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center'}}
      onClick={()=>onOpen(course)}>
      <div style={{width:52,height:52,borderRadius:14,background:course.thumb+'33',border:`2px solid ${course.thumb}55`,display:'flex',alignItems:'center',justifyContent:'center',color:course.thumb}}>
        <Ic n="book" s={24}/>
      </div>
      <div style={{position:'absolute',top:10,right:10}}>{statusBadge(course.status)}</div>
      <div style={{position:'absolute',top:10,left:10}}>{enrollBadge(course.enroll)}</div>
    </div>
    <div style={{padding:'14px 16px',flex:1,display:'flex',flexDirection:'column',gap:6}} onClick={()=>onOpen(course)}>
      <div style={{fontSize:12,color:'var(--text3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
        {course.parentCategory} <span style={{opacity:.5}}>›</span> {course.subCategory} <span style={{opacity:.5}}>›</span> {course.nestedSubCategory}
      </div>
      <div style={{fontWeight:700,fontSize:14.5,lineHeight:1.3}}>{course.title}</div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:2}}>
        {course.tags.map(t=><span key={t} style={{fontSize:11,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:4,padding:'2px 7px',color:'var(--text3)'}}>{t}</span>)}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginTop:4}}>
        {levelBadge(course.level)}
        {course.rating>0&&<span style={{fontSize:12,color:'var(--amber)',display:'flex',alignItems:'center',gap:3}}><Ic n="star" s={11}/>  {course.rating}</span>}
        {course.price===0?<span style={{fontSize:12,color:'var(--green)',marginLeft:'auto',fontWeight:700}}>FREE</span>:<span style={{fontSize:12,color:'var(--text2)',marginLeft:'auto',fontFamily:'var(--mono)'}}>$</span>}
        {course.price>0&&<span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:'var(--mono)',marginLeft:-6}}>{course.price}</span>}
      </div>
    </div>
    <div style={{padding:'10px 16px',borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',gap:12}}>
      <span style={{fontSize:12,color:'var(--text3)',display:'flex',alignItems:'center',gap:4}}><Ic n="users" s={12}/>{course.students}</span>
      <span style={{fontSize:12,color:'var(--text3)',display:'flex',alignItems:'center',gap:4}}><Ic n="layers" s={12}/>{course.sections} sections</span>
      <div style={{marginLeft:'auto',display:'flex',gap:6}}>
        <button className="btn btn-ghost btn-xs" onClick={e=>{e.stopPropagation();onEdit(course)}}><Ic n="edit" s={12}/></button>
        <button className="btn btn-danger btn-xs" onClick={e=>{e.stopPropagation();onDelete(course.id)}}><Ic n="trash" s={12}/></button>
      </div>
    </div>
  </div>
);

// ── Course Builder (sections + activities) ────────────────────────────────────
const CourseBuilder = ({ course, onBack }) => {
  const [sections, setSections] = useState(INIT_SECTIONS(course.id));
  const [collapsed, setCollapsed] = useState({});
  const [actModal, setActModal] = useState(null); // {sId, editing?}
  const [secModal, setSecModal] = useState(null); // null | 'add' | section obj
  const [activeTab, setActiveTab] = useState('builder');
  const [students, setStudents] = useState(INIT_STUDENTS);
  const [enrollModal, setEnrollModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selStudents, setSelStudents] = useState([]);
  const [courseForm, setCourseForm] = useState({...course});
  const setF = (k,v) => setCourseForm(f=>({...f,[k]:v}));
  const [saved, setSaved] = useState(false);

  const toggleCollapse = id => setCollapsed(c=>({...c,[id]:!c[id]}));

  const addSection = (form) => {
    setSections(s=>[...s, { id:Date.now(), courseId:course.id, title:form.title, order:s.length+1, locked:form.locked, activities:[] }]);
    setSecModal(null);
  };
  const editSection = (form) => {
    setSections(s=>s.map(x=>x.id===secModal.id?{...x,...form}:x));
    setSecModal(null);
  };
  const deleteSection = id => setSections(s=>s.filter(x=>x.id!==id));

  const addActivity = (sId, form) => {
    const t = actType(form.type);
    setSections(s=>s.map(sec=>sec.id!==sId?sec:{...sec,activities:[...sec.activities,{id:Date.now(),sId,...form,title:form.title}]}));
    setActModal(null);
  };
  const editActivity = (form) => {
    setSections(s=>s.map(sec=>({...sec,activities:sec.activities.map(a=>a.id===actModal.editing.id?{...a,...form}:a)})));
    setActModal(null);
  };
  const deleteActivity = (sId, aId) => setSections(s=>s.map(sec=>sec.id!==sId?sec:{...sec,activities:sec.activities.filter(a=>a.id!==aId)}));
  const togglePub = (sId, aId) => setSections(s=>s.map(sec=>sec.id!==sId?sec:{...sec,activities:sec.activities.map(a=>a.id===aId?{...a,pub:!a.pub}:a)}));

  const totalActs = sections.reduce((n,s)=>n+s.activities.length,0);
  const pubActs   = sections.reduce((n,s)=>n+s.activities.filter(a=>a.pub).length,0);

  const filteredStudents = students.filter(s=>{
    const q=search.toLowerCase(); return s.name.toLowerCase().includes(q)||s.email.toLowerCase().includes(q);
  });

  const toggleSelect = id => setSelStudents(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const toggleSelectAll = () => setSelStudents(selStudents.length===filteredStudents.length?[]:filteredStudents.map(s=>s.id));

  const enrollSave = ({email}) => {
    if(!email) return;
    const colors=['#6366F1','#14B8A6','#F59E0B','#10B981'];
    const init=email.slice(0,2).toUpperCase();
    setStudents(s=>[...s,{id:Date.now(),name:email.split('@')[0],email,avatar:init,color:colors[students.length%colors.length],enrolled:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),progress:0,status:'active',grade:'—'}]);
    setEnrollModal(false);
  };

  const saveSettings = () => { setSaved(true); setTimeout(()=>setSaved(false),2500); };

  const statusColor = { active:'var(--green)', completed:'var(--indigo)', inactive:'var(--text3)' };

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden'}}>
      {/* Top bar */}
      <div style={{background:'var(--card)',borderBottom:'1px solid var(--border)',padding:'0 24px',height:56,display:'flex',alignItems:'center',gap:16,flexShrink:0}}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}><Ic n="back" s={14}/>Courses</button>
        <div style={{width:1,height:24,background:'var(--border)'}}/>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:10,height:10,borderRadius:'50%',background:course.thumb}}/>
          <span style={{fontWeight:700,fontSize:14.5}}>{course.title}</span>
        </div>
        {statusBadge(course.status)}
        <div style={{marginLeft:'auto',display:'flex',gap:8,alignItems:'center'}}>
          <button className="btn btn-ghost btn-sm"><Ic n="eye" s={13}/>Preview</button>
          <button className="btn btn-ghost btn-sm"><Ic n="copy" s={13}/>Duplicate</button>
          <button className="btn btn-amber btn-sm"><Ic n="check" s={13}/>Publish</button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{background:'var(--card)',borderBottom:'1px solid var(--border)',padding:'0 24px',display:'flex',gap:4,flexShrink:0}}>
        {[['builder','Course Builder'],['enrollment','Enrollment'],['settings','Settings']].map(([id,lbl])=>(
          <div key={id} onClick={()=>setActiveTab(id)} style={{padding:'12px 16px',fontSize:13,fontWeight:600,cursor:'pointer',borderBottom:`2px solid ${activeTab===id?'var(--amber)':'transparent'}`,color:activeTab===id?'var(--amber)':'var(--text2)',transition:'all .15s'}}>{lbl}</div>
        ))}
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:'auto',padding:24}} className="anim-in">

        {/* ── BUILDER TAB ── */}
        {activeTab==='builder'&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:20,maxWidth:1100}}>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {/* Stats bar */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:4}}>
                {[
                  {label:'Sections',   val:sections.length,  color:'var(--indigo)'},
                  {label:'Activities', val:totalActs,         color:'var(--amber)'},
                  {label:'Published',  val:pubActs,           color:'var(--green)'},
                  {label:'Locked',     val:sections.filter(s=>s.locked).length, color:'var(--red)'},
                ].map(s=>(
                  <div className="stat" key={s.label}>
                    <div style={{fontSize:10,color:'var(--text3)',fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'}}>{s.label}</div>
                    <div style={{fontSize:26,fontWeight:800,color:s.color,fontFamily:'var(--mono)'}}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Section list */}
              {sections.map((sec, si)=>(
                <div key={sec.id} className="card" style={{padding:0,overflow:'hidden'}} >
                  {/* Section header */}
                  <div style={{display:'flex',alignItems:'center',gap:10,padding:'13px 16px',background:'var(--card2)',borderBottom:collapsed[sec.id]?'none':'1px solid var(--border)'}}>
                    <span className="drag-handle"><Ic n="drag" s={14}/></span>
                    <div onClick={()=>toggleCollapse(sec.id)} style={{flex:1,cursor:'pointer',display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontSize:11,fontWeight:700,color:'var(--text3)',fontFamily:'var(--mono)',minWidth:20}}>{String(si+1).padStart(2,'0')}</span>
                      <span style={{fontWeight:700,fontSize:14}}>{sec.title}</span>
                      <span style={{fontSize:12,color:'var(--text3)'}}>{sec.activities.length} activities</span>
                      {sec.locked&&<span className="badge b-red" style={{fontSize:10}}><Ic n="lock" s={9}/>Locked</span>}
                    </div>
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      <button className="btn btn-ghost btn-xs" onClick={()=>setSecModal(sec)}><Ic n="edit" s={12}/></button>
                      <button className="btn btn-danger btn-xs" onClick={()=>deleteSection(sec.id)}><Ic n="trash" s={12}/></button>
                      <div style={{color:'var(--text3)',transition:'transform .2s',transform:collapsed[sec.id]?'rotate(-90deg)':'rotate(0deg)'}} onClick={()=>toggleCollapse(sec.id)}><Ic n="chevron" s={15}/></div>
                    </div>
                  </div>

                  {/* Activities */}
                  {!collapsed[sec.id]&&(
                    <div>
                      {sec.activities.map((act,ai)=>{
                        const t=actType(act.type);
                        return (
                          <div key={act.id} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 16px',borderBottom:'1px solid var(--border)',transition:'background .14s'}}
                            onMouseEnter={e=>e.currentTarget.style.background='var(--card3)'}
                            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                            <span className="drag-handle" style={{opacity:.5}}><Ic n="drag" s={12}/></span>
                            <div style={{width:30,height:30,borderRadius:8,background:t.bg,display:'flex',alignItems:'center',justifyContent:'center',color:t.color,flexShrink:0}}><Ic n={t.icon} s={14}/></div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontWeight:600,fontSize:13.5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{act.title}</div>
                              <div style={{display:'flex',gap:8,marginTop:3,alignItems:'center'}}>
                                <ActTypePill type={act.type}/>
                                {act.dur&&<span style={{fontSize:11.5,color:'var(--text3)',display:'flex',alignItems:'center',gap:3}}><Ic n="clock" s={10}/>{act.dur}</span>}
                                {act.required&&<span className="badge b-amber" style={{fontSize:10,padding:'1px 7px'}}>Required</span>}
                              </div>
                            </div>
                            <div style={{display:'flex',gap:8,alignItems:'center'}}>
                              <div style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:act.pub?'var(--green)':'var(--text3)'}}>
                                <div className={`toggle ${act.pub?'on':''}`} style={{width:32,height:18}} onClick={()=>togglePub(sec.id,act.id)}/>
                                <span style={{fontSize:11,minWidth:22}}>{act.pub?'Live':'Draft'}</span>
                              </div>
                              <button className="btn btn-ghost btn-xs" onClick={()=>setActModal({sId:sec.id,editing:act})}><Ic n="edit" s={12}/></button>
                              <button className="btn btn-danger btn-xs" onClick={()=>deleteActivity(sec.id,act.id)}><Ic n="trash" s={12}/></button>
                            </div>
                          </div>
                        );
                      })}
                      {/* Add activity */}
                      <div style={{padding:'10px 16px'}}>
                        <button className="btn btn-ghost btn-xs" style={{width:'100%',justifyContent:'center',borderStyle:'dashed'}} onClick={()=>setActModal({sId:sec.id})}>
                          <Ic n="plus" s={13}/>Add Activity to "{sec.title}"
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add section */}
              <button className="btn btn-ghost" style={{justifyContent:'center',borderStyle:'dashed',padding:'14px'}} onClick={()=>setSecModal('add')}>
                <Ic n="plus" s={15}/>Add New Section
              </button>
            </div>

            {/* Right panel: activity types reference */}
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div className="card">
                <div style={{fontWeight:700,fontSize:13.5,marginBottom:12}}>Activity Types</div>
                <div style={{display:'flex',flexDirection:'column',gap:7}}>
                  {ACT_TYPES.map(t=>(
                    <div key={t.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:8,background:'var(--bg2)',border:'1px solid var(--border)'}}>
                      <div style={{width:28,height:28,borderRadius:7,background:t.bg,display:'flex',alignItems:'center',justifyContent:'center',color:t.color,flexShrink:0}}><Ic n={t.icon} s={13}/></div>
                      <span style={{fontSize:13,fontWeight:600}}>{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div style={{fontWeight:700,fontSize:13.5,marginBottom:10}}>Completion Settings</div>
                {[['Require activities in order','Enforce sequential learning'],['Show progress bar','Display % complete to students'],['Certificate on completion','Auto-issue on 100%']].map(([lbl,sub])=>(
                  <div key={lbl} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--border)'}}>
                    <div><div style={{fontSize:12.5,fontWeight:600}}>{lbl}</div><div style={{fontSize:11,color:'var(--text3)',marginTop:1}}>{sub}</div></div>
                    <div className="toggle on"/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ENROLLMENT TAB ── */}
        {activeTab==='enrollment'&&(
          <div style={{display:'flex',flexDirection:'column',gap:16,maxWidth:1000}}>
            {/* Stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
              {[
                {label:'Enrolled',   val:students.length,                              color:'var(--amber)'},
                {label:'Active',     val:students.filter(s=>s.status==='active').length, color:'var(--green)'},
                {label:'Completed',  val:students.filter(s=>s.status==='completed').length, color:'var(--indigo)'},
                {label:'Avg Progress', val:Math.round(students.reduce((n,s)=>n+s.progress,0)/students.length)+'%', color:'var(--teal)'},
              ].map(s=>(
                <div className="stat" key={s.label}>
                  <div style={{fontSize:10,color:'var(--text3)',fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'}}>{s.label}</div>
                  <div style={{fontSize:26,fontWeight:800,color:s.color,fontFamily:'var(--mono)'}}>{s.val}</div>
                </div>
              ))}
            </div>
            {/* Toolbar */}
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:0,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,flex:1}}>
                <span style={{padding:'0 12px',color:'var(--text3)'}}><Ic n="search" s={14}/></span>
                <input style={{background:'none',border:'none',padding:'9px 10px',color:'var(--text)',fontSize:13.5,outline:'none',flex:1}} placeholder="Search students…" value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <select className="select" style={{width:150,fontSize:13}}>
                <option>All statuses</option><option>Active</option><option>Completed</option><option>Inactive</option>
              </select>
              {selStudents.length>0&&<button className="btn btn-danger btn-sm"><Ic n="trash" s={13}/>Remove ({selStudents.length})</button>}
              <button className="btn btn-amber btn-sm" onClick={()=>setEnrollModal(true)}><Ic n="plus" s={14}/>Enroll Student</button>
            </div>
            {/* Table */}
            <div className="tbl-wrap">
              <table>
                <thead><tr>
                  <th><input type="checkbox" checked={selStudents.length===filteredStudents.length&&filteredStudents.length>0} onChange={toggleSelectAll} style={{accentColor:'var(--amber)',width:14,height:14,cursor:'pointer'}}/></th>
                  <th>Student</th><th>Progress</th><th>Status</th><th>Grade</th><th>Enrolled</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {filteredStudents.map(s=>(
                    <tr key={s.id}>
                      <td><input type="checkbox" checked={selStudents.includes(s.id)} onChange={()=>toggleSelect(s.id)} style={{accentColor:'var(--amber)',width:14,height:14,cursor:'pointer'}}/></td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <Av i={s.avatar} c={s.color}/>
                          <div>
                            <div style={{fontWeight:600,fontSize:13.5}}>{s.name}</div>
                            <div style={{fontSize:12,color:'var(--text3)',fontFamily:'var(--mono)'}}>{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{minWidth:160}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div className="prog" style={{flex:1}}><div className="prog-bar" style={{width:s.progress+'%',background:s.progress===100?'var(--green)':'var(--amber)'}}/></div>
                          <span style={{fontSize:12,fontWeight:700,fontFamily:'var(--mono)',color:s.progress===100?'var(--green)':'var(--text2)',minWidth:30}}>{s.progress}%</span>
                        </div>
                      </td>
                      <td><span style={{fontSize:12,fontWeight:600,color:statusColor[s.status],display:'flex',alignItems:'center',gap:4}}><Dot color={statusColor[s.status]}/>{s.status}</span></td>
                      <td><span style={{fontFamily:'var(--mono)',fontSize:13,fontWeight:700,color:s.grade==='—'?'var(--text3)':'var(--text)'}}>{s.grade}</span></td>
                      <td style={{fontSize:12.5,color:'var(--text3)'}}>{s.enrolled}</td>
                      <td>
                        <div style={{display:'flex',gap:6}}>
                          <button className="btn btn-ghost btn-xs"><Ic n="eye" s={12}/>View</button>
                          <button className="btn btn-danger btn-xs" onClick={()=>setStudents(st=>st.filter(x=>x.id!==s.id))}><Ic n="trash" s={12}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Enrollment settings */}
            <div className="card" style={{marginTop:4}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>Enrollment Settings</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
                <div className="field"><label className="label">Enrollment Type</label>
                  <select className="select" value={courseForm.enroll} onChange={e=>setF('enroll',e.target.value)}>
                    <option value="open">Open Enrollment</option><option value="key">Enrollment Key</option><option value="paid">Paid</option><option value="invite">Invite Only</option>
                  </select>
                </div>
                {courseForm.enroll==='key'&&<div className="field"><label className="label">Enrollment Key</label><input className="input" placeholder="e.g. SECRET2024" defaultValue="REACT2024"/></div>}
                {courseForm.enroll==='paid'&&<div className="field"><label className="label">Course Price ($)</label><input className="input" type="number" value={courseForm.price} onChange={e=>setF('price',Number(e.target.value))}/></div>}
                <div className="field"><label className="label">Max Enrollment</label><input className="input" type="number" placeholder="Unlimited" defaultValue="500"/></div>
                <div className="field"><label className="label">Enrollment Opens</label><input className="input" type="date"/></div>
                <div className="field"><label className="label">Enrollment Closes</label><input className="input" type="date"/></div>
                <div className="field"><label className="label">Course Duration</label><input className="input" placeholder="e.g. 12 weeks" defaultValue="12 weeks"/></div>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab==='settings'&&(
          <div style={{maxWidth:680,display:'flex',flexDirection:'column',gap:14}}>
            {saved&&<div style={{padding:'12px 16px',background:'rgba(16,185,129,.1)',border:'1px solid rgba(16,185,129,.2)',borderRadius:8,fontSize:13,color:'var(--green)',display:'flex',alignItems:'center',gap:8}}><Ic n="check" s={14}/>Course settings saved successfully!</div>}
            <div className="card">
              <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>Basic Information</div>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <div className="field"><label className="label">Course Title *</label><input className="input" value={courseForm.title} onChange={e=>setF('title',e.target.value)}/></div>
                <div className="field"><label className="label">URL Slug</label>
                  <div className="irow"><span className="ico" style={{fontSize:12,color:'var(--teal)',fontFamily:'var(--mono)',left:10,width:120,overflow:'visible',whiteSpace:'nowrap'}}>acadlms.dev/c/</span>
                    <input className="input" value={courseForm.slug} onChange={e=>setF('slug',e.target.value)} style={{paddingLeft:140}}/>
                  </div>
                </div>
                <div className="field"><label className="label">Short Description</label><textarea className="input textarea" style={{minHeight:80}} placeholder="What will students learn? (shown in course card)"/></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
                  <div className="field"><label className="label">Parent Category</label>
                    <select className="select" value={courseForm.parentCategory || ''} onChange={e => {
                      const newParent = e.target.value;
                      const newSub = Object.keys(COURSE_CATEGORIES[newParent] || {})[0] || '';
                      const newNested = (COURSE_CATEGORIES[newParent]?.[newSub] || [])[0] || '';
                      setCourseForm(f=>({...f, parentCategory: newParent, subCategory: newSub, nestedSubCategory: newNested}));
                    }}>
                      {Object.keys(COURSE_CATEGORIES).map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="field"><label className="label">Subcategory</label>
                    <select className="select" value={courseForm.subCategory || ''} onChange={e => {
                      const newSub = e.target.value;
                      const newNested = (COURSE_CATEGORIES[courseForm.parentCategory]?.[newSub] || [])[0] || '';
                      setCourseForm(f=>({...f, subCategory: newSub, nestedSubCategory: newNested}));
                    }}>
                      {Object.keys(COURSE_CATEGORIES[courseForm.parentCategory] || {}).map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="field"><label className="label">Nested Subcategory</label>
                    <select className="select" value={courseForm.nestedSubCategory || ''} onChange={e=>setF('nestedSubCategory',e.target.value)}>
                      {(COURSE_CATEGORIES[courseForm.parentCategory]?.[courseForm.subCategory] || []).map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginTop:14}}>
                  <div className="field"><label className="label">Level</label>
                    <select className="select" value={courseForm.level} onChange={e=>setF('level',e.target.value)}>
                      {['Beginner','Intermediate','Advanced'].map(l=><option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="field"><label className="label">Language</label>
                    <select className="select">
                      {['English','Spanish','French','German','Japanese'].map(l=><option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field"><label className="label">Tags (comma separated)</label><input className="input" defaultValue={courseForm.tags.join(', ')}/></div>
              </div>
            </div>
            <div className="card">
              <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>Visibility & Access</div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {[
                  ['Course Visible','Students can find and view this course in catalog'],
                  ['Guest Preview','Allow non-enrolled users to preview first section'],
                  ['Discussion Forums','Enable course-wide discussion boards'],
                  ['Completion Certificate','Issue certificate when course is 100% complete'],
                ].map(([lbl,sub])=>(
                  <div key={lbl} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 14px',background:'var(--bg2)',borderRadius:8,border:'1px solid var(--border)'}}>
                    <div><div style={{fontWeight:600,fontSize:13.5}}>{lbl}</div><div style={{fontSize:12,color:'var(--text3)',marginTop:1}}>{sub}</div></div>
                    <div className="toggle on"/>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button className="btn btn-ghost">Reset</button>
              <button className="btn btn-amber" onClick={saveSettings}><Ic n="check" s={14}/>Save Settings</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {actModal&&(
        <ActivityModal
          sectionTitle={sections.find(s=>s.id===actModal.sId)?.title||''}
          editing={actModal.editing||null}
          onSave={form=>actModal.editing?editActivity(form):addActivity(actModal.sId,form)}
          onClose={()=>setActModal(null)}
        />
      )}
      {secModal&&(
        <SectionModal
          initial={typeof secModal==='object'?secModal:null}
          onSave={typeof secModal==='object'?editSection:addSection}
          onClose={()=>setSecModal(null)}
        />
      )}
      {enrollModal&&<EnrollModal onSave={enrollSave} onClose={()=>setEnrollModal(false)}/>}
    </div>
  );
};

// ── Add/Edit Course Modal ──────────────────────────────────────────────────────
const CourseFormModal = ({ initial, onSave, onClose }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState(initial || { title:'',slug:'',parentCategory:'Technology',subCategory:'Development',nestedSubCategory:'Frontend',instructor:'',level:'Beginner',status:'draft',enroll:'open',price:0,tags:'' });
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const COLORS=['#6366F1','#14B8A6','#F59E0B','#10B981','#EF4444','#EC4899','#F97316','#3B82F6'];
  const [tab, setTab] = useState('info');

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:580}}>
        <div className="mh">
          <div>
            <div style={{fontWeight:700,fontSize:15}}>{isEdit?`Edit: ${initial.title}`:'Create New Course'}</div>
            <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>{isEdit?'Update course details':'Set up your new course — you can add content after creation'}</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><Ic n="x" s={15}/></button>
        </div>
        {/* Mini tabs */}
        <div style={{padding:'0 24px',background:'var(--bg2)',borderBottom:'1px solid var(--border)',display:'flex',gap:0}}>
          {[['info','Basic Info'],['access','Access & Pricing']].map(([id,lbl])=>(
            <div key={id} onClick={()=>setTab(id)} style={{padding:'11px 16px',fontSize:13,fontWeight:600,cursor:'pointer',borderBottom:`2px solid ${tab===id?'var(--amber)':'transparent'}`,color:tab===id?'var(--amber)':'var(--text2)',transition:'all .15s'}}>{lbl}</div>
          ))}
        </div>
        <div className="mb">
          {tab==='info'&&<>
            <div className="field"><label className="label">Course Title *</label><input className="input" placeholder="e.g. Complete JavaScript Bootcamp" value={form.title} onChange={e=>{set('title',e.target.value);set('slug',e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''))}}/></div>
            <div className="field"><label className="label">URL Slug</label><input className="input" value={form.slug} onChange={e=>set('slug',e.target.value)}/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
              <div className="field"><label className="label">Parent Category</label>
                <select className="select" value={form.parentCategory || ''} onChange={e => {
                  const newParent = e.target.value;
                  const newSub = Object.keys(COURSE_CATEGORIES[newParent] || {})[0] || '';
                  const newNested = (COURSE_CATEGORIES[newParent]?.[newSub] || [])[0] || '';
                  setForm(f=>({...f, parentCategory: newParent, subCategory: newSub, nestedSubCategory: newNested}));
                }}>
                  {Object.keys(COURSE_CATEGORIES).map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field"><label className="label">Subcategory</label>
                <select className="select" value={form.subCategory || ''} onChange={e => {
                  const newSub = e.target.value;
                  const newNested = (COURSE_CATEGORIES[form.parentCategory]?.[newSub] || [])[0] || '';
                  setForm(f=>({...f, subCategory: newSub, nestedSubCategory: newNested}));
                }}>
                  {Object.keys(COURSE_CATEGORIES[form.parentCategory] || {}).map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field"><label className="label">Nested Category</label>
                <select className="select" value={form.nestedSubCategory || ''} onChange={e=>set('nestedSubCategory',e.target.value)}>
                  {(COURSE_CATEGORIES[form.parentCategory]?.[form.subCategory] || []).map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginTop:14}}>
              <div className="field"><label className="label">Instructor</label><input className="input" placeholder="Instructor name" value={form.instructor} onChange={e=>set('instructor',e.target.value)}/></div>
              <div className="field"><label className="label">Difficulty Level</label>
                <select className="select" value={form.level} onChange={e=>set('level',e.target.value)}>
                  {['Beginner','Intermediate','Advanced'].map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="field"><label className="label">Status</label>
                <select className="select" value={form.status} onChange={e=>set('status',e.target.value)}>
                  <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="field"><label className="label">Tags</label><input className="input" placeholder="React, TypeScript, Hooks" value={form.tags} onChange={e=>set('tags',e.target.value)}/></div>
            <div className="field">
              <label className="label">Course Color</label>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {COLORS.map(c=>(
                  <div key={c} onClick={()=>set('thumb',c)} style={{width:28,height:28,borderRadius:8,background:c,cursor:'pointer',border:`3px solid ${form.thumb===c?c:'transparent'}`,outline:`2px solid ${form.thumb===c?c+'66':'transparent'}`,transition:'all .14s'}}/>
                ))}
              </div>
            </div>
          </>}
          {tab==='access'&&<>
            <div className="field"><label className="label">Enrollment Type</label>
              <select className="select" value={form.enroll} onChange={e=>set('enroll',e.target.value)}>
                <option value="open">Open — Anyone can enroll</option>
                <option value="key">Enrollment Key — Require a passphrase</option>
                <option value="paid">Paid — Require payment</option>
                <option value="invite">Invite Only — Manual enrollment</option>
              </select>
            </div>
            {form.enroll==='key'&&<div className="field"><label className="label">Enrollment Key</label><input className="input" placeholder="e.g. MYCLASS2024"/></div>}
            {form.enroll==='paid'&&<div className="field"><label className="label">Price (USD)</label><input className="input" type="number" min="0" value={form.price} onChange={e=>set('price',Number(e.target.value))}/></div>}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <div className="field"><label className="label">Max Students</label><input className="input" type="number" placeholder="Unlimited"/></div>
              <div className="field"><label className="label">Course Format</label>
                <select className="select"><option>Topics-based</option><option>Weekly</option><option>Social</option></select>
              </div>
            </div>
            {[['Guest Preview','Non-enrolled users can preview first section'],['Require Completion Order','Students must do activities in order']].map(([lbl,sub])=>(
              <div key={lbl} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 14px',background:'var(--bg2)',borderRadius:8,border:'1px solid var(--border)'}}>
                <div><div style={{fontSize:13.5,fontWeight:600}}>{lbl}</div><div style={{fontSize:12,color:'var(--text3)',marginTop:1}}>{sub}</div></div>
                <div className="toggle"/>
              </div>
            ))}
          </>}
        </div>
        <div className="mf">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-amber" onClick={()=>onSave({...form,tags:typeof form.tags==='string'?form.tags.split(',').map(t=>t.trim()).filter(Boolean):form.tags})} disabled={!form.title.trim()}>
            <Ic n="check" s={14}/>{isEdit?'Save Changes':'Create Course'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Course List ────────────────────────────────────────────────────────────────
// ── Preview Player ────────────────────────────────────────────────────────────
const PreviewPlayer = ({ course, onBack }) => {
  const sections = INIT_SECTIONS(course.id);
  return (
    <div style={{ background: 'var(--bg)', height: '100%', display: 'flex', flexDirection: 'column' }} className="anim-in">
      <div style={{ height: 60, background: 'var(--card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16 }}>
        <button className="btn btn-ghost btn-icon" onClick={onBack}><Ic n="back" s={16}/></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)' }}>PREVIEW MODE</div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{course.title}</div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div style={{ textAlign: 'center' }}>
             <Ic n="video" s={64} style={{ color: 'var(--border3)', marginBottom: 20 }} />
             <div style={{ color: 'var(--text3)', fontWeight: 600 }}>Video Content Mockup</div>
           </div>
        </div>
        <div style={{ width: 320, background: 'var(--card)', borderLeft: '1px solid var(--border)', overflowY: 'auto' }}>
          <div style={{ padding: 16, borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: 14 }}>Curriculum</div>
          {sections.map((s, i) => (
            <div key={s.id}>
              <div style={{ padding: '10px 16px', background: 'var(--bg2)', fontSize: 11, fontWeight: 700, color: 'var(--text3)' }}>{i+1}. {s.title}</div>
              {s.activities.map(a => (
                <div key={a.id} style={{ padding: '10px 16px', fontSize: 13, borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                  <Ic n={actType(a.type).icon} s={14} style={{ color: actType(a.type).color }} />
                  {a.title}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CourseList = () => {
  const [courses, setCourses] = useState(INIT_COURSES);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('grid');
  const [modal, setModal] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'builder', 'preview'

  if (viewMode === 'preview' && activeCourse) {
    return <PreviewPlayer course={activeCourse} onBack={() => { setViewMode('list'); setActiveCourse(null); }} />;
  }

  if (viewMode === 'builder' && activeCourse) {
    return <CourseBuilder course={activeCourse} onBack={() => { setViewMode('list'); setActiveCourse(null); }} />;
  }

  const filtered = courses.filter(c => {
    const q=search.toLowerCase();
    const catStr = [c.parentCategory, c.subCategory, c.nestedSubCategory].join(" ").toLowerCase();
    const match=c.title.toLowerCase().includes(q)||catStr.includes(q)||c.instructor.toLowerCase().includes(q);
    const f=filter==='all'||c.status===filter;
    return match&&f;
  });

  const saveCourse = (form) => {
    if(modal==='add') {
      setCourses(c=>[...c,{...form,id:Date.now(),students:0,sections:0,activities:0,rating:0,created:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}]);
    } else {
      setCourses(c=>c.map(x=>x.id===modal.id?{...x,...form}:x));
    }
    setModal(null);
  };

  return (
    <div style={{padding:'22px 26px',display:'flex',flexDirection:'column',gap:18, height: '100%'}}>
      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {[
          {label:'Total Courses', val:courses.length,                                  color:'var(--amber)'},
          {label:'Published',     val:courses.filter(c=>c.status==='published').length, color:'var(--green)'},
          {label:'Total Students',val:courses.reduce((n,c)=>n+c.students,0),           color:'var(--indigo)'},
          {label:'Drafts',        val:courses.filter(c=>c.status==='draft').length,     color:'var(--text2)'},
        ].map(s=>(
          <div className="stat" key={s.label}>
            <div style={{fontSize:10,color:'var(--text3)',fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'}}>{s.label}</div>
            <div style={{fontSize:28,fontWeight:800,color:s.color,fontFamily:'var(--mono)'}}>{s.val}</div>
          </div>
        ))}
      </div>
      {/* Toolbar */}
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:0,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,flex:1}}>
          <span style={{padding:'0 12px',color:'var(--text3)'}}><Ic n="search" s={14}/></span>
          <input style={{background:'none',border:'none',padding:'9px 10px',color:'var(--text)',fontSize:13.5,outline:'none',flex:1}} placeholder="Search courses, categories, instructors…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="select" style={{width:140,fontSize:13}} value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">All statuses</option><option value="published">Published</option><option value="draft">Drafts</option><option value="archived">Archived</option>
        </select>
        <button className={`btn btn-ghost btn-icon ${view==='grid'?'btn-teal':''}`} onClick={()=>setView('grid')}><Ic n="grid" s={15}/></button>
        <button className={`btn btn-ghost btn-icon ${view==='list'?'btn-teal':''}`} onClick={()=>setView('list')}><Ic n="list" s={15}/></button>
        <button className="btn btn-amber" onClick={()=>setModal('add')}><Ic n="plus" s={15}/>New Course</button>
      </div>

      {/* Grid / List */}
      {view==='grid' ? (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14, overflowY: 'auto'}}>
          {filtered.map(c=>(
            <CourseCard 
              key={c.id} 
              course={c} 
              onOpen={(c) => { setActiveCourse(c); setViewMode('preview'); }} 
              onEdit={(c) => { setActiveCourse(c); setViewMode('builder'); }} 
              onDelete={id=>setCourses(cs=>cs.filter(x=>x.id!==id))}
            />
          ))}
          {filtered.length===0&&<div style={{gridColumn:'1/-1',textAlign:'center',padding:48,color:'var(--text3)'}}>No courses found</div>}
        </div>
      ) : (
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Course</th><th>Instructor</th><th>Status</th><th>Level</th><th>Students</th><th>Sections</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(c=>(
                <tr key={c.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:36,height:36,borderRadius:9,background:c.thumb+'22',border:`1.5px solid ${c.thumb}44`,display:'flex',alignItems:'center',justifyContent:'center',color:c.thumb,flexShrink:0}}><Ic n="book" s={15}/></div>
                      <div style={{ cursor: 'pointer' }} onClick={() => { setActiveCourse(c); setViewMode('preview'); }}>
                        <div style={{fontWeight:600,fontSize:13.5}}>{c.title}</div>
                        <div style={{fontSize:11.5,color:'var(--text3)', maxWidth:220, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                          {c.parentCategory} <span style={{opacity:.5}}>›</span> {c.subCategory} <span style={{opacity:.5}}>›</span> {c.nestedSubCategory}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{fontSize:13,color:'var(--text2)'}}>{c.instructor}</td>
                  <td>{statusBadge(c.status)}</td>
                  <td>{levelBadge(c.level)}</td>
                  <td style={{fontFamily:'var(--mono)',fontSize:13}}>{c.students}</td>
                  <td style={{fontFamily:'var(--mono)',fontSize:13}}>{c.sections}</td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-teal btn-xs" onClick={() => { setActiveCourse(c); setViewMode('builder'); }}>Open Builder</button>
                      <button className="btn btn-ghost btn-xs" onClick={()=>setModal(c)}><Ic n="edit" s={12}/></button>
                      <button className="btn btn-danger btn-xs" onClick={()=>setCourses(cs=>cs.filter(x=>x.id!==c.id))}><Ic n="trash" s={12}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal&&<CourseFormModal initial={modal==='add'?null:modal} onSave={saveCourse} onClose={()=>setModal(null)}/>}
    </div>
  );
};

// ── Sidebar ────────────────────────────────────────────────────────────────────

export { CourseList };

export const Phase2Styles = () => <style>{FONTS + CSS}</style>;
