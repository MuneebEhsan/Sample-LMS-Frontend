import { useState, useEffect } from 'react';
import { FONTS, CSS, I, Av, Dot } from './shared.jsx';
import { useAuth } from './AuthContext.jsx';

// ── Phase 1 & 2 (own CSS systems, kept self-contained)
import { LoginView, RegisterView, TwoFAView, AdminLayout, Phase1Styles } from './phases/Phase1Auth.jsx';
import { CourseList, Phase2Styles } from './phases/Phase2Courses.jsx';

// ── Phase 3-10 (share new design system)
import { GradebookView, HistoryView, OverviewView, UserReportView, CategoriesView, ScalesView, GeneralSettingsView } from './phases/Phase3Grades.jsx';
import { RevenueDashboard, CouponsView, PayoutsView, GatewayView, MessagingView, NotificationCenter } from './phases/Phase4Payments.jsx';
import { SecurityOverview, AppearanceView, AuditLogsView } from './phases/Phase5.jsx';
import { DRMDashboard, UserGroupsView, LicenseProfilesView } from './phases/Phase6.jsx';
import { RightsView, CloudStorageView } from './phases/Phase7.jsx';
import { ProtectFilesView, TokenDeliveryView, WatermarkStudio } from './phases/Phase8.jsx';
import { ReportsView, ViolationsView, PerformanceView } from './phases/Phase9.jsx';
import { MultiTenancyView, ScormH5PView, SSOView } from './phases/Phase10.jsx';

import { MyCoursesView, StudentPaymentsView, StudentMessagesView, AcademicsView, HelpdeskView } from './phases/Phase11Student.jsx';
import { MyClassesView, GradingSubmissionsView, ContentCreatorView } from './phases/Phase12Academic.jsx';
import { AccountOfficersView, ExamDepartmentView, CoordinatorsView } from './phases/Phase13Operations.jsx';
import { TenantDashboardView } from './phases/Phase14TenantAdmin.jsx';
// ── Master navigation structure ──────────────────────────────────────────────
const NAV = [
  {
    phase: 1, label: 'Auth & Users', color: '#6366F1', emoji: '🔐',
    items: [
      { id: 'p1-users',    label: 'User Management',     icon: 'users'    },
      { id: 'p1-roles',    label: 'Roles & Permissions', icon: 'shield'   },
      { id: 'p1-sessions', label: 'Active Sessions',     icon: 'activity' },
      { id: 'p1-profile',  label: 'My Profile',          icon: 'user'     },
    ],
  },
  {
    phase: 2, label: 'Courses', color: '#14B8A6', emoji: '📚',
    items: [
      { id: 'p2-courses',  label: 'Course Catalog',      icon: 'book'     },
    ],
  },
  {
    phase: 3, label: 'Grades', color: '#10B981', emoji: '📊',
    items: [
      { id: 'p3-grader',    label: 'Grader Report',      icon: 'chart'    },
      { id: 'p3-history',   label: 'Grade History',      icon: 'clock'    },
      { id: 'p3-overview',  label: 'Overview Report',    icon: 'eye'      },
      { id: 'p3-userreport',label: 'User Report',        icon: 'user'     },
      { id: 'p3-categories',label: 'Grade Categories',   icon: 'layers'   },
      { id: 'p3-scales',    label: 'Grade Scales',       icon: 'target'   },
      { id: 'p3-general',   label: 'General Settings',   icon: 'settings' },
    ],
  },
  {
    phase: 4, label: 'Payments & Messaging', color: '#F97316', emoji: '💳',
    items: [
      { id: 'p4-revenue',       label: 'Revenue Dashboard', icon: 'chart'  },
      { id: 'p4-coupons',       label: 'Coupons',           icon: 'tag'    },
      { id: 'p4-payouts',       label: 'Payouts',           icon: 'dl'     },
      { id: 'p4-gateways',      label: 'Gateways',          icon: 'zap'    },
      { id: 'p4-messaging',     label: 'Messaging',         icon: 'mail'   },
      { id: 'p4-notifications', label: 'Notifications',     icon: 'bell'   },
    ],
  },
  {
    phase: 5, label: 'Security & Appearance', color: '#EF4444', emoji: '🛡️',
    items: [
      { id: 'p5-security',   label: 'Security Center', icon: 'shield'  },
      { id: 'p5-appearance', label: 'Theme Builder',   icon: 'palette' },
      { id: 'p5-audit',      label: 'Audit Logs',      icon: 'file'    },
    ],
  },
  {
    phase: 6, label: 'DRM Core', color: '#F59E0B', emoji: '🔑',
    items: [
      { id: 'p6-dashboard', label: 'DRM Dashboard',    icon: 'chart'   },
      { id: 'p6-groups',    label: 'User Groups',      icon: 'users'   },
      { id: 'p6-profiles',  label: 'License Profiles', icon: 'key'     },
    ],
  },
  {
    phase: 7, label: 'Rights & Storage', color: '#8B5CF6', emoji: '⚖️',
    items: [
      { id: 'p7-rights',  label: 'Rights Management', icon: 'lock'   },
      { id: 'p7-storage', label: 'Cloud Storage',     icon: 'server' },
    ],
  },
  {
    phase: 8, label: 'Protect & Tokens', color: '#0EA5E9', emoji: '🔒',
    items: [
      { id: 'p8-protect', label: 'File Protection',     icon: 'shield' },
      { id: 'p8-tokens',  label: 'Token Delivery',      icon: 'key'    },
      { id: 'p8-wm',      label: 'Watermark Studio',    icon: 'eye'    },
    ],
  },
  {
    phase: 9, label: 'Reports & Monitoring', color: '#EC4899', emoji: '📈',
    items: [
      { id: 'p9-reports',    label: 'DRM Reports',          icon: 'chart'    },
      { id: 'p9-violations', label: 'Violations & Alerts',  icon: 'alert'    },
      { id: 'p9-perf',       label: 'Performance Monitor',  icon: 'activity' },
    ],
  },
  {
    phase: 10, label: 'Multi-tenancy & SSO', color: '#84CC16', emoji: '🌐',
    items: [
      { id: 'p10-tenants', label: 'Multi-Tenancy', icon: 'building' },
      { id: 'p10-scorm',   label: 'SCORM / H5P',  icon: 'layers'   },
      { id: 'p10-sso',     label: 'SSO / SAML',   icon: 'link'     },
    ],
  },
  {
    phase: 11, label: 'Student Portal', color: '#3B82F6', emoji: '🎓',
    items: [
      { id: 'p11-courses',  label: 'My Courses',       icon: 'book'     },
      { id: 'p11-payments', label: 'Financials',       icon: 'chart'    },
      { id: 'p11-messages', label: 'Messages',         icon: 'mail'     },
      { id: 'p11-academic', label: 'Academics',        icon: 'calendar' },
      { id: 'p11-helpdesk', label: 'Helpdesk',         icon: 'dl'       },
    ],
  },
  {
    phase: 12, label: 'Academic Portal', color: '#14B8A6', emoji: '🍎',
    items: [
      { id: 'p12-classes',    label: 'My Classes',     icon: 'users'    },
      { id: 'p12-grading',    label: 'Grading',        icon: 'check'    },
      { id: 'p12-content',    label: 'Content Creator',icon: 'plus'     },
    ],
  },
  {
    phase: 13, label: 'Operations Portal', color: '#F59E0B', emoji: '📈',
    items: [
      { id: 'p13-accounts',   label: 'Account Dept',   icon: 'chart'    },
      { id: 'p13-exams',      label: 'Exam Dept',      icon: 'file'     },
      { id: 'p13-coordinators',label: 'Master Schedule',icon: 'calendar'},
    ],
  },
  {
    phase: 14, label: 'Tenant Admin', color: '#8B5CF6', emoji: '🏛️',
    items: [
      { id: 'p14-dashboard',  label: 'Tenant Overview',icon: 'building' },
    ],
  },
];

// ── Extra CSS for master layout ───────────────────────────────────────────────
const MASTER_CSS = `
.ms-sidebar{width:224px;min-width:224px;background:var(--card);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
.ms-logo{padding:14px 14px 12px;border-bottom:1px solid var(--border);flex-shrink:0}
.ms-nav{flex:1;overflow-y:auto;padding:6px}
.ms-section{margin-bottom:2px}
.ms-section-hd{display:flex;align-items:center;gap:7px;padding:6px 10px 3px;cursor:pointer;border-radius:6px;transition:background .13s;user-select:none}
.ms-section-hd:hover{background:var(--card2)}
.ms-section-hd.open{background:var(--adim)}
.ms-item{display:flex;align-items:center;gap:8px;padding:6px 10px 6px 28px;border-radius:6px;cursor:pointer;font-size:12.5px;font-weight:500;color:var(--text2);transition:all .12s;user-select:none}
.ms-item:hover{background:var(--card2);color:var(--text)}
.ms-item.on{background:var(--adim);color:var(--amber);border:1px solid rgba(245,158,11,.18)}
.ms-topbar{height:52px;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 22px;gap:12px;flex-shrink:0;background:var(--card)}
.ph-badge{padding:2px 9px;border-radius:4px;font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase}
`;

// ── VIEW ROUTER ───────────────────────────────────────────────────────────────
const ViewRouter = ({ tab, setAuthView, authView }) => {
  // Phase 1 views are handled by AdminLayout internally
  // We just need to handle phase 2-10 routing here
  const viewMap = {
    // Phase 2
    'p2-courses':    <CourseList />,
    // Phase 3
    'p3-grader':     <GradebookView />,
    'p3-history':    <HistoryView />,
    'p3-overview':   <OverviewView />,
    'p3-userreport': <UserReportView />,
    'p3-categories': <CategoriesView />,
    'p3-scales':     <ScalesView />,
    'p3-general':    <GeneralSettingsView />,
    // Phase 4
    'p4-revenue':       <RevenueDashboard />,
    'p4-coupons':       <CouponsView />,
    'p4-payouts':       <PayoutsView />,
    'p4-gateways':      <GatewayView />,
    'p4-messaging':     <MessagingView />,
    'p4-notifications': <NotificationCenter />,
    // Phase 5
    'p5-security':   <SecurityOverview />,
    'p5-appearance': <AppearanceView />,
    'p5-audit':      <AuditLogsView />,
    // Phase 6
    'p6-dashboard':  <DRMDashboard />,
    'p6-groups':     <UserGroupsView />,
    'p6-profiles':   <LicenseProfilesView />,
    // Phase 7
    'p7-rights':  <RightsView />,
    'p7-storage': <CloudStorageView />,
    // Phase 8
    'p8-protect': <ProtectFilesView />,
    'p8-tokens':  <TokenDeliveryView />,
    'p8-wm':      <WatermarkStudio />,
    // Phase 9
    'p9-reports':    <ReportsView />,
    'p9-violations': <ViolationsView />,
    'p9-perf':       <PerformanceView />,
    // Phase 10
    'p10-tenants': <MultiTenancyView />,
    'p10-scorm':   <ScormH5PView />,
    'p10-sso':     <SSOView />,
    // Phase 11
    'p11-courses':   <MyCoursesView />,
    'p11-payments':  <StudentPaymentsView />,
    'p11-messages':  <StudentMessagesView />,
    'p11-academic':  <AcademicsView />,
    'p11-helpdesk':  <HelpdeskView />,
    // Phase 12
    'p12-classes':   <MyClassesView />,
    'p12-grading':   <GradingSubmissionsView />,
    'p12-content':   <ContentCreatorView />,
    // Phase 13
    'p13-accounts':  <AccountOfficersView />,
    'p13-exams':     <ExamDepartmentView />,
    'p13-coordinators': <CoordinatorsView />,
    // Phase 14
    'p14-dashboard': <TenantDashboardView />,
  };
  return viewMap[tab] || null;
};

// ── MASTER SIDEBAR ────────────────────────────────────────────────────────────
const MasterSidebar = ({ tab, setTab, navData, user, logout }) => {
  const [openPhases, setOpenPhases] = useState({});
  
  // Open first available phase by default
  useEffect(() => {
    if (navData.length > 0 && Object.keys(openPhases).length === 0) {
      setOpenPhases({ [navData[0].phase]: true });
    }
  }, [navData]);

  const toggle = (phase) => setOpenPhases(p => ({ ...p, [phase]: !p[phase] }));
  const currentPhase = parseInt(tab?.split('-')[0]?.replace('p', '') || 1);

  const getInitials = (name) => {
    if (!name) return 'U';
    const pts = name.split(' ');
    if (pts.length > 1) return (pts[0][0] + pts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="ms-sidebar">
      <div className="ms-logo">
        <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 800 }}>
          Acad<span style={{ color: 'var(--amber)' }}>LMS</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, letterSpacing: '.04em' }}>
          Full Platform · All 10 Phases
        </div>
        <div style={{ marginTop: 8, padding: '4px 9px', background: 'linear-gradient(135deg,rgba(99,102,241,.12),rgba(245,158,11,.08))', border: '1px solid rgba(99,102,241,.25)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <I n="star" s={11} /><span style={{ fontSize: 10.5, color: 'var(--indigo)', fontWeight: 700 }}>All Phases Complete</span>
        </div>
      </div>

      <div className="ms-nav">
        {navData.map(section => {
          const isOpen = openPhases[section.phase];
          const isActive = currentPhase === section.phase;
          return (
            <div className="ms-section" key={section.phase}>
              <div
                className={`ms-section-hd ${isOpen ? 'open' : ''}`}
                onClick={() => toggle(section.phase)}
              >
                <span style={{ fontSize: 14 }}>{section.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: isActive ? section.color : 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {section.label}
                  </div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 3, background: section.color + '18', color: section.color }}>
                  Ph{section.phase}
                </span>
                <span style={{ color: 'var(--text3)', flexShrink: 0 }}>
                  <I n={isOpen ? 'chevD' : 'chevR'} s={12} />
                </span>
              </div>

              {isOpen && (
                <div style={{ animation: 'fadeIn .15s ease' }}>
                  {section.items.map(item => (
                    <div
                      key={item.id}
                      className={`ms-item ${tab === item.id ? 'on' : ''}`}
                      onClick={() => setTab(item.id)}
                    >
                      <span style={{ width: 14, textAlign: 'center', flexShrink: 0, color: tab === item.id ? 'var(--amber)' : 'var(--text3)' }}>
                        <I n={item.icon} s={12} />
                      </span>
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User chip */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Av i={getInitials(user?.name)} c="#6366F1" sz={30} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Guest'}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{user?.roles?.[0] || 'User'}</div>
        </div>
        <button
          onClick={logout}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 4 }}
          title="Sign out"
        >
          <I n="logout" s={14} />
        </button>
      </div>
    </div>
  );
};

// ── TOPBAR ────────────────────────────────────────────────────────────────────
const Topbar = ({ tab }) => {
  const allItems = NAV.flatMap(s => s.items.map(i => ({ ...i, phase: s.phase, phaseLabel: s.label, color: s.color })));
  const current = allItems.find(i => i.id === tab);
  if (!current) return null;

  return (
    <div className="ms-topbar">
      <span style={{ color: current.color }}><I n={current.icon} s={16} /></span>
      <div style={{ fontWeight: 700, fontSize: 14 }}>{current.label}</div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          className="ph-badge"
          style={{ background: current.color + '18', color: current.color, border: `1px solid ${current.color}28` }}
        >
          Phase {current.phase}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>{current.phaseLabel}</span>
        <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
          v{current.phase}.0.0
        </span>
      </div>
    </div>
  );
};

// ── PHASE 1 WRAPPER ───────────────────────────────────────────────────────────
// Phase 1 has its own full-page layout (login + admin). We embed it as an iframe-like
// full-bleed view when on phase 1 tabs.
const Phase1Wrapper = ({ tab, onNavigateAway }) => {
  const { user } = useAuth();
  const [authState, setAuthState] = useState(user ? 'admin' : 'login'); // login | register | 2fa | admin
  const [p1Tab, setP1Tab] = useState('users');

  useEffect(() => {
    if (user && authState !== 'admin') {
      setAuthState('admin');
    } else if (!user && authState === 'admin') {
      setAuthState('login');
    }
  }, [user]);

  // Sync internal tab with master tab
  const tabMap = { 'p1-users': 'users', 'p1-roles': 'roles', 'p1-sessions': 'sessions', 'p1-profile': 'profile' };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {authState !== 'login' && authState !== 'register' && authState !== '2fa' ? (
        // Admin view - show topbar + phase 1 admin layout content
        <>
          <Topbar tab={tab} />
          <div style={{ flex: 1, overflowY: 'auto' }} className="ai" key={tab}>
            <AdminLayout
              forcedTab={tabMap[tab] || 'users'}
              onLogout={() => setAuthState('login')}
              inEmbedMode={true}
            />
          </div>
        </>
      ) : (
        // Auth screens - full bleed
        <div style={{ flex: 1, overflow: 'auto' }}>
          {authState === 'login' && (
            <LoginView
              onLogin={() => setAuthState('admin')}
              onSwitch={() => setAuthState('register')}
              on2FA={() => setAuthState('2fa')}
            />
          )}
          {authState === 'register' && (
            <RegisterView
              onSwitch={() => setAuthState('login')}
              onLogin={() => setAuthState('admin')}
            />
          )}
          {authState === '2fa' && (
            <TwoFAView onVerify={() => setAuthState('admin')} />
          )}
        </div>
      )}
    </div>
  );
};

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState('p1-users');

  // Filter NAV based on user roles
  const getVisibleNav = () => {
    if (!user) return [];
    if (user.roles.includes('Super Admin')) return NAV;
    if (user.roles.includes('Admin')) return NAV.filter(n => [14, 1,2,3,4,6,8,9].includes(n.phase));
    if (user.roles.includes('Instructor')) return NAV.filter(n => [12, 2, 3].includes(n.phase));
    if (user.roles.includes('Staff')) return NAV.filter(n => [13].includes(n.phase));
    if (user.roles.includes('Student')) return NAV.filter(n => [11].includes(n.phase));
    return NAV;
  };

  const navData = getVisibleNav();

  // Reset tab if current tab is not in available phases after login
  useEffect(() => {
    if (user && navData.length > 0) {
      const currentPhase = parseInt(tab?.split('-')[0]?.replace('p', '') || 1);
      const isAllowed = navData.some(n => n.phase === currentPhase);
      if (!isAllowed) {
        setTab(navData[0].items[0].id);
      }
    }
  }, [user]);

  if (loading) {
    return <div style={{ height: '100vh', background: '#080A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading workspace...</div>;
  }

  // Completely hide dashboard shell for unauthenticated users
  if (!user) {
    return (
      <>
        <style>{FONTS + CSS + MASTER_CSS}</style>
        <Phase1Styles />
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#080A0F' }}>
          <Phase1Wrapper tab="p1-users" />
        </div>
      </>
    );
  }

  const currentPhase = parseInt(tab?.split('-')[0]?.replace('p', '') || 1);
  const isPhase1 = currentPhase === 1;
  const isPhase2 = currentPhase === 2;

  return (
    <>
      <style>{FONTS + CSS + MASTER_CSS}</style>
      <Phase1Styles />
      <Phase2Styles />

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

        {/* Master sidebar — always visible when authenticated */}
        <MasterSidebar tab={tab} setTab={setTab} navData={navData} user={user} logout={logout} />

        {/* Main content area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {isPhase1 ? (
            /* Phase 1: full bleed auth/admin */
            <Phase1Wrapper tab={tab} />
          ) : (
            /* Phases 2-10: standard layout */
            <>
              <Topbar tab={tab} />
              <div style={{ flex: 1, overflowY: 'auto' }} className="ai" key={tab}>
                <ViewRouter tab={tab} />
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
