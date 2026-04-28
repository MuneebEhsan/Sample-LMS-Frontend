import React, { useState, useEffect } from 'react';
import { I, Av } from '../shared.jsx';

// ── Shared State Helper ──────────────────────────────────────────────────────
const INIT_DATA = {
  courses: [
    { id: 1, title: 'Web Dev Basics', students: 42, color: '#14B8A6', sections: [], attendance: {}, grades: {} },
    { id: 2, title: 'Advanced React Patterns', students: 18, color: '#6366F1', sections: [], attendance: {}, grades: {} },
  ],
  quizzes: [
    { id: 201, title: 'Final Quiz - JS Fundamentals', time: '45 mins', marks: 100 },
  ],
  assignments: [
    { id: 301, title: 'Portfolio Project', due: 'Oct 20, 2024', points: 50 },
  ],
  pendingSubmissions: [
    { id: 1, studentId: 'S1024', student: 'Jonas Weber', course: 'Web Dev Basics', work: 'Final Portfolio Project', time: '2 hours ago', status: 'pending' },
    { id: 2, studentId: 'S1055', student: 'Elena Rodriguez', course: 'Advanced React Patterns', work: 'Custom Hook Refactor', time: 'Yesterday', status: 'pending' },
  ]
};


const useAcademicData = () => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('acadlms_academic_db');
    return saved ? JSON.parse(saved) : INIT_DATA;
  });

  const addItem = (type, item) => {
    const key = type === 'course' ? 'courses' : (type === 'quiz' ? 'quizzes' : 'assignments');
    const newItem = { ...item, id: Date.now(), students: 0, sections: [] };
    const newData = { ...data, [key]: [...data[key], newItem] };
    setData(newData);
    localStorage.setItem('acadlms_academic_db', JSON.stringify(newData));
  };


  return { data, addItem };
};



// ── Roster & Management Components ───────────────────────────────────────────
const RosterModal = ({ course, onClose, onUpdate }) => {
  const [isMarking, setIsMarking] = useState(false);
  const [attendance, setAttendance] = useState(course.attendance || {});

  const students = [
    { id: 'S1024', name: 'Jonas Weber' },
    { id: 'S1055', name: 'Elena Rodriguez' },
    { id: 'S1102', name: 'Mark Simmons' },
    { id: 'S1129', name: 'Sarah Jenkins' },
  ];

  const toggleAtt = (id) => {
    if (!isMarking) return;
    const current = attendance[id] || 'P'; // Default Present
    const nextMap = { 'P': 'A', 'A': 'L', 'L': 'P' };
    const next = nextMap[current];
    setAttendance({ ...attendance, [id]: next });
  };

  const save = () => {
    onUpdate({ ...course, attendance });
    onClose();
  };

  const attLabel = (status) => ({
    'P': <span className="badge BG" style={{ minWidth: 60 }}>Present</span>,
    'A': <span className="badge BR" style={{ minWidth: 60 }}>Absent</span>,
    'L': <span className="badge BY" style={{ minWidth: 60 }}>Late</span>,
  }[status || 'P']);

  return (
    <div className="ov">
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="mhd">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <I n="users" s={18} style={{ color: 'var(--teal)' }} />
            <span style={{ fontWeight: 700 }}>Class Roster: {course.title}</span>
          </div>
          <button className="btn bg bico" onClick={onClose}><I n="x" s={14} /></button>
        </div>
        <div className="mbd no-p">
          <div style={{ padding: 16, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ fontSize: 13, fontWeight: 700 }}>{isMarking ? 'Marking Attendance (Click Student to Toggle)' : 'View Enrollment'}</div>
             <button className={`btn ${isMarking ? 'ba' : 'bg'} bsm`} onClick={() => setIsMarking(!isMarking)}>
               <I n={isMarking ? 'check' : 'edit'} s={12}/> {isMarking ? 'Finish Marking' : 'Start Marking'}
             </button>
          </div>
          <div className="tbl">
            <table>
              <thead><tr><th>ID</th><th>Student Name</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} onClick={() => toggleAtt(s.id)} style={{ cursor: isMarking ? 'pointer' : 'default', background: isMarking ? 'rgba(20,184,166,0.02)' : 'none' }}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{s.id}</td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{attLabel(attendance[s.id])}</td>
                    <td><button className="btn bg bsm" onClick={(e) => e.stopPropagation()}>Report</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mft">
          <button className="btn bg" onClick={onClose}>Cancel</button>
          {isMarking && <button className="btn ba" onClick={save}>Save Registry</button>}
        </div>
      </div>
    </div>
  );
};


// ── Curriculum Builder Components ───────────────────────────────────────────
const ActivitySelectorModal = ({ onSelect, onClose }) => {
  const types = [
    { id: 'lesson', lbl: 'Video Lesson', icon: 'video', color: 'var(--indigo)' },
    { id: 'quiz', lbl: 'Quiz/Exam', icon: 'quiz', color: 'var(--amber)' },
    { id: 'assign', lbl: 'Assignment', icon: 'assign', color: 'var(--teal)' },
    { id: 'doc', lbl: 'Document', icon: 'book', color: 'var(--red)' }
  ];

  return (
    <div className="ov" style={{ zIndex: 1000 }}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="mhd">
          <span style={{ fontWeight: 700 }}>Select Activity Type</span>
          <button className="btn bg bico" onClick={onClose}><I n="x" s={14} /></button>
        </div>
        <div className="mbd" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {types.map(t => (
            <div key={t.id} onClick={() => onSelect(t)} className="card au" style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'center',
              border: '1px solid var(--border)' 
            }}>
              <div style={{ color: t.color }}><I n={t.icon} s={24}/></div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{t.lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ClassManagementDashboard = ({ course, onBack, onUpdate }) => {
  const [tab, setTab] = useState('Curriculum');
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(course.title);
  const [color, setColor] = useState(course.color || '#6366F1');
  const [sections, setSections] = useState(course.sections || []);
  const [selSecForAct, setSelSecForAct] = useState(null);

  const save = () => {
    onUpdate({ ...course, title, color, sections });
    onBack();
  };

  const addSection = () => {
    const name = prompt("Enter Section Title", "New Section");
    if (name) setSections([...sections, { id: Date.now(), title: name, activities: [] }]);
  };

  const addActivity = (sId, type) => {
    const name = prompt(`Enter ${type.lbl} Title`, `New ${type.lbl}`);
    if (name) {
      setSections(sections.map(s => s.id === sId ? {
        ...s, activities: [...s.activities, { id: Date.now(), title: name, type: type.id, icon: type.icon }]
      } : s));
    }
    setSelSecForAct(null);
  };

  return (
    <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }} className="ai">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
        <button className="btn bg bico" onClick={onBack}><I n="back" s={16}/></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)' }}>CLASS MANAGEMENT</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{course.title}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn ${isEditing ? 'ba' : 'bg'}`} onClick={() => setIsEditing(!isEditing)}>
            <I n="edit" s={14}/> {isEditing ? 'Turn Editing OFF' : 'Turn Editing ON'}
          </button>
          <button className="btn bd" onClick={save}><I n="check" s={14}/> Save Changes</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
        {['Curriculum', 'Settings', 'Analytics'].map(t => (
          <div key={t} onClick={() => setTab(t)} style={{ 
            paddingBottom: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, 
            color: tab === t ? 'var(--amber)' : 'var(--text3)', borderBottom: tab === t ? '2px solid var(--amber)' : '2px solid transparent' 
          }}>
            {t}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        {tab === 'Curriculum' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sections.length === 0 && !isEditing && (
              <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>
                No curriculum content added yet.
              </div>
            )}
            
            {sections.map((s, idx) => (
              <div key={s.id} className="card au" style={{ padding: 0, overflow: 'hidden', animationDelay: `${idx * 0.05}s` }}>
                <div style={{ padding: '12px 16px', background: 'var(--bg2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    <span style={{ color: 'var(--text3)', marginRight: 8, fontFamily: 'var(--mono)' }}>{idx + 1}</span>
                    {s.title}
                  </div>
                  {isEditing && (
                    <button className="btn bg bsm" onClick={() => setSelSecForAct(s.id)}><I n="plus" s={12}/> Add Activity</button>
                  )}
                </div>
                <div style={{ padding: '8px 0' }}>
                  {s.activities.length === 0 && <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text3)' }}>No activities in this section.</div>}
                  {s.activities.map(a => (
                    <div key={a.id} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)' }}>
                      <I n={a.icon || 'video'} s={14} style={{ opacity: 0.5 }} />
                      <div style={{ fontSize: 13, flex: 1 }}>{a.title}</div>
                      {isEditing && <button className="btn bg bico bxs"><I n="trash" s={12}/></button>}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {isEditing && (
              <button className="btn bg" style={{ borderStyle: 'dashed', justifyContent: 'center', padding: 16 }} onClick={addSection}>
                <I n="plus" s={14}/> Add New Section
              </button>
            )}
          </div>
        )}

        {tab === 'Settings' && (
          <div className="card" style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="fl">
              <label className="lbl">Class Title</label>
              <input className="inp" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="fl">
              <label className="lbl">Brand Color</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ border: 'none', background: 'none' }} />
            </div>
          </div>
        )}

        {tab === 'Analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
             {[
               { lbl: 'Avg Attendance', val: '92%', color: 'var(--teal)' },
               { lbl: 'Avg Class Score', val: '84.5', color: 'var(--indigo)' },
               { lbl: 'Completion Rate', val: '78%', color: 'var(--amber)' },
             ].map(s => (
               <div key={s.lbl} className="card au" style={{ padding: 20 }}>
                 <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>{s.lbl}</div>
                 <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.val}</div>
                 <div className="prog" style={{ marginTop: 12, height: 4 }}><div className="prog-bar" style={{ width: s.val, background: s.color }}/></div>
               </div>
             ))}
          </div>
        )}
      </div>


      {selSecForAct && (
        <ActivitySelectorModal 
          onClose={() => setSelSecForAct(null)} 
          onSelect={(type) => addActivity(selSecForAct, type)} 
        />
      )}
    </div>
  );
};


export const MyClassesView = () => {
  const { data, addItem } = useAcademicData(); // Still need data
  const [editingClass, setEditingClass] = useState(null);
  const [selectedRoster, setSelectedRoster] = useState(null);

  const updateCourse = (updated) => {
    // For this prototype session, just log it, but usually we would update localStorage
    const saved = JSON.parse(localStorage.getItem('acadlms_academic_db'));
    saved.courses = saved.courses.map(c => c.id === updated.id ? updated : c);
    localStorage.setItem('acadlms_academic_db', JSON.stringify(saved));
  };

  if (editingClass) {
    return <ClassManagementDashboard course={editingClass} onBack={() => setEditingClass(null)} onUpdate={updateCourse} />;
  }

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }} className="ai">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>My Assigned Classes</div>
        <div style={{ fontSize: 13, color: 'var(--text3)' }}>Total Classes: {data.courses.length}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {data.courses.map(c => (
          <div key={c.id} className="card au" style={{ display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer' }} onClick={() => setEditingClass(c)}>
            <div style={{ height: 60, background: c.color || '#6366F1', borderRadius: '6px 6px 0 0', margin: '-14px -16px 0' }} />
            <div style={{ fontWeight: 700, fontSize: 15 }}>{c.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{c.students || 0} Students Enrolled</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
               <button className="btn bg bsm" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); setSelectedRoster(c); }}><I n="users" s={14}/> Roster</button>
               <button className="btn bd bsm" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); setEditingClass(c); }}><I n="edit" s={14}/> Edit Course</button>
            </div>
          </div>
        ))}
      </div>

      {selectedRoster && <RosterModal course={selectedRoster} onClose={() => setSelectedRoster(null)} onUpdate={updateCourse} />}
    </div>
  );
};

const GradingPanel = ({ submission, onClose, onSave }) => {
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  return (
    <div className="ov">
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="mhd">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <I n="check" s={18} style={{ color: 'var(--indigo)' }} />
            <span style={{ fontWeight: 700 }}>Grade Submission</span>
          </div>
          <button className="btn bg bico" onClick={onClose}><I n="x" s={14} /></button>
        </div>
        <div className="mbd">
          <div style={{ background: 'var(--bg2)', padding: 16, borderRadius: 12, marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>STUDENT</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{submission.student}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>ASSIGNMENT</div>
            <div style={{ fontSize: 14 }}>{submission.work}</div>
          </div>

          <div className="fl">
            <label className="lbl">Score (0-100)</label>
            <input className="inp" type="number" placeholder="Enter numeric score..." value={score} onChange={e => setScore(e.target.value)} />
          </div>

          <div className="fl">
            <label className="lbl">Feedback to Student</label>
            <textarea className="inp" style={{ minHeight: 100 }} placeholder="Write your comments here..." value={feedback} onChange={e => setFeedback(e.target.value)} />
          </div>
        </div>
        <div className="mft">
          <button className="btn bg" onClick={onClose}>Cancel</button>
          <button className="btn ba" onClick={() => onSave(submission.id, { score, feedback })} disabled={!score}>
            Submit Grade
          </button>
        </div>
      </div>
    </div>
  );
};

export const GradingSubmissionsView = () => {
  const { data } = useAcademicData();
  const [subs, setSubs] = useState(data.pendingSubmissions || INIT_DATA.pendingSubmissions);
  const [activeGrade, setActiveGrade] = useState(null);

  const performGrade = (id, grade) => {
    setSubs(subs.filter(s => s.id !== id));
    setActiveGrade(null);
    // Usually log to DB here
  };

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }} className="ai">
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Pending Submissions to Grade ({subs.length})</div>
        <div className="tbl">
          {subs.length === 0 ? (
             <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>No pending submissions! Excellent work.</div>
          ) : (
            <table>
              <thead><tr><th>Student</th><th>Course</th><th>Assignment</th><th>Submitted</th><th>Action</th></tr></thead>
              <tbody>
                {subs.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.student}</strong></td>
                    <td>{s.course}</td>
                    <td>{s.work}</td>
                    <td style={{ color: 'var(--text3)' }}>{s.time}</td>
                    <td><button className="btn ba bsm" onClick={() => setActiveGrade(s)}>Grade Now</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {activeGrade && <GradingPanel submission={activeGrade} onClose={() => setActiveGrade(null)} onSave={performGrade} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--amber)' }}>Recent Quizzes Created</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.quizzes.map(q => (
              <div key={q.id} style={{ padding: '10px 12px', background: 'var(--bg2)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{q.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{q.time || '30 mins'}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--teal)' }}>Recent Assignments Created</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.assignments.map(a => (
              <div key={a.id} style={{ padding: '10px 12px', background: 'var(--bg2)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Due: {a.due || 'Oct 30'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Creation Wizard Modal ─────────────────────────────────────────────────────
const CreationWizardModal = ({ type, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: '', cat: '', val: '', color: '#6366F1' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const colors = ['#6366F1', '#14B8A6', '#F59E0B', '#EF4444', '#10B981', '#F97316'];

  const config = {
    course:     { lbl: 'New Course', icon: 'book', color: 'var(--indigo)', field: 'Subject/Category' },
    quiz:       { lbl: 'New Quiz/Exam', icon: 'quiz', color: 'var(--amber)', field: 'Time Limit (mins)' },
    assignment: { lbl: 'New Assignment', icon: 'assign', color: 'var(--teal)', field: 'Points' }
  }[type];

  const handleCreate = () => {
    if (!form.title) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setDone(true);
      onSave({ title: form.title, color: form.color });
      setTimeout(onClose, 1200);
    }, 2000);
  };

  return (
    <div className="ov">
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="mhd">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: config.color }}><I n={config.icon} s={18} /></span>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{config.lbl}</span>
          </div>
          <button className="btn bg bico" onClick={onClose}><I n="x" s={14} /></button>
        </div>

        <div className="mbd">
          {done ? (
            <div style={{ textAlign: 'center', padding: '40px 0', animation: 'fadeIn .4s ease' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,.1)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <I n="check" s={32} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Creation Successful!</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Content has been generated and added.</div>
            </div>
          ) : (
            <>
              <div className="fl">
                <label className="lbl">Title</label>
                <input className="inp" placeholder={`Enter ${type} title...`} value={form.title} onChange={e => setForm({...form, title: e.target.value})} autoFocus/>
              </div>

              <div className="fl">
                <label className="lbl">{config.field}</label>
                <input className="inp" placeholder="e.g. Design, 45, 100" value={form.cat} onChange={e => setForm({...form, cat: e.target.value})} />
              </div>

              {type === 'course' && (
                <div className="fl">
                  <label className="lbl">Brand Color</label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    {colors.map(c => (
                      <div 
                        key={c} 
                        onClick={() => setForm({...form, color: c})}
                        style={{ 
                          width: 24, height: 24, borderRadius: 6, background: c, cursor: 'pointer',
                          border: form.color === c ? '2px solid var(--text)' : '2px solid transparent',
                          transform: form.color === c ? 'scale(1.1)' : 'scale(1)', transition: 'all .1s'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!done && (
          <div className="mft">
            <button className="btn bg" onClick={onClose}>Cancel</button>
            <button className="btn ba" onClick={handleCreate} disabled={busy || !form.title}>
              {busy ? <div className="spin" style={{ marginRight: 6 }}><I n="refresh" s={14}/></div> : <I n="plus" s={14}/>}
              {busy ? 'Generating...' : `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const ContentCreatorView = () => {
  const [activeWizard, setActiveWizard] = useState(null);
  const { addItem } = useAcademicData();


  const cardStyle = { 
    display: 'flex', alignItems: 'center', justifyContent: 'center', 
    flexDirection: 'column', padding: '40px 20px', cursor: 'pointer', 
    border: '2px dashed var(--border)', borderRadius: '16px',
    transition: 'all .25s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'var(--card2)',
    flex: 1
  };

  const hoverEffect = (e, color, isHover) => {
    e.currentTarget.style.borderColor = isHover ? color : 'var(--border)';
    e.currentTarget.style.background = isHover ? `${color}08` : 'var(--card2)';
    e.currentTarget.style.transform = isHover ? 'translateY(-6px)' : 'translateY(0)';
    e.currentTarget.style.boxShadow = isHover ? `0 12px 24px -8px ${color}33` : 'none';
    const icon = e.currentTarget.querySelector('svg');
    if (icon) icon.style.transform = isHover ? 'scale(1.2)' : 'scale(1)';
  };

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Content Creation Studio</div>
      
      <div style={{ display: 'flex', gap: 20 }}>
        <div 
          className="card au" 
          style={cardStyle}
          onMouseEnter={e => hoverEffect(e, 'var(--indigo)', true)}
          onMouseLeave={e => hoverEffect(e, 'var(--indigo)', false)}
          onClick={() => setActiveWizard('course')}
        >
          <div style={{ transition: 'transform .25s' }}><I n="plus" s={32} style={{ color: 'var(--indigo)' }}/></div>
          <div style={{ fontWeight: 700, marginTop: 16, fontSize: 15 }}>Create New Course</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Build lessons, upload videos & docs</div>
        </div>


        <div 
          className="card au" 
          style={{ ...cardStyle, animationDelay: '.1s' }}
          onMouseEnter={e => hoverEffect(e, 'var(--amber)', true)}
          onMouseLeave={e => hoverEffect(e, 'var(--amber)', false)}
          onClick={() => setActiveWizard('quiz')}
        >
          <div style={{ transition: 'transform .25s' }}><I n="plus" s={32} style={{ color: 'var(--amber)' }}/></div>
          <div style={{ fontWeight: 700, marginTop: 16, fontSize: 15 }}>Create Quiz/Exam</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Question banks & auto-grading</div>
        </div>

        <div 
          className="card au" 
          style={{ ...cardStyle, animationDelay: '.2s' }}
          onMouseEnter={e => hoverEffect(e, 'var(--teal)', true)}
          onMouseLeave={e => hoverEffect(e, 'var(--teal)', false)}
          onClick={() => setActiveWizard('assignment')}
        >
          <div style={{ transition: 'transform .25s' }}><I n="plus" s={32} style={{ color: 'var(--teal)' }}/></div>
          <div style={{ fontWeight: 700, marginTop: 16, fontSize: 15 }}>Create Assignment</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Submission portals & feedback</div>
        </div>
      </div>

      {activeWizard && (
        <CreationWizardModal 
          type={activeWizard} 
          onClose={() => setActiveWizard(null)}
          onSave={(data) => addItem(activeWizard, data)}
        />
      )}
    </div>
  );
};
