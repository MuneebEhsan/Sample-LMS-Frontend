import React, { useState } from 'react';
import { I, Av } from '../shared.jsx';

// ── MOCK DATA ────────────────────────────────────────────────────────────────
// ── Centralized Data Hook ─────────────────────────────────────────────────────
const useStudentData = () => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('acadlms_academic_db');
    if (saved) return JSON.parse(saved);
    const initial = { courses: [], enrolled: [], attendance: {}, grades: {}, assignments: [], quizzes: [] };
    localStorage.setItem('acadlms_academic_db', JSON.stringify(initial));
    return initial;
  });

  const enroll = (course) => {
    const freshCourse = data.courses.find(c => c.id === course.id) || course;
    const updated = { 
      ...data, 
      enrolled: [...(data.enrolled || []), { ...freshCourse, progress: 0, enrollmentDate: new Date() }],
      courses: data.courses.map(c => c.id === course.id ? { ...c, students: (c.students || 0) + 1 } : c)
    };
    setData(updated);
    localStorage.setItem('acadlms_academic_db', JSON.stringify(updated));
  };


  return { data, enroll };
};


const CoursePlayer = ({ course, onBack }) => {
  // Flatten sections into a single list of activities for the player
  const activities = (course.sections || []).flatMap(s => s.activities.map(a => ({ ...a, sectionTitle: s.title })));
  const [activeLesson, setActiveLesson] = useState(activities[0] || { title: 'No Content Available' });
  
  const actIcon = (type) => ({ video: 'play', quiz: 'quiz', assign: 'assign', doc: 'file' }[type] || 'play');

  
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 56, background: 'var(--card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16 }}>
        <button className="btn bd bsm" onClick={onBack}><I n="back" s={14}/> Back</button>
        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
        <div style={{ fontWeight: 700, fontSize: 14 }}>{course.title}</div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>YOUR PROGRESS</div>
          <div style={{ width: 160, height: 8, background: 'var(--bg2)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${course.progress}%`, height: '100%', background: 'var(--amber)' }} />
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)' }}>{course.progress}%</div>
        </div>
      </div>
      
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 900, aspectRatio: '16/9', background: 'var(--card2)', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
              <I n="play" s={64} style={{ opacity: 0.3 }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', display: 'flex', gap: 12, alignItems: 'center' }}>
                 <I n="play" s={16}/><div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }}><div style={{ width: '40%', height: '100%', background: 'var(--amber)' }}/></div><I n="vol" s={16}/>
              </div>
            </div>
          </div>
          <div style={{ height: 120, background: 'var(--card)', borderTop: '1px solid var(--border)', padding: '20px 40px' }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{activeLesson.title}</div>
            <div style={{ fontSize: 14, color: 'var(--text2)' }}>In this lesson, we will cover the foundational principles of {course.title.split(' & ')[0]}.</div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div style={{ width: 340, background: 'var(--card)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 20, borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 15 }}>Course Curriculum</div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {activities.length === 0 && <div style={{ padding: 20, color: 'var(--text3)', textAlign: 'center', fontSize: 13 }}>Instructor has not added any lessons yet.</div>}
            {activities.map(l => (
              <div key={l.id} 
                   onClick={() => setActiveLesson(l)}
                   style={{ 
                    padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                    background: activeLesson.id === l.id ? 'var(--adim)' : 'transparent',
                    border: activeLesson.id === l.id ? '1px solid var(--aglow)' : '1px solid transparent',
                    display: 'flex', alignItems: 'center', gap: 12
                   }}>
                <div style={{ color: l.done ? 'var(--green)' : 'var(--text3)' }}>
                  <I n={l.done ? 'check' : actIcon(l.type)} s={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: activeLesson.id === l.id ? 'var(--amber)' : 'var(--text)' }}>{l.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 2 }}>{l.sectionTitle}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{l.type.toUpperCase()} • {l.dur || '10:00'}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

const CATALOG_COURSES = [
  { id: 10, title: 'Mastering SQL & Databases', instructor: 'Dr. Emily Stone', thumb: '#10B981', price: 49, level: 'Beginner' },
  { id: 11, title: 'Python for Data Science', instructor: 'Mark Zhao', thumb: '#3B82F6', price: 0, level: 'Intermediate' },
  { id: 12, title: 'Cybersecurity Fundamentals', instructor: 'Sarah Jenkins', thumb: '#EF4444', price: 99, level: 'Intermediate' },
];

const CatalogView = ({ onBack, onEnroll, enrolledIds }) => {
  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
        <button className="btn bg bsm" onClick={onBack}><I n="back" s={14}/> Back to My Courses</button>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Available Courses</div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {CATALOG_COURSES.map(c => {
          const isEnrolled = enrolledIds.includes(c.id);
          return (
            <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ height: 80, background: c.thumb, borderRadius: '6px 6px 0 0', margin: '-14px -16px 0', opacity: 0.8 }} />
              <div style={{ fontWeight: 700, fontSize: 15 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Instructor: {c.instructor}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: c.price === 0 ? 'var(--green)' : 'var(--text)' }}>
                  {c.price === 0 ? 'FREE' : `$${c.price}`}
                </span>
                <button 
                  className={`btn bsm ${isEnrolled ? 'bg' : 'ba'}`} 
                  onClick={() => !isEnrolled && onEnroll(c)}
                  disabled={isEnrolled}
                >
                  {isEnrolled ? 'Already Enrolled' : 'Enroll Now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MyCoursesView = () => {
  const { data, enroll } = useStudentData();
  const [activeCourse, setActiveCourse] = useState(null);
  const [showCatalog, setShowCatalog] = useState(false);

  // In a real app, catalog would come from Phase 2 DB, here we simulate sync
  const CATALOG_COURSES = data.courses.length > 0 ? data.courses : [
    { id: 10, title: 'Mastering SQL & Databases', instructor: 'Dr. Emily Stone', thumb: '#10B981', price: 49, level: 'Beginner' },
    { id: 11, title: 'Python for Data Science', instructor: 'Mark Zhao', thumb: '#3B82F6', price: 0, level: 'Intermediate' },
  ];

  if (activeCourse) {
    return <CoursePlayer course={activeCourse} onBack={() => setActiveCourse(null)} />;
  }

  if (showCatalog) {
    return (
      <CatalogView 
        onBack={() => setShowCatalog(false)} 
        onEnroll={(c) => { enroll(c); setShowCatalog(false); }}
        enrolledIds={(data.enrolled || []).map(e => e.id)}
        catalog={CATALOG_COURSES}
      />
    );
  }

  const enrolled = data.enrolled || [];


  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }} className="ai">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>My Enrolled Courses</div>
        <button className="btn ba bsm" onClick={() => setShowCatalog(true)}><I n="book" s={14}/> Browse Catalog</button>
      </div>
      
      {enrolled.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>
          <I n="book" s={48} style={{ opacity: 0.2, marginBottom: 16 }} />
          <div>You are not enrolled in any courses yet.</div>
          <button className="btn ba bsm" style={{ marginTop: 16 }} onClick={() => setShowCatalog(true)}>Explore Catalog</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {enrolled.map(c => (
            <div key={c.id} className="card au" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ height: 60, background: c.thumb, borderRadius: '6px 6px 0 0', margin: '-14px -16px 0' }} />
              <div style={{ fontWeight: 700, fontSize: 15 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Instructor: {c.instructor}</div>
              
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, fontWeight: 600 }}>
                  <span>Overall Progress</span>
                  <span style={{ color: 'var(--amber)' }}>{c.progress}%</span>
                </div>
                <div className="prog" style={{ height: 6 }}>
                  <div className="pb" style={{ width: `${c.progress}%`, background: 'var(--amber)' }} />
                </div>
              </div>
              
              <div style={{ padding: '10px 12px', background: 'var(--bg2)', borderRadius: 6, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <I n="play" s={14} /><span style={{ flex: 1 }}>{c.nextUp}</span>
                <button className="btn ba bsm" onClick={() => setActiveCourse(c)}>Continue</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const StudentPaymentsView = () => {
  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 14 }}>
        <div className="scard" style={{ flex: 1 }}><div className="sg" style={{ background: 'var(--green)' }}/>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>PAID TO DATE</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>$500.00</div>
        </div>
        <div className="scard" style={{ flex: 1 }}><div className="sg" style={{ background: 'var(--red)' }}/>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>REMAINING DUES</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--red)' }}>$500.00</div>
        </div>
      </div>
      
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Invoices & Dues</div>
        <div className="tbl">
          <table>
            <thead><tr><th>Invoice</th><th>Description</th><th>Amount</th><th>Date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {PAYMENTS.map(p => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{p.id}</td>
                  <td>{p.desc}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{p.amount}</td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{p.date}</td>
                  <td><span className={`badge ${p.status === 'paid' ? 'BG' : 'BR'}`}>{p.status.toUpperCase()}</span></td>
                  <td>{p.status === 'due' && <button className="btn ba bsm">Pay Now</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const StudentMessagesView = () => {
  return (
    <div style={{ padding: '20px 24px', display: 'flex', height: '100%', flexDirection: 'column' }}>
      <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text3)' }}>
        <I n="mail" s={32} />
        <div style={{ marginTop: 12, fontWeight: 600 }}>No New Messages</div>
        <div style={{ fontSize: 13 }}>Your inbox is currently empty.</div>
      </div>
    </div>
  );
};

export const AcademicsView = () => {
  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}><I n="calendar" s={14}/> My Timetable</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TIMETABLE.map((t, i) => (
              <div key={i} style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--amber)' }}>{t.day}</span>
                  <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{t.time}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.class}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>📍 {t.loc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}><I n="chart" s={14}/> Attendance & Reports</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 14, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, letterSpacing: '.05em' }}>OVERALL ATTENDANCE</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>92%</div>
            </div>
            <button className="btn bd"><I n="dl" s={14}/> Download Term Report Card</button>
            <button className="btn bg"><I n="eye" s={14}/> View Detailed Gradebook</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HelpdeskView = () => {
  const [dept, setDept] = useState("IT Support");
  const [sub, setSub] = useState("");
  const [msg, setMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const issueOptions = {
    "IT Support": ["Video not playing", "Revoke license", "Reset registered devices", "Login issues", "Other"],
    "Account Department": ["Fees/Dues remaining", "Payment failed", "Request refund", "Invoice mismatch"],
    "Exam Department": ["Exam schedule issue", "Cannot access exam", "Grade dispute", "Other"]
  };

  const submitTicket = () => {
    if(!sub || !msg) return;
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setSub(""); setMsg(""); }, 3000);
  };

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 14 }}>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Submit a Helpdesk Ticket</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>Select the relevant department to get help with your issue quickly.</div>
          
          <div className="field">
            <label className="label">Department</label>
            <select className="select" value={dept} onChange={e => {setDept(e.target.value); setSub("");}}>
              <option>IT Support</option>
              <option>Account Department</option>
              <option>Exam Department</option>
            </select>
          </div>

          <div className="field">
            <label className="label">Specific Issue</label>
            <select className="select" value={sub} onChange={e => setSub(e.target.value)}>
              <option value="">Select issue...</option>
              {issueOptions[dept].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div className="field">
            <label className="label">Details / Description</label>
            <textarea className="input textarea" style={{ minHeight: 100 }} value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Please describe your issue in detail..."/>
          </div>

          <button className="btn ba" onClick={submitTicket} disabled={submitted || !sub || !msg}>
            {submitted ? "Ticket Submitted ✓" : "Submit Ticket"}
          </button>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>My Recent Tickets</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TICKETS.map(t => (
              <div key={t.id} style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--teal)', fontWeight: 700 }}>{t.id}</span>
                  <span className={`badge ${t.status==='resolved'?'BG':'BA'}`}>{t.status}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>{t.dept}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t.subject}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Submitted on {t.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
