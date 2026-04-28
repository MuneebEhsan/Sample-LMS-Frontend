import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { TENANTS_INIT } from './Phase10.jsx';

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');
`;

const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080A0F;
    --bg2: #0D1017;
    --card: #111520;
    --card2: #161B27;
    --border: #1E2535;
    --border2: #252D3D;
    --amber: #F59E0B;
    --amber2: #FCD34D;
    --amber-dim: rgba(245,158,11,0.12);
    --amber-glow: rgba(245,158,11,0.25);
    --indigo: #6366F1;
    --teal: #14B8A6;
    --red: #EF4444;
    --green: #10B981;
    --text: #E2E8F0;
    --text2: #94A3B8;
    --text3: #475569;
    --font: 'Plus Jakarta Sans', sans-serif;
    --mono: 'JetBrains Mono', monospace;
    --display: 'Syne', sans-serif;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font); min-height: 100vh; }
  input, select, textarea, button { font-family: var(--font); }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg2); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

  /* Grid pattern */
  .grid-bg {
    background-image: 
      linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes pulse-amber {
    0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
    50% { box-shadow: 0 0 0 8px rgba(245,158,11,0); }
  }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-12px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .fade-up { animation: fadeUp 0.5s ease forwards; }
  .fade-in { animation: fadeIn 0.3s ease forwards; }

  /* Btn base */
  .btn { 
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 8px; font-size: 14px;
    font-weight: 600; cursor: pointer; border: none;
    transition: all 0.2s ease; user-select: none;
  }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-amber { background: var(--amber); color: #000; }
  .btn-amber:hover:not(:disabled) { background: var(--amber2); box-shadow: 0 0 20px var(--amber-glow); transform: translateY(-1px); }
  .btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border2); }
  .btn-ghost:hover { background: var(--card2); color: var(--text); border-color: var(--border2); }
  .btn-danger { background: rgba(239,68,68,0.12); color: var(--red); border: 1px solid rgba(239,68,68,0.2); }
  .btn-danger:hover { background: rgba(239,68,68,0.2); }
  .btn-sm { padding: 6px 14px; font-size: 13px; }
  .btn-xs { padding: 4px 10px; font-size: 12px; border-radius: 6px; }
  .btn-icon { padding: 8px; border-radius: 8px; }

  /* Input */
  .input-wrap { display: flex; flex-direction: column; gap: 6px; }
  .input-label { font-size: 13px; font-weight: 600; color: var(--text2); letter-spacing: 0.03em; }
  .input-field {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 8px; padding: 11px 14px; color: var(--text);
    font-size: 14px; outline: none; transition: all 0.2s ease; width: 100%;
  }
  .input-field:focus { border-color: var(--amber); box-shadow: 0 0 0 3px var(--amber-dim); }
  .input-field::placeholder { color: var(--text3); }
  .input-icon-wrap { position: relative; }
  .input-icon-wrap .input-field { padding-left: 42px; }
  .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text3); }

  /* Card */
  .card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; padding: 20px;
  }
  .card-sm { border-radius: 8px; padding: 14px; }

  /* Badge */
  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
  }
  .badge-green { background: rgba(16,185,129,0.12); color: var(--green); border: 1px solid rgba(16,185,129,0.2); }
  .badge-red { background: rgba(239,68,68,0.12); color: var(--red); border: 1px solid rgba(239,68,68,0.2); }
  .badge-amber { background: var(--amber-dim); color: var(--amber); border: 1px solid var(--amber-glow); }
  .badge-indigo { background: rgba(99,102,241,0.12); color: var(--indigo); border: 1px solid rgba(99,102,241,0.2); }
  .badge-teal { background: rgba(20,184,166,0.12); color: var(--teal); border: 1px solid rgba(20,184,166,0.2); }
  .badge-gray { background: rgba(148,163,184,0.08); color: var(--text2); border: 1px solid var(--border); }

  /* Table */
  .table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid var(--border); }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  thead th { 
    background: var(--bg2); padding: 12px 16px; text-align: left;
    font-size: 11px; font-weight: 700; color: var(--text3); 
    letter-spacing: 0.08em; text-transform: uppercase; border-bottom: 1px solid var(--border);
  }
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--card2); }
  tbody td { padding: 13px 16px; color: var(--text); vertical-align: middle; }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px); z-index: 100;
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.2s ease;
  }
  .modal-box {
    background: var(--card); border: 1px solid var(--border2);
    border-radius: 16px; width: 100%; max-width: 520px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 25px 60px rgba(0,0,0,0.6);
    animation: fadeUp 0.3s ease;
  }
  .modal-header {
    padding: 20px 24px 16px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; }

  /* Sidebar */
  .sidebar { width: 240px; min-width: 240px; background: var(--card); border-right: 1px solid var(--border); display: flex; flex-direction: column; }
  .sidebar-logo { padding: 20px; border-bottom: 1px solid var(--border); }
  .sidebar-nav { flex: 1; padding: 10px; overflow-y: auto; }
  .nav-section { margin-bottom: 4px; }
  .nav-section-label { font-size: 10px; font-weight: 700; color: var(--text3); letter-spacing: 0.12em; text-transform: uppercase; padding: 10px 10px 6px; }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 9px 12px;
    border-radius: 8px; cursor: pointer; font-size: 13.5px; font-weight: 500;
    color: var(--text2); transition: all 0.15s ease; margin-bottom: 1px;
  }
  .nav-item:hover { background: var(--card2); color: var(--text); }
  .nav-item.active { background: var(--amber-dim); color: var(--amber); border: 1px solid var(--amber-glow); }
  .nav-item .nav-icon { width: 18px; text-align: center; flex-shrink: 0; }

  /* Permission grid */
  .perm-grid { display: grid; grid-template-columns: 180px repeat(5, 1fr); border-radius: 10px; overflow: hidden; border: 1px solid var(--border); }
  .perm-cell { padding: 10px 14px; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); display: flex; align-items: center; font-size: 13px; }
  .perm-cell:last-child { border-right: none; }
  .perm-header { background: var(--bg2); font-size: 11px; font-weight: 700; color: var(--text3); letter-spacing: 0.06em; text-transform: uppercase; justify-content: center; }
  .perm-module { font-weight: 600; color: var(--text); }
  .perm-check { justify-content: center; }
  .perm-row:last-child .perm-cell { border-bottom: none; }

  /* Checkbox toggle */
  .check-box {
    width: 18px; height: 18px; border-radius: 4px; border: 1.5px solid var(--border2);
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    transition: all 0.15s ease; background: var(--bg2);
  }
  .check-box.checked { background: var(--amber); border-color: var(--amber); }
  .check-box.checked::after { content: '✓'; font-size: 11px; color: #000; font-weight: 800; }

  /* Tabs */
  .tabs { display: flex; gap: 2px; background: var(--bg2); padding: 4px; border-radius: 10px; }
  .tab {
    flex: 1; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;
    cursor: pointer; text-align: center; color: var(--text2); transition: all 0.15s;
  }
  .tab.active { background: var(--card); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,0.3); }

  /* 2FA digit input */
  .otp-wrap { display: flex; gap: 10px; justify-content: center; }
  .otp-input {
    width: 52px; height: 60px; text-align: center; font-size: 24px; font-weight: 700;
    font-family: var(--mono); background: var(--bg2); border: 2px solid var(--border);
    border-radius: 10px; color: var(--text); outline: none; transition: all 0.2s;
  }
  .otp-input:focus { border-color: var(--amber); box-shadow: 0 0 0 3px var(--amber-dim); }

  /* Stat card */
  .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 18px 20px; display: flex; flex-direction: column; gap: 8px; }
  .stat-card:hover { border-color: var(--border2); }

  /* Avatar */
  .avatar { border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }

  /* Toggle switch */
  .toggle { width: 40px; height: 22px; border-radius: 11px; background: var(--border2); position: relative; cursor: pointer; transition: background 0.2s; }
  .toggle.on { background: var(--amber); }
  .toggle::after { content: ''; width: 16px; height: 16px; border-radius: 50%; background: #fff; position: absolute; top: 3px; left: 3px; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
  .toggle.on::after { transform: translateX(18px); }

  /* Dropdown */
  .select-field { background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; color: var(--text); font-size: 14px; outline: none; width: 100%; appearance: none; cursor: pointer; }
  .select-field:focus { border-color: var(--amber); box-shadow: 0 0 0 3px var(--amber-dim); }

  /* Search bar */
  .search-bar { display: flex; align-items: center; gap: 0; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; transition: border-color 0.2s; }
  .search-bar:focus-within { border-color: var(--amber); }
  .search-bar input { background: none; border: none; padding: 9px 14px; color: var(--text); font-size: 14px; outline: none; flex: 1; min-width: 0; }
  .search-bar .search-icon { padding: 0 12px; color: var(--text3); }

  /* Alert */
  .alert { padding: 12px 16px; border-radius: 8px; font-size: 13.5px; display: flex; align-items: flex-start; gap: 10px; }
  .alert-amber { background: var(--amber-dim); border: 1px solid var(--amber-glow); color: #FDE68A; }
  .alert-red { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #FCA5A5; }
  .alert-green { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #6EE7B7; }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    lock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    eyeOff: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
    mail: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    monitor: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    globe: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    smartphone: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
    key: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
    activity: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    chevronDown: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    alertTriangle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    upload: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
    google: <svg width={size} height={size} viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
    microsoft: <svg width={size} height={size} viewBox="0 0 24 24"><path d="M11.4 11.4H0V0h11.4v11.4z" fill="#F25022"/><path d="M24 11.4H12.6V0H24v11.4z" fill="#7FBA00"/><path d="M11.4 24H0V12.6h11.4V24z" fill="#00A4EF"/><path d="M24 24H12.6V12.6H24V24z" fill="#FFB900"/></svg>,
    info: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    book: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  };
  return icons[name] || null;
};

// ─── Mock Data ─────────────────────────────────────────────────────────────────
export const INITIAL_USERS = [
  { id: 1, name: "Sophia Chen", email: "sophia@lms.dev", role: "Super Admin", tenant: "Platform", status: "active", twofa: true, lastLogin: "2 min ago", joined: "Jan 12, 2024", avatar: "SC", color: "#6366F1" },
  { id: 2, name: "Marcus Rivera", email: "m.rivera@lms.dev", role: "Admin", tenant: "Acme Corp University", status: "active", twofa: true, lastLogin: "1 hr ago", joined: "Feb 3, 2024", avatar: "MR", color: "#14B8A6" },
  { id: 3, name: "Aisha Patel", email: "aisha@lms.dev", role: "Instructor", tenant: "Acme Corp University", status: "active", twofa: false, lastLogin: "3 hrs ago", joined: "Mar 7, 2024", avatar: "AP", color: "#F59E0B" },
  { id: 4, name: "Jonas Weber", email: "jweber@lms.dev", role: "Student", tenant: "TechLearn Institute", status: "active", twofa: false, lastLogin: "1 day ago", joined: "Apr 15, 2024", avatar: "JW", color: "#10B981" },
  { id: 5, name: "Priya Nair", email: "p.nair@lms.dev", role: "Course Manager", tenant: "MedEd Academy", status: "suspended", twofa: true, lastLogin: "5 days ago", joined: "Jan 28, 2024", avatar: "PN", color: "#EC4899" },
  { id: 6, name: "Derek Mills", email: "dmills@lms.dev", role: "Teaching Assistant", tenant: "GovLearn Portal", status: "inactive", twofa: false, lastLogin: "2 weeks ago", joined: "May 1, 2024", avatar: "DM", color: "#8B5CF6" },
];

const MODULES = ["Users", "Courses", "Grades", "Reports", "Payments", "Messaging", "Security", "Appearance", "DRM"];
const ACTIONS = ["View", "Create", "Edit", "Delete", "Export"];

const ROLES_DATA = [
  {
    id: 1, name: "Super Admin", color: "#EF4444", desc: "Full system access",
    perms: {
      Users: [1,1,1,1,1], Courses: [1,1,1,1,1], Grades: [1,1,1,1,1],
      Reports: [1,1,1,1,1], Payments: [1,1,1,1,1], Messaging: [1,1,1,1,1],
      Security: [1,1,1,1,1], Appearance: [1,1,1,1,1], DRM: [1,1,1,1,1]
    }
  },
  {
    id: 2, name: "Admin", color: "#F59E0B", desc: "Manage courses & users",
    perms: {
      Users: [1,1,1,0,1], Courses: [1,1,1,1,1], Grades: [1,1,1,0,1],
      Reports: [1,0,0,0,1], Payments: [1,0,0,0,1], Messaging: [1,1,1,0,0],
      Security: [1,0,0,0,0], Appearance: [1,1,1,0,0], DRM: [1,1,1,0,1]
    }
  },
  {
    id: 3, name: "Instructor", color: "#6366F1", desc: "Manage own courses",
    perms: {
      Users: [1,0,0,0,0], Courses: [1,1,1,0,1], Grades: [1,1,1,0,1],
      Reports: [1,0,0,0,1], Payments: [0,0,0,0,0], Messaging: [1,1,0,0,0],
      Security: [0,0,0,0,0], Appearance: [0,0,0,0,0], DRM: [0,0,0,0,0]
    }
  },
  {
    id: 4, name: "Student", color: "#10B981", desc: "View enrolled courses",
    perms: {
      Users: [0,0,0,0,0], Courses: [1,0,0,0,0], Grades: [1,0,0,0,0],
      Reports: [0,0,0,0,0], Payments: [1,0,0,0,0], Messaging: [1,1,0,0,0],
      Security: [0,0,0,0,0], Appearance: [0,0,0,0,0], DRM: [0,0,0,0,0]
    }
  },
];

const SESSIONS = [
  { id: 1, user: "Sophia Chen", device: "Chrome / macOS", ip: "192.168.1.1", location: "San Francisco, US", started: "10 min ago", current: true },
  { id: 2, user: "Marcus Rivera", device: "Firefox / Windows", ip: "10.0.0.45", location: "New York, US", started: "2 hrs ago", current: false },
  { id: 3, user: "Aisha Patel", device: "Safari / iOS", ip: "172.16.0.22", location: "London, UK", started: "5 hrs ago", current: false },
  { id: 4, user: "Jonas Weber", device: "Edge / Windows", ip: "192.168.2.10", location: "Berlin, DE", started: "1 day ago", current: false },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const Avatar = ({ initials, color, size = 34 }) => (
  <div className="avatar" style={{ width: size, height: size, background: color + '22', color, fontSize: size * 0.35, border: `1.5px solid ${color}44` }}>
    {initials}
  </div>
);

const statusBadge = (s) => {
  if (s === "active") return <span className="badge badge-green"><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />Active</span>;
  if (s === "suspended") return <span className="badge badge-red">Suspended</span>;
  return <span className="badge badge-gray">Inactive</span>;
};

const roleBadge = (role) => {
  const colors = { "Super Admin": "badge-red", "Admin": "badge-amber", "Instructor": "badge-indigo", "Student": "badge-green", "Course Manager": "badge-teal", "Teaching Assistant": "badge-indigo" };
  return <span className={`badge ${colors[role] || 'badge-gray'}`}>{role}</span>;
};

// ─── Login View ───────────────────────────────────────────────────────────────
const LoginView = ({ onLogin, onSwitch, on2FA }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handle = async () => {
    if (!email || !pass) return setErr("Please enter email and password");
    setLoading(true); setErr("");
    try {
      await login(email, pass);
    } catch (err) {
      setErr(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }} className="grid-bg">
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420 }} className="fade-up">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, background: 'var(--amber-dim)', border: '1px solid var(--amber-glow)', borderRadius: 14, marginBottom: 16 }}>
            <Icon name="book" size={24} />
          </div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Acad<span style={{ color: 'var(--amber)' }}>LMS</span>
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 13.5, marginTop: 4 }}>Sign in to your workspace</div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={e => { e.preventDefault(); handle(); }} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {err && <div className="alert alert-red"><Icon name="alertTriangle" size={15} />{err}</div>}

            <div className="input-wrap">
              <label className="input-label">Email address</label>
              <div className="input-icon-wrap">
                <span className="input-icon"><Icon name="mail" size={15} /></span>
                <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="input-wrap">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="input-label">Password</label>
                <span style={{ fontSize: 12, color: 'var(--amber)', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</span>
              </div>
              <div className="input-icon-wrap">
                <span className="input-icon"><Icon name="lock" size={15} /></span>
                <input className="input-field" type={showPass ? "text" : "password"} placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} style={{ paddingRight: 44 }} required />
                <span onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text3)' }}>
                  <Icon name={showPass ? "eyeOff" : "eye"} size={15} />
                </span>
              </div>
            </div>

            <button type="submit" className="btn btn-amber" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }} disabled={loading}>
              {loading ? <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #00000044', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> : null}
              {loading ? "Signing in…" : "Sign In"}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {[{ icon: 'google', label: 'Google' }, { icon: 'microsoft', label: 'Microsoft' }].map(p => (
                <button key={p.icon} type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', gap: 8 }}>
                  <Icon name={p.icon} size={16} />{p.label}
                </button>
              ))}
            </div>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text2)' }}>
          Don't have an account?{' '}
          <span onClick={onSwitch} style={{ color: 'var(--amber)', fontWeight: 600, cursor: 'pointer' }}>Create account</span>
        </p>
      </div>
    </div>
  );
};

// ─── Register View ─────────────────────────────────────────────────────────────
const RegisterView = ({ onSwitch, onLogin }) => {
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '', org: '', role: 'Student' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const strength = () => {
    let s = 0;
    if (form.password.length >= 8) s++;
    if (/[A-Z]/.test(form.password)) s++;
    if (/[0-9]/.test(form.password)) s++;
    if (/[^A-Za-z0-9]/.test(form.password)) s++;
    return s;
  };
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#EF4444', '#F59E0B', '#14B8A6', '#10B981'];

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    await login(form.email || "jweber@lms.dev", form.password);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} className="grid-bg">
      <div style={{ width: '100%', maxWidth: 460 }} className="fade-up">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>
            Acad<span style={{ color: 'var(--amber)' }}>LMS</span>
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 13.5, marginTop: 4 }}>Create your account — Step {step} of 2</div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
            {[1, 2].map(i => <div key={i} style={{ height: 3, width: 48, borderRadius: 2, background: i <= step ? 'var(--amber)' : 'var(--border)', transition: 'background 0.3s' }} />)}
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          {step === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="input-wrap">
                  <label className="input-label">First Name</label>
                  <input className="input-field" placeholder="Jane" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                </div>
                <div className="input-wrap">
                  <label className="input-label">Last Name</label>
                  <input className="input-field" placeholder="Smith" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                </div>
              </div>
              <div className="input-wrap">
                <label className="input-label">Email Address</label>
                <div className="input-icon-wrap">
                  <span className="input-icon"><Icon name="mail" size={15} /></span>
                  <input className="input-field" type="email" placeholder="jane@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
              </div>
              <div className="input-wrap">
                <label className="input-label">Organization (optional)</label>
                <input className="input-field" placeholder="Acme University" value={form.org} onChange={e => set('org', e.target.value)} />
              </div>
              <button className="btn btn-amber" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={() => setStep(2)}>
                Continue
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-wrap">
                <label className="input-label">Password</label>
                <div className="input-icon-wrap">
                  <span className="input-icon"><Icon name="lock" size={15} /></span>
                  <input className="input-field" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} />
                </div>
                {form.password && (
                  <div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                      {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength() ? strengthColor[strength()] : 'var(--border)', transition: 'all 0.2s' }} />)}
                    </div>
                    <div style={{ fontSize: 11, color: strengthColor[strength()], marginTop: 4, fontWeight: 600 }}>{strengthLabel[strength()]}</div>
                  </div>
                )}
              </div>
              <div className="input-wrap">
                <label className="input-label">Confirm Password</label>
                <div className="input-icon-wrap">
                  <span className="input-icon"><Icon name="lock" size={15} /></span>
                  <input className="input-field" type="password" placeholder="Repeat password" value={form.confirm} onChange={e => set('confirm', e.target.value)} />
                </div>
                {form.confirm && form.confirm !== form.password && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 4 }}>Passwords do not match</div>}
              </div>
              <div className="input-wrap">
                <label className="input-label">Joining as</label>
                <select className="select-field" value={form.role} onChange={e => set('role', e.target.value)}>
                  {['Student', 'Instructor', 'Course Manager'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-amber" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSubmit} disabled={loading || form.password !== form.confirm}>
                  {loading ? <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #00000044', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> : null}
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text2)' }}>
          Already have an account?{' '}
          <span onClick={onSwitch} style={{ color: 'var(--amber)', fontWeight: 600, cursor: 'pointer' }}>Sign in</span>
        </p>
      </div>
    </div>
  );
};

// ─── 2FA View ─────────────────────────────────────────────────────────────────
const TwoFAView = ({ onVerify }) => {
  const { login } = useAuth();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const refs = Array.from({ length: 6 }, () => useRef());

  const handleChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const d = [...digits]; d[i] = v;
    setDigits(d);
    if (v && i < 5) refs[i + 1].current?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };

  const verify = async () => {
    setLoading(true); setErr('');
    await new Promise(r => setTimeout(r, 800));
    const code = digits.join('');
    if (code === '123456' || code.length === 6) { await login("sophia@lms.dev", "mockpass"); }
    else { setErr('Invalid code. Try 123456 for demo.'); setDigits(['', '', '', '', '', '']); refs[0].current?.focus(); }
    setLoading(false);
  };

  const full = digits.every(d => d !== '');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} className="grid-bg">
      <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }} className="fade-up">
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, background: 'var(--amber-dim)', border: '1px solid var(--amber-glow)', borderRadius: '50%', marginBottom: 20, animation: 'pulse-amber 2s infinite' }}>
          <Icon name="shield" size={26} />
        </div>
        <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Two-Factor Auth</div>
        <div style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28 }}>Enter the 6-digit code from your authenticator app</div>

        <div className="card" style={{ padding: 28 }}>
          {err && <div className="alert alert-red" style={{ marginBottom: 16, textAlign: 'left' }}><Icon name="alertTriangle" size={14} />{err}</div>}

          <div className="otp-wrap" style={{ marginBottom: 20 }}>
            {digits.map((d, i) => (
              <input key={i} ref={refs[i]} className="otp-input" maxLength={1} value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)}
                style={{ color: d ? 'var(--amber)' : 'var(--text)' }}
              />
            ))}
          </div>

          <button className="btn btn-amber" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }} onClick={verify} disabled={!full || loading}>
            {loading ? <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #00000044', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> : <Icon name="check" size={16} />}
            {loading ? 'Verifying…' : 'Verify & Sign In'}
          </button>

          <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--text3)' }}>
            Didn't get a code?{' '}
            <span style={{ color: 'var(--amber)', cursor: 'pointer', fontWeight: 600 }}>Resend</span>
            {' · '}
            <span style={{ color: 'var(--amber)', cursor: 'pointer', fontWeight: 600 }}>Use backup code</span>
          </div>
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text3)' }}>Demo: enter any 6 digits to continue</div>
      </div>
    </div>
  );
};

// ─── Users Tab ─────────────────────────────────────────────────────────────────
const UsersTab = () => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("acadlms_users");
    try { return saved ? JSON.parse(saved) : INITIAL_USERS; } catch(e) { return INITIAL_USERS; }
  });

  const [tenants, setTenants] = useState(() => {
    const saved = localStorage.getItem("acadlms_tenants");
    try { return saved ? JSON.parse(saved) : TENANTS_INIT; } catch(e) { return TENANTS_INIT; }
  });

  useEffect(() => {
    localStorage.setItem("acadlms_users", JSON.stringify(users));
  }, [users]);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'Student', tenant: tenants[0]?.name || 'Platform', status: 'active', twofa: false });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const match = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const rf = filter === 'all' || u.role.toLowerCase().replace(' ', '-') === filter || u.status === filter;
    return match && rf;
  });

  const openAdd = () => { setForm({ name: '', email: '', role: 'Student', tenant: TENANTS_INIT[0].name, status: 'active', twofa: false }); setModal('add'); };
  const openEdit = (u) => { setForm({ ...u }); setModal('edit'); };

  const save = () => {
    if (modal === 'add') {
      const colors = ['#6366F1', '#14B8A6', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6'];
      const initials = form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      setUsers(u => [...u, { ...form, id: Date.now(), avatar: initials, color: colors[Math.floor(Math.random() * colors.length)], lastLogin: 'Never', joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }]);
    } else {
      setUsers(u => u.map(x => x.id === form.id ? { ...x, ...form } : x));
    }
    setModal(null);
  };

  const remove = (id) => setUsers(u => u.filter(x => x.id !== id));
  const toggle2fa = (id) => setUsers(u => u.map(x => x.id === id ? { ...x, twofa: !x.twofa } : x));

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Users', value: users.length, color: 'var(--amber)' },
          { label: 'Active', value: users.filter(u => u.status === 'active').length, color: 'var(--green)' },
          { label: '2FA Enabled', value: users.filter(u => u.twofa).length, color: 'var(--indigo)' },
          { label: 'Suspended', value: users.filter(u => u.status === 'suspended').length, color: 'var(--red)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: 'var(--mono)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <span className="search-icon"><Icon name="search" size={15} /></span>
          <input placeholder="Search users by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select-field" style={{ width: 160 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All roles</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="btn btn-amber" onClick={openAdd}><Icon name="plus" size={15} />Add User</button>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th><th>Role</th><th>Tenant</th><th>Status</th><th>2FA</th><th>Last Login</th><th>Joined</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar initials={u.avatar} color={u.color} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>{roleBadge(u.role)}</td>
                <td><div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{u.tenant || 'Platform'}</div></td>
                <td>{statusBadge(u.status)}</td>
                <td>
                  <div className={`toggle ${u.twofa ? 'on' : ''}`} onClick={() => toggle2fa(u.id)} />
                </td>
                <td style={{ fontSize: 13, color: 'var(--text2)' }}>{u.lastLogin}</td>
                <td style={{ fontSize: 13, color: 'var(--text2)' }}>{u.joined}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-xs" onClick={() => openEdit(u)}><Icon name="edit" size={13} />Edit</button>
                    <button className="btn btn-danger btn-xs" onClick={() => remove(u.id)}><Icon name="trash" size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{modal === 'add' ? 'Add New User' : 'Edit User'}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{modal === 'add' ? 'Create a new platform user' : `Editing ${form.name}`}</div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}><Icon name="x" size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="input-wrap">
                <label className="input-label">Full Name</label>
                <input className="input-field" placeholder="Jane Smith" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="input-wrap">
                <label className="input-label">Email Address</label>
                <div className="input-icon-wrap">
                  <span className="input-icon"><Icon name="mail" size={15} /></span>
                  <input className="input-field" type="email" placeholder="jane@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
              </div>
              {modal === 'add' && (
                <div className="input-wrap">
                  <label className="input-label">Temporary Password</label>
                  <div className="input-icon-wrap">
                    <span className="input-icon"><Icon name="lock" size={15} /></span>
                    <input className="input-field" type="password" placeholder="Min 8 characters" />
                  </div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="input-wrap">
                  <label className="input-label">Role</label>
                  <select className="select-field" value={form.role} onChange={e => {
                    const r = e.target.value;
                    set('role', r);
                    if (r === 'Super Admin') set('tenant', 'Platform');
                    else if (form.tenant === 'Platform') set('tenant', tenants[0]?.name || 'Platform');
                  }}>
                    {['Super Admin', 'Admin', 'Course Manager', 'Instructor', 'Teaching Assistant', 'Student', 'Guest'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="input-wrap">
                  <label className="input-label">Assigned Tenant</label>
                  <select className="select-field" value={form.tenant} disabled={form.role === 'Super Admin'} onChange={e => set('tenant', e.target.value)}>
                    <option value="Platform">Platform (All Tenants)</option>
                    {tenants.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="input-wrap">
                <label className="input-label">Status</label>
                <select className="select-field" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>Require Two-Factor Authentication</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>User must set up 2FA on next login</div>
                </div>
                <div className={`toggle ${form.twofa ? 'on' : ''}`} onClick={() => set('twofa', !form.twofa)} />
              </div>
              {modal === 'add' && (
                <div className="alert alert-amber">
                  <Icon name="info" size={15} />
                  <span>An invitation email will be sent to the user with login instructions.</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-amber" onClick={save} disabled={!form.name || !form.email}>
                {modal === 'add' ? <><Icon name="plus" size={14} />Create User</> : <><Icon name="check" size={14} />Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Roles Tab ─────────────────────────────────────────────────────────────────
const RolesTab = () => {
  const [roles, setRoles] = useState(ROLES_DATA);
  const [selected, setSelected] = useState(0);
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState('');
  const role = roles[selected];

  const togglePerm = (mod, idx) => {
    setRoles(rs => rs.map((r, ri) => {
      if (ri !== selected) return r;
      const perms = { ...r.perms };
      perms[mod] = perms[mod].map((v, vi) => vi === idx ? 1 - v : v);
      return { ...r, perms };
    }));
  };

  const createRole = () => {
    if (!newName.trim()) return;
    const empty = {};
    MODULES.forEach(m => { empty[m] = [0, 0, 0, 0, 0]; });
    setRoles(rs => [...rs, { id: Date.now(), name: newName, color: '#6366F1', desc: 'Custom role', perms: empty }]);
    setNewName(''); setModal(false);
    setSelected(roles.length);
  };

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 20 }}>
        {/* Role list */}
        <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Roles ({roles.length})</div>
          {roles.map((r, i) => (
            <div key={r.id} onClick={() => setSelected(i)}
              style={{ padding: '10px 14px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${selected === i ? r.color + '44' : 'var(--border)'}`, background: selected === i ? r.color + '11' : 'var(--card)', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                <div style={{ fontWeight: 600, fontSize: 13.5, color: selected === i ? r.color : 'var(--text)' }}>{r.name}</div>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text3)', marginTop: 3, marginLeft: 16 }}>{r.desc}</div>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'center', marginTop: 4 }} onClick={() => setModal(true)}>
            <Icon name="plus" size={14} />New Role
          </button>
        </div>

        {/* Permission matrix */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: role.color }} />
                {role.name}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text3)', marginTop: 2 }}>Click checkboxes to toggle individual permissions</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => {
                setRoles(rs => rs.map((r, ri) => {
                  if (ri !== selected) return r;
                  const perms = {};
                  MODULES.forEach(m => { perms[m] = [1,1,1,1,1]; });
                  return { ...r, perms };
                }));
              }}>Grant All</button>
              <button className="btn btn-danger btn-sm" onClick={() => {
                setRoles(rs => rs.map((r, ri) => {
                  if (ri !== selected) return r;
                  const perms = {};
                  MODULES.forEach(m => { perms[m] = [0,0,0,0,0]; });
                  return { ...r, perms };
                }));
              }}>Revoke All</button>
            </div>
          </div>

          <div className="perm-grid">
            {/* Header */}
            <div className="perm-cell perm-header" style={{ justifyContent: 'flex-start' }}>Module</div>
            {ACTIONS.map(a => <div key={a} className="perm-cell perm-header">{a}</div>)}
            {/* Rows */}
            {MODULES.map(mod => (
              <div key={mod} style={{ display: 'contents' }} className="perm-row">
                <div className="perm-cell perm-module" style={{ background: 'var(--card2)' }}>{mod}</div>
                {role.perms[mod].map((v, i) => (
                  <div key={i} className="perm-cell perm-check">
                    <div className={`check-box ${v ? 'checked' : ''}`} onClick={() => togglePerm(mod, i)} />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm"><Icon name="upload" size={14} />Export</button>
            <button className="btn btn-amber btn-sm"><Icon name="check" size={14} />Save Role</button>
          </div>
        </div>
      </div>

      {/* New Role Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: 16 }}>Create New Role</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}><Icon name="x" size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="input-wrap">
                <label className="input-label">Role Name</label>
                <input className="input-field" placeholder="e.g. Content Reviewer" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
              </div>
              <div className="alert alert-amber"><Icon name="info" size={14} />The new role will start with no permissions. Configure them in the matrix.</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-amber" onClick={createRole} disabled={!newName.trim()}><Icon name="plus" size={14} />Create Role</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sessions Tab ──────────────────────────────────────────────────────────────
const SessionsTab = () => {
  const [sessions, setSessions] = useState(SESSIONS);
  const revoke = (id) => setSessions(s => s.filter(x => x.id !== id));

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Active Sessions</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>{sessions.length} sessions across all users</div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={() => setSessions(s => s.filter(x => x.current))}>
          Revoke All Others
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sessions.map(s => (
          <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
              {s.device.includes('iOS') ? <Icon name="smartphone" size={18} /> : <Icon name="monitor" size={18} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{s.user}</span>
                {s.current && <span className="badge badge-green" style={{ fontSize: 11 }}>This session</span>}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text3)', marginTop: 2 }}>{s.device}</div>
            </div>
            <div style={{ textAlign: 'right', minWidth: 120 }}>
              <div style={{ fontSize: 12.5, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{s.ip}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}><Icon name="globe" size={11} /> {s.location}</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', minWidth: 90, textAlign: 'right' }}>{s.started}</div>
            {!s.current && (
              <button className="btn btn-danger btn-xs" onClick={() => revoke(s.id)}><Icon name="logout" size={12} />Revoke</button>
            )}
          </div>
        ))}
      </div>

      <div className="alert alert-amber" style={{ marginTop: 4 }}>
        <Icon name="shield" size={15} />
        <span>Sessions automatically expire after 24 hours of inactivity. Enable 2FA to add an extra layer of security.</span>
      </div>
    </div>
  );
};

// ─── Profile Tab ───────────────────────────────────────────────────────────────
const ProfileTab = () => {
  const [form, setForm] = useState({ firstName: 'Sophia', lastName: 'Chen', email: 'sophia@lms.dev', bio: 'Platform administrator.', timezone: 'UTC-8', lang: 'English', twofa: true });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 640 }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>My Profile</div>

      {/* Avatar */}
      <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
        <Avatar initials="SC" color="#6366F1" size={64} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Sophia Chen</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>Super Admin · sophia@lms.dev</div>
          <button className="btn btn-ghost btn-xs" style={{ marginTop: 10 }}>Change Avatar</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="input-wrap"><label className="input-label">First Name</label><input className="input-field" value={form.firstName} onChange={e => set('firstName', e.target.value)} /></div>
          <div className="input-wrap"><label className="input-label">Last Name</label><input className="input-field" value={form.lastName} onChange={e => set('lastName', e.target.value)} /></div>
        </div>
        <div className="input-wrap"><label className="input-label">Email</label><div className="input-icon-wrap"><span className="input-icon"><Icon name="mail" size={15} /></span><input className="input-field" value={form.email} onChange={e => set('email', e.target.value)} /></div></div>
        <div className="input-wrap"><label className="input-label">Bio</label><textarea className="input-field" rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} style={{ resize: 'vertical' }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="input-wrap"><label className="input-label">Timezone</label>
            <select className="select-field" value={form.timezone} onChange={e => set('timezone', e.target.value)}>
              {['UTC-12', 'UTC-8', 'UTC-5', 'UTC+0', 'UTC+1', 'UTC+5:30', 'UTC+8', 'UTC+9'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="input-wrap"><label className="input-label">Language</label>
            <select className="select-field" value={form.lang} onChange={e => set('lang', e.target.value)}>
              {['English', 'Spanish', 'French', 'German', 'Arabic', 'Japanese'].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="shield" size={15} />Two-Factor Authentication</div>
            <div style={{ fontSize: 12, color: form.twofa ? 'var(--green)' : 'var(--text3)', marginTop: 2 }}>{form.twofa ? '✓ Enabled — using authenticator app' : 'Not configured'}</div>
          </div>
          <div className={`toggle ${form.twofa ? 'on' : ''}`} onClick={() => set('twofa', !form.twofa)} />
        </div>

        <div className="card card-sm" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="lock" size={15} />Change Password</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input className="input-field" type="password" placeholder="Current password" />
            <input className="input-field" type="password" placeholder="New password (min 8 chars)" />
            <input className="input-field" type="password" placeholder="Confirm new password" />
            <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>Update Password</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          {saved && <div className="alert alert-green" style={{ flex: 1 }}><Icon name="check" size={14} />Profile saved successfully!</div>}
          <button className="btn btn-amber" style={{ marginLeft: 'auto' }} onClick={save}><Icon name="check" size={14} />Save Profile</button>
        </div>
      </div>
    </div>
  );
};

// ─── Admin Layout ──────────────────────────────────────────────────────────────
const AdminLayout = ({ onLogout, forcedTab, inEmbedMode }) => {
  const [tab, setTab] = useState(forcedTab || 'users');

  // Sync with master nav when forcedTab changes
  useEffect(() => { if (forcedTab) setTab(forcedTab); }, [forcedTab]);

  const navItems = [
    { section: 'User Management', items: [
      { id: 'users', icon: 'users', label: 'All Users' },
      { id: 'roles', icon: 'shield', label: 'Roles & Permissions' },
      { id: 'sessions', icon: 'activity', label: 'Active Sessions' },
      { id: 'profile', icon: 'user', label: 'My Profile' },
    ]},
    { section: 'Platform', items: [
      { id: 'courses', icon: 'book', label: 'Courses', disabled: true },
      { id: 'security', icon: 'lock', label: 'Security', disabled: true },
      { id: 'settings', icon: 'settings', label: 'Settings', disabled: true },
    ]},
  ];

  const titles = { users: 'User Management', roles: 'Roles & Permissions', sessions: 'Session Control', profile: 'My Profile' };

  if (inEmbedMode) {
    return (
      <div style={{ height: '100%' }} className="fade-in" key={tab}>
        {tab === 'users'    && <UsersTab />}
        {tab === 'roles'    && <RolesTab />}
        {tab === 'sessions' && <SessionsTab />}
        {tab === 'profile'  && <ProfileTab />}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
            Acad<span style={{ color: 'var(--amber)' }}>LMS</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Phase 1 · Admin Panel</div>
        </div>

        <div className="sidebar-nav">
          {navItems.map(section => (
            <div className="nav-section" key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items.map(item => (
                <div key={item.id}
                  className={`nav-item ${tab === item.id ? 'active' : ''} ${item.disabled ? '' : ''}`}
                  onClick={() => !item.disabled && setTab(item.id)}
                  style={item.disabled ? { opacity: 0.4, cursor: 'default' } : {}}
                >
                  <span className="nav-icon"><Icon name={item.icon} size={16} /></span>
                  {item.label}
                  {item.disabled && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text3)', background: 'var(--bg2)', borderRadius: 4, padding: '2px 6px' }}>Phase 2+</span>}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* User chip */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar initials="SC" color="#6366F1" size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Sophia Chen</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Super Admin</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onLogout} title="Sign out"><Icon name="logout" size={15} /></button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{ height: 56, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, flexShrink: 0, background: 'var(--card)' }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{titles[tab] || tab}</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="badge badge-green"><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />System Online</span>
            <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>v1.0.0-phase1</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }} className="fade-in" key={tab}>
          {tab === 'users' && <UsersTab />}
          {tab === 'roles' && <RolesTab />}
          {tab === 'sessions' && <SessionsTab />}
          {tab === 'profile' && <ProfileTab />}
        </div>
      </div>
    </div>
  );
};


export { LoginView, RegisterView, TwoFAView, AdminLayout };

// Wrapper that injects Phase 1's own CSS (it has a unique class system)
export const Phase1Styles = () => <style>{FONTS + STYLES}</style>;
