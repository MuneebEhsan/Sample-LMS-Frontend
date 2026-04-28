import React from 'react';
import { I } from '../shared.jsx';

export const AccountOfficersView = () => {
  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <div className="scard">
          <div className="sg" style={{ background: 'var(--green)' }}/>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>COLLECTED TODAY</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>$4,250</div>
        </div>
        <div className="scard">
          <div className="sg" style={{ background: 'var(--red)' }}/>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>OUTSTANDING DUES</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--red)' }}>$12,800</div>
        </div>
        <div className="scard">
          <div className="sg" style={{ background: 'var(--amber)' }}/>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>PENDING HELPDESK TICKETS</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--amber)' }}>8</div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Recent Payments</div>
        <div className="tbl">
          <table>
            <thead><tr><th>Student</th><th>Invoice</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td>Jonas Weber</td><td>INV-001</td><td>$500.00</td><td>Credit Card</td><td><span className="badge BG">PAID</span></td></tr>
              <tr><td>Sophia C.</td><td>INV-002</td><td>$150.00</td><td>Bank Transfer</td><td><span className="badge BA">PROCESSING</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const ExamDepartmentView = () => {
  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Active & Upcoming Exams</div>
        <div className="tbl">
          <table>
            <thead><tr><th>Course</th><th>Exam Name</th><th>Scheduled Date</th><th>Students</th><th>Status</th></tr></thead>
            <tbody>
              <tr>
                <td>Web Dev Basics</td>
                <td>Final Term Exam</td>
                <td>Sep 10, 2024</td>
                <td>42</td>
                <td><span className="badge BA">UPCOMING</span></td>
              </tr>
              <tr>
                <td>Advanced React</td>
                <td>Midterm Assessment</td>
                <td>Sep 1, 2024</td>
                <td>18</td>
                <td><span className="badge BG">COMPLETED (Pending Grades)</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const CoordinatorsView = () => {
  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text3)', padding: 40 }}>
        <I n="calendar" s={32} />
        <div style={{ marginTop: 12, fontWeight: 600 }}>Master Schedule</div>
        <div style={{ fontSize: 13 }}>You are viewing the consolidated timetable across all active sections.</div>
      </div>
    </div>
  );
};
