import React, { useState } from 'react';
import { I, Toggle } from '../shared.jsx';
import { useAuth } from '../AuthContext.jsx';
import { TENANTS_INIT } from './Phase10.jsx';

export const TenantDashboardView = () => {
  const { tenantId } = useAuth();
  const currentTenant = TENANTS_INIT.find(t => t.id === tenantId) || TENANTS_INIT[0];

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card" style={{ background: `linear-gradient(135deg, ${currentTenant.color}11, transparent)`, borderColor: `${currentTenant.color}33`, borderBottomWidth: 3, borderBottomColor: currentTenant.color }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 36, background: 'var(--bg)', padding: 12, borderRadius: 12 }}>{currentTenant.logo}</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{currentTenant.name} Administrator</div>
            <div style={{ color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 13, marginTop: 4 }}>ID: {currentTenant.id} — Domain: {currentTenant.subdomain}</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
             <span className="badge BG" style={{ fontSize: 12 }}>{currentTenant.plan} Plan</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { lbl: "Active Users", val: currentTenant.users.toLocaleString(), col: "var(--indigo)" },
          { lbl: "Published Courses", val: currentTenant.courses, col: "var(--teal)" },
          { lbl: "Storage Used", val: currentTenant.storage, col: "var(--amber)" },
          { lbl: "Active SCORM/H5P", val: Math.floor(currentTenant.courses * 1.5), col: "var(--green)" },
        ].map(s => (
          <div className="scard" key={s.lbl}>
            <div className="sg" style={{ background: s.col }}/>
            <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase" }}>{s.lbl}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.col, fontFamily: "var(--mono)", marginTop: 6 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="card">
           <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Tenant Configuration</div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="field"><label className="label">Brand Color</label><input type="color" className="input" value={currentTenant.color} readOnly style={{ height: 40, cursor: 'pointer', padding: '4px 8px' }}/></div>
              <div className="field"><label className="label">Custom Domain</label><input className="input" value={currentTenant.subdomain} readOnly /></div>
           </div>
        </div>
        <div className="card">
           <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Feature Toggles</div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg2)', borderRadius: 6 }}>
                <div><div style={{ fontWeight: 600, fontSize: 13 }}>Single Sign-On (SSO)</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>Allow login via external IdP</div></div>
                <Toggle on={currentTenant.sso} onChange={()=>{}} cls="grn" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg2)', borderRadius: 6 }}>
                <div><div style={{ fontWeight: 600, fontSize: 13 }}>SCORM Support</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>Allow uploading external packages</div></div>
                <Toggle on={currentTenant.scorm} onChange={()=>{}} cls="grn" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
